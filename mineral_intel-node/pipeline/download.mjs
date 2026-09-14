// Task 1: download the two Kaggle datasets into data/raw/ using axios +
// the Kaggle public API. Auth via KAGGLE_USERNAME / KAGGLE_KEY env vars
// (same credentials as kaggle.json).
// Kaggle API docs: https://github.com/Kaggle/kaggle-api/blob/main/docs/README.md
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const DATASETS = [
  'aryansingh0909/indian-patent-dataset',
  'aryansingh0909/weekly-patent-application-granted',
];

function auth() {
  const { KAGGLE_USERNAME, KAGGLE_KEY } = process.env;
  if (!KAGGLE_USERNAME || !KAGGLE_KEY) {
    throw new Error('Set KAGGLE_USERNAME and KAGGLE_KEY env vars (from kaggle.com Settings > API > Create New Token).');
  }
  return { username: KAGGLE_USERNAME, password: KAGGLE_KEY };
}

async function downloadDataset(slug, rawDir) {
  const url = `https://www.kaggle.com/api/v1/datasets/download/${slug}`;
  console.log(`[download] GET ${url}`);
  const res = await axios.get(url, { auth: auth(), responseType: 'arraybuffer', maxRedirects: 5, timeout: 120000 });
  const name = slug.split('/')[1];
  const zipPath = path.join(rawDir, `${name}.zip`);
  fs.writeFileSync(zipPath, Buffer.from(res.data));
  console.log(`[download] saved ${(res.data.byteLength / 1048576).toFixed(1)} MB -> ${zipPath}`);
  try {
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', rawDir]);
    console.log(`[download] unzipped into ${rawDir}`);
  } catch {
    console.warn('[download] `unzip` not available — leaving the .zip; extract it into data/raw/ manually.');
  }
}

export async function downloadAll(rawDir) {
  fs.mkdirSync(rawDir, { recursive: true });
  for (const slug of DATASETS) await downloadDataset(slug, rawDir);
  console.log('[download] done. CSVs in data/raw/:', fs.readdirSync(rawDir).filter((f) => f.endsWith('.csv')));
}
