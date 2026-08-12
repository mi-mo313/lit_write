const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

async function apiFetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  };

  const response = await fetch(url, config);

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    const error: ApiError = new Error(
      (data as { message?: string })?.message ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return {
    data: data as T,
    status: response.status,
  };
}

export default apiFetcher;
export type { ApiError, ApiResponse };