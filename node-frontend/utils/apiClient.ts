export async function apiClient(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url.startsWith("http") ? url : `http://${url}`, options);
    if (!response.ok) {
      // Throw an error for non-2xx HTTP responses
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`Error in apiClient: ${error.message}`);
    throw error; // Let the calling server action handle the error
  }
}
