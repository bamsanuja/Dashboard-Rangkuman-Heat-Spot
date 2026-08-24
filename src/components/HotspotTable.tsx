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
  ShieldAlert
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <TreePine className="w-3 h-3" /> Hutan Lindung
          </span>
        );
      case 'sawit_dalam':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Palmtree className="w-3 h-3" /> Dalam Sawit
          </span>
        );
      case 'sawit_sebelah':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <Palmtree className="w-3 h-3" /> Sebelah Sawit ({h.landDetail.distanceToBoundaryMeters}m)
          </span>
        );
      case 'tambang':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Pickaxe className="w-3 h-3" /> Konsesi Tambang
          </span>
        );
      case 'perkotaan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Building2 className="w-3 h-3" /> Perkotaan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            APL / Terbuka
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      
      {/* Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
            <Table2 className="w-4 h-4 text-orange-400" />
            Tabel Rangkuman Investigasi Titik Panas Karhutla
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar lengkap titik api dengan overlay peruntukan lahan & jarak konsesi.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value={10}>10 Baris</option>
            <option value={25}>25 Baris</option>
            <option value={50}>50 Baris</option>
          </select>

          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
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
                  <span>Wilayah & Lokasi</span>
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
              <th className="py-3 px-4">Satelit & Waktu</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedHotspots.length > 0 ? (
              paginatedHotspots.map((h) => (
                <tr 
                  key={h.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectHotspot(h)}
                >
                  {/* ID */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    <span className="group-hover:text-orange-400 transition">
                      {h.id}
                    </span>
                  </td>

                  {/* Lokasi */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{h.district}</div>
                    <div className="text-[11px] text-slate-400">{h.subdistrict}, {h.province}</div>
                  </td>

                  {/* Kategori Lahan Badge */}
                  <td className="py-3 px-4">
                    {getCategoryBadge(h)}
                  </td>

                  {/* Nama Kawasan */}
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="font-medium text-slate-200 truncate" title={h.landDetail.specificAreaName}>
                      {h.landDetail.specificAreaName}
                    </div>
                    {h.landDetail.concessionHolder && (
                      <div className="text-[10px] text-slate-400 truncate">
                        {h.landDetail.concessionHolder}
                      </div>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        h.confidence >= 80 ? 'bg-red-500' : h.confidence >= 30 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span className="font-mono font-bold text-slate-200">{h.confidence}%</span>
                    </div>
                  </td>

                  {/* FRP */}
                  <td className="py-3 px-4 font-mono font-bold text-orange-400">
                    {h.frp} MW
                  </td>

                  {/* Satelit & Waktu */}
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-mono text-[11px]">{h.satellite}</div>
                    <div className="text-[10px] text-slate-400">{h.acquisitionDate} • {h.acquisitionTime}</div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onZoomToMap(h)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Lihat Titik di Peta GIS"
                      >
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                      <button
                        onClick={() => onOpenDetails(h)}
                        className="p-1.5 rounded-lg bg-orange-600/80 hover:bg-orange-500 text-white shadow-sm transition"
                        title="Buka Lembar Investigasi Spasial"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Tidak ada data titik api yang sesuai dengan kriteria filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 bg-slate-950/60">
        <div>
          Menampilkan <strong className="text-slate-200">{paginatedHotspots.length}</strong> dari{' '}
          <strong className="text-slate-200">{sortedHotspots.length}</strong> total titik api
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-mono text-slate-200 px-2">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
