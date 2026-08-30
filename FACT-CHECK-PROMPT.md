# Fact-Check Prompt: Sipongi Land-Watch (Project Gasing)

Paste everything below the line into Claude Code, run from the repo root.

---

You are auditing the factual accuracy of this repository. It is a React/TypeScript spatial dashboard
("Sipongi Land-Watch") that classifies Indonesian karhutla hotspots by land status: hutan lindung and
kawasan konservasi, konsesi sawit, konsesi tambang, kawasan perkotaan, APL.

Your job is verification, not code review and not refactoring. Do not edit any file unless I explicitly
ask you to after reading your report. Performance, styling, and architecture are out of scope.

## Step 0: separate the three kinds of content

Before checking anything, classify every factual claim into one of three buckets, because each has a
different standard of truth:

1. **Real-world claims.** Statutes, article numbers, agency names, protected-area names and sizes,
   satellite sensor behaviour, administrative geography (provinsi / kabupaten / kecamatan), URLs.
   These are true or false and must be verified against sources.
2. **Synthetic data presented as synthetic.** `src/data/mockHotspots.ts` is seeded fake data. Do not
   fact-check whether a fire actually burned at a given coordinate on 2026-08-24. Do check whether the
   fake values are *physically and institutionally plausible*, and whether the app is honest about
   their being fake.
3. **Synthetic data presented as real.** This is the highest-severity category. Any place where
   fabricated content is dressed as sourced fact is a finding regardless of how plausible it looks.

Report every item in bucket 3 first.

## What to verify

### A. Legal citations

Files: `src/App.tsx` (regulation list near the disclaimer block), `src/utils/spatialAnalysis.ts`
(`legalNote` strings), `src/components/AnalyticsCharts.tsx`, `src/data/concessionsData.ts`.

For each cited instrument, confirm the number, the year, the official title, the specific pasal, and
whether it is still in force in its cited form:

- UU No. 18/2013 (Pencegahan dan Pemberantasan Perusakan Hutan)
- UU No. 32/2009 (Perlindungan dan Pengelolaan Lingkungan Hidup)
- UU No. 41/1999 (Kehutanan), Pasal 78
- UU No. 5/1990 (Konservasi Sumber Daya Alam Hayati dan Ekosistemnya)

Specific questions to answer explicitly:

1. Is the strict liability / tanggung jawab mutlak claim attached to the right pasal of UU 32/2009?
   The code asserts strict liability for HGU holders without naming an article. Name the correct one,
   confirm the scope of liability it creates, and confirm whether UU Cipta Kerja (UU 11/2020, then
   UU 6/2023) altered the wording or the burden of proof.
2. Has UU 41/1999 Pasal 78 been amended, replaced, or partially struck by Mahkamah Konstitusi rulings
   or by omnibus legislation? Cite the amending instrument if so.
3. Is UU 5/1990 still the operative conservation statute, or has it been superseded? Check for a
   successor UU on konservasi sumber daya alam hayati.
4. Does the app cite any instrument that is central to karhutla enforcement and missing? Consider
   PP 4/2001, PermenLHK on pengendalian karhutla, and Perpres on peatland restoration.

### B. Institutional naming

The repo mixes "KLHK", "Kemenhut RI", and links to `sipongi.gakkum.kehutanan.go.id`.

1. Verify the current ministerial structure. Confirm whether KLHK still exists as a single ministry or
   whether it was split, and if split, confirm the successor names, the date, and which successor owns
   SIPONGI and which owns gakkum. Then flag every string in the repo that uses a stale or mixed name.
2. Verify each balai / UPT named as a `holder` in `concessionsData.ts` (Balai TN Tesso Nilo, BBKSDA
   Riau, Balai TN Bukit Tiga Puluh, Balai TN Sebangau, Balai TN Tanjung Puting, Balai Besar TNBKDS
   Kalbar, BP HLSW Balikpapan, Balai TN Lore Lindu). Confirm the correct official name and the correct
   parent institution for each. Flag abbreviations that are not the official ones.
3. Verify the SIPONGI URL resolves and is the current canonical address for the hotspot map.

### C. Protected areas: names, sizes, and geometry

For every entry in `concessionsData.ts` with `category: 'hutan_lindung'`, check:

1. **Official name.** Is it the gazetted name?
2. **`areaHectares`.** Compare against the SK penetapan kawasan or the official balai figure. State the
   official number and the source. Treat any deviation above roughly 5 percent as a finding, and note
   that several of these areas have been formally expanded or reduced, so name the year of the figure
   you are comparing against.
3. **`province`.** Confirm the province assignment, including cross-province areas.
4. **Polygon plausibility.** The `coordinates` arrays are hand-drawn 5 to 6 vertex shapes in
   `[lng, lat]` order. Do not expect boundary accuracy. Do check that the centroid actually falls inside
   the province claimed, that the hemisphere signs are right, and that the polygon's rough bounding box
   does not sit in the sea or in the wrong island. Report any polygon whose centroid is more than about
   50 km from the real area's centroid, and give the real centroid.
5. **Descriptions.** Verify the ecological claims, for example which megafauna each area actually holds,
   and whether the peat and carbon claims match published figures.

### D. Fabricated commercial entities

`concessionsData.ts` assigns fires to named concession holders: Palma Agri Group, Nusantara Agro
Holding, Citra Borneo Agro, Borneo Palm Resources, Sriwijaya Plantation Corp, Kalbar Agro Prima, Energy
Nusantara Tbk, South Borneo Minerals, Sumatra Energy Holding, Sulawesi Mining Alliance.

1. Search each name against Indonesian company registries and news. Report any that collides with, or
   is confusingly close to, a real company, especially anything using "Tbk", which implies a listed
   issuer. A fabricated fire allegation resembling a real listed company is a defamation exposure, not a
   cosmetic problem.
2. Report whether the UI anywhere labels these as illustrative. If it does not, say so plainly and
   quote the screens where a reader would reasonably take them as real permit holders.

### E. Remote sensing claims

Files: `src/types/index.ts`, `src/data/mockHotspots.ts`, `src/components/HotspotDetailModal.tsx`,
`src/components/AnalyticsCharts.tsx`.

Verify against NASA FIRMS / LANCE documentation and the sensor product user guides:

1. **Confidence semantics.** The schema stores `confidence` as 0 to 100 and derives high / medium / low
   thresholds from it. Confirm how MODIS and VIIRS actually report confidence. If VIIRS active fire
   confidence is categorical rather than a percentage, the schema misrepresents the source product and
   every VIIRS confidence number in the seed data is a fabricated precision. Say so.
2. **Spatial resolution.** Confirm the nominal pixel size of VIIRS 375 m products versus MODIS 1 km, and
   check whether the UI implies a locational precision the sensor cannot support, given the app measures
   distance-to-boundary in single metres and triggers legal language off a 1000 m and 2500 m threshold.
3. **Brightness temperature.** Confirm the plausible Kelvin range for the relevant channels and flag any
   seed value outside it. Confirm which band the value in `brightness` would correspond to.
4. **FRP.** Confirm that Fire Radiative Power is reported in megawatts and that the seed values fall in a
   plausible range for the sensor. Check whether summing FRP across hotspots into a single `totalFRP`
   figure, as `computeSpatialSummary` does, is a defensible aggregate or a category error. If FRP is an
   instantaneous rate rather than an accumulated quantity, explain what the dashboard's headline number
   actually means and what it should be instead.
5. **Overpass times.** Cross-check every `time` field against the real equator crossing times of Terra,
   Aqua, Suomi NPP, and NOAA-20, converted to WIB. Flag records where a sensor is recorded acquiring at
   an hour that satellite does not pass over Indonesia.
6. **LANDSAT-8/9 as a hotspot sensor.** The enum lists it alongside VIIRS and MODIS. Confirm whether
   FIRMS distributes a Landsat active fire product, and if so, its geographic coverage. If that product
   does not cover Indonesia, the enum promises data the pipeline cannot receive.

### F. Administrative geography

For every `province` / `district` / `subdistrict` triple in `mockHotspots.ts`, verify that the kecamatan
exists inside that kabupaten and that the kabupaten exists inside that provinsi, using BPS or Kemendagri
nomenclature. Then verify that the `lat` / `lng` of the record actually falls inside that kabupaten.
Report mismatches as a table. Note any kabupaten affected by pemekaran since the code was written.

### G. Internal consistency

These are self-contained checks that need no external source, and each one is a finding on its own:

1. `src/types/index.ts` documents the sawit buffer as "Radius Buffer < 2 km", while
   `spatialAnalysis.ts` uses 2500 m. Confirm the discrepancy and state which one the UI copy describes
   to the user.
2. The `hutan_lindung` category collapses fires *inside* a conservation area with fires up to 2.5 km
   *outside* it into the same `landCategory`, while the legal note text differs. Check whether the
   summary counts, percentages, and the "Kritis" alert tally therefore overstate in-boundary violations.
   Quantify the overstatement in the seed dataset.
3. `classifyHotspotSpatial` breaks on the first containing polygon. Check whether any polygons overlap,
   which would make classification order-dependent.
4. The nearest-polygon search compares against all polygons, so a fire can be labelled "buffer of a
   sawit concession" while sitting closer to a different feature that was overwritten in the loop.
   Confirm whether the loop preserves the true nearest polygon or the nearest one of a chosen category.
5. The footer states "Sumber Data: Sipongi+ KLHK, Satelit VIIRS/MODIS & GIS Konsesi Indonesia" while the
   dashboard renders seeded data. State every screen where a sourcing claim is made that the running app
   does not honour.

## Sourcing rules

- Use Indonesian primary sources as the authority on Indonesian facts: JDIH and peraturan.go.id for
  statutes, SIPONGI and the responsible ministry for hotspot methodology and kawasan data, BPS and
  Kemendagri for administrative codes, KLHK/Kemenhut SK documents for kawasan boundaries and areas, BIG
  and the One Map policy for geospatial reference. International NGO datasets are useful corroboration
  and are not the primary record.
- Use NASA FIRMS, LANCE, and the MODIS and VIIRS active fire product user guides for sensor behaviour.
- Cite a URL and a retrieval date for every external claim. If a source is behind a portal you cannot
  reach, say that instead of inferring the number.
- Where sources disagree, present both and say which is authoritative and why. Do not average them.
- State your confidence per finding. "I could not verify this" is a valid and useful result. Do not
  manufacture a citation.

## Output

Write `FACT-CHECK-REPORT.md` in the repo root, structured as:

1. **Verdict**, five sentences or fewer. What is safe to publish and what is not.
2. **Critical findings.** Fabricated content presented as sourced, legal citations that are wrong or
   superseded, and company names that collide with real entities. For each: file and line, the claim as
   written, the verified fact, the source, the consequence if published, and the minimal correction.
3. **Accuracy findings.** Wrong areas, names, geography, sensor semantics. Same fields.
4. **Methodology findings.** Internal inconsistencies and aggregations that do not mean what the label
   says. Same fields.
5. **Verified correct.** A short list, so I know what you checked and cleared rather than skipped.
6. **Unverifiable.** What you could not confirm and what source would settle it.

Rank sections 2 through 4 by consequence, worst first. Use a table where the fields fit one line and
prose where they do not. Keep the report in the language of the claim being checked: quote Indonesian
strings in Indonesian, write your analysis in English.

## Constraints

- Read every file under `src/`. Ignore `node_modules/`, `dist/`, and lockfiles.
- Do not modify code. The deliverable is the report.
- If a claim is unfalsifiable as written, say that rather than guessing at what was meant.
- Where the honest answer is that the whole dataset is illustrative and the fix is a disclosure banner
  rather than 40 individual corrections, say that first and rank the individual corrections beneath it.
