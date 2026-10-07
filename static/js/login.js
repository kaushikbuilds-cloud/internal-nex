document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const formError = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.textContent = "";
    formError.classList.add("hidden");

    setLoading(submitBtn, true, "Logging in...");

    const { ok, status, data } = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    setLoading(submitBtn, false);

    if (!ok) {
      // The backend always returns a generic message for bad credentials,
      // so we never reveal whether the email exists.
      formError.textContent = status === 429
        ? "Too many attempts. Please wait a moment and try again."
        : formatApiError(data, "Invalid email or password");
      formError.classList.remove("hidden");
      return;
    }

    window.location.href = "/dashboard.html";
  });
});
