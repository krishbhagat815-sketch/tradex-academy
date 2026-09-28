const PROD_API = "https://tradex-academy.onrender.com/api";
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : window.location.hostname === "localhost"
  ? "/api"
  : PROD_API;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("tradex_token");
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => {
      console.error("Failed to parse server response:", response);
      return {
        success: false,
        message: "Invalid server response - unable to parse JSON",
      };
    });

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed with status ${response.status}`,
      );
    }

    return data as T;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

export const api = {
  get: <T = any>(url: string) => apiRequest<T>(url, { method: "GET" }),
  post: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(url: string) => apiRequest<T>(url, { method: "DELETE" }),
};
