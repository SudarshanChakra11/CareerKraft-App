export const getStoredUser = () => {
  const user =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};