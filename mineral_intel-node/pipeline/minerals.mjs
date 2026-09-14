// India's 30 notified critical minerals (Ministry of Mines, 2023) + common
// aliases, plus manganese (often tracked alongside). Match is a
// case-insensitive substring on "title + abstract".
export const MINERALS = {
  lithium: ['lithium', 'li-ion', 'lithia', 'spodumene', 'lepidolite'],
  cobalt: ['cobalt'],
  nickel: ['nickel'],
  'rare earth': ['rare earth', 'rare-earth', 'neodymium', 'dysprosium', 'lanthanum', 'cerium', 'yttrium', 'praseodymium', 'samarium', 'terbium', 'europium', 'gadolinium'],
  graphite: ['graphite', 'graphene'],
  manganese: ['manganese'],
  titanium: ['titanium', 'ilmenite', 'rutile'],
  copper: ['copper'],
  antimony: ['antimony'],
  beryllium: ['beryllium', 'beryl'],
  bismuth: ['bismuth'],
  gallium: ['gallium'],
  germanium: ['germanium'],
  hafnium: ['hafnium'],
  indium: ['indium'],
  molybdenum: ['molybdenum', 'molybdenite'],
  niobium: ['niobium', 'columbium'],
  'platinum group': ['platinum', 'palladium', 'pgm', 'rhodium', 'iridium', 'ruthenium', 'osmium'],
  phosphorous: ['phosphorous', 'phosphorus', 'phosphate', 'apatite'],
  potash: ['potash', 'potassium'],
  rhenium: ['rhenium'],
  silicon: ['silicon', 'polysilicon', 'quartz'],
  strontium: ['strontium', 'celestite'],
  tantalum: ['tantalum', 'tantalite'],
  tellurium: ['tellurium'],
  tin: ['tin', 'cassiterite'],
  tungsten: ['tungsten', 'wolfram', 'scheelite'],
  vanadium: ['vanadium'],
  zirconium: ['zirconium', 'zircon'],
  selenium: ['selenium'],
  cadmium: ['cadmium'],
};

// Relevant IPC/CPC class prefixes (prefix-match on ipcCpcCodes).
export const MINERAL_CODES = ['C22B', 'B03B', 'B03C', 'C01G', 'E21C', 'C22C', 'H01M'];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function hitKeyword(text, kw) {
  // Short keywords (e.g. "tin") must match whole words — otherwise
  // "heating" would match tin. Longer ones use substring match.
  if (kw.length <= 3) return new RegExp(`\\b${esc(kw)}\\b`).test(text);
  return text.includes(kw);
}

export function mineralHits(title, abstract) {
  const text = `${title || ''} ${abstract || ''}`.toLowerCase();
  return Object.entries(MINERALS)
    .filter(([, kws]) => kws.some((k) => hitKeyword(text, k)))
    .map(([name]) => name);
}

export function codeHit(ipcCpcCodes) {
  const codes = Array.isArray(ipcCpcCodes) ? ipcCpcCodes : String(ipcCpcCodes || '').split(/[;,\s|]+/);
  return codes.map((c) => c.trim().toUpperCase()).filter(Boolean)
    .some((c) => MINERAL_CODES.some((p) => c.startsWith(p)));
}

// Keep the record if a mineral keyword OR a relevant class code matches.
// Returns { keep, mineralsMatched, codeHit } for traceability.
export function isRelevant(rec) {
  const mineralsMatched = mineralHits(rec.title, rec.abstract);
  const hit = codeHit(rec.ipcCpcCodes);
  return { keep: mineralsMatched.length > 0 || hit, mineralsMatched, codeHit: hit };
}
