const API_BASE_URL =
  "https://request-management-application-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const message = document.getElementById("loginMessage");

      message.textContent = "";
      message.className = "message";

      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          message.textContent = data.error || "Invalid credentials";
          message.classList.add("error");
          return;
        }

        // store tokens
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        message.textContent = "Login successful!";
        message.classList.add("success");

        // Decode JWT to detect role
        const payload = JSON.parse(atob(data.accessToken.split(".")[1]));

        setTimeout(() => {
          if (payload.role === "MANAGER") {
            window.location.href = "managerDashboard.html";
          } else {
            window.location.href = "employeeDashboard.html";
          }
        }, 500);
      } catch (err) {
        console.error("Login error:", err);
        message.textContent = "Something went wrong. Try again later.";
        message.classList.add("error");
      }
    });
  }
});
