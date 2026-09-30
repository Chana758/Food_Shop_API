// const API_BASE =
//   import.meta.env.VITE_API_BASE_URL || "https://food-shop-backend-xivl.onrender.com";

// export const getImageUrl = (image, fallback = "https://placehold.co/400x300?text=Khmer+Fresh") => {
//   if (!image) return fallback;
//   if (image.startsWith("http")) return image;
//   const cleanPath = image.replace("public/", "").replace(/^\/+/, "");
//   return cleanPath.startsWith("storage/")
//     ? `${API_BASE}/${cleanPath}`
//     : `${API_BASE}/storage/${cleanPath}`;
// };