import React, { useState } from 'react';
import { 
  Table2, 
  MapPin, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  TreePine, 
  Palmtree, 
  Pickaxe, 
  Building2, 
  ArrowUpDown,
  ShieldAlert,
  Zap
} from 'lucide-react';
import type { Hotspot } from '../types';

interface HotspotTableProps {
  hotspots: Hotspot[];
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenDetails: (hotspot: Hotspot) => void;
  onZoomToMap: (hotspot: Hotspot) => void;
}

export const HotspotTable: React.FC<HotspotTableProps> = ({
  hotspots,
  onSelectHotspot,
  onOpenDetails,
  onZoomToMap
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<keyof Hotspot>('acquisitionDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Sorting
  const sortedHotspots = [...hotspots].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortAsc ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
    }
    if (typeof aVal === 'number') {
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedHotspots.length / pageSize) || 1;
  const paginatedHotspots = sortedHotspots.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof Hotspot) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Export to CSV
  const exportToCsv = () => {
    const headers = [
      'ID Hotspot',
      'Latitude',
      'Longitude',
      'Confidence (%)',
      'FRP (MW)',
      'Brightness (K)',
      'Satelit',
      'Tanggal',
      'Waktu',
      'Provinsi',
      'Kabupaten',
      'Kecamatan',
      'Kategori Lahan',
      'Detail Kawasan/Konsesi',
      'Jarak ke Batas (m)',
      'Level Risiko'
    ];

    const rows = sortedHotspots.map(h => [
      `"${h.id}"`,
      h.latitude,
      h.longitude,
      h.confidence,
      h.frp,
      h.brightness,
      `"${h.satellite}"`,
      `"${h.acquisitionDate}"`,
      `"${h.acquisitionTime}"`,
      `"${h.province}"`,
      `"${h.district}"`,
      `"${h.subdistrict}"`,
      `"${h.landDetail.categoryName}"`,
      `"${h.landDetail.specificAreaName}"`,
      h.landDetail.distanceToBoundaryMeters,
      `"${h.landDetail.riskLevel}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sipongi_hotspots_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (h: Hotspot) => {
    switch (h.landCategory) {
      case 'hutan_lindung':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <TreePine className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Hutan Lindung
          </span>
        );
      case 'sawit_dalam':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Palmtree className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Dalam Sawit
          </span>
        );
      case 'sawit_sebelah':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <Palmtree className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Sebelah Sawit ({h.landDetail.distanceToBoundaryMeters}m)
          </span>
        );
      case 'tambang':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Pickaxe className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Tambang
          </span>
        );
      case 'perkotaan':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Perkotaan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            APL / Terbuka
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden mb-12 sm:mb-0">
      
      {/* Header Toolbar */}
      <div className="p-3.5 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-950/60">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-1.5 text-sm sm:text-base">
            <Table2 className="w-4 h-4 text-orange-400" />
            Tabel & Investigasi Titik Panas
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Daftar lengkap titik api dengan peruntukan lahan & jarak konsesi.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-2 py-1 focus:outline-none"
          >
            <option value={10}>10 Baris</option>
            <option value={25}>25 Baris</option>
            <option value={50}>50 Baris</option>
          </select>

          <button
            onClick={exportToCsv}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Mobile Card List (Visible on < md screens) */}
      <div className="md:hidden divide-y divide-slate-800/80">
        {paginatedHotspots.length > 0 ? (
          paginatedHotspots.map((h) => (
            <div 
              key={h.id} 
              className="p-3.5 hover:bg-slate-900/40 transition space-y-2"
              onClick={() => onSelectHotspot(h)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-200 text-xs">
                  {h.id}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  h.confidence >= 80 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  Conf: {h.confidence}%
                </span>
              </div>

              <div>
                <div className="mb-1">{getCategoryBadge(h)}</div>
                <p className="text-xs font-semibold text-slate-200 line-clamp-1">{h.landDetail.specificAreaName}</p>
                <p className="text-[11px] text-slate-400">{h.subdistrict}, {h.district}, {h.province}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-300">
                <div className="flex items-center gap-1 font-mono text-orange-400 font-bold">
                  <Zap className="w-3 h-3" /> FRP {h.frp} MW
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{h.satellite}</span>
              </div>

              {/* Mobile Card Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoomToMap(h);
                  }}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1 border border-slate-700 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>Lihat di Peta</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(h);
                  }}
                  className="py-1.5 px-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Detail Spasial</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs">
            Tidak ada data titik api yang cocok.
          </div>
        )}
      </div>

      {/* 2. Desktop Table Body (Visible on >= md screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1">
                  <span>ID Hotspot</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('province')}>
                <div className="flex items-center gap-1">
                  <span>Wilayah</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('landCategory')}>
                <div className="flex items-center gap-1">
                  <span>Klasifikasi Lahan</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Nama Kawasan / Konsesi</th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('confidence')}>
                <div className="flex items-center gap-1">
                  <span>Confidence</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('frp')}>
                <div className="flex items-center gap-1">
                  <span>FRP (MW)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Satelit</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedHotspots.map((h) => (
              <tr 
                key={h.id}
                className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                onClick={() => onSelectHotspot(h)}
              >
                <td className="py-3 px-4 font-mono font-bold text-slate-200">
                  <span className="group-hover:text-orange-400 transition">
                    {h.id}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-200">{h.district}</div>
                  <div className="text-[11px] text-slate-400">{h.subdistrict}, {h.province}</div>
                </td>
                <td className="py-3 px-4">{getCategoryBadge(h)}</td>
                <td className="py-3 px-4 max-w-[200px]">
                  <div className="font-medium text-slate-200 truncate">{h.landDetail.specificAreaName}</div>
                  {h.landDetail.concessionHolder && (
                    <div className="text-[10px] text-slate-400 truncate">{h.landDetail.concessionHolder}</div>
                  )}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-200">{h.confidence}%</td>
                <td className="py-3 px-4 font-mono font-bold text-orange-400">{h.frp} MW</td>
                <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{h.satellite}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onZoomToMap(h)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Lihat di Peta"
                    >
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    </button>
                    <button
                      onClick={() => onOpenDetails(h)}
                      className="p-1.5 rounded-lg bg-orange-600/80 hover:bg-orange-500 text-white shadow transition"
                      title="Detail Investigasi"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 sm:p-4 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-400 bg-slate-950/60">
        <div className="text-[11px] truncate">
          <strong className="text-slate-200">{paginatedHotspots.length}</strong> dari{' '}
          <strong className="text-slate-200">{sortedHotspots.length}</strong> titik
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-mono text-slate-200 px-1 text-[11px]">
            {currentPage}/{totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
