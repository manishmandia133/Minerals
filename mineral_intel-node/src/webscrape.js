'use strict';
// Standalone web scraper — no dependencies, uses built-in fetch + regex.
// Given any source_url, pulls as much info as possible:
// title, description, authors, dates, abstract, headings, text, links, images.
//
//   const { scrapePage } = require('./webscrape');
//   const page = await scrapePage('https://patents.google.com/patent/IN.../en');
const HEADERS = { 'User-Agent': 'mineral-intel/1.0' };

const tidy = (s, max = 0) => {
  const t = String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return max > 0 ? t.slice(0, max) : t;
};

function metaTags(html) {
  // name="..." content="..."  +  property="..." content="..."
  const out = {};
  const re = /<meta\s+[^>]*(?:name|property|citation_[a-z_]+|itemprop)\s*=\s*["']([^"']+)["'][^>]*content\s*=\s*["']([\s\S]*?)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html))) out[m[1].toLowerCase()] = tidy(m[2]);
  // reversed attribute order: content first, name second
  const re2 = /<meta\s+[^>]*content\s*=\s*["']([\s\S]*?)["'][^>]*(?:name|property)\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((m = re2.exec(html))) out[m[2].toLowerCase()] = tidy(m[1]);
  return out;
}

function jsonLd(html) {
  // <script type="application/ld+json">...</script> blocks -> objects
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const j = JSON.parse(m[1].trim());
      for (const x of Array.isArray(j) ? j : [j]) out.push(x);
    } catch { /* skip invalid blocks */ }
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

  const keywords = meta.keywords || null;
  const canonical = (html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1] || null;
  const language = (html.match(/<html[^>]*lang=["']([^"']+)["']/i) || [])[1] || null;

  // Authors: citation_author meta, ld+json author, byline patterns
  const citeAuthors = allMatches(html, /<meta[^>]*citation_author[^>]*content=["']([\s\S]*?)["']/gi).slice(0, 20);
  const ldAuthors = [flatLd.author].flat().filter(Boolean).map((a) =>
    typeof a === 'string' ? a : a.name).filter(Boolean);
  const authors = [...new Set([...citeAuthors, ...ldAuthors])].slice(0, 20);

  // Dates: citation dates, article meta, ld+json
  const published_date =
    meta['citation_publication_date'] || meta['citation_online_date'] ||
    meta['article:published_time'] || flatLd.datePublished || null;
  const updated_date =
    meta['article:modified_time'] || flatLd.dateModified || null;

  const journal =
    meta['citation_journal_title'] || meta['og:site_name'] || null;
  const doi =
    meta['citation_doi'] || meta['dc.identifier'] || flatLd.doi || null;
  const publisher =
    meta['citation_publisher'] || meta['og:site_name'] || flatLd.publisher?.name || null;

  // Abstract: prefer citation_abstract / description, else first long paragraph
  const paras = allMatches(html, /<p[^>]*>([\s\S]*?)<\/p>/gi, 1, 2000)
    .filter((p) => p.length > 40);
  const abstract = description && description.length > 40
    ? description.slice(0, 2000)
    : (paras[0] || null);

  const headings = allMatches(html, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, 1, 300).slice(0, 30);

  const body = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/gi, ' ');
  const full_text = tidy(body, 20000);

  // Images (og:image + <img src>) and outlinks, resolved to absolute URLs
  const images = [...new Set([
    ...(meta['og:image'] ? [meta['og:image']] : []),
    ...allMatches(html, /<img[^>]*src=["']([^"']+)["']/gi, 1).slice(0, 20),
  ])].slice(0, 20).map((u) => { try { return new URL(u, url).href; } catch { return null; } }).filter(Boolean);

  const links = [...new Set(
    allMatches(html, /<a[^>]*href=["'](https?:\/\/[^"']+)["']/gi, 1).slice(0, 50),
  )];

  return {
    source: 'web', kind: 'research', title,
    abstract: abstract ? String(abstract).slice(0, 2000) : null,
    full_text,
    authors, organisation: publisher,
    journal, doi,
    published_date, updated_date,
    keywords, language, canonical_url: canonical,
    headings, images, links,
    source_url: url,
  };
}

module.exports = { scrapePage };
