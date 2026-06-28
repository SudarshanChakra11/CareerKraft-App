const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─────────────────────────────────────────────────────────
// PROGRESS ENDPOINTS
// ─────────────────────────────────────────────────────────

export const getUserProgress = async () => {
  const response = await fetch(`${API_BASE}/progress`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch progress: ${response.statusText}`);
  return response.json();
};

export const completeTask = async (dayNumber, taskId) => {
  const response = await fetch(`${API_BASE}/progress/complete-task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ dayNumber, taskId }),
  });
  if (!response.ok) throw new Error(`Failed to complete task: ${response.statusText}`);
  return response.json();
};

export const completeDay = async (dayNumber, quizCorrect, quizTotal, isPerfect) => {
  const response = await fetch(`${API_BASE}/progress/complete-day`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ dayNumber, quizCorrect, quizTotal, isPerfect }),
  });
  if (!response.ok) throw new Error(`Failed to complete day: ${response.statusText}`);
  return response.json();
};

export const saveOnboardingData = async (onboardingData) => {
  const response = await fetch(`${API_BASE}/progress/update-onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(onboardingData),
  });
  if (!response.ok) throw new Error(`Failed to save onboarding data: ${response.statusText}`);
  return response.json();
};

export const resetProgress = async () => {
  const response = await fetch(`${API_BASE}/progress/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error(`Failed to reset progress: ${response.statusText}`);
  return response.json();
};

// ─────────────────────────────────────────────────────────
// AUTH ENDPOINTS
// ─────────────────────────────────────────────────────────

export const registerUser = async (formData) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name:     formData.name,
      mobile:   formData.mobile,
      email:    formData.email,
      password: formData.password,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Registration failed: ${response.statusText}`);
  }

  return response.json();
};

export const loginUser = async (formData) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email:    formData.email,
      password: formData.password,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Login failed: ${response.statusText}`);
  }

  return response.json();
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch current user: ${response.statusText}`);
  return response.json();
};

// ─────────────────────────────────────────────────────────
// USER SETUP — saves onboarding fields to DB
// ─────────────────────────────────────────────────────────

// Called from PathSelection (selectedPath) and Step4 (all fields).
// This is what makes getRedirectTo() in authController return "dashboard"
// on subsequent logins instead of "path-selection".
export const updateUserSetup = async (data) => {
  const response = await fetch(`${API_BASE}/users/setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update user setup");
  }
  return response.json();
};