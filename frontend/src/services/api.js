import { getToken } from "@/utils/auth";

const BASE_URL = "http://localhost:5000/api";

// ================= GENERIC REQUEST =================
const request = async (endpoint, options = {}) => {
  const token = getToken();

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    // 🔥 Handle unauthorized (future-ready)
    if (res.status === 401) {
      console.error("Unauthorized - token expired");
      localStorage.removeItem("token");
      window.location.href = "/auth";
      return;
    }

    if (!res.ok) {
      const text = await res.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || "API error");
      } catch {
        throw new Error(text || "API error");
      }
    }

    return res.json();

  } catch (err) {
    console.error("API ERROR:", err.message);
    throw err;
  }
};


// ================= AUTH =================
export const loginUser = (data) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const registerUser = (data) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });


// ================= USER =================
export const getDashboard = (userId) =>
  request(`/user/dashboard/${userId}`);

export const selectPath = (data) =>
  request("/user/select-path", {
    method: "POST",
    body: JSON.stringify(data),
  });


// ================= PROGRESS =================
// REPLACE the 3 progress functions with these:

export const getUserProgress = () =>
  request("/progress/me"); // no userId — token handles it

export const updateTask = (data) =>
  request("/progress/update-task", {
    method: "POST",
    body: JSON.stringify({ day: data.day, taskId: data.taskId }), // no userId
  });

export const completeDay = (data) =>
  request("/progress/complete-day", {
    method: "POST",
    body: JSON.stringify({ day: data.day }), // no userId
  });

// ================= ROADMAP (NEW - PHASE 1 & 2) =================

// 🔥 Rule-based roadmap generator
export const generateRoadmap = (data) =>
  request("/roadmap/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });

// 🔥 (Future) Get stored roadmap
export const getUserRoadmap = (userId) =>
  request(`/roadmap/user/${userId}`);


// ================= AI (FUTURE READY) =================
export const generateAIRoadmap = (data) =>
  request("/ai/generate-roadmap", {
    method: "POST",
    body: JSON.stringify(data),
  });


// ================= ANALYTICS (FUTURE) =================
export const getAnalytics = (userId) =>
  request(`/analytics/${userId}`);