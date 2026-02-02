document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // 1. Set footer year (if element exists)
    // -------------------------------------------------------------------------
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // -------------------------------------------------------------------------
    // 2. If a user is already logged in, send them straight to dashboard
    // -------------------------------------------------------------------------
    const storedUserJson = localStorage.getItem("paCryoUser");
    if (storedUserJson) {
        try {
            const storedUser = JSON.parse(storedUserJson);
            const role = storedUser.role === "client" ? "client" : "internal";
            const hash = role === "client" ? "#exporter" : "#internal";

            // Prevent infinite loop: only redirect if we're on the login page
            const path = window.location.pathname;
            const isLoginPage =
                path.endsWith("index.html") ||
                path === "/" ||
                path === "" ||
                // adjust this if your GitHub Pages repo name changes
                path.endsWith("/PA-CRYOCHAIN/");

            if (isLoginPage) {
                window.location.href = `dashboard.html${hash}`;
                return;
            }
        } catch (e) {
            console.error("Invalid user data in localStorage, clearing it:", e);
            localStorage.removeItem("paCryoUser");
        }
    }

    // -------------------------------------------------------------------------
    // 3. Handle login form submit
    // -------------------------------------------------------------------------
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) {
        // No login form on this page; nothing more to do.
        return;
    }

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById("username");
        const roleSelect = document.getElementById("role");
        const passwordInput = document.getElementById("password");

        const username = (usernameInput?.value || "").trim();
        const role = roleSelect?.value || ""; // "client" or "internal"
        const password = passwordInput?.value || "";

        if (!username || !role || !password) {
            alert("Please complete all fields before signing in.");
            return;
        }

        // DEMO ONLY - any credentials are accepted
        const user = {
            username,
            role,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem("paCryoUser", JSON.stringify(user));

        // Exporter lands on summary dashboard, internal on ops/file dashboard
        const hash = role === "client" ? "#exporter" : "#internal";
        window.location.href = `dashboard.html${hash}`;
    });
});
