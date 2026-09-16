'use strict';
// Scrape a patents.google.com page (fetch + regex, no deps).
// Returns what enrich.js needs: title, abstract, authors, org, journal, doi, date, full_text.
const { HEADERS } = require('../../utils/http');

const tidy = (s, max = 0) => {
  const t = String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return max > 0 ? t.slice(0, max) : t;
};

function metaTags(html) {
  const out = {};
  const re = /<meta\s+[^>]*(?:name|property|citation_[a-z_]+|itemprop)\s*=\s*["']([^"']+)["'][^>]*content\s*=\s*["']([\s\S]*?)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html))) out[m[1].toLowerCase()] = tidy(m[2]);
  // Same, but content-first order.
  const re2 = /<meta\s+[^>]*content\s*=\s*["']([\s\S]*?)["'][^>]*(?:name|property)\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((m = re2.exec(html))) out[m[2].toLowerCase()] = tidy(m[1]);
  return out;
}

function jsonLd(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const j = JSON.parse(m[1].trim());
      for (const x of Array.isArray(j) ? j : [j]) out.push(x);
    } catch { /* skip */ }
  }
  return out;
}

function allMatches(html, re, group = 1, max = 2000) {
  const out = [];
  let m;
  while ((m = re.exec(html)) && out.length < 50) {
    const t = tidy(m[group], max);
    if (t) out.push(t);
  }
  return [...new Set(out)];
}

async function scrapePage(url) {
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  const html = await r.text();

  const meta = metaTags(html);
  const ld = jsonLd(html);
  const flatLd = Object.assign({}, ...ld.filter((x) => x && typeof x === 'object'));

  const title =
    tidy((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1], 500) ||
    meta['og:title'] || meta['twitter:title'] || meta['citation_title'] ||
    flatLd.headline || flatLd.name || url;

  const description =
    meta.description || meta['og:description'] || meta['twitter:description'] ||
    meta['citation_abstract'] || meta.abstract || flatLd.description || null;

  const citeAuthors = allMatches(html, /<meta[^>]*citation_author[^>]*content=["']([\s\S]*?)["']/gi).slice(0, 20);
  const ldAuthors = [flatLd.author].flat().filter(Boolean).map((a) =>
    typeof a === 'string' ? a : a.name).filter(Boolean);
  const authors = [...new Set([...citeAuthors, ...ldAuthors])].slice(0, 20);

  // Organisation = author affiliation evidence only. A publisher (Elsevier,
  // Google Patents, ...) is NOT the research organisation — when no affiliation
  // is found, leave it null rather than misattributing.
  const citeInstitutions = allMatches(html, /<meta[^>]*citation_author_institution[^>]*content=["']([\s\S]*?)["']/gi);
  const ldAffiliations = [flatLd.author].flat().filter(Boolean).map((a) =>
    (a && typeof a === 'object' && (a.affiliation?.name || a.affiliation)) || null).filter(Boolean);
  const organisation = citeInstitutions[0] || ldAffiliations[0] || null;

  const published_date =
    meta['citation_publication_date'] || meta['citation_online_date'] ||
    meta['article:published_time'] || flatLd.datePublished || null;

  const journal =
    meta['citation_journal_title'] || meta['og:site_name'] || null;
  const doi =
    meta['citation_doi'] || meta['dc.identifier'] || flatLd.doi || null;

  const paras = allMatches(html, /<p[^>]*>([\s\S]*?)<\/p>/gi, 1, 2000)
    .filter((p) => p.length > 40);
  const abstract = description && description.length > 40
    ? description.slice(0, 2000)
    : (paras[0] || null);

  const body = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/gi, ' ');
  const full_text = tidy(body, 20000);

  return {
    source: 'web', kind: 'research', title,
    abstract: abstract ? String(abstract).slice(0, 2000) : null,
    full_text,
    authors, organisation,
    journal, doi,
    published_date,
    source_url: url,
  };
}

module.exports = { scrapePage };
