import { Search, X } from 'lucide-react';
import type { FilterState, Summary } from '../types';
import { ALL_INDICATIONS, INDICATION_LABEL } from '../utils/imageryIndication';
import { FDRS_BAND_LABEL, FDRS_BANDS } from '../utils/fdrs';
import { LADDER_LABEL, LADDER_STEPS } from '../utils/clustering';

const selectClass =
  'bg-espresso-sunken border border-espresso-line rounded-lg px-2.5 py-1.5 text-[12px] text-cream focus:outline-none focus:border-amber-den';

export default function FilterBar({
  filters,
  onChange,
  summary,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  summary: Summary;
}) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const provinces = Object.keys(summary.byProvince).sort();
  const sensors = Object.keys(summary.bySensor).sort();

  return (
    <div className="panel p-3 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="w-4 h-4 text-cream-faint absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          value={filters.searchQuery}
          onChange={(e) => set({ searchQuery: e.target.value })}
          placeholder="Cari id, provinsi, kabupaten"
          className="w-full bg-espresso-sunken border border-espresso-line rounded-lg pl-8 pr-8 py-1.5 text-[12px] text-cream placeholder:text-cream-faint focus:outline-none focus:border-amber-den"
        />
        {filters.searchQuery && (
          <button
            onClick={() => set({ searchQuery: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-cream-faint hover:text-cream"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <select value={filters.confidence} onChange={(e) => set({ confidence: e.target.value as FilterState['confidence'] })} className={selectClass}>
        <option value="all">Semua kepercayaan</option>
        <option value="high">Tinggi</option>
        <option value="nominal">Nominal</option>
        <option value="low">Rendah</option>
      </select>

      <select value={filters.sensor} onChange={(e) => set({ sensor: e.target.value })} className={selectClass}>
        <option value="all">Semua satelit</option>
        {sensors.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {provinces.length > 0 && (
        <select value={filters.province} onChange={(e) => set({ province: e.target.value })} className={selectClass}>
          <option value="all">Semua provinsi</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      )}

      <select value={filters.indication} onChange={(e) => set({ indication: e.target.value as FilterState['indication'] })} className={selectClass}>
        <option value="all">Semua indikasi citra</option>
        {ALL_INDICATIONS.map((i) => (
          <option key={i} value={i}>{INDICATION_LABEL[i]}</option>
        ))}
      </select>

      <select
        value={filters.minClusterSize}
        onChange={(e) => set({ minClusterSize: Number(e.target.value) })}
        className={selectClass}
        title="Menyaring berdasarkan jumlah deteksi dalam satu gugus"
      >
        {LADDER_STEPS.map((n) => (
          <option key={n} value={n}>{n === 1 ? 'Semua gugus' : LADDER_LABEL[n]}</option>
        ))}
      </select>

      {summary.fdrsCovered > 0 && (
        <select
          value={filters.dcBand}
          onChange={(e) => set({ dcBand: e.target.value as FilterState['dcBand'] })}
          className={selectClass}
        >
          <option value="all">Semua kelas bahaya</option>
          {FDRS_BANDS.map((b) => (
            <option key={b} value={b}>{FDRS_BAND_LABEL[b]}</option>
          ))}
        </select>
      )}

      <label className="flex items-center gap-2 text-[12px] text-cream-muted">
        FRP min
        <input
          type="number"
          min={0}
          value={filters.minFRP}
          onChange={(e) => set({ minFRP: Number(e.target.value) || 0 })}
          className="w-16 bg-espresso-sunken border border-espresso-line rounded-lg px-2 py-1.5 text-[12px] text-cream font-mono focus:outline-none focus:border-amber-den"
        />
      </label>
    </div>
  );
}
