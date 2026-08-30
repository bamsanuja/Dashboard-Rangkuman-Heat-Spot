import { Layers, TriangleAlert, Check, X } from 'lucide-react';
import type { FireCluster } from '../types';
import { CLUSTER_RADII, LADDER_LABEL, LADDER_NOTE, type Ladder } from '../utils/clustering';
import { INDICATION_SHORT, INDICATION_COLOR } from '../utils/imageryIndication';
import { FDRS_BAND_COLOR, FDRS_BAND_LABEL } from '../utils/fdrs';

/**
 * Tangga bukti sebagai angka utama, menggantikan satu bilangan tunggal.
 *
 * Jumlah deteksi adalah angka yang paling sering salah dikutip, karena satu
 * kebakaran besar menyumbang ratusan piksel sementara satu deteksi soliter
 * menyumbang satu. Menampilkan seluruh tangga membuat pilihan analis terlihat,
 * dan penggeser radius membuat kerapuhan angkanya terlihat juga.
 */
export default function ClusterPanel({
  ladder,
  clusters,
  radius,
  onRadius,
  minSize,
  onMinSize,
  onSelectCluster,
}: {
  ladder: Ladder;
  clusters: FireCluster[];
  radius: number;
  onRadius: (r: number) => void;
  minSize: number;
  onMinSize: (n: number) => void;
  onSelectCluster: (c: FireCluster) => void;
}) {
  const top = clusters.slice(0, 8);
  const solitary = ladder.steps[0].clusters - ladder.steps[1].clusters;

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-[12px] font-bold text-cream flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-den" />
            Deteksi, gugus, dan kejadian
          </h3>
          <p className="text-[10px] text-cream-faint leading-snug mt-0.5 max-w-2xl">
            Satu kebakaran besar menghasilkan ratusan piksel panas, dan satu deteksi soliter menghasilkan satu.
            Tangga di bawah menaikkan syarat bukti selangkah demi selangkah, sehingga Anda bisa memilih angka mana
            yang layak Anda pertahankan.
          </p>
        </div>

        <label className="flex items-center gap-2 text-[11px] text-cream-muted shrink-0">
          Radius gugus
          <select
            value={radius}
            onChange={(e) => onRadius(Number(e.target.value))}
            className="bg-espresso-sunken border border-espresso-line rounded-lg px-2 py-1.5 text-[12px] text-cream font-mono focus:outline-none focus:border-amber-den"
          >
            {CLUSTER_RADII.map((r) => (
              <option key={r} value={r}>{r} m</option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-[10px] text-cream-faint mb-2">
        Klik salah satu anak tangga untuk menyaring seluruh dasbor ke tingkat bukti itu. Peta, tabel, lembar citra,
        dan laporan ikut menyempit.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="panel-sunken p-3">
          <p className="text-[10px] uppercase tracking-wider text-cream-faint">Deteksi satelit</p>
          <p className="font-mono text-xl font-bold text-cream-muted leading-none mt-1">
            {ladder.detections.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-cream-faint mt-1.5 leading-snug">Jumlah piksel, bukan jumlah kebakaran.</p>
        </div>

        {ladder.steps.map((step) => {
          const active = minSize === step.minSize;
          const headline = step.minSize === 4;
          const share = ladder.detections ? (step.detections / ladder.detections) * 100 : 0;
          return (
            <button
              key={step.minSize}
              onClick={() => onMinSize(active ? 1 : step.minSize)}
              className={
                'panel-sunken p-3 text-left transition-colors ' +
                (active ? 'bg-amber-den/12' : 'hover:bg-espresso-line/40')
              }
              style={{ borderColor: active ? '#f0a22e' : headline ? 'rgba(240,162,46,0.45)' : undefined }}
            >
              <p className="text-[10px] uppercase tracking-wider text-cream-faint flex items-start gap-1">
                {active && <Check className="w-3 h-3 text-amber-den shrink-0 mt-px" />}
                {LADDER_LABEL[step.minSize]}
              </p>
              <p
                className="font-mono text-xl font-bold leading-none mt-1"
                style={{ color: active || headline ? '#f0a22e' : '#fdf7f2' }}
              >
                {step.clusters.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] font-mono text-cream-faint mt-0.5">
                {step.detections.toLocaleString('id-ID')} deteksi · {share.toFixed(0)}%
              </p>
              <p className="text-[10px] text-cream-faint mt-1.5 leading-snug">{LADDER_NOTE[step.minSize]}</p>
            </button>
          );
        })}
      </div>

      {minSize > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rule-amber pl-3 py-1.5">
          <p className="text-[11px] text-cream-muted leading-snug flex-1 min-w-[240px]">
            Dasbor sedang dipersempit ke gugus berisi minimal {minSize} deteksi.{' '}
            {clusters.length.toLocaleString('id-ID')} gugus dan{' '}
            {clusters.reduce((s, c) => s + c.size, 0).toLocaleString('id-ID')} deteksi yang ditampilkan. Sisanya
            tetap ada di berkas, hanya tidak sedang ditampilkan.
          </p>
          <button
            onClick={() => onMinSize(1)}
            className="inline-flex items-center gap-1 text-[11px] text-cream-faint hover:text-amber-den shrink-0"
          >
            <X className="w-3 h-3" />
            Tampilkan semua lagi
          </button>
        </div>
      )}

      <div className={'rule-olive pl-3 py-1.5 ' + (minSize > 1 ? 'mt-2' : 'mt-3')}>
        <p className="text-[11px] text-cream-muted leading-snug">
          Pada radius {radius} m, {solitary.toLocaleString('id-ID')} dari{' '}
          {ladder.steps[0].clusters.toLocaleString('id-ID')} gugus hanya berisi satu deteksi. Gugus itu tetap
          ditampilkan dan tetap bisa dibuka, karena menyembunyikannya sama saja dengan memutuskan diam-diam bahwa
          semuanya bukan kebakaran. Ubah radius di atas untuk melihat seberapa peka angka ini terhadap satu
          parameter yang tidak punya jawaban benar.
        </p>
      </div>

      {top.length > 0 && (
        <div className="mt-4 pt-4 border-t border-espresso-line">
          <h4 className="text-[11px] font-bold text-cream mb-2">Gugus terbesar</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[600px]">
              <thead>
                <tr className="text-left text-cream-faint border-b border-espresso-line">
                  <th className="py-1.5 pr-2 font-semibold">Deteksi</th>
                  <th className="py-1.5 pr-2 font-semibold">Lokasi</th>
                  <th className="py-1.5 pr-2 font-semibold">Bentangan</th>
                  <th className="py-1.5 pr-2 font-semibold">Lintasan</th>
                  <th className="py-1.5 pr-2 font-semibold">Tutupan</th>
                  <th className="py-1.5 font-semibold">Bahaya</th>
                </tr>
              </thead>
              <tbody>
                {top.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCluster(c)}
                    className="border-b border-espresso-line/50 hover:bg-espresso-sunken/60 cursor-pointer"
                  >
                    <td className="py-1.5 pr-2 font-mono text-amber-den font-bold">{c.size}</td>
                    <td className="py-1.5 pr-2 text-cream-muted">
                      <span className="block truncate max-w-[220px]">
                        {c.districts[0] ?? '-'}
                        {c.provinces[0] ? `, ${c.provinces[0]}` : ''}
                      </span>
                      {c.insideAreaCount > 0 && (
                        <span className="block text-[10px] text-amber-den">
                          {c.insideAreaCount} titik dalam {c.areaName}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 font-mono text-cream-faint">{c.spanKm} km</td>
                    <td className="py-1.5 pr-2 font-mono text-cream-muted">{c.passes}</td>
                    <td className="py-1.5 pr-2">
                      {c.dominantCover ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-sm shrink-0"
                            style={{ background: INDICATION_COLOR[c.dominantCover] }}
                          />
                          <span className="text-cream-muted">{INDICATION_SHORT[c.dominantCover]}</span>
                        </span>
                      ) : (
                        <span className="text-cream-faint">belum dicek</span>
                      )}
                    </td>
                    <td className="py-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-sm shrink-0"
                          style={{ background: FDRS_BAND_COLOR[c.worstDcBand] }}
                        />
                        <span className="text-cream-muted">{FDRS_BAND_LABEL[c.worstDcBand]}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-cream-faint mt-2 leading-snug">
            <TriangleAlert className="w-3 h-3 inline mr-1 text-camel" />
            Kolom lintasan menghitung berapa kali satelit berbeda atau waktu berbeda melihat gugus ini. Nilai lebih
            dari satu berarti api masih menyala di antara dua lintasan, dan itu bukti yang jauh lebih kuat daripada
            jumlah piksel dalam satu lintasan.
          </p>
        </div>
      )}
    </div>
  );
}
