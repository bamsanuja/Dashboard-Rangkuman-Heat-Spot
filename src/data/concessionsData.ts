import type { ConcessionPolygon } from '../types';

export const CONCESSION_POLYGONS: ConcessionPolygon[] = [
  // ==========================================
  // 1. HUTAN LINDUNG & KAWASAN KONSERVASI
  // ==========================================
  {
    id: 'hl-tesso-nilo',
    name: 'Taman Nasional Tesso Nilo',
    category: 'hutan_lindung',
    holder: 'Balai TN Tesso Nilo (Kemenhut RI)',
    province: 'Riau',
    areaHectares: 83068,
    permitType: 'Kawasan Konservasi / TN',
    coordinates: [[
      [101.45, -0.05],
      [101.85, -0.05],
      [101.90, -0.30],
      [101.50, -0.35],
      [101.40, -0.15],
      [101.45, -0.05]
    ]],
    color: '#10b981',
    fillColor: '#059669',
    description: 'Habitat gajah sumatera dan harimau sumatera, status perlindungan mutlak UU No 5/1990.'
  },
  {
    id: 'hl-giam-siak',
    name: 'Cagar Biosfer Giam Siak Kecil',
    category: 'hutan_lindung',
    holder: 'BBKSDA Riau',
    province: 'Riau',
    areaHectares: 178722,
    permitType: 'Suaka Margasatwa & Biosfer',
    coordinates: [[
      [101.40, 1.15],
      [101.80, 1.25],
      [101.95, 0.85],
      [101.55, 0.70],
      [101.35, 0.95],
      [101.40, 1.15]
    ]],
    color: '#10b981',
    fillColor: '#059669',
    description: 'Hutan rawa gambut dengan keanekaragaman hayati tinggi dan cadangan karbon raksasa.'
  },
  {
    id: 'hl-bukit-tigapuluh',
    name: 'Taman Nasional Bukit Tiga Puluh',
    category: 'hutan_lindung',
    holder: 'Balai TN Bukit Tiga Puluh',
    province: 'Jambi / Riau',
    areaHectares: 144223,
    permitType: 'Taman Nasional Konservasi',
    coordinates: [[
      [102.30, -0.70],
      [102.75, -0.65],
      [102.85, -1.05],
      [102.40, -1.15],
      [102.25, -0.85],
      [102.30, -0.70]
    ]],
    color: '#10b981',
    fillColor: '#059669',
    description: 'Bentang alam perbukitan tropis dataran rendah perlindungan Orangutan & Harimau.'
  },
  {
    id: 'hl-sebangau',
    name: 'Taman Nasional Sebangau',
    category: 'hutan_lindung',
    holder: 'Balai TN Sebangau (Kemenhut RI)',
    province: 'Kalimantan Tengah',
    areaHectares: 568700,
    permitType: 'Taman Nasional Gambut',
    coordinates: [[
      [113.40, -2.15],
      [114.10, -2.10],
      [114.25, -3.10],
      [113.60, -3.20],
      [113.30, -2.60],
      [113.40, -2.15]
    ]],
    color: '#10b981',
    fillColor: '#059669',
    description: 'Kawasan ekosistem rawa gambut terbesar Kalimantan penopang hidrologis sungai Sebangau & Katingan.'
  },
  {
    id: 'hl-tanjung-puting',
    name: 'Taman Nasional Tanjung Puting',
    category: 'hutan_lindung',
    holder: 'Balai TN Tanjung Puting',
    province: 'Kalimantan Tengah',
    areaHectares: 415040,
    permitType: 'Kawasan Konservasi & Cagar Biosfer',
    coordinates: [[
      [111.75, -2.65],
      [112.25, -2.70],
      [112.35, -3.55],
      [111.80, -3.50],
      [111.70, -3.00],
      [111.75, -2.65]
    ]],
    color: '#10b981',
    fillColor: '#059669',
    description: 'Pusat rehabilitasi Orangutan dunia (Camp Leakey) dan suaka keanekaragaman hayati pesisir.'
  },
  {
    id: 'hl-betung-kerihun',
    name: 'Taman Nasional Betung Kerihun',
    category: 'hutan_lindung',
    holder: 'Balai Besar TNBKDS Kalbar',
    province: 'Kalimantan Barat',
    areaHectares: 800000,
    permitType: 'Hutan Konservasi Pegunungan',
    coordinates: [[
      [112.50, 0.70],
      [113.60, 1.25],
      [113.90, 0.85],
      [113.10, 0.40],
      [112.40, 0.50],
      [112.50, 0.70]
    ]],
    color: '#10b981',
    fillColor: '#059669',
    description: 'Kawasan hutan hulu sungai Kapuas perbatasan Malaysia dengan nilai resapan air strategis nasional.'
  },
  {
    id: 'hl-sungai-wain',
    name: 'Hutan Lindung Sungai Wain',
    category: 'hutan_lindung',
    holder: 'BP HLSW Balikpapan',
    province: 'Kalimantan Timur',
    areaHectares: 10025,
    permitType: 'Hutan Lindung & Resapan Air',
    coordinates: [[
      [116.78, -1.08],
      [116.92, -1.05],
      [116.95, -1.18],
      [116.82, -1.22],
      [116.78, -1.08]
    ]],
    color: '#10b981',
    fillColor: '#059669',
    description: 'Hutan primer penyangga air bersih utama kota Balikpapan dan habitat Beruang Madu.'
  },
  {
    id: 'hl-lore-lindu',
    name: 'Taman Nasional Lore Lindu',
    category: 'hutan_lindung',
    holder: 'Balai TN Lore Lindu',
    province: 'Sulawesi Tengah',
    areaHectares: 217991,
    permitType: 'Taman Nasional Konservasi',
    coordinates: [[
      [119.85, -1.10],
      [120.35, -1.15],
      [120.40, -1.80],
      [119.90, -1.75],
      [119.85, -1.10]
    ]],
    color: '#10b981',
    fillColor: '#059669',
    description: 'Situs cagar biosfer dan megalitikum di jantung pegunungan Sulawesi Tengah.'
  },

  // ==========================================
  // 2. KONSESI PERKEBUNAN KELAPA SAWIT (HGU)
  // ==========================================
  {
    id: 'sawit-riau-1',
    name: 'PT. Palma Andalan Persada (Blok Pelalawan)',
    category: 'sawit',
    holder: 'Palma Agri Group',
    province: 'Riau',
    areaHectares: 24500,
    permitType: 'HGU Perkebunan Kelapa Sawit',
    coordinates: [[
      [101.95, -0.02],
      [102.35, -0.05],
      [102.30, -0.28],
      [101.92, -0.25],
      [101.95, -0.02]
    ]],
    color: '#f59e0b',
    fillColor: '#d97706',
    description: 'Konsesi perkebunan sawit berbatasan langsung dengan sisi timur TN Tesso Nilo.'
  },
  {
    id: 'sawit-riau-2',
    name: 'PT. Siak Sawit Makmur (Blok Siak-Bengkalis)',
    category: 'sawit',
    holder: 'Nusantara Agro Holding',
    province: 'Riau',
    areaHectares: 18900,
    permitType: 'Izin Usaha Perkebunan (IUP-B)',
    coordinates: [[
      [101.60, 0.90],
      [102.05, 0.85],
      [102.10, 0.60],
      [101.65, 0.65],
      [101.60, 0.90]
    ]],
    color: '#f59e0b',
    fillColor: '#d97706',
    description: 'Perkebunan kelapa sawit di atas lahan gambut dangkal zona Siak.'
  },
  {
    id: 'sawit-kalteng-1',
    name: 'PT. Sawit Sumber Sejahtera (Kotawaringin Barat)',
    category: 'sawit',
    holder: 'Citra Borneo Agro',
    province: 'Kalimantan Tengah',
    areaHectares: 32000,
    permitType: 'HGU Perkebunan Sawit',
    coordinates: [[
      [111.40, -2.40],
      [111.72, -2.45],
      [111.68, -2.90],
      [111.35, -2.85],
      [111.40, -2.40]
    ]],
    color: '#f59e0b',
    fillColor: '#d97706',
    description: 'Konsesi sawit penyangga sebelah barat TN Tanjung Puting.'
  },
  {
    id: 'sawit-kalteng-2',
    name: 'PT. Katingan Agro Lestari (Katingan Hilir)',
    category: 'sawit',
    holder: 'Borneo Palm Resources',
    province: 'Kalimantan Tengah',
    areaHectares: 27500,
    permitType: 'HGU Perkebunan Kelapa Sawit',
    coordinates: [[
      [113.15, -2.30],
      [113.38, -2.32],
      [113.42, -2.75],
      [113.10, -2.70],
      [113.15, -2.30]
    ]],
    color: '#f59e0b',
    fillColor: '#d97706',
    description: 'Perkebunan kelapa sawit di koridor batas timur laut TN Sebangau.'
  },
  {
    id: 'sawit-sumsel-1',
    name: 'PT. Bumi Ogan Sawit (OKI Pedamaran)',
    category: 'sawit',
    holder: 'Sriwijaya Plantation Corp',
    province: 'Sumatera Selatan',
    areaHectares: 41000,
    permitType: 'HGU Perkebunan Gambut',
    coordinates: [[
      [104.90, -3.20],
      [105.40, -3.15],
      [105.45, -3.65],
      [104.95, -3.60],
      [104.90, -3.20]
    ]],
    color: '#f59e0b',
    fillColor: '#d97706',
    description: 'Kawasan perkebunan kelapa sawit rawan karhutla hidrologis gambut Ogan Komering Ilir.'
  },
  {
    id: 'sawit-kalbar-1',
    name: 'PT. Ketapang Sawit Abadi (Kendawangan)',
    category: 'sawit',
    holder: 'Kalbar Agro Prima',
    province: 'Kalimantan Barat',
    areaHectares: 29000,
    permitType: 'HGU Perkebunan Sawit',
    coordinates: [[
      [110.15, -2.20],
      [110.55, -2.25],
      [110.60, -2.65],
      [110.18, -2.60],
      [110.15, -2.20]
    ]],
    color: '#f59e0b',
    fillColor: '#d97706',
    description: 'Perkebunan kelapa sawit pesisir selatan Kabupaten Ketapang.'
  },

  // ==========================================
  // 3. KAWASAN KONSESI PERTAMBANGAN (IUP / PKP2B)
  // ==========================================
  {
    id: 'tambang-kaltim-1',
    name: 'PT. Kaltim Coal Mining (Sangatta Pit)',
    category: 'tambang',
    holder: 'Energy Nusantara Tbk',
    province: 'Kalimantan Timur',
    areaHectares: 48000,
    permitType: 'IUP Operasi Produksi Batubara',
    coordinates: [[
      [117.40, 0.40],
      [117.80, 0.45],
      [117.85, 0.15],
      [117.45, 0.10],
      [117.40, 0.40]
    ]],
    color: '#a855f7',
    fillColor: '#9333ea',
    description: 'Area konsesi tambang batubara terbuka (open-pit mining) dan disposal Kutai Timur.'
  },
  {
    id: 'tambang-kalsel-1',
    name: 'PT. Tabalong Mineral Resources',
    category: 'tambang',
    holder: 'South Borneo Minerals',
    province: 'Kalimantan Selatan',
    areaHectares: 35000,
    permitType: 'PKP2B Tambang Batubara',
    coordinates: [[
      [115.30, -2.10],
      [115.70, -2.08],
      [115.75, -2.45],
      [115.32, -2.40],
      [115.30, -2.10]
    ]],
    color: '#a855f7',
    fillColor: '#9333ea',
    description: 'Konsesi pertambangan batubara aktif di lereng Pegunungan Meratus bagian barat.'
  },
  {
    id: 'tambang-sumsel-1',
    name: 'PT. Bukit Enim Tambang Batubara',
    category: 'tambang',
    holder: 'Sumatra Energy Holding',
    province: 'Sumatera Selatan',
    areaHectares: 26000,
    permitType: 'IUP Operasi Produksi',
    coordinates: [[
      [103.70, -3.70],
      [104.05, -3.65],
      [104.10, -4.00],
      [103.75, -3.95],
      [103.70, -3.70]
    ]],
    color: '#a855f7',
    fillColor: '#9333ea',
    description: 'Kawasan tambang batubara Muara Enim dengan aktivitas pembukaan lahan penambangan.'
  },
  {
    id: 'tambang-sultra-1',
    name: 'PT. Pomalaa Nickel Mining & Smelter',
    category: 'tambang',
    holder: 'Sulawesi Mining Alliance',
    province: 'Sulawesi Tenggara',
    areaHectares: 19500,
    permitType: 'IUP Operasi Tambang Nikel',
    coordinates: [[
      [121.50, -4.10],
      [121.80, -4.12],
      [121.85, -4.40],
      [121.52, -4.38],
      [121.50, -4.10]
    ]],
    color: '#a855f7',
    fillColor: '#9333ea',
    description: 'Kawasan konsesi penambangan nikel laterit dan infrastruktur smelter Kolaka.'
  },

  // ==========================================
  // 4. KAWASAN PERKOTAAN & PEMUKIMAN
  // ==========================================
  {
    id: 'kota-pekanbaru',
    name: 'Kawasan Perkotaan Pekanbaru & Sekitarnya',
    category: 'perkotaan',
    province: 'Riau',
    areaHectares: 63200,
    coordinates: [[
      [101.35, 0.65],
      [101.55, 0.65],
      [101.55, 0.40],
      [101.35, 0.40],
      [101.35, 0.65]
    ]],
    color: '#06b6d4',
    fillColor: '#0891b2',
    description: 'Kawasan metropolitan ibu kota Provinsi Riau, pemukiman padat dan sabuk perumahan.'
  },
  {
    id: 'kota-palangkaraya',
    name: 'Kawasan Perkotaan Palangka Raya',
    category: 'perkotaan',
    province: 'Kalimantan Tengah',
    areaHectares: 45000,
    coordinates: [[
      [113.82, -2.15],
      [114.02, -2.15],
      [114.02, -2.32],
      [113.82, -2.32],
      [113.82, -2.15]
    ]],
    color: '#06b6d4',
    fillColor: '#0891b2',
    description: 'Pusat pemerintahan Kota Palangka Raya, perumahan dan pekarangan pinggiran kota.'
  },
  {
    id: 'kota-pontianak',
    name: 'Kawasan Perkotaan Pontianak & Kubu Raya',
    category: 'perkotaan',
    province: 'Kalimantan Barat',
    areaHectares: 38000,
    coordinates: [[
      [109.25, -0.08],
      [109.45, -0.08],
      [109.45, 0.05],
      [109.25, 0.05],
      [109.25, -0.08]
    ]],
    color: '#06b6d4',
    fillColor: '#0891b2',
    description: 'Wilayah perkotaan Pontianak dan pemukiman pinggir sungai muara Kapuas.'
  },
  {
    id: 'kota-palembang',
    name: 'Kawasan Perkotaan Palembang',
    category: 'perkotaan',
    province: 'Sumatera Selatan',
    areaHectares: 40000,
    coordinates: [[
      [104.65, -2.90],
      [104.85, -2.90],
      [104.85, -3.08],
      [104.65, -3.08],
      [104.65, -2.90]
    ]],
    color: '#06b6d4',
    fillColor: '#0891b2',
    description: 'Kawasan perkotaan Palembang sepanjang koridor Sungai Musi dan kawasan industri.'
  },
  {
    id: 'kota-samarinda-balikpapan',
    name: 'Kawasan Perkotaan Balikpapan & Pesisir',
    category: 'perkotaan',
    province: 'Kalimantan Timur',
    areaHectares: 50300,
    coordinates: [[
      [116.80, -1.20],
      [117.02, -1.18],
      [117.02, -1.32],
      [116.80, -1.32],
      [116.80, -1.20]
    ]],
    color: '#06b6d4',
    fillColor: '#0891b2',
    description: 'Kota pesisir Balikpapan, zona industri migas dan pemukiman pesisir.'
  }
];
