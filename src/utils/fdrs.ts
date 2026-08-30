import type { FdrsBand, FdrsCode, FdrsGrid, FdrsReading } from '../types';

/**
 * Fire Danger Rating, dibaca dari grid GFWED (NASA GISS) yang diimpor pengguna.
 *
 * Pembagian kerja di sini disengaja. GFWED menyediakan nilai mentah keenam kode
 * sistem FWI. Ambang yang mengubah angka menjadi kategori bahaya berasal dari
 * panel FDRS SIPONGI, yang bersumber pada Spartan BMKG. Keduanya dipisah supaya
 * jelas mana yang data dan mana yang penafsiran, dan supaya ambangnya bisa
 * diubah tanpa menyentuh datanya.
 */

/**
 * Ambang SIPONGI/BMKG untuk empat kelas bahaya, dibaca dari panel FDRS.
 * Nilai di bawah ambang pertama masuk "Aman"; di atas ambang ketiga masuk
 * "Sangat Mudah".
 */
export const FDRS_THRESHOLDS: Record<FdrsCode, [number, number, number]> = {
  ffmc: [73, 78, 82],
  dmc: [5, 15, 29],
  dc: [141, 261, 350],
  bui: [7, 20, 33],
  isi: [2, 4, 5],
  fwi: [2, 7, 13],
};

export const FDRS_CODE_LABEL: Record<FdrsCode, string> = {
  ffmc: 'Fine Fuel Moisture Code',
  dmc: 'Duff Moisture Code',
  dc: 'Drought Code',
  isi: 'Initial Spread Index',
  bui: 'Build Up Index',
  fwi: 'Fire Weather Index',
};

export const FDRS_CODE_MEANING: Record<FdrsCode, string> = {
  ffmc: 'Kelembapan serasah dan bahan bakar halus. Merespons dalam hitungan jam, menentukan seberapa mudah api tersulut.',
  dmc: 'Kelembapan lapisan organik setengah padat. Merespons dalam sekitar dua minggu.',
  dc: 'Kekeringan bahan organik dalam dan padat. Merespons dalam sekitar dua bulan. Inilah kode yang menentukan apakah api akan turun ke bawah permukaan pada lahan gambut dan bertahan berminggu-minggu.',
  isi: 'Laju rambat awal, gabungan FFMC dan angin.',
  bui: 'Bahan bakar yang tersedia untuk terbakar, gabungan DMC dan DC.',
  fwi: 'Intensitas keseluruhan, gabungan ISI dan BUI.',
};

export const FDRS_BAND_LABEL: Record<FdrsBand, string> = {
  aman: 'Aman',
  tidak_mudah: 'Tidak Mudah',
  mudah: 'Mudah',
  sangat_mudah: 'Sangat Mudah',
  tidak_ada_data: 'Tanpa data FDRS',
};

/** Ramp hangat yang menaik, sejalan dengan palet aplikasi. */
export const FDRS_BAND_COLOR: Record<FdrsBand, string> = {
  aman: '#6f7f6a',
  tidak_mudah: '#a19574',
  mudah: '#f0a22e',
  sangat_mudah: '#a5644e',
  tidak_ada_data: '#4d3f2d',
};

export const FDRS_BANDS: FdrsBand[] = ['sangat_mudah', 'mudah', 'tidak_mudah', 'aman', 'tidak_ada_data'];

export function bandFor(code: FdrsCode, value: number | null): FdrsBand {
  if (value === null || !Number.isFinite(value)) return 'tidak_ada_data';
  const [a, b, c] = FDRS_THRESHOLDS[code];
  if (value >= c) return 'sangat_mudah';
  if (value >= b) return 'mudah';
  if (value >= a) return 'tidak_mudah';
  return 'aman';
}

/**
 * Interpolasi bilinear pada grid. Sel GFWED berukuran 0,25 derajat, sekitar 28
 * km, sehingga jauh lebih kasar daripada jejak piksel titik panas. Nilai yang
 * dikembalikan menggambarkan kondisi cuaca di sekitar titik, bukan di titik itu
 * sendiri, dan aplikasi menyatakan itu di antarmuka.
 */
export function sampleGrid(grid: FdrsGrid, code: FdrsCode, lat: number, lng: number): number | null {
  const values = grid.grids[code];
  if (!values) return null;

  const fx = (lng - grid.lonMin) / grid.dLon;
  const fy = (lat - grid.latMin) / grid.dLat;
  if (fx < 0 || fy < 0 || fx > grid.nLon - 1 || fy > grid.nLat - 1) return null;

  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, grid.nLon - 1);
  const y1 = Math.min(y0 + 1, grid.nLat - 1);
  const tx = fx - x0;
  const ty = fy - y0;

  const at = (x: number, y: number) => values[y * grid.nLon + x];
  const q = [at(x0, y0), at(x1, y0), at(x0, y1), at(x1, y1)];
  // Sel laut dan sel tanpa data berisi null. Kalau ada satu saja di antara
  // keempat sudut, interpolasi dibatalkan dan diambil sudut terdekat yang ada,
  // supaya titik di pesisir tetap memperoleh nilai tanpa dicampur nilai palsu.
  if (q.some((v) => v === null || v === undefined)) {
    const nearest = at(tx < 0.5 ? x0 : x1, ty < 0.5 ? y0 : y1);
    if (nearest !== null && nearest !== undefined) return nearest;
    const fallback = q.find((v) => v !== null && v !== undefined);
    return fallback ?? null;
  }

  const top = (q[0] as number) * (1 - tx) + (q[1] as number) * tx;
  const bottom = (q[2] as number) * (1 - tx) + (q[3] as number) * tx;
  return Number((top * (1 - ty) + bottom * ty).toFixed(1));
}

export function readFdrs(grid: FdrsGrid, lat: number, lng: number): FdrsReading | undefined {
  const values: Partial<Record<FdrsCode, number | null>> = {};
  for (const code of grid.codes) values[code] = sampleGrid(grid, code, lat, lng);

  const dc = values.dc ?? null;
  const fwi = values.fwi ?? null;
  if (dc === null && fwi === null) return undefined;

  return {
    values,
    dcBand: bandFor('dc', dc),
    fwiBand: bandFor('fwi', fwi),
    observationDate: grid.observationDate,
    source: grid.source,
  };
}

/** Beda hari antara grid FDRS dan tanggal akuisisi titik panas. */
export function dayGap(gridDate: string, hotspotDate: string): number | null {
  const a = Date.parse(`${gridDate}T00:00:00Z`);
  const b = Date.parse(`${hotspotDate}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86400000);
}

/**
 * Nama berkas grid yang diterbitkan bersama situs oleh GitHub Actions.
 * Berada di alamat yang sama dengan aplikasi, jadi tidak terhalang CORS.
 */
export const PUBLISHED_GRID = 'fdrs-latest.json';

/**
 * Memuat grid yang sudah diterbitkan bersama situs, kalau ada.
 *
 * Diam-diam gagal kalau berkasnya tidak ada, karena kondisi itu wajar: pada
 * pemasangan baru, atau saat menjalankan aplikasi di komputer sendiri, memang
 * belum ada grid yang diterbitkan. Impor manual tetap tersedia sebagai jalan
 * cadangan.
 */
export async function loadPublishedGrid(): Promise<FdrsGrid | null> {
  const base = import.meta.env.BASE_URL || '/';
  const url = `${base}${base.endsWith('/') ? '' : '/'}${PUBLISHED_GRID}`;
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return null;
    return parseFdrsGrid(await res.text(), PUBLISHED_GRID);
  } catch {
    return null;
  }
}

/** Validasi berkas grid yang diimpor, tanpa memercayai isinya begitu saja. */
export function parseFdrsGrid(text: string, fileName: string): FdrsGrid {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Berkas bukan JSON yang sah.');
  }
  const g = raw as Partial<FdrsGrid> & { kind?: string };
  if (g.kind !== 'fdrs-grid') {
    throw new Error('Berkas ini bukan grid FDRS. Hasilkan dengan scripts/fetch-fdrs.py.');
  }
  const required: (keyof FdrsGrid)[] = ['lonMin', 'latMin', 'dLon', 'dLat', 'nLon', 'nLat', 'grids', 'observationDate'];
  for (const key of required) {
    if (g[key] === undefined) throw new Error(`Grid FDRS tidak memuat medan "${String(key)}".`);
  }
  const expected = (g.nLon as number) * (g.nLat as number);
  for (const [code, arr] of Object.entries(g.grids as Record<string, unknown[]>)) {
    if (!Array.isArray(arr) || arr.length !== expected) {
      throw new Error(`Grid "${code}" berukuran ${Array.isArray(arr) ? arr.length : '?'}, seharusnya ${expected}.`);
    }
  }
  return {
    ...(g as FdrsGrid),
    fileName,
    codes: (g.codes && g.codes.length ? g.codes : (Object.keys(g.grids as object) as FdrsCode[])),
  };
}
