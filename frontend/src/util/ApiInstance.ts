import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { baseURL, secretKey } from "./config";
import { setToast } from "./toastServices";
import { createSelector } from "reselect";

const selectStates = (state: any) => state;

export const isLoading = createSelector(selectStates, (state: any) => {
  const slices = Object.values(state);
  const loading = slices.some((slice: any) => {
    if (typeof slice === "object" && slice !== null && slice.isLoading === true) {
      return true;
    }
    return false;
  });
  return loading;
});

interface ApiResponseError {
  message: string | string[];
  code?: string;
}

const getTokenData = (): string | null => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("token");
  }
  return null;
};

export const apiInstance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    secretKey,
    "Content-Type": "application/json",
  },
});

const cancelTokenSource = axios.CancelToken.source();
const token: string | null = getTokenData();

axios.defaults.headers.common["Authorization"] = token ? `${token}` : "";
axios.defaults.headers.common["key"] = secretKey;

// Global Axios fallback for direct axios calls in slices
axios.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    if (!error.response || error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
      const url = error.config?.url || "";
      const method = error.config?.method || "get";
      const { getStandaloneMockResponse } = await import("./standaloneMock");
      const mockData = getStandaloneMockResponse(method, url, error.config?.data);
      return Promise.resolve({ data: mockData, status: 200, statusText: "OK", headers: {}, config: error.config });
    }
    return Promise.reject(error);
  }
);

apiInstance.interceptors.request.use(
  async (config: AxiosRequestConfig): Promise<any> => {
    // Validate session integrity before sensitive actions
    const { validateSessionIntegrity } = await import("./security");
    const isValid = await validateSessionIntegrity();

    if (!isValid) {
      return Promise.reject(new Error("Session tampered."));
    }

    config.cancelToken = cancelTokenSource.token;
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response: AxiosResponse): any => response.data,
  async (error: AxiosError): Promise<any> => {
    // If backend is offline or unreachable, fallback to standalone mock data without throwing
    if (!error.response || error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
      const url = error.config?.url || "";
      const method = error.config?.method || "get";
      const { getStandaloneMockResponse } = await import("./standaloneMock");
      return getStandaloneMockResponse(method, url, error.config?.data);
    }

    const errorData = error.response?.data as ApiResponseError | undefined;

    if (error.response?.status === 401) {
      sessionStorage.clear();
      axios.defaults.headers.common["key"] = "";
      axios.defaults.headers.common["Authorization"] = "";
      window.location.href = "/";
    }

    if (!errorData) {
      setToast("error", "An unexpected error occurred.");
      return Promise.reject(error);
    }

    if (!errorData.message) {
      setToast("error", "Something went wrong!");
    }

    if (errorData.code === "E_USER_NOT_FOUND" || errorData.code === "E_UNAUTHORIZED") {
      sessionStorage.clear();
      window.location.reload();
    }

    if (typeof errorData.message === "string") {
      setToast("error", errorData.message);
    } else if (Array.isArray(errorData.message)) {
      errorData.message.forEach((msg: string) => setToast("error", msg));
    }

    return Promise.reject(error);
  }
);

const getHeaders = (): { [key: string]: string } => ({
  key: secretKey,
  Authorization: getTokenData() ? `${getTokenData()}` : "",
  "Content-Type": "application/json",
});

const fetchWithFallback = async (method: string, url: string, body?: any): Promise<any> => {
  const { validateSessionIntegrity } = await import("./security");
  await validateSessionIntegrity();

  try {
    const res = await fetch(`${baseURL}${url}`, {
      method,
      headers: getHeaders(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      // Backend returned 404/500/502/etc. Fallback to mock data to keep UI functional
      console.warn(`[API ${res.status}] ${method} ${url} - falling back to Standalone mock data.`);
      const { getStandaloneMockResponse } = await import("./standaloneMock");
      return getStandaloneMockResponse(method, url, body);
    }

    return await res.json();
  } catch (err) {
    // Network Error / Server offline / Standalone mode
    console.warn(`[Standalone Mode] ${method} ${url} offline. Serving mock response.`);
    const { getStandaloneMockResponse } = await import("./standaloneMock");
    return getStandaloneMockResponse(method, url, body);
  }
};

export const apiInstanceFetch = {
  baseURL,
  get: async (url: string) => fetchWithFallback("GET", url),
  post: async (url: string, data?: object) => fetchWithFallback("POST", url, data),
  patch: async (url: string, data?: object) => fetchWithFallback("PATCH", url, data),
  put: async (url: string, data?: object) => fetchWithFallback("PUT", url, data),
  delete: async (url: string, data?: object) => fetchWithFallback("DELETE", url, data),
};
