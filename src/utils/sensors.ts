import type { BrightnessReading, Confidence, ConfidenceLevel, SatelliteSensor, SensorFamily } from '../types';

/**
 * Sensor facts, from the NASA FIRMS FAQ and the VIIRS 375 m active-fire ATBD.
 * These numbers bound what the app is allowed to claim.
 */
export const SENSOR_SPECS: Record<SatelliteSensor, {
  family: SensorFamily;
  footprintMeters: number;
  band: BrightnessReading['band'];
  saturationK: number;
  overpassLocalSolarHour: number;
  overpassToleranceMinutes: number;
}> = {
  'VIIRS / SNPP':    { family: 'VIIRS', footprintMeters: 375,  band: 'bright_ti4',     saturationK: 367, overpassLocalSolarHour: 13.5,  overpassToleranceMinutes: 55 },
  'VIIRS / NOAA-20': { family: 'VIIRS', footprintMeters: 375,  band: 'bright_ti4',     saturationK: 367, overpassLocalSolarHour: 12.67, overpassToleranceMinutes: 55 },
  'VIIRS / NOAA-21': { family: 'VIIRS', footprintMeters: 375,  band: 'bright_ti4',     saturationK: 367, overpassLocalSolarHour: 13.5,  overpassToleranceMinutes: 55 },
  'MODIS / Terra':   { family: 'MODIS', footprintMeters: 1000, band: 'brightness_t21', saturationK: 506, overpassLocalSolarHour: 10.5,  overpassToleranceMinutes: 42 },
  'MODIS / Aqua':    { family: 'MODIS', footprintMeters: 1000, band: 'brightness_t21', saturationK: 506, overpassLocalSolarHour: 13.5,  overpassToleranceMinutes: 42 },
  // SiPongi+ reports MODIS without naming Terra or Aqua. Both share the same
  // footprint and band, so everything except the overpass window is identical.
  // The window is widened to span both platforms rather than guessing one.
  'MODIS (Terra atau Aqua)': { family: 'MODIS', footprintMeters: 1000, band: 'brightness_t21', saturationK: 506, overpassLocalSolarHour: 12.0, overpassToleranceMinutes: 132 },
};

export const SENSOR_LIST = Object.keys(SENSOR_SPECS) as SatelliteSensor[];

export const BAND_LABEL: Record<BrightnessReading['band'], string> = {
  bright_ti4: 'Kanal I-4 (3,74 um), saturasi 367 K',
  brightness_t21: 'Kanal 21/22 (~4 um)',
};

/** MODIS confidence buckets, exactly as FIRMS documents them. */
export function bucketModisConfidence(pct: number): ConfidenceLevel {
  if (pct >= 80) return 'high';
  if (pct >= 30) return 'nominal';
  return 'low';
}

/**
 * FIRMS writes l / n / h. SiPongi+ writes Low / Medium / High for both product
 * families, where "Medium" is its word for what FIRMS calls nominal.
 */
const CATEGORICAL: Record<string, ConfidenceLevel> = {
  l: 'low', low: 'low', rendah: 'low',
  n: 'nominal', nominal: 'nominal', medium: 'nominal', sedang: 'nominal', menengah: 'nominal',
  h: 'high', high: 'high', tinggi: 'high',
};

/**
 * VIIRS reports confidence categorically, so a percentage in a VIIRS row means
 * the file is not what it claims and the row is refused rather than coerced.
 *
 * MODIS is reported as a percentage by FIRMS and as a category by SiPongi+,
 * which has already bucketed it. Both are accepted, and which one arrived is
 * preserved so the UI never invents a precision the source did not carry.
 */
export function makeConfidence(sensor: SatelliteSensor, raw: string): Confidence | null {
  const family = SENSOR_SPECS[sensor].family;
  const token = raw.trim().toLowerCase();
  if (!token) return null;

  const level = CATEGORICAL[token];
  if (level) return { kind: 'categorical', level };
  if (family === 'VIIRS') return null;

  const pct = Number(token);
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) return null;
  return { kind: 'percent', value: pct, level: bucketModisConfidence(pct) };
}

export function makeBrightness(sensor: SatelliteSensor, kelvin: number): BrightnessReading {
  const spec = SENSOR_SPECS[sensor];
  return { band: spec.band, kelvin, saturated: kelvin > 0 && kelvin >= spec.saturationK };
}

export const CONFIDENCE_WORD: Record<ConfidenceLevel, string> = {
  low: 'Rendah',
  nominal: 'Nominal',
  high: 'Tinggi',
};

export function confidenceLabel(c: Confidence): string {
  return c.kind === 'percent' ? `${CONFIDENCE_WORD[c.level]} (${c.value}%)` : CONFIDENCE_WORD[c.level];
}

/** Indonesian civil time zone from longitude. */
export function zoneForLongitude(lng: number): { label: string; offsetHours: number } {
  if (lng < 112.5) return { label: 'WIB', offsetHours: 7 };
  if (lng < 127.5) return { label: 'WITA', offsetHours: 8 };
  return { label: 'WIT', offsetHours: 9 };
}

export const ZONE_OFFSETS: Record<string, number> = { WIB: 7, WITA: 8, WIT: 9 };

export function utcToLocalClock(hhmmUtc: string, lng: number): string {
  const [h, m] = hhmmUtc.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return '';
  const zone = zoneForLongitude(lng);
  const total = (h * 60 + m + zone.offsetHours * 60 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')} ${zone.label}`;
}

function clockFrom(minutes: number) {
  const dayShift = Math.floor(minutes / 1440);
  const total = ((minutes % 1440) + 1440) % 1440;
  return {
    hhmm: `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`,
    dayShift,
  };
}

/**
 * Resolves one clock reading into both UTC and true local time, each with the
 * number of calendar days the conversion crossed.
 *
 * Both shifts matter, and for different reasons. A 00:37 WIB detection is 17:37
 * UTC on the previous day, so losing the UTC rollover misdates the instant. And
 * because SiPongi+ stamps every row WIB regardless of where the point is, a
 * point in Maluku can also land on a different local calendar day than the one
 * printed in the file. Keeping the two separate is what stops a record showing
 * a UTC date next to a local clock, which reads as a contradiction.
 */
export function resolveClock(
  hhmm: string,
  statedZone: string | null,
  lng: number,
): { utc: string; utcDayShift: number; local: string; localDayShift: number; zoneLabel: string } | null {
  const [h, m] = hhmm.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  // No stated zone means the clock is already UTC, which is the FIRMS convention.
  const statedOffset = statedZone ? ZONE_OFFSETS[statedZone.toUpperCase()] : 0;
  if (statedOffset === undefined) return null;

  const utcMinutes = h * 60 + m - statedOffset * 60;
  const trueZone = zoneForLongitude(lng);
  const localMinutes = utcMinutes + trueZone.offsetHours * 60;

  const utc = clockFrom(utcMinutes);
  const local = clockFrom(localMinutes);
  return {
    utc: utc.hhmm,
    utcDayShift: utc.dayShift,
    local: local.hhmm,
    localDayShift: local.dayShift,
    zoneLabel: trueZone.label,
  };
}

export function shiftIsoDate(iso: string, days: number): string {
  if (!days) return iso;
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Flags a record whose acquisition time is impossible for the platform it
 * claims. Used to warn about a bad import, never to silently correct one.
 */
export function overpassPlausible(sensor: SatelliteSensor, hhmmUtc: string, lng: number): boolean {
  const [h, m] = hhmmUtc.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return true;
  const spec = SENSOR_SPECS[sensor];
  const localSolarHour = (h + m / 60 + lng / 15 + 24) % 24;
  const diff = Math.abs(localSolarHour - spec.overpassLocalSolarHour);
  const dayGap = Math.min(diff, 24 - diff);
  const nightGap = Math.abs(dayGap - 12);
  return dayGap * 60 <= spec.overpassToleranceMinutes || nightGap * 60 <= spec.overpassToleranceMinutes;
}
