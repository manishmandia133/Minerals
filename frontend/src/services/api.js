// API Client integrating with mineral_intel-node backend
// Endpoints: GET /records, POST /fetch, GET /health

import { PATENT_RECORDS } from '../data/mineralsData';

const BASE_URL = '/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: !!data.ok };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

export async function fetchBackendRecords(limit = 100) {
  try {
    const res = await fetch(`${BASE_URL}/records?limit=${limit}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { success: true, total: data.total, records: data.records || [] };
  } catch (err) {
    return { success: false, error: err.message, records: PATENT_RECORDS };
  }
}

export async function triggerBackendFetch(query, patentPages = 2, indiaOnly = true) {
  try {
    const res = await fetch(`${BASE_URL}/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        patent_pages: patentPages,
        india_only: indiaOnly,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
