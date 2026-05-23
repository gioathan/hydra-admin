import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  // Prefer the token that matches the context of this request.
  // Customer endpoints must not receive the admin token or the backend returns 403.
  const customerToken = localStorage.getItem("customer_token");
  const adminToken = localStorage.getItem("token");
  const token = customerToken ?? adminToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";
      // Never redirect on auth endpoints themselves — the form shows the error.
      const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");
      if (!isAuthEndpoint) {
        const hadAdminToken = !!localStorage.getItem("token");
        const hadCustomerToken = !!localStorage.getItem("customer_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("venueId");
        if (hadCustomerToken) {
          localStorage.removeItem("customer_token");
          localStorage.removeItem("customer_user");
          localStorage.removeItem("customer_customerId");
        }
        if (hadAdminToken) {
          window.location.href = "/admin/login";
        } else if (hadCustomerToken) {
          window.location.href = "/signin";
        }
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 429) return "Too many attempts. Please wait a moment and try again.";
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
  }
  return "Something went wrong. Please try again.";
}

export default api;
