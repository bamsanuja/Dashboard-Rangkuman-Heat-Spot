import React from 'react';
import { 
  Search, 
  RotateCcw, 
  TreePine, 
  Palmtree, 
  Pickaxe, 
  Building2, 
  Sparkles, 
  MapPin, 
  Calendar 
} from 'lucide-react';
import type { FilterState } from '../types';

interface FilterBarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  availableProvinces: string[];
  totalFiltered: number;
  totalAll: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  setFilter,
  availableProvinces,
  totalFiltered,
  totalAll
}) => {
  const resetFilter = () => {
    setFilter({
      landCategory: 'all',
      confidence: 'all',
      satellite: 'all',
      province: 'all',
      dateRange: 'all',
      searchQuery: '',
      minFRP: 0
    });
  };

  const isFiltered = 
    filter.landCategory !== 'all' || 
    filter.confidence !== 'all' || 
    filter.satellite !== 'all' || 
    filter.province !== 'all' || 
    filter.dateRange !== 'all' || 
    filter.searchQuery !== '';

  return (
    <div className="glass-panel p-2.5 sm:p-3.5 rounded-2xl mb-4 sm:mb-5 border border-slate-800 shadow-xl space-y-2.5">
      
      {/* Row 1: Search Box & Category Scrollable Chips */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        
        {/* Search Box */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ID, Kab, Konsesi..."
            value={filter.searchQuery}
            onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          {filter.searchQuery && (
            <button 
              onClick={() => setFilter(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Scrollable Category Chips (Touch friendly for Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter(prev => ({ ...prev, landCategory: 'all' }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
              filter.landCategory === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Semua
          </button>

          <button
            onClick={() => setFilter(prev => ({ ...prev, landCategory: 'hutan_lindung' }))}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
              filter.landCategory === 'hutan_lindung'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <TreePine className="w-3 h-3" />
            <span>Hutan Lindung</span>
          </button>

          <button
            onClick={() => setFilter(prev => ({ ...prev, landCategory: 'sawit_all' }))}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
              filter.landCategory === 'sawit_all' || filter.landCategory === 'sawit_dalam' || filter.landCategory === 'sawit_sebelah'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
            }`}
          >
            <Palmtree className="w-3 h-3" />
            <span>Sawit</span>
          </button>

          <button
            onClick={() => setFilter(prev => ({ ...prev, landCategory: 'tambang' }))}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
              filter.landCategory === 'tambang'
                ? 'bg-purple-600 text-white font-semibold'
                : 'bg-purple-950/40 text-purple-300 border border-purple-500/30'
            }`}
          >
            <Pickaxe className="w-3 h-3" />
            <span>Tambang</span>
          </button>

          <button
            onClick={() => setFilter(prev => ({ ...prev, landCategory: 'perkotaan' }))}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
              filter.landCategory === 'perkotaan'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Perkotaan</span>
          </button>
        </div>

      </div>

      {/* Row 2: Mobile Grid for Dropdowns & Reset */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 justify-between">
        
        {/* Province Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <select
            value={filter.province}
            onChange={(e) => setFilter(prev => ({ ...prev, province: e.target.value }))}
            className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer truncate text-[11px]"
          >
            <option value="all" className="bg-slate-900 text-slate-200">Semua Provinsi</option>
            {availableProvinces.map(prov => (
              <option key={prov} value={prov} className="bg-slate-900 text-slate-200">
                {prov}
              </option>
            ))}
          </select>
        </div>

        {/* Confidence Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
          <Sparkles className="w-3 h-3 text-orange-400 shrink-0" />
          <select
            value={filter.confidence}
            onChange={(e) => setFilter(prev => ({ ...prev, confidence: e.target.value as FilterState['confidence'] }))}
            className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer truncate text-[11px]"
          >
            <option value="all" className="bg-slate-900 text-slate-200">Confidence: Semua</option>
            <option value="high" className="bg-slate-900 text-red-400">Tinggi (≥80%)</option>
            <option value="medium" className="bg-slate-900 text-amber-400">Sedang (30-79%)</option>
            <option value="low" className="bg-slate-900 text-emerald-400">Rendah (&lt;30%)</option>
          </select>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <select
            value={filter.dateRange}
            onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as FilterState['dateRange'] }))}
            className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer truncate text-[11px]"
          >
            <option value="all" className="bg-slate-900 text-slate-200">Waktu: Semua</option>
            <option value="today" className="bg-slate-900 text-slate-200">Hari Ini</option>
            <option value="24h" className="bg-slate-900 text-slate-200">24 Jam</option>
            <option value="3d" className="bg-slate-900 text-slate-200">3 Hari</option>
            <option value="7d" className="bg-slate-900 text-slate-200">7 Hari</option>
          </select>
        </div>

        {/* Reset Button & Count Badge */}
        <div className="flex items-center gap-1.5 justify-end">
          {isFiltered && (
            <button
              onClick={resetFilter}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 bg-red-950/40 border border-red-500/30 rounded-xl transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[11px]">Reset</span>
            </button>
          )}

          <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 px-2 py-1 bg-slate-900/60 rounded-lg border border-slate-800 whitespace-nowrap">
            <strong className="text-orange-400">{totalFiltered}</strong>/{totalAll}
          </div>
        </div>

      </div>

    </div>
  );
};
