const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const showPassword = document.getElementById("showPassword");
const rememberMe = document.getElementById("rememberMe");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

let users = [];
const usersLoaded = fetch('users.json')
  .then(res => res.json())
  .then(data => {
    users = Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : [];
    if (users.length === 0) {
      users = [
        { username: "admin", password: "Admin123456" },
        { username: "user1", password: "password1" }
      ];
    }
  })
  .catch(() => {
    users = [
      { username: "admin", password: "admin123" },
      { username: "user1", password: "password1" }
    ];
  });

// Password validation rules
function validatePassword(pwd) {
  if (pwd.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
  return "";
}

// Error display with fade in/out and optional input highlight
let errorTimeout = null;
function showError(msg, highlightInput = null) {
  if (!errorMessage) return;
  clearTimeout(errorTimeout);
  [usernameInput, passwordInput].forEach(i => i && i.classList.remove("invalid"));

  errorMessage.textContent = msg;
  errorMessage.classList.add("show");
  if (highlightInput) highlightInput.classList.add("invalid");

  errorTimeout = setTimeout(() => {
    errorMessage.classList.remove("show");
  }, 4000);
}

// Success: remember and redirect
function handleSuccess(username) {
  if (rememberMe?.checked) localStorage.setItem("rememberedUser", username);
  else localStorage.removeItem("rememberedUser");

  if (errorMessage) {
    errorMessage.textContent = "Login successful! Redirecting…";
    errorMessage.classList.add("show");
  }
  setTimeout(() => window.location.href = "dashboard.html", 300);
}

// Toggle password visibility
showPassword?.addEventListener("change", () => {
  if (passwordInput) passwordInput.type = showPassword.checked ? "text" : "password";
});

// Prefill remembered user
window.addEventListener("load", async () => {
  await usersLoaded;
  const savedUser = localStorage.getItem("rememberedUser");
  if (savedUser && usernameInput) {
    usernameInput.value = savedUser;
    if (rememberMe) rememberMe.checked = true;
  }
});

// Submit handler with validation
loginForm?.addEventListener("submit", async function(event) {
  event.preventDefault();
  await usersLoaded;

  const username = usernameInput?.value.trim() || "";
  const password = passwordInput?.value || "";

  if (!username) {
    showError("Please enter your username.", usernameInput);
    return;
  }

  const pwdMsg = validatePassword(password);
  if (pwdMsg) {
    showError(pwdMsg, passwordInput);
    return;
  }

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    handleSuccess(username);
  } else {
    showError("Invalid username or password.", null);
  }
});