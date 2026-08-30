#!/bin/bash
# Klik dua kali berkas ini di Finder untuk mengambil data tingkat bahaya
# kebakaran hari ini. Tidak perlu mengetik apa pun.
#
# Ini cadangan. Kalau situs Anda sudah menjalankan otomatisasi harian di
# GitHub, datanya sudah diperbarui sendiri dan berkas ini tidak Anda perlukan.

cd "$(dirname "$0")" || exit 1

echo ""
echo "  Mengambil data tingkat bahaya kebakaran"
echo "  ======================================="
echo ""

if ! command -v python3 >/dev/null 2>&1; then
  echo "  Python belum terpasang di komputer ini."
  echo "  Pasang dari https://www.python.org/downloads/ lalu coba lagi."
  echo ""
  read -r -p "  Tekan Enter untuk menutup jendela ini."
  exit 1
fi

if [ ! -d ".venv-fdrs" ]; then
  echo "  Menyiapkan perkakas untuk pertama kali. Ini hanya sekali saja."
  python3 -m venv .venv-fdrs
  ./.venv-fdrs/bin/pip install --quiet --upgrade pip
  ./.venv-fdrs/bin/pip install --quiet xarray netCDF4 requests
  echo "  Selesai menyiapkan."
  echo ""
fi

TANGGAL=$(date -u -v-1d +%Y-%m-%d 2>/dev/null || date -u -d 'yesterday' +%Y-%m-%d)
echo "  Mengambil data untuk tanggal $TANGGAL"
echo ""

if ./.venv-fdrs/bin/python scripts/fetch-fdrs.py "$TANGGAL" --out "fdrs-$TANGGAL.json"; then
  echo ""
  echo "  BERHASIL."
  echo "  Berkas fdrs-$TANGGAL.json ada di folder Project Gasing."
  echo "  Buka aplikasi, klik Impor data, lalu pilih berkas itu."
  open . 2>/dev/null
else
  echo ""
  echo "  Pengambilan gagal. Pesan kesalahannya ada di atas."
  echo "  Penyebab tersering: tanggalnya belum terbit di server NASA."
  echo "  Coba lagi besok, atau minta bantuan orang teknis dengan pesan di atas."
fi

echo ""
read -r -p "  Tekan Enter untuk menutup jendela ini."
