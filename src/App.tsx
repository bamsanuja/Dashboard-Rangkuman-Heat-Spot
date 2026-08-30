import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, ExternalLink } from 'lucide-react';
import './App.css';

import Navbar, { type TabKey } from './components/Navbar';
import ProvenanceBar from './components/ProvenanceBar';
import SummaryCards from './components/SummaryCards';
import FilterBar from './components/FilterBar';
import GisMap from './components/GisMap';
import HotspotTable from './components/HotspotTable';
import HotspotDetailModal from './components/HotspotDetailModal';
import DataImporterModal from './components/DataImporterModal';
import AnalyticsCharts from './components/AnalyticsCharts';
import ImageryGrid from './components/ImageryGrid';
import FdrsPanel from './components/FdrsPanel';
import Panduan from './components/Panduan';
import DataQualityPanel from './components/DataQualityPanel';
import ClusterPanel from './components/ClusterPanel';
import LandCoverBar from './components/LandCoverBar';
import ReportGeneratorModal from './components/ReportGeneratorModal';

import type { DataProvenance, FdrsGrid, FilterState, FireCluster, Hotspot, ImageryReading, LandIndication } from './types';
import { buildLadder, clusterHotspots, DEFAULT_RADIUS } from './utils/clustering';
import { analyseMany, AUTO_ANALYSIS_THRESHOLD, estimateWork, formatDuration } from './utils/imageryIndication';
import { loadPublishedGrid } from './utils/fdrs';
import { computeSummary, withFdrs, withProximity } from './utils/spatialAnalysis';
import { importAny, SIPONGI_DOWNLOAD_URL, type AnyImport, type ImportResult } from './utils/importers';
import { INSTITUTIONS, TENURE_NOTE } from './utils/legal';

const EMPTY_FILTERS: FilterState = {
  minClusterSize: 1,
  dcBand: 'all',
  confidence: 'all',
  sensor: 'all',
  province: 'all',
  indication: 'all',
  searchQuery: '',
  minFRP: 0,
};

export default function App() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [provenance, setProvenance] = useState<DataProvenance | null>(null);
  const [fdrsGrid, setFdrsGrid] = useState<FdrsGrid | null>(null);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [tab, setTab] = useState<TabKey>('map');
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [importerOpen, setImporterOpen] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS);
  const [clusterView, setClusterView] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  // ETA dihitung di dalam callback kemajuan, bukan saat render. Memanggil
  // Date.now() saat render membuat hasilnya berubah tiap kali komponen
  // digambar ulang, dan React memang melarangnya.
  const [progress, setProgress] = useState<{ done: number; total: number; etaSeconds: number | null } | null>(null);
  const stopRef = useRef(false);

  const applyReading = (id: string, reading: ImageryReading) => {
    setHotspots((prev) => prev.map((h) => (h.id === id ? { ...h, imagery: reading } : h)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, imagery: reading } : prev));
  };

  /**
   * Reads the imagery for every point that has not been read yet. Run
   * automatically after an import so the dashboard has something to summarise
   * without the reader clicking each marker.
   */
  const runImagery = async (points: Hotspot[]) => {
    // Titik berkoordinat kasar dilewati: membaca ubin citra di koordinat yang
    // hanya akurat sekitar satu kilometer akan menghasilkan pembacaan tapak
    // yang salah, bukan pembacaan yang lemah.
    const pending = points.filter((h) => !h.imagery && !h.lowPrecision);
    if (!pending.length) return;
    stopRef.current = false;
    setAnalysing(true);
    const startedAt = Date.now();
    setProgress({ done: 0, total: pending.length, etaSeconds: null });
    await analyseMany(
      pending.map((h) => ({ id: h.id, latitude: h.latitude, longitude: h.longitude })),
      (done, total) => {
        const elapsed = (Date.now() - startedAt) / 1000;
        const etaSeconds =
          done >= 20 && elapsed >= 3 ? Math.round((total - done) / (done / elapsed)) : null;
        setProgress({ done, total, etaSeconds });
      },
      applyReading,
      () => stopRef.current,
    );
    setAnalysing(false);
    setProgress(null);
  };

  const stopImagery = () => {
    stopRef.current = true;
  };

  const handleImported = (result: ImportResult) => {
    // Replaces rather than appends: mixing two sources under one provenance
    // line would make the attribution false.
    const loaded = withFdrs(withProximity(result.hotspots), fdrsGrid);
    setHotspots(loaded);
    setProvenance(result.provenance);
    setFilters(EMPTY_FILTERS);
    setTab('map');
    // Small imports read themselves. Large ones wait to be asked, from the
    // Citra tab, so nobody triggers thousands of tile fetches by accident.
    if (loaded.length <= AUTO_ANALYSIS_THRESHOLD) void runImagery(loaded);
  };

  // Grid yang diterbitkan bersama situs dimuat sendiri saat aplikasi dibuka,
  // sehingga pengguna tidak perlu mengambil atau mengimpor apa pun untuk
  // lapisan ini. Impor manual tetap menimpa hasilnya kalau diperlukan.
  useEffect(() => {
    let batal = false;
    void loadPublishedGrid().then((grid) => {
      if (!batal && grid) {
        setFdrsGrid(grid);
        setHotspots((prev) => withFdrs(prev, grid));
      }
    });
    return () => {
      batal = true;
    };
  }, []);

  const handleFdrs = (grid: FdrsGrid) => {
    setFdrsGrid(grid);
    setHotspots((prev) => withFdrs(prev, grid));
  };

  const handleAnyImport = (payload: AnyImport) => {
    if (payload.kind === 'fdrs') handleFdrs(payload.grid);
    else handleImported(payload.result);
  };

  const handleImagery = applyReading;

  /** A person disagreeing with the machine. Their call wins, and is recorded. */
  const handleOverride = (id: string, indication: LandIndication) => {
    setHotspots((prev) =>
      prev.map((h) => {
        if (h.id !== id || !h.imagery) return h;
        return {
          ...h,
          imagery: {
            ...h.imagery,
            indication,
            reviewedByHuman: true,
            originalIndication: h.imagery.originalIndication ?? h.imagery.indication,
            strength: 1,
          },
        };
      }),
    );
  };

  /** Menyeret berkas ke mana saja di jendela sama artinya dengan mengimpor. */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setDropError(null);
    try {
      handleAnyImport(await importAny(file));
    } catch (err) {
      setDropError(err instanceof Error ? err.message : 'Berkas tidak dapat dibaca.');
    }
  };

  /**
   * Penyaringan berjalan dua tahap, dan urutannya penting.
   *
   * Tahap pertama menerapkan seluruh saringan biasa. Gugus lalu dihitung dari
   * hasil itu, karena ukuran gugus hanya punya arti relatif terhadap data yang
   * sedang dilihat. Tahap kedua membuang titik yang gugusnya lebih kecil dari
   * ambang. Tangga bukti tetap dihitung dari tahap pertama, sehingga anak
   * tangga yang sedang Anda kecualikan tetap terlihat angkanya.
   */
  const preFiltered = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    return hotspots.filter((h) => {
      if (filters.confidence !== 'all' && h.confidence.level !== filters.confidence) return false;
      if (filters.sensor !== 'all' && h.satellite !== filters.sensor) return false;
      if (filters.province !== 'all' && h.province !== filters.province) return false;
      if (filters.indication !== 'all') {
        const current = h.imagery?.indication ?? 'not_analysed';
        if (current !== filters.indication) return false;
      }
      if (filters.dcBand !== 'all' && (h.fdrs?.dcBand ?? 'tidak_ada_data') !== filters.dcBand) return false;
      if (filters.minFRP > 0 && h.frp < filters.minFRP) return false;
      if (q) {
        const hay = `${h.id} ${h.province ?? ''} ${h.district ?? ''} ${h.satellite}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [hotspots, filters]);

  const allClusters = useMemo(() => clusterHotspots(preFiltered, radius), [preFiltered, radius]);
  const ladder = useMemo(() => buildLadder(allClusters, radius), [allClusters, radius]);

  const clusters = useMemo(
    () => allClusters.filter((c) => c.size >= filters.minClusterSize),
    [allClusters, filters.minClusterSize],
  );

  const filtered = useMemo(() => {
    if (filters.minClusterSize <= 1) return preFiltered;
    const keep = new Set<string>();
    for (const c of clusters) for (const id of c.memberIds) keep.add(id);
    return preFiltered.filter((h) => keep.has(h.id));
  }, [preFiltered, clusters, filters.minClusterSize]);

  const summary = useMemo(() => computeSummary(filtered), [filtered]);

  const openCluster = (c: FireCluster) => {
    const member = filtered.find((h) => h.id === c.memberIds[0]);
    if (member) setSelected(member);
  };
  const hasData = hotspots.length > 0;

  return (
    <div
      className="min-h-screen bg-espresso text-cream flex flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes('Files')) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => void handleDrop(e)}
    >
      {dragging && (
        <div className="fixed inset-0 z-[2000] bg-espresso/85 backdrop-blur-sm grid place-items-center pointer-events-none">
          <div className="panel px-10 py-8 text-center border-2 border-dashed border-amber-den">
            <Upload className="w-8 h-8 text-amber-den mx-auto mb-3" />
            <p className="text-[15px] font-bold text-cream">Lepaskan berkasnya di sini</p>
            <p className="text-[12px] text-cream-muted mt-1">
              Berkas SiPongi+ (.txt, .kmz, .kml, .csv) atau grid FDRS (.json)
            </p>
          </div>
        </div>
      )}

      <Navbar
        tab={tab}
        onTab={setTab}
        onImport={() => setImporterOpen(true)}
        provenance={provenance}
        count={hotspots.length}
      />
      <ProvenanceBar provenance={provenance} />
      {dropError && (
        <div className="px-4 sm:px-6 py-2 bg-espresso-sunken border-b border-espresso-line">
          <p className="max-w-7xl mx-auto text-[12px] text-cream-muted flex items-start gap-2">
            <span className="text-sienna font-semibold shrink-0">Impor gagal:</span>
            {dropError}
            <button onClick={() => setDropError(null)} className="ml-auto text-cream-faint hover:text-cream shrink-0">
              tutup
            </button>
          </p>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4">
        {tab === 'panduan' ? (
          <Panduan onImport={() => setImporterOpen(true)} />
        ) : !hasData ? (
          <EmptyState onImport={() => setImporterOpen(true)} onGuide={() => setTab('panduan')} />
        ) : (
          <>
            <SummaryCards summary={summary} />
            <ClusterPanel
              ladder={ladder}
              clusters={clusters}
              radius={radius}
              onRadius={setRadius}
              minSize={filters.minClusterSize}
              onMinSize={(n) => setFilters({ ...filters, minClusterSize: n })}
              onSelectCluster={openCluster}
            />
            <DataQualityPanel summary={summary} />
            <LandCoverBar summary={summary} />
            <FdrsPanel
              summary={summary}
              grid={fdrsGrid}
              hotspotDates={Object.keys(summary.byDate)}
            />
            <FilterBar filters={filters} onChange={setFilters} summary={summary} />

            {progress && (
              <div className="panel px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] h-1.5 rounded-full bg-espresso-sunken overflow-hidden">
                  <div
                    className="h-full bg-amber-den transition-all"
                    style={{ width: `${(progress.done / progress.total) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-cream-faint whitespace-nowrap">
                  membaca citra {progress.done.toLocaleString('id-ID')}/{progress.total.toLocaleString('id-ID')}
                  {progress.etaSeconds !== null ? ` · sisa ${formatDuration(progress.etaSeconds)}` : ''}
                </span>
                <button
                  onClick={stopImagery}
                  className="text-[11px] text-cream-faint hover:text-sienna whitespace-nowrap"
                >
                  Hentikan
                </button>
              </div>
            )}

            {tab === 'map' && (
              <GisMap
                hotspots={filtered}
                clusters={clusters}
                clusterView={clusterView}
                onToggleClusterView={setClusterView}
                onSelect={setSelected}
                onSelectCluster={openCluster}
              />
            )}
            {tab === 'imagery' && (
              <ImageryGrid
                hotspots={filtered}
                onSelect={setSelected}
                onOverride={handleOverride}
                // Reads what is on screen, so a filtered view produces a
                // reading for that view rather than for the top of the file.
                onAnalyse={() => void runImagery(filtered)}
                analysing={analysing}
                estimate={estimateWork(filtered.filter((h) => !h.imagery && !h.lowPrecision))}
              />
            )}
            {tab === 'table' && (
              <HotspotTable hotspots={filtered} provenance={provenance} onSelect={setSelected} />
            )}
            {tab === 'analytics' && <AnalyticsCharts summary={summary} />}
            {tab === 'report' && (
              <ReportGeneratorModal
                isOpen
                onClose={() => setTab('map')}
                hotspots={filtered}
                summary={summary}
                provenance={provenance}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-espresso-line px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 justify-between text-[11px] text-cream-faint">
          <span>
            Alat penapisan mandiri. Tidak berafiliasi dengan {INSTITUTIONS.ministry} dan bukan produk resmi
            pemerintah.
          </span>
          <a
            href={SIPONGI_DOWNLOAD_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-amber-den"
          >
            SiPongi+ {INSTITUTIONS.directorate}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>

      <HotspotDetailModal
        hotspot={selected}
        onClose={() => setSelected(null)}
        onImagery={handleImagery}
        onOverride={handleOverride}
      />
      <DataImporterModal
        isOpen={importerOpen}
        onClose={() => setImporterOpen(false)}
        onImported={handleAnyImport}
      />
    </div>
  );
}

function EmptyState({ onImport, onGuide }: { onImport: () => void; onGuide: () => void }) {
  return (
    <div className="panel p-8 sm:p-12 text-center max-w-2xl mx-auto">
      <div className="w-12 h-12 rounded-xl bg-amber-den/15 border border-amber-den/40 grid place-items-center mx-auto mb-4">
        <Upload className="w-6 h-6 text-amber-den" />
      </div>
      <h2 className="text-lg font-bold text-cream">Belum ada data</h2>
      <p className="text-[13px] text-cream-muted mt-2 leading-relaxed">
        Aplikasi ini sengaja dikirim dalam keadaan kosong. Tidak ada titik panas bawaan, tidak ada data contoh,
        dan tidak ada pembangkit titik acak. Apa pun yang tampil di sini berasal dari berkas yang Anda impor.
      </p>
      <p className="text-[13px] text-cream-muted mt-3">
        Seret berkas SiPongi+ ke mana saja di halaman ini, atau pakai tombol di bawah.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onImport}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-den text-espresso font-semibold text-[13px] px-4 py-2.5 hover:bg-camel transition-colors"
        >
          <Upload className="w-4 h-4" />
          Impor berkas
        </button>
        <button
          onClick={onGuide}
          className="inline-flex items-center gap-2 rounded-lg border border-espresso-line text-cream-muted font-medium text-[13px] px-4 py-2.5 hover:border-amber-den hover:text-amber-den transition-colors"
        >
          Belum tahu caranya? Buka panduan
        </button>
      </div>

      <div className="mt-8 text-left rule-olive pl-3">
        <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold">Yang tidak dilakukan alat ini</p>
        <p className="text-[12px] text-cream-muted leading-relaxed mt-1">{TENURE_NOTE}</p>
      </div>
    </div>
  );
}
