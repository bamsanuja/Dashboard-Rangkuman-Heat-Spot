import React from 'react';
import { 
  TreePine, 
  Palmtree, 
  Pickaxe, 
  Building2, 
  Flame, 
  AlertTriangle,
  Zap,
  TrendingUp
} from 'lucide-react';
import type { FilterState, SpatialSummary } from '../types';

interface SummaryCardsProps {
  summary: SpatialSummary;
  filter: FilterState;
  onFilterCategory: (category: FilterState['landCategory']) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  filter,
  onFilterCategory
}) => {
  const getPercentage = (val: number) => {
    if (summary.total === 0) return '0%';
    return `${Math.round((val / summary.total) * 100)}%`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5 mb-4 sm:mb-5">
      
      {/* 1. Hutan Lindung & Konservasi */}
      <div 
        onClick={() => onFilterCategory(filter.landCategory === 'hutan_lindung' ? 'all' : 'hutan_lindung')}
        className={`glass-panel-card p-3 sm:p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.02] border ${
          filter.landCategory === 'hutan_lindung'
            ? 'ring-2 ring-emerald-400 border-emerald-500 bg-emerald-950/50 shadow-lg shadow-emerald-500/20'
            : 'border-emerald-500/30 hover:border-emerald-400/60 bg-gradient-to-br from-emerald-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full mb-1.5 truncate">
              <TreePine className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Hutan Lindung
            </span>
            <div className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
              {summary.hutanLindung}
              <span className="text-[10px] sm:text-xs font-normal text-emerald-400 font-mono">
                ({getPercentage(summary.hutanLindung)})
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              TN & Cagar Alam
            </p>
          </div>
          <div className="hidden sm:block p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <TreePine className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[10px] sm:text-[11px]">
          <span className="flex items-center gap-0.5 text-red-400 font-medium truncate">
            <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Lindung
          </span>
          <span className="text-emerald-400 font-semibold font-mono text-[9px] sm:text-[11px]">
            {summary.hutanLindung > 0 ? 'SIAGA' : 'AMAN'}
          </span>
        </div>
      </div>

      {/* 2. Perkebunan Sawit (Dalam & Buffer) */}
      <div 
        onClick={() => onFilterCategory(filter.landCategory === 'sawit_all' ? 'all' : 'sawit_all')}
        className={`glass-panel-card p-3 sm:p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.02] border ${
          filter.landCategory === 'sawit_all' || filter.landCategory === 'sawit_dalam' || filter.landCategory === 'sawit_sebelah'
            ? 'ring-2 ring-amber-400 border-amber-500 bg-amber-950/50 shadow-lg shadow-amber-500/20'
            : 'border-amber-500/30 hover:border-amber-400/60 bg-gradient-to-br from-amber-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-full mb-1.5 truncate">
              <Palmtree className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Konsesi Sawit
            </span>
            <div className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
              {summary.sawitTotal}
              <span className="text-[10px] sm:text-xs font-normal text-amber-400 font-mono">
                ({getPercentage(summary.sawitTotal)})
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              HGU & Buffer 2km
            </p>
          </div>
          <div className="hidden sm:block p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Palmtree className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-[10px] sm:text-[11px]">
          <span className="text-amber-200 truncate">
            <strong>{summary.sawitInside}</strong> HGU
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-300/90 truncate">
            <strong>{summary.sawitBuffer}</strong> Buffer
          </span>
        </div>
      </div>

      {/* 3. Konsesi Pertambangan */}
      <div 
        onClick={() => onFilterCategory(filter.landCategory === 'tambang' ? 'all' : 'tambang')}
        className={`glass-panel-card p-3 sm:p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.02] border ${
          filter.landCategory === 'tambang'
            ? 'ring-2 ring-purple-400 border-purple-500 bg-purple-950/50 shadow-lg shadow-purple-500/20'
            : 'border-purple-500/30 hover:border-purple-400/60 bg-gradient-to-br from-purple-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/30 rounded-full mb-1.5 truncate">
              <Pickaxe className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Tambang
            </span>
            <div className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
              {summary.tambang}
              <span className="text-[10px] sm:text-xs font-normal text-purple-400 font-mono">
                ({getPercentage(summary.tambang)})
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              IUP Batubara/Nikel
            </p>
          </div>
          <div className="hidden sm:block p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Pickaxe className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-purple-500/20 flex items-center justify-between text-[10px] sm:text-[11px]">
          <span className="text-slate-400 truncate">IUP Aktif</span>
          <span className="text-purple-400 font-semibold font-mono text-[9px] sm:text-[11px]">
            {summary.tambang > 0 ? 'RISIKO' : 'NIHIL'}
          </span>
        </div>
      </div>

      {/* 4. Perkotaan & Pemukiman */}
      <div 
        onClick={() => onFilterCategory(filter.landCategory === 'perkotaan' ? 'all' : 'perkotaan')}
        className={`glass-panel-card p-3 sm:p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.02] border ${
          filter.landCategory === 'perkotaan'
            ? 'ring-2 ring-cyan-400 border-cyan-500 bg-cyan-950/50 shadow-lg shadow-cyan-500/20'
            : 'border-cyan-500/30 hover:border-cyan-400/60 bg-gradient-to-br from-cyan-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-full mb-1.5 truncate">
              <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Perkotaan
            </span>
            <div className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
              {summary.perkotaan}
              <span className="text-[10px] sm:text-xs font-normal text-cyan-400 font-mono">
                ({getPercentage(summary.perkotaan)})
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              Pemukiman & Kota
            </p>
          </div>
          <div className="hidden sm:block p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-cyan-500/20 flex items-center justify-between text-[10px] sm:text-[11px]">
          <span className="text-slate-400 truncate">Dampak ISPA</span>
          <span className="text-cyan-400 font-semibold font-mono text-[9px] sm:text-[11px]">
            {summary.perkotaan > 0 ? 'SIAGA' : 'AMAN'}
          </span>
        </div>
      </div>

      {/* 5. Total Hotspot & High Confidence (Full width on 2-column mobile) */}
      <div 
        onClick={() => onFilterCategory('all')}
        className={`col-span-2 lg:col-span-1 glass-panel-card p-3 sm:p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.02] border ${
          filter.landCategory === 'all'
            ? 'ring-2 ring-orange-400 border-orange-500 bg-orange-950/50 shadow-lg shadow-orange-500/20'
            : 'border-orange-500/30 hover:border-orange-400/60 bg-gradient-to-br from-orange-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full mb-1.5 truncate">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400 animate-pulse shrink-0" /> Total Hotspot
            </span>
            <div className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
              {summary.total}
              <span className="text-[10px] sm:text-xs font-normal text-orange-300 font-mono">
                Titik Api
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              High Conf (≥80%): <strong className="text-orange-400">{summary.highConfidence}</strong>
            </p>
          </div>
          <div className="hidden sm:block p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
            <Zap className="w-5 h-5 text-orange-400" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-orange-500/20 flex items-center justify-between text-[10px] sm:text-[11px]">
          <span className="text-slate-400 flex items-center gap-1 truncate">
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400 shrink-0" /> FRP Radiasi
          </span>
          <span className="text-orange-400 font-bold font-mono">
            {summary.totalFRP} MW
          </span>
        </div>
      </div>

    </div>
  );
};
