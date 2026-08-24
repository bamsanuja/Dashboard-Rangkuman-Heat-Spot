import type { Hotspot, SatelliteSensor } from '../types';
import { classifyHotspotSpatial } from '../utils/spatialAnalysis';

interface RawHotspotSeed {
  id: string;
  lat: number;
  lng: number;
  confidence: number;
  brightness: number;
  frp: number;
  satellite: SatelliteSensor;
  date: string;
  time: string;
  province: string;
  district: string;
  subdistrict: string;
}

const RAW_SEEDS: RawHotspotSeed[] = [
  // ====================================================
  // RIAU - TN Tesso Nilo & Sekitar Sawit Pelalawan
  // ====================================================
  {
    id: 'HS-2026-RIAU-001',
    lat: -0.18,
    lng: 101.65,
    confidence: 94,
    brightness: 348.5,
    frp: 78.4,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:45 WIB',
    province: 'Riau',
    district: 'Pelalawan',
    subdistrict: 'Ukui'
  },
  {
    id: 'HS-2026-RIAU-002',
    lat: -0.12,
    lng: 101.55,
    confidence: 88,
    brightness: 339.2,
    frp: 52.1,
    satellite: 'VIIRS / NOAA-20',
    date: '2026-08-24',
    time: '11:20 WIB',
    province: 'Riau',
    district: 'Pelalawan',
    subdistrict: 'Pangkalan Lesung'
  },
  {
    id: 'HS-2026-RIAU-003',
    lat: -0.22,
    lng: 101.78,
    confidence: 91,
    brightness: 342.0,
    frp: 64.8,
    satellite: 'MODIS / Aqua',
    date: '2026-08-24',
    time: '14:10 WIB',
    province: 'Riau',
    district: 'Pelalawan',
    subdistrict: 'Langgam'
  },
  // In Palm Concession PT Palma Andalan
  {
    id: 'HS-2026-RIAU-004',
    lat: -0.15,
    lng: 102.10,
    confidence: 96,
    brightness: 355.8,
    frp: 112.3,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:45 WIB',
    province: 'Riau',
    district: 'Pelalawan',
    subdistrict: 'Bunut'
  },
  // Proximity Buffer to Palm Concession (~650m outside)
  {
    id: 'HS-2026-RIAU-005',
    lat: -0.01,
    lng: 102.20,
    confidence: 85,
    brightness: 334.6,
    frp: 45.2,
    satellite: 'MODIS / Terra',
    date: '2026-08-24',
    time: '10:35 WIB',
    province: 'Riau',
    district: 'Pelalawan',
    subdistrict: 'Kuala Kampar'
  },
  // Giam Siak Kecil (Hutan Lindung)
  {
    id: 'HS-2026-RIAU-006',
    lat: 1.02,
    lng: 101.65,
    confidence: 98,
    brightness: 362.4,
    frp: 135.0,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-23',
    time: '13:50 WIB',
    province: 'Riau',
    district: 'Bengkalis',
    subdistrict: 'Siak Kecil'
  },
  {
    id: 'HS-2026-RIAU-007',
    lat: 0.78,
    lng: 101.85,
    confidence: 79,
    brightness: 328.0,
    frp: 38.6,
    satellite: 'VIIRS / NOAA-20',
    date: '2026-08-23',
    time: '02:15 WIB',
    province: 'Riau',
    district: 'Siak',
    subdistrict: 'Mempura'
  },
  // Urban Pekanbaru (Kawasan Perkotaan)
  {
    id: 'HS-2026-RIAU-008',
    lat: 0.52,
    lng: 101.44,
    confidence: 82,
    brightness: 331.2,
    frp: 29.4,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:45 WIB',
    province: 'Riau',
    district: 'Kota Pekanbaru',
    subdistrict: 'Tampan'
  },

  // ====================================================
  // KALIMANTAN TENGAH - TN Sebangau, TN Tanjung Puting & Sawit
  // ====================================================
  {
    id: 'HS-2026-KALTENG-001',
    lat: -2.55,
    lng: 113.85,
    confidence: 99,
    brightness: 371.2,
    frp: 184.5,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:10 WIB',
    province: 'Kalimantan Tengah',
    district: 'Pulang Pisau',
    subdistrict: 'Sebangau Kuala'
  },
  {
    id: 'HS-2026-KALTENG-002',
    lat: -2.85,
    lng: 113.70,
    confidence: 95,
    brightness: 358.9,
    frp: 142.0,
    satellite: 'MODIS / Aqua',
    date: '2026-08-24',
    time: '14:25 WIB',
    province: 'Kalimantan Tengah',
    district: 'Katingan',
    subdistrict: 'Katingan Kuala'
  },
  // Tanjung Puting Protected Forest
  {
    id: 'HS-2026-KALTENG-003',
    lat: -3.05,
    lng: 112.05,
    confidence: 92,
    brightness: 345.6,
    frp: 86.4,
    satellite: 'VIIRS / NOAA-20',
    date: '2026-08-23',
    time: '12:40 WIB',
    province: 'Kalimantan Tengah',
    district: 'Kotawaringin Barat',
    subdistrict: 'Kumai'
  },
  // Inside Sawit PT. Sawit Sumber Sejahtera
  {
    id: 'HS-2026-KALTENG-004',
    lat: -2.60,
    lng: 111.55,
    confidence: 93,
    brightness: 350.2,
    frp: 98.7,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:10 WIB',
    province: 'Kalimantan Tengah',
    district: 'Kotawaringin Barat',
    subdistrict: 'Arut Selatan'
  },
  // Next to Sawit / Buffer Proximity (<800m)
  {
    id: 'HS-2026-KALTENG-005',
    lat: -2.93,
    lng: 111.45,
    confidence: 76,
    brightness: 326.4,
    frp: 34.2,
    satellite: 'MODIS / Terra',
    date: '2026-08-23',
    time: '10:50 WIB',
    province: 'Kalimantan Tengah',
    district: 'Kotawaringin Barat',
    subdistrict: 'Kotawaringin Lama'
  },
  // Inside PT Katingan Agro Lestari
  {
    id: 'HS-2026-KALTENG-006',
    lat: -2.52,
    lng: 113.28,
    confidence: 89,
    brightness: 341.5,
    frp: 71.0,
    satellite: 'VIIRS / NOAA-20',
    date: '2026-08-24',
    time: '01:55 WIB',
    province: 'Kalimantan Tengah',
    district: 'Katingan',
    subdistrict: 'Katingan Hilir'
  },
  // Urban Palangka Raya
  {
    id: 'HS-2026-KALTENG-007',
    lat: -2.22,
    lng: 113.92,
    confidence: 84,
    brightness: 332.0,
    frp: 31.5,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:10 WIB',
    province: 'Kalimantan Tengah',
    district: 'Kota Palangka Raya',
    subdistrict: 'Jekan Raya'
  },

  // ====================================================
  // KALIMANTAN TIMUR - Tambang Batubara KPC & Hutan Lindung
  // ====================================================
  {
    id: 'HS-2026-KALTIM-001',
    lat: 0.32,
    lng: 117.62,
    confidence: 97,
    brightness: 368.0,
    frp: 165.2,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:15 WIB',
    province: 'Kalimantan Timur',
    district: 'Kutai Timur',
    subdistrict: 'Sangatta Utara'
  },
  {
    id: 'HS-2026-KALTIM-002',
    lat: 0.22,
    lng: 117.75,
    confidence: 86,
    brightness: 337.8,
    frp: 58.4,
    satellite: 'MODIS / Aqua',
    date: '2026-08-23',
    time: '14:20 WIB',
    province: 'Kalimantan Timur',
    district: 'Kutai Timur',
    subdistrict: 'Sangatta Selatan'
  },
  // Buffer Tambang Sangatta (~1.2 km)
  {
    id: 'HS-2026-KALTIM-003',
    lat: 0.48,
    lng: 117.52,
    confidence: 74,
    brightness: 324.9,
    frp: 28.6,
    satellite: 'VIIRS / NOAA-20',
    date: '2026-08-24',
    time: '01:50 WIB',
    province: 'Kalimantan Timur',
    district: 'Kutai Timur',
    subdistrict: 'Rantau Pulung'
  },
  // Hutan Lindung Sungai Wain
  {
    id: 'HS-2026-KALTIM-004',
    lat: -1.12,
    lng: 116.85,
    confidence: 91,
    brightness: 346.7,
    frp: 81.3,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:15 WIB',
    province: 'Kalimantan Timur',
    district: 'Kota Balikpapan',
    subdistrict: 'Balikpapan Utara'
  },
  // Balikpapan Urban
  {
    id: 'HS-2026-KALTIM-005',
    lat: -1.24,
    lng: 116.88,
    confidence: 68,
    brightness: 320.1,
    frp: 22.0,
    satellite: 'MODIS / Terra',
    date: '2026-08-22',
    time: '10:45 WIB',
    province: 'Kalimantan Timur',
    district: 'Kota Balikpapan',
    subdistrict: 'Balikpapan Selatan'
  },

  // ====================================================
  // KALIMANTAN SELATAN - Tambang Tabalong & APL
  // ====================================================
  {
    id: 'HS-2026-KALSEL-001',
    lat: -2.25,
    lng: 115.52,
    confidence: 93,
    brightness: 352.4,
    frp: 94.0,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:10 WIB',
    province: 'Kalimantan Selatan',
    district: 'Tabalong',
    subdistrict: 'Tanta'
  },
  {
    id: 'HS-2026-KALSEL-002',
    lat: -2.35,
    lng: 115.65,
    confidence: 88,
    brightness: 340.2,
    frp: 62.5,
    satellite: 'VIIRS / NOAA-20',
    date: '2026-08-23',
    time: '12:35 WIB',
    province: 'Kalimantan Selatan',
    district: 'Tabalong',
    subdistrict: 'Murung Pudak'
  },
  {
    id: 'HS-2026-KALSEL-003',
    lat: -2.85,
    lng: 114.75,
    confidence: 62,
    brightness: 318.5,
    frp: 18.2,
    satellite: 'MODIS / Terra',
    date: '2026-08-22',
    time: '10:40 WIB',
    province: 'Kalimantan Selatan',
    district: 'Banjar',
    subdistrict: 'Gambut'
  },

  // ====================================================
  // KALIMANTAN BARAT - Sawit Ketapang, Betung Kerihun & Pontianak
  // ====================================================
  {
    id: 'HS-2026-KALBAR-001',
    lat: -2.40,
    lng: 110.38,
    confidence: 96,
    brightness: 359.1,
    frp: 122.4,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:20 WIB',
    province: 'Kalimantan Barat',
    district: 'Ketapang',
    subdistrict: 'Kendawangan'
  },
  {
    id: 'HS-2026-KALBAR-002',
    lat: -2.18,
    lng: 110.42,
    confidence: 83,
    brightness: 333.7,
    frp: 49.8,
    satellite: 'MODIS / Aqua',
    date: '2026-08-24',
    time: '14:30 WIB',
    province: 'Kalimantan Barat',
    district: 'Ketapang',
    subdistrict: 'Matan Hilir Selatan'
  },
  {
    id: 'HS-2026-KALBAR-003',
    lat: 0.85,
    lng: 113.10,
    confidence: 90,
    brightness: 343.8,
    frp: 76.5,
    satellite: 'VIIRS / NOAA-20',
    date: '2026-08-23',
    time: '12:45 WIB',
    province: 'Kalimantan Barat',
    district: 'Kapuas Hulu',
    subdistrict: 'Putussibau Utara'
  },
  {
    id: 'HS-2026-KALBAR-004',
    lat: -0.02,
    lng: 109.35,
    confidence: 77,
    brightness: 325.2,
    frp: 27.8,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:20 WIB',
    province: 'Kalimantan Barat',
    district: 'Kota Pontianak',
    subdistrict: 'Pontianak Selatan'
  },

  // ====================================================
  // SUMATERA SELATAN - Sawit OKI, Tambang Muara Enim & Palembang
  // ====================================================
  {
    id: 'HS-2026-SUMSEL-001',
    lat: -3.42,
    lng: 105.18,
    confidence: 98,
    brightness: 367.4,
    frp: 172.0,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:40 WIB',
    province: 'Sumatera Selatan',
    district: 'Ogan Komering Ilir',
    subdistrict: 'Pedamaran Timur'
  },
  {
    id: 'HS-2026-SUMSEL-002',
    lat: -3.55,
    lng: 105.32,
    confidence: 92,
    brightness: 349.0,
    frp: 91.5,
    satellite: 'MODIS / Aqua',
    date: '2026-08-24',
    time: '14:15 WIB',
    province: 'Sumatera Selatan',
    district: 'Ogan Komering Ilir',
    subdistrict: 'Cengal'
  },
  {
    id: 'HS-2026-SUMSEL-003',
    lat: -3.12,
    lng: 105.02,
    confidence: 85,
    brightness: 336.5,
    frp: 54.0,
    satellite: 'VIIRS / NOAA-20',
    date: '2026-08-23',
    time: '12:50 WIB',
    province: 'Sumatera Selatan',
    district: 'Ogan Komering Ilir',
    subdistrict: 'Pampangan'
  },
  // Tambang Batubara Muara Enim
  {
    id: 'HS-2026-SUMSEL-004',
    lat: -3.82,
    lng: 103.88,
    confidence: 95,
    brightness: 360.2,
    frp: 128.6,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:40 WIB',
    province: 'Sumatera Selatan',
    district: 'Muara Enim',
    subdistrict: 'Lawang Kidul'
  },
  {
    id: 'HS-2026-SUMSEL-005',
    lat: -2.98,
    lng: 104.74,
    confidence: 71,
    brightness: 322.4,
    frp: 24.1,
    satellite: 'MODIS / Terra',
    date: '2026-08-23',
    time: '10:30 WIB',
    province: 'Sumatera Selatan',
    district: 'Kota Palembang',
    subdistrict: 'Kertapati'
  },

  // ====================================================
  // JAMBI - TN Bukit Tiga Puluh & Sekitar Sawit
  // ====================================================
  {
    id: 'HS-2026-JAMBI-001',
    lat: -0.92,
    lng: 102.55,
    confidence: 97,
    brightness: 364.5,
    frp: 148.0,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '13:45 WIB',
    province: 'Jambi',
    district: 'Tanjung Jabung Barat',
    subdistrict: 'Tebing Tinggi'
  },
  {
    id: 'HS-2026-JAMBI-002',
    lat: -1.35,
    lng: 103.45,
    confidence: 81,
    brightness: 330.8,
    frp: 41.2,
    satellite: 'MODIS / Aqua',
    date: '2026-08-23',
    time: '14:10 WIB',
    province: 'Jambi',
    district: 'Muaro Jambi',
    subdistrict: 'Kumpeh Ulu'
  },

  // ====================================================
  // SULAWESI & PAPUA
  // ====================================================
  {
    id: 'HS-2026-SULTENG-001',
    lat: -1.45,
    lng: 120.12,
    confidence: 94,
    brightness: 351.0,
    frp: 88.0,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '12:30 WIB',
    province: 'Sulawesi Tengah',
    district: 'Poso',
    subdistrict: 'Lore Utara'
  },
  {
    id: 'HS-2026-SULTRA-001',
    lat: -4.24,
    lng: 121.68,
    confidence: 96,
    brightness: 362.0,
    frp: 130.4,
    satellite: 'VIIRS / NOAA-20',
    date: '2026-08-24',
    time: '12:35 WIB',
    province: 'Sulawesi Tenggara',
    district: 'Kolaka',
    subdistrict: 'Pomalaa'
  },
  {
    id: 'HS-2026-PAPUA-001',
    lat: -7.85,
    lng: 139.65,
    confidence: 89,
    brightness: 344.2,
    frp: 79.5,
    satellite: 'VIIRS / SNPP',
    date: '2026-08-24',
    time: '11:15 WIB',
    province: 'Papua Selatan',
    district: 'Merauke',
    subdistrict: 'Animha'
  },
  {
    id: 'HS-2026-PAPUA-002',
    lat: -8.15,
    lng: 140.20,
    confidence: 72,
    brightness: 323.0,
    frp: 31.0,
    satellite: 'MODIS / Terra',
    date: '2026-08-23',
    time: '09:40 WIB',
    province: 'Papua Selatan',
    district: 'Merauke',
    subdistrict: 'Semangga'
  }
];

/**
 * Initializes full Hotspot objects with spatial analysis
 */
export function getInitialHotspots(): Hotspot[] {
  return RAW_SEEDS.map((seed) => {
    const classification = classifyHotspotSpatial(seed.lat, seed.lng, seed.confidence);
    
    let confidenceLevel: Hotspot['confidenceLevel'] = 'medium';
    if (seed.confidence >= 80) confidenceLevel = 'high';
    else if (seed.confidence < 30) confidenceLevel = 'low';

    return {
      id: seed.id,
      latitude: seed.lat,
      longitude: seed.lng,
      confidence: seed.confidence,
      confidenceLevel,
      brightness: seed.brightness,
      frp: seed.frp,
      satellite: seed.satellite,
      acquisitionDate: seed.date,
      acquisitionTime: seed.time,
      province: seed.province,
      district: seed.district,
      subdistrict: seed.subdistrict,
      landCategory: classification.landCategory,
      landDetail: classification.landDetail
    };
  });
}

/**
 * Generates a newly detected simulated hotspot in Indonesia
 */
export function generateRandomHotspot(counter: number): Hotspot {
  const centers = [
    { province: 'Riau', district: 'Pelalawan', subdistrict: 'Pangkalan Kuras', lat: -0.10 + (Math.random() - 0.5) * 0.4, lng: 101.90 + (Math.random() - 0.5) * 0.5 },
    { province: 'Kalimantan Tengah', district: 'Pulang Pisau', subdistrict: 'Sebangau Hilir', lat: -2.70 + (Math.random() - 0.5) * 0.6, lng: 113.70 + (Math.random() - 0.5) * 0.6 },
    { province: 'Kalimantan Barat', district: 'Ketapang', subdistrict: 'Kendawangan', lat: -2.35 + (Math.random() - 0.5) * 0.4, lng: 110.35 + (Math.random() - 0.5) * 0.5 },
    { province: 'Kalimantan Timur', district: 'Kutai Timur', subdistrict: 'Sangatta', lat: 0.30 + (Math.random() - 0.5) * 0.3, lng: 117.55 + (Math.random() - 0.5) * 0.4 },
    { province: 'Sumatera Selatan', district: 'Ogan Komering Ilir', subdistrict: 'Pedamaran', lat: -3.35 + (Math.random() - 0.5) * 0.5, lng: 105.15 + (Math.random() - 0.5) * 0.5 }
  ];

  const loc = centers[Math.floor(Math.random() * centers.length)];
  const confidence = Math.floor(Math.random() * 45) + 55; // 55 - 100%
  const frp = Math.round((Math.random() * 120 + 20) * 10) / 10;
  const brightness = Math.round((Math.random() * 50 + 320) * 10) / 10;
  
  const satellites: SatelliteSensor[] = ['VIIRS / SNPP', 'VIIRS / NOAA-20', 'MODIS / Aqua', 'MODIS / Terra'];
  const satellite = satellites[Math.floor(Math.random() * satellites.length)];

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  const dateStr = now.toISOString().split('T')[0];

  const classification = classifyHotspotSpatial(loc.lat, loc.lng, confidence);

  let confidenceLevel: Hotspot['confidenceLevel'] = 'medium';
  if (confidence >= 80) confidenceLevel = 'high';
  else if (confidence < 30) confidenceLevel = 'low';

  return {
    id: `HS-LIVE-${String(counter).padStart(4, '0')}`,
    latitude: Math.round(loc.lat * 10000) / 10000,
    longitude: Math.round(loc.lng * 10000) / 10000,
    confidence,
    confidenceLevel,
    brightness,
    frp,
    satellite,
    acquisitionDate: dateStr,
    acquisitionTime: timeStr,
    province: loc.province,
    district: loc.district,
    subdistrict: loc.subdistrict,
    landCategory: classification.landCategory,
    landDetail: classification.landDetail
  };
}
