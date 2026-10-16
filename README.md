# Dakhla — University Admission Tracker

**One-line description:** A mobile-first web app that helps Pakistani students track university admission deadlines, compare fees, calculate their merit aggregate, manage application documents, and spot admission scams.

Live demo: https://abbasmomand98-jpg.github.io/dakhla-admission-tracker/
Repo: https://github.com/abbasmomand98-jpg/dakhla-admission-tracker

## Features

- **Home** — greeting, live search across all universities, and deadline countdown cards sorted by nearest deadline with urgency progress bars
- **Universities** — browse all 12 universities with Public/Private filters; tap any card for the full detail view
- **University detail** — application fee, semester fee, 2025 closing merits per program, days-left counter, ★ shortlist toggle (saved in localStorage), and a "Start application" portal note
- **Merit calculator** — enter Intermediate % and entry-test % → aggregate compared against every shortlisted university's 2025 closing merit with verdict chips ("Above closing merit ✓", "Within 2% — borderline", "Below — risky")
- **Checklist** — 6-document application checklist with a progress ring (persisted in localStorage) plus per-shortlisted-university readiness state
- **Fee comparison** — application + semester fee table for your shortlist with a total-application-cost calculator
- **Scam Shield** — interactive red-flag checker (SAFE / CAUTION / SCAM verdicts) plus a static "verified channels" list
- Fully offline — no network calls, no frameworks, no build step

## Tech

Pure HTML, CSS, and vanilla JavaScript in four files:

| File | What it does |
|---|---|
| `index.html` | Page skeleton: header, five views, tab bar, portal modal |
| `style.css` | Mobile-first styles (rose accent, 480px app column, bottom tab bar) |
| `data.js` | All content: 12 universities, documents, scam flags, verified channels |
| `logic.js` | Pure functions: aggregate math, countdown, verdicts, fee totals — no DOM |
| `app.js` | UI layer: renders views and wires every button |
| `test.js` | Node smoke test for the pure logic (40 assertions) |

## How to run locally

No build tools needed — the app is fully static:

```bash
# Option 1: just open the file
open index.html        # macOS
xdg-open index.html    # Linux

# Option 2: serve it (recommended, so localStorage behaves like production)
python3 -m http.server 8080
# then visit http://localhost:8080
```

To run the logic tests: `node test.js` (40 assertions, all must pass).

## How it works

**Data model.** Everything lives in `data.js` as plain arrays of objects. Each university is one object: `id`, `name`, `city`, `sector` (Public/Private), `appFee` and `semesterFee` (PKR), `deadline` (ISO `YYYY-MM-DD`), `portal` (official site, shown as text — the app makes no network calls), `csMerit` (2025 closing aggregate for BS CS, or `null` when admission is test-based like AKU's MBBS), and a `programs` list with per-program merits. Updating a fee or deadline means editing one line in one file.

**Aggregate formula.** Most Pakistani universities compute BS admission merit as:

```
aggregate = 0.5 × Intermediate % + 0.5 × entry-test %
```

`calcAggregate()` in `logic.js` validates both inputs (empty, non-numeric, or outside 0–100 → rejected) and returns the aggregate rounded to 2 decimals.

**Countdown math.** `daysLeft()` parses the deadline as local midnight, subtracts today's local midnight, and converts to whole days: `0` = closes today, `-1` = closed yesterday. The `now` date is injectable so tests get deterministic results. The home screen sorts universities by this number and draws urgency bars showing how much of a 30-day warning window has elapsed.

**Verdict bands.** `meritVerdict()` compares your aggregate with a university's 2025 closing merit: at or above → safe chip; up to 2 points below → borderline; more than 2 below → risky. A `null` closing merit (test-based admissions) returns "not applicable" instead of a misleading number.

**Persistence.** The shortlist and checklist live in `localStorage` (`dakhla_shortlist_v1`, `dakhla_checklist_v1`) — they survive reloads with zero backend. On load, shortlist ids are validated against the data so stale entries can't break rendering.

**Scam Shield.** Ticking red-flag statements counts warnings: 0 → SAFE, 1–2 → CAUTION, 3+ → SCAM, each with a plain-language explanation of what to do next.

## What you can learn from this project

- **Separation of concerns in vanilla JS:** data (`data.js`), pure logic (`logic.js`), and UI (`app.js`) — each testable and editable on its own
- **Writing testable code:** pure functions (same input → same output, no DOM) so a Node test suite can cover every boundary
- **localStorage persistence patterns:** load → validate → render, and save on every change
- **Date math done right:** normalize to local midnights before subtracting to avoid off-by-one timezone bugs
- **Safe rendering:** build DOM nodes with `textContent` so user input (search queries) can never become executable markup
- **SVG progress ring:** one `<circle>` + `stroke-dashoffset` math (`2πr × (1 − progress)`)
- **Mobile-first layout:** a centered 480px app column with a fixed bottom tab bar that stays pinned on desktop via media query
- **Verdict/banding logic:** turning a numeric comparison into human-friendly chips with explicit boundary rules

## Fork it and make it yours

This pattern — a deadline countdown + comparison + checklist + safety guide — fits dozens of local problems: scholarship deadlines, government job applications, matric/inter board exam prep, polio-vaccination drives, Hajj application tracking. Fork the repo, swap the `UNIVERSITIES` array in `data.js` for your own dataset (scholarships, jobs, exams…), adjust the fees/merits to your fields, and ship it for your community. 🚀
