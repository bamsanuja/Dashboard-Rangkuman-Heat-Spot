import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Circle, CircleMarker, Marker, Polygon, Tooltip, LayersControl, useMap, useMapEvent } from 'react-leaflet';
import type { ConfidenceLevel, FireCluster, Hotspot, IndicativeArea, LandIndication } from '../types';
import { INDICATIVE_AREAS, AREA_LAYER_DISCLAIMER } from '../data/protectedAreas';
import { confidenceLabel, CONFIDENCE_WORD } from '../utils/sensors';
import { INDICATION_COLOR, INDICATION_SHORT } from '../utils/imageryIndication';
import { FDRS_BAND_COLOR, FDRS_BAND_LABEL } from '../utils/fdrs';

/**
 * Two variables, two visual channels. Colour carries what the imagery shows,
 * shape carries how confident the satellite product is. Keeping them on
 * separate channels means a reader can answer either question at a glance
 * without the two interfering.
 *
 * Circle for high, square for nominal, triangle for low. Every shape is drawn
 * with a cream halo under a dark stroke so it stays legible over bright cloud
 * and over dark canopy alike, which a single-colour outline does not.
 */
const SHAPE_SIZE: Record<ConfidenceLevel, number> = { high: 16, nominal: 14, low: 13 };

function shapePath(level: ConfidenceLevel, s: number): string {
  const c = s / 2;
  const r = s / 2 - 2.5;
  if (level === 'high') {
    return `<circle cx="${c}" cy="${c}" r="${r}" />`;
  }
  if (level === 'nominal') {
    return `<rect x="${c - r}" y="${c - r}" width="${r * 2}" height="${r * 2}" rx="1.5" />`;
  }
  const h = r * 1.15;
  return `<polygon points="${c},${c - h} ${c + h},${c + h * 0.75} ${c - h},${c + h * 0.75}" />`;
}

const iconCache = new Map<string, L.DivIcon>();

function markerIcon(level: ConfidenceLevel, indication: LandIndication): L.DivIcon {
  const key = `${level}|${indication}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const size = SHAPE_SIZE[level];
  const fill = INDICATION_COLOR[indication];
  const path = shapePath(level, size);
  const html =
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">` +
    `<g fill="none" stroke="#fdf7f2" stroke-width="3.2" stroke-linejoin="round">${path}</g>` +
    `<g fill="${fill}" stroke="#2d2318" stroke-width="1.1" stroke-linejoin="round">${path}</g>` +
    `</svg>`;

  const icon = L.divIcon({
    html,
    className: 'hotspot-shape',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  iconCache.set(key, icon);
  return icon;
}

function Recenter({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 0.8 });
  }, [target, map]);
  return null;
}

function FitToData({ hotspots }: { hotspots: Hotspot[] }) {
  const map = useMap();
  useEffect(() => {
    if (!hotspots.length) return;
    // invalidateSize first. The map mounts inside a tab that is laid out in the
    // same frame, so without this Leaflet fits to a stale container size and
    // leaves the view panned far away from every marker.
    const id = window.setTimeout(() => {
      map.invalidateSize();
      const lats = hotspots.map((h) => h.latitude);
      const lngs = hotspots.map((h) => h.longitude);
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [50, 50], maxZoom: 12 },
      );
    }, 200);
    return () => window.clearTimeout(id);
    // Only refit when the size of the dataset changes, not on every filter tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspots.length]);
  return null;
}

/**
 * Tracks zoom and viewport. A national SiPongi+ export runs to five figures, and
 * that many DOM markers locks the browser, so only what is on screen is drawn
 * and the shape encoding gives way to plain canvas dots past a threshold.
 */
function ViewWatch({ onView }: { onView: (z: number, b: L.LatLngBounds) => void }) {
  const map = useMap();
  useEffect(() => {
    onView(map.getZoom(), map.getBounds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useMapEvent('moveend', (e) => onView(e.target.getZoom(), e.target.getBounds()));
  return null;
}

/** Above this many points in view, drop to canvas dots and say so. */
const SHAPE_CAP = 1200;

const LEGEND: LandIndication[] = [
  'plantation_pattern',
  'closed_canopy',
  'open_vegetation',
  'cleared_or_excavated',
  'settlement',
  'cloud_obscured',
  'not_analysed',
];

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['high', 'nominal', 'low'];

export default function GisMap({
  hotspots,
  clusters = [],
  clusterView = false,
  onToggleClusterView,
  onSelect,
  onSelectCluster,
  flyTo = null,
  areas = INDICATIVE_AREAS,
}: {
  hotspots: Hotspot[];
  clusters?: FireCluster[];
  clusterView?: boolean;
  onToggleClusterView?: (v: boolean) => void;
  onSelect: (h: Hotspot) => void;
  onSelectCluster?: (c: FireCluster) => void;
  flyTo?: [number, number] | null;
  areas?: IndicativeArea[];
}) {
  const [zoom, setZoom] = useState(5);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [ready, setReady] = useState(false);
  const polygons = useMemo(
    () => areas.map((a) => ({ area: a, latlngs: a.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]) })),
    [areas],
  );
  const visible = useMemo(() => {
    if (!bounds) return hotspots.slice(0, SHAPE_CAP);
    return hotspots.filter((h) => bounds.contains([h.latitude, h.longitude]));
  }, [hotspots, bounds]);

  const visibleClusters = useMemo(() => {
    if (!bounds) return clusters.slice(0, SHAPE_CAP);
    return clusters.filter((c) => bounds.contains([c.latitude, c.longitude]));
  }, [clusters, bounds]);

  const dense = !clusterView && visible.length > SHAPE_CAP;
  const showFootprints = zoom >= 13 && !dense && !clusterView;

  return (
    <div className="relative panel overflow-hidden" style={{ height: '68vh', minHeight: 420 }}>
      <MapContainer
        center={[-1.5, 113]}
        zoom={5}
        className="w-full h-full"
        preferCanvas
        whenReady={() => setReady(true)}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Citra satelit">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri World Imagery"
              maxZoom={18}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Peta gelap">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap, &copy; CARTO'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {polygons.map(({ area, latlngs }) => (
          <Polygon
            key={area.id}
            positions={latlngs}
            pathOptions={{ color: '#fdf7f2', weight: 1.5, fillColor: '#a19574', fillOpacity: 0.08, dashArray: '6 5' }}
          >
            <Tooltip sticky>
              <div className="p-2 max-w-[260px]">
                <p className="font-semibold text-cream text-[12px]">{area.name}</p>
                <p className="text-[11px] text-cream-muted mt-0.5">{area.managingUnit}</p>
                <p className="text-[11px] text-cream-faint mt-1 font-mono">
                  {area.officialAreaHectares.toLocaleString('id-ID')} ha
                </p>
                <p className="text-[10px] text-cream-faint mt-1 leading-snug">{area.geometryCaveat}</p>
              </div>
            </Tooltip>
          </Polygon>
        ))}

        {/* True sensor footprint, shown once the map is zoomed in far enough
            that it is bigger than the marker and therefore honest. */}
        {showFootprints &&
          visible.map((h) => (
            <Circle
              key={`fp-${h.id}`}
              center={[h.latitude, h.longitude]}
              radius={h.footprintMeters / 2}
              pathOptions={{
                color: INDICATION_COLOR[h.imagery?.indication ?? 'not_analysed'],
                weight: 1,
                fillOpacity: 0.12,
                dashArray: '3 3',
              }}
              interactive={false}
            />
          ))}

        {/* Tampilan gugus: satu lingkaran per kejadian, luasnya sebanding dengan
            akar jumlah deteksi, sehingga gugus 451 tidak menenggelamkan peta. */}
        {clusterView &&
          visibleClusters.map((c) => (
            <CircleMarker
              key={c.id}
              center={[c.latitude, c.longitude]}
              radius={Math.min(26, 3 + Math.sqrt(c.size) * 1.6)}
              pathOptions={{
                color: '#fdf7f2',
                weight: 1,
                fillColor: FDRS_BAND_COLOR[c.worstDcBand],
                fillOpacity: 0.6,
              }}
              eventHandlers={{ click: () => onSelectCluster?.(c) }}
            >
              <Tooltip direction="top">
                <div className="p-2">
                  <p className="text-[12px] font-bold text-amber-den">{c.size} deteksi</p>
                  <p className="text-[11px] text-cream">
                    {c.districts[0] ?? 'wilayah tidak tercatat'}
                    {c.provinces[0] ? `, ${c.provinces[0]}` : ''}
                  </p>
                  <p className="text-[11px] text-cream-muted">
                    bentangan {c.spanKm} km · {c.passes} lintasan
                  </p>
                  <p className="text-[11px] text-cream-muted">
                    Bahaya {FDRS_BAND_LABEL[c.worstDcBand]}
                    {c.dominantCover ? ` · ${INDICATION_SHORT[c.dominantCover]}` : ''}
                  </p>
                  {c.insideAreaCount > 0 && (
                    <p className="text-[10px] text-amber-den mt-1">
                      {c.insideAreaCount} titik dalam {c.areaName}
                    </p>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

        {/* Dense view: canvas dots, colour only. Shapes cost a DOM node each. */}
        {!clusterView && dense &&
          visible.map((h) => (
            <CircleMarker
              key={`d-${h.id}`}
              center={[h.latitude, h.longitude]}
              radius={3.5}
              pathOptions={{
                color: '#2d2318',
                weight: 0.6,
                fillColor: INDICATION_COLOR[h.imagery?.indication ?? 'not_analysed'],
                fillOpacity: 0.9,
              }}
              eventHandlers={{ click: () => onSelect(h) }}
            />
          ))}

        {!clusterView && !dense && visible.map((h) => {
          const indication = h.imagery?.indication ?? 'not_analysed';
          return (
            <Marker
              key={h.id}
              position={[h.latitude, h.longitude]}
              icon={markerIcon(h.confidence.level, indication)}
              eventHandlers={{ click: () => onSelect(h) }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div className="p-2">
                  <p className="text-[11px] font-semibold" style={{ color: INDICATION_COLOR[indication] }}>
                    {INDICATION_SHORT[indication]}
                    {h.imagery?.reviewedByHuman ? ' (dikonfirmasi)' : ''}
                  </p>
                  <p className="text-[11px] text-cream-muted">Kepercayaan {confidenceLabel(h.confidence)}</p>
                  <p className="font-mono text-[10px] text-cream-faint mt-1">{h.satellite}</p>
                  <p className="text-[11px] text-cream">
                    {h.acquisitionDate} · {h.acquisitionTimeLocal}
                  </p>
                  <p className="text-[10px] text-cream-faint mt-1">Jejak piksel {h.footprintMeters} m</p>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {ready && <FitToData hotspots={hotspots} />}
        <Recenter target={flyTo} />
        <ViewWatch
          onView={(z, b) => {
            setZoom(z);
            setBounds(b);
          }}
        />
      </MapContainer>

      {onToggleClusterView && (
        <div className="absolute top-3 left-3 z-[500] panel-sunken px-1 py-1 flex">
          {[
            { v: false, label: `Titik (${hotspots.length.toLocaleString('id-ID')})` },
            { v: true, label: `Gugus (${clusters.length.toLocaleString('id-ID')})` },
          ].map((o) => (
            <button
              key={String(o.v)}
              onClick={() => onToggleClusterView(o.v)}
              className={
                'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ' +
                (clusterView === o.v ? 'bg-amber-den text-espresso' : 'text-cream-faint hover:text-cream')
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-[500] panel-sunken px-3 py-2.5 max-w-[330px]">
        <p className="text-[10px] uppercase tracking-wider text-cream-faint font-semibold mb-1.5">
          {clusterView ? 'Warna = kelas bahaya terberat dalam gugus' : 'Warna = tutupan lahan pada citra'}
        </p>
        <div className={'grid gap-x-3 gap-y-1 ' + (clusterView ? 'grid-cols-2' : 'grid-cols-2')}>
          {clusterView
            ? (['sangat_mudah', 'mudah', 'tidak_mudah', 'aman', 'tidak_ada_data'] as const).map((b) => (
                <div key={b} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: FDRS_BAND_COLOR[b], boxShadow: '0 0 0 1.5px #fdf7f2' }}
                  />
                  <span className="text-[10px] text-cream-muted truncate">{FDRS_BAND_LABEL[b]}</span>
                </div>
              ))
            : LEGEND.map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: INDICATION_COLOR[i], boxShadow: '0 0 0 1.5px #fdf7f2' }}
              />
              <span className="text-[10px] text-cream-muted truncate">{INDICATION_SHORT[i]}</span>
            </div>
          ))}
        </div>

        {clusterView && (
          <p className="text-[10px] text-cream-faint leading-snug mt-2">
            Luas lingkaran sebanding dengan akar jumlah deteksi. Gugus berisi satu deteksi tetap digambar,
            berukuran paling kecil.
          </p>
        )}

        {!clusterView && (
          <p className="text-[10px] uppercase tracking-wider text-cream-faint font-semibold mt-2.5 mb-1.5">
            Bentuk = tingkat kepercayaan deteksi
          </p>
        )}
        <div className={'items-center gap-3.5 ' + (clusterView ? 'hidden' : 'flex')}>
          {CONFIDENCE_LEVELS.map((level) => (
            <div key={level} className="flex items-center gap-1.5">
              <span
                className="shrink-0 inline-flex"
                dangerouslySetInnerHTML={{
                  __html:
                    `<svg width="14" height="14" viewBox="0 0 16 16">` +
                    `<g fill="none" stroke="#fdf7f2" stroke-width="3.2" stroke-linejoin="round">${shapePath(level, 16)}</g>` +
                    `<g fill="#cbbba6" stroke="#2d2318" stroke-width="1.1" stroke-linejoin="round">${shapePath(level, 16)}</g>` +
                    `</svg>`,
                }}
              />
              <span className="text-[10px] text-cream-muted">{CONFIDENCE_WORD[level]}</span>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-cream-faint leading-snug mt-2 pt-2 border-t border-espresso-line">
          {dense
            ? `${visible.length.toLocaleString('id-ID')} titik dalam tampilan. Perbesar peta sampai di bawah ${SHAPE_CAP.toLocaleString('id-ID')} titik untuk melihat bentuk dan jejak piksel.`
            : showFootprints
              ? 'Lingkaran putus-putus adalah jejak piksel sensor yang sebenarnya.'
              : 'Perbesar peta untuk melihat jejak piksel sensor yang sebenarnya.'}{' '}
          {AREA_LAYER_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
