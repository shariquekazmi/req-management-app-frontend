const API_BASE_URL =
  "https://request-management-application-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const assignedSelect = document.getElementById("assigned_to");
  const form = document.getElementById("createRequestForm");
  const msg = document.getElementById("createMessage");

  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("Please login again.");
    window.location.href = "login.html";
    return;
  }

  // =============================
  // FETCH employees for dropdown
  // =============================
  async function loadEmployees() {
    try {
      const res = await fetch(`${API_BASE_URL}/users/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load employees");

      const data = await res.json();

      assignedSelect.innerHTML = `<option value="">Select employee</option>`;

      data.employees.forEach((emp) => {
        assignedSelect.innerHTML += `
          <option value="${emp.id}">${emp.name}</option>
        `;
      });
    } catch (err) {
      console.error(err);
      msg.textContent = "Failed to load employees";
      msg.classList.add("error");
    }
  }

  loadEmployees();

  // =============================
  // FORM SUBMIT
  // =============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const assigned_to = assignedSelect.value;

    if (!title || !description || !assigned_to) {
      msg.textContent = "All fields are required.";
      msg.classList.add("error");
      return;
    }

    const body = {
      title,
      description,
      assigned_to,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/requests/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        msg.textContent = data.error || "Failed to create request";
        msg.classList.add("error");
        return;
      }

      msg.textContent = "Request created successfully!";
      msg.classList.remove("error");
      msg.classList.add("success");

      setTimeout(() => {
        window.location.href = "employeeDashboard.html";
      }, 800);
    } catch (err) {
      console.error(err);
      msg.textContent = "Something went wrong";
      msg.classList.add("error");
    }
  });

  // =============================
  // LOGOUT
  // =============================
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
});
