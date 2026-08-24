import React from 'react';
import { 
  Flame, 
  Layers, 
  BarChart3, 
  Table2, 
  FileText, 
  Upload, 
  Download, 
  Radio, 
  ExternalLink,
  PlusCircle
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'analytics' | 'table' | 'report';
  setActiveTab: (tab: 'map' | 'analytics' | 'table' | 'report') => void;
  totalHotspots: number;
  criticalCount: number;
  isLiveSimulating: boolean;
  setIsLiveSimulating: (val: boolean) => void;
  onOpenImporter: () => void;
  onOpenReport: () => void;
  onAddManualPoint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalHotspots,
  criticalCount,
  isLiveSimulating,
  setIsLiveSimulating,
  onOpenImporter,
  onOpenReport,
  onAddManualPoint
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Live Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-red-500/20 text-white font-bold">
              <Flame className="w-6 h-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-slate-950 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-100 tracking-tight">
                  SIPONGI<span className="text-orange-500">·</span><span className="text-emerald-400">WATCH</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  v2.6 GIS
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                Analisis Spasial Zonasi Karhutla
                <a 
                  href="https://sipongi.gakkum.kehutanan.go.id/peta" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-orange-400 hover:text-orange-300 inline-flex items-center gap-0.5 text-[11px] underline decoration-dotted"
                  title="Buka Referensi Sipongi KLHK"
                >
                  Sipongi+ KLHK <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>
          </div>

          {/* Telemetry Status badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiveSimulating(!isLiveSimulating)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                isLiveSimulating 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isLiveSimulating ? 'Live Feed Aktif (Simulasi Telemetri Satelit)' : 'Klik untuk mengaktifkan live feed simulasi'}
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveSimulating ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isLiveSimulating ? 'LIVE FEED ON' : 'LIVE FEED PAUSED'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'map'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Peta GIS</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'table'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Tabel Data</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
              {totalHotspots}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'report'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Laporan</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-red-500/30 text-red-300 border border-red-500/40 font-mono animate-pulse">
                {criticalCount} Kritis
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onAddManualPoint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Tambah Titik Uji Coba Spasial"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Tambah Titik</span>
          </button>

          <button
            onClick={onOpenImporter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Impor Data Hotspot CSV / GeoJSON"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Impor Data</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 transition"
            title="Unduh / Cetak Ringkasan Eksekutif"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor</span>
          </button>
        </div>

      </div>
    </header>
  );
};
