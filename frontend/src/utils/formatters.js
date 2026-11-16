export const formatDate = (value, options = { month: "short", day: "numeric", year: "numeric" }) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" }).format(date);
};

export const getInitials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CF";

export const getRoleHome = (role) => ({
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard"
}[role] || "/login");

export const getTodayString = () => {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

export const getDisplayError = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback || "Something went wrong.";
