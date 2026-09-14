# mineral-intel-node

Live mineral-intelligence fetcher + offline patent pipeline. Two halves:

1. **Live loop** (`src/` + `auto.js`): fetch patents/research from free APIs → clean → enrich missing abstracts → store one JSON file per record in `data/records/` → delete still-thin files.
2. **Offline patent pipeline** (`pipeline.js` + `pipeline/`): Kaggle/BigQuery CSVs in `data/raw/` → normalize → dedupe → relevance-filter → `data/processed/patents.{parquet,json,csv}`.

```bash
npm install
npm start              # API on http://localhost:8000
node auto.js --once    # single fetch+enrich+prune cycle (cron-friendly)
```

---

## 1. Big picture: how the pieces fit

```
USER / CRON
   │  POST /fetch {"query": "..."}          node auto.js --once / daemon
   ▼                                        ▼
src/server.js (fetchHandler)               auto.js fetchCycle() ── same 3 fetchers
   │  patents() + openalex() / research() / lens()
   ▼
src/fetch.js ── GET patents.google.com/xhr/query?country=IN (2 pages × ≤100)
             ── GET api.openalex.org/works?search=…&per-page=100[&filter=…:IN]
             ── POST api.lens.org/patent/search (size 100, country IN, needs token)
   │ plain record objects (+ [pending] stubs on failure)
   ▼
src/store.js saveRecords(): clean() → skip stubs → dedupe key → write
   data/records/<slug>-<id>.json                     e.g. lithium-extraction-method-a1b2c3d4e5f6.json
   │ returns { received, inserted, duplicates, ids, renamed }
   ▼
src/enrich.js enrichIds(ids): for each id missing abstract —
     DOI? → GET api.openalex.org/works/https://doi.org/<doi> → rebuild abstract
            from abstract_inverted_index + journal + citation_count
     else → src/webscrape.js scrapePage(source_url) → meta/JSON-LD/paragraphs
            → patch abstract/full_text/authors/organisation/journal/date
   │ returns enriched count
   ▼
src/store.js pruneUnenriched(40): delete files with no abstract / abstract <40
   chars / "[pending]" title → { removed, kept }
   │
   ▼  (auto.js only)
auto.js pipelineCycle(): if any data/raw/*.csv newer than data/processed/patents.json
   → pipeline/run.mjs: normalize (per-source column hints) → dedupe (exact number,
     else fuzzball title ≥85 + same filing year) → isRelevant (30 minerals+aliases
     or CPC/IPC prefix) → patents.{json,csv,parquet}
```

Entry points:

| Entry | File | What it does |
|---|---|---|
| `npm start` | `src/index.js` → `src/server.js` | HTTP API (`POST /fetch`, `GET /records`, `GET /records/:id`, `GET /health`, `GET /`) |
| `node auto.js [--once\|--watch\|--interval MIN]` | `auto.js` | loop: fetch → enrich → prune → pipeline refresh; `--watch` only watches `data/raw/` |
| `node pipeline.js --download \| --bigquery \| --refresh` | `pipeline.js` → `pipeline/*.mjs` | offline CSV pipeline |
| `npm test` | `test/api.test.js` | 2 offline tests (store round-trip, lens-no-token degrade) |

Runtime deps that matter: `express` (API server); pipeline-only `csv-parse`, `fuzzball`, `parquetjs`, `@google-cloud/bigquery`, `axios`. Live fetching itself uses only Node's built-in `fetch` with `User-Agent: mineral-intel/1.0`.

---

## 2. Live fetchers in detail — `src/fetch.js`

One shared helper builds everything:

- `getJson(url, params)` — appends `params` as query string, `fetch` with the UA header, throws `HTTP <status> for <url>` on non-2xx, else returns parsed JSON.
- `pending(source, kind, query, note)` — failure envelope: `[{ source, kind, title: "[pending] <query>", collector_note: note }]`. The store **skips** any object with `collector_note` and no abstract, so outages degrade to `received:1, inserted:0` instead of crashes or junk files.

### 2.1 `patents(query, pages = 2)` — Google Patents, India, no key

For each page `p` in `0..pages-1`:

1. Calls `getJson('https://patents.google.com/xhr/query', { url: 'q=<query>&country=IN&page=<p>&language=ENGLISH', exp: '' })`. Note the query is nested inside the `url` param — that is the Google Patents XHR convention.
2. Reads `data.results.cluster[]` (each item's `.result`), sliced to the first **100 clusters/page** → up to ~200 records per query with the default 2 pages.
3. Maps each hit to:
   ```js
   { source: 'indian_patent', kind: 'patent', title,
     publication_number,                 // e.g. "IN202400001"
     publication_date,                   // String(date).slice(0,10)
     source_url }                        // https://patents.google.com/patent/<pubNo>/en
   ```
4. Any throw (network, HTML error page, JSON change) → returns one `[pending]` stub for the whole call.

Important: Google Patents hits carry **no abstract**. The abstract arrives later via enrichment (scraping `source_url`), otherwise prune deletes the file. This is why the default query volume is high (200/query) but the final kept count is lower.

### 2.2 `openalex(query, opts)` — research papers, no key

`opts` is `{ perPage = 100, indiaOnly = false, mailto }` (a bare number means `{ perPage }`).

1. Params: `search=<query>`, `per-page=100`. If `indiaOnly`, adds `filter=institutions.country_code:IN` (server's `india_only:true` and auto.js both set this). If `mailto` (or `OPENALEX_MAILTO` env) present, adds `mailto=` for OpenAlex's polite pool (faster, higher rate limit).
2. `GET https://api.openalex.org/works`.
3. Maps each work:
   ```js
   { source: 'openalex', kind: 'research', title, abstract: null, doi,
     applicants_or_authors,   // first 10 authorship display_names
     organisation,            // first institution of first authorship
     publication_date,        // slice(0,10)
     source_url }             // doi || openalex id (https://openalex.org/W…)
   ```
4. `abstract` is deliberately `null` — the search endpoint doesn't return reconstructable abstracts; `enrich.js` re-fetches each DOI individually (see §4) to build it from `abstract_inverted_index`.

### 2.3 `lens(query, opts)` — Lens.org patents, token required

1. Token resolution: `opts.token || process.env.LENS_TOKEN`. Missing → `[pending]` stub (`lens: missing token`), skipped by the store. This keeps tests and tokenless installs green.
2. `size = clamp(opts.size || 100, 1, 100)`. Query DSL: `bool.must = [{ bool.should: [match title/abstract/claim/description] }, { term: { country: jurisdiction || 'IN' } }]` — pass `jurisdiction: null` for worldwide. `opts.raw` can replace the whole body. Requests `include: ['lens_id','biblio','abstract']`.
3. `POST https://api.lens.org/patent/search` with `Authorization: Bearer <token>`. Non-2xx throws with the first 200 chars of the body for debuggability.
4. Maps each hit to the richest record shape: `title` (first `invention_title.text`), `abstract` (first abstract text), `publication_number` (`country+doc_number+kind`), `publication_date` (`date_publ || publication_reference.date`, sliced), applicants+inventors merged (org name else assembled person name, ≤20), `organisation` (first applicant), `lens_id`, Google-Patents `source_url`.
5. Free token: `lens.org/lens/user/subscriptions`; pass per-request as `lens_token` or via env.

### 2.4 What was removed and why

`rss()` / `rss_url` and the generic `scrape_url` endpoint were deleted: nothing in `auto.js`, tests, or the pipeline used them, and arbitrary-page ingest bypassed cleaning/enrichment guarantees. Page scraping survives in exactly one controlled place — the enrich fallback (`src/webscrape.js`, §3).

---

## 3. Web scraper in detail — `src/webscrape.js`

`scrapePage(url)` — zero dependencies, `fetch` + regex, ~130 lines. Strategy: parse the same HTML four ways and take the best of each field.

1. **Fetch** with UA header; non-2xx throws. Whole page as text.
2. **`metaTags(html)`** — two regex passes (name-before-content and content-before-name) capturing `name|property|citation_*|itemprop → content`, HTML-unescaped and whitespace-collapsed. This catches `description`, `og:*`, `twitter:*`, `citation_author` (repeatable), `citation_abstract/title/journal_title/doi/publisher/publication_date/online_date`, `article:published_time/modified_time`, `keywords`, `dc.identifier`.
3. **`jsonLd(html)`** — all `<script type="application/ld+json">` blocks, `JSON.parse` each (invalid skipped), flattened into one object for `headline/name/description/author/datePublished/dateModified/publisher/doi`.
4. **`allMatches(html, re, …)`** — deduped, tag-stripped, capped lists for paragraphs (`<p>`, ≤2000 chars each), headings (`<h1>–<h3>`, ≤300 chars, ≤30), images (`<img src>`, ≤20), links (absolute `http(s)` in `<a href>`, ≤50). Images are resolved against the page URL (`new URL(u, url)`).
5. **Field precedence**:
   - `title`: `<title>` (≤500) → `og:title` → `twitter:title` → `citation_title` → JSON-LD headline/name → URL.
   - `abstract`: first meta description-family value longer than 40 chars (≤2000), else first `<p>` longer than 40 chars.
   - `full_text`: scripts/styles/nav/footer stripped, tags → spaces, collapsed, ≤20000.
   - `authors`: `citation_author` metas + JSON-LD authors, deduped, ≤20. `organisation`: `citation_publisher` → `og:site_name` → JSON-LD publisher name.
   - `published_date`: `citation_publication_date` → `citation_online_date` → `article:published_time` → JSON-LD. `updated_date` likewise from modified fields. `journal`: `citation_journal_title` → `og:site_name`. `doi`: `citation_doi` → `dc.identifier` → JSON-LD. Plus `keywords`, `language` (`<html lang>`), `canonical_url` (`<link rel=canonical>`), `headings/images/links`.
6. Returns a record-shaped object (`source:'web'`, `kind:'research'`, …, `source_url:url`); `abstract` capped at 2000 chars or `null`.

Only caller: `enrichRecord()` fallback (§4). It is never exposed as an API endpoint.

---

## 4. Enrichment in detail — `src/enrich.js`

Goal: every stored record ends with a usable abstract, or it gets pruned (§5). `updateRecord()` only fills **empty** slots — a good abstract/title is never overwritten.

`enrichRecord(rec)`:

1. Already has `abstract` → `false` (nothing to do).
2. Has `doi` → `openAlexPatch(doi)`: strips `https://doi.org/` prefix, `GET api.openalex.org/works/https://doi.org/<clean>`, rebuilds the abstract from `abstract_inverted_index` (`{word: [positions]}` → invert to `{pos: word}` → sort numerically → join). Returns `{ abstract, journal (primary_location.source.display_name), citation_count }` or `null` if empty. On success → `store.updateRecord` → `true`. This is the high-precision path (OpenAlex search in §2.2 gives the DOI; here we get the text).
3. Else (or DOI gave nothing) and `source_url` is `http(s)` → `scrapePage(source_url)` → requires abstract >40 chars → patches `{ abstract, full_text, applicants_or_authors (scraped authors), organisation, journal, publication_date (scraped published_date) }`.
4. Any throw (blocked page, paywall, offline, short text) is swallowed → `false`.

`enrichIds(ids, limit = 50)` — slices to `limit`, re-loads each record fresh from disk (so concurrent cycles see updates), awaits `enrichRecord`, sleeps 300 ms between items (politeness for OpenAlex + scraped hosts), returns filled count. Callers: `/fetch` (all newly saved ids, default limit 50) and `auto.js` (`limit = 100`).

---

## 5. Store in detail — `src/store.js`

Directory `data/records/` (`RECORDS_DIR` overrides). Filename `<slug>-<id>.json`: slug = title lowercased, runs of non-`[a-z0-9]` → `-`, trimmed, ≤60 chars (`untitled` fallback); id = 6 random bytes hex (12 chars) → uniqueness without a DB.

Record schema (after `clean()`):

```js
{ id, source, kind,            // kind coerced: 'research' else 'patent'
  title,                       // collapsed whitespace, ≤1000
  abstract,                    // collapsed, ≤3000, else null
  full_text,                   // collapsed, ≤20000, else null
  publication_number,          // spaceless + UPPERCASE, else null → dedupe key part 1
  doi,                         // lowercased, else null → dedupe key part 2
  publication_date,            // String slice(0,10), else null
  applicants_or_authors,       // array ≤20, else []
  organisation, lens_id, journal, citation_count, source_url, created_at } // ISO timestamp
```

Key behaviors:

- **`saveRecords(recs)`**: loads all existing keys into a `Set`; per input: `clean()` → skip if title <3 chars or (`collector_note` present and no abstract — i.e. all `[pending]` stubs) → compute `key()` = `pub:<number>` else `doi:<doi>` else `title:<first 80 alnum lowercase>` → skip+count `duplicates` if seen → else assign id/created_at, write file, collect id. Ends with `reconcileFilenames()`; returns `{ received, inserted, duplicates, ids, renamed }`.
- **`reconcileFilenames()`**: rewrites+deletes any file whose name isn't the current `<slug>-<id>.json` for its content (heals legacy `id.json` files). Runs on server startup and every save; count surfaces as `renamed` in `/fetch` responses.
- **`updateRecord(id, patch)`**: finds file by `rec.id` (not filename), skips null/empty patch values and non-empty current values, rewrites (renaming if the title changed). Returns boolean.
- **`pruneUnenriched(minLen = 40)`**: unlinks every file with missing/short abstract OR `[pending]` title. Returns `{ removed, kept }`. This is the garbage collector that keeps the corpus enriched-only.
- **`load()`**: parses every `.json` (corrupt files skipped), sorted newest-first by `created_at`.

---

## 6. API server in detail — `src/server.js` + `src/index.js`

`src/index.js`: `createApp().listen(PORT||8000)`. `createApp()` builds the Express app (also used by tests on ephemeral ports).

### `POST /fetch` (alias `POST /ingest`) — full lifecycle trace

Request:
```jsonc
{ "query": "lithium extraction India", "patent_pages": 2,
  "research": "cobalt battery", "india_only": true,
  "lens": "critical minerals AND lithium", "lens_token": "…",
  "lens_size": 100, "lens_jurisdiction": "IN",
  "records": [{ "title": "My patent", "publication_number": "IN202400001" }] }
```

Handler steps:

1. `oa = { indiaOnly: !!body.india_only }` — applies to both `query` and `research` OpenAlex calls.
2. Seeds `recs` with `body.records` (direct inserts, cleaned like everything else).
3. `query` → `patents(query, patent_pages||2)` **plus** `openalex(query, oa)` concatenated. `research` → `openalex(research, oa)`. `lens` → `lens(lens, { token: lens_token, size: lens_size, jurisdiction: lens_jurisdiction===null ? null : (…||'IN') })`.
4. Empty `recs` → `400 { detail: 'Give { query } or { research } or { lens } or { records }.' }`.
5. `saveRecords(recs)` → `{ received, inserted, duplicates, ids, renamed }`.
6. `enrichIds(ids)` (default limit 50) → `enriched` count.
7. `200 { ok:true, received, inserted, duplicates, renamed, enriched }` (the per-record `ids` are stripped before responding). Handler-level throw → `500 { detail }`.

### Reads + meta

- `GET /records?limit=100` → `{ total, records: all.slice(0, limit) }`, limit clamped 1–1000.
- `GET /records/:id` → record or `404 { detail:'Not found.' }`.
- `GET /health` → `{ ok:true }`. `GET /` → HTML cheat-sheet. `GET /favicon.ico` → 204.

Copy-paste test queries: `{"query":"lithium extraction India"}`, `{"query":"graphite anode"}`, `{"query":"rare earth magnets India"}`, `{"research":"cobalt battery","india_only":true}`, `{"lens":"critical minerals AND (lithium OR cobalt)"}` (needs `LENS_TOKEN`), direct `{"records":[…]}`; then `GET /records?limit=5` and `GET /records/<id>`.

---

## 7. Automation in detail — `auto.js`

```bash
node auto.js            # daemon: cycle now, repeat every INTERVAL_MIN (default 360), watch data/raw/
node auto.js --once     # single cycle, then exit (cron-friendly)
node auto.js --watch    # only refresh pipeline when new CSVs land in data/raw/
npm run auto            # same as --once
```

Constants: `QUERIES` (default 8 mineral queries, overridable via env comma-list), `RAW_DIR`/`OUT_DIR` (default `data/raw`, `data/processed`), 500 ms sleep between queries/APIs, `stamp()` log prefix.

Cycle (`cycle()`):

1. **fetchCycle()** — per query: `patents(q, 2)` + `openalex(q, { perPage:100, indiaOnly:true })`; if `LENS_TOKEN`, `lens(q, {size:100})` + 500 ms sleep. `saveRecords()` per query; aggregates `received/inserted/duplicates`; per-query throw logged, cycle continues. Log: `[auto <ts>] fetch: queries=8 received=… inserted=… duplicates=…`.
2. **enrichCycle(100)** — `thin = load().filter(!abstract).map(id)`; `enrichIds(thin, 100)`; log `thin/filled`.
3. **pruneCycle()** — `pruneUnenriched(40)`; log `removed/kept`. After this step the directory holds enriched records only.
4. **pipelineCycle()** — no-op unless `RAW_DIR` has CSVs newer than `OUT_DIR/patents.json`; then `refresh(RAW_DIR, OUT_DIR)` (§8). `watchRaw()` does the same debounced (2 s) on `fs.watch` CSV events.
5. Log `cycle done. records=<load().length>`.

Scheduling: `--once` runs one `cycle()`; default daemon runs `watchRaw()` + `cycle()` immediately, then `setInterval(mins*60000)`; `--interval MIN` or `INTERVAL_MIN` tunes it. Cron twice-daily: `0 6,18 * * * cd /path/to/mineral_intel-node && node auto.js --once`. Scoped test: `QUERIES="lithium battery India,graphite anode" node auto.js --once`.

---

## 8. Offline patent pipeline in detail — `pipeline.js` + `pipeline/`

Patents only. `pipeline.js` (CommonJS) parses `--raw-dir/--out-dir/--no-parquet/--project` and dynamically imports the ESM steps:

```bash
node pipeline.js --download                  # Kaggle datasets 1+2 -> data/raw/
node pipeline.js --bigquery [--project ID]   # BigQuery source 3 -> data/raw/gpatents_in.csv
node pipeline.js --refresh [--raw-dir DIR] [--out-dir DIR] [--no-parquet]
```

### 8.1 Sources

- **`pipeline/download.mjs`** (`--download`): `axios` GETs the two Kaggle dataset zips (`aryansingh0909/indian-patent-dataset`, `aryansingh0909/weekly-patent-application-granted`) with `KAGGLE_USERNAME/KAGGLE_KEY` basic auth, saves `<name>.zip` into raw dir, `unzip -o -q` (warns if `unzip` missing). Needs the same creds as `kaggle.json` (Settings → API → Create New Token).
- **`pipeline/bigquery.sql` + `bigquery-export.mjs`** (`--bigquery`): the SQL selects `publication_number AS id`, first `title_localized/abstract_localized` texts, `STRING_AGG` assignee/inventor names, `DATE(filing_date/grant_date)`, `STRING_AGG(ipc)` codes from `patents-public-data.patents.publications WHERE country_code='IN'`. The exporter runs it via `@google-cloud/bigquery` (auth: `GOOGLE_APPLICATION_CREDENTIALS`, `location:'US'`, optional `--project`) and writes `data/raw/gpatents_in.csv` with RFC-4180 quoting. Manual alternative: paste the SQL into the BigQuery/Kaggle UI once and drop the CSV at that path — `loadAll()` picks up any `*.csv`.
- **Source tagging** (`normalize.mjs loadAll`): `gpatents_in.csv` → source `gpatents`; every other file → its basename. Each load logs `[raw] <source>: <n> rows <- <file>`. Missing raw dir warns with the `--download` hint; unparsable files are skipped with a warning (BOM stripped, `relax_quotes/relax_column_count` tolerate messy Kaggle CSVs).

### 8.2 Normalize — `normalize.mjs`

Flexible column matching: for each canonical field, the first column whose lowercased name equals/contains a hint wins (`HINTS`: id ← publication/application/patent_number…; title ← title/invention_title; abstract; assignee ← assignee/applicant; inventor; filingDate ← filing/application/filed…; grantDate ← grant/publication/published…; ipcCpcCodes ← ipc/cpc/classification/codes). Unknown columns ignored; empty → `null`. People fields split on `;|` → joined `'; '`; codes split on `;|,`; dates parsed via `Date` → `YYYY-MM-DD` with `YYYY-MM-DD`-regex fallback; title ≤1000 / abstract ≤5000 whitespace-collapsed. Output schema: `{ id, title, abstract, assignee, inventor, filingDate, grantDate, ipcCpcCodes[], source }`.

### 8.3 Dedupe — `dedupe.mjs`

Two passes over the concatenated sources (`fuzzball.token_set_ratio`): (1) exact normalized number (`A-Z0-9` only, uppercased) — second occurrence dropped (`dupNumber`); (2) fuzzy title `≥85` **and** same filing year (either year missing counts as match) — dropped (`dupFuzzy`). Logs `[dedupe] in kept dupes (number, fuzzy)`.

### 8.4 Relevance — `minerals.mjs`

India's 30 notified critical minerals (Ministry of Mines, 2023) + aliases + manganese: `lithium (li-ion/lithia/spodumene/…), cobalt, nickel, rare earth (neodymium/dysprosium/…), graphite/graphene, manganese, titanium, copper, antimony, beryllium, bismuth, gallium, germanium, hafnium, indium, molybdenum, niobium, platinum group, phosphorous, potash, rhenium, silicon, strontium, tantalum, tellurium, tin, tungsten, vanadium, zirconium, selenium, cadmium`. Match = case-insensitive substring on `title + abstract`, except keywords ≤3 chars (`tin`, `pgm`) require word boundaries so "heating" doesn't match tin. Class-code path: any `ipcCpcCodes` entry starting with `C22B, B03B, B03C, C01G, E21C, C22C, H01M`. `isRelevant()` keeps on mineral-hit OR code-hit and returns `{ keep, mineralsMatched, codeHit }` — `mineralsMatched` is stored as the trace column.

### 8.5 Write — `run.mjs refresh()`

Logs `[normalize] total (per-source)`, dedupe line, `[filter] kept/dropped`, then writes `patents.json` (pretty), `patents.csv` (quoted cells, `; `-joined arrays), and `patents.parquet` (all-UTF8-optional schema via `parquetjs`; arrays joined; failure warns and keeps json/csv — `--no-parquet` skips it). Final `[funnel] raw -> deduped -> filtered` plus `{ received, deduped, filtered }` return. Empty raw dir → `no CSVs — nothing to do` hint.

---

## 9. Config, scripts, tests, ops notes

`package.json`: `start` (API), `auto` (`--once`), `pipeline` (`--refresh`), `download` (`--download`), `test` (`node --test test/api.test.js`). Env (plain exports, no `.env`): `PORT` (8000), `LENS_TOKEN` (Lens patents; else skipped), `OPENALEX_MAILTO` (polite pool), `QUERIES`, `INTERVAL_MIN` (360), `RECORDS_DIR`, `RAW_DIR`, `OUT_DIR`, plus pipeline-only `KAGGLE_USERNAME/KAGGLE_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`.

`test/api.test.js` (offline by design — temp `RECORDS_DIR`, ephemeral ports): (1) direct-record round trip — insert `IN202400001` → `inserted:1`, re-post → `duplicates:1`, `GET /records` total ≥1, `GET /records/:id` has title; (2) `{ lens:'lithium' }` with no token → `200, received:1, inserted:0` (stub skipped). Run: `npm test` (2 pass).

Failure semantics: per-source `[pending]` stubs (never stored), per-query try/catch in auto (one bad query can't kill a cycle), enrich swallows page-level errors, pipeline skips bad CSVs and tolerates parquet failure. Politeness: 500 ms between queries/Lens calls, 300 ms between enrich items. Knowing the volume: one default auto cycle ≈ 8 queries × (~200 patents + 100 OpenAlex + 100 Lens) ≈ up to ~3200 received before dedupe/enrich/prune — OpenAlex `mailto` and smaller `QUERIES` are the main levers if rate-limited.
