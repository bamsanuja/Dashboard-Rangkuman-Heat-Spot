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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl glass-panel-card rounded-3xl border border-slate-700 shadow-2xl overflow-hidden bg-slate-950/95 max-h-[92vh] flex flex-col">
        
        {/* Modal Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              Laporan Ringkasan Eksekutif Spasial Karhutla
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
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
        <div id="printable-report" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-200 bg-slate-950 text-xs leading-relaxed print:text-black print:bg-white">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-700 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-6 h-6 text-red-500" />
                <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight uppercase print:text-black">
                  SIPONGI LAND-WATCH BRIEFING
                </span>
              </div>
              <h2 className="text-xs font-semibold text-slate-400 print:text-slate-700">
                Sistem Analisis Spasial Titik Panas & Zonasi Peruntukan Lahan Karhutla Indonesia
              </h2>
            </div>

            <div className="text-right text-[11px] text-slate-400 print:text-slate-600">
              <div><strong>Tanggal Terbit:</strong> {dateStr}</div>
              <div><strong>Status Data:</strong> Terintegrasi Satelit & GIS Poligon</div>
              <div><strong>Referensi:</strong> Sipongi+ KLHK & Sensor VIIRS/MODIS</div>
            </div>
          </div>

          {/* Executive Summary Narrative */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <h4 className="font-bold text-slate-100 print:text-black text-sm mb-2">
              Ringkasan Temuan Utama
            </h4>
            <p className="text-slate-300 print:text-slate-800 text-xs leading-relaxed">
              Berdasarkan hasil pemrosesan spasial terhadap total <strong>{summary.total} titik panas</strong> yang terdeteksi satelit di seluruh wilayah Indonesia:
            </p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-300 print:text-slate-800 text-[11px]">
              <li>
                <strong className="text-emerald-400 print:text-emerald-700">{summary.hutanLindung} titik api ({Math.round((summary.hutanLindung / (summary.total || 1)) * 100)}%)</strong> terdeteksi di dalam <strong>Kawasan Hutan Lindung & Taman Nasional</strong> (Prioritas Utama Penegakan Hukum).
              </li>
              <li>
                <strong className="text-amber-400 print:text-amber-700">{summary.sawitTotal} titik api ({Math.round((summary.sawitTotal / (summary.total || 1)) * 100)}%)</strong> berkaitan dengan <strong>Perkebunan Kelapa Sawit</strong> ({summary.sawitInside} titik dalam batas HGU, {summary.sawitBuffer} titik dalam radius penyangga &lt;2km dari batas konsesi).
              </li>
              <li>
                <strong className="text-purple-400 print:text-purple-700">{summary.tambang} titik api ({Math.round((summary.tambang / (summary.total || 1)) * 100)}%)</strong> terdeteksi di area konsesi <strong>Pertambangan</strong> (Batubara, Nikel, Mineral).
              </li>
              <li>
                <strong className="text-cyan-400 print:text-cyan-700">{summary.perkotaan} titik api ({Math.round((summary.perkotaan / (summary.total || 1)) * 100)}%)</strong> terdeteksi di sekitar <strong>Kawasan Perkotaan & Pemukiman</strong> dengan ancaman langsung terhadap kesehatan masyarakat (ISPA).
              </li>
            </ul>
          </div>

          {/* Table: Kategori Zonasi Lahan */}
          <div>
            <h4 className="font-bold text-slate-100 print:text-black text-sm mb-3">
              1. Tabel Rincian Distribusi Zonasi Lahan
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 print:bg-gray-200 print:text-black font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Kategori Peruntukan Lahan</th>
                    <th className="py-2.5 px-3 text-center">Jumlah Titik</th>
                    <th className="py-2.5 px-3 text-center">Persentase</th>
                    <th className="py-2.5 px-3">Implikasi & Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-emerald-300 print:text-emerald-800">
                      🌲 Hutan Lindung & Konservasi
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{summary.hutanLindung}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{Math.round((summary.hutanLindung / (summary.total || 1)) * 100)}%</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-300 print:text-slate-800">
                      Penegakan UU Kehutanan 18/2013, mobilisasi patroli darat Manggala Agni & Water Bombing.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-amber-300 print:text-amber-800">
                      🌴 Konsesi Sawit (Dalam & Buffer)
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{summary.sawitTotal}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{Math.round((summary.sawitTotal / (summary.total || 1)) * 100)}%</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-300 print:text-slate-800">
                      Pemeriksaan kewajiban sarpras pemadam kebakaran dan pertanggungjawaban mutlak pemegang HGU.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-purple-300 print:text-purple-800">
                      ⛏️ Konsesi Pertambangan
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{summary.tambang}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{Math.round((summary.tambang / (summary.total || 1)) * 100)}%</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-300 print:text-slate-800">
                      Audit kepatuhan AMDAL pembukaan lahan tambang dan disposal batubara.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-cyan-300 print:text-cyan-800">
                      🏙️ Perkotaan & Pemukiman
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{summary.perkotaan}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{Math.round((summary.perkotaan / (summary.total || 1)) * 100)}%</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-300 print:text-slate-800">
                      Peringatan dini kualitas udara (ISPU), posko kesehatan masyarakat, dan pembatasan aktivitas luar ruang.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">
                      🌾 APL / Lahan Terbuka Lainnya
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{summary.apl}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{Math.round((summary.apl / (summary.total || 1)) * 100)}%</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-300 print:text-slate-800">
                      Pemadaman bersama masyarakat peduli api (MPA) dan BPBD setempat.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table: Critical Hotspots Priority */}
          <div>
            <h4 className="font-bold text-slate-100 print:text-black text-sm mb-3">
              2. Daftar Titik Panas Kritis Prioritas Verifikasi Lapangan
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 print:bg-gray-200 print:text-black font-semibold">
                  <tr>
                    <th className="py-2 px-3">ID Hotspot</th>
                    <th className="py-2 px-3">Lokasi Administrasi</th>
                    <th className="py-2 px-3">Zonasi & Nama Kawasan</th>
                    <th className="py-2 px-3 text-center">Confidence</th>
                    <th className="py-2 px-3 text-center">FRP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {criticalHotspots.map(h => (
                    <tr key={h.id}>
                      <td className="py-2 px-3 font-mono font-bold text-slate-200 print:text-black">{h.id}</td>
                      <td className="py-2 px-3 text-[11px]">{h.subdistrict}, {h.district}, {h.province}</td>
                      <td className="py-2 px-3 text-[11px] font-semibold text-emerald-300 print:text-emerald-800">
                        {h.landDetail.specificAreaName}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-red-400 print:text-red-700">
                        {h.confidence}%
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-orange-400 print:text-orange-700">
                        {h.frp} MW
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures / Disclaimer */}
          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 print:text-slate-600 flex justify-between items-center">
            <span>Dihasilkan secara otomatis oleh Engine Sipongi Land-Watch Spatial Classifier.</span>
            <span>Kementerian Lingkungan Hidup & Kehutanan RI / Balai Gakkum</span>
          </div>

        </div>

      </div>
    </div>
  );
};
