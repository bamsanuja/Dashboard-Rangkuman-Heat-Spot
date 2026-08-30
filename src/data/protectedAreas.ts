import type { IndicativeArea } from '../types';

/**
 * INDICATIVE conservation-area reference shapes.
 *
 * Read this before using anything here:
 *   - The `coordinates` are coarse screening shapes, NOT gazetted boundaries.
 *     They are deliberately never used to assert that a fire is inside a legally
 *     protected area. They answer "is this worth looking at" and nothing more.
 *   - `officialAreaHectares` IS sourced, and every entry names its decree.
 *   - The official boundary is published by Kementerian Kehutanan. Load it via
 *     the boundary import if you need a determination that will be relied on.
 *
 * No plantation or mining concession polygons appear in this file. Mining
 * boundaries are public through ESDM (MOMI / geoportal ESDM) and can be
 * imported. Palm HGU boundaries are not public: Mahkamah Agung ruled in 2017
 * that HGU documents are public information and the ruling has not been
 * implemented. The app therefore reads plantation presence off satellite
 * imagery as an observation, and never names a permit holder.
 */
export const INDICATIVE_AREAS: IndicativeArea[] = [
  {
    id: 'tn-tesso-nilo',
    name: 'Taman Nasional Tesso Nilo',
    managingUnit: 'Balai Taman Nasional Tesso Nilo',
    managingParent: 'Ditjen KSDAE, Kementerian Kehutanan',
    province: 'Riau',
    officialAreaHectares: 81793,
    areaSource: 'SK.6588/Menhut-VII/KUH/2014 (penetapan)',
    designation: 'Taman Nasional',
    coordinates: [[
      [101.589, -0.05], [101.95, -0.06], [102.066, -0.30],
      [101.75, -0.42], [101.60, -0.22], [101.589, -0.05],
    ]],
    note: 'Habitat gajah sumatera dan harimau sumatera.',
    geometryCaveat: 'Bentuk indikatif. Batas resmi mengacu pada SK penetapan kawasan.',
  },
  {
    id: 'sm-giam-siak-kecil',
    name: 'Suaka Margasatwa Giam Siak Kecil',
    managingUnit: 'Balai Besar KSDA Riau',
    managingParent: 'Ditjen KSDAE, Kementerian Kehutanan',
    province: 'Riau',
    officialAreaHectares: 84967,
    areaSource: 'SK Menhut 173/Kpts-II/1986',
    designation: 'Suaka Margasatwa',
    coordinates: [[
      [101.45, 1.05], [101.85, 1.15], [101.95, 0.90],
      [101.55, 0.80], [101.42, 0.95], [101.45, 1.05],
    ]],
    note: 'Kawasan konservasi di dalam lanskap Cagar Biosfer Giam Siak Kecil-Bukit Batu (705.271 ha; zona inti 178.722 ha). Suaka margasatwa dan cagar biosfer adalah dua hal berbeda.',
    geometryCaveat: 'Bentuk indikatif. Batas suaka margasatwa berbeda dari batas zona cagar biosfer.',
  },
  {
    id: 'tn-bukit-tigapuluh',
    name: 'Taman Nasional Bukit Tigapuluh',
    managingUnit: 'Balai Taman Nasional Bukit Tigapuluh',
    managingParent: 'Ditjen KSDAE, Kementerian Kehutanan',
    province: 'Riau dan Jambi',
    officialAreaHectares: 144223,
    areaSource: 'SK 6407/Kpts-II/2002 (temu gelang)',
    designation: 'Taman Nasional',
    coordinates: [[
      [102.30, -0.70], [102.75, -0.65], [102.85, -1.05],
      [102.40, -1.15], [102.25, -0.85], [102.30, -0.70],
    ]],
    note: 'Harimau sumatera merupakan satwa asli kawasan. Populasi orangutan sumatera di sini berasal dari program reintroduksi sejak 2002, di luar sebaran alaminya.',
    geometryCaveat: 'Bentuk indikatif. Kawasan membentang di Indragiri Hulu dan Indragiri Hilir (Riau) serta Tebo dan Tanjung Jabung Barat (Jambi).',
  },
  {
    id: 'tn-sebangau',
    name: 'Taman Nasional Sebangau',
    managingUnit: 'Balai Taman Nasional Sebangau',
    managingParent: 'Ditjen KSDAE, Kementerian Kehutanan',
    province: 'Kalimantan Tengah',
    officialAreaHectares: 537451,
    areaSource: 'Profil kawasan KSDAE; SK 529/Menhut-II/2012 mencatat 542.141 ha. Angka 568.700 ha berasal dari penunjukan 2004 dan sudah tidak berlaku.',
    designation: 'Taman Nasional',
    coordinates: [[
      [113.40, -2.15], [114.05, -2.10], [114.15, -3.00],
      [113.55, -3.10], [113.32, -2.55], [113.40, -2.15],
    ]],
    note: 'Salah satu blok hutan rawa gambut utuh terbesar di Kalimantan, penopang hidrologis Sungai Sebangau dan Sungai Katingan.',
    geometryCaveat: 'Bentuk indikatif. Kota Palangka Raya berbatasan langsung dan tidak termasuk kawasan.',
  },
  {
    id: 'tn-tanjung-puting',
    name: 'Taman Nasional Tanjung Puting',
    managingUnit: 'Balai Taman Nasional Tanjung Puting',
    managingParent: 'Ditjen KSDAE, Kementerian Kehutanan',
    province: 'Kalimantan Tengah',
    officialAreaHectares: 415040,
    areaSource: 'SK 687/Kpts-II/1996',
    designation: 'Taman Nasional',
    coordinates: [[
      [111.70, -2.70], [112.25, -2.72], [112.30, -3.45],
      [111.75, -3.48], [111.65, -3.05], [111.70, -2.70],
    ]],
    note: 'Camp Leakey berada di dalam kawasan, didirikan 1971; kini berfungsi sebagai stasiun riset dan pemantauan.',
    geometryCaveat: 'Bentuk indikatif.',
  },
  {
    id: 'tn-betung-kerihun',
    name: 'Taman Nasional Betung Kerihun',
    managingUnit: 'Balai Besar Taman Nasional Betung Kerihun dan Danau Sentarum',
    managingParent: 'Ditjen KSDAE, Kementerian Kehutanan',
    province: 'Kalimantan Barat',
    officialAreaHectares: 816693,
    areaSource: 'Penetapan 23 April 2014. Angka 800.000 ha berasal dari penunjukan 1995.',
    designation: 'Taman Nasional',
    coordinates: [[
      [112.90, 0.75], [114.10, 0.95], [114.30, 1.45],
      [113.20, 1.35], [112.85, 1.05], [112.90, 0.75],
    ]],
    note: 'Hulu Sungai Kapuas, berbatasan dengan Sarawak.',
    geometryCaveat: 'Bentuk indikatif dan diketahui bergeser dari sentroid kawasan sebenarnya. Jangan gunakan untuk penentuan di dalam atau di luar kawasan.',
  },
  {
    id: 'hl-sungai-wain',
    name: 'Hutan Lindung Sungai Wain',
    managingUnit: 'Badan Pengelola Hutan Lindung Sungai Wain dan DAS Manggar',
    managingParent: 'Pemerintah Kota Balikpapan',
    province: 'Kalimantan Timur',
    officialAreaHectares: 9782,
    areaSource: 'Sumber bervariasi antara 9.782 ha dan sekitar 10.000 ha; SK penetapan belum diverifikasi.',
    designation: 'Hutan Lindung',
    coordinates: [[
      [116.80, -1.05], [116.94, -1.06], [116.96, -1.21],
      [116.82, -1.22], [116.78, -1.14], [116.80, -1.05],
    ]],
    note: 'Habitat beruang madu dan tangkapan air bersih utama Kota Balikpapan. Dikelola pemerintah kota, bukan UPT Kementerian Kehutanan.',
    geometryCaveat: 'Bentuk indikatif. Luas resmi belum terverifikasi terhadap SK.',
  },
  {
    id: 'tn-lore-lindu',
    name: 'Taman Nasional Lore Lindu',
    managingUnit: 'Balai Taman Nasional Lore Lindu',
    managingParent: 'Ditjen KSDAE, Kementerian Kehutanan',
    province: 'Sulawesi Tengah',
    officialAreaHectares: 215733,
    areaSource: 'Setelah pelepasan Dongi-Dongi 1.531 ha ke APL pada 2014.',
    designation: 'Taman Nasional',
    coordinates: [[
      [119.90, -1.20], [120.45, -1.25], [120.50, -1.80],
      [119.95, -1.85], [119.85, -1.50], [119.90, -1.20],
    ]],
    note: 'Cagar biosfer MAB dan situs megalitik Lembah Bada, Napu, dan Besoa. Kawasan membentang di Kabupaten Sigi dan Kabupaten Poso.',
    geometryCaveat: 'Bentuk indikatif.',
  },
];

/** Shown wherever area data appears. */
export const AREA_LAYER_DISCLAIMER =
  'Poligon kawasan bersifat indikatif untuk penapisan awal. Batas resmi mengacu pada SK penetapan kawasan hutan Kementerian Kehutanan.';
