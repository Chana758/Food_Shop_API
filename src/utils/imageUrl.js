const API_BASE = "https://food-shop-backend-xivl.onrender.com";

export const getImageUrl = (path) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;
  return `${API_BASE}/storage/${path}`;
};