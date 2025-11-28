import { apiFetch } from "./apiClient.js";
const API_BASE_URL =
  "https://request-management-application-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const tabRaised = document.getElementById("tabRaised");
  const container = document.getElementById("employeeRequests");
  const tabApproved = document.getElementById("tabApproved");
  const tabInProgress = document.getElementById("tabInProgress");
  const tabClosed = document.getElementById("tabClosed");

  if (!container) {
    console.warn("Not on Employee Dashboard page");
    return;
  }

  let allRequests = [];

  // =============================
  // LOAD REQUESTS FOR EMPLOYEE
  // =============================
  async function loadEmployeeRequests() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      container.innerHTML = "<p>Please login again.</p>";
      return;
    }

    const res = await apiFetch(`${API_BASE_URL}/requests`);

    if (!res.ok) {
      container.innerHTML = "<p>Error fetching requests.</p>";
      return;
    }

    const data = await res.json();
    allRequests = data.requests || [];

    showApproved(); // default tab
  }

  // =============================
  // TAB FILTERS
  // =============================
  function showApproved() {
    highlightTab("approved");
    const approved = allRequests.filter((r) => r.status === "MANAGER_APPROVED");
    renderTable(approved, "ACTION");
  }

  function showInProgress() {
    highlightTab("inprogress");
    const inprogress = allRequests.filter(
      (r) => r.status === "ACTION_IN_PROGRESS"
    );
    renderTable(inprogress, "CLOSE");
  }

  function showClosed() {
    highlightTab("closed");
    const closed = allRequests.filter((r) => r.status === "CLOSED");
    renderTable(closed, null);
  }

  //Raised by user request
  async function showRaised() {
    highlightTab("raised");

    const token = localStorage.getItem("accessToken");

    const res = await apiFetch(`${API_BASE_URL}/requests/raised/by/user`);

    if (!res.ok) {
      container.innerHTML = "<p>Error fetching raised requests.</p>";
      return;
    }

    const data = await res.json();
    const raised = data.requests || [];

    renderTable(raised, null); // no actions for raised requests
  }

  // =============================
  // TAB HIGHLIGHT
  // =============================
  function highlightTab(type) {
    tabApproved.classList.remove("active");
    tabInProgress.classList.remove("active");
    tabClosed.classList.remove("active");
    tabRaised.classList.remove("active");

    if (type === "approved") tabApproved.classList.add("active");
    if (type === "inprogress") tabInProgress.classList.add("active");
    if (type === "closed") tabClosed.classList.add("active");
    if (type === "raised") tabRaised.classList.add("active");
  }

  // =============================
  // RENDER TABLE
  // =============================
  function renderTable(requests, actionType) {
    if (!requests || requests.length === 0) {
      container.innerHTML = "<p>No requests found.</p>";
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Created By</th>
            <th>Status</th>
            <th>Action</th>
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
          <td>${r.status}</td>
          <td>
            <button class="btn btn-details" data-id="${r.id}">
              Details
            </button>
            ${
              actionType
                ? `<button class="btn btn-approve" data-action="${actionType}" data-id="${r.id}">
                    ${actionType}
                  </button>`
                : ""
            }
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;

    container.innerHTML = html;

    attachRowEvents();
  }

  // =============================
  // BUTTON EVENTS
  // =============================
  function attachRowEvents() {
    document.querySelectorAll(".btn-details").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        window.location.href = `requestDetails.html?id=${id}`;
      });
    });

    document.querySelectorAll(".btn-approve").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action").toLowerCase();

        await apiFetch(`${API_BASE_URL}/requests/${id}/${action}`, {
          method: "PUT",
        });

        loadEmployeeRequests(); // refresh list
      });
    });
  }

  // create request
  const createBtn = document.getElementById("createRequestBtn");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      window.location.href = "createRequest.html";
    });
  }

  // Logout functionality

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  // =============================
  // TAB CLICK HANDLERS
  // =============================
  tabApproved.addEventListener("click", showApproved);
  tabInProgress.addEventListener("click", showInProgress);
  tabClosed.addEventListener("click", showClosed);
  tabRaised.addEventListener("click", showRaised);

  // =============================
  // INITIAL LOAD
  // =============================
  loadEmployeeRequests();
});
