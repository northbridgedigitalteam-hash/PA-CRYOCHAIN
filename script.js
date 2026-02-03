// Improved login handling and safer localStorage use.
// IDs must match index.html
document.addEventListener("DOMContentLoaded", () => {
    // 1. Set footer year (if element exists)
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 2. If a user is already logged in, send them straight to dashboard
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
                path.endsWith("/PA-CRYOCHAIN/");

            if (isLoginPage) {
                // use assign to keep history consistent
                window.location.assign(`dashboard.html${hash}`);
                return;
            }
        } catch (e) {
            console.error("Invalid user data in localStorage, clearing it:", e);
            localStorage.removeItem("paCryoUser");
        }
    }

    // 3. Handle login form submit
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const feedbackEl = document.getElementById("loginFeedback");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        feedbackEl.textContent = "";

        const usernameInput = document.getElementById("username");
        const roleSelect = document.getElementById("role");
        const passwordInput = document.getElementById("password");

        const username = (usernameInput?.value || "").trim();
        const role = roleSelect?.value || ""; // "client" or "internal"
        const password = passwordInput?.value || "";

        if (!username || !role || !password) {
            feedbackEl.textContent = "Please complete all fields before signing in.";
            feedbackEl.classList.add("error");
            return;
        }

        // DEMO ONLY - any credentials are accepted
        const user = {
            username,
            role,
            loginTime: new Date().toISOString()
        };

        try {
            localStorage.setItem("paCryoUser", JSON.stringify(user));
        } catch (e) {
            console.error("Unable to save user in localStorage", e);
        }

        // Exporter lands on summary dashboard, internal on ops/file dashboard
        const hash = role === "client" ? "#exporter" : "#internal";
        window.location.assign(`dashboard.html${hash}`);
    });
});
