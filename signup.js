const API_BASE_URL =
  "https://request-management-application-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const roleSelect = document.getElementById("role");
  const managerGroup = document.getElementById("managerGroup");
  const managerSelect = document.getElementById("managerSelect");
  const signupForm = document.getElementById("signupForm");
  const messageEl = document.getElementById("signupMessage");

  // Show / hide manager dropdown based on role
  roleSelect.addEventListener("change", () => {
    const role = roleSelect.value;

    if (role === "EMPLOYEE") {
      managerGroup.style.display = "block";
      loadManagers();
    } else {
      managerGroup.style.display = "none";
      managerSelect.innerHTML = `<option value="">Select Manager</option>`;
    }
  });

  // Load managers from backend
  async function loadManagers() {
    try {
      const res = await fetch(`${API_BASE_URL}/users/managers`);
      const data = await res.json();

      managerSelect.innerHTML = `<option value="">Select Manager</option>`;

      if (res.ok && data.managers && data.managers.length > 0) {
        data.managers.forEach((m) => {
          const opt = document.createElement("option");
          opt.value = m.id;
          opt.textContent = m.name;
          managerSelect.appendChild(opt);
        });
      } else {
        // no managers found
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "No managers found";
        managerSelect.appendChild(opt);
      }
    } catch (err) {
      console.error("Error loading managers:", err);
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Error loading managers";
      managerSelect.appendChild(opt);
    }
  }

  // Handle signup form submit
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageEl.textContent = "";
    messageEl.className = "message";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = roleSelect.value;
    let manager_id = undefined;

    if (role === "EMPLOYEE") {
      manager_id = managerSelect.value ? Number(managerSelect.value) : null;
    }

    // Basic frontend validation
    if (!name || !email || !password || !role) {
      messageEl.textContent = "All fields are required";
      messageEl.classList.add("error");
      return;
    }

    if (role === "EMPLOYEE" && !manager_id) {
      messageEl.textContent = "Please select a manager for employee";
      messageEl.classList.add("error");
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        role,
      };

      //  Adding manager_id only when role EMPLOYEE is selected
      if (role === "EMPLOYEE") {
        payload.manager_id = manager_id ? Number(manager_id) : null;
      }

      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        messageEl.textContent = data.error || "Signup failed";
        messageEl.classList.add("error");
        return;
      }

      messageEl.textContent = data.message || "Signup successful";
      messageEl.classList.add("success");

      // Redirecingt to login after a short delay
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (err) {
      console.error("Signup error:", err);
      messageEl.textContent = "Something went wrong. Please try again.";
      messageEl.classList.add("error");
    }
  });
});
