document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // 1. Set year in the footer (if the element exists on the page)
    // -------------------------------------------------------------------------
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // -------------------------------------------------------------------------
    // 2. Detect if we are on the login page (index.html / root)
    //    This is important for GitHub Pages where the path may contain the repo.
    // -------------------------------------------------------------------------
    const path = window.location.pathname;
    const isRoot =
        path === "/" ||
        path === "" ||
        // adjust this if your repo name changes on GitHub Pages
        path.endsWith("/PA-CRYOCHAIN/");

    const onLoginPage = isRoot || path.endsWith("index.html");

    // -------------------------------------------------------------------------
    // 3. If user is already "logged in" and hits the login page:
    //    - send them straight to the dashboard with the correct role-based hash
    // -------------------------------------------------------------------------
    const storedUser = localStorage.getItem("paCryoUser");

    if (onLoginPage && storedUser) {
        try {
            const user = JSON.parse(storedUser);
            const hash = user.role === "client" ? "#exporter" : "#internal";
            window.location.href = `dashboard.html${hash}`;
            return; // stop further execution – we are redirecting
        } catch (err) {
            console.error("Failed to parse stored user data:", err);
            // Clear invalid data and stay on login page
            localStorage.removeItem("paCryoUser");
        }
    }

    // -------------------------------------------------------------------------
    // 4. Login form handling – this script is only active on index.html
    // -------------------------------------------------------------------------
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) {
        // We are not on the login page (likely on dashboard.html), so nothing to do.
        return;
    }

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById("username");
        const roleSelect = document.getElementById("role");
        const passwordInput = document.getElementById("password");

        const username = (usernameInput?.value || "").trim();
        const role = roleSelect?.value || ""; // "client" (exporter) or "internal" (ops/PA)
        const password = passwordInput?.value || "";

        if (!username || !role || !password) {
            alert("Please complete all fields before signing in.");
            return;
        }

        // ---------------------------------------------------------------------
        // DEMO ONLY:
        //   No real authentication – any username/password combination is accepted.
        //   In production you would validate against a backend auth service.
        // ---------------------------------------------------------------------
        const userData = {
            username,
            role,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem("paCryoUser", JSON.stringify(userData));

        // Exporter lands on summary dashboard (consignments / vessels / shipments),
        // Internal ops lands on the operational/file-level dashboard.
        const hash = role === "client" ? "#exporter" : "#internal";
        window.location.href = `dashboard.html${hash}`;
    });
});
