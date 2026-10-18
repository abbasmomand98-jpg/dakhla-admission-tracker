/* ---------------------------------------------------------------------------
 * test.js — Node smoke test for Dakhla's pure logic (logic.js) and data.
 * Run: node test.js
 * Exits non-zero on the first failure so CI/shell scripts catch problems.
 * -------------------------------------------------------------------------*/

const data = require('./data.js');
const D = require('./logic.js');

let passed = 0;
let failed = 0;

function ok(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
    console.log('  ✓ ' + name);
  } else {
    failed++;
    console.log('  ✗ FAIL ' + name + ' → got ' + a + ', expected ' + e);
  }
}

console.log('\n--- parsePercent ---');
ok('plain number', D.parsePercent('80'), 80);
ok('empty string → null', D.parsePercent(''), null);
ok('non-numeric → null', D.parsePercent('abc'), null);
ok('above 100 → null', D.parsePercent('120'), null);
ok('negative → null', D.parsePercent('-5'), null);
ok('decimals kept', D.parsePercent('78.5'), 78.5);

console.log('\n--- calcAggregate ---');
ok('80/80 → 80', D.calcAggregate('80', '80'), 80);
ok('90/70 → 80', D.calcAggregate('90', '70'), 80);
ok('78.5/82 → 80.25', D.calcAggregate('78.5', '82'), 80.25);
ok('empty intermediate → null', D.calcAggregate('', '80'), null);
ok('out-of-range test → null', D.calcAggregate('80', '150'), null);

console.log('\n--- daysLeft (now = 2026-10-16) ---');
const now = new Date(2026, 9, 16);
ok('today → 0', D.daysLeft('2026-10-16', now), 0);
ok('tomorrow → 1', D.daysLeft('2026-10-17', now), 1);
ok('yesterday → -1', D.daysLeft('2026-10-15', now), -1);
ok('2026-12-10 → 55 (15 Oct + 30 Nov + 10 Dec)', D.daysLeft('2026-12-10', now), 55);

console.log('\n--- meritVerdict ---');
ok('exactly at closing → above', D.meritVerdict(81, 81).key, 'above');
ok('above label carries checkmark', D.meritVerdict(81, 81).label, 'Above closing merit ✓');
ok('1 below closing → borderline', D.meritVerdict(80, 81).key, 'borderline');
ok('exactly 2 below → borderline (boundary)', D.meritVerdict(79, 81).key, 'borderline');
ok('2.01 below → risky (boundary)', D.meritVerdict(78.99, 81).key, 'risky');
ok('well below → risky', D.meritVerdict(70, 81).key, 'risky');
ok('comfortably above → above', D.meritVerdict(90, 81).key, 'above');
ok('null aggregate → empty', D.meritVerdict(null, 81).key, 'empty');
ok('null closing (test-based) → na', D.meritVerdict(80, null).key, 'na');

console.log('\n--- scamVerdict ---');
const flags = data.SCAM_FLAGS;
ok('no flags → safe', D.scamVerdict([], flags).key, 'safe');
ok('1 flag → caution', D.scamVerdict(['cash'], flags).key, 'caution');
ok('2 flags → caution', D.scamVerdict(['cash', 'no-official'], flags).key, 'caution');
ok('3 flags → scam', D.scamVerdict(['guarantee', 'cash', 'no-official'], flags).key, 'scam');
ok('4 flags → scam', D.scamVerdict(flags.map(f => f.id), flags).key, 'scam');
ok('unknown flag ids ignored → safe', D.scamVerdict(['bogus-id'], flags).key, 'safe');

console.log('\n--- totalApplicationCost ---');
const unis = data.UNIVERSITIES;
ok('nust + uet-peshawar → 8000', D.totalApplicationCost(['nust', 'uet-peshawar'], unis), 8000);
ok('empty shortlist → 0', D.totalApplicationCost([], unis), 0);
ok('unknown id ignored → 0', D.totalApplicationCost(['bogus'], unis), 0);

console.log('\n--- formatPKR ---');
ok('5000 → ₨ 5,000', D.formatPKR(5000), '₨ 5,000');
ok('0 → ₨ 0', D.formatPKR(0), '₨ 0');
ok('550000 → ₨ 550,000', D.formatPKR(550000), '₨ 550,000');

console.log('\n--- data sanity ---');
ok('12 universities', unis.length, 12);
ok('6 checklist documents', data.DOCUMENTS.length, 6);
ok('4 scam flags', flags.length, 4);
ok('every university has id, deadline, appFee, semesterFee', unis.every(u =>
  typeof u.id === 'string' && typeof u.deadline === 'string' &&
  typeof u.appFee === 'number' && typeof u.semesterFee === 'number'), true);

console.log('\n====================================');
console.log('PASSED: ' + passed + '   FAILED: ' + failed);
console.log('====================================\n');
process.exit(failed === 0 ? 0 : 1);
