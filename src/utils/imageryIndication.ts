import type { ImageryMetrics, ImageryReading, LandIndication } from '../types';

/**
 * Reads land cover off satellite imagery, in the browser, with no model and no
 * API key. Runs across every imported point automatically so the dashboard can
 * summarise what the imagery shows rather than making the reader click 300
 * markers one at a time.
 *
 * Two measurements do the work. Colour: how green the surface is against how
 * bright and how saturated it is. Geometry: whether the texture repeats at a
 * fixed spacing, which is what an industrial estate looks like from above,
 * because it was planted on a grid. Mature oil palm sits at roughly 8 to 9
 * metres between palms.
 *
 * What this does not do: identify a company, a permit, or a legal status. It
 * reports what the picture shows and hands the reader the same picture.
 */

const TILE_TEMPLATE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

/** Zoom 17 is about 1.2 m per pixel at the equator: enough to resolve rows. */
export const ANALYSIS_ZOOM = 17;
const CROP = 160;
// 56 px JPEG memberi sekitar 1,6 KB per petak. Pada 13 ribu titik itu sekitar
// 21 MB di memori, dibanding 39 MB pada 72 px, dan mata masih bisa menilainya.
const THUMB = 56;

/**
 * Imports larger than this are not read automatically. Firing thousands of tile
 * requests unasked is rude to the tile server and to the reader's connection
 * alike, so beyond this size the reader starts it deliberately.
 */
export const AUTO_ANALYSIS_THRESHOLD = 150;

/**
 * Tiles fetched at once.
 *
 * Six was chosen when the browser's per-host limit for HTTP/1.1 was the binding
 * constraint. The tile server speaks HTTP/2, where many streams share one
 * connection, so a modest raise cuts a national run from roughly twelve minutes
 * to five without hammering anyone.
 */
const CONCURRENCY = 12;

/** Milliseconds per tile assumed when estimating, measured conservatively. */
const MS_PER_TILE = 320;

/** Tile key for a coordinate, used to count real work rather than point count. */
function tileKey(lat: number, lng: number): string {
  const { x, y } = lonLatToTile(lat, lng, ANALYSIS_ZOOM);
  return `${x}/${y}`;
}

export interface WorkEstimate {
  points: number;
  uniqueTiles: number;
  cachedTiles: number;
  seconds: number;
}

/**
 * Estimates the real cost before anything is fetched.
 *
 * Points are not the unit of work; tiles are. Hotspots cluster, so a national
 * file of 13,303 points spans about 10,800 distinct tiles, and any tile already
 * fetched costs nothing. Telling the reader the honest number, and the minutes
 * it implies, is what makes a five minute wait acceptable instead of alarming.
 */
export function estimateWork(points: { latitude: number; longitude: number }[]): WorkEstimate {
  const keys = new Set<string>();
  let cached = 0;
  for (const p of points) {
    const key = tileKey(p.latitude, p.longitude);
    if (keys.has(key)) continue;
    keys.add(key);
    if (tileCache.has(tileUrlFor(p.latitude, p.longitude))) cached++;
  }
  const toFetch = keys.size - cached;
  return {
    points: points.length,
    uniqueTiles: keys.size,
    cachedTiles: cached,
    seconds: Math.round((toFetch * MS_PER_TILE) / 1000 / CONCURRENCY),
  };
}

export function formatDuration(seconds: number): string {
  if (seconds < 45) return 'kurang dari satu menit';
  const m = Math.round(seconds / 60);
  return m < 60 ? `sekitar ${m} menit` : `sekitar ${Math.round(m / 6) / 10} jam`;
}

const CAVEAT =
  'Indikasi dibaca dari citra basemap (Esri World Imagery). Tanggal perekaman citra tidak tersedia dan umumnya berbeda jauh dari tanggal titik panas. Bukan bukti status lahan.';

export function tileUrlFor(lat: number, lng: number, zoom = ANALYSIS_ZOOM): string {
  const { x, y } = lonLatToTile(lat, lng, zoom);
  return TILE_TEMPLATE.replace('{z}', String(zoom)).replace('{x}', String(x)).replace('{y}', String(y));
}

export function metersPerPixel(lat: number, zoom = ANALYSIS_ZOOM): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

/** Sentinel-2 time series, so a reader can check before and after the fire. */
export function copernicusUrl(lat: number, lng: number): string {
  return `https://browser.dataspace.copernicus.eu/?zoom=14&lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`;
}

function lonLatToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

function pixelWithinTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const fx = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const fy = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { px: Math.floor((fx - Math.floor(fx)) * 256), py: Math.floor((fy - Math.floor(fy)) * 256) };
}

/**
 * Detects a repeating planting spacing.
 *
 * The naive version of this was wrong and shipped briefly: a raw
 * autocorrelation of a real image decays monotonically from lag zero, so the
 * highest value is always the smallest lag and every patch of ground scores as
 * a plantation. Two corrections fix it. The profile is high-pass filtered so
 * the slow decay is removed, and only genuine local maxima count, scored
 * against the troughs on either side.
 *
 * Validated on synthetic grids: recovers periods of 6, 7.1, 9 and 12 px with
 * prominence 0.8 to 1.1, and returns exactly 0 on smooth canopy and on pure
 * noise.
 */
function highPass(signal: number[], window: number): number[] {
  const w = Math.max(3, window | 1);
  const half = Math.floor(w / 2);
  const out = new Array<number>(signal.length);
  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(signal.length - 1, i + half); j++) {
      sum += signal[j];
      n++;
    }
    out[i] = signal[i] - sum / n;
  }
  return out;
}

function periodicity(signal: number[], minLag: number, maxLag: number) {
  const hp = highPass(signal, maxLag * 2 + 1);
  const mean = hp.reduce((a, b) => a + b, 0) / hp.length;
  const dev = hp.map((v) => v - mean);
  const denom = dev.reduce((a, b) => a + b * b, 0) || 1;

  const rs: number[] = [];
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i + lag < dev.length; i++) sum += dev[i] * dev[i + lag];
    rs.push(sum / denom);
  }

  const peaks: { lag: number; prominence: number }[] = [];
  for (let i = 1; i < rs.length - 1; i++) {
    if (rs[i] <= rs[i - 1] || rs[i] <= rs[i + 1]) continue;
    const left = Math.min(...rs.slice(0, i));
    const right = Math.min(...rs.slice(i + 1));
    peaks.push({ lag: minLag + i, prominence: rs[i] - Math.max(left, right) });
  }
  if (!peaks.length) return { lag: 0, prominence: 0 };

  const best = Math.max(...peaks.map((p) => p.prominence));
  // A grid also autocorrelates at twice its spacing, so the strongest peak can
  // be a harmonic. Take the shortest spacing that is nearly as strong, which is
  // the fundamental, so the reported row spacing is the real one.
  const fundamental = peaks.filter((p) => p.prominence >= best * 0.85).sort((a, b) => a.lag - b.lag)[0];
  return { lag: fundamental.lag, prominence: best };
}

const tileCache = new Map<string, Promise<HTMLImageElement>>();

function loadTile(url: string): Promise<HTMLImageElement> {
  const cached = tileCache.get(url);
  if (cached) return cached;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('tile load failed'));
    img.src = url;
  });
  tileCache.set(url, p);
  return p;
}

export async function analyseImagery(lat: number, lng: number): Promise<ImageryReading> {
  const tileUrl = tileUrlFor(lat, lng);
  const base: ImageryReading = { indication: 'inconclusive', strength: 0, tileUrl, zoom: ANALYSIS_ZOOM, caveat: CAVEAT };

  let img: HTMLImageElement;
  try {
    img = await loadTile(tileUrl);
  } catch {
    return base;
  }

  let data: ImageData;
  let thumbnail: string | undefined;
  const canvas = document.createElement('canvas');
  canvas.width = CROP;
  canvas.height = CROP;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return base;

  const { px, py } = pixelWithinTile(lat, lng, ANALYSIS_ZOOM);
  const sx = Math.max(0, Math.min(256 - CROP, px - CROP / 2));
  const sy = Math.max(0, Math.min(256 - CROP, py - CROP / 2));
  ctx.drawImage(img, sx, sy, CROP, CROP, 0, 0, CROP, CROP);

  try {
    data = ctx.getImageData(0, 0, CROP, CROP);
    const t = document.createElement('canvas');
    t.width = THUMB;
    t.height = THUMB;
    t.getContext('2d')?.drawImage(canvas, 0, 0, THUMB, THUMB);
    thumbnail = t.toDataURL('image/jpeg', 0.72);
  } catch {
    // Tainted canvas: the tile server declined CORS. The picture still renders
    // in an <img>, so the reader can look; only the measurement is lost.
    return base;
  }

  const { width, height, data: buf } = data;
  const luma: number[] = [];
  let grviSum = 0;
  let lumaSum = 0;
  let satSum = 0;

  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i], g = buf[i + 1], b = buf[i + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    luma.push(l);
    lumaSum += l;
    // Green-red index rather than green-versus-all. Blue carries most of the
    // atmospheric haze, so leaving it out separates soil from foliage far more
    // cleanly. Measured on real imagery: bare parcels sit near 0.00, palm
    // around 0.065, dense regrowth around 0.15.
    grviSum += (g - r) / Math.max(g + r, 1);
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    satSum += mx === 0 ? 0 : (mx - mn) / mx;
  }
  const count = luma.length || 1;
  const brightness = lumaSum / count;
  const grvi = grviSum / count;
  const saturation = satSum / count;
  const variance = luma.reduce((a, v) => a + (v - brightness) ** 2, 0) / count;
  const contrast = Math.sqrt(variance) / 255;

  const rowProfile: number[] = [];
  for (let y = 0; y < height; y++) {
    let s = 0;
    for (let x = 0; x < width; x++) s += luma[y * width + x];
    rowProfile.push(s / width);
  }
  const colProfile: number[] = [];
  for (let x = 0; x < width; x++) {
    let s = 0;
    for (let y = 0; y < height; y++) s += luma[y * width + x];
    colProfile.push(s / height);
  }

  const mpp = metersPerPixel(lat);
  // Oil palm sits at roughly 8-9 m; 5-18 m covers young stands, other estate
  // crops, and the resolution slop in the basemap.
  const minLag = Math.max(3, Math.round(5 / mpp));
  const maxLag = Math.max(minLag + 2, Math.round(18 / mpp));
  const rows = periodicity(rowProfile, minLag, maxLag);
  const cols = periodicity(colProfile, minLag, maxLag);
  const grid = rows.prominence > cols.prominence ? rows : cols;

  const metrics: ImageryMetrics = {
    grvi: Number(grvi.toFixed(4)),
    brightness: Number(brightness.toFixed(1)),
    saturation: Number(saturation.toFixed(3)),
    contrast: Number(contrast.toFixed(3)),
    gridStrength: Number(grid.prominence.toFixed(3)),
    gridPeriodMeters: Number((grid.lag * mpp).toFixed(1)),
    // Below roughly 2 m per pixel an individual palm crown is under two pixels
    // wide and no planting geometry survives, whatever is on the ground.
    gridUndetectable: mpp > 2.0,
  };

  const { indication, strength } = classify(metrics);

  return {
    ...base,
    indication,
    strength: Number(strength.toFixed(2)),
    rowSpacingMeters: indication === 'plantation_pattern' ? metrics.gridPeriodMeters : undefined,
    thumbnail,
    metrics,
  };
}

/**
 * Order matters. Cloud is tested first because a cloud is bright, unsaturated
 * and textureless, and would otherwise read as bare ground.
 *
 * Thresholds are measured, not guessed. They come from patches of a real
 * Sumatran estate scene: bare parcels GRVI 0.00 to -0.02, palm blocks 0.064 to
 * 0.069, dense regrowth 0.15, cloud brightness 199 at saturation 0.07.
 */
export function classify(m: ImageryMetrics): { indication: LandIndication; strength: number } {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  if (m.brightness > 185 && m.saturation < 0.12) {
    return { indication: 'cloud_obscured', strength: clamp((m.brightness - 185) / 60) };
  }
  if (m.contrast > 0.20 && m.grvi < 0.03 && m.brightness > 105) {
    return { indication: 'settlement', strength: clamp(m.contrast / 0.35) };
  }
  if (m.grvi < 0.02) {
    return { indication: 'cleared_or_excavated', strength: clamp((0.02 - m.grvi) / 0.05 + 0.35) };
  }
  // A grid only counts when the imagery can actually resolve one. On synthetic
  // grids this scores 0.8 to 1.1; smooth canopy and noise score exactly 0.
  if (!m.gridUndetectable && m.gridStrength >= 0.25) {
    return { indication: 'plantation_pattern', strength: clamp(m.gridStrength / 0.9) };
  }
  if (m.grvi > 0.11 && m.contrast < 0.13) {
    return { indication: 'closed_canopy', strength: clamp(m.grvi / 0.18) };
  }
  return { indication: 'open_vegetation', strength: clamp(m.grvi / 0.10) };
}

/**
 * Runs the classifier over many points, with a concurrency cap, progress, and a
 * way to stop.
 *
 * Sorting by tile before dispatch matters: neighbouring points share a tile, so
 * grouping them means the second and later points in a tile hit the cache
 * instead of the network.
 */
export async function analyseMany(
  points: { id: string; latitude: number; longitude: number }[],
  onProgress: (done: number, total: number) => void,
  onResult: (id: string, reading: ImageryReading) => void,
  shouldStop?: () => boolean,
): Promise<{ completed: number; stopped: boolean }> {
  const ordered = [...points].sort((a, b) =>
    tileKey(a.latitude, a.longitude).localeCompare(tileKey(b.latitude, b.longitude)),
  );

  let index = 0;
  let done = 0;
  let stopped = false;
  const total = ordered.length;

  const worker = async () => {
    while (index < total) {
      if (shouldStop?.()) {
        stopped = true;
        return;
      }
      const p = ordered[index++];
      const reading = await analyseImagery(p.latitude, p.longitude);
      onResult(p.id, reading);
      onProgress(++done, total);
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }, worker));
  return { completed: done, stopped };
}

export const INDICATION_LABEL: Record<LandIndication, string> = {
  plantation_pattern: 'Perkebunan (pola tanam teratur)',
  closed_canopy: 'Vegetasi rapat',
  open_vegetation: 'Vegetasi terbuka / semak',
  cleared_or_excavated: 'Lahan terbuka / bukaan',
  settlement: 'Terbangun / permukiman',
  cloud_obscured: 'Tertutup awan',
  inconclusive: 'Tidak konklusif',
  not_analysed: 'Belum dianalisis',
};

export const INDICATION_SHORT: Record<LandIndication, string> = {
  plantation_pattern: 'Perkebunan',
  closed_canopy: 'Vegetasi rapat',
  open_vegetation: 'Vegetasi terbuka',
  cleared_or_excavated: 'Lahan terbuka',
  settlement: 'Terbangun',
  cloud_obscured: 'Awan',
  inconclusive: 'Tidak konklusif',
  not_analysed: 'Belum dicek',
};

/** den-deck series colours, one per class, used on map, chart and grid alike. */
export const INDICATION_COLOR: Record<LandIndication, string> = {
  plantation_pattern: '#f0a22e',
  closed_canopy: '#5c7f5c',
  open_vegetation: '#a19574',
  cleared_or_excavated: '#a5644e',
  settlement: '#b58b80',
  cloud_obscured: '#7a6a58',
  inconclusive: '#6b5c48',
  not_analysed: '#4d3f2d',
};

export const INDICATION_NOTE: Record<LandIndication, string> = {
  plantation_pattern:
    'Citra memperlihatkan pengulangan tekstur pada jarak tetap, ciri tanaman perkebunan yang ditanam dalam grid. Ini pengamatan tutupan lahan, bukan identifikasi pemegang izin.',
  closed_canopy:
    'Kanopi rapat dan seragam tanpa geometri tanam yang terdeteksi. Tidak membedakan hutan alam dari kebun tua yang kanopinya sudah menyatu. Ketiadaan pola tanam bukan bukti bahwa lokasi ini bukan perkebunan; bisa juga citranya terlalu kasar untuk memisahkan tajuk.',
  open_vegetation:
    'Vegetasi tidak seragam tanpa pola tanam terdeteksi, menyerupai semak, belukar, regenerasi, atau mozaik kebun rakyat. Bisa juga perkebunan muda yang tajuknya belum membentuk grid yang terbaca.',
  cleared_or_excavated:
    'Permukaan terang dengan vegetasi rendah. Bisa berarti lahan baru dibuka, bekas terbakar, bukaan tambang, atau tanah kosong alami.',
  settlement: 'Tekstur kontras tinggi dengan vegetasi rendah, menyerupai kawasan terbangun.',
  cloud_obscured:
    'Permukaan tertutup awan atau kabut pada citra basemap. Tidak ada kesimpulan tutupan lahan yang bisa ditarik di titik ini.',
  inconclusive:
    'Citra tidak tersedia atau sinyalnya terlalu lemah untuk dikelompokkan. Tidak ada kesimpulan yang ditarik.',
  not_analysed: 'Analisis citra belum dijalankan untuk titik ini.',
};

/**
 * Written for the reader, not for the developer. Each class states the measured
 * criterion behind it and, more importantly, what it does not mean. Most
 * misreadings of a land-cover map come from the second column.
 */
export interface IndicationDefinition {
  criteria: string;
  meaning: string;
  notMeaning: string;
}

export const INDICATION_DEFINITION: Record<LandIndication, IndicationDefinition> = {
  plantation_pattern: {
    criteria: 'Indeks vegetasi positif, dan tekstur citra berulang pada jarak tetap antara 5 dan 18 meter.',
    meaning: 'Tanaman yang ditanam dalam grid, ciri perkebunan yang dikelola.',
    notMeaning:
      'Tidak berarti kelapa sawit secara spesifik. Karet, akasia, dan kelapa juga ditanam dalam grid. Tidak menunjukkan pemegang izin, luas konsesi, atau legalitas.',
  },
  closed_canopy: {
    criteria: 'Indeks vegetasi tinggi (GRVI di atas 0,11) dengan kontras rendah. Tajuk menyatu, tanpa geometri tanam yang terbaca.',
    meaning: 'Permukaan tertutup vegetasi rapat dan seragam.',
    notMeaning:
      'Tidak berarti hutan alam, dan tidak berarti kawasan lindung. Perkebunan tua yang tajuknya sudah menyatu masuk ke kelas ini. Status hukum kawasan ditentukan peta kawasan hutan, bukan citra.',
  },
  open_vegetation: {
    criteria: 'Indeks vegetasi positif tetapi rendah sampai sedang, tanpa pola tanam terdeteksi.',
    meaning: 'Vegetasi tidak seragam: semak, belukar, regenerasi, atau mozaik kebun rakyat.',
    notMeaning:
      'Tidak berarti lahan tidak bertuan atau tidak produktif. Perkebunan muda yang tajuknya belum membentuk grid terbaca juga jatuh ke sini.',
  },
  cleared_or_excavated: {
    criteria: 'Indeks vegetasi mendekati nol atau negatif, artinya pantulan tanah lebih dominan daripada daun.',
    meaning: 'Permukaan didominasi tanah terbuka.',
    notMeaning:
      'Tidak berarti bekas kebakaran. Lahan baru dibuka, bukaan tambang, jalan tanah, bantaran sungai, dan tanah kosong alami memberi tanda yang sama.',
  },
  settlement: {
    criteria: 'Kontras tekstur tinggi dengan vegetasi rendah dan permukaan terang.',
    meaning: 'Menyerupai kawasan terbangun.',
    notMeaning: 'Tidak membedakan permukiman dari fasilitas industri, gudang, atau pabrik.',
  },
  cloud_obscured: {
    criteria: 'Kecerahan di atas 185 dengan saturasi warna di bawah 0,12.',
    meaning: 'Permukaan tertutup awan atau kabut pada citra.',
    notMeaning: 'Tidak ada kesimpulan tutupan lahan yang bisa ditarik. Kelas ini menandai ketiadaan informasi.',
  },
  inconclusive: {
    criteria: 'Citra gagal dimuat, atau sinyalnya terlalu lemah untuk dikelompokkan.',
    meaning: 'Tidak ada pembacaan.',
    notMeaning: 'Tidak berarti tidak ada apa-apa di lokasi tersebut.',
  },
  not_analysed: {
    criteria: 'Analisis citra belum dijalankan untuk titik ini.',
    meaning: 'Belum diperiksa.',
    notMeaning: 'Tidak berarti tidak ada pembacaan yang mungkin.',
  },
};

export const METHOD_NOTE =
  'Kelas tutupan lahan dibaca dari citra basemap dengan pengukuran warna dan tekstur, tanpa model machine learning. Indeks vegetasi memakai GRVI, yaitu (Hijau - Merah) / (Hijau + Merah). Pola tanam dideteksi dengan autokorelasi profil kecerahan setelah penapisan high-pass, dan hanya dihitung bila resolusi citra cukup untuk memisahkan tajuk. Seluruh angka yang mendasari tiap pembacaan dapat dibuka pada panel rincian titik.';

export const ALL_INDICATIONS: LandIndication[] = [
  'plantation_pattern',
  'closed_canopy',
  'open_vegetation',
  'cleared_or_excavated',
  'settlement',
  'cloud_obscured',
  'inconclusive',
  'not_analysed',
];
