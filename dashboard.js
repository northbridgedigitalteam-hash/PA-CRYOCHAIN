// dashboard.js - role-aware dashboard behaviour
document.addEventListener('DOMContentLoaded', () => {
  // helpers
  const qs = (s, ctx=document) => ctx.querySelector(s);
  const qsa = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleString() : '';

  // require login
  let user = null;
  try { user = JSON.parse(localStorage.getItem('paCryoUser') || 'null'); } catch(e) { user = null; }
  if (!user) { window.location.replace('login.html'); return; }

  // UI elements
  const headerUser = qs('#headerUser');
  const logoutBtn = qs('#logoutBtn');
  const navLinks = qsa('.nav-link');
  const views = {
    summary: qs('#view-summary'),
    bookings: qs('#view-bookings'),
    reports: qs('#view-reports'),
    data: qs('#view-data'),
    file: qs('#view-file'),
  };
  const consignmentBar = qs('#consignmentBar');

  headerUser.textContent = `${user.username} (${user.role === 'client' ? 'Exporter' : 'Internal'})`;

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('paCryoUser');
    window.location.replace('login.html');
  });

  // sample data - demo only (persisted to localStorage)
  const SAMPLE_CONSIGNMENTS = [
    {
      id: 'C001',
      ref: 'PA-0001',
      container: 'ZCSU1234567',
      commodity: 'Citrus - Navel',
      market: 'Rotterdam, NL',
      status: 'On vessel',
      etd: '2026-02-01T08:00:00Z',
      eta: '2026-02-28T10:00:00Z',
      vessel: 'COLDSEA 12',
      pol: 'Ngqura',
      pod: 'Rotterdam',
      coords: { lat: -33.916, lng: 25.621 },
      ppecbStatus: 'Passed',
      dalrrdStatus: 'Issued',
      tempTarget: '-0.5°C to 2°C',
      tempAvg: '1.1°C',
      lastUpdated: new Date().toISOString(),
      exportNotes: 'Handle with care; check canopy before stuffing.',
      bookingRef: 'BK-4271',
      shippingLine: 'CryoLine',
      containerType: "Reefer 40'",
      tasks: [
        { task: 'Booking confirmed', status: 'Done', date: '2026-01-20T08:00:00Z' },
        { task: 'Container pack date', status: 'Done', date: '2026-01-22T09:00:00Z' },
        { task: 'Container gate in', status: 'Done', date: '2026-01-25T14:00:00Z' },
        { task: 'Packing list', status: 'Done', date: '2026-01-26T10:00:00Z' },
        { task: 'Invoice', status: 'Done', date: '2026-01-27T11:00:00Z' }
      ],
      docStatus: {
        si: { status: 'Submitted', comment: 'SI sent to agent' },
        exportCert: { status: 'Issued', comment: 'Certificate available' },
        phyto: { status: 'Pending', comment: 'Inspection scheduled' },
        originCert: { status: 'Issued', comment: '' }
      },
      messages: [
        { author: 'exporter@example.com', text: 'Container stuffed and sealed.', time: new Date().toISOString() }
      ],
      delays: ['Berthing window delayed at POL due to congestion.']
    },
    {
      id: 'C002',
      ref: 'PA-0002',
      container: 'ZCSU2345678',
      commodity: 'Stone Fruit - Apricot',
      market: 'Genoa, IT',
      status: 'At port (Ngqura)',
      etd: '2026-02-03T06:00:00Z',
      eta: '2026-02-25T09:00:00Z',
      vessel: 'FRIGOPAC 7',
      pol: 'Ngqura',
      pod: 'Genoa',
      coords: { lat: -34.020, lng: 25.617 },
      ppecbStatus: 'Pending',
      dalrrdStatus: 'Pending',
      tempTarget: '0°C to 3°C',
      tempAvg: '2.5°C',
      lastUpdated: new Date().toISOString(),
      exportNotes: 'Ensure correct cold chain at reefer yard.',
      bookingRef: 'BK-4272',
      shippingLine: 'SafeLine',
      containerType: "Reefer 20'",
      tasks: [
        { task: 'Booking confirmed', status: 'Done', date: '2026-01-30T08:00:00Z' },
        { task: 'Container pack date', status: 'Scheduled', date: '2026-02-01T00:00:00Z' },
        { task: 'Container gate in', status: 'Pending', date: '' },
        { task: 'Packing list', status: 'Pending', date: '' },
        { task: 'Invoice', status: 'Pending', date: '' }
      ],
      docStatus: {
        si: { status: 'Not submitted', comment: '' },
        exportCert: { status: 'Not issued', comment: '' },
        phyto: { status: 'Pending', comment: '' },
        originCert: { status: 'Not issued', comment: '' }
      },
      messages: [],
      delays: []
    }
  ];

  if (!localStorage.getItem('paCryo_sampleData')) {
    try { localStorage.setItem('paCryo_sampleData', JSON.stringify(SAMPLE_CONSIGNMENTS)); } catch(e){ console.warn(e); }
  }

  const getData = () => {
    try { return JSON.parse(localStorage.getItem('paCryo_sampleData') || '[]'); } catch(e) { return SAMPLE_CONSIGNMENTS; }
  };

  // view control
  function showView(name) {
    Object.values(views).forEach(v => { if (v) v.hidden = true; });
    if (views[name]) views[name].hidden = false;
    navLinks.forEach(n => n.classList.toggle('active', n.dataset.view === name));
  }
  navLinks.forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    const view = a.dataset.view;
    showView(view);
    history.replaceState({}, '', `#${view}`);
  }));

  // start on summary
  const initial = (location.hash || '#summary').replace('#','') || 'summary';
  showView(initial);

  // render summary tables
  function renderSummary() {
    const consignments = getData();
    const tb = qs('#summaryConsignments tbody'); tb.innerHTML = '';
    consignments.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><button class="link-like open-file" data-id="${c.id}">${c.ref}</button></td>
                      <td>${c.container}</td><td>${c.commodity}</td><td>${c.market}</td><td>${c.status}</td>
                      <td>${new Date(c.etd).toLocaleDateString()}</td><td>${new Date(c.eta).toLocaleDateString()}</td>`;
      tb.appendChild(tr);
    });

    // vessels
    const vessels = {};
    consignments.forEach(c => {
      const k = c.vessel;
      vessels[k] = vessels[k] || { vessel: c.vessel, pol: c.pol, pod: c.pod, etd: c.etd, eta: c.eta, count: 0 };
      vessels[k].count++;
    });
    const vb = qs('#summaryVessels tbody'); vb.innerHTML = '';
    Object.values(vessels).forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${v.vessel}</td><td>${v.pol}</td><td>${v.pod}</td><td>${new Date(v.etd).toLocaleDateString()}</td><td>${new Date(v.eta).toLocaleDateString()}</td><td>${v.count}</td>`;
      vb.appendChild(tr);
    });

    // shipments
    const sb = qs('#summaryShipments tbody'); sb.innerHTML = '';
    consignments.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.ref}</td><td>${c.container}</td><td>${c.pol}</td><td>${c.tempAvg || '—'}</td><td>${(c.delays && c.delays.length) ? 'Possible delay' : 'OK'}</td>`;
      sb.appendChild(tr);
    });

    // delays (summary)
    const delaysEl = qs('#summaryDelays'); delaysEl.innerHTML = '';
    const combinedDelays = [].concat(...consignments.map(c => c.delays || []));
    if (combinedDelays.length === 0) {
      const li = document.createElement('li'); li.textContent = 'No current delays in demo data.'; delaysEl.appendChild(li);
    } else {
      combinedDelays.forEach(d => { const li = document.createElement('li'); li.textContent = d; delaysEl.appendChild(li); });
    }
  }

  // open file view
  function openFile(id) {
    const consignments = getData();
    const c = consignments.find(x => x.id === id);
    if (!c) return;
    qs('#consignee').textContent = c.consignee || '—';
    qs('#exporter').textContent = c.exporter || 'Demo Exporter';
    qs('#clientRef').textContent = c.ref || '—';
    qs('#containerNo').textContent = c.container || '—';
    qs('#commodity').textContent = c.commodity || '—';
    qs('#marketDest').textContent = c.market || '—';
    qs('#bookingRef').textContent = c.bookingRef || '';
    qs('#vesselVoyage').textContent = c.vessel || '';
    qs('#shippingLine').textContent = c.shippingLine || '';
    qs('#containerType').textContent = c.containerType || '';
    qs('#pol').textContent = c.pol || '';
    qs('#pod').textContent = c.pod || '';
    qs('#etd').textContent = new Date(c.etd).toLocaleString();
    qs('#eta').textContent = new Date(c.eta).toLocaleString();

    // tasks (make sure tasks include required items)
    const requiredTasks = ['Booking confirmed','Container pack date','Container gate in','Packing list','Invoice'];
    const tasks = [];
    requiredTasks.forEach(name => {
      const found = (c.tasks || []).find(t => t.task.toLowerCase() === name.toLowerCase());
      tasks.push(found || { task: name, status: 'Pending', date: '' });
    });
    const taskBody = qs('#taskTable tbody'); taskBody.innerHTML = '';
    tasks.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.task}</td><td>${t.status}</td><td>${t.date ? new Date(t.date).toLocaleString() : '—'}</td>`;
      taskBody.appendChild(tr);
    });

    // document status fields
    qs('#siStatus').textContent = c.docStatus?.si?.status || '—';
    qs('#siComment').textContent = c.docStatus?.si?.comment || '';
    qs('#exportCertStatus').textContent = c.docStatus?.exportCert?.status || '—';
    qs('#exportCertComment').textContent = c.docStatus?.exportCert?.comment || '';
    qs('#phytoStatus').textContent = c.docStatus?.phyto?.status || '—';
    qs('#phytoComment').textContent = c.docStatus?.phyto?.comment || '';
    qs('#originCertStatus').textContent = c.docStatus?.originCert?.status || '—';
    qs('#originCertComment').textContent = c.docStatus?.originCert?.comment || '';

    // exporter notes: only visible to internal users
    if (user.role === 'internal') {
      qs('#exporterNotesPanel').hidden = false;
      qs('#exportNotes').value = c.exportNotes || '';
    } else {
      qs('#exporterNotesPanel').hidden = true;
    }

    // messages
    renderMessages(c);

    // file delays
    const fileDelaysEl = qs('#fileDelays'); fileDelaysEl.innerHTML = '';
    (c.delays || []).forEach(d => { const li = document.createElement('li'); li.textContent = d; fileDelaysEl.appendChild(li); });

    // show consignment bar and populate
    consignmentBar.hidden = false;
    qs('#consignmentTitle').textContent = c.ref;
    qs('#consignmentSub').textContent = `${c.container} • ${c.commodity} → ${c.market}`;
    showView('file');

    // persist current file in session
    sessionStorage.setItem('paCryo_currentFile', c.id);

    // map: init or update marker
    if (window.L && c.coords && typeof c.coords.lat === 'number') {
      initMap(c.coords, `${c.container} — ${c.ref}`);
    } else {
      // if no coords, try pol to set general location (not implemented) or center to world
      if (map) {
        map.setView([0,0],2);
        if (marker) marker.remove();
        qs('#mapMeta').textContent = 'No position available for this container in demo data.';
      }
    }
  }

  // click handler to open file
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-file');
    if (btn) {
      openFile(btn.dataset.id);
    }
  });

  // Bookings handler
  const bookingForm = qs('#bookingForm');
  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const booking = {
      id: `BK-${Date.now()}`,
      exporterRef: qs('#bkExporterRef').value.trim(),
      commodity: qs('#bkCommodity').value.trim(),
      volume: qs('#bkVolume').value.trim(),
      vessel: qs('#bkVessel').value.trim(),
      route: qs('#bkRoute').value.trim(),
      notes: qs('#bkNotes').value.trim(),
      createdAt: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('paCryo_bookings') || '[]');
    existing.unshift(booking);
    localStorage.setItem('paCryo_bookings', JSON.stringify(existing));
    qs('#bookingFeedback').textContent = 'Booking request saved (demo).';
    bookingForm.reset();
  });

  // reports CSV
  qs('#downloadReportBtn')?.addEventListener('click', () => {
    const data = getData();
    const rows = [['ConsignmentRef','Container','Commodity','Market','Status','ETD','ETA']];
    data.forEach(r => rows.push([r.ref, r.container, r.commodity, r.market, r.status, r.etd, r.eta]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `pa_cryo_summary_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // messages
  function renderMessages(c) {
    const list = qs('#messageList'); list.innerHTML = '';
    const key = `paCryo_msgs_${c.id}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const msgs = (c.messages || []).concat(stored);
    msgs.forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${m.author || user.username}</strong> <span class="muted">• ${fmtDate(m.time || m.created)}</span><div>${m.text}</div>`;
      list.appendChild(li);
    });
  }
  const messageForm = qs('#messageForm');
  messageForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const txt = qs('#messageText').value.trim(); if (!txt) return;
    const currentFileId = sessionStorage.getItem('paCryo_currentFile'); if (!currentFileId) return;
    const key = `paCryo_msgs_${currentFileId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const msg = { author: user.username, text: txt, time: new Date().toISOString() };
    existing.unshift(msg);
    localStorage.setItem(key, JSON.stringify(existing));
    // re-render messages for the file
    const consignments = getData();
    const c = consignments.find(x => x.id === currentFileId);
    if (c) renderMessages(c);
    qs('#messageText').value = '';
  });

  // delays aggregator: attempts to fetch external feeds via a public CORS proxy (demo). For production implement server-side aggregation.
  async function fetchExternalDelays() {
    const summaryDelaysEl = qs('#summaryDelays'); summaryDelaysEl.innerHTML = '';
    const feeds = [
      { name: 'Transnet', url: 'https://www.transnetnationalportsauthority.net/News/Pages/Default.aspx' },
      { name: 'Splash247 (ports)', url: 'https://splash247.com/category/ports/' }
    ];
    // try fetch via allorigins (public proxy) — may be unreliable. This is a demo approach only.
    const proxy = 'https://api.allorigins.win/raw?url=';
    const results = [];
    for (const f of feeds) {
      try {
        const res = await fetch(proxy + encodeURIComponent(f.url));
        if (!res.ok) throw new Error('fetch failed');
        const txt = await res.text();
        // lightweight extract: look for headlines in HTML (very brittle)
        const parser = new DOMParser();
        const doc = parser.parseFromString(txt, 'text/html');
        // try a few selectors for headline links
        const anchors = doc.querySelectorAll('a');
        const headlines = Array.from(anchors).slice(0,5).map(a => `${f.name}: ${a.textContent.trim()}`).filter(Boolean);
        results.push(...headlines);
      } catch (e) {
        console.warn('External feed fetch failed', f.url, e);
      }
    }
    if (results.length === 0) {
      summaryDelaysEl.innerHTML = '<li>No external feed results (demo). Use server-side aggregator for production.</li>';
    } else {
      results.forEach(r => { const li = document.createElement('li'); li.textContent = r; summaryDelaysEl.appendChild(li); });
    }
  }
  qs('#refreshDelaysBtn')?.addEventListener('click', () => { fetchExternalDelays(); });

  // run initial render
  renderSummary();

  // try to open last file if present
  const lastFile = sessionStorage.getItem('paCryo_currentFile');
  if (lastFile) {
    openFile(lastFile);
  }

  // open-file click is handled via event delegation earlier

  // Map init
  let map, marker;
  function initMap(coords, title) {
    const mapEl = qs('#map');
    if (!mapEl) return;
    if (!map) {
      map = L.map(mapEl, { scrollWheelZoom: false }).setView([coords.lat, coords.lng], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    } else {
      map.setView([coords.lat, coords.lng], 6);
      if (marker) marker.remove();
    }
    marker = L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(title || '').openPopup();
    qs('#mapMeta').textContent = `Position: ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`;
  }

  // wire up "view consignment" button to navigate to file view
  qs('#viewConsignmentBtn')?.addEventListener('click', () => {
    const current = sessionStorage.getItem('paCryo_currentFile');
    if (current) {
      // we already show file view
      showView('file');
    }
  });

  // expose functions (debug)
  window.paCryo = { openFile, renderSummary, fetchExternalDelays };
});
