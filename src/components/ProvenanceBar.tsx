import { Info, ShieldAlert } from 'lucide-react';
import type { DataProvenance } from '../types';
import { EVIDENTIARY_NOTE } from '../utils/legal';

/**
 * Always rendered. With data loaded it states where the data came from and
 * carries the attribution the source requires. With no data loaded it says the
 * app is empty, which is the honest condition on first open.
 */
export default function ProvenanceBar({ provenance }: { provenance: DataProvenance | null }) {
  if (!provenance) {
    return (
      <div className="provenance-bar px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-start gap-2.5 text-[12px] text-cream-muted">
          <ShieldAlert className="w-4 h-4 text-amber-den shrink-0 mt-px" />
          <p>
            Belum ada data yang dimuat. Aplikasi ini tidak membawa data bawaan dan tidak membangkitkan
            titik panas sendiri. Impor berkas dari SiPongi+ atau NASA FIRMS untuk mulai.
          </p>
        </div>
      </div>
    );
  }

  const imported = new Date(provenance.importedAt);
  return (
    <div className="provenance-bar px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-[12px]">
        <span className="font-semibold text-amber-den whitespace-nowrap">{provenance.attribution}</span>
        <span className="text-cream-muted font-mono truncate">
          {provenance.fileName} · {provenance.rowCount} titik
          {provenance.skippedCount > 0 ? ` · ${provenance.skippedCount} baris dilewati` : ''} · diimpor{' '}
          {imported.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
        <span className="sm:ml-auto flex items-center gap-1.5 text-cream-faint whitespace-nowrap">
          <Info className="w-3.5 h-3.5" />
          Snapshot berkas, bukan umpan langsung
        </span>
      </div>
      <p className="max-w-7xl mx-auto mt-1.5 text-[11px] text-cream-faint leading-relaxed">{EVIDENTIARY_NOTE}</p>
    </div>
  );
}
