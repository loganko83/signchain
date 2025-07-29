// Get the base URL from the environment or use default
const BASE_URL = import.meta.env.BASE_URL || '/';

// Helper function to create API URLs
export function apiUrl(path: string): string {
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If BASE_URL is just '/', return the path as-is
  if (BASE_URL === '/') {
    return `/${cleanPath}`;
  }
  
  // Otherwise, prepend the BASE_URL (for production /signchain)
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}/${cleanPath}`;
}

// Wrapper for fetch that handles the base URL
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  return fetch(url, options);
}
