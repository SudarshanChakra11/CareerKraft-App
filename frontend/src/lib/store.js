// ================= USER STORAGE =================

const USER_KEY = "ck-user";
const TOKEN_KEY = "token";

// Get user safely
export function getStoredUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;

    return JSON.parse(user);
  } catch {
    return null;
  }
}

// Save user
export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Clear user (logout)
export function clearStoredUser() {
  localStorage.removeItem(USER_KEY);
}

// ================= TOKEN STORAGE =================

// Save token
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// Get token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Clear token
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}