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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
      
      {/* 1. Hutan Lindung & Konservasi */}
      <div 
        onClick={() => onFilterCategory(filter.landCategory === 'hutan_lindung' ? 'all' : 'hutan_lindung')}
        className={`glass-panel-card p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] border ${
          filter.landCategory === 'hutan_lindung'
            ? 'ring-2 ring-emerald-400 border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/20'
            : 'border-emerald-500/30 hover:border-emerald-400/60 bg-gradient-to-br from-emerald-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full mb-2">
              <TreePine className="w-3 h-3" /> Hutan Lindung
            </span>
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              {summary.hutanLindung}
              <span className="text-xs font-normal text-emerald-400 font-mono">
                ({getPercentage(summary.hutanLindung)})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Kawasan Taman Nasional & Cagar Alam
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TreePine className="w-5 h-5" />
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-red-400 font-medium">
            <AlertTriangle className="w-3 h-3" /> Zona Perlindungan
          </span>
          <span className="text-emerald-400 font-semibold font-mono">
            {summary.hutanLindung > 0 ? 'STATUS SIAGA' : 'AMAN'}
          </span>
        </div>
      </div>

      {/* 2. Perkebunan Sawit (Dalam & Buffer) */}
      <div 
        onClick={() => onFilterCategory(filter.landCategory === 'sawit_all' ? 'all' : 'sawit_all')}
        className={`glass-panel-card p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] border ${
          filter.landCategory === 'sawit_all' || filter.landCategory === 'sawit_dalam' || filter.landCategory === 'sawit_sebelah'
            ? 'ring-2 ring-amber-400 border-amber-500 bg-amber-950/40 shadow-lg shadow-amber-500/20'
            : 'border-amber-500/30 hover:border-amber-400/60 bg-gradient-to-br from-amber-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-full mb-2">
              <Palmtree className="w-3 h-3" /> Konsesi Sawit
            </span>
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              {summary.sawitTotal}
              <span className="text-xs font-normal text-amber-400 font-mono">
                ({getPercentage(summary.sawitTotal)})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Dalam HGU & Buffer Proximity
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Palmtree className="w-5 h-5" />
          </div>
        </div>

        {/* Sub-breakdown */}
        <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
          <span className="text-amber-200">
            <span className="font-bold text-amber-400">{summary.sawitInside}</span> Dalam HGU
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-amber-300/80">
            <span className="font-bold text-amber-400">{summary.sawitBuffer}</span> Sebelah/Buffer
          </span>
        </div>
      </div>

      {/* 3. Konsesi Pertambangan */}
      <div 
        onClick={() => onFilterCategory(filter.landCategory === 'tambang' ? 'all' : 'tambang')}
        className={`glass-panel-card p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] border ${
          filter.landCategory === 'tambang'
            ? 'ring-2 ring-purple-400 border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-500/20'
            : 'border-purple-500/30 hover:border-purple-400/60 bg-gradient-to-br from-purple-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/30 rounded-full mb-2">
              <Pickaxe className="w-3 h-3" /> Konsesi Tambang
            </span>
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              {summary.tambang}
              <span className="text-xs font-normal text-purple-400 font-mono">
                ({getPercentage(summary.tambang)})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              IUP Batubara, Nikel & Mineral
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Pickaxe className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-purple-500/20 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Pengawasan IUP</span>
          <span className="text-purple-400 font-semibold font-mono">
            {summary.tambang > 0 ? 'POTENSI RISIKO' : 'NIHIL'}
          </span>
        </div>
      </div>

      {/* 4. Perkotaan & Pemukiman */}
      <div 
        onClick={() => onFilterCategory(filter.landCategory === 'perkotaan' ? 'all' : 'perkotaan')}
        className={`glass-panel-card p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] border ${
          filter.landCategory === 'perkotaan'
            ? 'ring-2 ring-cyan-400 border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-500/20'
            : 'border-cyan-500/30 hover:border-cyan-400/60 bg-gradient-to-br from-cyan-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-full mb-2">
              <Building2 className="w-3 h-3" /> Perkotaan
            </span>
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              {summary.perkotaan}
              <span className="text-xs font-normal text-cyan-400 font-mono">
                ({getPercentage(summary.perkotaan)})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Pemukiman & Sabuk Kota
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Dampak ISPA</span>
          <span className="text-cyan-400 font-semibold font-mono">
            {summary.perkotaan > 0 ? 'SIAGA KABUT ASAP' : 'TERKENDALI'}
          </span>
        </div>
      </div>

      {/* 5. Total Hotspot & High Confidence */}
      <div 
        onClick={() => onFilterCategory('all')}
        className={`glass-panel-card p-4 rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] border ${
          filter.landCategory === 'all'
            ? 'ring-2 ring-orange-400 border-orange-500 bg-orange-950/40 shadow-lg shadow-orange-500/20'
            : 'border-orange-500/30 hover:border-orange-400/60 bg-gradient-to-br from-orange-950/30 to-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full mb-2">
              <Flame className="w-3 h-3 text-orange-400 animate-pulse" /> Total Hotspot
            </span>
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              {summary.total}
              <span className="text-xs font-normal text-orange-300 font-mono">
                Titik Api
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              High Conf (≥80%): <strong className="text-orange-400">{summary.highConfidence}</strong>
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Zap className="w-5 h-5 text-orange-400" />
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-orange-500/20 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-orange-400" /> Daya Radiasi (FRP)
          </span>
          <span className="text-orange-400 font-bold font-mono">
            {summary.totalFRP} MW
          </span>
        </div>
      </div>

    </div>
  );
};
