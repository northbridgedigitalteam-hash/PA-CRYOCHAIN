/* dashboard.js
   Implements dashboard behaviour: navigation, sample data rendering, map, bookings, uploads & messages.
   Uses localStorage for demo persistence.
*/
document.addEventListener("DOMContentLoaded", () => {
  // Utilities
  const qs = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };
  const fmtBytes = (n) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024*1024) return `${(n/1024).toFixed(1)} KB`;
    return `${(n/1024/1024).toFixed(1)} MB`;
  };

  // Ensure signed-in user
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("paCryoUser") || "null");
  } catch(e){ user = null; }
  if (!user) {
    // not signed in — send back to login
    window.location.replace("index.html");
    return;
  }

  // UI elements
  const headerYear = qs("#headerYear");
  const headerUser = qs("#headerUser");
  const logoutBtn = qs("#logoutBtn");
  const navLinks = qsa(".nav-link");
  const views = {
    summary: qs("#view-summary"),
    bookings: qs("#view-bookings"),
    reports: qs("#view-reports"),
    data: qs("#view-data"),
    file: qs("#view-file"),
  };
  const consignmentBar = qs("#consignmentBar");

  // Set header info
  if (headerYear) headerYear.textContent = new Date().getFullYear();
  if (headerUser) headerUser.textContent = user.username || user.role;

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("paCryoUser");
    // preserve demo data but remove session
    window.location.replace("index.html");
  });

  // Sample data (demo only) — could be replaced by API fetch
  const SAMPLE_CONSIGNMENTS = [
    {
      id: "C001",
      ref: "PA-0001",
      container: "ZCSU1234567",
      commodity: "Citrus - Navel",
      market: "Rotterdam, NL",
      status: "On vessel",
      etd: "2026-02-01T08:00:00Z",
      eta: "2026-02-28T10:00:00Z",
      vessel: "COLDSEA 12",
      pol: "Ngqura",
      pod: "Rotterdam",
      coords: { lat: -33.916, lng: 25.621 }, // example coord (SA)
      ppecbStatus: "Passed",
      dalrrdStatus: "Issued",
      tempTarget: "-0.5°C to 2°C",
      tempAvg: "1.1°C",
      lastUpdated: new Date().toISOString(),
      exportNotes: "Handle with care; check canopy before stuffing.",
      bookingRef: "BK-4271",
      shippingLine: "CryoLine",
      containerType: "Reefer 40'",
      tasks: [
        { task: "Load container", status: "Done", date: "2026-01-28T09:00:00Z" },
        { task: "PPECB inspection", status: "Passed", date: "2026-01-29T11:20:00Z" }
      ],
      docs: [
        { name: "PackingList.pdf", size: 183000, type: "application/pdf" }
      ],
      messages: [
        { author: "exporter@example.com", text: "Container stuffed, ready for collection.", time: new Date().toISOString() }
      ],
      delays: ["Vessel scheduled; minor berthing delays at POL expected."]
    },
    {
      id: "C002",
      ref: "PA-0002",
      container: "ZCSU2345678",
      commodity: "Stone Fruit - Apricot",
      market: "Genoa, IT",
      status: "At port (Ngqura)",
      etd: "2026-02-03T06:00:00Z",
      eta: "2026-02-25T09:00:00Z",
      vessel: "FRIGOPAC 7",
      pol: "Ngqura",
      pod: "Genoa",
      coords: { lat: -34.020, lng: 25.617 },
      ppecbStatus: "Pending",
      dalrrdStatus: "Pending",
      tempTarget: "0°C to 3°C",
      tempAvg: "2.5°C",
      lastUpdated: new Date().toISOString(),
      exportNotes: "Ensure correct cold chain at reefer yard.",
      bookingRef: "BK-4272",
      shippingLine: "SafeLine",
      containerType: "Reefer 20'",
      tasks: [],
      docs: [],
      messages: [],
      delays: []
    }
  ];

  // persist sample consignments to localStorage if not present (demo initial data)
  if (!localStorage.getItem("paCryo_sampleData")) {
    try {
      localStorage.setItem("paCryo_sampleData", JSON.stringify(SAMPLE_CONSIGNMENTS));
    } catch (e) { console.warn("Unable to persist sample data"); }
  }

  const getSampleData = () => {
    try {
      return JSON.parse(localStorage.getItem("paCryo_sampleData") || "[]");
    } catch(e){ return SAMPLE_CONSIGNMENTS; }
  };

  // NAV handling
  function showView(name) {
    Object.values(views).forEach(v => v.hidden = true);
    if (views[name]) views[name].hidden = false;
    // update nav active
    navLinks.forEach(n => n.classList.toggle("active", n.dataset.view === name));
  }
  navLinks.forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const view = a.dataset.view;
      showView(view);
      // update hash so reloads can land on a view
      history.replaceState({}, "", `#${view}`);
    });
  });

  // Start on hash or default summary
  const initialHash = (location.hash || "#exporter").replace("#", "");
  showView(initialHash === "internal" ? "summary" : "summary");

  // Populate summary tables
  function renderSummary() {
    const consignments = getSampleData();
    const tbody = qs("#summaryConsignments tbody");
    tbody.innerHTML = "";
    consignments.forEach(c => {
      const tr = document.createElement("tr");
      tr.tabIndex = 0;
      tr.dataset.ref = c.id;
      tr.innerHTML = `
        <td><button class="link-like open-file" data-ref="${c.id}">${c.ref}</button></td>
        <td>${c.container}</td>
        <td>${c.commodity}</td>
        <td>${c.market}</td>
        <td>${c.status}</td>
        <td>${new Date(c.etd).toLocaleDateString()}</td>
        <td>${new Date(c.eta).toLocaleDateString()}</td>
      `;
      tbody.appendChild(tr);
    });

    // Vessels
    const vesselTbody = qs("#summaryVessels tbody");
    vesselTbody.innerHTML = "";
    const vessels = {};
    consignments.forEach(c => {
      const key = `${c.vessel}`;
      vessels[key] = vessels[key] || { vessel: c.vessel, pol: c.pol, pod: c.pod, etd: c.etd, eta: c.eta, count: 0 };
      vessels[key].count += 1;
    });
    Object.values(vessels).forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${v.vessel}</td><td>${v.pol}</td><td>${v.pod}</td><td>${new Date(v.etd).toLocaleDateString()}</td><td>${new Date(v.eta).toLocaleDateString()}</td><td>${v.count}</td>`;
      vesselTbody.appendChild(tr);
    });

    // Shipments on route
    const shipTbody = qs("#summaryShipments tbody");
    shipTbody.innerHTML = "";
    consignments.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${c.ref}</td><td>${c.container}</td><td>${c.pol}</td><td>${c.tempAvg || "—"}</td><td>${(c.delays && c.delays.length) ? "Possible delay" : "OK"}</td>`;
      shipTbody.appendChild(tr);
    });

    // Delays
    const delaysEl = qs("#summaryDelays");
    delaysEl.innerHTML = "";
    consignments.flatMap(c => c.delays || []).forEach(d => {
      const li = document.createElement("li");
      li.textContent = d;
      delaysEl.appendChild(li);
    });
  }

  // Open file view
  function openFile(id) {
    const consignments = getSampleData();
    const c = consignments.find(x => x.id === id);
    if (!c) return;
    // Fill left column fields
    qs("#consignee").textContent = c.consignee || "—";
    qs("#exporter").textContent = c.exporter || "Demo Exporter";
    qs("#notifyParty").textContent = c.notifyParty || "—";
    qs("#clientRef").textContent = c.ref || "—";
    qs("#containerNo").textContent = c.container || "—";
    qs("#commodity").textContent = c.commodity || "—";
    qs("#marketDest").textContent = c.market || "—";
    qs("#ppecbStatus").textContent = c.ppecbStatus || "—";
    qs("#dalrrdStatus").textContent = c.dalrrdStatus || "—";
    qs("#coldChainStatus").textContent = c.coldChainStatus || "Active";
    qs("#tempTarget").textContent = c.tempTarget || "—";
    qs("#tempAvg").textContent = c.tempAvg || "—";
    qs("#lastUpdated").textContent = fmtDate(c.lastUpdated);
    qs("#incoterms").textContent = "FOB"; // demo
    qs("#exportNotes").value = c.exportNotes || "";

    qs("#bookingRef").textContent = c.bookingRef || "";
    qs("#vesselVoyage").textContent = c.vessel || "";
    qs("#shippingLine").textContent = c.shippingLine || "";
    qs("#containerType").textContent = c.containerType || "";
    qs("#pol").textContent = c.pol || "";
    qs("#pod").textContent = c.pod || "";
    qs("#etd").textContent = new Date(c.etd).toLocaleString();
    qs("#eta").textContent = new Date(c.eta).toLocaleString();

    // Tasks
    const taskBody = qs("#taskTable tbody");
    taskBody.innerHTML = "";
    (c.tasks || []).forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${t.task}</td><td>${t.status}</td><td>${fmtDate(t.date)}</td>`;
      taskBody.appendChild(tr);
    });

    // Documents (in-memory)
    renderDocsForConsignment(c);

    // Messages
    renderMessagesForConsignment(c);

    // Delays
    const fileDelays = qs("#fileDelays");
    fileDelays.innerHTML = "";
    (c.delays || []).forEach(d => {
      const li = document.createElement("li");
      li.textContent = d;
      fileDelays.appendChild(li);
    });

    // Show file view
    consignmentBar.hidden = false;
    qs("#consignmentTitle").textContent = c.ref;
    qs("#consignmentSub").textContent = `${c.container} • ${c.commodity} → ${c.market}`;
    showView("file");

    // Map: set view and marker
    if (window.L && c.coords) {
      try {
        initMap(c.coords, `${c.container} (${c.ref})`);
      } catch (e) { console.warn(e); }
    }
    // store current open consignment id
    sessionStorage.setItem("paCryo_currentFile", c.id);
  }

  // Click handler for opening file from table
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".open-file");
    if (btn) {
      const id = btn.dataset.ref;
      openFile(id);
    }
  });

  // Bookings form
  const bookingForm = qs("#bookingForm");
  bookingForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const exporterRef = qs("#bkExporterRef").value.trim();
    const commodity = qs("#bkCommodity").value.trim();
    const volume = qs("#bkVolume").value.trim();
    const vessel = qs("#bkVessel").value.trim();
    const route = qs("#bkRoute").value.trim();
    const notes = qs("#bkNotes").value.trim();

    const booking = { id: `BK-${Date.now()}`, exporterRef, commodity, volume, vessel, route, notes, created: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("paCryo_bookings") || "[]");
    existing.push(booking);
    localStorage.setItem("paCryo_bookings", JSON.stringify(existing));

    qs("#bookingFeedback").textContent = "Booking request saved locally (demo).";
    bookingForm.reset();
  });

  // Reports: download CSV
  qs("#downloadReportBtn")?.addEventListener("click", () => {
    const data = getSampleData();
    const rows = [
      ["ConsignmentRef","Container","Commodity","Market","Status","ETD","ETA"]
    ];
    data.forEach(r => rows.push([r.ref, r.container, r.commodity, r.market, r.status, r.etd, r.eta]));
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pa_cryo_summary_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Document uploads (demo)
  const uploadForm = qs("#uploadForm");
  function renderDocsForConsignment(c) {
    const tbody = qs("#docTable tbody");
    tbody.innerHTML = "";
    const docsKey = `paCryo_docs_${c.id}`;
    const docs = JSON.parse(localStorage.getItem(docsKey) || "[]").concat(c.docs || []);
    docs.forEach((d, idx) => {
      const tr = document.createElement("tr");
      const blobUrl = d.data ? (URL.createObjectURL(dataURLtoBlob(d.data))) : "#";
      tr.innerHTML = `<td>${d.name}</td><td>${fmtBytes(d.size||0)}</td><td>${d.type||""}</td><td>${d.data ? `<a href="${blobUrl}" download="${d.name}">Download</a>` : "-"}</td>`;
      tbody.appendChild(tr);
    });
  }
  function dataURLtoBlob(dataurl) {
    const parts = dataurl.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], {type:mime});
  }
  uploadForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fileInput = qs("#docUpload");
    const files = fileInput.files;
    const currentFileId = sessionStorage.getItem("paCryo_currentFile");
    if (!currentFileId) {
      alert("Open a consignment first (click a consignment reference).");
      return;
    }
    const docsKey = `paCryo_docs_${currentFileId}`;
    const stored = JSON.parse(localStorage.getItem(docsKey) || "[]");
    // read files as data URLs for demo download
    const readers = Array.from(files).map(f => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res({ name: f.name, size: f.size, type: f.type, data: r.result });
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then(results => {
      const merged = stored.concat(results);
      localStorage.setItem(docsKey, JSON.stringify(merged));
      // re-render
      const consignments = getSampleData();
      const c = consignments.find(x => x.id === currentFileId);
      if (c) renderDocsForConsignment(c);
      qs("#docUpload").value = "";
    });
  });

  // Messages per consignment
  function renderMessagesForConsignment(c) {
    const list = qs("#messageList");
    list.innerHTML = "";
    const key = `paCryo_msgs_${c.id}`;
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    const msgs = (c.messages || []).concat(stored);
    msgs.forEach(m => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${m.author || user.username}</strong> <span class="muted">• ${fmtDate(m.time || m.created)}</span><div>${m.text}</div>`;
      list.appendChild(li);
    });
  }
  const messageForm = qs("#messageForm");
  messageForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const txt = qs("#messageText").value.trim();
    const currentFileId = sessionStorage.getItem("paCryo_currentFile");
    if (!currentFileId || !txt) return;
    const key = `paCryo_msgs_${currentFileId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const msg = { author: user.username, text: txt, time: new Date().toISOString() };
    existing.unshift(msg);
    localStorage.setItem(key, JSON.stringify(existing));
    // re-render
    const consignments = getSampleData();
    const c = consignments.find(x => x.id === currentFileId);
    if (c) renderMessagesForConsignment(c);
    qs("#messageText").value = "";
  });

  // Map init
  let map, marker;
  function initMap(coords, title) {
    const mapEl = qs("#map");
    if (!mapEl) return;
    if (!map) {
      map = L.map(mapEl, { scrollWheelZoom: false }).setView([coords.lat, coords.lng], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);
    } else {
      map.setView([coords.lat, coords.lng], 6);
      if (marker) marker.remove();
    }
    marker = L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(title || "").openPopup();
    qs("#mapMeta").textContent = title ? `Position: ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : "";
  }

  // initialize UI
  renderSummary();

  // If the initial URL contained a consignment hash or session has open file, open it
  const initialFile = sessionStorage.getItem("paCryo_currentFile");
  if (initialFile) {
    openFile(initialFile);
  }

  // small helper to show views (exposed to global for debugging)
  window.paCryo = { showView, renderSummary, openFile };

});
