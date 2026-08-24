import React from 'react';
import { 
  X, 
  MapPin, 
  TreePine, 
  Palmtree, 
  Pickaxe, 
  Building2, 
  ShieldAlert, 
  ExternalLink, 
  Zap, 
  Scale, 
  Compass, 
  FileCheck2 
} from 'lucide-react';
import type { Hotspot } from '../types';

interface HotspotDetailModalProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  onZoomToMap: (hotspot: Hotspot) => void;
}

export const HotspotDetailModal: React.FC<HotspotDetailModalProps> = ({
  hotspot,
  onClose,
  onZoomToMap
}) => {
  if (!hotspot) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${hotspot.latitude},${hotspot.longitude}`;
  const sipongiUrl = `https://sipongi.gakkum.kehutanan.go.id/peta`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-card rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700/80 shadow-2xl overflow-hidden bg-slate-950/98 max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        
        {/* Mobile Pull Bar Indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
              hotspot.landCategory === 'hutan_lindung'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : hotspot.landCategory.includes('sawit')
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : hotspot.landCategory === 'tambang'
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}>
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100 font-mono truncate">
                  {hotspot.id}
                </h3>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold ${
                  hotspot.confidenceLevel === 'high'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {hotspot.confidence}%
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Investigasi Spasial & Legalitas Zonasi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          
          {/* Spatial Status Banner */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border ${
            hotspot.landCategory === 'hutan_lindung'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
              : hotspot.landCategory === 'sawit_dalam'
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-100'
              : hotspot.landCategory === 'sawit_sebelah'
              ? 'bg-orange-950/60 border-orange-500/40 text-orange-100'
              : hotspot.landCategory === 'tambang'
              ? 'bg-purple-950/60 border-purple-500/40 text-purple-100'
              : hotspot.landCategory === 'perkotaan'
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-100'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Klasifikasi Zonasi Lahan
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold mt-0.5 flex items-center gap-1.5">
                  {hotspot.landCategory === 'hutan_lindung' && <TreePine className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {hotspot.landCategory.includes('sawit') && <Palmtree className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {hotspot.landCategory === 'tambang' && <Pickaxe className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  {hotspot.landCategory === 'perkotaan' && <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  <span className="truncate">{hotspot.landDetail.categoryName}</span>
                </h4>
                <p className="font-semibold text-[11px] sm:text-xs mt-1 text-slate-200">
                  {hotspot.landDetail.specificAreaName}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] opacity-75">Status:</span>
                <div className="font-mono font-bold text-[10px] sm:text-xs mt-0.5">
                  {hotspot.landDetail.isInside ? (
                    <span className="text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                      DALAM POLIGON
                    </span>
                  ) : (
                    <span className="text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                      BUFFER {hotspot.landDetail.distanceToBoundaryMeters}m
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Legal Liability Note */}
            <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] sm:text-[11px] leading-relaxed">
              <div className="flex items-center gap-1 font-bold mb-0.5">
                <Scale className="w-3 h-3" />
                <span>Analisis Regulasi Lingkungan:</span>
              </div>
              <p className="opacity-95">{hotspot.landDetail.legalNote}</p>
            </div>
          </div>

          {/* Grid Information Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Lokasi Administratif */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>Wilayah Administratif</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[10px] sm:text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Provinsi:</span>
                  <span className="font-semibold">{hotspot.province}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kabupaten/Kota:</span>
                  <span className="font-semibold">{hotspot.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kecamatan:</span>
                  <span className="font-semibold">{hotspot.subdistrict}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Koordinat:</span>
                  <span className="font-mono text-[9px] text-slate-200">
                    {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Parameter Satelit */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Telemetri Sensor Satelit</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[10px] sm:text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Satelit:</span>
                  <span className="font-mono font-semibold text-slate-200">{hotspot.satellite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daya Radiasi (FRP):</span>
                  <span className="font-mono font-bold text-orange-400">{hotspot.frp} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suhu Kecerahan:</span>
                  <span className="font-mono font-semibold">{hotspot.brightness} K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu Akusisi:</span>
                  <span className="font-mono">{hotspot.acquisitionDate} • {hotspot.acquisitionTime}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Pemegang Izin */}
          {hotspot.landDetail.concessionHolder && (
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1 text-[11px]">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Identitas Pemegang Izin</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400 block">Badan Usaha:</span>
                  <span className="font-semibold text-slate-100 truncate block">{hotspot.landDetail.concessionHolder}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jenis Izin:</span>
                  <span className="font-semibold text-slate-100 truncate block">{hotspot.landDetail.permitType || 'Izin Operasi'}</span>
                </div>
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-[11px] transition text-center"
            >
              <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Google Maps</span>
            </a>

            <a
              href={sipongiUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-[11px] transition text-center"
            >
              <ExternalLink className="w-3 h-3 text-orange-400 shrink-0" />
              <span>Portal Sipongi+</span>
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs transition"
          >
            Tutup
          </button>

          <button
            onClick={() => {
              onZoomToMap(hotspot);
              onClose();
            }}
            className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-1.5 text-xs transition"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Lihat di Peta GIS</span>
          </button>
        </div>

      </div>
    </div>
  );
};
