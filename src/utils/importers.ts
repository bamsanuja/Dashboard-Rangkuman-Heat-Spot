import type { DataProvenance, FdrsGrid, Hotspot, SatelliteSensor } from '../types';
import { parseFdrsGrid } from './fdrs';
import {
  SENSOR_SPECS, makeBrightness, makeConfidence, resolveClock, shiftIsoDate,
} from './sensors';

/**
 * Import is the only way data enters this app. Nothing is bundled, nothing is
 * generated, nothing is inferred. A row that cannot be read is skipped and
 * counted, never filled in with a plausible value.
 *
 * Supported:
 *   - SiPongi+ export (TXT / CSV / KML / KMZ) from
 *     https://sipongi.gakkum.kehutanan.go.id/sebaran-titik-panas
 *   - NASA FIRMS area CSV (VIIRS or MODIS)
 *
 * SiPongi+ requires attribution: "Setiap penggunaan data yang bersumber dari
 * website ini, wajib mencantumkan sumber: SIPONGI KEMENHUT". The app carries
 * that string on every screen once SiPongi+ data is loaded.
 */

export const SIPONGI_ATTRIBUTION = 'Sumber: SIPONGI KEMENHUT';
export const FIRMS_ATTRIBUTION = 'Sumber: NASA FIRMS (LANCE / ESDIS)';
export const SIPONGI_DOWNLOAD_URL = 'https://sipongi.gakkum.kehutanan.go.id/sebaran-titik-panas';

export interface ImportResult {
  hotspots: Hotspot[];
  provenance: DataProvenance;
  /** Human-readable reasons rows were dropped, deduplicated with counts. */
  skipped: { reason: string; count: number }[];
  warnings: string[];
}

const HEADER_ALIASES: Record<string, string[]> = {
  latitude: ['latitude', 'lat', 'lintang', 'y'],
  longitude: ['longitude', 'longitude_', 'lon', 'long', 'lng', 'bujur', 'x'],
  satellite: ['satellite', 'satelit', 'sensor', 'instrument', 'instrumen'],
  confidence: ['confidence', 'kepercayaan', 'conf', 'tingkat_kepercayaan'],
  brightness: ['brightness', 'bright_ti4', 'bright_t4', 'suhu', 'kecerahan', 'temp'],
  frp: ['frp', 'fire_radiative_power', 'radiative'],
  date: ['acq_date', 'tanggal', 'date', 'hotspot_date', 'tgl'],
  time: ['acq_time', 'waktu', 'time', 'jam'],
  province: ['provinsi', 'province', 'prov', 'state'],
  district: ['kab/kota', 'kab kota', 'kabkota', 'kab_kota', 'kabupaten', 'district', 'county', 'kabupaten/kota'],
  subdistrict: ['kecamatan', 'kec', 'subdistrict'],
  village: ['desa', 'kelurahan', 'village', 'desa/kelurahan'],
};

function normaliseHeader(h: string) {
  return h.trim().toLowerCase().replace(/^"|"$/g, '');
}

function buildColumnMap(headers: string[]) {
  const map: Record<string, number> = {};
  headers.forEach((raw, i) => {
    const h = normaliseHeader(raw);
    for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(h) && map[canonical] === undefined) map[canonical] = i;
    }
  });
  return map;
}

function detectDelimiter(line: string) {
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = 0;
  for (const c of candidates) {
    const n = line.split(c).length;
    if (n > bestCount) {
      bestCount = n;
      best = c;
    }
  }
  return best;
}

function splitRow(line: string, delim: string) {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === delim && !inQuotes) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** Maps whatever the source calls a platform onto a sensor we have specs for. */
export function resolveSensor(satelliteField: string, instrumentField?: string): SatelliteSensor | null {
  const s = `${satelliteField} ${instrumentField ?? ''}`.toLowerCase().replace(/[\s_]/g, '');
  if (s.includes('noaa21') || s.includes('jpss2') || s === 'n21') return 'VIIRS / NOAA-21';
  if (s.includes('noaa20') || s.includes('jpss1') || s.includes('n20') || /^1$/.test(satelliteField.trim())) return 'VIIRS / NOAA-20';
  if (s.includes('snpp') || s.includes('suomi') || s.includes('npp') || /^n$/.test(satelliteField.trim().toLowerCase())) return 'VIIRS / SNPP';
  if (s.includes('terra')) return 'MODIS / Terra';
  if (s.includes('aqua')) return 'MODIS / Aqua';
  // SiPongi+ writes plain "NASA-MODIS". The platform is genuinely absent from
  // the file, so it is recorded as unspecified rather than assumed.
  if (s.includes('modis')) return 'MODIS (Terra atau Aqua)';
  return null;
}

/**
 * Reads a clock field and the zone it was stamped with, if any.
 *
 * This matters more than it looks. FIRMS gives UTC with no label. SiPongi+
 * gives a local clock labelled WIB on every single row, including points in
 * Maluku and Kalimantan whose civil time is WITA or WIT. Treating the two
 * sources the same way shifts half a national export by hours.
 */
function normaliseTime(raw: string): { hhmm: string; zone: string | null } | null {
  const zoneMatch = raw.match(/\b(WIB|WITA|WIT)\b/i);
  const zone = zoneMatch ? zoneMatch[1].toUpperCase() : null;
  const t = raw.trim().replace(/[^0-9:]/g, '');
  if (!t) return null;
  if (t.includes(':')) {
    const [h, m] = t.split(':');
    if (h === undefined || m === undefined) return null;
    return { hhmm: `${h.padStart(2, '0')}:${m.slice(0, 2).padStart(2, '0')}`, zone };
  }
  const digits = t.padStart(4, '0');
  return { hhmm: `${digits.slice(0, 2)}:${digits.slice(2, 4)}`, zone };
}

/**
 * Resolves a source clock into a complete, self-consistent record of when the
 * detection happened, in both frames.
 */
function resolveTimes(clock: { hhmm: string; zone: string | null }, isoDate: string, lng: number) {
  const r = resolveClock(clock.hhmm, clock.zone, lng);
  if (!r) return null;
  const localDate = shiftIsoDate(isoDate, r.localDayShift);
  return {
    date: localDate,
    dateUtc: shiftIsoDate(isoDate, r.utcDayShift),
    utc: r.utc,
    local: `${r.local} ${r.zoneLabel}`,
    source: clock.zone ? `${clock.hhmm} ${clock.zone}` : `${clock.hhmm} UTC`,
    zoneMismatch: clock.zone !== null && clock.zone !== r.zoneLabel,
    dateShifted: localDate !== isoDate,
  };
}

/** Decimal places actually written for a coordinate, as a precision proxy. */
function decimalsOf(raw: string): number {
  const m = raw.trim().match(/\.(\d+)$/);
  return m ? m[1].length : 0;
}

function normaliseDate(raw: string): string | null {
  const t = raw.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const dmy = t.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return null;
}

export function parseDelimited(text: string, fileName: string): ImportResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error('Berkas kosong atau tidak memiliki baris data.');

  const delim = detectDelimiter(lines[0]);
  const headers = splitRow(lines[0], delim);
  const col = buildColumnMap(headers);

  const missing = ['latitude', 'longitude', 'satellite'].filter((k) => col[k] === undefined);
  if (missing.length) {
    throw new Error(
      `Kolom wajib tidak ditemukan: ${missing.join(', ')}. ` +
        'Tabel rekapitulasi SiPongi+ (Satelit / Kab-Kota / Provinsi / Kepercayaan / Jumlah) tidak memuat koordinat, ' +
        'sehingga tidak bisa dipetakan. Gunakan unduhan KMZ atau TXT yang berisi titik.',
    );
  }

  const isFirms = headers.some((h) => normaliseHeader(h) === 'acq_date');
  const hotspots: Hotspot[] = [];
  const skipReasons = new Map<string, number>();
  const warnings: string[] = [];

  const drop = (reason: string) => skipReasons.set(reason, (skipReasons.get(reason) ?? 0) + 1);

  for (let i = 1; i < lines.length; i++) {
    const cells = splitRow(lines[i], delim);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => (raw[normaliseHeader(h)] = cells[idx] ?? ''));

    const lat = Number(cells[col.latitude]);
    const lng = Number(cells[col.longitude]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      drop('Koordinat tidak valid');
      continue;
    }

    const instrumentIdx = headers.findIndex((h) => normaliseHeader(h) === 'instrument');
    const sensor = resolveSensor(cells[col.satellite] ?? '', instrumentIdx >= 0 ? cells[instrumentIdx] : undefined);
    if (!sensor) {
      drop(`Satelit tidak dikenali: "${cells[col.satellite] ?? ''}"`);
      continue;
    }

    const spec = SENSOR_SPECS[sensor];
    const confRaw = col.confidence !== undefined ? cells[col.confidence] ?? '' : '';
    const confidence = makeConfidence(sensor, confRaw);
    if (!confidence) {
      drop(
        spec.family === 'VIIRS'
          ? 'Kepercayaan VIIRS harus kategorikal (low/nominal/high), nilai persen ditolak'
          : 'Kepercayaan MODIS tidak terbaca sebagai persentase 0-100',
      );
      continue;
    }

    const rawDate = col.date !== undefined ? normaliseDate(cells[col.date] ?? '') : null;
    const clock = col.time !== undefined ? normaliseTime(cells[col.time] ?? '') : null;
    if (!rawDate || !clock) {
      drop('Tanggal atau waktu akuisisi tidak terbaca');
      continue;
    }
    const times = resolveTimes(clock, rawDate, lng);
    if (!times) {
      drop(`Zona waktu tidak dikenali: "${cells[col.time] ?? ''}"`);
      continue;
    }
    const coordDecimals = Math.min(decimalsOf(cells[col.latitude] ?? ''), decimalsOf(cells[col.longitude] ?? ''));

    const kelvin = col.brightness !== undefined ? Number(cells[col.brightness]) : NaN;
    const frp = col.frp !== undefined ? Number(cells[col.frp]) : NaN;
    const pickCol = (key: string) => (col[key] !== undefined ? cells[col[key]] || undefined : undefined);

    hotspots.push({
      id: `${sensor}-${times.date}-${times.utc}-${lat.toFixed(5)}-${lng.toFixed(5)}`,
      latitude: lat,
      longitude: lng,
      confidence,
      brightness: makeBrightness(sensor, Number.isFinite(kelvin) ? kelvin : 0),
      frp: Number.isFinite(frp) ? frp : 0,
      satellite: sensor,
      family: spec.family,
      footprintMeters: spec.footprintMeters,
      acquisitionDate: times.date,
      acquisitionDateUtc: times.dateUtc,
      acquisitionTimeUtc: times.utc,
      acquisitionTimeLocal: times.local,
      acquisitionTimeSource: times.source,
      acquisitionDateSource: rawDate,
      zoneMismatch: times.zoneMismatch,
      dateShifted: times.dateShifted,
      coordDecimals,
      // Below three decimals a coordinate is good to roughly a kilometre or
      // worse, which is coarser than the sensor footprint it claims.
      lowPrecision: coordDecimals < 3,
      province: pickCol('province'),
      district: pickCol('district'),
      subdistrict: pickCol('subdistrict'),
      village: pickCol('village'),
      sourceRow: raw,
    });
  }

  const saturated = hotspots.filter((h) => h.brightness.saturated).length;
  if (saturated > 0) {
    warnings.push(`${saturated} baris berada pada atau di atas ambang saturasi kanal, nilai suhu ditampilkan apa adanya.`);
  }
  const noBrightness = hotspots.filter((h) => h.brightness.kelvin === 0).length;
  if (noBrightness > 0) {
    warnings.push(`${noBrightness} baris tanpa nilai suhu kecerahan, ditampilkan sebagai tidak tersedia.`);
  }
  const mismatched = hotspots.filter((h) => h.zoneMismatch).length;
  if (mismatched > 0) {
    warnings.push(
      `${mismatched} baris diberi label zona waktu yang tidak sesuai bujurnya oleh berkas sumber. ` +
        'Waktu lokal dihitung ulang dari bujur titik, dan nilai asli dari berkas tetap ditampilkan pada rincian titik.',
    );
  }
  const shifted = hotspots.filter((h) => h.dateShifted).length;
  if (shifted > 0) {
    warnings.push(
      `${shifted} baris jatuh pada tanggal lokal yang berbeda dari tanggal di berkas, karena perekamannya lewat ` +
        'tengah malam waktu setempat. Aplikasi mengelompokkan berdasarkan tanggal lokal, sehingga jumlah per ' +
        'tanggal bisa berbeda dari rekapitulasi SiPongi+.',
    );
  }
  const coarse = hotspots.filter((h) => h.lowPrecision).length;
  if (coarse > 0) {
    warnings.push(
      `${coarse} baris memiliki koordinat dengan presisi di bawah tiga desimal, yaitu sekitar satu kilometer ` +
        'atau lebih kasar. Titik-titik itu tetap dimuat dan ditandai, tetapi tidak layak dipakai untuk pembacaan ' +
        'citra maupun penentuan posisi terhadap batas kawasan.',
    );
  }
  const platforms = new Set(hotspots.map((h) => h.family));
  if (platforms.size > 1) {
    warnings.push(
      'Berkas memuat lebih dari satu keluarga sensor. Tingkat kepercayaan MODIS dan VIIRS dihasilkan algoritma ' +
        'yang berbeda dan tidak setara, sehingga menyaring "Tinggi" lintas platform condong ke MODIS.',
    );
  }

  return {
    hotspots,
    provenance: {
      sourceLabel: isFirms ? 'NASA FIRMS' : 'SiPongi+ Kementerian Kehutanan',
      fileName,
      format: isFirms ? 'firms-csv' : fileName.toLowerCase().endsWith('.txt') ? 'sipongi-txt' : 'sipongi-csv',
      importedAt: new Date().toISOString(),
      rowCount: hotspots.length,
      skippedCount: lines.length - 1 - hotspots.length,
      attribution: isFirms ? FIRMS_ATTRIBUTION : SIPONGI_ATTRIBUTION,
    },
    skipped: [...skipReasons.entries()].map(([reason, count]) => ({ reason, count })),
    warnings,
  };
}

/** Minimal ZIP reader, enough to pull the .kml out of a SiPongi+ .kmz. */
async function extractKmlFromKmz(buffer: ArrayBuffer): Promise<string> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length - 4; i++) {
    if (view.getUint32(i, true) !== 0x04034b50) continue;
    const method = view.getUint16(i + 8, true);
    const compressedSize = view.getUint32(i + 18, true);
    const nameLen = view.getUint16(i + 26, true);
    const extraLen = view.getUint16(i + 28, true);
    const nameBytes = bytes.slice(i + 30, i + 30 + nameLen);
    const name = new TextDecoder().decode(nameBytes);
    const dataStart = i + 30 + nameLen + extraLen;
    if (!name.toLowerCase().endsWith('.kml')) continue;

    const slice = bytes.slice(dataStart, dataStart + compressedSize);
    if (method === 0) return new TextDecoder().decode(slice);
    if (method === 8) {
      const ds = new DecompressionStream('deflate-raw');
      const stream = new Blob([slice as unknown as BlobPart]).stream().pipeThrough(ds);
      return await new Response(stream).text();
    }
    throw new Error(`Metode kompresi ZIP tidak didukung (${method}).`);
  }
  throw new Error('Tidak menemukan berkas .kml di dalam .kmz.');
}

export async function parseKmlOrKmz(file: File): Promise<ImportResult> {
  const isKmz = file.name.toLowerCase().endsWith('.kmz');
  const text = isKmz ? await extractKmlFromKmz(await file.arrayBuffer()) : await file.text();

  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('KML tidak dapat dibaca.');

  const placemarks = [...doc.getElementsByTagName('Placemark')];
  if (!placemarks.length) throw new Error('KML tidak memuat Placemark.');

  const hotspots: Hotspot[] = [];
  const skipReasons = new Map<string, number>();
  const drop = (reason: string) => skipReasons.set(reason, (skipReasons.get(reason) ?? 0) + 1);

  for (const pm of placemarks) {
    const coordText = pm.getElementsByTagName('coordinates')[0]?.textContent?.trim();
    if (!coordText) {
      drop('Placemark tanpa koordinat');
      continue;
    }
    const [lngS, latS] = coordText.split(/\s+/)[0].split(',');
    const lng = Number(lngS);
    const lat = Number(latS);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      drop('Koordinat Placemark tidak valid');
      continue;
    }

    // SiPongi+ writes attributes as ExtendedData/Data name=value pairs, and
    // falls back to a description table. Read both, prefer the structured one.
    const attrs: Record<string, string> = {};
    for (const d of [...pm.getElementsByTagName('Data')]) {
      const key = d.getAttribute('name')?.trim().toLowerCase();
      const val = d.getElementsByTagName('value')[0]?.textContent?.trim();
      if (key && val) attrs[key] = val;
    }
    for (const d of [...pm.getElementsByTagName('SimpleData')]) {
      const key = d.getAttribute('name')?.trim().toLowerCase();
      const val = d.textContent?.trim();
      if (key && val) attrs[key] = val;
    }

    const pick = (canonical: string) => {
      for (const alias of HEADER_ALIASES[canonical] ?? []) if (attrs[alias]) return attrs[alias];
      return '';
    };

    const sensor = resolveSensor(pick('satellite'));
    if (!sensor) {
      drop(`Satelit tidak dikenali: "${pick('satellite')}"`);
      continue;
    }
    const spec = SENSOR_SPECS[sensor];
    const confidence = makeConfidence(sensor, pick('confidence'));
    if (!confidence) {
      drop('Kepercayaan tidak sesuai format produk satelit');
      continue;
    }
    const rawDate = normaliseDate(pick('date'));
    const clock = normaliseTime(pick('time'));
    if (!rawDate || !clock) {
      drop('Tanggal atau waktu akuisisi tidak terbaca');
      continue;
    }
    const times = resolveTimes(clock, rawDate, lng);
    if (!times) {
      drop('Zona waktu tidak dikenali');
      continue;
    }
    const coordDecimals = Math.min(decimalsOf(latS ?? ''), decimalsOf(lngS ?? ''));
    const kelvin = Number(pick('brightness'));
    const frp = Number(pick('frp'));

    hotspots.push({
      id: `${sensor}-${times.date}-${times.utc}-${lat.toFixed(5)}-${lng.toFixed(5)}`,
      latitude: lat,
      longitude: lng,
      confidence,
      brightness: makeBrightness(sensor, Number.isFinite(kelvin) ? kelvin : 0),
      frp: Number.isFinite(frp) ? frp : 0,
      satellite: sensor,
      family: spec.family,
      footprintMeters: spec.footprintMeters,
      acquisitionDate: times.date,
      acquisitionDateUtc: times.dateUtc,
      acquisitionTimeUtc: times.utc,
      acquisitionTimeLocal: times.local,
      acquisitionTimeSource: times.source,
      acquisitionDateSource: rawDate,
      zoneMismatch: times.zoneMismatch,
      dateShifted: times.dateShifted,
      coordDecimals,
      lowPrecision: coordDecimals < 3,
      province: pick('province') || undefined,
      district: pick('district') || undefined,
      subdistrict: pick('subdistrict') || undefined,
      village: pick('village') || undefined,
      sourceRow: attrs,
    });
  }

  return {
    hotspots,
    provenance: {
      sourceLabel: 'SiPongi+ Kementerian Kehutanan',
      fileName: file.name,
      format: 'sipongi-kmz',
      importedAt: new Date().toISOString(),
      rowCount: hotspots.length,
      skippedCount: placemarks.length - hotspots.length,
      attribution: SIPONGI_ATTRIBUTION,
    },
    skipped: [...skipReasons.entries()].map(([reason, count]) => ({ reason, count })),
    warnings: [],
  };
}

export async function importFile(file: File): Promise<ImportResult> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.kml') || lower.endsWith('.kmz')) return parseKmlOrKmz(file);
  if (lower.endsWith('.xlsx')) {
    throw new Error(
      'Format XLSX belum didukung. Di halaman SiPongi+ pilih "Download TXT" atau "Download KMZ", ' +
        'atau simpan XLSX sebagai CSV terlebih dahulu.',
    );
  }
  return parseDelimited(await file.text(), file.name);
}

export type AnyImport =
  | { kind: 'hotspots'; result: ImportResult }
  | { kind: 'fdrs'; grid: FdrsGrid };

/**
 * One import surface for both kinds of file. The FDRS grid is JSON produced by
 * scripts/fetch-fdrs.py; everything else is read as hotspots.
 */
export async function importAny(file: File): Promise<AnyImport> {
  if (file.name.toLowerCase().endsWith('.json')) {
    return { kind: 'fdrs', grid: parseFdrsGrid(await file.text(), file.name) };
  }
  return { kind: 'hotspots', result: await importFile(file) };
}
