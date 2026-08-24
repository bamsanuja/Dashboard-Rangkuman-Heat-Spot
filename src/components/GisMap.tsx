import React, { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  Popup, 
  CircleMarker, 
  useMap 
} from 'react-leaflet';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Flame, 
  TreePine, 
  Palmtree, 
  Pickaxe, 
  Building2, 
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CONCESSION_POLYGONS } from '../data/concessionsData';
import type { Hotspot } from '../types';

interface GisMapProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenDetails: (hotspot: Hotspot) => void;
}

function MapFlyController({ targetHotspot }: { targetHotspot: Hotspot | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetHotspot) {
      map.flyTo([targetHotspot.latitude, targetHotspot.longitude], 12, {
        duration: 1.5
      });
    }
  }, [targetHotspot, map]);
  return null;
}

export const GisMap: React.FC<GisMapProps> = ({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  onOpenDetails
}) => {
  const [baseMap, setBaseMap] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [showHutanLindung, setShowHutanLindung] = useState<boolean>(true);
  const [showSawit, setShowSawit] = useState<boolean>(true);
  const [showTambang, setShowTambang] = useState<boolean>(true);
  const [showPerkotaan, setShowPerkotaan] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'pins' | 'heat'>('pins');
  const [isLayerPanelOpenMobile, setIsLayerPanelOpenMobile] = useState<boolean>(false);

  const baseTiles = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB &copy; OpenStreetMap'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri World Imagery'
    },
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    }
  };

  const getHotspotColor = (cat: Hotspot['landCategory']) => {
    switch (cat) {
      case 'hutan_lindung': return '#10b981';
      case 'sawit_dalam': return '#f59e0b';
      case 'sawit_sebelah': return '#f97316';
      case 'tambang': return '#a855f7';
      case 'perkotaan': return '#06b6d4';
      default: return '#94a3b8';
    }
  };

  const getHotspotFill = (cat: Hotspot['landCategory']) => {
    switch (cat) {
      case 'hutan_lindung': return '#059669';
      case 'sawit_dalam': return '#d97706';
      case 'sawit_sebelah': return '#ea580c';
      case 'tambang': return '#9333ea';
      case 'perkotaan': return '#0891b2';
      default: return '#64748b';
    }
  };

  return (
    <div className="relative w-full h-[440px] sm:h-[540px] lg:h-[680px] rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl">
      
      {/* Map Container */}
      <MapContainer
        center={[-0.7893, 113.9213]}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        className="w-full h-full z-10"
        scrollWheelZoom={true}
      >
        <TileLayer
          url={baseTiles[baseMap].url}
          attribution={baseTiles[baseMap].attribution}
        />

        <MapFlyController targetHotspot={selectedHotspot} />

        {/* 1. Hutan Lindung Polygons */}
        {showHutanLindung && CONCESSION_POLYGONS.filter(p => p.category === 'hutan_lindung').map((poly) => {
          const latlngs = poly.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
          return (
            <Polygon
              key={poly.id}
              positions={latlngs}
              pathOptions={{
                color: poly.color,
                fillColor: poly.fillColor,
                fillOpacity: 0.25,
                weight: 2,
                dashArray: '4, 4'
              }}
            >
              <Popup>
                <div className="p-2.5 text-xs">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold mb-1">
                    <TreePine className="w-3.5 h-3.5" />
                    <span>{poly.name}</span>
                  </div>
                  <div className="text-slate-300 space-y-0.5 text-[11px]">
                    <p><strong>Pengelola:</strong> {poly.holder}</p>
                    <p><strong>Luas:</strong> {poly.areaHectares.toLocaleString()} Ha</p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 2. Konsesi Sawit Polygons */}
        {showSawit && CONCESSION_POLYGONS.filter(p => p.category === 'sawit').map((poly) => {
          const latlngs = poly.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
          return (
            <Polygon
              key={poly.id}
              positions={latlngs}
              pathOptions={{
                color: poly.color,
                fillColor: poly.fillColor,
                fillOpacity: 0.28,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-2.5 text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-bold mb-1">
                    <Palmtree className="w-3.5 h-3.5" />
                    <span>{poly.name}</span>
                  </div>
                  <div className="text-slate-300 space-y-0.5 text-[11px]">
                    <p><strong>Perusahaan:</strong> {poly.holder}</p>
                    <p><strong>Luas:</strong> {poly.areaHectares.toLocaleString()} Ha</p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 3. Konsesi Tambang Polygons */}
        {showTambang && CONCESSION_POLYGONS.filter(p => p.category === 'tambang').map((poly) => {
          const latlngs = poly.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
          return (
            <Polygon
              key={poly.id}
              positions={latlngs}
              pathOptions={{
                color: poly.color,
                fillColor: poly.fillColor,
                fillOpacity: 0.28,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-2.5 text-xs">
                  <div className="flex items-center gap-1 text-purple-400 font-bold mb-1">
                    <Pickaxe className="w-3.5 h-3.5" />
                    <span>{poly.name}</span>
                  </div>
                  <div className="text-slate-300 space-y-0.5 text-[11px]">
                    <p><strong>Pemegang IUP:</strong> {poly.holder}</p>
                    <p><strong>Luas:</strong> {poly.areaHectares.toLocaleString()} Ha</p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 4. Kawasan Perkotaan Polygons */}
        {showPerkotaan && CONCESSION_POLYGONS.filter(p => p.category === 'perkotaan').map((poly) => {
          const latlngs = poly.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
          return (
            <Polygon
              key={poly.id}
              positions={latlngs}
              pathOptions={{
                color: poly.color,
                fillColor: poly.fillColor,
                fillOpacity: 0.22,
                weight: 1.5,
                dashArray: '2, 2'
              }}
            >
              <Popup>
                <div className="p-2.5 text-xs">
                  <div className="flex items-center gap-1 text-cyan-400 font-bold mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{poly.name}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    <p>Kawasan Pemukiman Penduduk</p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 5. Hotspots Layer */}
        {hotspots.map((h) => {
          const isSelected = selectedHotspot?.id === h.id;
          const color = getHotspotColor(h.landCategory);
          const fill = getHotspotFill(h.landCategory);
          
          const radius = viewMode === 'heat' 
            ? Math.min(20, Math.max(10, h.frp / 7))
            : isSelected ? 11 : Math.min(8, Math.max(5, h.confidence / 16));

          const opacity = viewMode === 'heat' ? 0.35 : 0.9;
          const fillOpacity = viewMode === 'heat' ? 0.6 : (h.confidence >= 80 ? 0.95 : 0.75);

          return (
            <CircleMarker
              key={h.id}
              center={[h.latitude, h.longitude]}
              radius={radius}
              pathOptions={{
                color: isSelected ? '#ffffff' : color,
                fillColor: fill,
                fillOpacity: fillOpacity,
                weight: isSelected ? 3 : (h.confidence >= 80 ? 2 : 1),
                opacity: opacity
              }}
              eventHandlers={{
                click: () => onSelectHotspot(h)
              }}
            >
              <Popup>
                <div className="p-2.5 text-xs w-60">
                  <div className="flex items-center justify-between gap-1 border-b border-slate-700 pb-1.5 mb-1.5">
                    <span className="font-mono font-bold text-slate-200 text-[11px]">
                      {h.id}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      h.confidenceLevel === 'high' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {h.confidence}%
                    </span>
                  </div>

                  <div className={`p-1.5 rounded-lg mb-2 text-[10px] font-medium border ${
                    h.landCategory === 'hutan_lindung' 
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' 
                      : h.landCategory.includes('sawit')
                      ? 'bg-amber-950/70 border-amber-500/40 text-amber-200'
                      : h.landCategory === 'tambang'
                      ? 'bg-purple-950/70 border-purple-500/40 text-purple-200'
                      : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-200'
                  }`}>
                    <div className="font-bold flex items-center gap-1 truncate">
                      <span>{h.landDetail.categoryName}</span>
                    </div>
                    <p className="opacity-90 truncate">{h.landDetail.specificAreaName}</p>
                  </div>

                  <div className="space-y-0.5 text-slate-300 text-[10px] mb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lokasi:</span>
                      <span className="font-semibold truncate">{h.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daya FRP:</span>
                      <span className="font-mono text-orange-400 font-bold">{h.frp} MW</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenDetails(h)}
                    className="w-full py-1 px-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg text-[10px] flex items-center justify-center gap-1 shadow transition"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Investigasi Spasial</span>
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      </MapContainer>

      {/* Floating Basemap & View Mode Selector (Top Right) */}
      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5">
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 shadow-lg bg-slate-950/85">
          <button
            onClick={() => setBaseMap('dark')}
            className={`px-2 py-0.5 text-[10px] rounded-lg font-medium transition ${
              baseMap === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setBaseMap('satellite')}
            className={`px-2 py-0.5 text-[10px] rounded-lg font-medium transition ${
              baseMap === 'satellite' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'
            }`}
          >
            Satelit
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 shadow-lg bg-slate-950/85">
          <button
            onClick={() => setViewMode(viewMode === 'pins' ? 'heat' : 'pins')}
            className={`w-full px-2 py-0.5 text-[10px] rounded-lg font-medium flex items-center justify-center gap-1 transition ${
              viewMode === 'heat' ? 'bg-red-600 text-white font-semibold' : 'bg-orange-600 text-white'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>{viewMode === 'pins' ? 'Mode Pin' : 'Mode Heat'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Layer Selector (Top Left for Mobile / Desktop) */}
      <div className="absolute top-2.5 left-2.5 z-20 glass-panel rounded-2xl shadow-xl bg-slate-950/90 text-xs overflow-hidden">
        
        {/* Toggle Button for Mobile */}
        <button 
          onClick={() => setIsLayerPanelOpenMobile(!isLayerPanelOpenMobile)}
          className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-slate-200"
        >
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-orange-400" />
            <span>Layer Poligon</span>
          </div>
          {isLayerPanelOpenMobile ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 sm:hidden" />}
        </button>

        {/* Layer list */}
        <div className={`p-2 space-y-1 text-[10px] border-t border-slate-800 ${
          isLayerPanelOpenMobile ? 'block' : 'hidden sm:block'
        }`}>
          <button
            onClick={() => setShowHutanLindung(!showHutanLindung)}
            className={`w-full flex items-center justify-between gap-2 px-1.5 py-0.5 rounded ${
              showHutanLindung ? 'text-emerald-300' : 'text-slate-500'
            }`}
          >
            <span>🌲 Hutan Lindung</span>
            {showHutanLindung ? <Eye className="w-2.5 h-2.5 text-emerald-400" /> : <EyeOff className="w-2.5 h-2.5" />}
          </button>

          <button
            onClick={() => setShowSawit(!showSawit)}
            className={`w-full flex items-center justify-between gap-2 px-1.5 py-0.5 rounded ${
              showSawit ? 'text-amber-300' : 'text-slate-500'
            }`}
          >
            <span>🌴 Konsesi Sawit</span>
            {showSawit ? <Eye className="w-2.5 h-2.5 text-amber-400" /> : <EyeOff className="w-2.5 h-2.5" />}
          </button>

          <button
            onClick={() => setShowTambang(!showTambang)}
            className={`w-full flex items-center justify-between gap-2 px-1.5 py-0.5 rounded ${
              showTambang ? 'text-purple-300' : 'text-slate-500'
            }`}
          >
            <span>⛏️ Konsesi Tambang</span>
            {showTambang ? <Eye className="w-2.5 h-2.5 text-purple-400" /> : <EyeOff className="w-2.5 h-2.5" />}
          </button>

          <button
            onClick={() => setShowPerkotaan(!showPerkotaan)}
            className={`w-full flex items-center justify-between gap-2 px-1.5 py-0.5 rounded ${
              showPerkotaan ? 'text-cyan-300' : 'text-slate-500'
            }`}
          >
            <span>🏙️ Perkotaan</span>
            {showPerkotaan ? <Eye className="w-2.5 h-2.5 text-cyan-400" /> : <EyeOff className="w-2.5 h-2.5" />}
          </button>
        </div>

      </div>

      {/* Floating Legend (Bottom Left - Hidden on small mobile to avoid blocking map) */}
      <div className="absolute bottom-2.5 left-2.5 z-20 glass-panel p-2 rounded-2xl shadow-xl bg-slate-950/90 text-[10px] hidden md:block">
        <div className="font-bold text-slate-300 mb-1 flex items-center gap-1">
          <Info className="w-3 h-3 text-orange-400" /> Legenda Lahan
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Hutan Lindung</span>
          <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500" /> Dalam Sawit</span>
          <span className="flex items-center gap-1 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500" /> Buffer Sawit</span>
          <span className="flex items-center gap-1 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-500" /> Tambang</span>
        </div>
      </div>

    </div>
  );
};
