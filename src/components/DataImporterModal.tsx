import { useRef, useState } from 'react';
import { X, Upload, ExternalLink, CircleAlert, CircleCheck } from 'lucide-react';
import type { AnyImport, ImportResult } from '../utils/importers';
import { importAny, SIPONGI_DOWNLOAD_URL } from '../utils/importers';
import type { FdrsGrid } from '../types';

export default function DataImporterModal({
  isOpen,
  onClose,
  onImported,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImported: (payload: AnyImport) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [grid, setGrid] = useState<FdrsGrid | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handle = async (file: File) => {
    setBusy(true);
    setError(null);
    setResult(null);
    setGrid(null);
    try {
      const payload = await importAny(file);
      if (payload.kind === 'fdrs') {
        setGrid(payload.grid);
      } else if (!payload.result.hotspots.length) {
        setError('Tidak ada baris yang dapat dibaca dari berkas ini.');
        setResult(payload.result);
      } else {
        setResult(payload.result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Berkas tidak dapat dibaca.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="panel w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3.5 border-b border-espresso-line flex items-center justify-between">
          <h2 className="font-bold text-cream text-[15px]">Impor data titik panas</h2>
          <button onClick={onClose} className="text-cream-faint hover:text-cream">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rule-amber pl-3 py-1">
            <p className="text-[12px] text-cream-muted leading-relaxed">
              Aplikasi ini tidak menyimpan data bawaan. Seluruh titik yang tampil berasal dari berkas yang Anda
              impor, dan setiap nilai dapat ditelusuri kembali ke baris aslinya.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-wider text-amber-den font-bold mb-2">Cara memperoleh data</h3>
            <ol className="text-[12px] text-cream-muted space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                Buka halaman Sebaran Hotspot SiPongi+{' '}
                <a href={SIPONGI_DOWNLOAD_URL} target="_blank" rel="noreferrer" className="text-amber-den hover:underline inline-flex items-center gap-1">
                  sipongi.gakkum.kehutanan.go.id
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Pilih provinsi dan rentang tanggal yang diinginkan.</li>
              <li>Gunakan <span className="font-mono text-cream">Download KMZ</span> atau <span className="font-mono text-cream">Download TXT</span>. KMZ memuat titik berkoordinat.</li>
              <li>Unggah berkas itu di bawah ini.</li>
            </ol>
            <p className="text-[11px] text-cream-muted mt-2 leading-relaxed">
              Untuk lapisan tingkat bahaya kebakaran, jalankan{' '}
              <span className="font-mono text-cream">python scripts/fetch-fdrs.py 2026-08-26</span> lalu unggah
              berkas JSON hasilnya di sini juga. Grid itu berasal dari GFWED NASA GISS, dan dikelompokkan memakai
              ambang FDRS SIPONGI.
            </p>
            <p className="text-[11px] text-cream-faint mt-2 leading-snug">
              Tabel rekapitulasi (Satelit / Kab-Kota / Provinsi / Kepercayaan / Jumlah) tidak memuat koordinat dan
              tidak dapat dipetakan. CSV NASA FIRMS untuk wilayah Indonesia juga diterima.
            </p>
          </div>

          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="w-full border-2 border-dashed border-espresso-line rounded-xl py-8 flex flex-col items-center gap-2 hover:border-amber-den transition-colors disabled:opacity-50"
          >
            <Upload className="w-6 h-6 text-amber-den" />
            <span className="text-[13px] text-cream font-medium">{busy ? 'Membaca berkas...' : 'Pilih berkas'}</span>
            <span className="text-[11px] text-cream-faint">.kmz · .kml · .txt · .csv · .json (grid FDRS)</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".kmz,.kml,.txt,.csv,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handle(f);
              e.target.value = '';
            }}
          />

          {error && (
            <div className="rule-sienna pl-3 py-2 bg-espresso-sunken rounded-r-lg">
              <p className="text-[12px] text-cream-muted flex gap-2">
                <CircleAlert className="w-4 h-4 text-sienna shrink-0 mt-px" />
                {error}
              </p>
            </div>
          )}

          {grid && (
            <div className="panel-sunken p-4 space-y-3">
              <p className="text-[13px] text-cream flex items-center gap-2 font-medium">
                <CircleCheck className="w-4 h-4 text-amber-den" />
                Grid FDRS terbaca: {grid.nLon} x {grid.nLat} sel, observasi {grid.observationDate}
              </p>
              <p className="text-[11px] text-cream-faint">
                {grid.attribution} · kode tersedia: {grid.codes.join(', ').toUpperCase()}
              </p>
              <button
                onClick={() => {
                  onImported({ kind: 'fdrs', grid });
                  setGrid(null);
                  onClose();
                }}
                className="w-full rounded-lg bg-amber-den text-espresso font-semibold text-[13px] py-2.5 hover:bg-camel transition-colors"
              >
                Terapkan ke titik panas
              </button>
            </div>
          )}

          {result && result.hotspots.length > 0 && (
            <div className="panel-sunken p-4 space-y-3">
              <p className="text-[13px] text-cream flex items-center gap-2 font-medium">
                <CircleCheck className="w-4 h-4 text-amber-den" />
                {result.hotspots.length} titik terbaca dari {result.provenance.fileName}
              </p>
              <p className="text-[11px] text-cream-faint">{result.provenance.attribution}</p>

              {result.skipped.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mb-1">
                    Baris dilewati ({result.provenance.skippedCount})
                  </p>
                  <ul className="text-[11px] text-cream-muted space-y-0.5">
                    {result.skipped.map((s) => (
                      <li key={s.reason} className="flex gap-2">
                        <span className="font-mono text-cream-faint">{s.count}x</span>
                        {s.reason}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-cream-faint mt-1.5 leading-snug">
                    Baris yang tidak terbaca dilewati dan dihitung. Tidak ada nilai yang ditebak untuk menggantinya.
                  </p>
                </div>
              )}

              {result.warnings.map((w) => (
                <p key={w} className="text-[11px] text-cream-muted">{w}</p>
              ))}

              <button
                onClick={() => {
                  onImported({ kind: 'hotspots', result });
                  setResult(null);
                  onClose();
                }}
                className="w-full rounded-lg bg-amber-den text-espresso font-semibold text-[13px] py-2.5 hover:bg-camel transition-colors"
              >
                Muat ke dasbor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
