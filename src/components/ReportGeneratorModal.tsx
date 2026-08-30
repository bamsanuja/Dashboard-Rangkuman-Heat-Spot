import { X, Printer } from 'lucide-react';
import type { DataProvenance, Hotspot, Summary } from '../types';
import { EVIDENTIARY_NOTE, INSTITUTIONS, LEGAL_REFERENCES, TENURE_NOTE } from '../utils/legal';
import { AREA_LAYER_DISCLAIMER } from '../data/protectedAreas';
import {
  ALL_INDICATIONS, INDICATION_DEFINITION, INDICATION_LABEL, INDICATION_SHORT, METHOD_NOTE,
} from '../utils/imageryIndication';
import { FDRS_BAND_LABEL, FDRS_BANDS, FDRS_THRESHOLDS } from '../utils/fdrs';

/**
 * A screening note, not an official document. Every framing that made the old
 * version look like a government product has been removed: no "dokumen resmi",
 * no ministry logo lockup, no claim that the app is the source of the data.
 */
export default function ReportGeneratorModal({
  isOpen,
  onClose,
  hotspots,
  summary,
  provenance,
}: {
  isOpen: boolean;
  onClose: () => void;
  hotspots: Hotspot[];
  summary: Summary;
  provenance: DataProvenance | null;
}) {
  if (!isOpen) return null;

  // Ranked by what makes a point worth visiting first: deep-layer dryness,
  // then position relative to a conservation area, then detection confidence.
  const bandRank: Record<string, number> = { sangat_mudah: 3, mudah: 2, tidak_mudah: 1, aman: 0, tidak_ada_data: 0 };
  const areaRank: Record<string, number> = { within_indicative_boundary: 2, near_boundary: 1, outside: 0 };
  const confRank: Record<string, number> = { high: 2, nominal: 1, low: 0 };
  const score = (h: Hotspot) =>
    bandRank[h.fdrs?.dcBand ?? 'tidak_ada_data'] * 100 +
    areaRank[h.proximity?.relation ?? 'outside'] * 10 +
    confRank[h.confidence.level];
  const priority = [...hotspots].sort((a, b) => score(b) - score(a) || b.frp - a.frp).slice(0, 15);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white" onClick={onClose}>
      <div className="panel w-full max-w-3xl max-h-[92vh] overflow-y-auto print:max-h-none print:border-0" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3.5 border-b border-espresso-line flex items-center justify-between print:hidden">
          <h2 className="font-bold text-cream text-[15px]">Catatan penapisan</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 text-[12px] text-cream-muted hover:text-amber-den">
              <Printer className="w-4 h-4" />
              Cetak
            </button>
            <button onClick={onClose} className="text-cream-faint hover:text-cream">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <header>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-den font-bold">Catatan penapisan spasial</p>
            <h1 className="text-xl font-bold text-cream mt-1">Titik panas dan kedekatan kawasan konservasi</h1>
            <p className="text-[11px] text-cream-faint mt-1">
              Disusun {new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </header>

          <section className="rule-amber pl-3 py-1">
            <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold">Status dokumen</p>
            <p className="text-[12px] text-cream-muted leading-relaxed mt-1">
              Bukan dokumen resmi dan tidak diterbitkan oleh instansi pemerintah mana pun. Ini adalah hasil
              penapisan awal atas berkas yang diimpor pengguna, disusun untuk menentukan lokasi mana yang layak
              diverifikasi di lapangan.
            </p>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mb-1">Sumber data</p>
            {provenance ? (
              <p className="text-[12px] text-cream-muted leading-relaxed">
                {provenance.attribution}. Berkas <span className="font-mono">{provenance.fileName}</span>, memuat{' '}
                {provenance.rowCount} titik terbaca
                {provenance.skippedCount > 0 ? ` dan ${provenance.skippedCount} baris yang dilewati` : ''}, diimpor{' '}
                {new Date(provenance.importedAt).toLocaleString('id-ID')}. Data ini adalah snapshot berkas, bukan
                umpan langsung.
              </p>
            ) : (
              <p className="text-[12px] text-cream-muted">Belum ada data yang dimuat.</p>
            )}
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mb-2">Angka pokok</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Titik terbaca', String(summary.total)],
                ['Kepercayaan tinggi', String(summary.byConfidence.high)],
                ['FRP tertinggi', summary.frpMax ? `${summary.frpMax.toFixed(1)} MW` : 'n/a'],
                ['Dalam batas indikatif', String(summary.withinIndicativeBoundary)],
              ].map(([label, value]) => (
                <div key={label} className="panel-sunken p-3">
                  <p className="text-[10px] uppercase tracking-wider text-cream-faint">{label}</p>
                  <p className="font-mono text-lg font-bold text-cream">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-cream-faint mt-2 leading-snug">
              FRP dilaporkan sebagai nilai tertinggi dan median, bukan jumlah. FRP adalah laju daya sesaat, sehingga
              penjumlahan antar waktu dan antar sensor tidak memiliki arti fisik.
            </p>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mb-2">
              Tutupan lahan di bawah titik panas
            </p>
            {summary.imageryAnalysed > 0 ? (
              <>
                <table className="w-full text-[11px]">
                  <tbody>
                    {ALL_INDICATIONS.filter((i) => summary.byIndication[i] > 0).map((i) => (
                      <tr key={i} className="border-b border-espresso-line/50">
                        <td className="py-1.5 text-cream-muted">{INDICATION_SHORT[i]}</td>
                        <td className="py-1.5 font-mono text-cream text-right w-16">{summary.byIndication[i]}</td>
                        <td className="py-1.5 font-mono text-cream-faint text-right w-16">
                          {((summary.byIndication[i] / (summary.total || 1)) * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-cream-faint mt-2 leading-snug">
                  Dibaca otomatis dari citra basemap di tiap koordinat
                  {summary.humanReviewed > 0 ? `, ${summary.humanReviewed} di antaranya dikoreksi manual` : ''}.
                  Pengamatan tutupan lahan, bukan penetapan status izin.
                </p>

                <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mt-4 mb-1">
                  Silang terhadap kawasan konservasi
                </p>
                <p className="text-[10px] text-cream-faint leading-snug mb-1.5">
                  Vegetasi rapat adalah tampilan permukaan; kawasan konservasi adalah status hukum. Keduanya
                  disilangkan agar tidak tertukar. Kolom kawasan hanya mencakup delapan poligon indikatif yang
                  dimuat aplikasi.
                </p>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-cream-faint border-b border-espresso-line">
                      <th className="text-left py-1.5 pr-2 font-semibold">Tutupan lahan</th>
                      <th className="text-right py-1.5 px-2 font-semibold">Dalam batas indikatif</th>
                      <th className="text-right py-1.5 px-2 font-semibold">Dekat batas</th>
                      <th className="text-right py-1.5 pl-2 font-semibold">Di luar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_INDICATIONS.filter((i) => summary.byIndication[i] > 0).map((i) => (
                      <tr key={i} className="border-b border-espresso-line/50">
                        <td className="py-1.5 pr-2 text-cream-muted">{INDICATION_SHORT[i]}</td>
                        <td className={'text-right py-1.5 px-2 font-mono ' + (summary.coverByArea[i].inside > 0 ? 'text-amber-den font-bold' : 'text-cream-faint')}>
                          {summary.coverByArea[i].inside || '·'}
                        </td>
                        <td className="text-right py-1.5 px-2 font-mono text-cream-muted">{summary.coverByArea[i].near || '·'}</td>
                        <td className="text-right py-1.5 pl-2 font-mono text-cream-faint">{summary.coverByArea[i].outside || '·'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-[12px] text-cream-faint">Citra belum dibaca untuk data ini.</p>
            )}
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mb-1">
              Tingkat bahaya kebakaran, Drought Code
            </p>
            {summary.fdrsCovered > 0 ? (
              <>
                <p className="text-[10px] text-cream-faint leading-snug mb-1.5">
                  Kekeringan lapisan organik dalam, disilangkan terhadap posisi pada kawasan konservasi. Pada lahan
                  gambut, kelas Sangat Mudah berarti api berpeluang turun ke bawah permukaan dan bertahan jauh
                  setelah nyala di permukaan padam.
                </p>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-cream-faint border-b border-espresso-line">
                      <th className="text-left py-1.5 pr-2 font-semibold">Kelas bahaya</th>
                      <th className="text-right py-1.5 px-2 font-semibold">Dalam batas indikatif</th>
                      <th className="text-right py-1.5 px-2 font-semibold">Dekat batas</th>
                      <th className="text-right py-1.5 pl-2 font-semibold">Di luar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FDRS_BANDS.filter((b) => summary.byDcBand[b] > 0).map((b) => (
                      <tr key={b} className="border-b border-espresso-line/50">
                        <td className="py-1.5 pr-2 text-cream-muted">{FDRS_BAND_LABEL[b]}</td>
                        <td className={'text-right py-1.5 px-2 font-mono ' + (b === 'sangat_mudah' && summary.dcBandByArea[b].inside > 0 ? 'text-sienna font-bold' : 'text-cream-faint')}>
                          {summary.dcBandByArea[b].inside || '·'}
                        </td>
                        <td className="text-right py-1.5 px-2 font-mono text-cream-muted">{summary.dcBandByArea[b].near || '·'}</td>
                        <td className="text-right py-1.5 pl-2 font-mono text-cream-faint">{summary.dcBandByArea[b].outside || '·'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-cream-faint mt-2 leading-snug">
                  Nilai mentah dari GFWED NASA GISS pada resolusi sekitar 28 km. Ambang kelas mengikuti panel FDRS
                  SIPONGI yang bersumber pada Spartan BMKG: Drought Code {FDRS_THRESHOLDS.dc.join(', ')}. Sel grid
                  jauh lebih kasar daripada jejak piksel titik panas, sehingga nilainya menggambarkan kondisi di
                  sekitar titik.
                </p>
              </>
            ) : (
              <p className="text-[12px] text-cream-faint">Grid FDRS belum dimuat untuk data ini.</p>
            )}
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mb-2">
              Prioritas verifikasi lapangan
            </p>
            {priority.length ? (
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-left text-cream-faint border-b border-espresso-line">
                    <th className="py-1.5 pr-2 font-semibold">Koordinat</th>
                    <th className="py-1.5 pr-2 font-semibold">Waktu</th>
                    <th className="py-1.5 pr-2 font-semibold">FRP</th>
                    <th className="py-1.5 pr-2 font-semibold">Kawasan terdekat</th>
                    <th className="py-1.5 pr-2 font-semibold">Indikasi citra</th>
                    <th className="py-1.5 font-semibold">Bahaya</th>
                  </tr>
                </thead>
                <tbody>
                  {priority.map((h) => (
                    <tr key={h.id} className="border-b border-espresso-line/50">
                      <td className="py-1.5 pr-2 font-mono text-cream-muted">
                        {h.latitude.toFixed(3)}, {h.longitude.toFixed(3)}
                      </td>
                      <td className="py-1.5 pr-2 text-cream-muted">{h.acquisitionDate}</td>
                      <td className="py-1.5 pr-2 font-mono text-cream-muted">{h.frp ? h.frp.toFixed(1) : '-'}</td>
                      <td className="py-1.5 pr-2 text-cream-muted">{h.proximity?.areaName || '-'}</td>
                      <td className="py-1.5 pr-2 text-cream-muted">
                        {h.imagery ? INDICATION_LABEL[h.imagery.indication] : 'belum dicek'}
                      </td>
                      <td className="py-1.5 text-cream-muted">
                        {h.fdrs ? FDRS_BAND_LABEL[h.fdrs.dcBand] : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-[12px] text-cream-faint">Tidak ada titik berkepercayaan tinggi pada data yang dimuat.</p>
            )}
            <p className="text-[10px] text-cream-faint mt-2 leading-snug">
              Urutan ini menandai lokasi yang layak diperiksa lebih dulu. Urutan ini bukan penilaian pelanggaran.
            </p>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mb-2">Batasan</p>
            <ul className="text-[11px] text-cream-muted space-y-1.5 list-disc list-inside leading-relaxed">
              <li>{EVIDENTIARY_NOTE}</li>
              <li>{AREA_LAYER_DISCLAIMER}</li>
              <li>{TENURE_NOTE}</li>
              <li>
                Indikasi tutupan lahan dibaca dari citra basemap yang tanggal perekamannya tidak diketahui dan
                umumnya berbeda jauh dari tanggal kebakaran. Indikasi tersebut menggambarkan kondisi tapak, bukan
                kondisi saat kebakaran, dan bukan penetapan status lahan.
              </li>
              <li>
                Resolusi piksel 375 m untuk VIIRS dan 1 km untuk MODIS. Penentuan di dalam atau di luar batas tidak
                dapat diputuskan pada jarak yang lebih kecil dari setengah jejak piksel.
              </li>
            </ul>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mb-2">
              Definisi kelas tutupan lahan
            </p>
            <div className="space-y-2">
              {ALL_INDICATIONS.filter((i) => summary.byIndication[i] > 0).map((i) => {
                const d = INDICATION_DEFINITION[i];
                return (
                  <div key={i}>
                    <p className="text-[11px] text-cream font-medium">{INDICATION_LABEL[i]}</p>
                    <p className="text-[11px] text-cream-muted leading-snug">
                      <span className="text-cream-faint">Ukuran:</span> {d.criteria}{' '}
                      <span className="text-cream-faint">Artinya:</span> {d.meaning}{' '}
                      <span className="text-sienna">Bukan:</span> {d.notMeaning}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-cream-faint leading-relaxed mt-2">{METHOD_NOTE}</p>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold mb-2">Rujukan hukum</p>
            <ul className="text-[11px] text-cream-muted space-y-1.5">
              {LEGAL_REFERENCES.map((r) => (
                <li key={r.citation}>
                  <span className="text-cream font-medium">{r.citation}</span> — {r.title}. {r.relevance}
                  {r.caution ? ` ${r.caution}` : ''}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-cream-faint mt-2">{INSTITUTIONS.note}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
