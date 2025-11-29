import { apiFetch } from "./apiClient.js";
const API_BASE_URL =
  "https://request-management-application-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("allManagerRequests");
  const tabPending = document.getElementById("tabPending");
  const tabProcessed = document.getElementById("tabProcessed");

  if (!container) {
    return;
  }

  let allManagerRequests = [];

  // ---------------------------
  // LOAD REQUESTS FROM BACKEND
  // ---------------------------
  async function loadManagerRequests() {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("No token found");
        container.innerHTML = "<p>Unauthorized. Please login again.</p>";
        return;
      }

      const res = await apiFetch(`${API_BASE_URL}/requests`);

      if (!res.ok) {
        container.innerHTML = "<p>Failed to load data</p>";
        return;
      }

      const data = await res.json();

      allManagerRequests = data.requests || [];

      showPendingRequests(); // load default tab
    } catch (error) {
      console.error("Load Manager Requests ERROR:", error);
      container.innerHTML = "<p>Error fetching data.</p>";
    }
  }

  // ---------------------------
  //  TAB FILTERS
  // ---------------------------
  function showPendingRequests() {
    highlightTab("pending");

    const pending = allManagerRequests.filter(
      (r) => r.status === "PENDING_MANAGER_APPROVAL"
    );

    renderManagerTable(pending, true);
  }

  function showProcessedRequests() {
    highlightTab("processed");

    const processed = allManagerRequests.filter(
      (r) => r.status === "MANAGER_APPROVED" || r.status === "MANAGER_REJECTED"
    );

    renderManagerTable(processed, false);
  }

  // ---------------------------
  //  TAB UI HIGHLIGHT
  // ---------------------------
  function highlightTab(tab) {
    if (tab === "pending") {
      tabPending.classList.add("active");
      tabProcessed.classList.remove("active");
    } else {
      tabProcessed.classList.add("active");
      tabPending.classList.remove("active");
    }
  }

  // ---------------------------
  //   RENDER DATA TABLE
  // ---------------------------
  function renderManagerTable(requests, allowActions) {
    if (!requests || requests.length === 0) {
      container.innerHTML = "<p>No requests found.</p>";
      return;
    }

    let html = `
    <table>
      <thead>
        <tr>
          <th>S/N</th>
          <th>Title</th>
          <th>Created By</th>
          <th>Assigned To</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

    requests.forEach((r, index) => {
      html += `
      <tr>
        <td>${index + 1}</td>
        <td>${r.title}</td>
        <td>${r.created_by_name}</td>
        <td>${r.assigned_to_name}</td>
        <td>${r.status}</td>
        <td>
          <button class="btn btn-details" data-id="${r.id}">Details</button>
          ${
            allowActions
              ? `
          <button class="btn btn-approve" data-action="approve" data-id="${r.id}">Approve</button>
          <button class="btn btn-reject" data-action="reject" data-id="${r.id}">Reject</button>
          `
              : ""
          }
        </td>
      </tr>
    `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    attachActionEvents();
  }

  // ---------------------------
  //  BUTTON CLICK ACTIONS
  // ---------------------------
  function attachActionEvents() {
    document.querySelectorAll(".btn-details").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        window.location.href = `requestDetails.html?id=${id}`;
      });
    });

    document.querySelectorAll(".btn-approve, .btn-reject").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");

        await apiFetch(`${API_BASE_URL}/requests/${id}/${action}`, {
          method: "PUT",
        });

        loadManagerRequests(); // refresh table
      });
    });
  }

  // ---------------------------
  //  TAB CLICK EVENTS
  // ---------------------------
  tabPending.addEventListener("click", showPendingRequests);
  tabProcessed.addEventListener("click", showProcessedRequests);

  // Logout functionality

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  // ---------------------------
  //  INITIAL LOAD
  // ---------------------------
  loadManagerRequests();
});
