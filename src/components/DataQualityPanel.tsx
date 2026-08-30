import { useState } from 'react';
import { ShieldQuestion, ChevronDown } from 'lucide-react';
import type { Summary } from '../types';

/**
 * Apa yang aplikasi ubah dari berkas sumber, dan apa yang tidak.
 *
 * Panel ini ada karena "sudah dibersihkan otomatis" adalah jawaban yang
 * berbahaya. Tidak ada baris yang dibuang diam-diam dan tidak ada nilai yang
 * ditebak. Yang dilakukan aplikasi hanya menerjemahkan penulisan, dan setiap
 * terjemahan itu tetap merupakan penafsiran yang perlu Anda ketahui.
 */
export default function DataQualityPanel({ summary }: { summary: Summary }) {
  const [open, setOpen] = useState(false);
  const families = Object.entries(summary.byFamily);
  const mixed = families.length > 1;
  const issues = summary.lowPrecisionCount + summary.dateShiftedCount + summary.zoneMismatchCount;
  if (!issues && !mixed) return null;

  return (
    <div className="panel">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
      >
        <ShieldQuestion className="w-4 h-4 text-camel shrink-0" />
        <span className="text-[12px] font-bold text-cream">Yang aplikasi ubah dari berkas sumber</span>
        <span className="text-[11px] text-cream-faint">
          {summary.zoneMismatchCount > 0 && `${summary.zoneMismatchCount} zona waktu`}
          {summary.dateShiftedCount > 0 && ` · ${summary.dateShiftedCount} tanggal`}
          {summary.lowPrecisionCount > 0 && ` · ${summary.lowPrecisionCount} koordinat kasar`}
        </span>
        <ChevronDown className={'w-4 h-4 text-cream-faint ml-auto shrink-0 transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-espresso-line pt-3">
          <p className="text-[11px] text-cream-muted leading-relaxed">
            Tidak ada baris yang dibuang diam-diam, dan tidak ada nilai yang ditebak. Baris yang tidak terbaca
            dilewati dan dihitung dengan alasannya. Selebihnya hanya diterjemahkan penulisannya, dan nilai asli
            dari berkas tetap tersimpan pada tiap titik.
          </p>

          <dl className="space-y-2.5 text-[11px]">
            {summary.zoneMismatchCount > 0 && (
              <div className="rule-olive pl-3">
                <dt className="text-cream font-medium">
                  {summary.zoneMismatchCount} titik: label zona waktu diperbaiki
                </dt>
                <dd className="text-cream-muted leading-snug">
                  SiPongi+ menandai setiap baris WIB, termasuk titik di wilayah WITA dan WIT. Waktu lokal dihitung
                  ulang dari bujur titik. String asli tetap ditampilkan di panel rincian.
                </dd>
              </div>
            )}

            {summary.dateShiftedCount > 0 && (
              <div className="rule-sienna pl-3">
                <dt className="text-cream font-medium">
                  {summary.dateShiftedCount} titik: tanggal lokalnya berbeda dari berkas
                </dt>
                <dd className="text-cream-muted leading-snug">
                  Perekaman lewat tengah malam waktu setempat jatuh pada tanggal lokal yang lain. Aplikasi
                  mengelompokkan menurut tanggal lokal, sehingga jumlah per tanggal di sini bisa berbeda dari
                  rekapitulasi SiPongi+. Bandingkan totalnya, bukan angka hariannya.
                </dd>
              </div>
            )}

            {summary.lowPrecisionCount > 0 && (
              <div className="rule-sienna pl-3">
                <dt className="text-cream font-medium">
                  {summary.lowPrecisionCount} titik: koordinat lebih kasar dari satu kilometer
                </dt>
                <dd className="text-cream-muted leading-snug">
                  Berkas menulis koordinatnya dengan kurang dari tiga desimal. Titik-titik itu tetap dimuat dan
                  ditandai, tetapi dilewati saat pembacaan citra, dan posisinya terhadap batas kawasan tidak dapat
                  dipertanggungjawabkan.
                </dd>
              </div>
            )}

            {mixed && (
              <div className="rule-olive pl-3">
                <dt className="text-cream font-medium">Tingkat kepercayaan lintas platform tidak setara</dt>
                <dd className="text-cream-muted leading-snug">
                  {families.map(([fam, v]) => `${fam} ${((v.high / v.total) * 100).toFixed(0)}% Tinggi`).join(', ')}.
                  Selisih ini berasal dari algoritma yang berbeda, bukan dari api yang berbeda. Menyaring "Tinggi"
                  lintas platform akan condong ke keluarga sensor yang ambangnya lebih longgar.
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
