import { Info, TriangleAlert } from 'lucide-react';
import type { Summary } from '../types';
import {
  ALL_INDICATIONS, INDICATION_COLOR, INDICATION_DEFINITION, INDICATION_LABEL, INDICATION_SHORT, METHOD_NOTE,
} from '../utils/imageryIndication';

/**
 * The headline the dashboard exists to deliver: of the hotspots in view, what
 * is the land underneath them, read off the imagery.
 *
 * The cross-tab below the bar exists because "vegetasi rapat" and "hutan
 * lindung" are different kinds of statement. One describes how the ground
 * looks, the other is a legal designation. Collapsing them would be the same
 * category error this app was rebuilt to remove, so the two are crossed rather
 * than merged.
 */
export default function LandCoverBar({ summary }: { summary: Summary }) {
  const total = summary.total || 1;
  const present = ALL_INDICATIONS.filter((i) => summary.byIndication[i] > 0);
  const canopyInside = summary.coverByArea.closed_canopy.inside;
  const anyInside = present.some((i) => summary.coverByArea[i].inside > 0);

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-[12px] font-bold text-cream">Tutupan lahan di bawah titik panas</h3>
        <span className="text-[10px] text-cream-faint">
          {summary.imageryAnalysed} dari {summary.total} titik terbaca citranya
          {summary.humanReviewed > 0 ? ` · ${summary.humanReviewed} dikonfirmasi manual` : ''}
        </span>
      </div>

      <div className="flex w-full h-7 rounded-lg overflow-hidden border border-espresso-line">
        {present.map((i) => {
          const pct = (summary.byIndication[i] / total) * 100;
          return (
            <div
              key={i}
              style={{ width: `${pct}%`, background: INDICATION_COLOR[i] }}
              title={`${INDICATION_SHORT[i]}: ${summary.byIndication[i]} (${pct.toFixed(0)}%)`}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {present.map((i) => {
          const n = summary.byIndication[i];
          return (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: INDICATION_COLOR[i] }} />
              <span className="text-[11px] text-cream-muted">{INDICATION_SHORT[i]}</span>
              <span className="text-[11px] font-mono text-cream">{n}</span>
              <span className="text-[10px] text-cream-faint">({((n / total) * 100).toFixed(0)}%)</span>
            </div>
          );
        })}
      </div>

      {/* Cross-tab: the same land cover means different things in and out of a
          conservation area, so the two questions are kept separate. */}
      <div className="mt-4 pt-4 border-t border-espresso-line">
        <h4 className="text-[11px] font-bold text-cream mb-1">
          Tutupan lahan terhadap kawasan konservasi
        </h4>
        <p className="text-[10px] text-cream-faint leading-snug mb-2.5">
          Vegetasi rapat adalah tampilan permukaan. Hutan lindung dan kawasan konservasi adalah status hukum.
          Keduanya disilangkan di sini, karena tutupan yang sama berarti hal berbeda di dalam dan di luar kawasan.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] min-w-[420px]">
            <thead>
              <tr className="text-cream-faint border-b border-espresso-line">
                <th className="text-left py-1.5 pr-2 font-semibold">Tutupan lahan</th>
                <th className="text-right py-1.5 px-2 font-semibold w-32">Dalam batas indikatif</th>
                <th className="text-right py-1.5 px-2 font-semibold w-28">Dekat batas</th>
                <th className="text-right py-1.5 pl-2 font-semibold w-24">Di luar</th>
              </tr>
            </thead>
            <tbody>
              {present.map((i) => {
                const row = summary.coverByArea[i];
                return (
                  <tr key={i} className="border-b border-espresso-line/50">
                    <td className="py-1.5 pr-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: INDICATION_COLOR[i] }} />
                        <span className="text-cream-muted">{INDICATION_SHORT[i]}</span>
                      </span>
                    </td>
                    <td
                      className={
                        'text-right py-1.5 px-2 font-mono ' +
                        (row.inside > 0 ? 'text-amber-den font-bold' : 'text-cream-faint')
                      }
                    >
                      {row.inside || '·'}
                    </td>
                    <td className="text-right py-1.5 px-2 font-mono text-cream-muted">{row.near || '·'}</td>
                    <td className="text-right py-1.5 pl-2 font-mono text-cream-faint">{row.outside || '·'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {canopyInside > 0 && (
          <div className="mt-2.5 rule-amber pl-3 py-1.5">
            <p className="text-[11px] text-cream-muted leading-snug">
              <TriangleAlert className="w-3.5 h-3.5 inline mr-1 text-amber-den" />
              {canopyInside} titik bervegetasi rapat berada di dalam poligon indikatif kawasan konservasi. Ini
              gabungan yang paling layak diverifikasi, karena kebakaran pada tutupan rapat di dalam kawasan
              berbeda konsekuensinya dari kebakaran pada tutupan yang sama di lahan biasa.
            </p>
          </div>
        )}

        {!anyInside && summary.imageryAnalysed > 0 && (
          <p className="text-[10px] text-cream-faint mt-2">
            Tidak ada titik yang jatuh di dalam poligon indikatif kawasan pada data ini.
          </p>
        )}

        <p className="text-[10px] text-cream-faint leading-snug mt-2">
          Kolom kawasan mengacu pada delapan poligon indikatif yang dimuat aplikasi, dan bukan seluruh kawasan
          hutan Indonesia. Titik di kolom "di luar" berarti berada di luar delapan poligon itu, bukan berarti
          berada di luar kawasan hutan.
        </p>
      </div>

      <details className="mt-4 pt-4 border-t border-espresso-line">
        <summary className="cursor-pointer text-[11px] text-cream-muted hover:text-cream inline-flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Definisi tiap kelas tutupan lahan
        </summary>

        <div className="mt-3 space-y-3">
          {present.map((i) => {
            const d = INDICATION_DEFINITION[i];
            return (
              <div key={i} className="pl-3" style={{ borderLeft: `3px solid ${INDICATION_COLOR[i]}` }}>
                <p className="text-[12px] font-semibold text-cream">{INDICATION_LABEL[i]}</p>
                <dl className="mt-1 space-y-0.5">
                  <div className="flex gap-2">
                    <dt className="text-[10px] uppercase tracking-wider text-cream-faint w-20 shrink-0 pt-px">Ukuran</dt>
                    <dd className="text-[11px] text-cream-muted leading-snug">{d.criteria}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] uppercase tracking-wider text-cream-faint w-20 shrink-0 pt-px">Artinya</dt>
                    <dd className="text-[11px] text-cream-muted leading-snug">{d.meaning}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] uppercase tracking-wider text-sienna w-20 shrink-0 pt-px">Bukan</dt>
                    <dd className="text-[11px] text-cream-muted leading-snug">{d.notMeaning}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-cream-faint leading-relaxed mt-3 pt-3 border-t border-espresso-line">
          {METHOD_NOTE}
        </p>
      </details>

      <p className="text-[10px] text-cream-faint leading-snug mt-3 pt-3 border-t border-espresso-line">
        Dibaca dari citra basemap yang tanggal perekamannya tidak diketahui. Menggambarkan kondisi tapak, bukan
        kondisi saat kebakaran, dan bukan penetapan status lahan.
      </p>
    </div>
  );
}
