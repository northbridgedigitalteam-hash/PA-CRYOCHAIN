document.addEventListener("DOMContentLoaded", () => {
    // Redirect to login if not "logged in"
    const userRaw = localStorage.getItem("paCryoUser");
    if (!userRaw) {
        window.location.href = "index.html";
        return;
    }
    const user = JSON.parse(userRaw);

    // Header info
    const headerYear = document.getElementById("headerYear");
    const headerUser = document.getElementById("headerUser");
    const logoutBtn = document.getElementById("logoutBtn");

    headerYear.textContent = new Date().getFullYear();
    headerUser.textContent = `${user.username} (${user.role === "internal" ? "Internal" : "Client"})`;

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("paCryoUser");
        window.location.href = "index.html";
    });

    // ------------------ DEMO CONSIGNMENT DATA ------------------

    const consignment = {
        id: "FRH60022",
        consignee: "PORT INTERNATIONAL EUROPEAN SOURCING GMBH",
        exporter: "GREEN FIELDS EXPORTERS (PTY) LTD",
        notifyParty: "PORT INTERNATIONAL EUROPEAN SOURCING GMBH",
        clientRef: "PIE/2026/FRH60022",
        containerNo: "MSCU1234567",
        commodity: "Soft Citrus – Clementines",
        marketDest: "EUROPE • ROTTERDAM, NETHERLANDS",
        ppecbStatus: "Inspection Passed – Cooling Authorised",
        dalrrdStatus: "Phyto Approved – eCert Completed",
        coldChainStatus: "Compliant – within soft citrus EU spec",
        tempTarget: "-0.5°C to 0.0°C",
        tempAvg: 0.1,
        lastUpdated: "2026-02-01 16:30 SAST",
        incoterms: "CFR – Reefer Container",
        exportNotes: [
            "1. Exporter: GREEN FIELDS EXPORTERS (PTY) LTD.",
            "2. Product: Class 1 Soft Citrus – Clementines packed in 15kg cartons.",
            "3. Market: EU – Rotterdam. CBS protocol applicable.",
            "4. PPECB inspection completed and passed. No NCR issued.",
            "5. DALRRD phytosanitary certificate issued via eCert. Original to consignment docs.",
            "6. Container pre-cooled and shipped in good order.",
            "7. Monitor cold chain from depot to vessel – any deviations >0.5°C to be escalated."
        ].join("\n"),

        tasks: [
            {
                task: "PPECB Inspection",
                status: "Completed",
                severity: "ok",
                owner: "PPECB Inspector"
            },
            {
                task: "DALRRD / eCert Application",
                status: "Completed",
                severity: "ok",
                owner: "Export Docs Team"
            },
            {
                task: "Commercial Invoice & Packing List",
                status: "Completed",
                severity: "ok",
                owner: "Exporter"
            },
            {
                task: "VGM / Weighbridge",
                status: "Pending Confirmation",
                severity: "warn",
                owner: "Depot"
            }
        ],

        docStatus: [
            {
                doc: "PPECB Inspection Report",
                status: "Complete",
                severity: "ok",
                requiredBy: "Before Gate-in"
            },
            {
                doc: "Phytosanitary Certificate (DALRRD)",
                status: "Complete",
                severity: "ok",
                requiredBy: "Before Vessel Load"
            },
            {
                doc: "Commercial Invoice",
                status: "Complete",
                severity: "ok",
                requiredBy: "Before Customs"
            },
            {
                doc: "Packing List",
                status: "In Progress",
                severity: "warn",
                requiredBy: "Before Gate-in"
            }
        ],

        bookingRef: "NB-2026-001",
        vesselVoyage: "SANTA TERESA / 052W",
        shippingLine: "MSC",
        containerType: "40' HC Reefer",
        pol: "Port of Ngqura (ZA NQZ)",
        pod: "Rotterdam (NL RTM)",
        etd: "2026-02-05",
        eta: "2026-02-19",

        // Map position – approx. off Port of Ngqura
        position: {
            lat: -33.8,
            lng: 25.7,
            description: "En route from Nelson Mandela Bay to Rotterdam"
        }
    };

    // ------------------ FILL SUMMARY FIELDS ------------------

    const el = (id) => document.getElementById(id);

    el("consignmentTitle").textContent = `Consignment ${consignment.id}`;
    el("consignmentSub").textContent =
        "Shipment overview with PPECB, DALRRD/eCert, cold chain & documents";

    el("consignee").textContent = consignment.consignee;
    el("exporter").textContent = consignment.exporter;
    el("notifyParty").textContent = consignment.notifyParty;
    el("clientRef").textContent = consignment.clientRef;
    el("containerNo").textContent = consignment.containerNo;
    el("commodity").textContent = consignment.commodity;
    el("marketDest").textContent = consignment.marketDest;

    el("ppecbStatus").textContent = consignment.ppecbStatus;
    el("dalrrdStatus").textContent = consignment.dalrrdStatus;
    el("coldChainStatus").textContent = consignment.coldChainStatus;
    el("tempTarget").textContent = consignment.tempTarget;
    el("tempAvg").textContent = `${consignment.tempAvg.toFixed(1)}°C`;
    el("lastUpdated").textContent = consignment.lastUpdated;
    el("incoterms").textContent = consignment.incoterms;

    el("exportNotes").value = consignment.exportNotes;

    el("bookingRef").textContent = consignment.bookingRef;
    el("vesselVoyage").textContent = consignment.vesselVoyage;
    el("shippingLine").textContent = consignment.shippingLine;
    el("containerType").textContent = consignment.containerType;
    el("pol").textContent = consignment.pol;
    el("pod").textContent = consignment.pod;
    el("etd").textContent = consignment.etd;
    el("eta").textContent = consignment.eta;

    // ------------------ TASK & DOC STATUS TABLES ------------------

    const taskTableBody = document.querySelector("#taskTable tbody");
    const docStatusTableBody = document.querySelector("#docStatusTable tbody");

    function statusPill(label, severity) {
        let cls = "status-ok";
        if (severity === "warn") cls = "status-warn";
        if (severity === "bad") cls = "status-bad";
        return `<span class="status-pill ${cls}">${label}</span>`;
    }

    taskTableBody.innerHTML = consignment.tasks
        .map(
            (t) => `
        <tr>
            <td>${t.task}</td>
            <td>${statusPill(t.status, t.severity)}</td>
            <td>${t.owner}</td>
        </tr>
    `
        )
        .join("");

    docStatusTableBody.innerHTML = consignment.docStatus
        .map(
            (d) => `
        <tr>
            <td>${d.doc}</td>
            <td>${statusPill(d.status, d.severity)}</td>
            <td>${d.requiredBy}</td>
        </tr>
    `
        )
        .join("");

    // ------------------ MAP SETUP (Leaflet) ------------------

    const map = L.map("map").setView([consignment.position.lat, consignment.position.lng], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    L.marker([consignment.position.lat, consignment.position.lng])
        .addTo(map)
        .bindPopup(
            `<strong>Container ${consignment.containerNo}</strong><br>${consignment.position.description}`
        )
        .openPopup();

    const mapMeta = document.getElementById("mapMeta");
    mapMeta.textContent = `Container ${consignment.containerNo} • ${consignment.position.description} • Last update: ${consignment.lastUpdated}`;

    // ------------------ DOCUMENT UPLOAD / DOWNLOAD ------------------

    const uploadForm = document.getElementById("uploadForm");
    const fileInput = document.getElementById("docUpload");
    const docTableBody = document.querySelector("#docTable tbody");

    // In-memory list of uploaded docs (per session)
    const uploadedDocs = [];

    uploadForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const files = Array.from(fileInput.files || []);
        if (!files.length) {
            alert("Please choose one or more files to upload.");
            return;
        }

        files.forEach((file) => {
            const url = URL.createObjectURL(file);
            uploadedDocs.push({
                name: file.name,
                size: file.size,
                type: file.type || "Unknown",
                url
            });
        });

        fileInput.value = "";
        renderDocTable();
    });

    function renderDocTable() {
        if (!uploadedDocs.length) {
            docTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; color:#6b7280; font-size:0.78rem;">
                        No documents uploaded yet. Use "Upload documents" to add files for this consignment.
                    </td>
                </tr>
            `;
            return;
        }

        docTableBody.innerHTML = uploadedDocs
            .map((doc, index) => {
                const sizeKb = Math.round(doc.size / 102.4) / 10; // one decimal
                return `
                <tr>
                    <td>${doc.name}</td>
                    <td>${sizeKb} KB</td>
                    <td>${doc.type}</td>
                    <td>
                        <a href="${doc.url}" download="${doc.name}">Download</a>
                    </td>
                </tr>
            `;
            })
            .join("");
    }

    // Initial doc table (empty)
    renderDocTable();
});
