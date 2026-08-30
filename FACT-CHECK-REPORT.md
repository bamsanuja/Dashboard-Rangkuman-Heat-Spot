# Fact-Check Report — Sipongi Land-Watch (Project Gasing)

**Audited:** 2026-08-26 · commit `3893173` · all files under `src/`
**Live deployment confirmed:** <https://bamsanuja.github.io/project-gasing/> returns HTTP 200 (checked 2026-08-26). This is published, not a local prototype.
**All external URLs in this report were retrieved 2026-08-26.**

---

## 1. Verdict

Nothing in this repository is safe to publish in its current form, because the app presents a wholly fabricated dataset as sourced government hotspot data and never once says otherwise — there is no disclaimer string anywhere in `src/`, `index.html`, or `README.md`. The single fix that matters is a disclosure banner plus renaming the invented companies; the ~40 individual corrections below are all secondary to that, and several become moot once the data is honestly labelled. Four of the ten invented "concession holders" sit on the real, identifiable concessions of listed or state-owned issuers — PT Kaltim Prima Coal, PT Bukit Asam Tbk, PT Adaro Indonesia, and PT Antam Tbk — and the app attributes criminal-liability language to them, which is a defamation exposure rather than a cosmetic problem. The legal citations are also wrong at the load-bearing points: UU 18/2013 does not criminalise burning, UU 32/2009's strict-liability clause lost "tanpa perlu pembuktian unsur kesalahan" in 2020, and the institutional name "KLHK" ceased to exist in October 2024. The remote-sensing schema misrepresents the source products (VIIRS confidence is categorical, not a percentage; the Landsat fire product does not cover Indonesia), and the headline `totalFRP` figure is a category error.

---

## 2. Critical findings

Ranked by consequence. Findings **C1–C3** are bucket 3 — fabricated content dressed as sourced fact.

### C1. The entire dataset is fabricated and the app claims government provenance for it, with no disclaimer anywhere

| | |
|---|---|
| **Files** | [`src/App.tsx:365`](src/App.tsx#L365), [`src/components/ReportGeneratorModal.tsx:93`](src/components/ReportGeneratorModal.tsx#L93), [`src/components/Navbar.tsx:67`](src/components/Navbar.tsx#L67), [`src/components/HotspotDetailModal.tsx:32`](src/components/HotspotDetailModal.tsx#L32), [`src/App.tsx:301`](src/App.tsx#L301) |
| **Consequence** | Every number a reader takes away is invented but is framed as a government hotspot feed. |

Claims as written:

- `src/App.tsx:365` — `Sumber Data: Sipongi+ KLHK, Satelit VIIRS/MODIS & GIS Konsesi Indonesia.`
- `src/components/ReportGeneratorModal.tsx:93` — `<strong>Satelit:</strong> VIIRS / MODIS • Sipongi+ KLHK`
- `src/App.tsx:301` — `Dokumen resmi ringkasan spasial untuk advokasi dan pelaporan pimpinan.`

Verified fact: the rendered data comes from `RAW_SEEDS` in [`src/data/mockHotspots.ts:19`](src/data/mockHotspots.ts#L19) (38 hand-written records) and from `generateRandomHotspot()` at [`src/data/mockHotspots.ts:632`](src/data/mockHotspots.ts#L632), whose own docstring reads *"Generates a newly detected simulated hotspot"*. There is no network call to SIPONGI or FIRMS anywhere in `src/`. A case-insensitive grep for `disclaimer|simulasi|dummy|fiktif|sample|contoh data|bukan data` across `src/`, `index.html` and `README.md` returns **zero matches**.

Screens where a reader would reasonably take the data as real:

1. **Footer** (desktop, every tab) — the `Sumber Data` line above.
2. **Report tab** — headed `Laporan Ringkasan Eksekutif Karhutla` and described as a `Dokumen resmi`, with a `Buka Format Cetak / PDF` button. This produces a printable artefact captioned `SIPONGI LAND-WATCH BRIEFING` / `Satelit: VIIRS / MODIS • Sipongi+ KLHK`, designed to leave the browser and circulate without any of this context.
3. **Hotspot detail modal** — a panel titled `Identitas Pemegang Izin` naming a `Badan Usaha` and `Jenis Izin` for a specific fire, with a `Portal Sipongi+` button linking to the genuine government portal directly beneath it ([`HotspotDetailModal.tsx:234-240`](src/components/HotspotDetailModal.tsx#L234)).
4. **Navbar** — a `Sipongi+` external link to the real portal, next to a `LIVE` indicator that is in fact a 10-second `setInterval` inventing random points ([`App.tsx:53-74`](src/App.tsx#L53)).
5. **Summary cards** — the tambang card is labelled `IUP Aktif` ([`SummaryCards.tsx:142`](src/components/SummaryCards.tsx#L142)), asserting active mining permits.
6. **CSV export** — [`HotspotTable.tsx:108`](src/components/HotspotTable.tsx#L108) writes `sipongi_hotspots_export_<date>.csv`, giving fabricated rows a filename that claims SIPONGI origin.

**Minimal correction:** a persistent, non-dismissible banner on every tab and at the top of the printable report stating the data is illustrative and not sourced from SIPONGI or NASA FIRMS; change the export filename; remove `Dokumen resmi`; and either remove the `Portal Sipongi+` / navbar links or relabel them as generic references rather than the source of the displayed record.

### C2. Four invented concession holders sit on the real, identifiable concessions of listed or state-owned companies

The problem is not the invented names on their own — it is that each fabricated entity is placed at the exact location, in the exact commodity, with the exact permit type of a real operator, and in two cases the source code's own comments name the real company. A reader who checks who actually mines at Sangatta or Tanjung Enim will identify a specific issuer.

| File · line | Invented entity | Real operator at that location | Evidence |
|---|---|---|---|
| [`concessionsData.ts:289-291`](src/data/concessionsData.ts#L289) | `PT. Kaltim Coal Mining (Sangatta Pit)`, holder `Energy Nusantara Tbk`, `IUP Operasi Produksi Batubara`, Kutai Timur | **PT Kaltim Prima Coal (KPC)**, subsidiary of **PT Bumi Resources Tbk** — Sangatta, Bengalon, Rantau Pulung, Kutai Timur; ~84,938–90,938 ha; one of the world's largest open-pit coal mines | [Wikipedia ID](https://id.wikipedia.org/wiki/Kaltim_Prima_Coal), [kaltimprimacoal.co.id](https://kaltimprimacoal.co.id/company-overview/) |
| [`concessionsData.ts:327-329`](src/data/concessionsData.ts#L327) | `PT. Bukit Enim Tambang Batubara`, holder `Sumatra Energy Holding`, Muara Enim | **PT Bukit Asam Tbk (IDX: PTBA)**, a BUMN — Tanjung Enim mine, **Kecamatan Lawang Kidul, Kabupaten Muara Enim** | [Tanjung Enim Coal Mine](https://en.wikipedia.org/wiki/Tanjung_Enim_Coal_Mine), [ptba.co.id](https://www.ptba.co.id/) |
| [`concessionsData.ts:308-313`](src/data/concessionsData.ts#L308) | `PT. Tabalong Mineral Resources`, holder `South Borneo Minerals`, `PKP2B Tambang Batubara`, Tabalong | **PT Adaro Indonesia**, first-generation PKP2B holder in Tabalong — operating kecamatan include **Tanta** and **Murung Pudak** | [Adaro Energy Indonesia](https://id.wikipedia.org/wiki/Adaro_Energy_Indonesia), [adaroindonesia.com](https://adaroindonesia.com/pages/view/Adaro_Mining.html) |
| [`concessionsData.ts:346-348`](src/data/concessionsData.ts#L346) | `PT. Pomalaa Nickel Mining & Smelter`, holder `Sulawesi Mining Alliance`, `IUP Operasi Tambang Nikel`, described as `nikel laterit dan infrastruktur smelter Kolaka` | **PT Aneka Tambang Tbk (IDX: ANTM)**, a BUMN — UBPN Kolaka, nickel mine + three ferronickel smelters at **Pomalaa, Kabupaten Kolaka** | [Kompas](https://kelanaindonesia.kompas.com/read/2022/11/25/2072/menyelisik-proses-penambangan-hingga-pengolahan-nikel-antam-di-ubp-nikel-kolaka), [gem.wiki](https://www.gem.wiki/Pomalaa_Nickel_power_station) |

Two aggravating details:

- **The code names KPC directly.** [`src/data/mockHotspots.ts:248`](src/data/mockHotspots.ts#L248) is a section header reading `KALIMANTAN TIMUR - Tambang Batubara KPC & Hutan Lindung`. The fabrication is explicitly modelled on a named real company.
- **The seed kecamatan match Adaro's actual operating kecamatan.** `HS-2026-KALSEL-001` is placed in `Tanta` and `HS-2026-KALSEL-002` in `Murung Pudak`, both listed operating kecamatan of PT Adaro Indonesia. Both are classified `Kritis`.

Confidence: high on all four. Each is a match on operator, commodity, permit class, kabupaten *and* — for Bukit Asam and Adaro — kecamatan.

**Consequence if published:** the app asserts, of an identifiable company, that fires burned inside its concession and that this triggers `Evaluasi izin AMDAL & audit kepatuhan pengendalian kebakaran` (mining) or `Tanggung jawab mutlak (strict liability)` (palm). That is a factual allegation of environmental wrongdoing against a real, named, publicly traded entity, published on a public URL.

**Minimal correction:** replace every location–operator pair with a clearly non-real construction — either move the polygons off real concessions, or rename to an unmistakably fictional convention (e.g. `Konsesi Contoh A`), and delete the `Tbk` suffix from `Energy Nusantara Tbk`, which implies a listed issuer.

### C3. Two further palm names collide with real Kotawaringin Barat groups

[`concessionsData.ts:209-211`](src/data/concessionsData.ts#L209) — `PT. Sawit Sumber Sejahtera (Kotawaringin Barat)`, holder `Citra Borneo Agro`.

Verified fact: **PT Citra Borneo Indah (CBI Group)** is a palm-oil group based in Pangkalan Bun, Kotawaringin Barat; its subsidiary **PT Citra Borneo Utama Tbk (IDX: CBUT)** is listed, and its affiliate **PT Sawit Sumbermas Sarana Tbk (IDX: SSMS)** holds 17.6% of CBUT. Sources: [e-IPO CBUT](https://e-ipo.co.id/en/ipo/149/cbut-pt-citra-borneo-utama-tbk), [citraborneo.co.id](https://www.citraborneo.co.id/).

So the holder name `Citra Borneo Agro` is one word from a real group in the same regency and commodity, and the estate name `Sawit Sumber Sejahtera` is confusingly close to `Sawit Sumbermas Sarana` in the same regency. Seed `HS-2026-KALTENG-004` is classified inside it as `Kritis`.

The remaining six invented names — `Palma Agri Group`, `Nusantara Agro Holding`, `Borneo Palm Resources`, `Sriwijaya Plantation Corp`, `Kalbar Agro Prima`, `Energy Nusantara Tbk` — returned no specific registry match in my searches. I did **not** run an AHU/OSS registry query (see §6), so "no collision" is unconfirmed for these six; the four in C2 and the one here are confirmed collisions.

### C4. `UU 18/2013` is cited as the karhutla criminal statute; it is not, and it is mistitled

| | |
|---|---|
| **Files** | [`spatialAnalysis.ts:54`](src/utils/spatialAnalysis.ts#L54), [`App.tsx:344`](src/App.tsx#L344), [`AnalyticsCharts.tsx:362`](src/components/AnalyticsCharts.tsx#L362), [`ReportGeneratorModal.tsx:144`](src/components/ReportGeneratorModal.tsx#L144) |

Claims as written:

- `spatialAnalysis.ts:54` — `Potensi tindak pidana Karhutla UU No. 18/2013 & UU No. 41/1999 pasal 78.`
- `AnalyticsCharts.tsx:362` — `…titik api berstatus Kritis … yang memenuhi unsur pidana Karhutla UU 18/2013…`
- `ReportGeneratorModal.tsx:144` — `Penegakan UU Kehutanan 18/2013 & Patroli Manggala Agni.`

Verified fact: UU No. 18 Tahun 2013 is *Pencegahan dan Pemberantasan Perusakan Hutan*. Its scope is **pembalakan liar** and **penggunaan kawasan hutan secara tidak sah**, both defined as activity carried out *secara terorganisasi* — "suatu kelompok yang terstruktur, terdiri atas 2 orang atau lebih … tetapi tidak termasuk kelompok masyarakat yang melakukan perladangan tradisional." Burning as a method is not an offence element of UU 18/2013. Source: [UU No. 18 Tahun 2013, peraturan.bpk.go.id](https://peraturan.bpk.go.id/Details/38884/uu-no-18-tahun-2013); [Penjelasan, Wikisource](https://id.wikisource.org/wiki/Undang-Undang_Republik_Indonesia_Nomor_18_Tahun_2013/Penjelasan).

Three distinct errors follow:

1. **Wrong instrument.** The correct criminal provisions for deliberate burning are **UU 41/1999 Pasal 50 ayat (3) huruf d** (the prohibition) read with **Pasal 78 ayat (3)** (the penalty: max 15 years + Rp5 billion) and, for negligence, **Pasal 78 ayat (4)**; plus **UU 32/2009 Pasal 108** jo. Pasal 69(1)(h). Source: [Hukumonline — "Melihat Pasal-pasal Penjerat Pelaku Pembakar Hutan dan Lahan"](https://www.hukumonline.com/berita/a/melihat-pasal-pasal-penjerat-pelaku-pembakar-hutan-dan-lahan-lt5f16ba762542c/).
2. **Wrong title.** `ReportGeneratorModal.tsx:144` calls it `UU Kehutanan 18/2013`. The Undang-Undang Kehutanan is **UU 41/1999**. UU 18/2013 has never been titled that.
3. **`memenuhi unsur pidana` is an unsupportable inference.** `AnalyticsCharts.tsx:362` tells the reader that N hotspots *satisfy the elements of the offence*. A thermal anomaly detected by satellite establishes neither the act, nor intent, nor the perpetrator; and under UU 18/2013 it would additionally have to be organised. Even on real data this sentence would be wrong.

**Minimal correction:** cite `UU 41/1999 Pasal 50 ayat (3) huruf d jo. Pasal 78 ayat (3)` and `UU 32/2009 Pasal 108`; drop UU 18/2013 or describe it accurately as covering organised forest destruction; and downgrade `memenuhi unsur pidana` to something like `perlu verifikasi lapangan`.

### C5. The strict-liability claim names no article and describes a burden of proof that was repealed in 2020

[`spatialAnalysis.ts:59`](src/utils/spatialAnalysis.ts#L59) — `Tanggung jawab mutlak (strict liability) pemegang izin UU PPLH 32/2009.` Reinforced at [`ReportGeneratorModal.tsx`](src/components/ReportGeneratorModal.tsx) — `Audit sarpras damkar & pertanggungjawaban mutlak HGU.`

Verified facts, answering the three questions in the brief:

- **The correct article is Pasal 88 of UU 32/2009.** It is a **civil** liability rule (ganti rugi), not a criminal one, and it attaches to a party whose activity uses B3, produces B3 waste, or poses a serious threat to the environment — not to "pemegang izin" generically as the string implies.
- **UU Cipta Kerja changed the wording and the burden of proof.** UU No. 11 Tahun 2020 deleted the phrase **"tanpa perlu pembuktian unsur kesalahan"** from Pasal 88. The doctrine as the app states it — liability without proof of fault — no longer reads that way on the face of the statute. Sources: [DHP Law Firm](https://www.dhp-lawfirm.com/perubahan-pasal-88-uu-lingkungan-hidup-terkait-prinsip-strict-liability/), [The Conversation ID](https://theconversation.com/uu-cipta-kerja-2020-hilangkan-perlindungan-korban-kejahatan-lingkungan-149361), [UU No. 11 Tahun 2020](https://peraturan.bpk.go.id/Details/149750/uu-no-11-tahun-2020).
- **UU 11/2020 was itself replaced by UU No. 6 Tahun 2023**, following Putusan MK 91/PUU-XVIII/2020; the operative text today is UU 32/2009 as amended by UU 6/2023.

The string is therefore wrong twice over: it omits the article, and it asserts a pre-2020 formulation of it.

**Minimal correction:** `Pasal 88 UU 32/2009 sebagaimana diubah oleh UU 6/2023 (tanggung jawab perdata; frasa "tanpa perlu pembuktian unsur kesalahan" telah dihapus)`, and drop the implication that it applies to any permit holder.

### C6. "KLHK" has not existed since October 2024

| File · line | As written | Verified |
|---|---|---|
| [`App.tsx:365`](src/App.tsx#L365) | `Sipongi+ KLHK` | Stale |
| [`ReportGeneratorModal.tsx:93`](src/components/ReportGeneratorModal.tsx#L93) | `Sipongi+ KLHK` | Stale |
| [`AnalyticsCharts.tsx:362`](src/components/AnalyticsCharts.tsx#L362) | `tim Manggala Agni / Gakkum KLHK` | Stale |

Verified fact: by **Peraturan Presiden No. 139 Tahun 2024**, KLHK was split on 20–21 October 2024 into **Kementerian Kehutanan** (Menteri Raja Juli Antoni) and **Kementerian Lingkungan Hidup / Badan Pengendalian Lingkungan Hidup** (Menteri/Kepala Hanif Faisol Nurofiq). Sources: [Itjen Kehutanan](https://itjen.kehutanan.go.id/berita/pemecahan-klhk-dalam-kabinet-merah-putih-2024-2029-memperkuat-peran-lingkungan-hidup-dan-kehutanan), [ANTARA](https://www.antaranews.com/berita/4410749/klhk-dipisah-presiden-umumkan-kementerian-lh-bplh-dan-kemenhut), [Kompas Lestari](https://lestari.kompas.com/read/2024/10/21/070000186/di-bawah-presiden-prabowo-klhk-dipisah-jadi-dua-kementerian).

**Which successor owns SIPONGI and gakkum:** I fetched <https://sipongi.gakkum.kehutanan.go.id/> on 2026-08-26. The site identifies itself as **SiPongi+ Sistem Pemantauan Karhutla**, operated by the **Direktorat Pengendalian Kebakaran Hutan, Kementerian Kehutanan**. Both SIPONGI and gakkum therefore sit under **Kementerian Kehutanan**, consistent with the `kehutanan.go.id` domain. `https://sipongi.menlhk.go.id/` no longer resolves (DNS failure), and `https://www.menlhk.go.id/` presents an expired TLS certificate.

Note the inversion: the two `holder` strings that say `(Kemenhut RI)` in [`concessionsData.ts:11`](src/data/concessionsData.ts#L11) and [`:71`](src/data/concessionsData.ts#L71) are **correct**; it is the three UI strings saying `KLHK` that are stale.

**Minimal correction:** replace `KLHK` with `Kementerian Kehutanan` in all three places; `Gakkum KLHK` → `Ditjen Gakkum Kementerian Kehutanan`.

---

## 3. Accuracy findings

### A1. `LANDSAT-8/9` promises a product FIRMS does not distribute for Indonesia

[`src/types/index.ts:16`](src/types/index.ts#L16) lists `'LANDSAT-8/9'` in the `SatelliteSensor` union alongside VIIRS and MODIS.

Verified fact: FIRMS does distribute a Landsat Fire and Thermal Anomalies (LFTA) product at 30 m, but coverage is **CONUS, southern Canada and northern Mexico only** — it is built solely from Landsat 8/9 OLI data captured by the USGS EROS ground station in Sioux Falls. Sources: [FIRMS FAQ](https://www.earthdata.nasa.gov/data/tools/firms/faq), [NASA Earthdata — Landsat Fire and Thermal Anomaly Data Added to FIRMS](https://www.earthdata.nasa.gov/news/feature-articles/landsat-fire-thermal-anomaly-data-added-firms).

The enum promises data the pipeline cannot receive for any Indonesian coordinate. It is a type-level claim only — no seed uses it, and `DataImporterModal.tsx:353-356` does not offer it in the dropdown — but it is still a false statement about what the product covers. **Correction:** remove the member.

### A2. VIIRS confidence is categorical; every VIIRS confidence number in the app is fabricated precision

[`src/types/index.ts:34`](src/types/index.ts#L34) — `confidence: number; // 0 - 100%`, applied uniformly to all sensors.

Verified fact ([FIRMS FAQ](https://www.earthdata.nasa.gov/data/tools/firms/faq)):

- **MODIS** reports confidence as **0–100%**, bucketed low (0–29), nominal (30–79), high (80–100).
- **VIIRS** reports confidence as **`low` / `nominal` / `high` only** — a categorical flag derived from intermediate algorithm quantities. There is no percentage.

**26 of the 38 seed records are VIIRS**, carrying the values `74, 77, 79, 82, 84, 85, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99`. None of these could come from a VIIRS active-fire product. `generateRandomHotspot()` compounds it by generating a 55–100 integer and then assigning a sensor at random ([`mockHotspots.ts:642-647`](src/data/mockHotspots.ts#L642)).

Silver lining: the thresholds the app derives (`>= 80` high, `< 30` low, [`mockHotspots.ts:605-607`](src/data/mockHotspots.ts#L605)) exactly match the documented MODIS buckets. The schema is right for MODIS and misrepresents the source product for VIIRS.

**Correction:** make `confidence` a discriminated union — a 0–100 number for MODIS, a `'low' | 'nominal' | 'high'` enum for VIIRS.

### A3. Three VIIRS brightness values exceed the I-4 saturation ceiling

[`src/types/index.ts:36`](src/types/index.ts#L36) — `brightness: number; // in Kelvin (e.g. 335.4 K)`, one field for all sensors.

Verified fact: FIRMS reports **different bands for different sensors** — MODIS carries `brightness` (band 21/22, ~4 µm) and `bright_t31` (band 31, ~11 µm); VIIRS carries `bright_ti4` (I-4, 3.74 µm) and `bright_ti5` (I-5, ~11 µm). Saturation temperatures: **VIIRS I-4 = 367 K**; MODIS band 22 = ~330 K, band 21 = ~478–506 K (the T21 field switches to band 21 once band 22 saturates). Sources: [Wright & Ramsey, *Specifying the saturation temperature for the HyspIRI 4-μm channel*](https://www.higp.hawaii.edu/~wright/rse167.pdf), [VIIRS 375 m Active Fire ATBD](https://viirsland.gsfc.nasa.gov/PDF/VIIRS_activefire_375m_ATBD.pdf), [UMD VIIRS AF I-band product page](http://viirsfire.geog.umd.edu/pages/iband.php).

Out-of-range seed values:

| ID | Sensor | `brightness` | Over I-4 ceiling |
|---|---|---|---|
| `HS-2026-KALTENG-001` | VIIRS / SNPP | 371.2 K | +4.2 K |
| `HS-2026-KALTIM-001` | VIIRS / SNPP | 368.0 K | +1.0 K |
| `HS-2026-SUMSEL-001` | VIIRS / SNPP | 367.4 K | +0.4 K |

All 12 MODIS values (318.5–358.9 K) are plausible for T21. `generateRandomHotspot()` draws brightness uniformly from 320–370 K regardless of sensor, so live-simulated VIIRS points can also exceed the ceiling.

**Which band the value corresponds to:** for MODIS records it corresponds to `brightness` (T21); for VIIRS records to `bright_ti4`. The single field conflates two different measurements from two different instruments, and the UI label `Suhu Kecerahan` ([`HotspotDetailModal.tsx:190`](src/components/HotspotDetailModal.tsx#L190)) does not say which.

### A4. Locational precision far exceeds what the sensors support

Verified pixel sizes ([FIRMS FAQ](https://www.earthdata.nasa.gov/data/tools/firms/faq)): **MODIS ≈ 1 km**; **VIIRS 375 m at nadir**, degrading toward the swath edge. Neither is a point measurement — the reported coordinate is the centre of a pixel within which a fire was detected somewhere.

Against that, the app:

- displays coordinates to **4 decimal places** (~11 m) — [`HotspotDetailModal.tsx:180`](src/components/HotspotDetailModal.tsx#L180);
- reports distance-to-boundary in **single metres** (`Buffer ${roundedDist}m`, `Berjarak ${roundedDist}m`) — [`spatialAnalysis.ts:99,105,116,122,133,139,150,156`](src/utils/spatialAnalysis.ts#L99);
- switches legal language on **1000 m** and **2500 m** thresholds — [`spatialAnalysis.ts:89,93`](src/utils/spatialAnalysis.ts#L89).

A 375 m pixel cannot support a 1 m distance readout, and a 1 km MODIS pixel straddles a 1000 m threshold entirely. Even with real boundary data, an inside/outside determination near a boundary is not decidable at this resolution — yet it is exactly that determination that flips a record to `Kritis` and to criminal-liability text.

**Correction:** round distances to the sensor's nominal resolution, show coordinates to 3 decimals at most, and add an uncertainty band around the boundary tests.

### A5. 13 of 38 acquisition times fall outside the satellite's possible overpass window

Verified equator-crossing times ([FIRMS FAQ](https://www.earthdata.nasa.gov/data/tools/firms/faq)): Terra ~10:30 / 22:30 MLT; Aqua ~13:30 / 01:30; Suomi NPP ~13:30 / 01:30; NOAA-20 ~12:40 / 00:40.

Method: expected WIB clock time = nominal local solar time − (lng − 105°)/15. Tolerance is the off-nadir half-swath expressed as longitude at the equator: **±42 min for MODIS** (2330 km swath), **±55 min for VIIRS** (3060 km).

| ID | Sensor | lng | Seed (WIB) | Expected | Δ |
|---|---|---|---|---|---|
| `HS-2026-KALTIM-003` | VIIRS / NOAA-20 | 117.52 | 01:50 | 23:50 | **+120 min** |
| `HS-2026-KALTENG-006` | VIIRS / NOAA-20 | 113.28 | 01:55 | 00:07 | **+108 min** |
| `HS-2026-KALTIM-002` | MODIS / Aqua | 117.75 | 14:20 | 12:39 | **+101 min** |
| `HS-2026-RIAU-002` | VIIRS / NOAA-20 | 101.55 | 11:20 | 12:54 | **−94 min** |
| `HS-2026-PAPUA-002` | MODIS / Terra | 140.20 | 09:40 | 08:09 | **+91 min** |
| `HS-2026-KALTENG-002` | MODIS / Aqua | 113.70 | 14:25 | 12:55 | **+90 min** |
| `HS-2026-KALBAR-002` | MODIS / Aqua | 110.42 | 14:30 | 13:08 | **+82 min** |
| `HS-2026-RIAU-007` | VIIRS / NOAA-20 | 101.85 | 02:15 | 00:53 | **+82 min** |
| `HS-2026-KALTIM-005` | MODIS / Terra | 116.88 | 10:45 | 09:42 | **+63 min** |
| `HS-2026-SULTRA-001` | VIIRS / NOAA-20 | 121.68 | 12:35 | 11:33 | **+62 min** |
| `HS-2026-KALSEL-003` | MODIS / Terra | 114.75 | 10:40 | 09:51 | **+49 min** |
| `HS-2026-SUMSEL-002` | MODIS / Aqua | 105.32 | 14:15 | 13:29 | **+46 min** |
| `HS-2026-KALTENG-005` | MODIS / Terra | 111.45 | 10:50 | 10:04 | **+46 min** |

The pattern is instructive: **all 16 VIIRS/SNPP records pass**, several within 1–7 minutes, and the Papua SNPP record at 11:15 WIB is correct to 4 minutes for longitude 139.65 — meaning the author modelled the SNPP daytime pass properly and then estimated the rest. All three NOAA-20 night records are ~1.5–2 hours late.

Separate issue: `acquisitionTime` is typed `// HH:mm WIB` at [`types/index.ts:40`](src/types/index.ts#L40) and every record is labelled WIB, but records in Kaltim, Kalsel, Sulteng and Sultra are WITA (UTC+8) and Papua Selatan is WIT (UTC+9). The SNPP values are internally consistent with a genuine WIB conversion, so this appears to be intentional normalisation — but the field name and the province column together will read to an Indonesian user as local time.

### A6. Protected-area names and areas

For every `category: 'hutan_lindung'` entry. Areas checked against Kemenhut KSDAE and SK penetapan; **only Sebangau exceeds the 5% threshold.**

| Entry | Declared | Official (year) | Δ | Verdict |
|---|---|---|---|---|
| TN Sebangau | **568,700 ha** | **537,451 ha** (current KSDAE profile); 542,141 ha per SK 529/Menhut-II/2012 | **+5.8%** | **Finding.** 568,700 is the 2004 penunjukan figure (SK 423/Kpts-II/2004) and has been superseded twice. |
| TN Tesso Nilo | 83,068 ha | **81,793 ha** — SK.6588/Menhut-VII/KUH/2014 (penetapan) | +1.6% | Minor. 83,068 is the sum of the two *penunjukan* SKs (38,576 in 2004 + 44,492 in 2009); the definitive penetapan reduced it. |
| TN Lore Lindu | 217,991 ha | **~215,733 ha** after the 1,531 ha Dongi-Dongi release to APL in 2014 | +1.0% | Minor; figure is pre-2014. |
| TN Betung Kerihun | 800,000 ha | **816,693.40 ha** — penetapan 23 April 2014 | −2.0% | Minor; figure is the 1995 penunjukan. |
| HL Sungai Wain | 10,025 ha | ~9,782 ha (some sources ~10,000 ha) | +2.5% | Minor; sources disagree, see §6. |
| TN Bukit Tigapuluh | 144,223 ha | **144,223 ha** — SK 6407/Kpts-II/2002 ("temu gelang") | 0% | ✅ Correct. |
| TN Tanjung Puting | 415,040 ha | 415,040 ha (SK 687/Kpts-II/1996, widely cited) | 0% | ✅ Correct, secondary sourcing. |
| Cagar Biosfer Giam Siak Kecil | 178,722 ha | see below | — | **Finding — name and number describe different things.** |

Sources: [KSDAE Profil TN Tesso Nilo](https://ksdae.kehutanan.go.id/kawasan-konservasi/100241004/), [KSDAE Profil TN Sebangau](https://ksdae.kehutanan.go.id/kawasan-konservasi/100244034/), [tnsebangau.com](https://www.tnsebangau.com/taman-nasional-sebangau/), [tnbt.ksdae.menlhk.go.id — Sejarah](https://tnbt.ksdae.menlhk.go.id/page/sejarah), [BBTNBKDS — Sejarah Kawasan](https://tnbkds.ksdae.kehutanan.go.id/sejarah/), [ITTO-GSK — Zonasi](https://bsilhk.menlhk.go.id/itto-gsk/index.php/zonasi-area-pengelolaan-cagar-biosfer-giam-siak-kecil-bukit-batu/), [sungaiwain.org](https://sungaiwain.org/tentang-hlsw/).

**A6a — Giam Siak Kecil is the most substantive of these, and it is a legal problem, not just an area problem.**

[`concessionsData.ts:28-45`](src/data/concessionsData.ts#L28) — `name: 'Cagar Biosfer Giam Siak Kecil'`, `areaHectares: 178722`, `permitType: 'Suaka Margasatwa & Biosfer'`.

Verified: the biosphere reserve's official name is **Cagar Biosfer Giam Siak Kecil–Bukit Batu** (UNESCO MAB, designated 26 May 2009), total **705,271 ha**, zoned as **zona inti 178,722 ha**, zona penyangga 222,426 ha, zona transisi 304,123 ha. The 178,722 ha figure the code uses is the **core zone**, not the reserve. Separately, **Suaka Margasatwa Giam Siak Kecil** — the actual legally protected kawasan konservasi — is **84,967 ha** (SK Menhut 173/Kpts-II/1986, expanded from 50,000 ha).

Three errors compound:

1. The gazetted name drops "–Bukit Batu".
2. The area is the core zone of a reserve while the name refers to the reserve.
3. **The core zone explicitly includes HTI (industrial timber plantation) concession land**, per the ITTO-GSK zoning page. A *cagar biosfer* is a UNESCO MAB designation, not an Indonesian legal kawasan category — so the polygon does not carry the kawasan-konservasi protection that [`spatialAnalysis.ts:54`](src/utils/spatialAnalysis.ts#L54) invokes when it labels a fire inside it `DALAM KAWASAN DILINDUNGI` with `UU No. 41/1999 pasal 78`. Only the 84,967 ha SM inside it does.

Seed `HS-2026-RIAU-006` is classified `Kritis` under exactly this note.

**A6b — provinces.** All eight `province` fields check out. `Jambi / Riau` for Bukit Tigapuluh is correct (TNBT spans Indragiri Hulu and Indragiri Hilir in Riau, Tebo and Tanjung Jabung Barat in Jambi — 111,233 ha Riau, 33,000 ha Jambi). Lore Lindu's `Sulawesi Tengah` is correct, though note the park spans Sigi (112,792 ha) and Poso (102,942 ha), not Poso alone as the seed data implies.

**A6c — polygon centroids.** Measured against OSM relation centroids:

| Entry | Code centroid | OSM centroid | Distance |
|---|---|---|---|
| TN Betung Kerihun | 113.100, 0.740 | 113.553, 1.093 | **64 km** — over threshold |
| TN Bukit Tigapuluh | 102.510, −0.880 | (see §6) | unresolved |
| TN Tesso Nilo | 101.620, −0.180 | 101.873, −0.221 | 29 km |
| Suaka Margasatwa Giam Siak Kecil | 101.610, 0.980 | 101.653, 1.157 | 20 km |
| TN Sebangau | 113.730, −2.630 | 113.693, −2.477 | 18 km |
| TN Lore Lindu | 120.125, −1.450 | 120.185, −1.519 | 10 km |
| TN Tanjung Puting | 111.970, −3.080 | 112.019, −3.064 | 6 km |
| HL Sungai Wain | 116.867, −1.132 | (no OSM relation) | unresolved |

All hemisphere signs are correct, all bounding boxes are on the right island and on land. Only Betung Kerihun exceeds the ~50 km threshold, and the code polygon there covers roughly the park's western half.

Tesso Nilo's 29 km offset is under threshold but has a concrete consequence: the real park's bounding box runs 101.589–102.066 E, while the code polygon runs 101.40–101.90 E. Seed `HS-2026-RIAU-002` sits at **101.55 E — west of the real park's western extent** — yet is classified `INSIDE` and issued the `Potensi tindak pidana` note. This is the mechanism by which a hand-drawn shape produces criminal-liability language.

**A6d — ecological descriptions.** Mostly sound; two need qualification.

- ✅ Tesso Nilo — Sumatran elephant and Sumatran tiger habitat: well documented.
- ✅ Sungai Wain — sun bear (*Helarctos malayanus*) habitat and Balikpapan's principal clean-water catchment: correct.
- ✅ Betung Kerihun — Kapuas headwaters, borders Sarawak: correct.
- ✅ Lore Lindu — MAB biosphere reserve and megalithic site (Bada/Napu/Besoa valleys): correct.
- ⚠️ **Bukit Tigapuluh — `perlindungan Orangutan & Harimau`.** Sumatran tiger is native. The Sumatran orangutan population is **reintroduced**, established from confiscated animals via the Frankfurt Zoological Society programme from 2002; TNBT is outside the species' natural range. The description reads as native range and should say "reintroduksi".
- ⚠️ **Sebangau — `ekosistem rawa gambut terbesar Kalimantan`.** Sebangau is among the largest intact peat-swamp forest blocks in Kalimantan, but "terbesar" is contestable against the ex-Mega Rice Project peatlands and the Kapuas peat domes. The hydrological claim (`penopang hidrologis sungai Sebangau & Katingan`) is correct — the park sits on the interfluve between those two rivers. Downgrade "terbesar" to "salah satu terbesar".
- ⚠️ **Tanjung Puting — `Pusat rehabilitasi Orangutan dunia (Camp Leakey)`.** Camp Leakey is inside TNTP and was founded in 1971 by Biruté Galdikas; it functioned as a rehabilitation and release site historically but operates today as a research and monitoring station. Present tense overstates it.
- The `cadangan karbon raksasa` claim for Giam Siak Kecil is directionally right for tropical peat but is not tied to any published figure. See §6.

### A7. Balai / UPT names

| Code string | Official name | Verdict |
|---|---|---|
| `BP HLSW Balikpapan` | **Badan Pengelola Hutan Lindung Sungai Wain dan DAS Manggar** (BP-HLSW dan DAS Manggar) | Incomplete abbreviation, and — importantly — this is a **Pemerintah Kota Balikpapan** body, **not a Kemenhut UPT**. It is the one entry in this list whose parent institution is a city government. |
| `Balai Besar TNBKDS Kalbar` | **Balai Besar Taman Nasional Betung Kerihun dan Danau Sentarum** | Non-official abbreviation; "Kalbar" is not part of the name. |
| `Balai TN Bukit Tiga Puluh` | **Balai Taman Nasional Bukit Tigapuluh** | "Tigapuluh" is one word in the official name; the code splits it into three in both `name` and `holder`. |
| `Balai TN Tesso Nilo (Kemenhut RI)` | Balai Taman Nasional Tesso Nilo, under Ditjen KSDAE, Kementerian Kehutanan | ✅ Correct, incl. the post-2024 ministry. |
| `BBKSDA Riau` | Balai Besar KSDA Riau — manages SM Giam Siak Kecil | ✅ Correct. |
| `Balai TN Sebangau (Kemenhut RI)` | Balai Taman Nasional Sebangau | ✅ Correct. |
| `Balai TN Tanjung Puting` | Balai Taman Nasional Tanjung Puting | ✅ Correct. |
| `Balai TN Lore Lindu` | Balai Taman Nasional Lore Lindu | ✅ Correct. |

### A8. Administrative geography — 21 of 38 records are mislabelled

Method: reverse-geocoded every `lat`/`lng` via Nominatim (OSM), `zoom=12`, `accept-language=id`, 2026-08-26. **Caveat as required by the brief:** OSM is corroboration, not the primary record. BPS/Kemendagri (Permendagri kode wilayah) is authoritative and I could not obtain their boundary polygons — see §6. Kabupaten-level mismatches below are high confidence; kecamatan-level ones are medium.

**Wrong province (1):**

| ID | Claimed | Coordinate falls in |
|---|---|---|
| `HS-2026-JAMBI-001` | Jambi / Tanjung Jabung Barat / Tebing Tinggi | **Riau / Indragiri Hulu / Batang Gansal** |

Both the province and the kabupaten are wrong; the point is ~180 km from Tanjung Jabung Barat. Kecamatan Tebing Tinggi does exist in Tanjung Jabung Barat, and Tanjung Jabung Barat is a genuine TNBT kabupaten — but not at this coordinate.

**Wrong kabupaten (7):**

| ID | Claimed kabupaten | Coordinate falls in |
|---|---|---|
| `HS-2026-RIAU-006` | Bengkalis | **Siak** (Sungai Mandau) |
| `HS-2026-KALTENG-002` | Katingan | **Pulang Pisau** |
| `HS-2026-KALSEL-001` | Tabalong | **Balangan** (Paringin) |
| `HS-2026-KALSEL-002` | Tabalong | **Balangan** |
| `HS-2026-KALSEL-003` | Banjar | **Barito Kuala** |
| `HS-2026-SUMSEL-003` | Ogan Komering Ilir | **Banyuasin** (Rambutan) |
| `HS-2026-SULTENG-001` | Poso | **Sigi** |

`HS-2026-KALSEL-003` is the largest single displacement: Kecamatan Gambut sits in Kabupaten Banjar at roughly −3.43 S, while the record is at −2.85 S — about 65 km north.

`HS-2026-SULTENG-001` is subtle: Kecamatan Lore Utara genuinely is in Kabupaten Poso, and TN Lore Lindu genuinely spans Sigi and Poso — but this coordinate is on the Sigi side.

**Wrong kecamatan, kabupaten correct (13):** `RIAU-001` (claims Ukui → Langgam), `RIAU-002` (Pangkalan Lesung → Langgam), `RIAU-003` (Langgam → Ukui), `RIAU-004` (Bunut → Ukui), `RIAU-005` (Kuala Kampar → Pangkalan Lesung; Kuala Kampar is a coastal/island kecamatan at ~103.1 E, roughly 100 km east), `RIAU-007` (Mempura → Koto Gasib), `RIAU-008` (Tampan → Payung Sekaki), `KALTIM-003` (Rantau Pulung → Sangatta), `KALBAR-002` (Matan Hilir Selatan → Kendawangan), `KALBAR-003` (Putussibau Utara → Putussibau Selatan), `KALBAR-004` (Pontianak Selatan → Pontianak Utara), `SUMSEL-001` (Pedamaran Timur → Cengal), `SUMSEL-005` (Kertapati → Ilir Barat I), `PAPUA-002` (Semangga → Malind).

Note the Pelalawan cluster: `RIAU-001` and `RIAU-003` have their kecamatan **swapped** relative to their coordinates.

**Correct at all three levels (5):** `KALTENG-003`, `KALTENG-004`, `KALTENG-006`, `KALTENG-007`, `KALTIM-004`, `KALTIM-005`, `KALBAR-001`, `SUMSEL-002`, `SUMSEL-004`, `SULTRA-001`, `JAMBI-002` at kabupaten level.

**Unresolved (3):** `KALTENG-005`, `KALTIM-001`, `KALTIM-002` — Nominatim returned province only, no kabupaten. `KALTIM-001` (0.32 N) and `KALTIM-002` (0.22 N) sit 20–35 km south of Sangatta town (~0.50 N), so `Sangatta Utara` and `Sangatta Selatan` are both doubtful, but I cannot confirm the correct kecamatan.

**Pemekaran since the code was written:** none that I could identify affects these records. `Papua Selatan` is used correctly — it was created by **UU No. 14 Tahun 2022**, with Merauke as its seat, so this is current rather than stale. Note also that in Papua the second-level unit is officially a **distrik**, not a *kecamatan*, so the `subdistrict` label reads incorrectly for the two Merauke records. Kabupaten Balangan (the true location of `KALSEL-001`/`-002`) was split from Hulu Sungai Utara in 2003, well before this code — so those two are simple errors, not stale geography.

---

## 4. Methodology findings

### M1. The `sawit_sebelah` buffer category never fires — and three source comments assert otherwise

I re-implemented `classifyHotspotSpatial` against the shipped `CONCESSION_POLYGONS` and ran all 38 seeds. Result:

| Category | Count |
|---|---|
| `hutan_lindung` | 12 (all *inside*, 0 buffer) |
| `sawit_dalam` | 7 |
| **`sawit_sebelah`** | **0** |
| `tambang` | 6 (all inside) |
| `perkotaan` | 4 (all inside) |
| `apl_lainnya` | 9 |

**No seed lands in the 0–2500 m buffer band at all.** The nearest non-containing polygon is 3 km away. Consequences:

- `summary.sawitBuffer` is always 0, so the UI renders `(7 dalam izin HGU, 0 buffer penyangga <2km)` at [`App.tsx:251`](src/App.tsx#L251) and in the printable report.
- The `Sebelah/Buffer Sawit` doughnut slice at [`AnalyticsCharts.tsx:60`](src/components/AnalyticsCharts.tsx#L60) is permanently empty.
- The `sawit_sebelah` branch of the classifier, its legal note, and the `sawit_all` filter option are unreachable against the shipped data.

Three source comments claim buffer placements that the code does not produce:

| Comment | Actual computed result |
|---|---|
| `mockHotspots.ts:80` — `// Proximity Buffer to Palm Concession (~650m outside)` | `HS-2026-RIAU-005` is **3 km** away → `apl_lainnya` |
| `mockHotspots.ts:201` — `// Next to Sawit / Buffer Proximity (<800m)` | `HS-2026-KALTENG-005` is **7 km** away → `apl_lainnya` |
| `mockHotspots.ts:278` — `// Buffer Tambang Sangatta (~1.2 km)` | `HS-2026-KALTIM-003` is **7 km** away → `apl_lainnya` |

### M2. Polygons overlap, and classification is order-dependent — an entire city polygon is unreachable

`classifyHotspotSpatial` `break`s on the first containing polygon in array order ([`spatialAnalysis.ts:24-27`](src/utils/spatialAnalysis.ts#L24)). I tested all 253 polygon pairs with `turf.intersect`. **Four pairs overlap:**

| Pair | Overlap area | Which wins (array order) |
|---|---|---|
| `hl-sebangau` (idx 3) × `kota-palangkaraya` (idx 19) | **42,007 ha** | `hl-sebangau` |
| `hl-giam-siak` (idx 1) × `sawit-riau-2` (idx 9) | 37,810 ha | `hl-giam-siak` |
| `hl-sebangau` (idx 3) × `sawit-kalteng-2` (idx 11) | 35,211 ha | `hl-sebangau` |
| `hl-sungai-wain` (idx 6) × `kota-samarinda-balikpapan` (idx 22) | 1,439 ha | `hl-sungai-wain` |

The Palangka Raya case is total, not partial: the drawn area of `kota-palangkaraya` is 42,007 ha and its overlap with `hl-sebangau` is 42,007 ha. **The urban polygon lies entirely inside the national-park polygon and can never be reached.** Concretely:

> `HS-2026-KALTENG-007` — `Kota Palangka Raya / Jekan Raya` (−2.22, 113.92), a residential district of the provincial capital — is classified `hutan_lindung`, `INSIDE`, risk `Kritis`, with the note:
> `⚠️ KRITIS: Titik api berada DALAM KAWASAN DILINDUNGI (Taman Nasional Sebangau). Potensi tindak pidana Karhutla UU No. 18/2013 & UU No. 41/1999 pasal 78.`

The two sawit overlaps mean that in ~73,000 ha of concession land a fire can never be attributed to the concession, because the conservation polygon is checked first. Since `hutan_lindung` entries occupy array indices 0–7 and always precede sawit/tambang/perkotaan, the ordering **systematically inflates the `hutan_lindung` count and therefore `criticalAlerts`**.

### M3. `hutan_lindung` collapses inside-boundary and up-to-2.5 km-outside fires — quantified overstatement is 0 in this dataset

The design defect the brief describes is real: [`spatialAnalysis.ts:110-124`](src/utils/spatialAnalysis.ts#L110) returns `landCategory: 'hutan_lindung'` for a fire up to 2,500 m *outside* a conservation boundary, with `isInside: false` and a softer note (`ZONA PENYANGGA`, risk `Tinggi`), while the inside branch returns the same `landCategory` with `Kritis` and criminal-liability text. `computeSpatialSummary` counts both into the single `hutanLindung` bucket ([`spatialAnalysis.ts:198`](src/utils/spatialAnalysis.ts#L198)), which drives the `{summary.hutanLindung} titik ({pct}%) di Kawasan Hutan Lindung & Taman Nasional` line in the printable report.

**Quantified against the seed dataset: the overstatement is zero.** All 12 `hutan_lindung` records are genuinely inside a polygon; none is a buffer record. The percentage and the `Kritis` tally are not inflated by *this* mechanism in the shipped data — they are inflated by M2 instead.

The defect remains latent: any imported or live-simulated point in a 2.5 km ring around a park would silently join the `Kawasan Hutan Lindung & Taman Nasional` count. The `criticalAlerts` counter is separately protected here, since it keys on `riskLevel === 'Kritis'` and the buffer branch returns `Tinggi` — so a buffer hit inflates the category count but not the critical count.

### M4. The nearest-polygon loop does not preserve the nearest polygon *of the assigned category*

Answering the brief's question directly: the loop at [`spatialAnalysis.ts:37-40`](src/utils/spatialAnalysis.ts#L37) **does** correctly preserve the globally nearest non-containing polygon. `minDistanceMeters` and `nearestPolygon` update together and are never partially overwritten, so `nearestPolygon` is genuinely the closest feature of any category.

The scenario in the brief — "labelled buffer of a sawit concession while sitting closer to a different feature" — cannot occur, because the category is *derived from* the winner rather than chosen first. The real hazard is the inverse: the classifier reports the nearest polygon **whatever its category**, so a fire 400 m from a national park and 800 m from a plantation is labelled a park buffer zone with `Potensi perambahan menuju hutan lindung` and no mention of the plantation. There is no per-category nearest search and no way to surface the second-nearest feature.

I could not exercise this against the seed data: **no seed enters the buffer band at all** (M1), so the entire buffer branch is untested at runtime.

There is also a `break`-related asymmetry: when a point *is* inside a polygon, the loop breaks before computing distances, so `nearestPolygon` is left `null` and the returned `distanceToBoundaryMeters` is hard-coded to 0. That is correct for the inside case but means the app can never say how far inside a boundary a fire is.

### M5. `totalFRP` is a category error

[`spatialAnalysis.ts:206`](src/utils/spatialAnalysis.ts#L206) accumulates `totalFRP += h.frp` and [`SummaryCards.tsx:217-220`](src/components/SummaryCards.tsx#L217) renders it as a headline KPI labelled `FRP Radiasi` — **2,999.1 MW** for the seed dataset.

Verified fact ([FIRMS FAQ](https://www.earthdata.nasa.gov/data/tools/firms/faq)): FRP is reported in **megawatts** and represents *"the rate of radiative energy emission per time unit from all fires within a pixel"* — an **instantaneous power measurement at the moment of overpass**, not an accumulated quantity. The FAQ further cautions that view zenith angle, sensor resolution, band saturation temperature and observation time all affect FRP, so values are not directly comparable across sensors.

So the units are right, and the individual values (18.2–184.5 MW) are plausible per-pixel figures. The aggregate is not. Summing it produces a number that:

1. **Mixes instruments** — 26 VIIRS values (375 m pixels) and 12 MODIS values (1 km pixels) added together, which the FAQ explicitly warns against.
2. **Mixes acquisition times across four different days** (2026-08-22 to 2026-08-24) and multiple overpasses. Adding power readings taken at different moments is like adding this morning's and this afternoon's speedometer readings.
3. **Double-counts persistent fires** — the same fire seen by SNPP at 13:10 and by Aqua at 14:25 contributes twice.

**What the dashboard's headline number actually means:** the arithmetic sum of unrelated instantaneous power readings taken by two instruments over three days. It is not a total, an energy, or a fire size. **What it should be instead:** either mean/median FRP per detection with the count alongside, or — if a cumulative quantity is genuinely wanted — **Fire Radiative Energy (FRE)** in MJ or GJ, obtained by integrating FRP over the observation interval, which requires a temporal model this dataset does not have. The lower-effort honest fix is to relabel it `FRP rata-rata` and divide by `total`.

### M6. `types/index.ts` documents a 2 km buffer; the code uses 2,500 m; the UI says both

Confirmed discrepancy, and it is three-way:

| Location | Value |
|---|---|
| [`types/index.ts:4`](src/types/index.ts#L4) | `// Sebelah / Sekitar Konsesi Sawit (Radius Buffer < 2 km)` |
| [`spatialAnalysis.ts:89`](src/utils/spatialAnalysis.ts#L89) | `minDistanceMeters <= 2500` — **the value that actually runs** |
| [`spatialAnalysis.ts:115`](src/utils/spatialAnalysis.ts#L115) | `Penyangga Hutan Lindung (Buffer < 2.5km)` — user-visible, correct |
| [`App.tsx:251`](src/App.tsx#L251) | `{summary.sawitBuffer} buffer penyangga &lt;2km` — user-visible, **wrong** |
| [`ReportGeneratorModal.tsx`](src/components/ReportGeneratorModal.tsx) | `{summary.sawitBuffer} buffer &lt;2km` — user-visible, **wrong** |

**What the UI copy tells the user:** `<2 km` on the map tab and in the printable report; `< 2.5km` inside the hotspot detail note. A record 2,300 m from a concession is counted in a bucket the report labels "under 2 km". The comment at [`spatialAnalysis.ts:88`](src/utils/spatialAnalysis.ts#L88) also says `(< 2500 meters)`, so the type file is the outlier — but the two user-facing strings inherit the wrong number.

### M7. The `low` confidence level is unreachable

`confidenceLevel` is set to `'low'` only when `confidence < 30` ([`mockHotspots.ts:607`](src/data/mockHotspots.ts#L607)). The minimum seed value is **62**, and `generateRandomHotspot` draws from **55–100** ([`mockHotspots.ts:642`](src/data/mockHotspots.ts#L642)). The `low` option in the confidence filter ([`App.tsx:99`](src/App.tsx#L99)) therefore always returns an empty result set. A user filtering for low-confidence detections concludes there are none, rather than that the generator cannot produce them.

### M8. APL distance text produces absurd output at continental scale

[`spatialAnalysis.ts:168`](src/utils/spatialAnalysis.ts#L168) formats the fallback area name as `Lahan Terbuka (${km}km dari ${nearestPolygon.name})` with no distance cap. Computed values for the seed data:

- `HS-2026-PAPUA-001` → `Lahan Terbuka (2005km dari PT. Pomalaa Nickel Mining & Smelter)`
- `HS-2026-PAPUA-002` → `Lahan Terbuka (2070km dari PT. Pomalaa Nickel Mining & Smelter)`
- `HS-2026-JAMBI-002` → `… (75km dari Taman Nasional Bukit Tiga Puluh)`
- `HS-2026-KALSEL-003` → `… (59km dari Taman Nasional Sebangau)`

A Merauke fire is described in relation to a nickel concession 2,000 km away in Sulawesi, and that string is searchable via the `matchArea` branch of the filter ([`App.tsx:121`](src/App.tsx#L121)). Suppress the reference beyond some sensible radius.

### M9. `dateRange` filter is hard-coded to a fixed date

[`App.tsx:109`](src/App.tsx#L109) — `const todayStr = '2026-08-24';`. The `today` and `24h` filters key off a literal, not the current date, while `generateRandomHotspot` stamps live points with `new Date()`. On any day other than 2026-08-24 the `today` filter hides the newly generated points it is supposed to show. Also, `dateRange` values `'3d'` and `'7d'` are declared in `FilterState` ([`types/index.ts:85`](src/types/index.ts#L85)) but have no branch in the filter — selecting them silently returns everything.

### M10. Live-simulation coordinates are decoupled from their labels

[`mockHotspots.ts:633-641`](src/data/mockHotspots.ts#L633) jitters `lat`/`lng` by up to ±0.3° (~±33 km) around five centres while keeping the `province`/`district`/`subdistrict` strings fixed. A generated point can therefore drift into a different kabupaten — or a different province — while still displaying the hard-coded label, and it is then classified spatially against the polygons, so its `landCategory` and its administrative label can contradict each other. This is A8's problem reproduced at runtime for every simulated point.

---

## 5. Verified correct

Things I checked and cleared, so you know what was covered rather than skipped:

- **SIPONGI URL.** `https://sipongi.gakkum.kehutanan.go.id/peta` returns HTTP 200 and is the current canonical hotspot map ("Peta Hotspot") of SiPongi+, operated by Direktorat Pengendalian Kebakaran Hutan, Kementerian Kehutanan. `sipongi.menlhk.go.id` no longer resolves, so the app is on the right host.
- **`(Kemenhut RI)` in the two `holder` strings** — correct post-October-2024 naming, and correct as the parent of the TN balai.
- **Balai names for Tesso Nilo, Sebangau, Tanjung Puting, Lore Lindu, and BBKSDA Riau** — all match the official UPT names.
- **`UU No. 41/1999 tentang Kehutanan`, `UU No. 32/2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup`, `UU No. 18/2013 tentang Pencegahan dan Pemberantasan Perusakan Hutan`** — the *titles and numbers* in the App.tsx list are all correct; the errors are in application, currency, and the mistitling in the report modal.
- **UU 5/1990 is still the operative conservation statute**, amended (not replaced) by **UU No. 32 Tahun 2024**, promulgated 7 August 2024, which changed 21 of its 45 articles. Sources: [peraturan.go.id](https://peraturan.go.id/id/uu-no-32-tahun-2024), [PSLH UGM](https://pslh.ugm.ac.id/uu-no-32-tahun-2024-tentang-perubahan-uu-konservasi-sumber-daya-alam-hayati-dan-ekosistemnya-uu-perubahan-konservasi/). The citation `UU No 5/1990` in `concessionsData.ts:25` is therefore live, though it should be cited "sebagaimana diubah dengan UU 32/2024" — and the phrase `perlindungan mutlak` attached to it is wrong for a *taman nasional*, which is managed by zonation (only the zona inti carries absolute protection); `perlindungan mutlak` is the cagar-alam concept.
- **UU 41/1999 Pasal 78 is still in force** and has not been struck by the Constitutional Court, though it was amended by UU 11/2020 and then UU 6/2023 (custodial terms broadly unchanged, fines raised), and Putusan MK 95/PUU-XII/2014 narrowed the surrounding UU 18/2013 / UU 41/1999 criminalisation regime as it applies to forest-edge communities. The app's bare `pasal 78` should specify **ayat (3)** (sengaja, max 15 years + Rp5 bn) or **ayat (4)** (lalai) — they carry different mens rea and penalties.
- **FRP is reported in megawatts** and the individual seed values (18.2–184.5 MW) are plausible per-pixel figures for VIIRS and MODIS.
- **MODIS confidence thresholds** — the app's `>= 80` / `< 30` cut-points exactly match the documented MODIS low/nominal/high buckets.
- **MODIS brightness values** — all 12 (318.5–358.9 K) are plausible for the T21 band-21/22 field.
- **All 16 VIIRS/SNPP acquisition times** pass the equator-crossing check, several within minutes.
- **Papua Selatan** is used correctly as a province (created by UU 14/2022) with Merauke as its kabupaten.
- **TN Bukit Tigapuluh, 144,223 ha** — matches SK 6407/Kpts-II/2002 exactly.
- **TN Tanjung Puting, 415,040 ha** — matches the widely cited SK 687/Kpts-II/1996 figure.
- **All eight `province` fields** in `concessionsData.ts`, including the cross-province `Jambi / Riau` for Bukit Tigapuluh.
- **All polygon hemisphere signs and `[lng, lat]` ordering** — no sign errors, no coordinate swaps, no polygon in the sea or on the wrong island.
- **The nearest-polygon loop** correctly preserves the globally nearest polygon (see M4) — the specific bug hypothesised in the brief is not present.
- **Leaflet tile attributions** (`CartoDB`/`OpenStreetMap`, `Esri World Imagery`, `OpenStreetMap contributors`) are present and correct in `GisMap.tsx`.

---

## 6. Unverifiable

What I could not confirm, and what would settle it.

| Item | Why unresolved | What would settle it |
|---|---|---|
| **Six of the ten invented company names** (`Palma Agri Group`, `Nusantara Agro Holding`, `Borneo Palm Resources`, `Sriwijaya Plantation Corp`, `Kalbar Agro Prima`, `Energy Nusantara Tbk`) | Web search returned no specific registry match, but absence of a search hit is not absence of a company | A name search against **AHU Online** (ahu.go.id) and **OSS/NIB**, plus the **IDX listed-issuer register** for the `Tbk` entity |
| **BPS/Kemendagri boundary confirmation for the A8 table** | Reverse geocoding used OSM. I could not obtain BPS or Kemendagri kabupaten/kecamatan polygons | **Peta Batas Wilayah Administrasi** from BIG / Ina-Geoportal, or the Kemendagri Permendagri kode-wilayah shapefile |
| **The correct kecamatan for `KALTENG-005`, `KALTIM-001`, `KALTIM-002`** | Nominatim returned province only; no kabupaten-level match | Same as above |
| **HL Sungai Wain's official area** | Sources disagree — ~9,782 ha vs ~10,000 ha vs the code's 10,025 ha, and no SK number surfaced | The **SK penunjukan/penetapan kawasan hutan** for HLSW, or a figure published by BP-HLSW dan DAS Manggar / Pemkot Balikpapan |
| **TN Bukit Tigapuluh's real centroid** | The only OSM match was a *resort* point inside the park, not the park relation, so the 55 km figure is not a valid centroid comparison | The KLHK/Kemenhut kawasan-hutan shapefile, or the TNBT polygon from Protected Planet (WDPA) |
| **HL Sungai Wain's real centroid** | No OSM relation found | Same |
| **The `cadangan karbon raksasa` claim for Giam Siak Kecil** | Directionally right for tropical peat, but tied to no published figure | A peat-carbon inventory for the GSK-BB landscape, e.g. from BRGM or the ITTO-GSK project reports |
| **Exact fine amounts in UU 41/1999 Pasal 78 as amended by UU 6/2023** | peraturan.bpk.go.id and datahukum.com both returned HTTP 403 to automated fetch; secondary sources agree custodial terms are unchanged and fines rose, but give no consolidated figures | The consolidated text of **UU 41/1999 jo. UU 6/2023** from JDIH Kementerian Kehutanan or peraturan.go.id, accessed manually |
| **Whether the four confirmed operators hold the *specific* boundaries drawn** | I confirmed each operates in that kabupaten/kecamatan in that commodity; I did not obtain their actual concession polygons | **Minerba One Map Indonesia (MOMI)** for the IUP/PKP2B boundaries, and the **HGU/perkebunan** layer from ATR/BPN or the One Map policy portal |

---

### One closing note on sequencing

Findings §3 and §4 are all real, but fixing them without fixing **C1** makes the app more dangerous, not less: a dashboard with accurate kecamatan names, correct park areas and properly cited statutes is a more convincing vehicle for fabricated fire allegations against real companies than the current one. Fix C1 and C2 first — a disclosure banner and non-colliding entity names — and the rest becomes ordinary data-quality work on an honestly labelled demo.
