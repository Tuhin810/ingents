
import { ApiErrorResponse } from "@/types/api/apiError.interface";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// Toast notification (client-side only)
const showErrorToast = (message: string) => {
  if (typeof window !== "undefined") {
    import("react-toastify").then(({ toast }) => toast.error(message));
  }
};

// Factory to create configured Axios instances
export function createApi(config?: AxiosRequestConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: "/api", // Use Next.js API routes
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    ...config,
  });

  // Request interceptor (add auth, etc)
  instance.interceptors.request.use(
    (cfg) => {
      console.log(`API Call: ${cfg.method?.toUpperCase()} ${cfg.baseURL}${cfg.url}`);
      return cfg;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor (global error handling)
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
      const message = error.response?.data?.message || "Something went wrong!";
      console.error(`API Error: ${error.config?.url}`, message);
      showErrorToast(message);
      return Promise.reject(error);
    }
  );

  return instance;
}

// Default API instance
const API = createApi();
export default API;
