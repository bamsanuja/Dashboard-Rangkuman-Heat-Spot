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
  Info
} from 'lucide-react';
import { CONCESSION_POLYGONS } from '../data/concessionsData';
import type { Hotspot } from '../types';

interface GisMapProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenDetails: (hotspot: Hotspot) => void;
}

// Controller to smoothly animate and center map when a hotspot is selected
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
  // Basemap state
  const [baseMap, setBaseMap] = useState<'dark' | 'satellite' | 'streets'>('dark');

  // Layer visibility toggles
  const [showHutanLindung, setShowHutanLindung] = useState<boolean>(true);
  const [showSawit, setShowSawit] = useState<boolean>(true);
  const [showTambang, setShowTambang] = useState<boolean>(true);
  const [showPerkotaan, setShowPerkotaan] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'pins' | 'heat'>('pins');

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
      case 'hutan_lindung': return '#10b981'; // Emerald
      case 'sawit_dalam': return '#f59e0b';   // Amber
      case 'sawit_sebelah': return '#f97316'; // Bright Orange
      case 'tambang': return '#a855f7';       // Purple
      case 'perkotaan': return '#06b6d4';     // Cyan
      default: return '#94a3b8';              // Slate
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
    <div className="relative w-full h-[640px] lg:h-[720px] rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl">
      
      {/* Map Container */}
      <MapContainer
        center={[-0.7893, 113.9213]} // Centered on Indonesia (Kalimantan)
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

        {/* 1. Hutan Lindung & Konservasi Polygons */}
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
                <div className="p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                    <TreePine className="w-4 h-4" />
                    <span>{poly.name}</span>
                  </div>
                  <div className="text-slate-300 space-y-1">
                    <p><strong>Pengelola:</strong> {poly.holder}</p>
                    <p><strong>Luas Kawasan:</strong> {poly.areaHectares.toLocaleString()} Ha</p>
                    <p><strong>Status Hukum:</strong> {poly.permitType}</p>
                    <p className="text-[11px] text-emerald-300/90 italic mt-1 bg-emerald-950/60 p-1.5 rounded border border-emerald-500/20">
                      {poly.description}
                    </p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 2. Konsesi Perkebunan Sawit Polygons */}
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
                <div className="p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                    <Palmtree className="w-4 h-4" />
                    <span>{poly.name}</span>
                  </div>
                  <div className="text-slate-300 space-y-1">
                    <p><strong>Perusahaan:</strong> {poly.holder}</p>
                    <p><strong>Luas HGU:</strong> {poly.areaHectares.toLocaleString()} Ha</p>
                    <p><strong>Jenis Izin:</strong> {poly.permitType}</p>
                    <p className="text-[11px] text-amber-300/90 italic mt-1 bg-amber-950/60 p-1.5 rounded border border-amber-500/20">
                      {poly.description}
                    </p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 3. Konsesi Pertambangan Polygons */}
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
                <div className="p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                    <Pickaxe className="w-4 h-4" />
                    <span>{poly.name}</span>
                  </div>
                  <div className="text-slate-300 space-y-1">
                    <p><strong>Pemegang IUP:</strong> {poly.holder}</p>
                    <p><strong>Luas Konsesi:</strong> {poly.areaHectares.toLocaleString()} Ha</p>
                    <p><strong>Jenis Komoditas:</strong> {poly.permitType}</p>
                    <p className="text-[11px] text-purple-300/90 italic mt-1 bg-purple-950/60 p-1.5 rounded border border-purple-500/20">
                      {poly.description}
                    </p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 4. Kawasan Perkotaan & Pemukiman Polygons */}
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
                <div className="p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                    <Building2 className="w-4 h-4" />
                    <span>{poly.name}</span>
                  </div>
                  <div className="text-slate-300 space-y-1">
                    <p><strong>Zona:</strong> Kawasan Pemukiman / Urban</p>
                    <p><strong>Perkiraan Luas:</strong> {poly.areaHectares.toLocaleString()} Ha</p>
                    <p className="text-[11px] text-cyan-300/90 italic mt-1 bg-cyan-950/60 p-1.5 rounded border border-cyan-500/20">
                      {poly.description}
                    </p>
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
            ? Math.min(24, Math.max(12, h.frp / 6))
            : isSelected ? 12 : Math.min(9, Math.max(6, h.confidence / 15));

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
                <div className="p-3 text-xs w-64">
                  {/* Header Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-2 mb-2">
                    <span className="font-mono font-bold text-slate-200">
                      {h.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      h.confidenceLevel === 'high' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : h.confidenceLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      Conf: {h.confidence}%
                    </span>
                  </div>

                  {/* Status Analysis Banner */}
                  <div className={`p-2 rounded-lg mb-2.5 text-[11px] font-medium border ${
                    h.landCategory === 'hutan_lindung' 
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' 
                      : h.landCategory === 'sawit_dalam' 
                      ? 'bg-amber-950/70 border-amber-500/40 text-amber-200'
                      : h.landCategory === 'sawit_sebelah'
                      ? 'bg-orange-950/70 border-orange-500/40 text-orange-200'
                      : h.landCategory === 'tambang'
                      ? 'bg-purple-950/70 border-purple-500/40 text-purple-200'
                      : h.landCategory === 'perkotaan'
                      ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    <div className="font-bold flex items-center gap-1 mb-0.5">
                      {h.landCategory === 'hutan_lindung' && <TreePine className="w-3.5 h-3.5 text-emerald-400" />}
                      {h.landCategory.includes('sawit') && <Palmtree className="w-3.5 h-3.5 text-amber-400" />}
                      {h.landCategory === 'tambang' && <Pickaxe className="w-3.5 h-3.5 text-purple-400" />}
                      {h.landCategory === 'perkotaan' && <Building2 className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{h.landDetail.categoryName}</span>
                    </div>
                    <p className="text-[10px] opacity-90">{h.landDetail.specificAreaName}</p>
                  </div>

                  {/* Telemetry info */}
                  <div className="space-y-1 text-slate-300 text-[11px] mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lokasi:</span>
                      <span className="font-semibold text-right">{h.subdistrict}, {h.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Provinsi:</span>
                      <span className="font-semibold">{h.province}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daya Radiasi (FRP):</span>
                      <span className="font-mono text-orange-400 font-bold">{h.frp} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Satelit:</span>
                      <span className="font-mono text-[10px] text-slate-200">{h.satellite}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Koordinat:</span>
                      <span className="font-mono text-[10px]">{h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onOpenDetails(h)}
                    className="w-full py-1.5 px-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Investigasi Detail Spasial</span>
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      </MapContainer>

      {/* Floating Basemap & View Mode Selector (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="glass-panel p-1.5 rounded-xl flex items-center gap-1 shadow-lg bg-slate-950/85">
          <button
            onClick={() => setBaseMap('dark')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              baseMap === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark GIS
          </button>
          <button
            onClick={() => setBaseMap('satellite')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              baseMap === 'satellite' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satelit
          </button>
          <button
            onClick={() => setBaseMap('streets')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              baseMap === 'streets' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Peta Jalan
          </button>
        </div>

        {/* View Mode (Pins vs Heat) */}
        <div className="glass-panel p-1.5 rounded-xl flex items-center gap-1 shadow-lg bg-slate-950/85">
          <button
            onClick={() => setViewMode('pins')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium flex items-center gap-1 transition ${
              viewMode === 'pins' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Titik Pin</span>
          </button>
          <button
            onClick={() => setViewMode('heat')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium flex items-center gap-1 transition ${
              viewMode === 'heat' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Heat Density</span>
          </button>
        </div>
      </div>

      {/* Floating Layer Toggles (Top Left) */}
      <div className="absolute top-4 left-4 z-20 glass-panel p-2.5 rounded-2xl shadow-xl bg-slate-950/90 max-w-[210px] hidden sm:block">
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800">
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-orange-400" /> Layer Poligon
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          {/* Hutan Lindung */}
          <button
            onClick={() => setShowHutanLindung(!showHutanLindung)}
            className={`w-full flex items-center justify-between px-2 py-1 rounded-lg transition ${
              showHutanLindung ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Hutan Lindung</span>
            </div>
            {showHutanLindung ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3" />}
          </button>

          {/* Sawit */}
          <button
            onClick={() => setShowSawit(!showSawit)}
            className={`w-full flex items-center justify-between px-2 py-1 rounded-lg transition ${
              showSawit ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>Konsesi Sawit</span>
            </div>
            {showSawit ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
          </button>

          {/* Tambang */}
          <button
            onClick={() => setShowTambang(!showTambang)}
            className={`w-full flex items-center justify-between px-2 py-1 rounded-lg transition ${
              showTambang ? 'bg-purple-950/50 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
              <span>Konsesi Tambang</span>
            </div>
            {showTambang ? <Eye className="w-3 h-3 text-purple-400" /> : <EyeOff className="w-3 h-3" />}
          </button>

          {/* Perkotaan */}
          <button
            onClick={() => setShowPerkotaan(!showPerkotaan)}
            className={`w-full flex items-center justify-between px-2 py-1 rounded-lg transition ${
              showPerkotaan ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
              <span>Pemukiman Kota</span>
            </div>
            {showPerkotaan ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Floating Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel p-2.5 rounded-2xl shadow-xl bg-slate-950/90 text-xs hidden md:block">
        <div className="font-bold text-slate-300 text-[11px] mb-1.5 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-orange-400" /> Legenda Klasifikasi Titik Api
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
            <span className="text-slate-300">Hutan Lindung / TN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
            <span className="text-slate-300">Dalam HGU Sawit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/30" />
            <span className="text-slate-300">Sebelah / Buffer Sawit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/30" />
            <span className="text-slate-300">Konsesi Tambang</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-cyan-500/30" />
            <span className="text-slate-300">Perkotaan / Pemukiman</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-slate-400/30" />
            <span className="text-slate-300">APL / Non-Konsesi</span>
          </div>
        </div>
      </div>

    </div>
  );
};
