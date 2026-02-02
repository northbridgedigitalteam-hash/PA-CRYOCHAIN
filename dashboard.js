document.addEventListener("DOMContentLoaded", () => {
    const userRaw = localStorage.getItem("paCryoUser");
    if (!userRaw) {
        window.location.href = "index.html";
        return;
    }

    const user = JSON.parse(userRaw);
    const isInternal = user.role === "internal";

    // UI references
    const welcomeMessage = document.getElementById("welcomeMessage");
    const userRoleLabel = document.getElementById("userRoleLabel");
    const internalNav = document.getElementById("internalNav");
    const logoutBtn = document.getElementById("logoutBtn");

    const commodityFilter = document.getElementById("commodityFilter");
    const marketFilter = document.getElementById("marketFilter");

    const overviewCards = document.getElementById("overviewCards");
    const tempSummary = document.getElementById("tempSummary");
    const regSummary = document.getElementById("regSummary");

    const shipmentsTableBody = document.querySelector("#shipmentsTable tbody");
    const temperaturesTableBody = document.querySelector("#temperaturesTable tbody");
    const documentsTableBody = document.querySelector("#documentsTable tbody");
    const regTableBody = document.querySelector("#regTable tbody");
    const notificationsList = document.getElementById("notificationsList");

    // --------- SAMPLE DEMO DATA (Replace with API integration later) -------------

    const shipments = [
        {
            id: "NB-2026-001",
            container: "MSCU1234567",
            commodityGroup: "Citrus",
            commodity: "Navel Oranges",
            market: "EU",
            ppecbStatus: "Inspection Passed",
            ppecbStage: "Cooling Authorised",
            ppecbNotes: "Within spec, no NCR.",
            dalrrdStatus: "Phyto Approved",
            dalrrdStage: "eCert Completed",
            tempTarget: "0.0°C to +0.5°C",
            tempAvg: 0.2,
            tempStatus: "Within Spec",
            tempSeverity: "ok",
            coldChainStatus: "Compliant",
            documents: [
                { type: "PPECB Inspection Sheet", status: "Available", link: "#" },
                { type: "Phytosanitary Certificate", status: "Available", link: "#" }
            ]
        },
        {
            id: "NB-2026-002",
            container: "MSCU2345678",
            commodityGroup: "Deciduous",
            commodity: "Table Grapes",
            market: "UK",
            ppecbStatus: "Inspection Passed",
            ppecbStage: "Cooling",
            ppecbNotes: "SO₂ pads verified, cartons sound.",
            dalrrdStatus: "Awaiting Approval",
            dalrrdStage: "Docs Submitted",
            tempTarget: "-1.0°C to -0.5°C",
            tempAvg: -0.3,
            tempStatus: "Slightly Above Target",
            tempSeverity: "warn",
            coldChainStatus: "Watch",
            documents: [
                { type: "PPECB Inspection Sheet", status: "Available", link: "#" },
                { type: "Commercial Invoice", status: "Available", link: "#" }
            ]
        },
        {
            id: "NB-2026-003",
            container: "MSCU3456789",
            commodityGroup: "Stone Fruit",
            commodity: "Plums",
            market: "Middle East",
            ppecbStatus: "Inspection Failed",
            ppecbStage: "NCR Issued",
            ppecbNotes: "Pressure test failed – soft fruit.",
            dalrrdStatus: "On Hold",
            dalrrdStage: "Awaiting PPECB Clearance",
            tempTarget: "-0.5°C to +1.0°C",
            tempAvg: 3.1,
            tempStatus: "Outside Spec",
            tempSeverity: "bad",
            coldChainStatus: "Non-compliant",
            documents: [
                { type: "NCR Report", status: "Available", link: "#" }
            ]
        },
        {
            id: "NB-2026-004",
            container: "MSCU4567890",
            commodityGroup: "Exotic",
            commodity: "Avocados",
            market: "Far East",
            ppecbStatus: "Inspection Booked",
            ppecbStage: "Booking Confirmed",
            ppecbNotes: "Inspection scheduled 2026-02-03.",
            dalrrdStatus: "Not Submitted",
            dalrrdStage: "Pending Docs",
            tempTarget: "5°C to 7°C",
            tempAvg: 5.8,
            tempStatus: "Within Spec",
            tempSeverity: "ok",
            coldChainStatus: "Compliant",
            documents: [
                { type: "Packing List", status: "Missing", link: "#" }
            ]
        }
    ];

    const notifications = [
        {
            message: "PPECB inspection passed for NB-2026-001 (MSCU1234567).",
            time: "Just now"
        },
        {
            message: "NCR issued for NB-2026-003 – pressure failure on plums.",
            time: "10 min ago"
        },
        {
            message: "Docs for avocados (NB-2026-004) still required for DALRRD submission.",
            time: "Today"
        }
    ];

    // -------------- INITIAL SETUP -----------------

    welcomeMessage.textContent = `Welcome, ${user.username} – ${
        isInternal ? "Internal Operations View" : "Client View"
    }`;
    userRoleLabel.textContent = isInternal ? "Internal Operations / PA" : "Client / Exporter";

    if (!isInternal && internalNav) {
        internalNav.style.display = "none";
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("paCryoUser");
        window.location.href = "index.html";
    });

    // Navigation handling
    document.querySelectorAll(".nav-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-section");
            if (!target) return;

            // Toggle button active state
            document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            // Toggle sections
            document.querySelectorAll(".section").forEach((section) => {
                if (section.id === `section-${target}`) {
                    section.classList.add("visible");
                } else {
                    section.classList.remove("visible");
                }
            });
        });
    });

    commodityFilter.addEventListener("change", renderAll);
    marketFilter.addEventListener("change", renderAll);

    // ---------- Rendering functions ----------

    function filteredShipments() {
        const commodity = commodityFilter.value;
        const market = marketFilter.value;

        return shipments.filter((s) => {
            const matchCommodity = commodity === "all" || s.commodityGroup === commodity;
            const matchMarket = market === "all" || s.market === market;
            return matchCommodity && matchMarket;
        });
    }

    function renderOverview() {
        const rows = filteredShipments();
        const total = rows.length;
        const compliant = rows.filter((r) => r.tempSeverity === "ok").length;
        const warning = rows.filter((r) => r.tempSeverity === "warn").length;
        const nonCompliant = rows.filter((r) => r.tempSeverity === "bad").length;

        const passedPPECB = rows.filter((r) => r.ppecbStatus === "Inspection Passed").length;
        const awaitingPPECB = rows.filter((r) => r.ppecbStatus === "Inspection Booked").length;
        const failedPPECB = rows.filter((r) => r.ppecbStatus === "Inspection Failed").length;

        overviewCards.innerHTML = `
            <div class="card">
                <div class="card-title">Total Active Shipments</div>
                <div class="card-value">${total}</div>
                <div class="card-meta">Filtered by current commodity & market</div>
            </div>
            <div class="card">
                <div class="card-title">Cold Chain Compliant</div>
                <div class="card-value">${compliant}</div>
                <div class="card-meta">${warning} watch • ${nonCompliant} non-compliant</div>
            </div>
            <div class="card">
                <div class="card-title">PPECB Inspections</div>
                <div class="card-value">${passedPPECB}</div>
                <div class="card-meta">${awaitingPPECB} booked • ${failedPPECB} failed</div>
            </div>
        `;

        tempSummary.innerHTML = rows
            .map(
                (r) => `
            <p>
                <strong>${r.container}</strong> – ${r.commodity} (${r.commodityGroup})<br />
                Target: ${r.tempTarget} • Avg: ${r.tempAvg.toFixed(1)}°C
                ${renderStatusPill(r.tempSeverity, r.tempStatus)}
            </p>
        `
            )
            .join("");

        const regOk = rows.filter(
            (r) => r.ppecbStatus === "Inspection Passed" && r.dalrrdStatus.includes("Approved")
        ).length;

        regSummary.innerHTML = `
            <p>
                Loads with <strong>PPECB passed</strong> and <strong>DALRRD approved</strong>: ${regOk}
            </p>
            <p>
                For final legal status, always confirm with official PPECB & DALRRD records.
            </p>
        `;
    }

    function renderShipmentsTable() {
        const rows = filteredShipments();
        shipmentsTableBody.innerHTML = rows
            .map(
                (s) => `
            <tr>
                <td>${s.id}</td>
                <td>${s.container}</td>
                <td>${s.commodity} (${s.commodityGroup})</td>
                <td>${s.market}</td>
                <td>${renderStatusPill(
                    s.ppecbStatus === "Inspection Failed"
                        ? "bad"
                        : s.ppecbStatus === "Inspection Passed"
                        ? "ok"
                        : "warn",
                    s.ppecbStatus
                )}</td>
                <td>${renderStatusPill(
                    s.dalrrdStatus.includes("Approved")
                        ? "ok"
                        : s.dalrrdStatus === "Not Submitted"
                        ? "warn"
                        : "warn",
                    s.dalrrdStatus
                )}</td>
                <td>${renderStatusPill(s.tempSeverity, s.coldChainStatus)}</td>
            </tr>
        `
            )
            .join("");
    }

    function renderTemperaturesTable() {
        const rows = filteredShipments();
        temperaturesTableBody.innerHTML = rows
            .map(
                (s) => `
            <tr>
                <td>${s.container}</td>
                <td>${s.commodity} (${s.commodityGroup})</td>
                <td>${s.tempTarget}</td>
                <td>${s.tempAvg.toFixed(1)}°C</td>
                <td>${renderStatusPill(s.tempSeverity, s.tempStatus)}</td>
            </tr>
        `
            )
            .join("");
    }

    function renderDocumentsTable() {
        const rows = filteredShipments();
        const docs = rows.flatMap((s) =>
            s.documents.map((d) => ({
                shipmentId: s.id,
                container: s.container,
                ...d
            }))
        );

        documentsTableBody.innerHTML = docs
            .map(
                (d) => `
            <tr>
                <td>${d.shipmentId}</td>
                <td>${d.container}</td>
                <td>${d.type}</td>
                <td>${renderStatusPill(
                    d.status === "Available" ? "ok" : "warn",
                    d.status
                )}</td>
                <td>${d.link}Download</a></td>
            </tr>
        `
            )
            .join("");
    }

    function renderRegTable() {
        if (!isInternal || !regTableBody) return;
        const rows = filteredShipments();
        regTableBody.innerHTML = rows
            .map(
                (s) => `
            <tr>
                <td>${s.id}</td>
                <td>${s.container}</td>
                <td>${s.commodity} (${s.commodityGroup})</td>
                <td>${s.ppecbStage}</td>
                <td>${s.ppecbNotes}</td>
                <td>${s.dalrrdStage}</td>
            </tr>
        `
            )
            .join("");
    }

    function renderNotifications() {
        notificationsList.innerHTML = notifications
            .map(
                (n) => `
            <li>
                <span>${n.message}</span>
                <small>${n.time}</small>
            </li>
        `
            )
            .join("");
    }

    function renderStatusPill(severity, label) {
        let cls = "status-ok";
        if (severity === "warn") cls = "status-warn";
        if (severity === "bad") cls = "status-bad";
        return `<span class="status-pill ${cls}">${label}</span>`;
    }

    function renderAll() {
        renderOverview();
        renderShipmentsTable();
        renderTemperaturesTable();
        renderDocumentsTable();
        renderRegTable();
        renderNotifications();
    }

    renderAll();
});
