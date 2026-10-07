document.addEventListener("DOMContentLoaded", () => {
  renderNavAuthState();

  const logoutBtn = document.getElementById("nav-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => logout("/"));
  }
});
