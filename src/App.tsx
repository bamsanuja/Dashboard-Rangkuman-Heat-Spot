import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { FilterBar } from './components/FilterBar';
import { GisMap } from './components/GisMap';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { HotspotTable } from './components/HotspotTable';
import { HotspotDetailModal } from './components/HotspotDetailModal';
import { DataImporterModal } from './components/DataImporterModal';
import { ReportGeneratorModal } from './components/ReportGeneratorModal';
import { getInitialHotspots, generateRandomHotspot } from './data/mockHotspots';
import { computeSpatialSummary } from './utils/spatialAnalysis';
import type { FilterState, Hotspot } from './types';
import { 
  Flame, 
  TreePine, 
  Palmtree, 
  Pickaxe, 
  Radio, 
  FileText
} from 'lucide-react';

export function App() {
  // Master Hotspot dataset
  const [hotspots, setHotspots] = useState<Hotspot[]>(() => getInitialHotspots());

  // Active view tab
  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'table' | 'report'>('map');

  // Selected hotspot for detail modal / map fly-to
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Modal states
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Live simulation toggle
  const [isLiveSimulating, setIsLiveSimulating] = useState<boolean>(false);
  const [liveToast, setLiveToast] = useState<{ id: string; location: string; category: string } | null>(null);

  // Filter State
  const [filter, setFilter] = useState<FilterState>({
    landCategory: 'all',
    confidence: 'all',
    satellite: 'all',
    province: 'all',
    dateRange: 'all',
    searchQuery: '',
    minFRP: 0
  });

  // Live simulation tick (every 10s if active)
  useEffect(() => {
    if (!isLiveSimulating) return;

    let localCounter = 105;
    const timer = setInterval(() => {
      localCounter += 1;
      const newSpot = generateRandomHotspot(localCounter);
      
      setHotspots(old => [newSpot, ...old]);

      // Show quick toast
      setLiveToast({
        id: newSpot.id,
        location: `${newSpot.subdistrict}, ${newSpot.district}`,
        category: newSpot.landDetail.categoryName
      });

      setTimeout(() => setLiveToast(null), 4000);
    }, 10000);

    return () => clearInterval(timer);
  }, [isLiveSimulating]);

  // Unique list of provinces for dropdown
  const availableProvinces = useMemo(() => {
    const set = new Set<string>();
    hotspots.forEach(h => set.add(h.province));
    return Array.from(set).sort();
  }, [hotspots]);

  // Filtered Hotspots Pipeline
  const filteredHotspots = useMemo(() => {
    return hotspots.filter(h => {
      // 1. Land category filter
      if (filter.landCategory !== 'all') {
        if (filter.landCategory === 'sawit_all') {
          if (h.landCategory !== 'sawit_dalam' && h.landCategory !== 'sawit_sebelah') return false;
        } else if (h.landCategory !== filter.landCategory) {
          return false;
        }
      }

      // 2. Confidence filter
      if (filter.confidence !== 'all') {
        if (filter.confidence === 'high' && h.confidence < 80) return false;
        if (filter.confidence === 'medium' && (h.confidence < 30 || h.confidence >= 80)) return false;
        if (filter.confidence === 'low' && h.confidence >= 30) return false;
      }

      // 3. Province filter
      if (filter.province !== 'all' && h.province !== filter.province) {
        return false;
      }

      // 4. Date Range filter
      if (filter.dateRange !== 'all') {
        const todayStr = '2026-08-24';
        if (filter.dateRange === 'today' && h.acquisitionDate !== todayStr) return false;
        if (filter.dateRange === '24h' && h.acquisitionDate !== todayStr && h.acquisitionDate !== '2026-08-23') return false;
      }

      // 5. Search query (matches ID, province, district, subdistrict, area name)
      if (filter.searchQuery.trim() !== '') {
        const q = filter.searchQuery.toLowerCase();
        const matchId = h.id.toLowerCase().includes(q);
        const matchProv = h.province.toLowerCase().includes(q);
        const matchDist = h.district.toLowerCase().includes(q);
        const matchSub = h.subdistrict.toLowerCase().includes(q);
        const matchArea = h.landDetail.specificAreaName.toLowerCase().includes(q);
        const matchHolder = h.landDetail.concessionHolder?.toLowerCase().includes(q) || false;

        if (!matchId && !matchProv && !matchDist && !matchSub && !matchArea && !matchHolder) {
          return false;
        }
      }

      return true;
    });
  }, [hotspots, filter]);

  // Summary computed for currently filtered data
  const summary = useMemo(() => {
    return computeSpatialSummary(filteredHotspots);
  }, [filteredHotspots]);

  // Overall summary for banner KPIs
  const overallSummary = useMemo(() => {
    return computeSpatialSummary(hotspots);
  }, [hotspots]);

  const handleOpenDetails = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
  };

  const handleZoomToMap = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setActiveTab('map');
  };

  const handleAddHotspot = (newHotspot: Hotspot) => {
    setHotspots(prev => [newHotspot, ...prev]);
    setSelectedHotspot(newHotspot);
    setActiveTab('map');
  };

  const handleAddBatchHotspots = (newHotspots: Hotspot[]) => {
    setHotspots(prev => [...newHotspots, ...prev]);
    setActiveTab('table');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500/30">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalHotspots={hotspots.length}
        criticalCount={overallSummary.criticalAlerts}
        isLiveSimulating={isLiveSimulating}
        setIsLiveSimulating={setIsLiveSimulating}
        onOpenImporter={() => setIsImporterOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onAddManualPoint={() => setIsImporterOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-5">
        
        {/* Live Detection Toast */}
        {liveToast && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-orange-600/90 to-red-600/90 text-white shadow-xl shadow-red-500/20 border border-white/20 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-amber-200 animate-pulse" />
              <div className="text-xs">
                <span className="font-bold">Deteksi Satelit Baru: </span>
                <span className="font-mono">{liveToast.id}</span> di {liveToast.location} ({liveToast.category})
              </div>
            </div>
            <button
              onClick={() => {
                const target = hotspots.find(h => h.id === liveToast.id);
                if (target) handleZoomToMap(target);
              }}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold backdrop-blur-sm transition"
            >
              Lihat di Peta
            </button>
          </div>
        )}

        {/* Top Summary Metric Cards */}
        <SummaryCards
          summary={summary}
          filter={filter}
          onFilterCategory={(cat) => setFilter(prev => ({ ...prev, landCategory: cat }))}
        />

        {/* Smart Multi-Dimensional Filter Bar */}
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          availableProvinces={availableProvinces}
          totalFiltered={filteredHotspots.length}
          totalAll={hotspots.length}
        />

        {/* Tab 1: Peta GIS View */}
        {activeTab === 'map' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <GisMap
              hotspots={filteredHotspots}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={(h) => setSelectedHotspot(h)}
              onOpenDetails={handleOpenDetails}
            />

            {/* Quick Insights strip below map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <TreePine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-emerald-300">Zona Konservasi Prioritas</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {summary.hutanLindung} titik api terdeteksi dalam kawasan Taman Nasional & Suaka Margasatwa. Pemantauan intensif di TN Tesso Nilo & TN Sebangau.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <Palmtree className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-300">Pengawasan Konsesi Sawit</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {summary.sawitTotal} titik api beririsan dengan perkebunan sawit ({summary.sawitInside} dalam izin HGU, {summary.sawitBuffer} di zona penyangga &lt;2km).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  <Pickaxe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-purple-300">Konsesi Tambang & Perkotaan</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {summary.tambang} titik di area tambang batubara/nikel dan {summary.perkotaan} titik di sabuk kota/pemukiman (potensi ancaman ISPA).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dashboard Analytics View */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-200">
            <AnalyticsCharts summary={summary} />
          </div>
        )}

        {/* Tab 3: Table View */}
        {activeTab === 'table' && (
          <div className="animate-in fade-in duration-200">
            <HotspotTable
              hotspots={filteredHotspots}
              onSelectHotspot={(h) => setSelectedHotspot(h)}
              onOpenDetails={handleOpenDetails}
              onZoomToMap={handleZoomToMap}
            />
          </div>
        )}

        {/* Tab 4: Executive Report View */}
        {activeTab === 'report' && (
          <div className="animate-in fade-in duration-200">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400" />
                    Pratinjau Laporan Ringkasan Eksekutif Karhutla
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dokumen resmi ringkasan spasial untuk keperluan advokasi, penegakan hukum, dan pelaporan pimpinan.
                  </p>
                </div>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Buka Lembar Lengkap & Cetak</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Statistik Ringkas Zonasi
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-emerald-300">
                      <span>🌲 Hutan Lindung & Konservasi:</span>
                      <strong className="font-mono">{summary.hutanLindung} titik ({Math.round((summary.hutanLindung / (summary.total || 1)) * 100)}%)</strong>
                    </div>
                    <div className="flex justify-between items-center text-amber-300">
                      <span>🌴 Konsesi Sawit (Dalam & Buffer):</span>
                      <strong className="font-mono">{summary.sawitTotal} titik ({Math.round((summary.sawitTotal / (summary.total || 1)) * 100)}%)</strong>
                    </div>
                    <div className="flex justify-between items-center text-purple-300">
                      <span>⛏️ Konsesi Pertambangan:</span>
                      <strong className="font-mono">{summary.tambang} titik ({Math.round((summary.tambang / (summary.total || 1)) * 100)}%)</strong>
                    </div>
                    <div className="flex justify-between items-center text-cyan-300">
                      <span>🏙️ Kawasan Perkotaan/Pemukiman:</span>
                      <strong className="font-mono">{summary.perkotaan} titik ({Math.round((summary.perkotaan / (summary.total || 1)) * 100)}%)</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Dasar Regulasi & Penegakan Hukum
                  </span>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                    <li>UU No. 18/2013 tentang Pencegahan dan Pemberantasan Perusakan Hutan.</li>
                    <li>UU No. 32/2009 tentang PPLH (Asas Tanggung Jawab Mutlak / Strict Liability).</li>
                    <li>UU No. 41/1999 tentang Kehutanan Pasal 78.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-slate-200">Sipongi Land-Watch</span>
            <span>— Dashboard Interaktif Pemantauan Karhutla Berbasis Zonasi Lahan</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Sumber Data: Sipongi+ KLHK, Satelit VIIRS/MODIS & GIS Konsesi Indonesia.
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <HotspotDetailModal
        hotspot={selectedHotspot}
        onClose={() => {
          setSelectedHotspot(null);
        }}
        onZoomToMap={handleZoomToMap}
      />

      <DataImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onAddHotspot={handleAddHotspot}
        onAddBatchHotspots={handleAddBatchHotspots}
      />

      <ReportGeneratorModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        summary={summary}
        hotspots={filteredHotspots}
      />

    </div>
  );
}

export default App;
