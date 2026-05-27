import axios from "axios";

const customerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("customer_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";
      const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/google");
      if (!isAuthEndpoint) {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
        localStorage.removeItem("customer_customerId");
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default customerApi;
