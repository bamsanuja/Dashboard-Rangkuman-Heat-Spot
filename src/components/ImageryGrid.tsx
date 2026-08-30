import { useState } from 'react';
import { Check, RefreshCw, ChevronDown } from 'lucide-react';
import type { Hotspot, LandIndication } from '../types';
import {
  ALL_INDICATIONS, formatDuration, INDICATION_COLOR, INDICATION_LABEL, INDICATION_SHORT, tileUrlFor,
  type WorkEstimate,
} from '../utils/imageryIndication';

/**
 * A contact sheet. The point of the tool is that a person can scan a hundred
 * patches of ground at once and see, without clicking anything, that most of
 * the fires sit on planted rows. Where the machine gets one wrong, the reader
 * corrects it here and the correction flows into every summary.
 *
 * Two separate limits live here, and conflating them was the earlier mistake.
 * Reading imagery is bounded by the network and runs over the whole filtered
 * set in one go. Rendering thumbnails is bounded by the DOM, so the sheet draws
 * a page at a time. A reader should never be asked to click a button thirty
 * times because of a limit that belongs to the renderer.
 */
const OVERRIDABLE: LandIndication[] = ALL_INDICATIONS.filter((i) => i !== 'not_analysed');

/** Thumbnails drawn per page. Twelve thousand image nodes would stall the tab. */
const PAGE = 600;

export default function ImageryGrid({
  hotspots,
  onSelect,
  onOverride,
  onAnalyse,
  analysing,
  estimate,
}: {
  hotspots: Hotspot[];
  onSelect: (h: Hotspot) => void;
  onOverride: (id: string, indication: LandIndication) => void;
  onAnalyse: () => void;
  analysing: boolean;
  estimate: WorkEstimate;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);

  const pending = estimate.points;
  const skippedCoarse = hotspots.filter((h) => h.lowPrecision).length;
  const visible = hotspots.slice(0, shown);

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[12px] font-bold text-cream">Lembar citra</h3>
          <p className="text-[10px] text-cream-faint leading-snug max-w-2xl">
            Klik petak untuk rincian. Klik label untuk mengoreksi pembacaan mesin.
            {skippedCoarse > 0
              ? ` ${skippedCoarse} titik dilewati karena koordinatnya lebih kasar dari satu kilometer.`
              : ''}
          </p>
        </div>

        {pending > 0 && (
          <div className="text-right shrink-0">
            <button
              onClick={onAnalyse}
              disabled={analysing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-den text-espresso font-semibold text-[12px] px-3.5 py-2 hover:bg-camel disabled:opacity-50"
            >
              <RefreshCw className={'w-3.5 h-3.5 ' + (analysing ? 'animate-spin' : '')} />
              {analysing
                ? 'Sedang membaca citra'
                : `Baca citra ${pending.toLocaleString('id-ID')} titik sekaligus`}
            </button>
            {!analysing && (
              <p className="text-[10px] text-cream-faint mt-1.5 max-w-[280px]">
                {estimate.uniqueTiles.toLocaleString('id-ID')} ubin citra yang perlu diambil, perkiraan{' '}
                {formatDuration(estimate.seconds)}. Bisa dihentikan kapan saja, dan hasil yang sudah terbaca tetap
                tersimpan.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {visible.map((h) => {
          const ind: LandIndication = h.imagery?.indication ?? 'not_analysed';
          const src = h.imagery?.thumbnail ?? tileUrlFor(h.latitude, h.longitude);
          const open = editing === h.id;
          return (
            <div key={h.id} className="relative">
              <button
                onClick={() => onSelect(h)}
                className="block w-full aspect-square rounded-lg overflow-hidden border border-espresso-line hover:border-amber-den transition-colors"
                style={{ outline: `2px solid ${INDICATION_COLOR[ind]}`, outlineOffset: -2 }}
              >
                <img
                  src={src}
                  alt={INDICATION_LABEL[ind]}
                  className="w-full h-full object-cover imagery-swatch"
                  loading="lazy"
                />
              </button>

              <button
                onClick={() => setEditing(open ? null : h.id)}
                className="w-full mt-1 flex items-center gap-1 text-left"
                title={INDICATION_LABEL[ind]}
              >
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: INDICATION_COLOR[ind] }} />
                <span className="text-[9px] text-cream-faint truncate">
                  {INDICATION_SHORT[ind]}
                  {h.imagery?.reviewedByHuman ? ' ✓' : ''}
                </span>
              </button>

              {open && (
                <div className="absolute z-20 top-full left-0 mt-1 w-44 panel-sunken p-1.5 shadow-xl">
                  {OVERRIDABLE.map((i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onOverride(h.id, i);
                        setEditing(null);
                      }}
                      className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-left hover:bg-espresso-line"
                    >
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: INDICATION_COLOR[i] }} />
                      <span className="text-[10px] text-cream-muted flex-1">{INDICATION_SHORT[i]}</span>
                      {ind === i && <Check className="w-3 h-3 text-amber-den" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {shown < hotspots.length && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShown(shown + PAGE)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-espresso-line text-cream-muted text-[12px] px-4 py-2 hover:border-amber-den hover:text-amber-den"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Tampilkan {Math.min(PAGE, hotspots.length - shown).toLocaleString('id-ID')} petak lagi
          </button>
          <p className="text-[10px] text-cream-faint mt-1.5">
            Menampilkan {shown.toLocaleString('id-ID')} dari {hotspots.length.toLocaleString('id-ID')} petak. Batas
            ini hanya soal tampilan, dan tidak membatasi pembacaan citra.
          </p>
        </div>
      )}

      {!hotspots.length && (
        <p className="text-[12px] text-cream-faint py-8 text-center">Tidak ada titik pada filter saat ini.</p>
      )}
    </div>
  );
}
