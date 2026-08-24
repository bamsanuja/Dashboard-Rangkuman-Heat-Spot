import React from 'react';
import { 
  X, 
  Printer, 
  Flame, 
  ShieldAlert
} from 'lucide-react';
import type { Hotspot, SpatialSummary } from '../types';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SpatialSummary;
  hotspots: Hotspot[];
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  summary,
  hotspots
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const criticalHotspots = hotspots
    .filter(h => h.landDetail.riskLevel === 'Kritis' || h.landCategory === 'hutan_lindung')
    .slice(0, 8);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl glass-panel-card rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700 shadow-2xl overflow-hidden bg-slate-950/98 max-h-[92vh] flex flex-col">
        
        {/* Mobile pull indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Modal Controls Bar */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            <h3 className="font-bold text-slate-100 text-xs sm:text-base truncate">
              Laporan Ringkasan Eksekutif Karhutla
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-report" className="p-4 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6 text-slate-200 bg-slate-950 text-xs leading-relaxed print:text-black print:bg-white">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-700 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Flame className="w-5 h-5 text-red-500" />
                <span className="font-extrabold text-base sm:text-xl text-white tracking-tight uppercase print:text-black">
                  SIPONGI LAND-WATCH BRIEFING
                </span>
              </div>
              <h2 className="text-[11px] sm:text-xs font-semibold text-slate-400 print:text-slate-700">
                Analisis Spasial Zonasi Peruntukan Lahan Karhutla
              </h2>
            </div>

            <div className="text-left sm:text-right text-[10px] sm:text-[11px] text-slate-400 print:text-slate-600">
              <div><strong>Tanggal:</strong> {dateStr}</div>
              <div><strong>Satelit:</strong> VIIRS / MODIS • Sipongi+ KLHK</div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <h4 className="font-bold text-slate-100 print:text-black text-xs sm:text-sm mb-1.5">
              Ringkasan Temuan Utama
            </h4>
            <p className="text-slate-300 print:text-slate-800 text-[11px] sm:text-xs leading-relaxed">
              Hasil analisis spasial terhadap total <strong>{summary.total} titik panas</strong>:
            </p>
            <ul className="mt-1.5 space-y-1 list-disc list-inside text-slate-300 print:text-slate-800 text-[10px] sm:text-[11px]">
              <li>
                <strong className="text-emerald-400 print:text-emerald-700">{summary.hutanLindung} titik ({Math.round((summary.hutanLindung / (summary.total || 1)) * 100)}%)</strong> di Kawasan Hutan Lindung & Taman Nasional.
              </li>
              <li>
                <strong className="text-amber-400 print:text-amber-700">{summary.sawitTotal} titik ({Math.round((summary.sawitTotal / (summary.total || 1)) * 100)}%)</strong> di Perkebunan Sawit ({summary.sawitInside} dalam HGU, {summary.sawitBuffer} buffer &lt;2km).
              </li>
              <li>
                <strong className="text-purple-400 print:text-purple-700">{summary.tambang} titik ({Math.round((summary.tambang / (summary.total || 1)) * 100)}%)</strong> di area Pertambangan.
              </li>
              <li>
                <strong className="text-cyan-400 print:text-cyan-700">{summary.perkotaan} titik ({Math.round((summary.perkotaan / (summary.total || 1)) * 100)}%)</strong> di sekitar Perkotaan & Pemukiman (siaga ISPA).
              </li>
            </ul>
          </div>

          {/* Table: Kategori Zonasi Lahan */}
          <div>
            <h4 className="font-bold text-slate-100 print:text-black text-xs sm:text-sm mb-2">
              1. Tabel Distribusi Zonasi Lahan
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-900 text-slate-300 print:bg-gray-200 print:text-black font-semibold">
                  <tr>
                    <th className="py-2 px-2.5">Kategori Lahan</th>
                    <th className="py-2 px-2.5 text-center">Jumlah</th>
                    <th className="py-2 px-2.5 text-center">Persentase</th>
                    <th className="py-2 px-2.5">Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-emerald-300 print:text-emerald-800">
                      🌲 Hutan Lindung
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono font-bold">{summary.hutanLindung}</td>
                    <td className="py-2 px-2.5 text-center font-mono">{Math.round((summary.hutanLindung / (summary.total || 1)) * 100)}%</td>
                    <td className="py-2 px-2.5 text-[10px] text-slate-300 print:text-slate-800">
                      Penegakan UU Kehutanan 18/2013 & Patroli Manggala Agni.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-amber-300 print:text-amber-800">
                      🌴 Konsesi Sawit
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono font-bold">{summary.sawitTotal}</td>
                    <td className="py-2 px-2.5 text-center font-mono">{Math.round((summary.sawitTotal / (summary.total || 1)) * 100)}%</td>
                    <td className="py-2 px-2.5 text-[10px] text-slate-300 print:text-slate-800">
                      Audit sarpras damkar & pertanggungjawaban mutlak HGU.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-purple-300 print:text-purple-800">
                      ⛏️ Pertambangan
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono font-bold">{summary.tambang}</td>
                    <td className="py-2 px-2.5 text-center font-mono">{Math.round((summary.tambang / (summary.total || 1)) * 100)}%</td>
                    <td className="py-2 px-2.5 text-[10px] text-slate-300 print:text-slate-800">
                      Evaluasi AMDAL pembukaan lahan tambang.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-cyan-300 print:text-cyan-800">
                      🏙️ Perkotaan
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono font-bold">{summary.perkotaan}</td>
                    <td className="py-2 px-2.5 text-center font-mono">{Math.round((summary.perkotaan / (summary.total || 1)) * 100)}%</td>
                    <td className="py-2 px-2.5 text-[10px] text-slate-300 print:text-slate-800">
                      Peringatan ISPU dan posko kesehatan ISPA.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table: Critical Hotspots Priority */}
          <div>
            <h4 className="font-bold text-slate-100 print:text-black text-xs sm:text-sm mb-2">
              2. Titik Panas Kritis Prioritas Lapangan
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-[10px] sm:text-[11px]">
                <thead className="bg-slate-900 text-slate-300 print:bg-gray-200 print:text-black font-semibold">
                  <tr>
                    <th className="py-1.5 px-2">ID</th>
                    <th className="py-1.5 px-2">Lokasi</th>
                    <th className="py-1.5 px-2">Kawasan</th>
                    <th className="py-1.5 px-2 text-center">Confidence</th>
                    <th className="py-1.5 px-2 text-center">FRP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {criticalHotspots.map(h => (
                    <tr key={h.id}>
                      <td className="py-1.5 px-2 font-mono font-bold text-slate-200 print:text-black">{h.id}</td>
                      <td className="py-1.5 px-2">{h.district}, {h.province}</td>
                      <td className="py-1.5 px-2 font-semibold text-emerald-300 print:text-emerald-800">
                        {h.landDetail.specificAreaName}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold text-red-400 print:text-red-700">
                        {h.confidence}%
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold text-orange-400 print:text-orange-700">
                        {h.frp} MW
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
