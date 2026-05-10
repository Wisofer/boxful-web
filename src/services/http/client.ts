import axios from "axios";
import { ROUTES } from "@/constants/routes";
import { clearStoredAccessToken, getStoredAccessToken } from "@/lib/auth-token";
import { env } from "@/lib/env";
export const httpClient = axios.create({
  baseURL: `${env.apiBaseUrl}/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});
httpClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status as number | undefined;
    if (status === 401 && typeof window !== "undefined") {
      clearStoredAccessToken();
      if (!window.location.pathname.startsWith(ROUTES.login)) {
        window.location.assign(ROUTES.login);
      }
    }
    return Promise.reject(error);
  },
);
