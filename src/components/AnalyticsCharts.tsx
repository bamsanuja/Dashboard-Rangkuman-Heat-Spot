import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,
} from 'chart.js';
import type { Summary } from '../types';
import { LEGAL_REFERENCES, TENURE_NOTE, INSTITUTIONS } from '../utils/legal';
import { ALL_INDICATIONS, INDICATION_COLOR, INDICATION_SHORT } from '../utils/imageryIndication';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CREAM = '#fdf7f2';
const FAINT = '#93826d';
const LINE = '#4d3f2d';
const SERIES = ['#f0a22e', '#a5644e', '#b58b80', '#c3986d', '#a19574'];

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: CREAM, font: { size: 11 } } },
    tooltip: { backgroundColor: '#241c13', borderColor: LINE, borderWidth: 1, titleColor: CREAM, bodyColor: CREAM },
  },
  scales: {
    x: { ticks: { color: FAINT, font: { size: 10 } }, grid: { color: LINE } },
    y: { ticks: { color: FAINT, font: { size: 10 } }, grid: { color: LINE }, beginAtZero: true },
  },
};

export default function AnalyticsCharts({ summary }: { summary: Summary }) {
  const dates = Object.keys(summary.byDate).sort();
  const sensors = Object.keys(summary.bySensor);
  const coverClasses = ALL_INDICATIONS.filter((i) => summary.byIndication[i] > 0);

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-4">
          <h3 className="text-[12px] font-bold text-cream mb-1">Titik panas per tanggal akuisisi</h3>
          <p className="text-[10px] text-cream-faint mb-3">Jumlah deteksi, bukan jumlah kebakaran. Satu kebakaran dapat terdeteksi berkali-kali.</p>
          <div style={{ height: 220 }}>
            <Bar
              options={baseOptions}
              data={{
                labels: dates,
                datasets: [{ label: 'Deteksi', data: dates.map((d) => summary.byDate[d]), backgroundColor: SERIES[0] }],
              }}
            />
          </div>
        </div>

        <div className="panel p-4">
          <h3 className="text-[12px] font-bold text-cream mb-1">Tutupan lahan di bawah titik panas</h3>
          <p className="text-[10px] text-cream-faint mb-3">
            Dibaca dari citra basemap di tiap koordinat. Pengamatan tutupan lahan, bukan status izin.
          </p>
          <div style={{ height: 220 }}>
            <Bar
              options={{ ...baseOptions, indexAxis: 'y' as const, plugins: { ...baseOptions.plugins, legend: { display: false } } }}
              data={{
                labels: coverClasses.map((i) => INDICATION_SHORT[i]),
                datasets: [
                  {
                    label: 'Titik',
                    data: coverClasses.map((i) => summary.byIndication[i]),
                    backgroundColor: coverClasses.map((i) => INDICATION_COLOR[i]),
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-4">
          <h3 className="text-[12px] font-bold text-cream mb-1">Komposisi platform</h3>
          <p className="text-[10px] text-cream-faint mb-3">VIIRS 375 m dan MODIS 1 km tidak setara. Jangan bandingkan jumlahnya langsung.</p>
          <div style={{ height: 220 }}>
            <Doughnut
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: baseOptions.plugins,
              }}
              data={{
                labels: sensors,
                datasets: [
                  {
                    data: sensors.map((s) => summary.bySensor[s]),
                    backgroundColor: sensors.map((_, i) => SERIES[i % SERIES.length]),
                    borderColor: '#2d2318',
                    borderWidth: 2,
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-4">
          <h3 className="text-[12px] font-bold text-cream mb-1">Tingkat kepercayaan</h3>
          <p className="text-[10px] text-cream-faint mb-3">
            MODIS melaporkan persentase, VIIRS melaporkan kategori. Keduanya dinormalkan ke tiga tingkat untuk
            perbandingan, dan nilai aslinya tetap tersimpan pada tiap baris.
          </p>
          <div style={{ height: 200 }}>
            <Bar
              options={baseOptions}
              data={{
                labels: ['Tinggi', 'Nominal', 'Rendah'],
                datasets: [
                  {
                    label: 'Titik',
                    data: [summary.byConfidence.high, summary.byConfidence.nominal, summary.byConfidence.low],
                    backgroundColor: [SERIES[0], SERIES[3], SERIES[4]],
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="panel p-4">
          <h3 className="text-[12px] font-bold text-cream mb-3">Rujukan hukum</h3>
          <ul className="space-y-2.5">
            {LEGAL_REFERENCES.map((ref) => (
              <li key={ref.citation} className="rule-olive pl-3">
                <p className="text-[12px] text-cream font-medium">{ref.citation}</p>
                <p className="text-[11px] text-cream-muted">{ref.title}</p>
                <p className="text-[11px] text-cream-faint leading-snug mt-0.5">{ref.relevance}</p>
                {ref.caution && (
                  <p className="text-[11px] text-sienna leading-snug mt-1">{ref.caution}</p>
                )}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-cream-faint leading-snug mt-3 pt-3 border-t border-espresso-line">{TENURE_NOTE}</p>
          <p className="text-[10px] text-cream-faint leading-snug mt-2">{INSTITUTIONS.note}</p>
        </div>
      </div>
    </div>
  );
}
