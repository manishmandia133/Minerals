# mineral-intel-node

Collects India's critical-mineral intelligence from free patent & research APIs (Google Patents + OpenAlex, no keys), enriches every record with an abstract, and stores the clean corpus as one JSON file per record.

```bash
npm install
npm start              # API on http://localhost:8000
npm run auto           # single fetch + enrich + prune cycle (cron-friendly)
```

---

## Project structure

```text
src/
  index.js                 # entry: start the API server
  config.js                # all env config (port, queries, dirs, limits)
  utils/
    http.js                # getJson, [pending] stub, sleep
    dates.js               # YYYY-MM-DD helpers, newest-first, stamp
  services/
    pipeline.service.js    # fetchAndSave: fetch -> saveRecords -> enrichIds (shared by /fetch + auto.js)
    store.service.js       # file store: clean, dedupe, prune
    fetch/
      patents.service.js   # Google Patents fetcher (patents, primary)
      lens.service.js      # Lens.org fetcher (patents fallback, needs LENS_API_KEY)
      research.service.js  # OpenAlex fetcher (research)
    enrich/
      enrich.service.js    # fill missing abstracts
      scrape.service.js    # patents.google.com page parser
  server/
    app.js                 # Express wiring
    routes/                # fetch.routes, records.routes
    controllers/           # fetch.controller, records.controller
  jobs/
    auto.js                # daemon / cron loop
test/
  api.test.js              # offline tests (no network)
```

---

## How data flows

```mermaid
flowchart TB
    A["pipeline.service.js\nfetchAndSave\nGoogle Patents (IN) + OpenAlex"] --> B["Clean + dedupe\nnormalize, skip stubs"]
    B --> C["Enrich\nDOI → OpenAlex\nelse scrape page"]
    C --> D["Prune\ndelete abstract-less"]
    D --> E[("data/records/\n<slug>-<id>.json")]
```

```mermaid
sequenceDiagram
    participant U as User / Cron
    participant S as POST /fetch<br/>or jobs/auto.js
    participant PL as pipeline.service<br/>fetchAndSave
    participant P as Google Patents (IN)
    participant O as OpenAlex
    participant ST as data/records/
    U->>S: query (e.g. lithium extraction India)
    S->>PL: fetchAndSave({ patentsQuery, researchQuery })
    PL->>P: patents(query, 2 pages × ≤100)
    PL->>O: works(search, 100/query, IN filter)
    P-->>PL: title + number + date (no abstract!)
    O-->>PL: title + DOI + authors (abstract = null)
    PL->>PL: Google 503? retry via Lens.org (IN filter)
    PL->>ST: saveRecords() — clean, skip stubs, dedupe
    PL->>O: re-fetch each DOI for abstract_inverted_index
    PL->>ST: updateRecord() — fill empty slots only
    PL->>ST: scrape source_url as fallback
    PL->>ST: pruneUnenriched() — delete still-thin files
```

### 1. Fetch — `services/fetch/patents.service.js` + `services/fetch/research.service.js` via `services/pipeline.service.js`

Any source failure degrades to a `[pending]` stub (`{ title: "[pending] <query>", collector_note }`) that the store skips — outages become `received:1, inserted:0`, never crashes or junk files.

| Fetcher | Key | Volume | Notes |
|---|---|---|---|
| `patents(query, pages=2, {since, until, latest})` | none | ~200/query | Google Patents XHR, `country=IN`, `num=100`/page. No abstract — the search `snippet` is stored separately and seeds a provisional abstract until enrichment upgrades it from the real page. A failed page keeps earlier pages; stub only if nothing arrived. `latest` adds `sort=new` + sorts newest-first; `since/until` filter client-side. When Google throttles (HTTP 503), the pipeline falls back to Lens automatically. |
| `lensPatents(query, pages=2, {since, until, latest})` | `LENS_API_KEY` | ~200/query | Lens.org patent search, `jurisdiction=IN`, title-or-abstract match, server-side date range. Ships real abstracts when Lens has them; `source_url` points at the Google Patents page so enrichment can still upgrade IN records that lack abstracts. |
| `openalex(query, {perPage=100, indiaOnly, mailto, since, until, latest})` | none | 100/query | `filter=institutions.country_code:IN` when `indiaOnly`. Abstract is `null` here — rebuilt per-DOI during enrichment. `since/until` go server-side (`from/to_publication_date`) plus a client-side check. |

### 2. Clean + store — `services/store.service.js`

One file per record in `data/records/` (`RECORDS_DIR` overrides), named `<slug>-<id>.json` (slug ≤60 chars, id = 6 random bytes). Names self-heal on every save + server startup.

Dedupe key: `pub:<number>` → `doi:<doi>` → first 80 alnum chars of title. Titles <3 chars and `[pending]` stubs are skipped. Re-seeing a record **upserts**: empty slots fill and a longer `abstract` replaces a shorter one (`merged` count); unchanged re-posts count as `duplicates`.

### 3. Enrich — `services/enrich/enrich.service.js` + `services/enrich/scrape.service.js`

```mermaid
flowchart TD
    R(["record without abstract"]) --> DOI{"has DOI?"}
    DOI -- yes --> OA["OpenAlex works/doi →\nrebuild abstract from\nabstract_inverted_index\n+ journal + citations"]
    OA --> OK1{"abstract found?"}
    OK1 -- yes --> SAVE(["patch + done"])
    OK1 -- no --> SCR
    DOI -- no --> ID{"source is an\nOpenAlex work URL?"}
    ID -- yes --> OA
    ID -- no --> SCR["scrapePage(source_url)\nGoogle Patents page only"]
    SCR --> OK2{"abstract longer than\ncurrent?"}
    OK2 -- yes --> SAVE
    OK2 -- no --> MISS(["stays thin → pruned"])
```

`updateRecord()` fills **empty** slots and upgrades `abstract` when a longer one arrives — good data is never overwritten by worse data. `enrichIds(ids, limit=50)` reloads each record fresh from disk with a 300 ms sleep between items. The scraper (`fetch` + regex, zero deps) returns only what enrichment consumes; `organisation` comes from author-affiliation evidence only, never the publisher.

### 4. Prune — the garbage collector

`pruneUnenriched(40)` deletes files with missing/short abstracts or `[pending]` titles. After this step the directory holds **enriched records only**.

---

## Automation — `src/jobs/auto.js`

```mermaid
flowchart TD
    T(["cron 0 6,18 * * *\nor daemon every\nINTERVAL_MIN=360"]) --> C["cycle()"]
    C --> F["fetchCycle()\n8 mineral queries ×\n(~200 patents + 100 OpenAlex)\n500 ms between calls"]
    F --> E["enrichCycle(100)\nfill thin records"]
    E --> P["pruneCycle()\ndelete unenriched"]
    P --> DONE(["done · log counts"])
```

```bash
node src/jobs/auto.js                 # daemon: cycle now, repeat every INTERVAL_MIN
node src/jobs/auto.js --once          # single cycle, then exit (cron-friendly)
QUERIES="lithium battery India,graphite anode" npm run auto   # scoped run
SINCE_DAYS=90 LATEST=true npm run auto                        # last 90 days, newest first
```

Default queries cover lithium, cobalt, nickel, rare earths, graphite, manganese, titanium, copper (overridable via `QUERIES`).

---

## API reference

**`POST /fetch`** (alias `POST /ingest`):

```jsonc
{ "patents": "lithium extraction India", "patent_pages": 2,
  "research": "cobalt battery", "india_only": true,
  "query": "graphite anode",                 // legacy: patents + research together
  "since": "2024-01-01", "latest": true,
  "records": [{ "title": "My patent", "publication_number": "IN202400001" }] }
```

Empty → `400`. Success → `200 { ok, received, inserted, duplicates, merged, renamed, enriched }`.

| Endpoint | Result |
|---|---|
| `GET /records?limit=100&since=2024-01-01&sort=newest` | `{ total, records }`, limit clamped 1–1000 |
| `GET /records/:id` | record or `404` |
| `GET /health` | `{ ok:true }` |
| `GET /` | HTML cheat-sheet |

---

## Config, tests

Env (plain exports, all read in `src/config.js`): `PORT` (8000) · `RECORDS_DIR` · `QUERIES` · `INTERVAL_MIN` (360) · `SINCE` / `SINCE_DAYS` / `UNTIL` / `LATEST` · `OPENALEX_MAILTO` · `LENS_API_KEY` (Lens.org patent fallback; without it Google outages yield `[pending]` stubs only).

`npm test` — 3 offline tests (temp `RECORDS_DIR`, ephemeral ports): record round trip with dedupe, empty/unknown-source `400`, and `since` + `sort=newest` filtering.

Resilience by design: per-source `[pending]` stubs (never stored) · per-query try/catch in the job (one bad query can't kill a cycle) · enrich swallows page-level errors. Politeness: 500 ms between queries, 300 ms between enrich items.

Made By Manish
