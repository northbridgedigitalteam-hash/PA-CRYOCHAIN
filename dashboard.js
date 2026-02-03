// dashboard.js - fixes for map + improved UI and demo statuses/messages
document.addEventListener('DOMContentLoaded', () => {
  // --- helpers
  const qs = (s, ctx=document) => ctx.querySelector(s);
  const qsa = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleString() : '—';

  // --- require login (demo)
  let user = null;
  try { user = JSON.parse(localStorage.getItem('paCryoUser') || 'null'); } catch(e) { user = null; }
  if (!user) { window.location.replace('login.html'); return; }

  // --- UI elements
  const headerUser = qs('#headerUser');
  const logoutBtn = qs('#logoutBtn');
  const navLinks = qsa('.nav-link');
  const views = {
    summary: qs('#view-summary'),
    bookings: qs('#view-bookings'),
    reports: qs('#view-reports'),
    data: qs('#view-data'),
    file: qs('#view-file')
  };
  const consignmentBar = qs('#consignmentBar');

  headerUser.textContent = `${user.username} (${user.role === 'client' ? 'Exporter' : 'Internal'})`;
  logoutBtn.addEventListener('click', () => { localStorage.removeItem('paCryoUser'); window.location.replace('login.html'); });

  // --- sample data (demo)
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
      exportNotes: 'Handle with care.',
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
        exportCert: { status: 'Issued', comment: 'Export cert ready' },
        phyto: { status: 'Pending', comment: 'Inspection scheduled' },
        originCert: { status: 'Issued', comment: '' }
      },
      messages: [
        { author: 'exporter@example.com', text: 'Container stuffed and sealed. Ready for collection.', time: new Date().toISOString() },
        { author: 'agent@cryoline.com', text: 'Booking confirmed and vessel slot allocated.', time: new Date(Date.now()-3600*1000).toISOString() }
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
      exportNotes: '',
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
      messages: [
        { author: 'exporter2@example.com', text: 'When is packing scheduled?', time: new Date(Date.now()-2*3600*1000).toISOString() }
      ],
      delays: []
    }
  ];

  if (!localStorage.getItem('paCryo_sampleData')) {
    try { localStorage.setItem('paCryo_sampleData', JSON.stringify(SAMPLE_CONSIGNMENTS)); } catch(e){ console.warn(e); }
  }
  const getData = () => { try { return JSON.parse(localStorage.getItem('paCryo_sampleData') || '[]'); } catch(e){ return SAMPLE_CONSIGNMENTS; } };

  // --- view control
  function showView(name) {
    Object.values(views).forEach(v => v.hidden = true);
    if (views[name]) views[name].hidden = false;
    navLinks.forEach(n => n.classList.toggle('active', n.dataset.view === name));
  }
  qsa('.nav-link').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); showView(a.dataset.view); history.replaceState({}, '', `#${a.dataset.view}`); }));

  // default start
  const initHash = (location.hash || '#summary').replace('#','') || 'summary';
  showView(initHash);

  // --- render summary
  function renderSummary(){
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

    // summary delays
    const delaysEl = qs('#summaryDelays'); delaysEl.innerHTML = '';
    const combined = [].concat(...consignments.map(c => c.delays || []));
    if (combined.length === 0) {
      const li = document.createElement('li'); li.textContent = 'No current delays in demo data.'; delaysEl.appendChild(li);
    } else {
      combined.forEach(d => { const li=document.createElement('li'); li.textContent = d; delaysEl.appendChild(li); });
    }
  }

  // --- open file
  // Map variables (initialized once)
  let map = null, marker = null;
  function initMapIfNeeded(){
    const mapEl = qs('#map');
    if (!mapEl) return;
    if (!map) {
      // world view default
      map = L.map(mapEl, { scrollWheelZoom: false }).setView([0,0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
    }
  }

  function placeMarker(coords, title){
    if (!map) return;
    if (marker) marker.remove();
    marker = L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(title || '').openPopup();
    map.setView([coords.lat, coords.lng], 6);
    // ensure tile load when container was hidden before
    setTimeout(() => { try { map.invalidateSize(); } catch(e) { /* ignore */ } }, 250);
    qs('#mapMeta').textContent = `Position: ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`;
  }

  function renderStatusOverview(c) {
    const container = qs('#statusOverview');
    container.innerHTML = '';
    const mk = (label, value, cls) => {
      const el = document.createElement('div');
      el.className = 'status-card';
      el.innerHTML = `<div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">${label}</div><div style="display:flex;gap:8px;align-items:center"><span class="badge ${cls}">${value}</span></div>`;
      return el;
    };
    // decide badge classes based on statuses
    const ppecb = c.ppecbStatus || 'Unknown';
    const dal = c.dalrrdStatus || 'Unknown';
    const cold = c.tempAvg ? `${c.tempAvg}` : 'Unknown';
    const risk = (c.delays && c.delays.length) ? 'Risk' : 'OK';
    const ppecbCls = ppecb.toLowerCase().includes('pass') ? 'success' : (ppecb.toLowerCase().includes('pending') ? 'warn' : 'danger');
    const dalCls = dal.toLowerCase().includes('issued') ? 'success' : (dal.toLowerCase().includes('pending') ? 'warn' : 'danger');
    const coldCls = (c.tempAvg && parseFloat(c.tempAvg) <= 3) ? 'info' : 'warn';
    const riskCls = risk === 'OK' ? 'success' : 'warn';

    container.appendChild(mk('PPECB', ppecb, ppecbCls));
    container.appendChild(mk('Export Cert (DALRRD)', dal, dalCls));
    container.appendChild(mk('Cold Chain (Avg)', cold, coldCls));
    container.appendChild(mk('Delay / Risk', risk, riskCls));
  }

  function openFile(id){
    const data = getData();
    const c = data.find(x => x.id === id);
    if (!c) return;
    // fill left fields
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
    qs('#etd').textContent = fmtDate(c.etd);
    qs('#eta').textContent = fmtDate(c.eta);

    // tasks - ensure required tasks exist and show dates
    const required = ['Booking confirmed','Container pack date','Container gate in','Packing list','Invoice'];
    const tasks = [];
    required.forEach(name => {
      const found = (c.tasks || []).find(t => t.task.toLowerCase() === name.toLowerCase());
      tasks.push(found || { task: name, status: 'Pending', date: '' });
    });
    const taskBody = qs('#taskTable tbody'); taskBody.innerHTML = '';
    tasks.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.task}</td><td>${t.status}</td><td>${t.date ? fmtDate(t.date) : '—'}</td>`;
      taskBody.appendChild(tr);
    });

    // document status
    qs('#siStatus').textContent = c.docStatus?.si?.status || '—';
    qs('#siComment').textContent = c.docStatus?.si?.comment || '';
    qs('#exportCertStatus').textContent = c.docStatus?.exportCert?.status || '—';
    qs('#exportCertComment').textContent = c.docStatus?.exportCert?.comment || '';
    qs('#phytoStatus').textContent = c.docStatus?.phyto?.status || '—';
    qs('#phytoComment').textContent = c.docStatus?.phyto?.comment || '';
    qs('#originCertStatus').textContent = c.docStatus?.originCert?.status || '—';
    qs('#originCertComment').textContent = c.docStatus?.originCert?.comment || '';

    // exporter notes (internal only)
    if (user.role === 'internal') {
      qs('#exporterNotesPanel').hidden = false; qs('#exportNotes').value = c.exportNotes || '';
    } else {
      qs('#exporterNotesPanel').hidden = true;
    }

    // messages
    renderMessages(c);

    // file delays
    const fd = qs('#fileDelays'); fd.innerHTML = '';
    (c.delays || []).forEach(d => { const li=document.createElement('li'); li.textContent = d; fd.appendChild(li); });

    // status overview
    renderStatusOverview(c);

    // show consignment bar and file view
    consignmentBar.hidden = false;
    qs('#consignmentTitle').textContent = c.ref;
    qs('#consignmentSub').textContent = `${c.container} • ${c.commodity} → ${c.market}`;
    showView('file');

    // persist current file
    sessionStorage.setItem('paCryo_currentFile', c.id);

    // map: init globally then place marker; ensure map sizing after view visible
    initMapIfNeeded();
    // small delay to ensure the view-file block is visible and map container has size
    setTimeout(() => {
      if (c.coords && typeof c.coords.lat === 'number') placeMarker(c.coords, `${c.container} — ${c.ref}`);
      else {
        qs('#mapMeta').textContent = 'No position available for this container in demo data.';
        if (map) { map.setView([0,0],2); if (marker) marker.remove(); map.invalidateSize(); }
      }
    }, 220);
  }

  // --- messages
  function renderMessages(c){
    const list = qs('#messageList'); list.innerHTML = '';
    const key = `paCryo_msgs_${c.id}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const msgs = (c.messages || []).concat(stored);
    msgs.forEach(m => {
      const li = document.createElement('li'); li.className = 'message-item';
      const initials = (m.author || '').split('@')[0].slice(0,2).toUpperCase() || 'U';
      li.innerHTML = `<div class="message-avatar">${initials}</div>
        <div class="message-body"><div class="message-meta"><strong>${m.author || 'User'}</strong> <span class="muted">• ${fmtDate(m.time||m.created)}</span></div>
        <div class="message-text">${(m.text||'')}</div></div>`;
      list.appendChild(li);
    });
  }

  qs('#messageForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const txt = qs('#messageText').value.trim(); if (!txt) return;
    const current = sessionStorage.getItem('paCryo_currentFile'); if (!current) return;
    const key = `paCryo_msgs_${current}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const msg = { author: user.username, text: txt, time: new Date().toISOString() };
    existing.unshift(msg);
    localStorage.setItem(key, JSON.stringify(existing));
    // re-render
    const data = getData(); const c = data.find(x => x.id === current);
    if (c) renderMessages(c);
    qs('#messageText').value = '';
  });

  // --- bookings
  qs('#bookingForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const b = { id: `BK-${Date.now()}`, exporterRef: qs('#bkExporterRef').value.trim(), commodity: qs('#bkCommodity').value.trim(), volume: qs('#bkVolume').value.trim(), vessel: qs('#bkVessel').value.trim(), route: qs('#bkRoute').value.trim(), notes: qs('#bkNotes').value.trim(), createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem('paCryo_bookings') || '[]'); existing.unshift(b); localStorage.setItem('paCryo_bookings', JSON.stringify(existing));
    qs('#bookingFeedback').textContent = 'Booking request saved (demo).';
    qs('#bookingForm').reset();
  });

  // --- reports CSV
  qs('#downloadReportBtn')?.addEventListener('click', () => {
    const data = getData();
    const rows = [['ConsignmentRef','Container','Commodity','Market','Status','ETD','ETA']];
    data.forEach(r => rows.push([r.ref,r.container,r.commodity,r.market,r.status,r.etd,r.eta]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `pa_cryo_summary_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // --- external delays (demo; uses public CORS proxy; production should use server)
  async function fetchExternalDelays() {
    const el = qs('#summaryDelays'); el.innerHTML = '';
    const feeds = [
      { name: 'Transnet', url: 'https://www.transnetnationalportsauthority.net/News/Pages/Default.aspx' },
      { name: 'Splash247', url: 'https://splash247.com/category/ports/' }
    ];
    const proxy = 'https://api.allorigins.win/raw?url=';
    const results = [];
    for (const f of feeds) {
      try {
        const res = await fetch(proxy + encodeURIComponent(f.url)); if (!res.ok) throw new Error('fetch failed');
        const txt = await res.text();
        const doc = new DOMParser().parseFromString(txt, 'text/html');
        const anchors = doc.querySelectorAll('a');
        Array.from(anchors).slice(0,5).forEach(a => { const text = a.textContent.trim(); if (text) results.push(`${f.name}: ${text}`); });
      } catch(err) { console.warn('feed error', f.url, err); }
    }
    if (!results.length) el.innerHTML = '<li>No external feed results (demo). Use server-side aggregator for production.</li>';
    else results.forEach(r => { const li=document.createElement('li'); li.textContent=r; el.appendChild(li); });
  }
  qs('#refreshDelaysBtn')?.addEventListener('click', () => fetchExternalDelays());

  // --- open-file click delegation
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-file'); if (btn) { openFile(btn.dataset.id); }
  });

  // --- map init helper (ensures map exists even if view-file hidden at load)
  function initMapIfNeeded(){
    const mapEl = qs('#map');
    if (!mapEl) return;
    if (!map) {
      map = L.map(mapEl, { scrollWheelZoom: false }).setView([0,0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      // call invalidateSize after small delay to address CSS render timing on some browsers
      setTimeout(() => { try { map.invalidateSize(); } catch(e) {} }, 200);
    }
  }

  // --- view helpers
  const current = sessionStorage.getItem('paCryo_currentFile');
  if (current) {
    initMapIfNeeded();
    // we will open it after summary renders
  }

  // --- initial render and open if needed
  renderSummary();
  if (current) openFile(current);

  // expose for debugging
  window.paCryo = { renderSummary, openFile, fetchExternalDelays };
});
