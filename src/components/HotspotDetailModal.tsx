import { useState } from 'react';
import { X, ExternalLink, ScanSearch, TriangleAlert, Crosshair } from 'lucide-react';
import type { Hotspot, ImageryReading, LandIndication } from '../types';
import { BAND_LABEL, confidenceLabel, overpassPlausible, SENSOR_SPECS } from '../utils/sensors';
import {
  ALL_INDICATIONS, analyseImagery, copernicusUrl, INDICATION_COLOR, INDICATION_LABEL,
  INDICATION_NOTE, INDICATION_SHORT, tileUrlFor,
} from '../utils/imageryIndication';
import { FDRS_BAND_COLOR, FDRS_BAND_LABEL, FDRS_CODE_LABEL, FDRS_CODE_MEANING, dayGap } from '../utils/fdrs';
import { INDICATIVE_AREAS } from '../data/protectedAreas';

function Row({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-espresso-line/60 last:border-0">
      <span className="text-[10px] uppercase tracking-wider text-cream-faint font-semibold">{label}</span>
      <span className="text-[13px] text-cream">{value}</span>
      {hint && <span className="text-[10px] text-cream-faint leading-snug">{hint}</span>}
    </div>
  );
}

export default function HotspotDetailModal({
  hotspot,
  onClose,
  onImagery,
  onOverride,
}: {
  hotspot: Hotspot | null;
  onClose: () => void;
  onImagery: (id: string, reading: ImageryReading) => void;
  onOverride?: (id: string, indication: LandIndication) => void;
}) {
  // Tracked by id rather than a boolean reset in an effect, so switching
  // hotspots clears the pending state during render.
  const [busyFor, setBusyFor] = useState<string | null>(null);

  if (!hotspot) return null;
  const busy = busyFor === hotspot.id;

  const spec = SENSOR_SPECS[hotspot.satellite];
  const timeOk = overpassPlausible(hotspot.satellite, hotspot.acquisitionTimeUtc, hotspot.longitude);
  const imagery = hotspot.imagery;

  const runImagery = async () => {
    setBusyFor(hotspot.id);
    const reading = await analyseImagery(hotspot.latitude, hotspot.longitude);
    onImagery(hotspot.id, reading);
    setBusyFor(null);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div
        className="panel w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-espresso-raised border-b border-espresso-line px-5 py-3.5 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <h2 className="font-bold text-cream text-[15px]">Rincian titik panas</h2>
            <p className="text-[11px] text-cream-faint font-mono truncate">{hotspot.id}</p>
          </div>
          <button onClick={onClose} className="text-cream-faint hover:text-cream shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid md:grid-cols-2 gap-5">
          <div>
            <h3 className="text-[11px] uppercase tracking-wider text-amber-den font-bold mb-1">Rekaman satelit</h3>
            <Row label="Satelit / sensor" value={hotspot.satellite} hint={`Jejak piksel nominal ${spec.footprintMeters} m`} />
            <Row
              label="Waktu akuisisi"
              value={`${hotspot.acquisitionDate} · ${hotspot.acquisitionTimeLocal}`}
              hint={`${hotspot.acquisitionDateUtc} ${hotspot.acquisitionTimeUtc} UTC · tertulis "${hotspot.acquisitionDateSource} ${hotspot.acquisitionTimeSource}" pada berkas sumber`}
            />
            <Row
              label="Kepercayaan"
              value={confidenceLabel(hotspot.confidence)}
              hint={
                hotspot.confidence.kind === 'percent'
                  ? 'Produk MODIS melaporkan kepercayaan sebagai persentase 0 sampai 100.'
                  : hotspot.family === 'VIIRS'
                    ? 'Produk VIIRS melaporkan kepercayaan secara kategorikal. Tidak ada nilai persen di baliknya.'
                    : 'Produk MODIS aslinya melaporkan persentase 0 sampai 100, tetapi SiPongi+ sudah mengelompokkannya menjadi kategori sebelum menulis berkas. Angka aslinya tidak ada lagi di berkas ini.'
              }
            />
            <Row
              label="Suhu kecerahan"
              value={hotspot.brightness.kelvin ? `${hotspot.brightness.kelvin.toFixed(1)} K` : 'tidak tersedia'}
              hint={BAND_LABEL[hotspot.brightness.band]}
            />
            <Row
              label="Fire Radiative Power"
              value={hotspot.frp ? `${hotspot.frp.toFixed(1)} MW` : 'tidak tersedia'}
              hint="Laju sesaat pada saat perekaman. Tidak dapat dijumlahkan antar waktu atau antar sensor."
            />
            <Row
              label="Koordinat"
              value={`${hotspot.latitude.toFixed(3)}, ${hotspot.longitude.toFixed(3)}`}
              hint={
                hotspot.lowPrecision
                  ? `Berkas sumber hanya menulis ${hotspot.coordDecimals} desimal, sekitar ${hotspot.coordDecimals <= 1 ? '11 km' : '1 km'} atau lebih kasar. Terlalu kasar untuk pembacaan tapak.`
                  : `Pusat piksel. Api berada di suatu tempat dalam kotak ${spec.footprintMeters} m.`
              }
            />
            {(hotspot.province || hotspot.district) && (
              <Row
                label="Wilayah menurut berkas sumber"
                value={[hotspot.district, hotspot.province].filter(Boolean).join(', ')}
                hint="Nilai apa adanya dari berkas. Aplikasi tidak melakukan geocoding sendiri."
              />
            )}

            {hotspot.brightness.saturated && (
              <div className="mt-3 rule-sienna pl-3 py-2 bg-espresso-sunken rounded-r-lg">
                <p className="text-[11px] text-cream-muted">
                  <TriangleAlert className="w-3.5 h-3.5 inline mr-1 text-sienna" />
                  Suhu berada pada atau di atas ambang saturasi kanal ({spec.saturationK} K). Nilai sebenarnya bisa lebih tinggi.
                </p>
              </div>
            )}
            {hotspot.dateShifted && (
              <div className="mt-3 rule-sienna pl-3 py-2 bg-espresso-sunken rounded-r-lg">
                <p className="text-[11px] text-cream-muted leading-snug">
                  Berkas sumber mencatat tanggal {hotspot.acquisitionDateSource}, sedangkan waktu lokal di titik ini
                  jatuh pada {hotspot.acquisitionDate}. Perekamannya melewati tengah malam waktu setempat.
                </p>
              </div>
            )}
            {hotspot.lowPrecision && (
              <div className="mt-3 rule-sienna pl-3 py-2 bg-espresso-sunken rounded-r-lg">
                <p className="text-[11px] text-cream-muted leading-snug">
                  <TriangleAlert className="w-3.5 h-3.5 inline mr-1 text-sienna" />
                  Koordinat titik ini terlalu kasar untuk pembacaan tapak maupun penentuan posisi terhadap batas
                  kawasan. Pembacaan citra dilewati untuk titik seperti ini.
                </p>
              </div>
            )}
            {hotspot.zoneMismatch && (
              <div className="mt-3 rule-olive pl-3 py-2 bg-espresso-sunken rounded-r-lg">
                <p className="text-[11px] text-cream-muted leading-snug">
                  Berkas sumber menandai waktu ini "{hotspot.acquisitionTimeSource}", padahal bujur titik berada di
                  zona {hotspot.acquisitionTimeLocal.split(' ').pop()}. Waktu lokal di atas sudah dihitung ulang dari
                  bujur, dan nilai asli berkas tetap ditampilkan apa adanya.
                </p>
              </div>
            )}
            {!timeOk && (
              <div className="mt-3 rule-sienna pl-3 py-2 bg-espresso-sunken rounded-r-lg">
                <p className="text-[11px] text-cream-muted">
                  <TriangleAlert className="w-3.5 h-3.5 inline mr-1 text-sienna" />
                  Waktu akuisisi berada di luar jendela lintasan yang mungkin untuk platform ini. Periksa kembali berkas sumber.
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-wider text-amber-den font-bold mb-1">Tutupan lahan dari citra</h3>

            <div className="panel-sunken p-3">
              <div className="flex gap-3">
                <img
                  src={imagery?.thumbnail ?? imagery?.tileUrl ?? tileUrlFor(hotspot.latitude, hotspot.longitude)}
                  alt="Citra satelit di lokasi titik panas"
                  className="imagery-swatch w-28 h-28 object-cover shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: INDICATION_COLOR[imagery?.indication ?? 'not_analysed'] }}>
                    {INDICATION_LABEL[imagery?.indication ?? 'not_analysed']}
                    {imagery?.reviewedByHuman ? ' (dikonfirmasi manual)' : ''}
                  </p>
                  {imagery && (
                    <p className="text-[11px] text-cream-muted mt-0.5 font-mono">
                      kekuatan sinyal {(imagery.strength * 100).toFixed(0)}%
                      {imagery.rowSpacingMeters ? ` · jarak tanam ~${imagery.rowSpacingMeters} m` : ''}
                    </p>
                  )}
                  <p className="text-[11px] text-cream-faint mt-1.5 leading-snug">
                    {INDICATION_NOTE[imagery?.indication ?? 'not_analysed']}
                  </p>
                </div>
              </div>

              {!imagery && (
                <button
                  onClick={runImagery}
                  disabled={busy}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-den text-espresso font-semibold text-[12px] px-3 py-2 hover:bg-camel disabled:opacity-50"
                >
                  <ScanSearch className="w-4 h-4" />
                  {busy ? 'Membaca citra...' : 'Periksa citra di titik ini'}
                </button>
              )}

              {imagery && onOverride && (
                <div className="mt-3 pt-3 border-t border-espresso-line">
                  <p className="text-[10px] uppercase tracking-wider text-cream-faint font-semibold mb-1.5">
                    Koreksi pembacaan
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ALL_INDICATIONS.filter((i) => i !== 'not_analysed').map((i) => (
                      <button
                        key={i}
                        onClick={() => onOverride(hotspot.id, i)}
                        className={
                          'px-2 py-1 rounded-md text-[10px] border transition-colors ' +
                          (imagery.indication === i
                            ? 'border-amber-den text-amber-den'
                            : 'border-espresso-line text-cream-faint hover:text-cream-muted')
                        }
                      >
                        {INDICATION_SHORT[i]}
                      </button>
                    ))}
                  </div>
                  {imagery.originalIndication && imagery.originalIndication !== imagery.indication && (
                    <p className="text-[10px] text-cream-faint mt-1.5">
                      Pembacaan mesin semula: {INDICATION_SHORT[imagery.originalIndication]}
                    </p>
                  )}
                </div>
              )}

              {imagery?.metrics && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-[10px] text-cream-faint hover:text-cream-muted">
                    Ukuran yang mendasari pembacaan
                  </summary>
                  <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono text-cream-faint">
                    <div>GRVI {imagery.metrics.grvi}</div>
                    <div>terang {imagery.metrics.brightness}</div>
                    <div>saturasi {imagery.metrics.saturation}</div>
                    <div>kontras {imagery.metrics.contrast}</div>
                    <div>grid {imagery.metrics.gridStrength}</div>
                    <div>periode {imagery.metrics.gridPeriodMeters} m</div>
                  </dl>
                  {imagery.metrics.gridUndetectable && (
                    <p className="text-[10px] text-sienna leading-snug mt-1.5">
                      Resolusi citra di sini terlalu kasar untuk memisahkan tajuk, sehingga pola tanam tidak diuji.
                      Ketiadaan pola tanam di titik ini tidak berarti bukan perkebunan.
                    </p>
                  )}
                </details>
              )}

              {imagery && (
                <p className="mt-3 text-[10px] text-cream-faint leading-snug border-t border-espresso-line pt-2">
                  {imagery.caveat}
                </p>
              )}
            </div>

            <div className="mt-3 rule-olive pl-3 py-2 bg-espresso-sunken rounded-r-lg">
              <p className="text-[11px] text-cream-muted leading-snug">
                Lahan dibakar untuk dibuka, dan tanaman baru muncul dua sampai tiga tahun kemudian. Pada saat
                kebakaran, geometri tanam sering belum ada. Periksa deret waktu sebelum dan sesudah kebakaran
                daripada satu citra saja.
              </p>
            </div>

            <h3 className="text-[11px] uppercase tracking-wider text-amber-den font-bold mt-4 mb-1">
              Tingkat bahaya kebakaran
            </h3>
            {hotspot.fdrs ? (
              <div className="panel-sunken p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: FDRS_BAND_COLOR[hotspot.fdrs.dcBand] }}
                  />
                  <p className="text-[13px] font-semibold text-cream">
                    Drought Code {FDRS_BAND_LABEL[hotspot.fdrs.dcBand]}
                    {hotspot.fdrs.values.dc !== null && hotspot.fdrs.values.dc !== undefined
                      ? ` · ${hotspot.fdrs.values.dc}`
                      : ''}
                  </p>
                </div>
                <p className="text-[10px] text-cream-faint leading-snug mt-1.5">{FDRS_CODE_MEANING.dc}</p>

                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2.5 pt-2.5 border-t border-espresso-line">
                  {(Object.keys(hotspot.fdrs.values) as (keyof typeof hotspot.fdrs.values)[]).map((code) => {
                    const v = hotspot.fdrs?.values[code];
                    return (
                      <div key={code} className="flex justify-between gap-2">
                        <dt className="text-[10px] text-cream-faint truncate" title={FDRS_CODE_LABEL[code]}>
                          {code.toUpperCase()}
                        </dt>
                        <dd className="text-[10px] font-mono text-cream-muted">
                          {v === null || v === undefined ? 'n/a' : v}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                <p className="text-[10px] text-cream-faint leading-snug mt-2.5 pt-2 border-t border-espresso-line">
                  {hotspot.fdrs.source}, observasi {hotspot.fdrs.observationDate}
                  {(() => {
                    const gap = dayGap(hotspot.fdrs.observationDate, hotspot.acquisitionDate);
                    return gap && gap !== 0 ? `, terpaut ${Math.abs(gap)} hari dari akuisisi titik ini` : '';
                  })()}
                  . Sel grid sekitar 28 km, jadi nilainya menggambarkan kondisi di sekitar titik.
                </p>
              </div>
            ) : (
              <p className="text-[12px] text-cream-faint">
                Grid FDRS belum dimuat, atau titik ini di luar cakupan grid.
              </p>
            )}

            <h3 className="text-[11px] uppercase tracking-wider text-amber-den font-bold mt-4 mb-1">Kawasan konservasi terdekat</h3>
            {hotspot.proximity && hotspot.proximity.areaName ? (
              <div className="panel-sunken p-3">
                <p className="text-[13px] text-cream font-medium">{hotspot.proximity.areaName}</p>
                <p className="text-[11px] text-cream-muted">{hotspot.proximity.managingUnit}</p>
                <p className="text-[12px] text-cream-muted mt-2">
                  {hotspot.proximity.relation === 'within_indicative_boundary'
                    ? 'Berada di dalam poligon indikatif kawasan.'
                    : hotspot.proximity.undecidable
                      ? 'Berada terlalu dekat batas untuk ditentukan pada resolusi sensor ini.'
                      : `Sekitar ${hotspot.proximity.distanceMeters} m dari batas indikatif.`}
                </p>
                <p className="text-[10px] text-cream-faint mt-1.5 leading-snug">
                  Ketidakpastian jarak minimal {hotspot.proximity.uncertaintyMeters} m karena setengah jejak piksel.
                  Poligon bersifat indikatif; penentuan di dalam atau di luar kawasan harus mengacu pada SK penetapan
                  kawasan hutan.
                </p>
              </div>
            ) : (
              <div className="panel-sunken p-3">
                <p className="text-[12px] text-cream-muted">
                  Tidak ada di antara {INDICATIVE_AREAS.length} poligon indikatif yang dimuat aplikasi ini berada
                  dalam radius 5 km.
                </p>
                <p className="text-[11px] text-cream-faint leading-snug mt-1.5">
                  Ini bukan berarti titik ini berada di luar kawasan hutan. Aplikasi hanya memuat{' '}
                  {INDICATIVE_AREAS.length} taman nasional dan hutan lindung sebagai contoh, sementara Indonesia
                  punya ribuan kawasan hutan beserta hutan produksi dan areal penggunaan lain. Untuk mengetahui
                  status hukum lokasi ini, rujukannya adalah peta kawasan hutan Kementerian Kehutanan.
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-2">
              <a
                href={copernicusUrl(hotspot.latitude, hotspot.longitude)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-between gap-2 rounded-lg border border-espresso-line px-3 py-2 text-[12px] text-cream-muted hover:border-amber-den hover:text-amber-den"
              >
                Deret waktu Sentinel-2 (Copernicus Browser)
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${hotspot.latitude},${hotspot.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-between gap-2 rounded-lg border border-espresso-line px-3 py-2 text-[12px] text-cream-muted hover:border-amber-den hover:text-amber-den"
              >
                Buka koordinat di peta
                <Crosshair className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <details className="px-5 pb-5">
          <summary className="cursor-pointer text-[11px] text-cream-faint hover:text-cream-muted">
            Baris asli dari berkas sumber
          </summary>
          <pre className="mt-2 panel-sunken p-3 text-[10px] text-cream-muted overflow-x-auto font-mono">
            {JSON.stringify(hotspot.sourceRow, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
