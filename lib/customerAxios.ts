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
      const hadToken = !!error.config?.headers?.Authorization;
      // Only treat this as "your session expired" when a token was actually sent.
      // Discover/venues/events are browsable while logged out, so an anonymous
      // request 401ing on some secondary/optional call must not force-navigate
      // the user away from a page they're legitimately allowed to be on — that
      // was also causing a back-button redirect loop.
      if (!isAuthEndpoint && hadToken) {
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
