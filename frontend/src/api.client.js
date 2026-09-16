const RAG_API_URL = import.meta.env.VITE_RAG_API_URL;

// POST /api/v1/query/ask
// body: { question: string, history?: { role: 'user'|'assistant', content: string }[] }
export async function askRAG({ question, history }) {
    const response = await fetch(`${RAG_API_URL}/api/v1/query/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question,
            ...(history && history.length > 0 ? { history } : {}),
        }),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`RAG API error: ${response.status} - ${error}`);
    }
    return await response.json();
}

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;


/// Generic helper for API requests
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${BACKEND_API_URL}/api${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const responseText = await response.text();

    if (!response.ok) {
        throw new Error(
            `API error: ${response.status} - ${responseText}`
        );
    }

    return responseText ? JSON.parse(responseText) : null;
}

// ==================== PATENTS ====================

// GET /patents
export async function getAllPatents() {
    return apiRequest("/patents");
}

// GET /patents/mineral/:mineral
export async function getPatentsByMineral(mineral) {
    return apiRequest(
        `/patents/mineral/${encodeURIComponent(mineral)}`
    );
}

// GET /patents/year/:year
export async function getPatentsByYear(year) {
    return apiRequest(`/patents/year/${year}`);
}

// POST /patents/fetch
export async function fetchPatents(data) {
    return apiRequest("/patents/fetch", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

// ==================== RESEARCH ====================

// GET /researches
export async function getAllResearches() {
    return apiRequest("/researches");
}

// GET /researches/mineral/:mineral
export async function getResearchesByMineral(mineral) {
    return apiRequest(
        `/researches/mineral/${encodeURIComponent(mineral)}`
    );
}

// GET /researches/year/:year
export async function getResearchesByYear(year) {
    return apiRequest(`/researches/year/${year}`);
}

// POST /researches/fetch
export async function fetchResearches(data) {
    return apiRequest("/researches/fetch", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

// ==================== MINERAL CANONICALIZATION ====================
// The DB stores the same mineral under many variants ("Cobalt", "cobalt",
// "Co", "cobalt (battery grade)" ...). Canonicalize to one display name so
// grouping/counting/filtering is case- and symbol-insensitive everywhere.
// Single-character symbols ("Co", "C", ...) only match on exact equality
// so "Si" never fires inside "silicon", etc.
const MINERAL_CANONICAL = [
    ["Lithium", ["lithium", "li", "li-ion", "li ion", "lithium-ion", "lithium ion", "spodumene"]],
    ["Rare Earth Elements (REE)", ["rare earth elements (ree)", "rare earth elements", "rare earth element", "rare earths", "rare earth", "rare-earth", "ree", "nd/dy", "nd", "dy", "neodymium", "dysprosium", "ndfeb", "monazite"]],
    ["Cobalt", ["cobalt", "co"]],
    ["Graphite & Graphene", ["graphite & graphene", "graphite and graphene", "graphite", "graphene", "spherical graphite", "c"]],
    ["Titanium", ["titanium", "ti", "ilmenite"]],
    ["Gallium", ["gallium", "ga", "gan"]],
    ["Nickel", ["nickel", "ni"]],
    ["Silicon (Polysilicon)", ["silicon (polysilicon)", "silicon", "polysilicon", "si"]],
];

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeMineralName(value) {
    if (value == null) return "";
    const cleaned = String(value).trim().toLowerCase().replace(/\s+/g, " ");
    if (!cleaned) return "";

    // 1. Exact match against canonical names + aliases ("Co" -> Cobalt).
    for (const [canonical, aliases] of MINERAL_CANONICAL) {
        if (cleaned === canonical.toLowerCase()) return canonical;
        if (aliases.includes(cleaned)) return canonical;
    }

    // 2. Strip parenthetical qualifiers ("cobalt (battery grade)") and retry.
    const stripped = cleaned
        .replace(/\s*\(.*?\)\s*/g, " ")
        .trim()
        .replace(/\s+/g, " ");
    if (stripped && stripped !== cleaned) {
        for (const [canonical, aliases] of MINERAL_CANONICAL) {
            if (stripped === canonical.toLowerCase()) return canonical;
            if (aliases.includes(stripped)) return canonical;
        }
    }

    // 3. Word/phrase containment for multi-char aliases
    // ("lithium-ion batteries" -> Lithium). Single-char symbols skipped.
    const haystacks = [cleaned, stripped].filter(Boolean);
    for (const [canonical, aliases] of MINERAL_CANONICAL) {
        const longestFirst = [...aliases].sort((a, b) => b.length - a.length);
        for (const alias of longestFirst) {
            if (alias.length < 2) continue;
            const re = new RegExp(`\\b${escapeRegExp(alias)}\\b`);
            if (haystacks.some((h) => re.test(h))) return canonical;
        }
    }

    // 4. Fallback: title-case so at least case variants merge
    // ("cobalt" -> "Cobalt").
    return cleaned.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

// ==================== NORMALIZERS ====================
// Backend DB rows -> the record shapes the explorer pages render.
// Fields with no backend equivalent (TRL, citations, IPC, impact factor)
// get neutral defaults so existing filters/sorts keep working.

// ApiResponse wrapper is { statusCode, data, message, success } —
// unwrap to a plain array regardless of envelope.
export function unwrapList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.records)) return payload.records;
    return [];
}

function toArray(value) {
    if (Array.isArray(value)) {
        return value
            .filter((x) => x != null && String(x).trim() !== "")
            .map((x) => String(x).trim());
    }
    if (value == null) return [];
    const s = String(value).trim();
    if (!s) return [];
    // Postgres array literal "{a,b}" -> [a, b]
    if (s.startsWith("{") && s.endsWith("}")) {
        return s
            .slice(1, -1)
            .split(",")
            .map((x) => x.trim().replace(/^"|"$/g, ""))
            .filter(Boolean);
    }
    return [s];
}

function toISODate(value) {
    if (!value) return "";
    try {
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return "";
        return d.toISOString().slice(0, 10);
    } catch {
        return "";
    }
}

// patents table: id, external_id, source, title, abstract, full_text,
// publication_number, publication_date, filing_date, applicants,
// inventors, organisation, mineral, technology_area, status,
// source_url, created_at
export function normalizePatent(row = {}, index = 0) {
    const applicants = toArray(row.applicants);
    const inventors = toArray(row.inventors);
    return {
        id: row.id ?? row.external_id ?? row.publication_number ?? `patent-${index}`,
        publicationNumber:
            row.publication_number || row.external_id || `IN-PATENT-${row.id ?? index}`,
        title: row.title || "Untitled mineral patent",
        mineral: normalizeMineralName(row.mineral) || "Critical mineral",
        category: row.technology_area || "Upstream Extraction",
        applicant: row.organisation || applicants[0] || "Indian applicant",
        inventors:
            inventors.length > 0
                ? inventors
                : applicants.length > 0
                    ? applicants
                    : ["Principal investigator"],
        filingDate:
            toISODate(row.filing_date || row.publication_date || row.created_at) ||
            "2024-01-01",
        grantStatus: row.status || "Indian patent",
        ipcCodes: [],
        trl: 5,
        citations: 0,
        abstract: row.abstract || row.full_text || "Abstract pending.",
        sourceUrl: row.source_url || "https://ipindiaservices.gov.in/publicsearch",
    };
}

// research_documents table: id, title, document_type, abstract,
// organisation, researchers, mineral, technology_area, source,
// publication_year, source_url, created_at
export function normalizeResearch(row = {}, index = 0) {
    const researchers = toArray(row.researchers);
    const yearNum = Number(row.publication_year);
    let year = Number.isFinite(yearNum) && yearNum > 0 ? yearNum : 0;
    if (!year && row.created_at) {
        const d = new Date(row.created_at);
        if (!Number.isNaN(d.getTime())) year = d.getFullYear();
    }
    const mineral = normalizeMineralName(row.mineral) || "Critical mineral";
    const techArea = row.technology_area || "";
    const keywords = [...new Set([mineral, techArea].filter(Boolean))];
    return {
        id: row.id ?? `research-${index}`,
        title: row.title || "Untitled research publication",
        mineral,
        domain: techArea || mineral,
        journal: row.source || "Indian Scientific Corpus",
        year,
        doi: "",
        authors: researchers.length > 0 ? researchers : ["Contributing researchers"],
        institution: row.organisation || "Indian research institution",
        institutionType: classifyInstitution(row.organisation),
        trl: 5,
        citations: 0,
        abstract: row.abstract || "Abstract pending.",
        keywords: keywords.length > 0 ? keywords : ["Critical minerals"],
        openAccessUrl: row.source_url || "",
        impactFactor: null,
    };
}

// Maps an organisation name onto the institution-category labels the
// Research Explorer filter matches with substring search
// ('csir' | 'iit' | 'psu' | 'corporate').
export function classifyInstitution(name = "") {
    const v = String(name || "").toLowerCase();
    if (/csir/.test(v)) return "CSIR National Laboratories";
    if (/iit|iisc|nit\b|university|college|institute of technology|academ/.test(v))
        return "IITs & Academia";
    if (/barc|irel|isro|drdo|\bpsu\b|nalco|ongc| sail|nmdc|moil|hindustan copper|midhani|dmrl/.test(v))
        return "Strategic PSUs & DAE";
    if (/tata|reliance|vedanta|hindalco|lodha|ola|ather|\bltd\b|limited|private|corporate|industr|labs|cleantech/.test(v))
        return "Corporate & Industrial R&D";
    return "Research Institution";
}

// Live fetchers — resolve to normalized arrays, throw on transport errors
// so pages can fall back to cached dummy data.
export async function getPatentsLive() {
    const payload = await getAllPatents();
    return unwrapList(payload).map((r, i) => normalizePatent(r, i));
}

export async function getResearchesLive() {
    const payload = await getAllResearches();
    return unwrapList(payload).map((r, i) => normalizeResearch(r, i));
}
