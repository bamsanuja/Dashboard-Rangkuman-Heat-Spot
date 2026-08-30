import type { FdrsBand, FireCluster, Hotspot, LandIndication } from '../types';
import { FDRS_BANDS } from './fdrs';

/**
 * Mengelompokkan deteksi titik panas menjadi gugus kebakaran.
 *
 * Alasannya sederhana dan penting. Satu kebakaran besar menghasilkan puluhan
 * sampai ratusan piksel panas, sementara satu deteksi soliter bisa berarti
 * kebakaran kecil, piksel pinggiran, flare gas, atau positif palsu. Menghitung
 * keduanya sebagai satuan yang sama membuat angka utama dasbor menyesatkan.
 *
 * Yang TIDAK dilakukan di sini: menyembunyikan apa pun. Deteksi soliter tetap
 * menjadi gugus berukuran satu, tetap tampil di peta, dan tetap bisa dibuka.
 * Yang berubah hanya bahwa ia tidak lagi terhitung setara dengan gugus 451
 * deteksi.
 */

/** Radius yang bisa dipilih pengguna, dalam meter. */
export const CLUSTER_RADII = [375, 500, 750, 1000, 1500, 2000] as const;
export const DEFAULT_RADIUS = 1000;

/**
 * Ambang tangga bukti. Tiap anak tangga adalah pilihan analis, dan karena itu
 * ditampilkan terbuka daripada dipilihkan diam-diam.
 */
export const LADDER_STEPS = [1, 2, 4, 10, 30] as const;

const KM_PER_DEG_LAT = 111.32;

function kmPerDegLng(lat: number) {
  return KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

/** Jarak kasar dalam kilometer, cukup akurat pada skala beberapa kilometer. */
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dy = (aLat - bLat) * KM_PER_DEG_LAT;
  const dx = (aLng - bLng) * kmPerDegLng((aLat + bLat) / 2);
  return Math.sqrt(dy * dy + dx * dx);
}

/**
 * Union-find dengan grid hashing. Tanpa grid, membandingkan 13 ribu titik satu
 * sama lain berarti 88 juta perbandingan; dengan grid, tiap titik hanya diadu
 * dengan isi sembilan sel di sekitarnya.
 */
export function clusterHotspots(hotspots: Hotspot[], radiusMeters: number): FireCluster[] {
  const n = hotspots.length;
  if (!n) return [];

  const eps = radiusMeters / 1000;
  const cell = eps / KM_PER_DEG_LAT;
  const grid = new Map<string, number[]>();

  for (let i = 0; i < n; i++) {
    const key = `${Math.floor(hotspots[i].latitude / cell)},${Math.floor(hotspots[i].longitude / cell)}`;
    const bucket = grid.get(key);
    if (bucket) bucket.push(i);
    else grid.set(key, [i]);
  }

  const parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  const find = (x: number): number => {
    let r = x;
    while (parent[r] !== r) r = parent[r];
    while (parent[x] !== r) {
      const next = parent[x];
      parent[x] = r;
      x = next;
    }
    return r;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  for (const [key, idxs] of grid) {
    const [cy, cx] = key.split(',').map(Number);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const neighbours = grid.get(`${cy + dy},${cx + dx}`);
        if (!neighbours) continue;
        for (const i of idxs) {
          const a = hotspots[i];
          for (const j of neighbours) {
            if (i === j) continue;
            const b = hotspots[j];
            if (distanceKm(a.latitude, a.longitude, b.latitude, b.longitude) <= eps) union(i, j);
          }
        }
      }
    }
  }

  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const g = groups.get(root);
    if (g) g.push(i);
    else groups.set(root, [i]);
  }

  const clusters: FireCluster[] = [];
  for (const [root, members] of groups) {
    clusters.push(describe(root, members, hotspots, radiusMeters));
  }
  clusters.sort((a, b) => b.size - a.size);
  return clusters;
}

function describe(root: number, members: number[], hotspots: Hotspot[], radiusMeters: number): FireCluster {
  const points = members.map((i) => hotspots[i]);
  const lat = points.reduce((s, h) => s + h.latitude, 0) / points.length;
  const lng = points.reduce((s, h) => s + h.longitude, 0) / points.length;

  let spanKm = 0;
  // Rentang diukur dari sentroid dan dikalikan dua. Membandingkan semua pasangan
  // pada gugus 451 deteksi akan mahal, dan hasilnya tidak lebih berguna.
  for (const h of points) spanKm = Math.max(spanKm, distanceKm(lat, lng, h.latitude, h.longitude));
  spanKm = Number((spanKm * 2).toFixed(2));

  const dates = [...new Set(points.map((h) => h.acquisitionDate))].sort();
  // Satu lintasan satelit menghasilkan banyak piksel pada stempel waktu yang
  // sama. Jumlah lintasan berbeda inilah bukti bahwa api bertahan, bukan jumlah
  // pikselnya.
  const passes = new Set(points.map((h) => `${h.satellite}|${h.acquisitionDate}|${h.acquisitionTimeUtc}`)).size;
  const satellites = [...new Set(points.map((h) => h.satellite))].sort();

  const covers = new Map<LandIndication, number>();
  for (const h of points) {
    const c = h.imagery?.indication;
    if (c) covers.set(c, (covers.get(c) ?? 0) + 1);
  }
  const dominantCover = [...covers.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  // Kelas bahaya paling berat di antara anggota, karena satu titik pada gambut
  // kering sudah cukup untuk mengubah konsekuensi seluruh gugus.
  let worstBand: FdrsBand = 'tidak_ada_data';
  for (const h of points) {
    const b = h.fdrs?.dcBand;
    if (!b) continue;
    if (FDRS_BANDS.indexOf(b) < FDRS_BANDS.indexOf(worstBand)) worstBand = b;
  }

  const inside = points.filter((h) => h.proximity?.relation === 'within_indicative_boundary');
  const provinces = [...new Set(points.map((h) => h.province).filter(Boolean))] as string[];
  const districts = [...new Set(points.map((h) => h.district).filter(Boolean))] as string[];

  return {
    id: `c${root}-${radiusMeters}`,
    memberIds: points.map((h) => h.id),
    size: points.length,
    latitude: Number(lat.toFixed(5)),
    longitude: Number(lng.toFixed(5)),
    spanKm,
    dates,
    passes,
    satellites,
    highConfidence: points.filter((h) => h.confidence.level === 'high').length,
    dominantCover,
    worstDcBand: worstBand,
    insideAreaCount: inside.length,
    areaName: inside[0]?.proximity?.areaName,
    provinces,
    districts,
  };
}

export interface Ladder {
  radiusMeters: number;
  detections: number;
  steps: { minSize: number; clusters: number; detections: number }[];
}

/**
 * Tangga bukti. Tiap anak tangga menaikkan syarat jumlah deteksi dalam satu
 * gugus, dan angkanya turun tajam. Menampilkan seluruh tangga membuat pilihan
 * analis terlihat, daripada menyembunyikannya di balik satu angka.
 */
export function buildLadder(clusters: FireCluster[], radiusMeters: number): Ladder {
  const detections = clusters.reduce((s, c) => s + c.size, 0);
  return {
    radiusMeters,
    detections,
    steps: LADDER_STEPS.map((minSize) => {
      const matching = clusters.filter((c) => c.size >= minSize);
      return {
        minSize,
        clusters: matching.length,
        detections: matching.reduce((s, c) => s + c.size, 0),
      };
    }),
  };
}

export const LADDER_LABEL: Record<number, string> = {
  1: 'Semua gugus',
  2: 'Minimal 2 deteksi',
  4: 'Minimal 4 deteksi',
  10: 'Minimal 10 deteksi',
  30: 'Gugus besar, minimal 30 deteksi',
};

export const LADDER_NOTE: Record<number, string> = {
  1: 'Termasuk deteksi soliter, yang bisa berarti kebakaran kecil, piksel pinggiran, sumber panas industri, atau positif palsu.',
  2: 'Menyingkirkan deteksi yang hanya muncul sekali di satu piksel.',
  4: 'Cukup untuk menyebutnya kebakaran dengan luasan, dan angka inilah yang paling bisa dipertahankan di ruang rapat.',
  10: 'Kebakaran yang jelas terlihat pada beberapa piksel bersebelahan.',
  30: 'Kejadian besar. Jumlahnya sedikit, dan inilah daftar yang layak dikirimi tim lebih dulu.',
};
