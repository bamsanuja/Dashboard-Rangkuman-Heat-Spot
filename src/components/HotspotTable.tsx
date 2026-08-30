import { Download, Eye } from 'lucide-react';
import type { DataProvenance, Hotspot } from '../types';
import { confidenceLabel } from '../utils/sensors';
import { INDICATION_LABEL } from '../utils/imageryIndication';
import { FDRS_BAND_COLOR, FDRS_BAND_LABEL } from '../utils/fdrs';

function toCsv(hotspots: Hotspot[], provenance: DataProvenance | null) {
  const header = [
    'id', 'latitude', 'longitude', 'satelit', 'kepercayaan', 'suhu_kelvin', 'kanal',
    'frp_mw', 'tanggal', 'waktu_utc', 'waktu_lokal', 'provinsi', 'kabupaten',
    'hubungan_kawasan', 'jarak_m', 'ketidakpastian_m', 'indikasi_citra',
    'fdrs_dc', 'fdrs_kelas_dc', 'fdrs_fwi', 'fdrs_tanggal_observasi',
  ];
  const rows = hotspots.map((h) => [
    h.id, h.latitude, h.longitude, h.satellite, confidenceLabel(h.confidence),
    h.brightness.kelvin || '', h.brightness.band, h.frp || '',
    h.acquisitionDate, h.acquisitionTimeUtc, h.acquisitionTimeLocal,
    h.province ?? '', h.district ?? '',
    h.proximity?.relation ?? '', h.proximity?.distanceMeters ?? '', h.proximity?.uncertaintyMeters ?? '',
    h.imagery ? INDICATION_LABEL[h.imagery.indication] : '',
    h.fdrs?.values.dc ?? '', h.fdrs ? FDRS_BAND_LABEL[h.fdrs.dcBand] : '',
    h.fdrs?.values.fwi ?? '', h.fdrs?.observationDate ?? '',
  ]);
  const preamble = [
    `# ${provenance?.attribution ?? 'Sumber tidak diketahui'}`,
    `# Berkas asal: ${provenance?.fileName ?? '-'}`,
    `# Diekspor: ${new Date().toISOString()}`,
    '# Titik panas adalah anomali termal, bukan bukti pembakaran dan bukan penetapan pelaku.',
    '# Kolom hubungan_kawasan mengacu pada poligon indikatif, bukan batas resmi kawasan hutan.',
    '# Kolom fdrs_* berasal dari grid GFWED NASA GISS pada resolusi sekitar 28 km, dikelompokkan memakai ambang SIPONGI/BMKG.',
  ].join('\n');
  return `${preamble}\n${[header, ...rows].map((r) => r.join(',')).join('\n')}`;
}

export default function HotspotTable({
  hotspots,
  provenance,
  onSelect,
}: {
  hotspots: Hotspot[];
  provenance: DataProvenance | null;
  onSelect: (h: Hotspot) => void;
}) {
  const download = () => {
    const blob = new Blob([toCsv(hotspots, provenance)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Filename says what the file is, and does not claim SiPongi origin for
    // columns this app derived.
    a.download = `land-watch-ekspor-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-espresso-line">
        <span className="text-[12px] text-cream-muted font-medium">{hotspots.length} baris</span>
        <button
          onClick={download}
          disabled={!hotspots.length}
          className="inline-flex items-center gap-1.5 text-[12px] text-cream-muted hover:text-amber-den disabled:opacity-40 disabled:hover:text-cream-muted"
        >
          <Download className="w-3.5 h-3.5" />
          Ekspor CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-cream-faint border-b border-espresso-line">
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]">Waktu</th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]">Satelit</th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]">Koordinat</th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]">Kepercayaan</th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]">FRP</th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]">Kawasan terdekat</th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]">Indikasi citra</th>
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]">Bahaya (DC)</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {hotspots.map((h) => (
              <tr key={h.id} className="border-b border-espresso-line/60 hover:bg-espresso-sunken/60">
                <td className="px-4 py-2.5 font-mono text-cream-muted whitespace-nowrap">
                  {h.acquisitionDate}
                  <span className="block text-[10px] text-cream-faint">{h.acquisitionTimeLocal}</span>
                </td>
                <td className="px-4 py-2.5 text-cream-muted whitespace-nowrap">{h.satellite}</td>
                <td className="px-4 py-2.5 font-mono text-cream-faint whitespace-nowrap">
                  {h.latitude.toFixed(3)}, {h.longitude.toFixed(3)}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                    style={{
                      color: h.confidence.level === 'high' ? '#f0a22e' : h.confidence.level === 'nominal' ? '#c3986d' : '#a19574',
                      background: 'rgba(240,162,46,0.10)',
                    }}
                  >
                    {confidenceLabel(h.confidence)}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-cream-muted whitespace-nowrap">
                  {h.frp ? `${h.frp.toFixed(1)} MW` : '-'}
                </td>
                <td className="px-4 py-2.5 text-cream-muted">
                  {h.proximity?.areaName ? (
                    <>
                      <span className="block truncate max-w-[200px]">{h.proximity.areaName}</span>
                      <span className="block text-[10px] text-cream-faint">
                        {h.proximity.relation === 'within_indicative_boundary'
                          ? 'di dalam batas indikatif'
                          : h.proximity.undecidable
                            ? 'terlalu dekat batas untuk ditentukan'
                            : `${h.proximity.distanceMeters} m dari batas indikatif`}
                      </span>
                    </>
                  ) : (
                    <span className="text-cream-faint">-</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-cream-muted">
                  {h.imagery ? INDICATION_LABEL[h.imagery.indication] : <span className="text-cream-faint">belum dicek</span>}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  {h.fdrs ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: FDRS_BAND_COLOR[h.fdrs.dcBand] }} />
                      <span className="text-cream-muted">{FDRS_BAND_LABEL[h.fdrs.dcBand]}</span>
                      <span className="text-[10px] font-mono text-cream-faint">{h.fdrs.values.dc ?? ''}</span>
                    </span>
                  ) : (
                    <span className="text-cream-faint">-</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => onSelect(h)} className="text-cream-faint hover:text-amber-den">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
