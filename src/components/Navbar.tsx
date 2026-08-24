import React, { useState } from 'react';
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
  PlusCircle,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Brand Logo & Live Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md shadow-red-500/20 text-white font-bold shrink-0">
              <Flame className="w-4 h-4 sm:w-6 sm:h-6 animate-pulse" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-slate-950 rounded-full animate-ping" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-lg text-slate-100 tracking-tight truncate">
                  SIPONGI<span className="text-orange-500">·</span><span className="text-emerald-400">WATCH</span>
                </span>
                <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  v2.6 GIS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 truncate">
                Zonasi Karhutla
                <a 
                  href="https://sipongi.gakkum.kehutanan.go.id/peta" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-orange-400 hover:text-orange-300 inline-flex items-center gap-0.5 text-[10px] underline decoration-dotted ml-1"
                >
                  Sipongi+ <ExternalLink className="w-2 h-2" />
                </a>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile, mobile uses Bottom Bar) */}
          <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'table'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Tabel</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
                {totalHotspots}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'report'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Laporan</span>
              {criticalCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-red-500/30 text-red-300 border border-red-500/40 font-mono animate-pulse">
                  {criticalCount}
                </span>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Live simulation toggle button */}
            <button
              onClick={() => setIsLiveSimulating(!isLiveSimulating)}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-full text-[11px] font-medium border transition-all ${
                isLiveSimulating 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
              title="Toggle Live Satelit"
            >
              <Radio className={`w-3 h-3 ${isLiveSimulating ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isLiveSimulating ? 'LIVE' : 'PAUSED'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onAddManualPoint}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Uji Titik</span>
              </button>

              <button
                onClick={onOpenImporter}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Impor</span>
              </button>

              <button
                onClick={onOpenReport}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor</span>
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Quick Actions Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 pt-2 border-t border-slate-800 grid grid-cols-3 gap-1.5 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => {
                onAddManualPoint();
                setMobileMenuOpen(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-200"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400 mb-0.5" />
              <span>Uji Titik</span>
            </button>
            <button
              onClick={() => {
                onOpenImporter();
                setMobileMenuOpen(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-200"
            >
              <Upload className="w-4 h-4 text-cyan-400 mb-0.5" />
              <span>Impor Data</span>
            </button>
            <button
              onClick={() => {
                onOpenReport();
                setMobileMenuOpen(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-200"
            >
              <Download className="w-4 h-4 text-orange-400 mb-0.5" />
              <span>Ekspor PDF</span>
            </button>
          </div>
        )}

      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for Smartphones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'map' 
                ? 'text-orange-400 bg-orange-500/10 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Peta GIS</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'analytics' 
                ? 'text-orange-400 bg-orange-500/10 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl relative transition ${
              activeTab === 'table' 
                ? 'text-orange-400 bg-orange-500/10 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table2 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Tabel</span>
            <span className="absolute top-1 right-4 w-1.5 h-1.5 rounded-full bg-orange-400" />
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl relative transition ${
              activeTab === 'report' 
                ? 'text-orange-400 bg-orange-500/10 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Laporan</span>
            {criticalCount > 0 && (
              <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

        </div>
      </nav>
    </>
  );
};
