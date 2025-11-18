/**
 * Utility to prefix image URLs with the base image URL from environment
 */

export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "";
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  
  // Get the base URL from environment, default to localhost
  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8000/";
  
  // Ensure base URL ends with / and image path doesn't start with /
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedImagePath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  
  return `${normalizedBaseUrl}${normalizedImagePath}`;
};
