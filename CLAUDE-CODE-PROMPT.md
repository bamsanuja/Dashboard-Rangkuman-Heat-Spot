# Prompt untuk Claude Code

Salin bagian di bawah garis ke Claude Code, jalankan dari
`/Users/bambanganuja/Documents/Project Gasing`.

---

Jalankan seluruh langkah di bawah sampai selesai tanpa berhenti bertanya,
kecuali pada titik yang memang saya minta Anda berhenti.

Deploy ke GitHub Pages sebelumnya gagal karena dua kebijakan repositori. Alih-alih
mengubah setelan, kita ganti cara deploy-nya supaya cocok dengan konfigurasi yang
sudah ada.

Latar belakangnya: repositori ini menyajikan Pages dari branch `gh-pages`, dan
environment `github-pages` punya kebijakan yang hanya mengizinkan branch
`gh-pages`. Workflow lama memakai `actions/deploy-pages`, yang menuntut sumber
Pages disetel ke "GitHub Actions" sekaligus `main` masuk daftar izin environment.
Mendorong hasil build langsung ke branch `gh-pages` adalah dorongan git biasa,
jadi tidak menyentuh environment sama sekali.

`.github/workflows/deploy.yml` sudah saya ganti isinya. Tugas Anda memastikan
sisanya berjalan.

## 1. Pastikan izin workflow sudah benar

Saya sudah mengubah setelannya ke read and write. Verifikasi saja:

```bash
gh api repos/bamsanuja/project-gasing/actions/permissions/workflow \
  --jq '.default_workflow_permissions'
```

Harus mengembalikan `"write"`. Kalau masih `"read"`, berhenti dan beri tahu
saya, karena berarti perubahan saya belum tersimpan. Jangan mencoba mengubahnya
lewat API, permintaan tulis ke setelan repositori akan ditolak classifier.

## 2. Pastikan aplikasi sehat

```bash
npx tsc --noEmit -p tsconfig.app.json
npx oxlint src
npm run build
```

Ketiganya harus bersih. Perbaiki dulu kalau ada yang gagal, dan jelaskan apa
yang Anda ubah.

## 3. Commit dan push

Commit perubahan `deploy.yml` dan berkas prompt ini dengan pesan:

```
ci: terbitkan lewat branch gh-pages, hindari kebijakan environment
```

Push ke `origin main`.

Catatan soal `.git/index.lock`: language server Antigravity IDE berulang kali
membuat lock kosong di repositori ini. Kalau muncul lagi, pastikan tidak ada
proses `git` sungguhan yang memegangnya, hapus, lalu rangkai perintah git dalam
satu baris supaya tidak keburu terkunci lagi.

## 4. Pantau deploy sampai selesai

```bash
gh run list --limit 3
gh run watch
```

Kalau gagal, tunjukkan lognya dan berhenti. Jangan menjalankan langkah 5.

Satu kemungkinan kegagalan yang mudah diperbaiki: kalau `peaceiris/actions-gh-pages@v4`
tidak dapat di-resolve, ganti ke versi major terbaru yang tersedia, lalu commit
dan jalankan ulang. Perbaikan seperti itu boleh Anda lakukan sendiri tanpa
bertanya, cukup laporkan.

## 5. Jalankan pengambilan FDRS

Hanya kalau langkah 4 berhasil.

```bash
gh workflow run "Perbarui data tingkat bahaya kebakaran"
sleep 20
gh run list --workflow="Perbarui data tingkat bahaya kebakaran" --limit 2
gh run watch
```

Workflow ini mengambil grid Fire Danger Rating harian dari GFWED di server
GitHub, menyimpannya sebagai `public/fdrs-latest.json`, lalu commit-nya memicu
deploy ulang. Dijalankan di server karena jaringan komputer ini memblokir port
443 ke `portal.nccs.nasa.gov`.

Kalau gagal karena tanggalnya belum terbit di GFWED, itu wajar dan bukan bug.
Skripnya memang mundur sampai tiga hari sebelum menyerah. Tunjukkan lognya.

## 6. Verifikasi situs yang tayang

```bash
curl -s https://bamsanuja.github.io/project-gasing/ | grep -o '<title>[^<]*</title>'
curl -s -o /dev/null -w '%{http_code}\n' https://bamsanuja.github.io/project-gasing/fdrs-latest.json
```

Judulnya harus memuat "Dashboard Ringkasan Heat Spot". Berkas FDRS harus
menjawab 200 kalau langkah 5 berhasil. Pages bisa perlu satu sampai dua menit
sebelum menyajikan versi baru, jadi ulangi sekali kalau masih versi lama.

## Yang jangan dikerjakan

- Jangan mengubah setelan repositori lewat API. Kalau ada yang perlu diubah,
  laporkan dan biarkan saya yang klik.
- Jangan menghapus branch `gh-pages`. Branch itu justru yang sekarang menyajikan
  situs.
- Jangan menyentuh logika di `src/utils/`. Ambang classifier citra, ambang FDRS,
  dan radius klasterisasi sudah dikalibrasi terhadap data nyata.
- Jangan menambah dependensi.

## Laporan akhir

Bahasa Indonesia, ringkas: hasil pemeriksaan izin workflow, hasil tsc dan lint
dan build, hash commit, status deploy, status FDRS, judul yang tayang di situs,
dan apa pun yang Anda temukan janggal meskipun saya tidak menanyakannya.
