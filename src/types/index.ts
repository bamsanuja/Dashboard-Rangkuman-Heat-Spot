export type LandCategory = 
  | 'hutan_lindung'    // Kawasan Hutan Lindung & Konservasi (TN, Suaka Margasatwa, Hutan Lindung)
  | 'sawit_dalam'       // Di Dalam Konsesi Perkebunan Kelapa Sawit (HGU)
  | 'sawit_sebelah'     // Sebelah / Sekitar Konsesi Sawit (Radius Buffer < 2 km)
  | 'tambang'           // Kawasan Konsesi Pertambangan (IUP/PKP2B)
  | 'perkotaan'         // Kawasan Perkotaan & Pemukiman Penduduk
  | 'apl_lainnya';      // Area Penggunaan Lain / Lahan Terbuka Lainnya

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type SatelliteSensor = 
  | 'VIIRS / SNPP' 
  | 'VIIRS / NOAA-20' 
  | 'MODIS / Terra' 
  | 'MODIS / Aqua' 
  | 'LANDSAT-8/9';

export interface LandDetail {
  category: LandCategory;
  categoryName: string;
  specificAreaName: string;
  isInside: boolean;
  distanceToBoundaryMeters: number; // 0 if inside
  concessionHolder?: string;
  permitType?: string;
  riskLevel: 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
  legalNote: string;
}

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  confidence: number; // 0 - 100%
  confidenceLevel: ConfidenceLevel;
  brightness: number; // in Kelvin (e.g. 335.4 K)
  frp: number; // Fire Radiative Power in MW (e.g. 42.5 MW)
  satellite: SatelliteSensor;
  acquisitionDate: string; // YYYY-MM-DD
  acquisitionTime: string; // HH:mm WIB
  province: string;
  district: string; // Kabupaten / Kota
  subdistrict: string; // Kecamatan
  village?: string; // Desa
  landCategory: LandCategory;
  landDetail: LandDetail;
}

export interface ConcessionPolygon {
  id: string;
  name: string;
  category: 'hutan_lindung' | 'sawit' | 'tambang' | 'perkotaan';
  holder?: string;
  province: string;
  areaHectares: number;
  permitType?: string;
  coordinates: number[][][]; // [ [ [lng, lat], [lng, lat], ... ] ]
  color: string;
  fillColor: string;
  description?: string;
}

export interface SpatialSummary {
  total: number;
  hutanLindung: number;
  sawitTotal: number;
  sawitInside: number;
  sawitBuffer: number;
  tambang: number;
  perkotaan: number;
  apl: number;
  highConfidence: number;
  totalFRP: number;
  criticalAlerts: number;
  byProvince: { [name: string]: number };
  byDate: { [date: string]: { hutan: number; sawit: number; tambang: number; kota: number; apl: number } };
  bySatellite: { [sensor: string]: number };
}

export interface FilterState {
  landCategory: 'all' | LandCategory | 'sawit_all';
  confidence: 'all' | ConfidenceLevel;
  satellite: 'all' | string;
  province: 'all' | string;
  dateRange: 'today' | '24h' | '3d' | '7d' | 'all';
  searchQuery: string;
  minFRP: number;
}
