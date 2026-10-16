/* ---------------------------------------------------------------------------
 * app.js — Dakhla Admission Tracker (UI layer)
 *
 * Wires up every view. All math/verdicts come from logic.js (Dakhla.*);
 * this file only touches the DOM. State is persisted in localStorage:
 *   dakhla_shortlist_v1  → ["nust", "fast-islamabad", ...]
 *   dakhla_checklist_v1  → { domicile: true, bform: false, ... }
 *
 * LEARNING NOTE: user-controlled text (search queries) is never injected
 * with innerHTML — we build nodes and set textContent, so nothing a user
 * types can become executable markup.
 * -------------------------------------------------------------------------*/
(function () {
  'use strict';

  /* ---------------- state ---------------- */
  var LS_SHORTLIST = 'dakhla_shortlist_v1';
  var LS_CHECKLIST = 'dakhla_checklist_v1';

  function loadShortlist() {
    try {
      var arr = JSON.parse(localStorage.getItem(LS_SHORTLIST) || '[]');
      // Drop ids that no longer exist in data (defensive)
      var valid = {};
      UNIVERSITIES.forEach(function (u) { valid[u.id] = true; });
      return arr.filter(function (id) { return valid[id]; });
    } catch (e) { return []; }
  }

  function loadChecklist() {
    try {
      return JSON.parse(localStorage.getItem(LS_CHECKLIST) || '{}') || {};
    } catch (e) { return {}; }
  }

  var shortlist = loadShortlist();
  var checklist = loadChecklist();
  var sectorFilter = 'all';   // 'all' | 'Public' | 'Private'

  function saveShortlist() { localStorage.setItem(LS_SHORTLIST, JSON.stringify(shortlist)); }
  function saveChecklist() { localStorage.setItem(LS_CHECKLIST, JSON.stringify(checklist)); }

  function uniById(id) {
    for (var i = 0; i < UNIVERSITIES.length; i++) {
      if (UNIVERSITIES[i].id === id) return UNIVERSITIES[i];
    }
    return null;
  }

  /* ---------------- tiny DOM helpers ---------------- */
  function $(id) { return document.getElementById(id); }

  // el('div', 'card', 'some text') → a DOM node with textContent set safely
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  /* ---------------- navigation ---------------- */
  var currentView = 'view-home';

  function showView(viewId) {
    currentView = viewId;
    var views = document.querySelectorAll('.view');
    views.forEach(function (v) { v.classList.toggle('active', v.id === viewId); });
    var tabs = document.querySelectorAll('.tabbar .tab');
    tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-view') === viewId); });
    window.scrollTo(0, 0);
    // Re-render dynamic views when shown (data may have changed elsewhere)
    if (viewId === 'view-checklist') renderChecklist();
    if (viewId === 'view-more') { renderFees(); renderScamFlags(); }
  }

  document.querySelectorAll('.tabbar .tab').forEach(function (tab) {
    tab.addEventListener('click', function () { showView(tab.getAttribute('data-view')); });
  });
  $('back-btn').addEventListener('click', function () { showView('view-universities'); });

  /* ---------------- shared render: one university card ---------------- */
  function deadlinePill(uni) {
    var days = Dakhla.daysLeft(uni.deadline);
    var pill = el('span', 'deadline-pill');
    if (days < 0) {
      pill.classList.add('passed');
      pill.textContent = 'Deadline passed';
    } else if (days <= 7) {
      pill.classList.add('urgent');
      pill.textContent = days === 0 ? 'Closes today!' : days + ' day' + (days === 1 ? '' : 's') + ' left';
    } else {
      pill.textContent = days + ' days left';
    }
    return pill;
  }

  function uniCard(uni) {
    var card = el('div', 'card uni');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    var isShortlisted = shortlist.indexOf(uni.id) !== -1;

    var name = el('div', 'name', uni.name);
    card.appendChild(name);

    var meta = el('div', 'meta', uni.city + '  •  ' + uni.sector + '  •  closes ' + uni.deadline);
    card.appendChild(meta);

    var row = el('div', 'row space-between');
    row.appendChild(deadlinePill(uni));
    if (isShortlisted) row.appendChild(el('span', 'chip', '★ Shortlisted'));
    card.appendChild(row);

    var fees = el('div', 'fees');
    var a = el('div'); a.appendChild(el('strong', null, Dakhla.formatPKR(uni.appFee)));
    a.appendChild(el('span', null, 'application fee'));
    var b = el('div'); b.appendChild(el('strong', null, Dakhla.formatPKR(uni.semesterFee)));
    b.appendChild(el('span', null, 'per semester'));
    fees.appendChild(a); fees.appendChild(b);
    card.appendChild(fees);

    var sectorChip = el('span', 'chip ' + (uni.sector === 'Public' ? 'public' : 'private'), uni.sector);
    sectorChip.style.marginTop = '10px';
    card.appendChild(sectorChip);

    function open() { openDetail(uni.id); }
    card.addEventListener('click', open);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    return card;
  }

  function filterUnis(query) {
    var q = query.trim().toLowerCase();
    return UNIVERSITIES.filter(function (u) {
      var sectorOk = sectorFilter === 'all' || u.sector === sectorFilter;
      if (!sectorOk) return false;
      if (!q) return true;
      return u.name.toLowerCase().indexOf(q) !== -1 ||
             u.city.toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ---------------- HOME: countdown cards + live search ---------------- */
  function renderDeadlineCards() {
    var box = $('deadline-cards');
    clear(box);
    // Sort by nearest deadline, take the 4 most urgent
    var sorted = UNIVERSITIES.slice().sort(function (a, b) {
      return Dakhla.daysLeft(a.deadline) - Dakhla.daysLeft(b.deadline);
    }).slice(0, 4);

    sorted.forEach(function (uni) {
      var days = Dakhla.daysLeft(uni.deadline);
      var card = el('div', 'card');
      var top = el('div', 'row space-between');
      top.appendChild(el('div', 'name grow', uni.name));
      top.appendChild(deadlinePill(uni));
      card.appendChild(top);
      // Progress = how much of a 30-day warning window has elapsed
      var pct = Math.min(100, Math.max(0, ((30 - days) / 30) * 100));
      var bar = el('div', 'progress');
      var fill = el('div', 'fill');
      fill.style.width = pct.toFixed(0) + '%';
      bar.appendChild(fill);
      card.appendChild(bar);
      var hint = el('div', 'muted', days < 0
        ? 'This round closed — watch for the next admission cycle.'
        : 'Apply before ' + uni.deadline + '.');
      hint.style.marginTop = '8px';
      card.appendChild(hint);
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () { openDetail(uni.id); });
      box.appendChild(card);
    });
  }

  function renderHomeList(query) {
    var box = $('home-uni-list');
    clear(box);
    var list = filterUnis(query);
    if (!list.length) {
      box.appendChild(el('div', 'empty', 'No universities match "' + query + '". Try a city like Lahore or Islamabad.'));
      return;
    }
    list.forEach(function (u) { box.appendChild(uniCard(u)); });
  }

  $('search').addEventListener('input', function (e) { renderHomeList(e.target.value); });

  /* ---------------- UNIVERSITIES tab ---------------- */
  function renderAllList(query) {
    var box = $('all-uni-list');
    clear(box);
    var list = filterUnis(query);
    if (!list.length) {
      box.appendChild(el('div', 'empty', 'No universities match your filter.'));
      return;
    }
    list.forEach(function (u) { box.appendChild(uniCard(u)); });
  }

  $('search2').addEventListener('input', function (e) { renderAllList(e.target.value); });
  document.querySelectorAll('[data-sector-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sectorFilter = btn.getAttribute('data-sector-filter');
      renderAllList($('search2').value);
      // Visual: bold the active filter
      document.querySelectorAll('[data-sector-filter]').forEach(function (b) {
        b.style.color = b === btn ? '#E11D48' : '';
        b.style.fontWeight = b === btn ? '800' : '600';
      });
    });
  });

  /* ---------------- DETAIL view ---------------- */
  function openDetail(id) {
    var uni = uniById(id);
    if (!uni) return;
    var body = $('detail-body');
    clear(body);

    var card = el('div', 'card');
    card.appendChild(el('h2', null, uni.name));
    card.appendChild(el('div', 'muted', uni.city + '  •  ' + uni.sector + ' university'));
    var row = el('div', 'row', null);
    row.style.margin = '10px 0';
    row.appendChild(deadlinePill(uni));
    card.appendChild(row);

    // Fees
    var fees = el('div', 'fees');
    var a = el('div'); a.appendChild(el('strong', null, Dakhla.formatPKR(uni.appFee)));
    a.appendChild(el('span', null, 'application fee'));
    var b = el('div'); b.appendChild(el('strong', null, Dakhla.formatPKR(uni.semesterFee)));
    b.appendChild(el('span', null, 'per semester'));
    fees.appendChild(a); fees.appendChild(b);
    card.appendChild(fees);
    body.appendChild(card);

    // Programs + 2025 closing merits
    var progCard = el('div', 'card');
    progCard.appendChild(el('h2', null, 'Programs & 2025 closing merit'));
    uni.programs.forEach(function (p) {
      var r = el('div', 'merit-row');
      r.appendChild(el('span', null, p.name));
      r.appendChild(el('span', 'chip', p.merit === null ? 'test-based' : p.merit + '%'));
      progCard.appendChild(r);
    });
    progCard.appendChild(el('div', 'muted',
      '2025 closing aggregates are indicative — 2026 merits shift every year with the applicant pool.'));
    body.appendChild(progCard);

    // Deadline card
    var dlCard = el('div', 'card');
    dlCard.appendChild(el('h2', null, 'Application deadline'));
    var days = Dakhla.daysLeft(uni.deadline);
    dlCard.appendChild(el('div', 'hero-stat num', null));
    var num = dlCard.querySelector('.hero-stat');
    num.appendChild(el('div', 'num', days < 0 ? 'Closed' : String(days)));
    num.appendChild(el('div', 'lbl', days < 0 ? 'this round has closed' : 'days left — closes ' + uni.deadline));
    body.appendChild(dlCard);

    // Actions
    var idx = shortlist.indexOf(uni.id);
    var shortBtn = el('button', 'btn' + (idx === -1 ? '' : ' secondary'),
      idx === -1 ? '★ Add to shortlist' : '✓ Shortlisted — tap to remove');
    shortBtn.addEventListener('click', function () {
      var i = shortlist.indexOf(uni.id);
      if (i === -1) { shortlist.push(uni.id); } else { shortlist.splice(i, 1); }
      saveShortlist();
      openDetail(uni.id); // re-render to reflect the new state
      renderHomeList($('search').value);
      renderAllList($('search2').value);
    });
    body.appendChild(shortBtn);

    var portalBtn = el('button', 'btn secondary', '🚀 Start application');
    portalBtn.style.marginTop = '10px';
    portalBtn.addEventListener('click', function () {
      $('portal-url').textContent = uni.portal;
      $('portal-modal').classList.add('open');
    });
    body.appendChild(portalBtn);

    showView('view-detail');
  }

  $('portal-close').addEventListener('click', function () {
    $('portal-modal').classList.remove('open');
  });
  $('portal-modal').addEventListener('click', function (e) {
    if (e.target === $('portal-modal')) $('portal-modal').classList.remove('open');
  });

  /* ---------------- MERIT calculator ---------------- */
  $('calc-btn').addEventListener('click', function () {
    var agg = Dakhla.calcAggregate($('inter-input').value, $('test-input').value);
    var err = $('merit-error');
    if (agg === null) {
      err.style.display = 'block';
      err.textContent = 'Please enter both percentages as numbers between 0 and 100.';
      $('merit-result-card').style.display = 'none';
      return;
    }
    err.style.display = 'none';
    $('agg-num').textContent = agg.toFixed(2) + '%';
    var box = $('merit-results');
    clear(box);

    var unis = shortlist.length
      ? shortlist.map(uniById).filter(Boolean)
      : UNIVERSITIES; // no shortlist yet → compare against all

    if (!shortlist.length) {
      box.appendChild(el('div', 'muted',
        'Tip: add universities to your shortlist (★) and this will compare only them.'));
      box.lastChild.style.marginBottom = '10px';
    }

    unis.forEach(function (u) {
      var v = Dakhla.meritVerdict(agg, u.csMerit);
      var r = el('div', 'merit-row');
      var left = el('div');
      left.appendChild(el('div', null, u.name));
      left.appendChild(el('div', 'muted',
        u.csMerit === null ? 'merit: test-based' : 'closing ' + u.csMerit + '% (2025)'));
      r.appendChild(left);
      r.appendChild(el('span', 'chip verdict-' + v.key, v.label));
      box.appendChild(r);
    });

    $('merit-result-card').style.display = 'block';
  });

  /* ---------------- CHECKLIST ---------------- */
  function renderChecklist() {
    var box = $('check-list');
    clear(box);
    var doneCount = 0;

    DOCUMENTS.forEach(function (doc) {
      var done = !!checklist[doc.id];
      if (done) doneCount++;
      var item = el('label', 'check-item' + (done ? ' done' : ''));
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = done;
      cb.setAttribute('aria-label', doc.label);
      cb.addEventListener('change', function () {
        checklist[doc.id] = cb.checked;
        saveChecklist();
        renderChecklist(); // re-render: ring, strikethrough, per-uni states
      });
      item.appendChild(cb);
      item.appendChild(el('span', null, doc.label));
      box.appendChild(item);
    });

    // Progress ring: circumference = 2πr, r=36 → ≈226.2
    var C = 2 * Math.PI * 36;
    var pct = DOCUMENTS.length ? doneCount / DOCUMENTS.length : 0;
    var ring = $('ring-fill');
    ring.style.strokeDasharray = C.toFixed(1);
    ring.style.strokeDashoffset = (C * (1 - pct)).toFixed(1);
    $('check-pct').textContent = Math.round(pct * 100) + '%';

    // Per-shortlisted-university "documents ready" state
    var perUni = $('check-per-uni');
    clear(perUni);
    if (!shortlist.length) {
      perUni.appendChild(el('div', 'empty', 'Shortlist some universities (★) to track document readiness per university.'));
      return;
    }
    shortlist.forEach(function (id) {
      var u = uniById(id);
      if (!u) return;
      var card = el('div', 'card');
      var top = el('div', 'row space-between');
      top.appendChild(el('div', 'grow', u.name));
      var ready = doneCount === DOCUMENTS.length;
      top.appendChild(el('span', 'chip verdict-' + (ready ? 'above' : doneCount > 0 ? 'borderline' : 'na'),
        doneCount + ' / ' + DOCUMENTS.length + ' ready'));
      card.appendChild(top);
      card.appendChild(el('div', 'muted',
        ready ? 'All documents ready — you can apply today.'
              : (DOCUMENTS.length - doneCount) + ' document(s) still missing.'));
      perUni.appendChild(card);
    });
  }

  /* ---------------- MORE: fees comparison ---------------- */
  function renderFees() {
    var box = $('fees-table');
    clear(box);
    if (!shortlist.length) {
      box.appendChild(el('div', 'empty', 'Your shortlist is empty. Tap ★ on any university to compare its fees here.'));
      return;
    }
    var table = el('table', 'fees');
    var thead = el('thead');
    var hr = el('tr');
    ['University', 'App fee', 'Per semester'].forEach(function (h) {
      var th = el('th', null, h);
      if (h !== 'University') th.classList.add('num');
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el('tbody');
    shortlist.forEach(function (id) {
      var u = uniById(id);
      if (!u) return;
      var tr = el('tr');
      tr.appendChild(el('td', null, u.name));
      var td1 = el('td', 'num', Dakhla.formatPKR(u.appFee)); tr.appendChild(td1);
      var td2 = el('td', 'num', Dakhla.formatPKR(u.semesterFee)); tr.appendChild(td2);
      tbody.appendChild(tr);
    });

    var totalApp = Dakhla.totalApplicationCost(shortlist, UNIVERSITIES);
    var trT = el('tr', 'total-row');
    trT.appendChild(el('td', null, 'Total to apply to all ' + shortlist.length));
    trT.appendChild(el('td', 'num', Dakhla.formatPKR(totalApp)));
    trT.appendChild(el('td', 'num', '—'));
    tbody.appendChild(trT);
    table.appendChild(tbody);
    box.appendChild(table);

    box.appendChild(el('div', 'muted',
      'Applying to every shortlisted university costs ' + Dakhla.formatPKR(totalApp) +
      ' in application fees alone — budget before you apply.'));
  }

  /* ---------------- MORE: scam shield ---------------- */
  var scamState = {}; // flagId → bool

  function renderScamFlags() {
    var box = $('scam-flags');
    clear(box);
    SCAM_FLAGS.forEach(function (f) {
      var item = el('label', 'flag-item');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!scamState[f.id];
      cb.addEventListener('change', function () {
        scamState[f.id] = cb.checked;
        updateScamVerdict();
      });
      item.appendChild(cb);
      var txt = el('div');
      txt.appendChild(el('div', null, f.label));
      txt.appendChild(el('div', 'why', f.why));
      item.appendChild(txt);
      box.appendChild(item);
    });

    // Static verified channels
    var vl = $('verified-list');
    clear(vl);
    VERIFIED_CHANNELS.forEach(function (c) {
      var r = el('div', 'merit-row');
      r.appendChild(el('span', null, '🔒'));
      r.appendChild(el('span', 'grow', c));
      vl.appendChild(r);
    });

    updateScamVerdict();
  }

  function updateScamVerdict() {
    var ticked = SCAM_FLAGS.filter(function (f) { return scamState[f.id]; })
                           .map(function (f) { return f.id; });
    var v = Dakhla.scamVerdict(ticked, SCAM_FLAGS);
    var box = $('scam-verdict');
    box.className = 'verdict-box ' + v.key;
    clear(box);
    box.appendChild(el('div', 'big', v.label));
    box.appendChild(el('p', null, v.explanation));
    if (ticked.length) {
      var list = el('div');
      list.style.marginTop = '10px';
      ticked.forEach(function (id) {
        var f = SCAM_FLAGS.filter(function (x) { return x.id === id; })[0];
        list.appendChild(el('span', 'chip', '⚠ ' + f.label));
      });
      box.appendChild(list);
    }
  }

  /* ---------------- initial render ---------------- */
  renderDeadlineCards();
  renderHomeList('');
  renderAllList('');
  renderChecklist();
  renderFees();
  renderScamFlags();
})();
