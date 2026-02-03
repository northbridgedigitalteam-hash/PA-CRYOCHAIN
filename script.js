// Common page behaviours for PA-CryoChain demo
// - populate footer year
// - redirect to dashboard if already signed in (login/index pages)
// - redirect to login if not signed in (dashboard page)
// - optional service worker registration (uncomment to enable)

document.addEventListener("DOMContentLoaded", () => {
  // Populate any element with id="year"
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // simple helper to get stored demo user
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem("paCryoUser") || "null");
    } catch (e) {
      console.warn("Invalid paCryoUser in localStorage, clearing it.");
      localStorage.removeItem("paCryoUser");
      return null;
    }
  }

  const user = getUser();
  const pathname = window.location.pathname;
  const isLoginPage = pathname.endsWith("/login.html") || pathname.endsWith("/index.html") || pathname === "/" || pathname.endsWith("/PA-CRYOCHAIN/");
  const isDashboard = pathname.endsWith("/dashboard.html") || pathname.includes("/dashboard");

  // If user is logged in and they're on the login/landing page, send to dashboard
  if (user && isLoginPage) {
    // Role-based landing can be handled by dashboard logic (it will show exporter/internal)
    window.location.replace("dashboard.html");
    return;
  }

  // If the user is not logged in and they're on the dashboard, send to login
  if (!user && isDashboard) {
    window.location.replace("login.html");
    return;
  }

  // Optional: register a service worker for caching (uncomment in production and add /sw.js)
  /*
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service worker registered:', reg.scope);
    }).catch(err => {
      console.warn('Service worker registration failed:', err);
    });
  }
  */
});
