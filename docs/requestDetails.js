const API_BASE_URL =
  "https://request-management-application-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("requestDetailsBox");
  const backBtn = document.getElementById("backBtn");

  // Extract request ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get("id");

  if (!requestId) {
    container.innerHTML = "<p>Invalid request ID</p>";
    return;
  }

  // =============================
  // Fetch Request Details
  // =============================
  async function loadRequestDetails() {
    const token = localStorage.getItem("accessToken");

    const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      container.innerHTML = "<p>Failed to load request details.</p>";
      return;
    }

    const data = await res.json();
    const r = data.request;

    renderDetails(r);
  }

  // =============================
  // Render Request Details
  // =============================
  function renderDetails(r) {
    container.innerHTML = `
      <div class="detail-row"><strong>ID:</strong> ${r.id}</div>
      <div class="detail-row"><strong>Title:</strong> ${r.title}</div>
      <div class="detail-row"><strong>Description:</strong> ${
        r.description
      }</div>
      <div class="detail-row"><strong>Created By:</strong> ${
        r.created_by_name
      }</div>
      <div class="detail-row"><strong>Assigned To:</strong> ${
        r.assigned_to_name
      }</div>
      <div class="detail-row"><strong>Status:</strong> ${r.status}</div>
      <div class="detail-row"><strong>Created At:</strong> ${new Date(
        r.created_at
      ).toLocaleString()}</div>
      <div class="detail-row"><strong>Updated At:</strong> ${new Date(
        r.updated_at
      ).toLocaleString()}</div>
    `;
  }

  // Back Button (go to previous page)
  backBtn.addEventListener("click", () => {
    window.history.back();
  });

  // Initial Load
  loadRequestDetails();
});
