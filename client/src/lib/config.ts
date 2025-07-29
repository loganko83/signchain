// Get base URL from the current page
export function getBaseUrl(): string {
  // Check if we're running under a subdirectory
  const pathname = window.location.pathname;
  
  // Find the base path by looking for /signchain
  if (pathname.includes('/signchain')) {
    return '/signchain';
  }
  
  return '';
}

// Helper function to create API URLs
export function apiUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return baseUrl + cleanPath;
}

// Wrapper for fetch that handles the base URL
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  return fetch(url, options);
}
