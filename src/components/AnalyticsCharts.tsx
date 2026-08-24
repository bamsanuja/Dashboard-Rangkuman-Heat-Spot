import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { 
  PieChart, 
  BarChart2, 
  TrendingUp, 
  Satellite, 
  ShieldCheck
} from 'lucide-react';
import type { SpatialSummary } from '../types';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

interface AnalyticsChartsProps {
  summary: SpatialSummary;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ summary }) => {
  // Common Chart Dark Theme Options
  const darkTooltip = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    titleColor: '#f8fafc',
    bodyColor: '#cbd5e1',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    padding: 10,
    boxPadding: 4,
    cornerRadius: 8
  };

  // 1. Doughnut Data: Land Category Distribution
  const doughnutData = {
    labels: [
      'Hutan Lindung & TN',
      'Dalam HGU Sawit',
      'Sebelah/Buffer Sawit',
      'Konsesi Tambang',
      'Perkotaan/Pemukiman',
      'APL / Lainnya'
    ],
    datasets: [
      {
        data: [
          summary.hutanLindung,
          summary.sawitInside,
          summary.sawitBuffer,
          summary.tambang,
          summary.perkotaan,
          summary.apl
        ],
        backgroundColor: [
          '#10b981', // Emerald
          '#f59e0b', // Amber
          '#f97316', // Orange
          '#a855f7', // Purple
          '#06b6d4', // Cyan
          '#64748b'  // Slate
        ],
        borderColor: '#0f172a',
        borderWidth: 3,
        hoverOffset: 6
      }
    ]
  };

  // 2. Bar Data: Top Provinces
  const sortedProvinces = Object.entries(summary.byProvince)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const barProvinceData = {
    labels: sortedProvinces.map(p => p[0]),
    datasets: [
      {
        label: 'Jumlah Titik Panas',
        data: sortedProvinces.map(p => p[1]),
        backgroundColor: 'rgba(249, 115, 22, 0.85)',
        hoverBackgroundColor: '#ea580c',
        borderRadius: 6
      }
    ]
  };

  // 3. Line Data: Trend by Date
  const dateKeys = Object.keys(summary.byDate).sort();
  const lineTrendData = {
    labels: dateKeys.map(d => d.slice(5)), // MM-DD
    datasets: [
      {
        label: 'Hutan Lindung',
        data: dateKeys.map(d => summary.byDate[d]?.hutan || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true
      },
      {
        label: 'Konsesi Sawit (Total)',
        data: dateKeys.map(d => summary.byDate[d]?.sawit || 0),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.35,
        fill: true
      },
      {
        label: 'Tambang',
        data: dateKeys.map(d => summary.byDate[d]?.tambang || 0),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.35,
        fill: true
      },
      {
        label: 'Perkotaan',
        data: dateKeys.map(d => summary.byDate[d]?.kota || 0),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.35,
        fill: true
      }
    ]
  };

  // 4. Satellite Sensors
  const satelliteEntries = Object.entries(summary.bySatellite);

  return (
    <div className="space-y-6">
      
      {/* Top Grid: Donut + Province Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart: Proporsi Lahan */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
                <PieChart className="w-4 h-4 text-orange-400" />
                Proporsi Sebaran terhadap Status Lahan
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Rasio titik panas di kawasan lindung vs konsesi vs pemukiman.
            </p>
          </div>

          <div className="relative h-64 flex items-center justify-center">
            {summary.total > 0 ? (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#94a3b8',
                        font: { size: 11, family: 'Plus Jakarta Sans' },
                        boxWidth: 12,
                        padding: 12
                      }
                    },
                    tooltip: darkTooltip
                  },
                  cutout: '68%'
                }}
              />
            ) : (
              <div className="text-slate-500 text-xs">Tidak ada data untuk filter saat ini</div>
            )}
            
            {/* Center Summary Label */}
            {summary.total > 0 && (
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-2xl font-extrabold text-white font-mono">{summary.total}</span>
                <span className="block text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Titik Api</span>
              </div>
            )}
          </div>

          {/* Quick summary footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
              <div className="text-[10px] text-emerald-300">Hutan Lindung</div>
              <div className="font-bold text-white mt-0.5">{summary.hutanLindung}</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/20">
              <div className="text-[10px] text-amber-300">Sawit Total</div>
              <div className="font-bold text-white mt-0.5">{summary.sawitTotal}</div>
            </div>
            <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/20">
              <div className="text-[10px] text-purple-300">Tambang</div>
              <div className="font-bold text-white mt-0.5">{summary.tambang}</div>
            </div>
          </div>
        </div>

        {/* Bar Chart: Provinsi Terbanyak */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
                <BarChart2 className="w-4 h-4 text-orange-400" />
                Distribusi Titik Panas per Provinsi
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Top Wilayah
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Provinsi dengan intensitas titik api dan kebakaran tertinggi.
            </p>
          </div>

          <div className="h-64">
            {sortedProvinces.length > 0 ? (
              <Bar
                data={barProvinceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: darkTooltip
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: '#94a3b8', font: { size: 11 } }
                    },
                    y: {
                      grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      ticks: { color: '#94a3b8', font: { size: 11 }, precision: 0 }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Tidak ada data provinsi
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Wilayah Utama: Riau, Kalteng, Kalbar, Kaltim, Sumsel</span>
            <span className="font-semibold text-orange-400 font-mono">Total {summary.total} Titik</span>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Trend Harian + Satellite Feed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Harian (7 Hari Terakhir) */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              Tren Sebaran Titik Panas per Status Lahan
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Time Series</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Evolusi deteksi kebakaran di Hutan Lindung vs Konsesi Sawit vs Tambang dari hari ke hari.
          </p>

          <div className="h-64">
            {dateKeys.length > 0 ? (
              <Line
                data={lineTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: { color: '#cbd5e1', font: { size: 11 }, boxWidth: 10 }
                    },
                    tooltip: darkTooltip
                  },
                  scales: {
                    x: {
                      grid: { color: 'rgba(255, 255, 255, 0.03)' },
                      ticks: { color: '#94a3b8', font: { size: 11 } }
                    },
                    y: {
                      grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      ticks: { color: '#94a3b8', font: { size: 11 }, precision: 0 }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Tidak ada data rentang waktu
              </div>
            )}
          </div>
        </div>

        {/* Satellite Sensors & Risk Matrix */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
                <Satellite className="w-4 h-4 text-cyan-400" />
                Sensor & Evaluasi Risiko
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Distribusi sensor satelit dan audit kepatuhan hukum lingkungan.
            </p>

            {/* Satellite breakdown list */}
            <div className="space-y-2 mb-4">
              {satelliteEntries.map(([sensor, count]) => (
                <div key={sensor} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{sensor}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-100">{count} deteksi</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Risk Highlight */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-500/30">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Prioritas Tindak Lanjut Gakkum</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Terdapat <strong>{summary.criticalAlerts} titik api berstatus Kritis</strong> (di dalam Hutan Lindung & Konservasi) yang memenuhi unsur pidana Karhutla UU 18/2013 dan memerlukan verifikasi lapangan tim Manggala Agni / Gakkum KLHK segera.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
