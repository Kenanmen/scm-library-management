const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const showPassword = document.getElementById("showPassword");
const rememberMe = document.getElementById("rememberMe");

let users = [];
fetch('users.json')
  .then(res => res.json())
  .then(data => {
    users = Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : [];
    if(users.length === 0) {
      users = [
        { username: "admin", password: "admin123" },
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

// Show/hide password
showPassword?.addEventListener("change", () => {
  const pwd = document.getElementById("password");
  if (pwd) pwd.type = showPassword.checked ? "text" : "password";
});

// Remember Me
window.onload = () => {
  const savedUser = localStorage.getItem("rememberedUser");
  if(savedUser) {
    document.getElementById("username").value = savedUser;
    if(rememberMe) rememberMe.checked = true;
  }
};

// Login submission
loginForm?.addEventListener("submit", function(event) {
  event.preventDefault();
  const username = document.getElementById("username")?.value.trim() || "";
  const password = document.getElementById("password")?.value.trim() || "";

  const user = users.find(u => u.username === username && u.password === password);

  if(user) {
    errorMessage.textContent = "";
    if(rememberMe?.checked) localStorage.setItem("rememberedUser", username);
    else localStorage.removeItem("rememberedUser");

    errorMessage.textContent = "Login successful!";
    setTimeout(() => window.location.href = "dashboard.html", 500); // small delay for UX
  } else {
    errorMessage.textContent = "Invalid username or password.";
    errorMessage.style.opacity = "0";
    setTimeout(() => errorMessage.style.opacity = "1", 50);
  }
});
