document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm-password");

  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const confirmError = document.getElementById("confirm-password-error");
  const formError = document.getElementById("form-error");
  const formSuccess = document.getElementById("form-success");
  const submitBtn = document.getElementById("submit-btn");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validatePassword(password) {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter.";
    if (!/\d/.test(password)) return "Password must contain at least one number.";
    return "";
  }

  function validateForm() {
    let valid = true;

    if (!EMAIL_RE.test(emailInput.value.trim())) {
      emailError.textContent = "Enter a valid email address.";
      emailInput.setAttribute("aria-invalid", "true");
      valid = false;
    } else {
      emailError.textContent = "";
      emailInput.removeAttribute("aria-invalid");
    }

    const passwordMessage = validatePassword(passwordInput.value);
    if (passwordMessage) {
      passwordError.textContent = passwordMessage;
      passwordInput.setAttribute("aria-invalid", "true");
      valid = false;
    } else {
      passwordError.textContent = "";
      passwordInput.removeAttribute("aria-invalid");
    }

    if (confirmInput.value !== passwordInput.value || confirmInput.value === "") {
      confirmError.textContent = "Passwords do not match.";
      confirmInput.setAttribute("aria-invalid", "true");
      valid = false;
    } else {
      confirmError.textContent = "";
      confirmInput.removeAttribute("aria-invalid");
    }

    return valid;
  }

  [emailInput, passwordInput, confirmInput].forEach((input) => {
    input.addEventListener("input", validateForm);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.classList.add("hidden");
    formSuccess.classList.add("hidden");

    if (!validateForm()) return;

    setLoading(submitBtn, true, "Creating account...");

    const { ok, status, data } = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    setLoading(submitBtn, false);

    if (!ok) {
      if (status === 409) {
        formError.textContent = "An account with this email already exists.";
      } else if (status === 429) {
        formError.textContent = "Too many attempts. Please wait a moment and try again.";
      } else {
        formError.textContent = formatApiError(data, "Could not create account.");
      }
      formError.classList.remove("hidden");
      return;
    }

    formSuccess.textContent = "Account created successfully! Redirecting to login...";
    formSuccess.classList.remove("hidden");
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 1200);
  });
});
