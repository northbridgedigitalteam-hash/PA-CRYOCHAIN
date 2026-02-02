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

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const role = document.getElementById("role").value;
        const password = document.getElementById("password").value;

        if (!username || !role || !password) {
            alert("Please complete all fields.");
            return;
        }

        // Demo only: any username/password works.
        const user = {
            username,
            role,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem("paCryoUser", JSON.stringify(user));
        window.location.href = "dashboard.html";
    });
});
