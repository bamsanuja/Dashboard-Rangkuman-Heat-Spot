import { Flame, CircleAlert } from 'lucide-react';
import type { FdrsGrid, Summary } from '../types';
import { FDRS_BAND_COLOR, FDRS_BAND_LABEL, FDRS_BANDS, FDRS_CODE_MEANING, dayGap } from '../utils/fdrs';

/**
 * Fire Danger Rating as the third triage axis.
 *
 * Land cover says what is on the ground. The conservation column says what its
 * legal status is. This says how dry the ground is underneath, and on peat that
 * is what separates a fire that burns out on its own from one that goes
 * subsurface and runs for weeks.
 */
export default function FdrsPanel({
  summary,
  grid,
  hotspotDates,
}: {
  summary: Summary;
  grid: FdrsGrid | null;
  hotspotDates: string[];
}) {
  if (!grid) {
    return (
      <div className="panel p-4">
        <div className="flex items-start gap-2.5">
          <Flame className="w-4 h-4 text-cream-faint shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[12px] font-bold text-cream">Tingkat bahaya kebakaran belum dimuat</h3>
            <p className="text-[11px] text-cream-muted leading-relaxed mt-1 max-w-2xl">
              Jalankan <span className="font-mono text-cream">python scripts/fetch-fdrs.py 2026-08-26</span> untuk
              mengambil grid harian GFWED, lalu impor berkas JSON hasilnya lewat tombol Impor data. Tanpa lapisan
              ini, aplikasi hanya bisa mengatakan apa yang ada di bawah titik panas, dan belum bisa mengatakan
              seberapa kering lahannya.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const total = summary.total || 1;
  const present = FDRS_BANDS.filter((b) => summary.byDcBand[b] > 0);
  const critical = summary.dcBandByArea.sangat_mudah.inside;

  const gaps = hotspotDates
    .map((d) => dayGap(grid.observationDate, d))
    .filter((v): v is number => v !== null);
  const maxGap = gaps.length ? Math.max(...gaps.map(Math.abs)) : 0;

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h3 className="text-[12px] font-bold text-cream">Tingkat bahaya kebakaran, Drought Code</h3>
        <span className="text-[10px] text-cream-faint">
          {grid.source} · observasi {grid.observationDate} · {summary.fdrsCovered} dari {summary.total} titik tercakup
        </span>
      </div>
      <p className="text-[10px] text-cream-faint leading-snug mb-3 max-w-3xl">{FDRS_CODE_MEANING.dc}</p>

      <div className="flex w-full h-7 rounded-lg overflow-hidden border border-espresso-line">
        {present.map((b) => (
          <div
            key={b}
            style={{ width: `${(summary.byDcBand[b] / total) * 100}%`, background: FDRS_BAND_COLOR[b] }}
            title={`${FDRS_BAND_LABEL[b]}: ${summary.byDcBand[b]}`}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {present.map((b) => (
          <div key={b} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: FDRS_BAND_COLOR[b] }} />
            <span className="text-[11px] text-cream-muted">{FDRS_BAND_LABEL[b]}</span>
            <span className="text-[11px] font-mono text-cream">{summary.byDcBand[b]}</span>
            <span className="text-[10px] text-cream-faint">
              ({((summary.byDcBand[b] / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-espresso-line">
        <h4 className="text-[11px] font-bold text-cream mb-2">Kekeringan lapisan dalam terhadap kawasan konservasi</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] min-w-[420px]">
            <thead>
              <tr className="text-cream-faint border-b border-espresso-line">
                <th className="text-left py-1.5 pr-2 font-semibold">Kelas bahaya</th>
                <th className="text-right py-1.5 px-2 font-semibold w-32">Dalam batas indikatif</th>
                <th className="text-right py-1.5 px-2 font-semibold w-28">Dekat batas</th>
                <th className="text-right py-1.5 pl-2 font-semibold w-24">Di luar</th>
              </tr>
            </thead>
            <tbody>
              {present.map((b) => {
                const row = summary.dcBandByArea[b];
                const hot = b === 'sangat_mudah';
                return (
                  <tr key={b} className="border-b border-espresso-line/50">
                    <td className="py-1.5 pr-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: FDRS_BAND_COLOR[b] }} />
                        <span className="text-cream-muted">{FDRS_BAND_LABEL[b]}</span>
                      </span>
                    </td>
                    <td className={'text-right py-1.5 px-2 font-mono ' + (hot && row.inside > 0 ? 'text-sienna font-bold' : 'text-cream-faint')}>
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

        {critical > 0 && (
          <div className="mt-2.5 rule-sienna pl-3 py-1.5">
            <p className="text-[11px] text-cream-muted leading-snug">
              <CircleAlert className="w-3.5 h-3.5 inline mr-1 text-sienna" />
              {critical} titik berada di dalam poligon indikatif kawasan konservasi dengan Drought Code pada kelas
              Sangat Mudah. Pada lapisan gambut, kombinasi ini berarti api berpeluang turun ke bawah permukaan dan
              bertahan jauh setelah nyala di permukaan padam.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-espresso-line space-y-1.5">
        <p className="text-[10px] text-cream-faint leading-snug">
          {grid.attribution}. Ambang kelas bahaya mengikuti panel FDRS SIPONGI yang bersumber pada Spartan BMKG:
          Drought Code 141, 261, dan 350. Nilai mentah GFWED disimpan apa adanya, dan hanya pengelompokannya yang
          memakai ambang tersebut.
        </p>
        <p className="text-[10px] text-cream-faint leading-snug">
          Sel grid berukuran sekitar 0,25 derajat atau 28 km, jauh lebih kasar daripada jejak piksel titik panas.
          Nilai menggambarkan kondisi cuaca di sekitar titik, bukan tepat di titik itu.
        </p>
        {maxGap > 0 && (
          <p className="text-[10px] text-sienna leading-snug">
            Grid ini diamati pada {grid.observationDate}, sedangkan titik panas yang dimuat berjarak sampai {maxGap}{' '}
            hari dari tanggal itu. Kekeringan berubah harian, jadi ambil grid pada tanggal yang sama dengan data
            titik panas untuk pembacaan yang sahih.
          </p>
        )}
      </div>
    </div>
  );
}
