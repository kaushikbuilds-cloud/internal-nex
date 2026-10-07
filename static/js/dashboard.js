document.addEventListener("DOMContentLoaded", async () => {
  const loadingEl = document.getElementById("dashboard-loading");
  const contentEl = document.getElementById("dashboard-content");
  const emailEl = document.getElementById("user-email");
  const roleEl = document.getElementById("user-role");
  const logoutBtn = document.getElementById("logout-btn");
  const adminSection = document.getElementById("admin-section");
  const adminResult = document.getElementById("admin-result");

  const { ok, data } = await apiRequest("/api/auth/me");

  if (!ok) {
    window.location.href = "/login.html";
    return;
  }

  loadingEl.classList.add("hidden");
  contentEl.classList.remove("hidden");

  emailEl.textContent = data.email;
  roleEl.textContent = data.role;

  if (data.role === "admin") {
    adminSection.classList.remove("hidden");
    const adminResponse = await apiRequest("/api/admin/ping");
    adminResult.textContent = adminResponse.ok
      ? adminResponse.data.message
      : "Could not reach admin endpoint.";
  }

  logoutBtn.addEventListener("click", () => logout("/login.html"));
});
