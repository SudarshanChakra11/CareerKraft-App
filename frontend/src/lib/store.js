// ================= USER STORAGE =================

const USER_KEY = "ck-user";

// Get user safely
export function getStoredUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;

    return JSON.parse(user);
  } catch (error) {
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