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

interface ApiOptions extends RequestInit {
  token?: string | null;
}

async function apiFetcher<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { token, headers, ...requestOptions } = options;

  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
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
export type { ApiError, ApiResponse, ApiOptions };