import { Flame, Upload, FileText, Map, Table2, BarChart3, ExternalLink, LayoutGrid, BookOpen } from 'lucide-react';
import type { DataProvenance } from '../types';
import { SIPONGI_DOWNLOAD_URL } from '../utils/importers';

export type TabKey = 'map' | 'imagery' | 'table' | 'analytics' | 'report' | 'panduan';

const TABS: { key: TabKey; label: string; icon: typeof Map }[] = [
  { key: 'map', label: 'Peta', icon: Map },
  { key: 'imagery', label: 'Citra', icon: LayoutGrid },
  { key: 'table', label: 'Tabel', icon: Table2 },
  { key: 'analytics', label: 'Ringkasan', icon: BarChart3 },
  { key: 'report', label: 'Laporan', icon: FileText },
  { key: 'panduan', label: 'Panduan', icon: BookOpen },
];

interface Props {
  tab: TabKey;
  onTab: (t: TabKey) => void;
  onImport: () => void;
  provenance: DataProvenance | null;
  count: number;
}

export default function Navbar({ tab, onTab, onImport, provenance, count }: Props) {
  return (
    <header className="sticky top-0 z-[900] bg-espresso-sunken/95 backdrop-blur border-b border-espresso-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-den/15 border border-amber-den/40 grid place-items-center shrink-0">
              <Flame className="w-5 h-5 text-amber-den" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-cream leading-tight truncate">Dashboard Rangkuman Heat Spot</h1>
              <p className="text-[11px] text-cream-faint leading-tight truncate">
                Penapisan spasial titik panas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={SIPONGI_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-cream-muted hover:text-amber-den transition-colors px-2 py-1.5"
            >
              Unduh data SiPongi+
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onImport}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-den text-espresso font-semibold text-[13px] px-3.5 py-2 hover:bg-camel transition-colors"
            >
              <Upload className="w-4 h-4" />
              Impor data
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 -mb-px overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => onTab(key)}
                className={
                  'inline-flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ' +
                  (active
                    ? 'border-amber-den text-amber-den'
                    : 'border-transparent text-cream-faint hover:text-cream-muted')
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
          <span className="ml-auto pl-4 text-[11px] font-mono text-cream-faint whitespace-nowrap self-center">
            {provenance ? `${count} titik · ${provenance.fileName}` : 'belum ada data'}
          </span>
        </nav>
      </div>
    </header>
  );
}
