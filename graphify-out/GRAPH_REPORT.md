# Graph Report - .  (2026-09-26)

## Corpus Check
- 117 files · ~79,007 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 564 nodes · 1014 edges · 31 communities (21 shown, 10 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Scraping Fetch Enrich
- Frontend UI Bits
- Frontend API Client
- Patent RAG Ingestion
- Patent RAG Dependencies
- Backend Read API
- Scraping Server App
- Backend Package Config
- Frontend Build Config
- Frontend App Pages
- Scraping Config Jobs
- Patent RAG Server
- Frontend UI Dependencies
- Scraping Package Manifest
- Project Docs Monorepo
- Lint Config
- Icon Sprite Set
- Backend Error Utils
- OpenCode Plugin
- Vercel Rewrites
- Graphify Plugin
- Graphify Workflow
- Cobalt Mineral Image
- Gallium Mineral Image
- Graphite Mineral Image
- Iron Mineral Image
- Lithium Mineral Image
- Deploy Pipeline

## God Nodes (most connected - your core abstractions)
1. `react` - 26 edges
2. `resolveRange()` - 16 edges
3. `useScrollReveal()` - 15 edges
4. `answerQuestion()` - 14 edges
5. `fetchAndSave()` - 12 edges
6. `getPatentsLive()` - 12 edges
7. `getResearchesLive()` - 12 edges
8. `patents()` - 11 edges
9. `saveRecords()` - 10 edges
10. `enrichIds()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `PatentExplorerPage()` --indirect_call--> `patents()`  [INFERRED]
  frontend/src/pages/PatentExplorerPage.jsx → data-scraping/src/services/fetch/patents.service.js
- `EcosystemPage()` --indirect_call--> `key()`  [INFERRED]
  frontend/src/pages/EcosystemPage.jsx → data-scraping/src/services/store.service.js
- `MINERALIS AI HTML entry page` --implements--> `Frontend React Vite UI`  [INFERRED]
  frontend/index.html → README.md
- `React Vite template setup` --conceptually_related_to--> `Frontend React Vite UI`  [INFERRED]
  frontend/README.md → README.md
- `cliDateOpts()` --calls--> `resolveRange()`  [EXTRACTED]
  data-scraping/src/jobs/auto.js → data-scraping/src/utils/dates.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MINERALIS monorepo intelligence flow** — readme_mineral_intel_fetcher, readme_backend_api, readme_patent_rag_service, readme_frontend_ui [EXTRACTED 1.00]

## Communities (31 total, 10 thin omitted)

### Community 0 - "Scraping Fetch Enrich"
Cohesion: 0.06
Nodes (67): { enrichIds }, { fetchAndSave }, fetchHandler(), { resolveRange, today }, { saveRecords }, { fetchHandler }, { Router }, { ENRICH_SLEEP_MS, USER_AGENT } (+59 more)

### Community 1 - "Frontend UI Bits"
Cohesion: 0.05
Nodes (47): askRAG(), CountUp(), isLaunchWindow(), SplitText(), SpotlightCard(), StarBorder(), AccordionGallery(), DEFAULT_ITEMS (+39 more)

### Community 2 - "Frontend API Client"
Cohesion: 0.07
Nodes (48): key(), react, apiRequest(), classifyInstitution(), escapeRegExp(), fetchPatents(), fetchResearches(), getAllPatents() (+40 more)

### Community 3 - "Patent RAG Ingestion"
Cohesion: 0.09
Nodes (27): createEmbedding(), ai, pool, ingestPatents(), ingestResearch(), cleanPatentData(), createPatent(), savePatent() (+19 more)

### Community 4 - "Patent RAG Dependencies"
Cohesion: 0.06
Nodes (32): @google/genai, @langchain/community, @langchain/core, @langchain/google-genai, author, dependencies, cors, dotenv (+24 more)

### Community 5 - "Backend Read API"
Cohesion: 0.15
Nodes (19): fetchPatent(), fetchResearch(), getPatent(), getRecords(), patentsUploaded(), recordsUploaded(), app, pool (+11 more)

### Community 6 - "Scraping Server App"
Cohesion: 0.12
Nodes (26): createApp(), express, { reconcileFilenames }, getHealth(), getRecord(), landing(), listRecords(), { load, getById } (+18 more)

### Community 7 - "Backend Package Config"
Cohesion: 0.07
Nodes (28): author, dependencies, body-parser, cookie-parser, cors, dotenv, express, pg (+20 more)

### Community 8 - "Frontend Build Config"
Cohesion: 0.07
Nodes (26): devDependencies, oxlint, puppeteer-core, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, vite (+18 more)

### Community 9 - "Frontend App Pages"
Cohesion: 0.10
Nodes (16): AIChatPage, App(), AppShell(), curtainLabelFor(), EcosystemPage, HelpPage, HomePage, PageViewTransition() (+8 more)

### Community 10 - "Scraping Config Jobs"
Cohesion: 0.13
Nodes (21): getDateOpts(), getRecordsDir(), INTERVAL_MIN, path, PORT, QUERIES, { createApp }, { PORT } (+13 more)

### Community 11 - "Patent RAG Server"
Cohesion: 0.15
Nodes (10): app, ingestPatentDocuments, ingestResearchDocuments, query, errorHandler(), router, router, ApiError (+2 more)

### Community 12 - "Frontend UI Dependencies"
Cohesion: 0.11
Nodes (19): dependencies, gsap, @gsap/react, jspdf, lenis, lucide-react, motion, @paper-design/shaders-react (+11 more)

### Community 13 - "Scraping Package Manifest"
Cohesion: 0.15
Nodes (12): dependencies, express, description, express, main, name, scripts, auto (+4 more)

### Community 14 - "Project Docs Monorepo"
Cohesion: 0.29
Nodes (8): Fetch enrich prune intelligence pipeline, MINERALIS AI HTML entry page, React Vite template setup, Backend Express read API, Frontend React Vite UI, mineral intel-node live fetcher and offline pipeline, MINERALIS Smart Technology and Patent Tracker platform, Patent RAG Q and A and ingestion service

### Community 15 - "Lint Config"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 16 - "Icon Sprite Set"
Cohesion: 0.29
Nodes (7): Bluesky Icon Symbol, Discord Icon Symbol, Documentation Icon Symbol, GitHub Icon Symbol, SVG Icon Sprite, Social Icon Symbol, X Icon Symbol

### Community 18 - "OpenCode Plugin"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

## Knowledge Gaps
- **186 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `name`, `version`, `description` (+181 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PatentExplorerPage()` connect `Frontend API Client` to `Scraping Fetch Enrich`, `Frontend UI Bits`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `patents()` connect `Scraping Fetch Enrich` to `Frontend API Client`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `react` connect `Frontend UI Bits` to `Frontend App Pages`, `Frontend API Client`, `Lint Config`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `name` to the rest of the system?**
  _186 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Scraping Fetch Enrich` be split into smaller, more focused modules?**
  _Cohesion score 0.05679974034404414 - nodes in this community are weakly interconnected._
- **Should `Frontend UI Bits` be split into smaller, more focused modules?**
  _Cohesion score 0.05473684210526316 - nodes in this community are weakly interconnected._
- **Should `Frontend API Client` be split into smaller, more focused modules?**
  _Cohesion score 0.06734006734006734 - nodes in this community are weakly interconnected._