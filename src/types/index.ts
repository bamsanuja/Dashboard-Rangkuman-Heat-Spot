// ============================================================================
// Domain schema for Dashboard Ringkasan Heat Spot.
//
// Design rule: this app never asserts a fact it was not given.
//   - Hotspots come only from a file the user imported. Nothing ships bundled.
//   - Land status is either (a) a published boundary, or (b) an INDICATION read
//     off satellite imagery, clearly labelled as such. Never a permit holder.
// ============================================================================

/** Sensors that actually deliver active-fire detections over Indonesia. */
export type SatelliteSensor =
  | 'VIIRS / SNPP'
  | 'VIIRS / NOAA-20'
  | 'VIIRS / NOAA-21'
  | 'MODIS / Terra'
  | 'MODIS / Aqua'
  /** SiPongi+ publishes MODIS without naming the platform. */
  | 'MODIS (Terra atau Aqua)';

export type SensorFamily = 'VIIRS' | 'MODIS';

/**
 * Confidence is reported differently by the two product families, so the type
 * refuses to let them be confused.
 *   MODIS: 0-100 percent, bucketed low 0-29 / nominal 30-79 / high 80-100.
 *   VIIRS: categorical only. There is no percentage to display.
 * Source: NASA FIRMS FAQ.
 */
export type Confidence =
  | { kind: 'percent'; value: number; level: ConfidenceLevel }
  | { kind: 'categorical'; level: ConfidenceLevel };

export type ConfidenceLevel = 'low' | 'nominal' | 'high';

/**
 * Brightness temperature. MODIS reports band 21/22 (~4 um) as `brightness`;
 * VIIRS reports the I-4 channel (3.74 um), which saturates at 367 K.
 * Keeping the band name attached stops the two being averaged together.
 */
export interface BrightnessReading {
  band: 'bright_ti4' | 'brightness_t21';
  kelvin: number;
  /** True when the value sits at or above the channel saturation ceiling. */
  saturated: boolean;
}

/** What the imagery appears to show. This is an observation, never a permit. */
export type LandIndication =
  | 'plantation_pattern'   // regular planting grid: industrial estate crop
  | 'closed_canopy'        // continuous dark canopy, no planting geometry
  | 'open_vegetation'      // mottled scrub, regrowth, smallholder mosaic
  | 'cleared_or_excavated' // bare ground, fresh clearing, spoil, pit benches
  | 'settlement'           // built-up texture
  | 'cloud_obscured'       // cloud or haze over the point
  | 'inconclusive'         // imagery unavailable or signal too weak to call
  | 'not_analysed';        // analysis not run yet

/** Raw measurements behind a call, exposed so the reader can second-guess it. */
export interface ImageryMetrics {
  /** Green-red vegetation index, (G-R)/(G+R). Separates soil from foliage. */
  grvi: number;
  brightness: number;
  saturation: number;
  contrast: number;
  /** Autocorrelation prominence of a repeating planting spacing, 0 to ~1.2. */
  gridStrength: number;
  gridPeriodMeters: number;
  /** True when the imagery is too coarse here to resolve individual crowns. */
  gridUndetectable: boolean;
}

export interface ImageryReading {
  indication: LandIndication;
  /** 0-1. How strongly the imagery supports the indication above. */
  strength: number;
  /** Autocorrelation peak period in metres, when a planting grid was found. */
  rowSpacingMeters?: number;
  /** Tile actually analysed, so the reader can look at the same picture. */
  tileUrl: string;
  zoom: number;
  /** Small JPEG crop of the analysed patch, for the contact sheet. */
  thumbnail?: string;
  metrics?: ImageryMetrics;
  /** Set when a person overrode the automatic call. */
  reviewedByHuman?: boolean;
  /** The machine's original call, kept after a human override. */
  originalIndication?: LandIndication;
  /**
   * Basemap imagery has no exposed acquisition date and is typically months to
   * years older than the fire. Always surfaced next to the result.
   */
  caveat: string;
}

/** Relationship to a published conservation-area boundary. */
export type AreaRelation = 'within_indicative_boundary' | 'near_boundary' | 'outside';

export interface ProtectedAreaProximity {
  relation: AreaRelation;
  areaId: string;
  areaName: string;
  managingUnit: string;
  /**
   * Distance rounded to the sensor footprint. A 375 m VIIRS pixel cannot
   * support a metre-level readout, so we do not print one.
   */
  distanceMeters: number | null;
  /** Half the sensor pixel size: the irreducible uncertainty on the above. */
  uncertaintyMeters: number;
  /** True when distance is smaller than the uncertainty, i.e. undecidable. */
  undecidable: boolean;
}

/** Enam komponen sistem Canadian Forest Fire Weather Index. */
export type FdrsCode = 'ffmc' | 'dmc' | 'dc' | 'isi' | 'bui' | 'fwi';

export type FdrsBand = 'aman' | 'tidak_mudah' | 'mudah' | 'sangat_mudah' | 'tidak_ada_data';

/**
 * Grid harian dari GFWED, disubset ke Indonesia oleh scripts/fetch-fdrs.py.
 * Nilai disimpan row-major dengan lintang menaik, dan sel tanpa data bernilai
 * null daripada nol, karena nol adalah pembacaan yang sah pada sistem ini.
 */
export interface FdrsGrid {
  kind: 'fdrs-grid';
  version: number;
  source: string;
  sourceUrl: string;
  attribution: string;
  observationDate: string;
  retrievedAt: string;
  lonMin: number;
  latMin: number;
  dLon: number;
  dLat: number;
  nLon: number;
  nLat: number;
  codes: FdrsCode[];
  grids: Partial<Record<FdrsCode, (number | null)[]>>;
  fileName?: string;
}

export interface FdrsReading {
  values: Partial<Record<FdrsCode, number | null>>;
  /** Kelas bahaya dari Drought Code: kekeringan lapisan dalam. */
  dcBand: FdrsBand;
  /** Kelas bahaya dari Fire Weather Index: intensitas keseluruhan. */
  fwiBand: FdrsBand;
  observationDate: string;
  source: string;
}

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  confidence: Confidence;
  brightness: BrightnessReading;
  /** Fire Radiative Power in megawatts. An instantaneous rate, never summed. */
  frp: number;
  satellite: SatelliteSensor;
  family: SensorFamily;
  /** Nominal ground pixel size in metres. 375 for VIIRS, 1000 for MODIS. */
  footprintMeters: number;
  /**
   * YYYY-MM-DD in the zone the coordinate actually sits in. This is what the
   * app displays and groups by, because pairing a UTC date with a local clock
   * produces a record that reads as a contradiction.
   */
  acquisitionDate: string;
  /** The same instant expressed as a UTC calendar date. */
  acquisitionDateUtc: string;
  acquisitionTimeUtc: string; // HH:mm UTC
  acquisitionTimeLocal: string; // HH:mm in the zone the coordinate actually sits in
  /** Verbatim date and clock from the source file, e.g. "27-08-2026 00:37 WIB". */
  acquisitionTimeSource: string;
  acquisitionDateSource: string;
  /**
   * True when the local calendar date differs from the date printed in the
   * source file. Night overpasses stamped in the wrong zone cause this.
   */
  dateShifted: boolean;
  /**
   * Decimal places on the coarser of the two coordinates. SiPongi+ exports mix
   * five-decimal rows with one- and two-decimal rows, and a two-decimal
   * coordinate is only good to about a kilometre.
   */
  coordDecimals: number;
  /** True when the coordinate is too coarse for point-level work. */
  lowPrecision: boolean;
  /**
   * True when the source stamped a time zone that does not match the point's
   * own longitude. SiPongi+ labels every row WIB, so roughly half of a national
   * export carries a zone an hour or two off from local civil time.
   */
  zoneMismatch: boolean;
  /** Only present when the source file supplied it. Never inferred. */
  province?: string;
  district?: string;
  subdistrict?: string;
  village?: string;
  /** Present only after the user runs the imagery check on this point. */
  imagery?: ImageryReading;
  /** Present only when an area boundary layer is loaded. */
  proximity?: ProtectedAreaProximity;
  /** Present only when an FDRS grid has been imported. */
  fdrs?: FdrsReading;
  /** Verbatim source row, so any displayed value can be traced back. */
  sourceRow: Record<string, string>;
}

/** Where an imported batch came from. Displayed on every screen. */
export interface DataProvenance {
  sourceLabel: string;
  fileName: string;
  format: 'sipongi-txt' | 'sipongi-csv' | 'sipongi-kmz' | 'firms-csv';
  importedAt: string;
  rowCount: number;
  skippedCount: number;
  /** Attribution string the source requires to be shown. */
  attribution: string;
}

/**
 * Indicative conservation-area geometry. These are reference shapes for
 * screening, not gazetted boundaries, and the type name says so.
 */
export interface IndicativeArea {
  id: string;
  name: string;
  managingUnit: string;
  managingParent: string;
  province: string;
  /** Officially published area with the decree it comes from. */
  officialAreaHectares: number;
  areaSource: string;
  designation: string;
  coordinates: number[][][]; // [ [ [lng, lat], ... ] ]
  note: string;
  /** Known limitation of this particular shape, shown in the UI. */
  geometryCaveat: string;
}

/**
 * Sekumpulan deteksi yang berdekatan, diperlakukan sebagai satu kejadian.
 * Gugus berukuran satu tetap gugus, dan tetap ditampilkan.
 */
export interface FireCluster {
  id: string;
  memberIds: string[];
  size: number;
  latitude: number;
  longitude: number;
  /** Perkiraan bentangan gugus dalam kilometer. */
  spanKm: number;
  dates: string[];
  /** Jumlah lintasan satelit berbeda yang melihat gugus ini. */
  passes: number;
  satellites: string[];
  highConfidence: number;
  dominantCover?: LandIndication;
  worstDcBand: FdrsBand;
  insideAreaCount: number;
  areaName?: string;
  provinces: string[];
  districts: string[];
}

export interface Summary {
  total: number;
  byConfidence: Record<ConfidenceLevel, number>;
  bySensor: Record<string, number>;
  byDate: Record<string, number>;
  byProvince: Record<string, number>;
  /** FRP is a rate, so we report distribution rather than a sum. */
  frpMax: number;
  frpMedian: number;
  saturatedCount: number;
  withinIndicativeBoundary: number;
  nearBoundary: number;
  imageryAnalysed: number;
  byIndication: Record<LandIndication, number>;
  humanReviewed: number;
  /**
   * Land cover against conservation-area relation. Dense canopy inside a
   * gazetted area and dense canopy on ordinary land are different findings, and
   * a single composition bar hides the difference.
   */
  coverByArea: Record<LandIndication, { inside: number; near: number; outside: number }>;
  /** Sebaran kelas bahaya menurut Drought Code. */
  byDcBand: Record<FdrsBand, number>;
  /**
   * Matriks triase tiga sumbu, diringkas menjadi dua yang paling menentukan:
   * kekeringan lapisan dalam terhadap posisi pada kawasan konservasi.
   */
  dcBandByArea: Record<FdrsBand, { inside: number; near: number; outside: number }>;
  fdrsCovered: number;
  /** Kualitas berkas sumber, dihitung dari data yang dimuat. */
  lowPrecisionCount: number;
  dateShiftedCount: number;
  zoneMismatchCount: number;
  byFamily: Record<string, { total: number; high: number }>;
}

export interface FilterState {
  /**
   * Ukuran gugus minimum. Nilai 1 berarti seluruh gugus, termasuk deteksi
   * soliter. Nilai lebih tinggi menaikkan syarat bukti dan mempersempit
   * seluruh dasbor, bukan hanya satu panel.
   */
  minClusterSize: number;
  dcBand: 'all' | FdrsBand;
  confidence: 'all' | ConfidenceLevel;
  sensor: 'all' | string;
  province: 'all' | string;
  indication: 'all' | LandIndication;
  searchQuery: string;
  minFRP: number;
}
