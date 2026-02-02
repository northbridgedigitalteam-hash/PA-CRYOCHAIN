document.addEventListener("DOMContentLoaded", () => {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const existingUser = localStorage.getItem("paCryoUser");
    if (existingUser && window.location.pathname.endsWith("index.html")) {
        // Already logged in – send to dashboard
        window.location.href = "dashboard.html";
        return;
    }

    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const role = document.getElementById("role").value;
        const password = document.getElementById("password").value;

        if (!username || !role || !password) {
            alert("Please complete all fields.");
            return;
        }

        // NOTE: This is a front-end demo only – no real authentication.
        const user = {
            username,
            role, // "client" or "internal"
            loginTime: new Date().toISOString()
        };

        localStorage.setItem("paCryoUser", JSON.stringify(user));
        window.location.href = "dashboard.html";
    });
});
