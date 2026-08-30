import { Flame, Gauge, Satellite, Trees, Sprout, TriangleAlert } from 'lucide-react';
import type { Summary } from '../types';

function Card({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="panel p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: accent }} />
        <span className="text-[11px] uppercase tracking-wider text-cream-faint font-semibold">{label}</span>
      </div>
      <span className="font-mono text-2xl font-bold text-cream leading-none">{value}</span>
      <span className="text-[11px] text-cream-faint leading-snug">{sub}</span>
    </div>
  );
}

export default function SummaryCards({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <Card
        icon={Flame}
        label="Titik panas"
        value={String(summary.total)}
        sub="Jumlah baris terbaca dari berkas"
        accent="#f0a22e"
      />
      <Card
        icon={Gauge}
        label="Kepercayaan tinggi"
        value={String(summary.byConfidence.high)}
        sub={`nominal ${summary.byConfidence.nominal} · rendah ${summary.byConfidence.low}`}
        accent="#c3986d"
      />
      <Card
        icon={Satellite}
        label="FRP tertinggi"
        value={summary.frpMax ? `${summary.frpMax.toFixed(1)} MW` : 'n/a'}
        sub={`median ${summary.frpMedian} MW · FRP laju sesaat, tidak dijumlahkan`}
        accent="#a5644e"
      />
      <Card
        icon={Trees}
        label="Dalam batas indikatif"
        value={String(summary.withinIndicativeBoundary)}
        sub={`${summary.nearBoundary} dekat batas · bentuk indikatif, bukan batas resmi`}
        accent="#a19574"
      />
      <Card
        icon={Sprout}
        label="Di atas perkebunan"
        value={String(summary.byIndication.plantation_pattern)}
        sub={`pola tanam teratur, dari ${summary.imageryAnalysed} titik terbaca citranya`}
        accent="#f0a22e"
      />
      <Card
        icon={TriangleAlert}
        label="Di atas lahan terbuka"
        value={String(summary.byIndication.cleared_or_excavated)}
        sub={`bukaan atau bekas bakar · ${summary.saturatedCount} titik pada saturasi kanal`}
        accent="#a5644e"
      />
    </div>
  );
}
