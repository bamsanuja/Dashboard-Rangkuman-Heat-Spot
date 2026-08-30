# Dashboard Ringkasan Heat Spot

Alat penapisan spasial titik panas karhutla. Aplikasi ini menampilkan titik panas di atas
poligon indikatif kawasan konservasi, dan membaca indikasi tutupan lahan dari citra satelit
di lokasi titik panas.

## Prinsip

Aplikasi ini tidak menyatakan apa pun yang tidak diberikan kepadanya.

- **Tidak ada data bawaan.** Repositori ini tidak memuat satu pun titik panas. Tidak ada
  data contoh, tidak ada pembangkit titik acak. Seluruh isi dasbor berasal dari berkas
  yang diimpor pengguna, dan setiap nilai dapat ditelusuri ke baris aslinya.
- **Tidak menyebut pemegang izin.** Batas HGU perkebunan tidak tersedia untuk publik
  meskipun Mahkamah Agung pada 2017 memutuskan dokumen HGU merupakan informasi publik.
  Aplikasi ini karena itu membaca keberadaan perkebunan dari citra sebagai pengamatan
  tutupan lahan, dan tidak pernah menamai perusahaan.
- **Tidak menyatakan pelanggaran.** Titik panas adalah anomali termal. Titik panas bukan
  titik api, bukan bukti pembakaran, dan tidak menunjukkan pelaku. Keluaran aplikasi ini
  adalah prioritas verifikasi lapangan.

## Sumber data

Impor berkas dari salah satu sumber berikut.

**SiPongi+ Kementerian Kehutanan** — <https://sipongi.gakkum.kehutanan.go.id/sebaran-titik-panas>
Pilih provinsi dan rentang tanggal, lalu gunakan Download KMZ atau Download TXT. KMZ memuat
titik berkoordinat. Tabel rekapitulasi tidak memuat koordinat dan tidak dapat dipetakan.
Penggunaan data SiPongi+ wajib mencantumkan sumber: SIPONGI KEMENHUT.

**NASA FIRMS** — CSV area untuk wilayah Indonesia, produk VIIRS atau MODIS.

Format yang diterima: `.kmz`, `.kml`, `.txt`, `.csv`.

## Yang dijaga aplikasi ini

- **Semantik kepercayaan.** MODIS melaporkan 0-100 persen; VIIRS melaporkan kategori
  low / nominal / high. Baris VIIRS yang membawa angka persen ditolak, bukan dipaksakan.
- **Kanal suhu.** VIIRS I-4 jenuh pada 367 K, MODIS kanal 21/22 pada rentang berbeda.
  Nama kanal ikut disimpan agar keduanya tidak tercampur.
- **FRP.** Fire Radiative Power adalah laju daya sesaat dalam megawatt. Aplikasi melaporkan
  nilai tertinggi dan median, tidak pernah menjumlahkannya.
- **Resolusi.** Jejak piksel 375 m untuk VIIRS dan 1 km untuk MODIS dibawa sebagai
  ketidakpastian. Jika titik lebih dekat ke batas daripada setengah jejak pikselnya,
  hubungan di dalam atau di luar dilaporkan sebagai tidak dapat ditentukan.
- **Lintasan satelit.** Waktu akuisisi yang mustahil bagi platform yang tercantum ditandai
  sebagai peringatan, bukan diperbaiki diam-diam.

## Indikasi tutupan lahan dari citra

Untuk tiap titik, aplikasi dapat mengambil ubin citra basemap di lokasi tersebut dan
mengukur dua hal: dominasi warna hijau terhadap kecerahan permukaan, dan apakah tekstur
berulang pada jarak tetap. Perkebunan industri ditanam dalam grid, sekitar 8 sampai 9 meter
untuk kelapa sawit, sehingga menghasilkan puncak autokorelasi yang khas.

Dua batasan ditampilkan di antarmuka, bukan disembunyikan.

1. Citra basemap tidak memaparkan tanggal perekaman dan umumnya berbeda jauh dari tanggal
   kebakaran. Citra menggambarkan tapak, bukan momen kebakaran.
2. Lahan dibakar untuk dibuka, dan tanaman baru muncul dua sampai tiga tahun kemudian.
   Pada saat kebakaran geometri tanam sering belum ada, sehingga hasil negatif adalah bukti
   yang lemah. Deret waktu Sentinel-2 sebelum dan sesudah kebakaran jauh lebih informatif,
   dan tautannya tersedia pada tiap titik.

## Tingkat bahaya kebakaran (FDRS)

Lapisan ini menjawab pertanyaan yang tidak bisa dijawab titik panas: seberapa
kering lahannya. Titik panas adalah catatan bahwa sesuatu sudah panas. FDRS
adalah indeks cuaca dan kekeringan yang menyatakan seberapa mudah api menyala
dan bertahan seandainya ada pemantiknya.

Sumber datanya GFWED milik NASA GISS, harian dan global, diunduh langsung tanpa
kunci API.

**Pengguna tidak perlu melakukan apa pun untuk lapisan ini.** Workflow GitHub
`.github/workflows/fdrs.yml` mengambil grid setiap pagi pukul 09:00 WIB,
menyimpannya sebagai `public/fdrs-latest.json`, dan commit itu memicu deploy
yang sudah ada. Aplikasi memuatnya dari alamatnya sendiri saat dibuka, jadi
tidak ada halangan CORS dan tidak ada berkas yang perlu diimpor.

Untuk menjalankannya di luar jadwal, tanpa terminal: buka tab **Actions** di
halaman GitHub repositori ini, pilih "Perbarui data tingkat bahaya kebakaran",
lalu klik **Run workflow**.

Dua jalan cadangan tersedia kalau otomatisasi tidak dipakai:

- Klik dua kali **`Ambil Data FDRS.command`** di Finder. Berkas itu menyiapkan
  sendiri perkakas yang dibutuhkan pada pemakaian pertama, mengunduh data, lalu
  membuka foldernya. Hasilnya diimpor lewat tombol Impor data.
- Atau lewat terminal, kalau Anda memang terbiasa:

  ```bash
  pip install xarray netCDF4 requests
  python scripts/fetch-fdrs.py 2026-08-26
  ```

Skrip mengunduh NetCDF harian, mencari keenam komponen sistem FWI pada berkas
itu, memotongnya ke kotak Indonesia, lalu menulis satu JSON sekitar 400 KB.

Enam komponen sistem Canadian Forest Fire Weather Index yang dipakai Indonesia:

| Kode | Mengukur | Waktu respons |
|---|---|---|
| FFMC | Kelembapan serasah dan bahan bakar halus | Jam |
| DMC | Lapisan organik setengah padat | Sekitar 2 minggu |
| **DC** | **Bahan organik dalam dan padat** | **Sekitar 2 bulan** |
| ISI | Laju rambat awal, FFMC dan angin | Turunan |
| BUI | Bahan bakar tersedia, DMC dan DC | Turunan |
| FWI | Intensitas keseluruhan, ISI dan BUI | Turunan |

Aplikasi menonjolkan **Drought Code**. Pada lahan gambut, DC-lah yang
menentukan apakah api turun ke bawah permukaan dan bertahan berminggu-minggu
setelah nyala di permukaan padam.

Nilai mentah GFWED disimpan apa adanya. Yang memakai ambang hanyalah
pengelompokan kelas bahaya, dan ambangnya mengikuti panel FDRS SiPongi+ yang
bersumber pada Spartan BMKG: FFMC 73/78/82, DMC 5/15/29, DC 141/261/350,
BUI 7/20/33, ISI 2/4/5, FWI 2/7/13. Pemisahan ini disengaja agar jelas mana
data dan mana penafsiran.

Dua batasan ditampilkan di antarmuka. Sel grid berukuran sekitar 0,25 derajat
atau 28 km, jauh lebih kasar daripada jejak piksel titik panas, sehingga
nilainya menggambarkan kondisi di sekitar titik. Dan kalau tanggal grid berbeda
dari tanggal akuisisi titik panas, selisih harinya ditampilkan sebagai
peringatan, karena kekeringan berubah harian.

Untuk keperluan resmi, rujukan pembandingnya adalah SPARTAN BMKG di
<https://spartan.bmkg.go.id/>, yang merupakan sumber yang ditampilkan SiPongi+.

## Poligon kawasan

`src/data/protectedAreas.ts` memuat delapan kawasan konservasi. Luas resmi dan nama unit
pengelola bersumber pada SK penetapan atau profil kawasan, dan setiap entri menyebutkan
sumbernya. Geometri poligon bersifat indikatif untuk penapisan awal dan bukan batas resmi.
Penentuan di dalam atau di luar kawasan harus mengacu pada SK penetapan kawasan hutan
Kementerian Kehutanan.

Tidak ada poligon konsesi perkebunan atau pertambangan di repositori ini. Batas konsesi
mineral dan batubara tersedia melalui geoportal ESDM dan dapat ditambahkan sebagai lapisan
impor.

## Untuk pengguna yang tidak memakai terminal

Buka tab **Panduan** di dalam aplikasi. Seluruh alur kerjanya ada di sana dalam
bahasa sehari-hari, lengkap dengan bagian "kalau ada yang tidak beres". Ringkasnya
hanya dua langkah: unduh berkas dari SiPongi+, lalu seret berkas itu ke jendela
aplikasi. Tingkat bahaya kebakaran mengurus dirinya sendiri.

## Menjalankan

```bash
npm install
npm run dev
npm run build
```

Aplikasi ini bukan produk resmi pemerintah dan tidak berafiliasi dengan Kementerian
Kehutanan.
