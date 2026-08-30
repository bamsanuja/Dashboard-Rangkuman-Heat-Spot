# Prompt untuk Claude Code

Salin seluruh isi di bawah garis ini ke Claude Code, dijalankan dari folder
`/Users/bambanganuja/Documents/Project Gasing`.

---

Kerjakan empat hal berikut di repositori ini, berurutan. Berhenti dan laporkan
kalau ada langkah yang gagal, jangan lanjut ke langkah berikutnya.

## 1. Perbaiki deploy GitHub Pages yang gagal

Workflow `deploy.yml` gagal dengan pesan:

```
Branch "main" is not allowed to deploy to github-pages due to environment protection rules.
The deployment was rejected or didn't satisfy other protection rules.
```

Penyebabnya: repositori ini punya dua jalur deploy yang bertabrakan. Ada branch
`gh-pages` dan skrip `gh-pages -d dist` di package.json (cara lama), sementara
`deploy.yml` memakai `actions/deploy-pages` (cara baru). Cara baru menuntut
sumber GitHub Pages disetel ke "GitHub Actions", dan selama sumbernya masih
"Deploy from a branch", deploy dari `main` akan selalu ditolak.

Ubah sumber Pages menjadi workflow lewat `gh`:

```bash
gh api -X PUT repos/bamsanuja/project-gasing/pages -f build_type=workflow
```

Verifikasi hasilnya:

```bash
gh api repos/bamsanuja/project-gasing/pages --jq '{build_type, html_url, status}'
```

Kalau `gh` menolak karena kurang scope, jangan dipaksa. Laporkan bahwa langkah
ini harus dilakukan manual lewat **Settings → Pages → Build and deployment →
Source → GitHub Actions**, lalu lanjut ke langkah 2.

Setelah itu cek juga apakah environment `github-pages` membatasi branch:

```bash
gh api repos/bamsanuja/project-gasing/environments/github-pages --jq '.deployment_branch_policy'
```

Kalau ada pembatasan yang tidak memuat `main`, laporkan supaya saya perbaiki
manual. Jangan ubah sendiri kebijakan environment tanpa memberi tahu saya.

## 2. Ganti nama tampilan aplikasi

Nama lama "SiPongi Land-Watch" diganti menjadi **Dashboard Ringkasan Heat Spot**.

Ganti di berkas-berkas berikut, dan hanya di tempat yang memang nama tampilan:

- `index.html` baris 7, elemen `<title>`. Jadikan:
  `Dashboard Ringkasan Heat Spot | Penapisan Spasial Titik Panas`
- `index.html`, atribut `content` pada `<meta name="description">` kalau memuat
  nama lama.
- `src/components/Navbar.tsx` baris 34, isi elemen `<h1>`.
- `README.md` baris 1, judul dokumen.
- `src/types/index.ts` baris 2, komentar `// Domain schema for ...`.
- `src/components/HotspotTable.tsx` baris 51, nama berkas unduhan CSV. Ubah
  `land-watch-ekspor-` menjadi `ringkasan-heatspot-`.

**Jangan diubah:**

- `package.json` medan `name` dan `homepage`. Keduanya terikat pada nama
  repositori dan URL situs. Mengubahnya akan merusak alamat GitHub Pages.
- `src/utils/imageryCache.ts` baris 19, `DB_NAME = 'sipongi-land-watch'`. Itu
  nama basis data IndexedDB di browser. Mengubahnya membuat seluruh ingatan
  pembacaan citra dan koreksi manual pengguna hilang.
- Nama folder di disk, dan nama repositori di GitHub.

Setelah selesai, cari sisa kemunculan nama lama dan tunjukkan hasilnya kepada
saya sebelum lanjut:

```bash
grep -rn "SiPongi Land-Watch\|Sipongi Land-Watch\|land-watch" src/ index.html README.md | grep -v node_modules
```

Yang tersisa seharusnya hanya `DB_NAME` di `imageryCache.ts`.

## 3. Pastikan aplikasi masih sehat

Jalankan ketiganya dan tunjukkan keluarannya:

```bash
npx tsc --noEmit -p tsconfig.app.json
npx oxlint src
npm run build
```

Semua harus bersih. Kalau ada error, perbaiki dulu sebelum lanjut, dan
jelaskan apa yang Anda ubah.

## 4. Commit dan push

Ada pekerjaan yang belum ter-commit dari sesi sebelumnya, di luar perubahan
nama tadi:

- `src/utils/imageryCache.ts` (berkas baru) beserta perubahan di `src/App.tsx`
  dan `src/components/ImageryGrid.tsx`: ingatan pembacaan citra di IndexedDB,
  supaya impor berulang tidak perlu membaca ulang ribuan ubin citra.
- `src/index.css` dan `src/components/GisMap.tsx`: perbaikan tooltip Leaflet
  yang teksnya meluber keluar kotak.
- `src/components/FdrsPanel.tsx`: pesan kosong yang mengarahkan ke tab Actions,
  menggantikan saran menjalankan perintah terminal.

Commit semuanya dalam satu commit dengan pesan:

```
feat: ganti nama jadi Dashboard Ringkasan Heat Spot, ingatan pembacaan citra, perbaikan tooltip
```

Pastikan `.venv-fdrs/` dan `_to_delete/` tidak ikut, keduanya sudah ada di
`.gitignore`. Lalu push ke `origin main`.

## 5. Setelah push, jalankan dan periksa

Tunggu workflow `deploy.yml` selesai, lalu laporkan statusnya:

```bash
gh run list --limit 3
gh run watch
```

Kalau deploy berhasil, jalankan workflow FDRS-nya sekaligus:

```bash
gh workflow run "Perbarui data tingkat bahaya kebakaran"
gh run list --workflow="Perbarui data tingkat bahaya kebakaran" --limit 2
```

Workflow itu mengambil grid Fire Danger Rating harian dari GFWED di server
GitHub, menyimpannya sebagai `public/fdrs-latest.json`, dan commit-nya memicu
deploy ulang. Perlu dijalankan di server karena jaringan komputer ini memblokir
port 443 ke `portal.nccs.nasa.gov`.

Kalau workflow FDRS gagal, tunjukkan lognya. Kemungkinan penyebab yang wajar:
tanggal yang diminta belum terbit di GFWED, dan skripnya memang mundur sampai
tiga hari sebelum menyerah.

## Yang JANGAN dikerjakan

- Jangan menghapus branch `gh-pages`, skrip `predeploy`/`deploy` di
  package.json, maupun dependensi `gh-pages`. Semua itu jalur cadangan, dan
  baru aman dibuang setelah deploy lewat Actions terbukti berhasil.
- Jangan mengubah logika apa pun di `src/utils/`. Ambang classifier citra,
  ambang FDRS, dan radius klasterisasi semuanya sudah dikalibrasi terhadap data
  nyata.
- Jangan menambah dependensi baru.

## Laporan akhir

Sampaikan dalam bahasa Indonesia, ringkas:

1. Sumber GitHub Pages berhasil diubah atau perlu saya klik manual.
2. Berapa berkas yang namanya diganti, dan sisa kemunculan nama lama kalau ada.
3. Hasil tsc, oxlint, dan build.
4. Hash commit dan konfirmasi push.
5. Status deploy dan status workflow FDRS.
6. Apa pun yang Anda temukan janggal sambil jalan, meskipun saya tidak
   menanyakannya.
