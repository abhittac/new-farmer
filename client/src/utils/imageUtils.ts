// Utility function to get the proper image URL with VITE_BASE_URL prefix for dynamic images
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "";
  
  // If the image path is already a full HTTP URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // For local/uploaded images that start with /uploads, use VITE_BASE_URL
  if (imagePath.startsWith("/uploads")) {
    const baseUrl = import.meta.env.VITE_BASE_URL || "";
    return `${baseUrl}${imagePath}`;
  }
  
  // For images served through the API (dynamic admin uploads)
  if (imagePath.includes("/uploads/") || imagePath.startsWith("uploads/")) {
    const baseUrl = import.meta.env.VITE_BASE_URL || "";
    const cleanPath = imagePath.replace(/^\/+/, ""); // Remove leading slashes
    return `${baseUrl}/${cleanPath}`;
  }
  
  // For API-served images (legacy support)
  const cleanPath = imagePath.replace(/^\/+/, "");
  return `/api/images/serve/${cleanPath}`;
};