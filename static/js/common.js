/* Shared helpers reused across pages. No framework, just small functions. */

/**
 * Wrapper around fetch() that always sends cookies to our own origin
 * and parses JSON responses consistently.
 */
async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin", // send the httpOnly auth cookie
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

/** Checks whether the current visitor is authenticated. */
async function getCurrentUser() {
  const { ok, data } = await apiRequest("/api/auth/me");
  return ok ? data : null;
}

/** Logs the user out and redirects to the given page (defaults to home). */
async function logout(redirectTo = "/") {
  await apiRequest("/api/auth/logout", { method: "POST" });
  window.location.href = redirectTo;
}

/** Toggles a button's disabled state and label while an async action runs. */
function setLoading(button, isLoading, loadingText = "Please wait...") {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.dataset.originalText || button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

/** Extracts a human-readable message from an API error response. */
function formatApiError(data, fallback = "Something went wrong. Please try again.") {
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    // FastAPI/Pydantic validation error array
    const first = data.detail[0];
    return first.msg || fallback;
  }
  return fallback;
}

/** Populates the shared navbar based on authentication state. */
async function renderNavAuthState() {
  const authLinks = document.getElementById("nav-auth-links");
  const userLinks = document.getElementById("nav-user-links");
  const userEmailEl = document.getElementById("nav-user-email");
  if (!authLinks || !userLinks) return;

  const user = await getCurrentUser();

  if (user) {
    authLinks.classList.add("hidden");
    userLinks.classList.remove("hidden");
    if (userEmailEl) userEmailEl.textContent = user.email;
  } else {
    authLinks.classList.remove("hidden");
    userLinks.classList.add("hidden");
  }
}
