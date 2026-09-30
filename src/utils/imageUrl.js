// src/utils/imageUrl.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://food-shop-backend-xivl.onrender.com";

const DEFAULT_FALLBACK = "https://placehold.co/400x300?text=Khmer+Fresh";

// Normalize a path: "public/products/a.jpg" -> "products/a.jpg"
const cleanPath = (image) =>
  image.replace(/^\/+/, "").replace(/^public\//, "");

/**
 * Image served by the backend (Render / local Laravel).
 * image: "products/xxx.jpg" -> "https://.../storage/products/xxx.jpg"
 */
export const getImageUrl = (image, fallback = DEFAULT_FALLBACK) => {
  if (!image) return fallback;
  if (image.startsWith("http")) return image;

  const path = cleanPath(image);
  return path.startsWith("storage/")
    ? `${API_BASE}/${path}`
    : `${API_BASE}/storage/${path}`;
};

/**
 * Image served from the frontend's public/ folder (Vercel never deletes these files).
 * image: "products/xxx.jpg" -> "/products/xxx.jpg"
 */
export const getPublicImageUrl = (image, fallback = DEFAULT_FALLBACK) => {
  if (!image) return fallback;
  if (image.startsWith("http")) return image;

  return `/${cleanPath(image).replace(/^storage\//, "")}`;
};