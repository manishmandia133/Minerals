// Normalize every raw CSV into the common schema:
// { id, title, abstract, assignee, inventor, filingDate, grantDate, ipcCpcCodes, source }
//
// Column names differ per source, so each loader maps flexibly: the first
// column whose lower-cased name contains one of the hints wins. Unknown
// columns are ignored (with a warning), missing ones become null.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const HINTS = {
  id: ['publication_number', 'publication_no', 'pub_number', 'application_number', 'application_no', 'app_number', 'patent_number', 'id'],
  title: ['title', 'invention_title'],
  abstract: ['abstract'],
  assignee: ['assignee', 'applicant'],
  inventor: ['inventor'],
  filingDate: ['filing_date', 'filingdate', 'application_date', 'filed'],
  grantDate: ['grant_date', 'granted', 'publication_date', 'published'],
  ipcCpcCodes: ['ipc', 'cpc', 'classification', 'class_code', 'codes'],
};

function pick(row, keys) {
  const lower = {};
  for (const k of Object.keys(row)) lower[k.toLowerCase().trim()] = row[k];
  for (const hint of keys) {
    for (const col of Object.keys(lower)) {
      if (col === hint || col.includes(hint)) {
        const v = lower[col];
        if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
      }
    }
  }
  return null;
}

const normDate = (v) => {
  if (!v) return null;
  const d = new Date(String(v).trim());
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  const m = String(v).match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : String(v).trim().slice(0, 10) || null;
};

const splitCodes = (v) => !v ? []
  : String(v).split(/[;|]/).flatMap((s) => s.split(',')).map((s) => s.trim()).filter(Boolean);

const splitPeople = (v) => !v ? null
  : String(v).split(/[;|]/).map((s) => s.trim()).filter(Boolean).join('; ') || null;

function normalizeRow(row, source) {
  return {
    id: pick(row, HINTS.id),
    title: (pick(row, HINTS.title) || 'Untitled').replace(/\s+/g, ' ').trim().slice(0, 1000),
    abstract: pick(row, HINTS.abstract)?.replace(/\s+/g, ' ').trim().slice(0, 5000) || null,
    assignee: splitPeople(pick(row, HINTS.assignee)),
    inventor: splitPeople(pick(row, HINTS.inventor)),
    filingDate: normDate(pick(row, HINTS.filingDate)),
    grantDate: normDate(pick(row, HINTS.grantDate)),
    ipcCpcCodes: splitCodes(pick(row, HINTS.ipcCpcCodes)),
    source,
  };
}

export function loadCsv(file) {
  const text = fs.readFileSync(file, 'utf8');
  // Strip BOM; relax quotes/columns so slightly messy Kaggle CSVs still parse.
  const rows = parse(text.replace(/^﻿/, ''), { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true, trim: true });
  return rows;
}

// Load every *.csv in rawDir. gpatents_in.csv is tagged source 'gpatents',
// everything else uses its filename (without extension) as source.
export function loadAll(rawDir) {
  const bySource = {};
  if (!fs.existsSync(rawDir)) {
    console.warn(`[normalize] raw dir missing: ${rawDir} (run: node pipeline.js --download)`);
    return bySource;
  }
  for (const f of fs.readdirSync(rawDir).filter((f) => f.toLowerCase().endsWith('.csv'))) {
    const source = path.basename(f, path.extname(f)).toLowerCase() === 'gpatents_in' ? 'gpatents' : path.basename(f, path.extname(f));
    try {
      const rows = loadCsv(path.join(rawDir, f));
      bySource[source] = rows.map((r) => normalizeRow(r, source));
      console.log(`[raw] ${source}: ${rows.length} rows <- ${f}`);
    } catch (e) {
      console.warn(`[normalize] skip ${f}: ${e.message}`);
    }
  }
  return bySource;
}
