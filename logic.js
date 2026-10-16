/* ---------------------------------------------------------------------------
 * logic.js — Dakhla Admission Tracker (pure logic, NO DOM code)
 *
 * These functions take plain values in and return plain values out, so they
 * are trivial to test in Node without a browser. The UI in app.js calls them.
 *
 * Aggregate formula used by most Pakistani universities for BS admissions:
 *     aggregate = 50% Intermediate marks + 50% entry-test score
 * -------------------------------------------------------------------------*/

/**
 * Parse one percentage field (0–100). Returns the number, or null when the
 * input is empty, non-numeric, or out of range. Empty and invalid are
 * deliberately both null so the UI can show one friendly message.
 */
function parsePercent(raw) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (s === '') return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 100) return null;
  return n;
}

/**
 * Merit aggregate: 0.5 * Intermediate% + 0.5 * entry-test%.
 * Returns null if either input is missing/invalid, otherwise the aggregate
 * rounded to 2 decimals.
 */
function calcAggregate(intermediateRaw, testRaw) {
  const inter = parsePercent(intermediateRaw);
  const test = parsePercent(testRaw);
  if (inter === null || test === null) return null;
  return Math.round((0.5 * inter + 0.5 * test) * 100) / 100;
}

/**
 * Whole days from `now` until a 'YYYY-MM-DD' deadline.
 *  0  → deadline is today
 *  1  → tomorrow
 * -n  → n days past the deadline
 * `now` is injectable so tests (and the UI) get deterministic results.
 */
function daysLeft(deadlineStr, now) {
  const current = now instanceof Date ? now : new Date();
  const parts = String(deadlineStr).split('-').map(Number);
  const deadline = new Date(parts[0], parts[1] - 1, parts[2]); // local midnight
  const startOfToday = new Date(
    current.getFullYear(), current.getMonth(), current.getDate()
  );
  return Math.round((deadline - startOfToday) / 86400000);
}

/**
 * Compare a student's aggregate against a university's 2025 closing merit.
 * Verdict bands:
 *   aggregate >= closing            → 'above'    ("Above closing merit ✓")
 *   0 < closing - aggregate <= 2    → 'borderline' ("Within 2% — borderline")
 *   closing - aggregate > 2         → 'risky'    ("Below — risky")
 * Special: aggregate null → 'empty'; closing null → 'na' (not applicable).
 */
function meritVerdict(aggregate, closingMerit) {
  if (aggregate === null || aggregate === undefined || Number.isNaN(aggregate)) {
    return { key: 'empty', label: 'Enter both percentages' };
  }
  if (closingMerit === null || closingMerit === undefined) {
    return { key: 'na', label: 'No merit data — test/interview based' };
  }
  const gap = closingMerit - aggregate;
  if (gap <= 0) return { key: 'above', label: 'Above closing merit ✓' };
  if (gap <= 2) return { key: 'borderline', label: 'Within 2% — borderline' };
  return { key: 'risky', label: 'Below — risky' };
}

/**
 * Scam Shield verdict from an array of ticked flag ids (matching SCAM_FLAGS).
 * 0 flags → SAFE, 1–2 → CAUTION, 3+ → SCAM. Unknown ids are ignored.
 */
function scamVerdict(tickedIds, flags) {
  const known = new Set((flags || []).map((f) => f.id));
  const ticked = (tickedIds || []).filter((id) => known.has(id));
  const n = ticked.length;
  if (n === 0) {
    return {
      key: 'safe',
      label: 'SAFE',
      explanation: 'No red flags ticked. Keep using the official portals and bank challans, and never pay cash without a receipt.'
    };
  }
  if (n <= 2) {
    return {
      key: 'caution',
      label: 'CAUTION',
      explanation: 'You spotted ' + n + ' warning sign' + (n === 1 ? '' : 's') +
        '. Slow down, double-check everything on the official .edu.pk website, and talk to the university\u2019s admission office before paying anything.'
    };
  }
  return {
    key: 'scam',
    label: 'SCAM — walk away',
    explanation: 'You spotted ' + n + ' warning signs. This looks like an admission scam: stop the conversation, do NOT pay anything, and report the agent to the university\u2019s official helpline.'
  };
}

/**
 * Sum of application fees (PKR) for a list of university ids.
 * Unknown ids are ignored; empty list → 0.
 */
function totalApplicationCost(ids, universities) {
  const byId = {};
  (universities || []).forEach((u) => { byId[u.id] = u; });
  return (ids || []).reduce((sum, id) => {
    return sum + (byId[id] ? byId[id].appFee : 0);
  }, 0);
}

/**
 * Format a PKR amount: 5000 → "₨ 5,000". Handles 0 and negatives sanely.
 */
function formatPKR(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '₨ —';
  const grouped = String(Math.abs(Math.round(num))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (num < 0 ? '-₨ ' : '₨ ') + grouped;
}

/* Escape text before injecting into HTML — defence-in-depth even though most
 * rendering in app.js uses textContent. */
function escapeHTML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* One namespace export: works as a browser global AND a Node module. */
const Dakhla = {
  parsePercent,
  calcAggregate,
  daysLeft,
  meritVerdict,
  scamVerdict,
  totalApplicationCost,
  formatPKR,
  escapeHTML
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dakhla;
}
