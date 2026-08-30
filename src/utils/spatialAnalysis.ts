import * as turf from '@turf/turf';
import { INDICATIVE_AREAS } from '../data/protectedAreas';
import type {
  ConfidenceLevel, FdrsBand, FdrsGrid, Hotspot, IndicativeArea, LandIndication, ProtectedAreaProximity, Summary,
} from '../types';
import { ALL_INDICATIONS } from './imageryIndication';
import { FDRS_BANDS, readFdrs } from './fdrs';

/**
 * Proximity screening against indicative conservation-area shapes.
 *
 * The previous version of this file decided "inside" or "outside" from a
 * hand-drawn hexagon and then printed a criminal-liability sentence. Two things
 * changed. The shapes are labelled indicative, and the sensor footprint is
 * carried through as uncertainty: when a hotspot sits closer to a boundary than
 * half its own pixel, the relationship is reported as undecidable rather than
 * resolved in either direction.
 */

/** Distance below which a determination cannot be made at this resolution. */
function uncertaintyFor(hotspot: Hotspot) {
  return hotspot.footprintMeters / 2;
}

/** Never print more precision than the pixel supports. */
export function roundToFootprint(meters: number, footprint: number) {
  const step = Math.max(50, footprint / 2);
  return Math.round(meters / step) * step;
}

/**
 * Bounding boxes, computed once. A national export is five figures of points
 * against every polygon, and the exact geometry is far too expensive to run on
 * pairs that a rectangle test can rule out immediately.
 */
const bboxCache = new WeakMap<IndicativeArea, [number, number, number, number]>();

function bboxOf(area: IndicativeArea): [number, number, number, number] {
  const cached = bboxCache.get(area);
  if (cached) return cached;
  const ring = area.coordinates[0];
  const lngs = ring.map((c) => c[0]);
  const lats = ring.map((c) => c[1]);
  const box: [number, number, number, number] = [
    Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats),
  ];
  bboxCache.set(area, box);
  return box;
}

/** Roughly 5 km of latitude, the widest band the caller ever asks about. */
const SEARCH_PAD_DEG = 0.05;

export function assessProximity(hotspot: Hotspot, areas: IndicativeArea[] = INDICATIVE_AREAS): ProtectedAreaProximity | undefined {
  if (!areas.length) return undefined;
  const pt = turf.point([hotspot.longitude, hotspot.latitude]);
  const uncertainty = uncertaintyFor(hotspot);

  let containing: IndicativeArea | null = null;
  let nearest: IndicativeArea | null = null;
  let nearestMeters = Infinity;

  for (const area of areas) {
    const [minX, minY, maxX, maxY] = bboxOf(area);
    if (
      hotspot.longitude < minX - SEARCH_PAD_DEG || hotspot.longitude > maxX + SEARCH_PAD_DEG ||
      hotspot.latitude < minY - SEARCH_PAD_DEG || hotspot.latitude > maxY + SEARCH_PAD_DEG
    ) {
      continue;
    }
    const poly = turf.polygon(area.coordinates);
    const distanceToEdge = turf.pointToLineDistance(pt, turf.polygonToLine(poly) as never, { units: 'meters' });
    if (distanceToEdge < nearestMeters) {
      nearestMeters = distanceToEdge;
      nearest = area;
    }
    // Containment is evaluated for every area rather than breaking on the first
    // match, so an overlap cannot silently swallow a point.
    if (turf.booleanPointInPolygon(pt, poly)) {
      if (!containing || distanceToEdge > 0) containing = containing ?? area;
    }
  }

  if (containing) {
    const poly = turf.polygon(containing.coordinates);
    const edge = turf.pointToLineDistance(pt, turf.polygonToLine(poly) as never, { units: 'meters' });
    return {
      relation: edge <= uncertainty ? 'near_boundary' : 'within_indicative_boundary',
      areaId: containing.id,
      areaName: containing.name,
      managingUnit: containing.managingUnit,
      distanceMeters: roundToFootprint(edge, hotspot.footprintMeters),
      uncertaintyMeters: Math.round(uncertainty),
      undecidable: edge <= uncertainty,
    };
  }

  // Nothing within the padded boxes means nothing within the 5 km band either.
  if (!nearest) {
    return {
      relation: 'outside',
      areaId: '',
      areaName: '',
      managingUnit: '',
      distanceMeters: null,
      uncertaintyMeters: Math.round(uncertainty),
      undecidable: false,
    };
  }

  if (nearestMeters <= 5000) {
    return {
      relation: 'near_boundary',
      areaId: nearest.id,
      areaName: nearest.name,
      managingUnit: nearest.managingUnit,
      distanceMeters: roundToFootprint(nearestMeters, hotspot.footprintMeters),
      uncertaintyMeters: Math.round(uncertainty),
      undecidable: nearestMeters <= uncertainty,
    };
  }

  return {
    relation: 'outside',
    areaId: nearest.id,
    areaName: nearest.name,
    managingUnit: nearest.managingUnit,
    distanceMeters: roundToFootprint(nearestMeters, hotspot.footprintMeters),
    uncertaintyMeters: Math.round(uncertainty),
    undecidable: false,
  };
}

export function withProximity(hotspots: Hotspot[]): Hotspot[] {
  return hotspots.map((h) => ({ ...h, proximity: assessProximity(h) }));
}

/** Applies an imported FDRS grid to every point. Replaces any earlier grid. */
export function withFdrs(hotspots: Hotspot[], grid: FdrsGrid | null): Hotspot[] {
  if (!grid) return hotspots.map((h) => ({ ...h, fdrs: undefined }));
  return hotspots.map((h) => ({ ...h, fdrs: readFdrs(grid, h.latitude, h.longitude) }));
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeSummary(hotspots: Hotspot[]): Summary {
  const byConfidence: Record<ConfidenceLevel, number> = { low: 0, nominal: 0, high: 0 };
  const bySensor: Record<string, number> = {};
  const byDate: Record<string, number> = {};
  const byProvince: Record<string, number> = {};
  const frps: number[] = [];

  let saturatedCount = 0;
  let withinIndicativeBoundary = 0;
  let nearBoundary = 0;
  let imageryAnalysed = 0;
  let humanReviewed = 0;
  let fdrsCovered = 0;
  let lowPrecisionCount = 0;
  let dateShiftedCount = 0;
  let zoneMismatchCount = 0;
  const byFamily: Record<string, { total: number; high: number }> = {};
  const byDcBand = Object.fromEntries(FDRS_BANDS.map((b) => [b, 0])) as Record<FdrsBand, number>;
  const dcBandByArea = Object.fromEntries(
    FDRS_BANDS.map((b) => [b, { inside: 0, near: 0, outside: 0 }]),
  ) as Summary['dcBandByArea'];
  const byIndication = Object.fromEntries(ALL_INDICATIONS.map((i) => [i, 0])) as Record<LandIndication, number>;
  const coverByArea = Object.fromEntries(
    ALL_INDICATIONS.map((i) => [i, { inside: 0, near: 0, outside: 0 }]),
  ) as Summary['coverByArea'];

  for (const h of hotspots) {
    byConfidence[h.confidence.level]++;
    bySensor[h.satellite] = (bySensor[h.satellite] ?? 0) + 1;
    byDate[h.acquisitionDate] = (byDate[h.acquisitionDate] ?? 0) + 1;
    if (h.province) byProvince[h.province] = (byProvince[h.province] ?? 0) + 1;
    if (h.frp > 0) frps.push(h.frp);
    if (h.lowPrecision) lowPrecisionCount++;
    if (h.dateShifted) dateShiftedCount++;
    if (h.zoneMismatch) zoneMismatchCount++;
    if (!byFamily[h.family]) byFamily[h.family] = { total: 0, high: 0 };
    byFamily[h.family].total++;
    if (h.confidence.level === 'high') byFamily[h.family].high++;
    if (h.brightness.saturated) saturatedCount++;
    if (h.proximity?.relation === 'within_indicative_boundary') withinIndicativeBoundary++;
    if (h.proximity?.relation === 'near_boundary') nearBoundary++;
    const cover: LandIndication = h.imagery?.indication ?? 'not_analysed';
    if (h.imagery) {
      imageryAnalysed++;
      if (h.imagery.reviewedByHuman) humanReviewed++;
    }
    byIndication[cover]++;

    const relation = h.proximity?.relation;
    const slot = relation === 'within_indicative_boundary' ? 'inside' : relation === 'near_boundary' ? 'near' : 'outside';
    coverByArea[cover][slot]++;

    const dcBand: FdrsBand = h.fdrs?.dcBand ?? 'tidak_ada_data';
    byDcBand[dcBand]++;
    dcBandByArea[dcBand][slot]++;
    if (h.fdrs) fdrsCovered++;
  }

  return {
    total: hotspots.length,
    byConfidence,
    bySensor,
    byDate,
    byProvince,
    // FRP is an instantaneous rate in megawatts. Summing it across detections
    // from different instruments on different days produces a number with no
    // physical meaning, so the app reports the distribution instead.
    frpMax: frps.length ? Math.max(...frps) : 0,
    frpMedian: Number(median(frps).toFixed(1)),
    saturatedCount,
    withinIndicativeBoundary,
    nearBoundary,
    imageryAnalysed,
    byIndication,
    humanReviewed,
    coverByArea,
    byDcBand,
    dcBandByArea,
    fdrsCovered,
    lowPrecisionCount,
    dateShiftedCount,
    zoneMismatchCount,
    byFamily,
  };
}
