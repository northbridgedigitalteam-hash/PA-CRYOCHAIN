document.addEventListener("DOMContentLoaded", () => {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const existingUser = localStorage.getItem("paCryoUser");
    if (existingUser && window.location.pathname.endsWith("index.html")) {
        window.location.href = "dashboard.html";
        return;
    }

    const form = document.getElementById("loginForm");
    if (!form) return;

   Love this feedback, Astrid – this is exactly how real exporters and agents think about a system 👌  

Below is a **full, updated code set** that implements what you asked:

- ✅ Exporter lands on a **Summary Dashboard** (consignments / vessels / shipments).
- ✅ Clicking a consignment opens a **file-level dashboard** (like your screenshot).
- ✅ **Map fixed** – container position shows using Leaflet + OpenStreetMap.
- ✅ **Exporter notes removed** for exporters, kept for internal ops.
- ✅ **Task Summary** updated with dates & tasks:
  - Booking confirmed  
  - Container pack date  
  - Container gate in  
  - Packing list  
  - Invoice
- ✅ **Document Status** updated:
  - SI submitted  
  - Export certificate status  
  - Phyto status  
  - Origin certificate status
- ✅ **Message board per file** – exporter/ops can post messages about the consignment.
- ✅ **Bookings tab** – exporter can create a new booking request to the agent.
- ✅ **Reports tab** – exporter can export summary data to Excel (CSV download).
- ✅ **Delays & Disruptions panel** – shows sample delays (Transnet, Splash247-style) with clear note that it’s currently manually captured.

> 🔐 Login is still demo: any username + password, just pick **Client / Exporter** or **Internal Operations / PA**.  
> Exporter notes panel only appears if you log in as **Internal**.

---

## 1️⃣ `index.html` – Login (unchanged structure, just minor tweaks)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PA-CryoChain | Log In</title>
    <link rel="stylesheet" href="style.css" />
    <link rel="manifest" href="manifest.json" />
</head>
<body>
    <header class="site-header">
        <div class="logo-area">
            <div class="logo-symbol">❄️🍎🍊</div>
            <div class="logo-text">
                <h1>PA-CryoChain</h1>
                <p>Consignment & Cold Chain Visibility</p>
            </div>
        </div>
    </header>

    <main class="auth-layout">
        <section class="auth-info">
            <h2>End-to-End Visibility for Citrus, Deciduous, Exotic & Stone Fruit</h2>
            <p>
                Track consignments, vessel movements, PPECB & DALRRD status, delays and documents in
                one portal. This login is a demo only – any username and password will work.
            </p>
            <ul class="feature-list">
                <li>• Summary dashboard by consignment, vessel and shipments on route</li>
                <li>• File-level dashboard with map, tasks, docs, delays and messages</li>
                <li>• Exporter booking requests straight to your agent</li>
                <li>• Reports exportable to Excel (CSV)</li>
            </ul>
        </section>

        <section class="auth-card">
            <h2>Sign in to PA-CryoChain</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">Email or Username</label>
                    <input type="text" id="username" name="username" required placeholder="you@exporter.co.za" />
                </div>

                <div class="form-group">
                    <label for="role">Login As</label>
                    <select id="role" name="role" required>
                        <option value="">Select role...</option>
                        <option value="client">Client / Exporter</option>
                        <option value="internal">Internal Operations / PA</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required placeholder="••••••••" />
                </div>

                <button type="submit" class="btn primary-btn">Sign In</button>

                <p class="disclaimer">
                    Demo only – no real authentication. PPECB & DALRRD statuses shown in the
                    dashboard mirror operational information and do not replace official systems.
                </p>
            </form>
        </section>
    </main>

    <footer class="site-footer">
        <p>
            PPECB-aligned • DALRRD documentation compliant • Built for citrus, deciduous, exotic &
            stone fruit exports.
        </p>
        <p class="footer-meta">
            &copy; <span id="year"></span> PA-CryoChain. All rights reserved.
        </p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
