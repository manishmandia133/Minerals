# MINERALIS — Smart Technology & Patent Tracker for Critical Minerals

AI & WebGL-powered intelligence platform tracking Indian patents, TRL readiness, and R&D activity across India's 30 notified critical minerals — for technology mapping, gap identification, and policy decisions.

> Live frontend: `https://<user>.github.io/Minerals/` (GitHub Pages) · also deployable to Vercel.

## Monorepo layout

```
.
├── frontend/             # React 19 + Vite + Tailwind v4 UI (MINERALIS)
├── backend/              # Express + pg read API for patents / research_documents (port 5000)
├── patent-rag/           # Express + Postgres + Gemini RAG Q&A + ingestion API (port 8000)
└── mineral_intel-node/   # Live fetcher (Google Patents / OpenAlex / Lens) + offline CSV pipeline
```

| Package | Purpose | Key entry points |
|---|---|---|
| `frontend` | Multi-page UI: Home, Patent Explorer, Research Explorer, Trends, Ecosystem, AI Chat, Help, Terms | `src/App.jsx`, `src/pages/`, `src/services/api.js` |
| `backend` | Simple Postgres read layer (`patents`, `research_documents` tables) | `index.js`, `src/app.js`, `src/routes/index.js` |
| `patent-rag` | RAG service: `sql` / `rag` / `gap` / `collaboration` planners over Gemini + pgvector-style retrieval | `src/index.js`, `src/rag/ragService.js`, `src/server/` |
| `mineral_intel-node` | Cron-friendly fetcher → `data/records/*.json` + Kaggle/BigQuery offline pipeline → `data/processed/` | `auto.js`, `pipeline.js`, `src/server.js` |

See `mineral_intel-node/README.md` for the full fetcher/pipeline deep-dive.

## Architecture

```
Google Patents / OpenAlex / Lens.org
        │  mineral_intel-node/auto.js --once
        ▼
data/records/*.json ──► Postgres (patents, research_documents, embeddings)
        │                        ▲  patent-rag ingestion (POST /api/v1/ingestion/…)
        │                        │  patent-rag query (POST /api/v1/query/ask, Gemini)
        ▼                        │
backend (GET /api/patents…) ◄────┘
        ▲
        │  /api proxy (vite.config.js → localhost:8000, falls back to bundled mock data)
frontend (React + Vite)
```

The frontend works offline: if the API is unreachable, `src/services/api.js` falls back to the bundled dataset in `src/data/mineralsData.js` / `researchData.js`.

## Prerequisites

- Node.js 20+
- Postgres with `patents` and `research_documents` tables (see controllers for column lists)
- Optional: `GEMINI_API_KEY`, `LENS_TOKEN`, Kaggle / BigQuery creds (see below)

## Quickstart

```bash
# 1. Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev          # build: npm run build · preview: npm run preview · lint: npm run lint

# 2. Backend read API (http://localhost:5000)
cd ../backend
npm install
# set DATABASE_URL or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME in .env
npm run dev          # prod: npm start
curl localhost:5000/api/patents | head -c 300

# 3. RAG Q&A + ingestion API (http://localhost:8000)
cd ../patent-rag
npm install
# set DATABASE_URL and GEMINI_API_KEY in .env
npm run dev
curl -X POST localhost:8000/api/v1/query/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"lithium extraction patents in India?"}'

# 4. Live mineral-intel fetcher
cd ../mineral_intel-node
npm install
npm start              # API on http://localhost:8000
node auto.js --once    # single fetch → enrich → prune → pipeline cycle
```

> Ports collide by design: `mineral_intel-node` and `patent-rag` both default to `8000`. Run only one at a time, or set `PORT=` to override. The Vite dev proxy (`frontend/vite.config.js`) forwards `/api` → `http://localhost:8000` with a 503-offline fallback.

## Environment variables

| Var | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` or `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME` | `backend`, `patent-rag` | Postgres connection |
| `PORT` | all services | `backend` default `5000`, others default `8000` |
| `GEMINI_API_KEY` | `patent-rag` | Embeddings + answer generation |
| `LENS_TOKEN` | `mineral_intel-node` | Lens.org patent search (skipped if missing) |
| `OPENALEX_MAILTO` | `mineral_intel-node` | OpenAlex polite pool (higher rate limit) |
| `QUERIES`, `INTERVAL_MIN`, `RECORDS_DIR`, `RAW_DIR`, `OUT_DIR` | `mineral_intel-node/auto.js` | Fetch loop tuning |
| `KAGGLE_USERNAME/KAGGLE_KEY`, `GOOGLE_APPLICATION_CREDENTIALS` | `mineral_intel-node/pipeline` | Offline CSV sources |

No `.env` files are committed — copy the vars above into a local `.env` per package.

## API reference

**backend** (`GET /api/…`, wrapped in `{ statusCode, data, message, success }`):

- `GET /api/patents` · `GET /api/patents/mineral/:mineral` · `GET /api/patents/year/:year`
- `GET /api/researches` · `GET /api/researches/mineral/:mineral` · `GET /api/researches/year/:year`
- `GET /test-db` — Postgres connectivity check

**patent-rag**:

- `POST /api/v1/query/ask` — `{ question, history? }` → `{ answer, sources, resolvedQuestion, response_type, chart_type }`
- `POST /api/v1/ingestion/research` · `POST /api/v1/ingestion/patents` — upsert documents + embeddings

**mineral_intel-node**:

- `POST /fetch` (alias `/ingest`) — `{ query, patent_pages?, research?, india_only?, lens?, lens_token?, records?[] }` → `{ ok, received, inserted, duplicates, renamed, enriched }`
- `GET /records?limit=100` · `GET /records/:id` · `GET /health` · `GET /`

## Scripts

| Package | Command | What it does |
|---|---|---|
| `frontend` | `npm run dev / build / preview / lint` | Vite dev, build, preview, oxlint |
| `backend` | `npm run dev / start` | nodemon / node `index.js` |
| `patent-rag` | `npm run dev / start` | nodemon / node `src/index.js` |
| `mineral_intel-node` | `npm start / run auto / run pipeline / run download / test` | API, `--once` cycle, `--refresh`, `--download`, offline tests |

## Deployment

- **Frontend → GitHub Pages:** push to `main` triggers `.github/workflows/deploy.yml` (builds `frontend/`, publishes `frontend/dist`). Requires Pages source = "GitHub Actions". Base path is `/Minerals/` off Vercel, `/` on Vercel (see `vite.config.js`).
- **Frontend → Vercel:** import `frontend/`; SPA fallback configured in `vercel.json`.
- **APIs:** deploy `backend` / `patent-rag` anywhere Node runs; set `DATABASE_URL` (+ `GEMINI_API_KEY` for RAG) and point the frontend proxy / `BASE_URL` at them.

## Tech stack

- Frontend: React 19, React Router 7, Vite 8, Tailwind CSS 4, GSAP, Motion, Lenis, Lucide
- Backend: Express 5, `pg`, `cors`, `body-parser`, `cookie-parser`
- RAG: Express 5, LangChain (`@langchain/core`, `@langchain/community`, `@langchain/google-genai`), `@google/genai`, Postgres
- Intel: Express 4, Node built-in `fetch`, `csv-parse`, `fuzzball`, `parquetjs`, BigQuery, axios
