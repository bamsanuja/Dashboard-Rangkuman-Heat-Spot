import * as turf from '@turf/turf';
import { CONCESSION_POLYGONS } from '../data/concessionsData';
import type { ConcessionPolygon, Hotspot, LandCategory, LandDetail, SpatialSummary } from '../types';

/**
 * Calculates whether a point is inside a polygon or measures distance to its nearest boundary.
 */
export function classifyHotspotSpatial(
  lat: number,
  lng: number,
  confidence: number,
  polygons: ConcessionPolygon[] = CONCESSION_POLYGONS
): { landCategory: LandCategory; landDetail: LandDetail } {
  const pt = turf.point([lng, lat]);

  let insidePolygon: ConcessionPolygon | null = null;
  let nearestPolygon: ConcessionPolygon | null = null;
  let minDistanceMeters = Infinity;

  for (const poly of polygons) {
    const turfPoly = turf.polygon(poly.coordinates);
    const isInside = turf.booleanPointInPolygon(pt, turfPoly);

    if (isInside) {
      insidePolygon = poly;
      break;
    }

    // Measure distance to polygon border (convert polygon to line)
    const line = turf.polygonToLine(turfPoly);
    let distKm = Infinity;
    if (line) {
      distKm = turf.pointToLineDistance(pt, line as any, { units: 'kilometers' });
    }
    const distMeters = distKm * 1000;

    if (distMeters < minDistanceMeters) {
      minDistanceMeters = distMeters;
      nearestPolygon = poly;
    }
  }

  // 1. If inside a polygon
  if (insidePolygon) {
    let category: LandCategory = 'apl_lainnya';
    let riskLevel: LandDetail['riskLevel'] = 'Sedang';
    let legalNote = '';
    let categoryName = '';

    if (insidePolygon.category === 'hutan_lindung') {
      category = 'hutan_lindung';
      categoryName = 'Hutan Lindung & Kawasan Konservasi';
      riskLevel = 'Kritis';
      legalNote = `⚠️ KRITIS: Titik api berada DALAM KAWASAN DILINDUNGI (${insidePolygon.name}). Potensi tindak pidana Karhutla UU No. 18/2013 & UU No. 41/1999 pasal 78.`;
    } else if (insidePolygon.category === 'sawit') {
      category = 'sawit_dalam';
      categoryName = 'Dalam Konsesi Kelapa Sawit (HGU)';
      riskLevel = confidence >= 80 ? 'Kritis' : 'Tinggi';
      legalNote = `🔴 TINGGI: Berada dalam HGU perkebunan ${insidePolygon.holder || insidePolygon.name}. Tanggung jawab mutlak (strict liability) pemegang izin UU PPLH 32/2009.`;
    } else if (insidePolygon.category === 'tambang') {
      category = 'tambang';
      categoryName = 'Dalam Konsesi Pertambangan';
      riskLevel = confidence >= 80 ? 'Kritis' : 'Tinggi';
      legalNote = `🟣 TINGGI: Berada dalam konsesi tambang ${insidePolygon.holder || insidePolygon.name}. Evaluasi izin AMDAL & audit kepatuhan pengendalian kebakaran.`;
    } else if (insidePolygon.category === 'perkotaan') {
      category = 'perkotaan';
      categoryName = 'Kawasan Perkotaan & Pemukiman';
      riskLevel = confidence >= 80 ? 'Tinggi' : 'Sedang';
      legalNote = `🔵 SIAGA PEMUKIMAN: Ancaman kabut asap langsung terhadap kesehatan masyarakat dan fasilitas publik.`;
    }

    return {
      landCategory: category,
      landDetail: {
        category,
        categoryName,
        specificAreaName: insidePolygon.name,
        isInside: true,
        distanceToBoundaryMeters: 0,
        concessionHolder: insidePolygon.holder,
        permitType: insidePolygon.permitType,
        riskLevel,
        legalNote
      }
    };
  }

  // 2. If outside, check proximity buffer to nearest polygon (< 2500 meters)
  if (nearestPolygon && minDistanceMeters <= 2500) {
    const roundedDist = Math.round(minDistanceMeters);

    if (nearestPolygon.category === 'sawit') {
      const isCritical = confidence >= 80 && roundedDist <= 1000;
      return {
        landCategory: 'sawit_sebelah',
        landDetail: {
          category: 'sawit_sebelah',
          categoryName: 'Sebelah / Sekitar Konsesi Sawit (Buffer Proximity)',
          specificAreaName: `Buffer ${roundedDist}m dari ${nearestPolygon.name}`,
          isInside: false,
          distanceToBoundaryMeters: roundedDist,
          concessionHolder: nearestPolygon.holder,
          permitType: nearestPolygon.permitType,
          riskLevel: isCritical ? 'Tinggi' : 'Sedang',
          legalNote: `🟠 WASPADA BUFFER: Berjarak ${roundedDist}m di sebelah batas konsesi ${nearestPolygon.name}. Indikasi rambatan api atau pembukaan lahan sekitar konsesi.`
        }
      };
    }

    if (nearestPolygon.category === 'hutan_lindung') {
      return {
        landCategory: 'hutan_lindung',
        landDetail: {
          category: 'hutan_lindung',
          categoryName: 'Penyangga Hutan Lindung (Buffer < 2.5km)',
          specificAreaName: `Zona Penyangga ${roundedDist}m dari ${nearestPolygon.name}`,
          isInside: false,
          distanceToBoundaryMeters: roundedDist,
          concessionHolder: nearestPolygon.holder,
          permitType: nearestPolygon.permitType,
          riskLevel: 'Tinggi',
          legalNote: `⚠️ ZONA PENYANGGA: Titik api berjarak ${roundedDist}m dari perbatasan ${nearestPolygon.name}. Potensi perambahan menuju hutan lindung.`
        }
      };
    }

    if (nearestPolygon.category === 'tambang') {
      return {
        landCategory: 'tambang',
        landDetail: {
          category: 'tambang',
          categoryName: 'Sekitar Area Tambang (Buffer Proximity)',
          specificAreaName: `Buffer ${roundedDist}m dari ${nearestPolygon.name}`,
          isInside: false,
          distanceToBoundaryMeters: roundedDist,
          concessionHolder: nearestPolygon.holder,
          permitType: nearestPolygon.permitType,
          riskLevel: 'Sedang',
          legalNote: `🟣 BUFFER TAMBANG: Berjarak ${roundedDist}m dari batas tambang ${nearestPolygon.name}.`
        }
      };
    }

    if (nearestPolygon.category === 'perkotaan') {
      return {
        landCategory: 'perkotaan',
        landDetail: {
          category: 'perkotaan',
          categoryName: 'Pinggiran Kota / Pemukiman',
          specificAreaName: `Radius ${roundedDist}m dari ${nearestPolygon.name}`,
          isInside: false,
          distanceToBoundaryMeters: roundedDist,
          concessionHolder: undefined,
          permitType: undefined,
          riskLevel: 'Sedang',
          legalNote: `🔵 PINGGIRAN KOTA: Berjarak ${roundedDist}m dari perimeter kawasan pemukiman.`
        }
      };
    }
  }

  // 3. Fallback: Area Penggunaan Lain (APL)
  return {
    landCategory: 'apl_lainnya',
    landDetail: {
      category: 'apl_lainnya',
      categoryName: 'Area Penggunaan Lain (APL) / Terbuka',
      specificAreaName: nearestPolygon ? `Lahan Terbuka (${Math.round(minDistanceMeters / 1000)}km dari ${nearestPolygon.name})` : 'Lahan Terbuka / Semak Belukar',
      isInside: false,
      distanceToBoundaryMeters: Math.round(minDistanceMeters),
      concessionHolder: undefined,
      permitType: 'APL / Non-Konsesi',
      riskLevel: confidence >= 80 ? 'Sedang' : 'Rendah',
      legalNote: 'Lahan luar konsesi / semak belukar terbuka. Tetap memerlukan pemadaman agar tidak meluas.'
    }
  };
}

/**
 * Computes summary aggregations for dashboard analytics
 */
export function computeSpatialSummary(hotspots: Hotspot[]): SpatialSummary {
  let hutanLindung = 0;
  let sawitInside = 0;
  let sawitBuffer = 0;
  let tambang = 0;
  let perkotaan = 0;
  let apl = 0;
  let highConfidence = 0;
  let totalFRP = 0;
  let criticalAlerts = 0;

  const byProvince: { [name: string]: number } = {};
  const byDate: { [date: string]: { hutan: number; sawit: number; tambang: number; kota: number; apl: number } } = {};
  const bySatellite: { [sensor: string]: number } = {};

  for (const h of hotspots) {
    if (h.landCategory === 'hutan_lindung') hutanLindung++;
    else if (h.landCategory === 'sawit_dalam') sawitInside++;
    else if (h.landCategory === 'sawit_sebelah') sawitBuffer++;
    else if (h.landCategory === 'tambang') tambang++;
    else if (h.landCategory === 'perkotaan') perkotaan++;
    else apl++;

    if (h.confidence >= 80) highConfidence++;
    totalFRP += h.frp;

    if (h.landDetail.riskLevel === 'Kritis') criticalAlerts++;

    // Province count
    byProvince[h.province] = (byProvince[h.province] || 0) + 1;

    // Date aggregation
    if (!byDate[h.acquisitionDate]) {
      byDate[h.acquisitionDate] = { hutan: 0, sawit: 0, tambang: 0, kota: 0, apl: 0 };
    }
    if (h.landCategory === 'hutan_lindung') byDate[h.acquisitionDate].hutan++;
    else if (h.landCategory === 'sawit_dalam' || h.landCategory === 'sawit_sebelah') byDate[h.acquisitionDate].sawit++;
    else if (h.landCategory === 'tambang') byDate[h.acquisitionDate].tambang++;
    else if (h.landCategory === 'perkotaan') byDate[h.acquisitionDate].kota++;
    else byDate[h.acquisitionDate].apl++;

    // Satellite count
    bySatellite[h.satellite] = (bySatellite[h.satellite] || 0) + 1;
  }

  return {
    total: hotspots.length,
    hutanLindung,
    sawitTotal: sawitInside + sawitBuffer,
    sawitInside,
    sawitBuffer,
    tambang,
    perkotaan,
    apl,
    highConfidence,
    totalFRP: Math.round(totalFRP * 10) / 10,
    criticalAlerts,
    byProvince,
    byDate,
    bySatellite
  };
}
