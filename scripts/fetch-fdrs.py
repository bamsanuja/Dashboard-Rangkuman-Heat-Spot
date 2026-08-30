#!/usr/bin/env python3
"""
Ambil Fire Danger Rating dari GFWED (NASA GISS) dan ubah menjadi grid JSON
ringkas untuk SiPongi Land-Watch.

Kenapa lewat skrip, bukan langsung dari aplikasi: aplikasi ini statis dan
berjalan di browser, sehingga permintaan lintas domain ke server NASA akan
ditolak CORS. Skrip ini dijalankan di komputer Anda, hasilnya satu berkas JSON
yang Anda impor ke aplikasi seperti berkas titik panas.

Pemakaian
---------
    pip install xarray netCDF4 requests
    python scripts/fetch-fdrs.py 2026-08-26
    python scripts/fetch-fdrs.py 2026-08-26 --source merra2 --out fdrs.json

Catatan sumber
--------------
GEOS-5 mendekati waktu nyata dan resolusinya 0,25 derajat. MERRA-2 punya rekam
sejarah sejak 1980 tetapi tertinggal beberapa bulan. Kalau tanggal yang Anda
minta belum ada di GEOS-5, skrip akan mengatakannya, bukan menebak.

Ambang bahaya TIDAK dihitung di sini. Aplikasi yang menerapkannya, memakai
ambang SIPONGI/BMKG, supaya nilai mentah GFWED tetap utuh dan bisa ditelusuri.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
import tempfile
from pathlib import Path

# Kotak Indonesia dengan sedikit kelonggaran di tiap sisi.
BBOX = {"lon_min": 94.0, "lon_max": 142.0, "lat_min": -12.0, "lat_max": 7.0}

SOURCES = {
    "geos5": {
        "label": "GFWED GEOS-5",
        "url": (
            "https://portal.nccs.nasa.gov/datashare/GlobalFWI/v2.0/"
            "fwiCalcs.GEOS-5/Default/GEOS-5/{year}/"
            "FWI.GEOS-5.Daily.Default.{ymd}.nc"
        ),
        "note": "Resolusi 0,25 derajat, mendekati waktu nyata.",
    },
    "merra2": {
        "label": "GFWED MERRA-2",
        "url": (
            "https://portal.nccs.nasa.gov/datashare/GlobalFWI/v2.0/"
            "fwiCalcs.MERRA2/Default/MERRA2/{year}/"
            "FWI.MERRA2.Daily.Default.{ymd}.nc"
        ),
        "note": "Rekam sejarah sejak 1980, tertinggal beberapa bulan dari hari ini.",
    },
}

# Enam komponen sistem FWI. Pencocokan nama variabel dilakukan longgar karena
# GFWED menamai variabelnya dengan awalan model yang berbeda antar rilis.
CODES = {
    "ffmc": r"ffmc",
    "dmc": r"dmc",
    "dc": r"(?<![a-z])dc(?![a-z])",
    "isi": r"isi",
    "bui": r"bui",
    "fwi": r"(?<![a-z])fwi(?![a-z])",
}


def die(msg: str) -> None:
    print(f"\nGAGAL: {msg}\n", file=sys.stderr)
    raise SystemExit(1)


def download(url: str, dest: Path) -> None:
    import requests

    print(f"  mengunduh {url}")
    with requests.get(url, stream=True, timeout=180) as r:
        if r.status_code == 404:
            die(
                f"Berkas tidak ada di server (404).\n"
                f"  Tanggal itu mungkin belum terbit untuk sumber ini.\n"
                f"  Coba tanggal lebih lama, atau --source merra2 untuk rekam sejarah."
            )
        r.raise_for_status()
        total = int(r.headers.get("content-length", 0))
        got = 0
        with open(dest, "wb") as f:
            for chunk in r.iter_content(chunk_size=1 << 20):
                f.write(chunk)
                got += len(chunk)
                if total:
                    print(f"\r  {got / 1e6:.1f} / {total / 1e6:.1f} MB", end="")
    print()


def find_vars(ds) -> dict[str, str]:
    """Cocokkan nama variabel NetCDF ke enam kode FWI, apa pun awalannya."""
    found: dict[str, str] = {}
    names = list(ds.data_vars)
    for code, pattern in CODES.items():
        for name in names:
            if re.search(pattern, name, re.IGNORECASE):
                found[code] = name
                break
    return found


def axis_name(ds, candidates: tuple[str, ...]) -> str:
    for c in candidates:
        for dim in list(ds.dims) + list(ds.coords):
            if dim.lower() == c:
                return dim
    die(f"Tidak menemukan sumbu {candidates} pada berkas. Sumbu tersedia: {list(ds.dims)}")
    raise AssertionError  # unreachable


def main() -> None:
    ap = argparse.ArgumentParser(description="Ambil FDRS GFWED untuk wilayah Indonesia.")
    ap.add_argument("date", help="Tanggal observasi, format YYYY-MM-DD")
    ap.add_argument("--source", choices=sorted(SOURCES), default="geos5")
    ap.add_argument("--out", default=None, help="Berkas JSON keluaran")
    ap.add_argument("--keep-nc", action="store_true", help="Simpan NetCDF mentahnya")
    args = ap.parse_args()

    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        die("Tanggal harus berformat YYYY-MM-DD.")

    try:
        import xarray as xr
    except ImportError:
        die("Paket xarray belum terpasang. Jalankan: pip install xarray netCDF4 requests")

    src = SOURCES[args.source]
    ymd = args.date.replace("-", "")
    url = src["url"].format(year=args.date[:4], ymd=ymd)

    print(f"\nSumber : {src['label']}")
    print(f"Catatan: {src['note']}")
    print(f"Tanggal: {args.date}\n")

    tmpdir = Path(tempfile.mkdtemp())
    nc_path = tmpdir / f"fwi-{ymd}.nc"
    download(url, nc_path)

    ds = xr.open_dataset(nc_path)
    found = find_vars(ds)
    print(f"\n  variabel pada berkas : {list(ds.data_vars)}")
    print(f"  dikenali sebagai FWI : {found}")
    if "dc" not in found or "fwi" not in found:
        die(
            "Drought Code atau FWI tidak ditemukan pada berkas ini. "
            "Periksa daftar variabel di atas, lalu sesuaikan pola pada CODES."
        )

    lat_name = axis_name(ds, ("lat", "latitude", "y"))
    lon_name = axis_name(ds, ("lon", "longitude", "x"))

    sub = ds.sel(
        {
            lat_name: slice(BBOX["lat_min"], BBOX["lat_max"]),
            lon_name: slice(BBOX["lon_min"], BBOX["lon_max"]),
        }
    )
    if sub.sizes[lat_name] == 0:
        # Sebagian berkas menyimpan lintang menurun, jadi irisannya dibalik.
        sub = ds.sel(
            {
                lat_name: slice(BBOX["lat_max"], BBOX["lat_min"]),
                lon_name: slice(BBOX["lon_min"], BBOX["lon_max"]),
            }
        )

    lats = [float(v) for v in sub[lat_name].values]
    lons = [float(v) for v in sub[lon_name].values]
    if len(lats) < 2 or len(lons) < 2:
        die("Irisan wilayah Indonesia kosong. Periksa nama dan arah sumbu pada berkas.")

    ascending = lats[1] > lats[0]
    if not ascending:
        lats = lats[::-1]

    n_lat, n_lon = len(lats), len(lons)
    print(f"\n  grid Indonesia : {n_lon} bujur x {n_lat} lintang")
    print(f"  lon {lons[0]:.3f} sampai {lons[-1]:.3f}, lat {lats[0]:.3f} sampai {lats[-1]:.3f}")

    grids: dict[str, list[float | None]] = {}
    for code, var in found.items():
        arr = sub[var]
        # Buang dimensi waktu tunggal kalau ada.
        for dim in list(arr.dims):
            if dim not in (lat_name, lon_name):
                arr = arr.isel({dim: 0})
        values = arr.transpose(lat_name, lon_name).values
        if not ascending:
            values = values[::-1, :]
        flat: list[float | None] = []
        for v in values.reshape(-1):
            f = float(v)
            flat.append(None if math.isnan(f) else round(f, 2))
        grids[code] = flat

    filled = sum(1 for v in grids["dc"] if v is not None)
    print(f"  sel berisi nilai DC : {filled} dari {n_lat * n_lon}")

    payload = {
        "kind": "fdrs-grid",
        "version": 1,
        "source": src["label"],
        "sourceUrl": url,
        "attribution": "Sumber: NASA GISS Global Fire WEather Database (GFWED)",
        "observationDate": args.date,
        "retrievedAt": __import__("datetime").datetime.now().astimezone().isoformat(timespec="seconds"),
        "lonMin": lons[0],
        "latMin": lats[0],
        "dLon": (lons[-1] - lons[0]) / (n_lon - 1),
        "dLat": (lats[-1] - lats[0]) / (n_lat - 1),
        "nLon": n_lon,
        "nLat": n_lat,
        "codes": sorted(grids),
        "grids": grids,
    }

    out = Path(args.out) if args.out else Path(f"fdrs-{args.source}-{args.date}.json")
    out.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    size_kb = out.stat().st_size / 1024
    print(f"\nSELESAI: {out}  ({size_kb:.0f} KB)")
    print("Impor berkas ini di aplikasi lewat tombol Impor data.\n")

    if args.keep_nc:
        keep = out.with_suffix(".nc")
        nc_path.replace(keep)
        print(f"NetCDF mentah disimpan di {keep}\n")


if __name__ == "__main__":
    main()
