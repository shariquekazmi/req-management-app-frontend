const API_BASE_URL =
  "https://request-management-application-backend.onrender.com/api";

export async function apiFetch(url, options = {}) {
  let accessToken = localStorage.getItem("accessToken");
  let refreshToken = localStorage.getItem("refreshToken");

  // Step 1: Add access token to headers
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // Step 2: Attempt original request
  let res = await fetch(url, options);

  // Step 3: If access token expired → try refresh
  if (res.status === 401) {
    console.warn("Access token expired… refreshing token");

    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) {
      console.error("Refresh token expired. Logging out.");
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    const refreshData = await refreshRes.json();

    // Save new access token
    localStorage.setItem("accessToken", refreshData.accessToken);

    // Retry original request using new access token
    options.headers.Authorization = `Bearer ${refreshData.accessToken}`;
    res = await fetch(url, options);
  }

  return res;
}
