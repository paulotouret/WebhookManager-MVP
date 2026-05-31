const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem("hookflow_token");

    const hasBody = options.body !== undefined && options.body !== null;
    const headers: HeadersInit = {
      ...(hasBody ? {"Content-Type": "application/json"} : {}),
      ...(options.headers || {}),
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Falha na requisição" }));
      const apiError: ApiError = {
        message: error.message || "Falha na requisição",
        errors: error.errors,
        status: response.status,
      };
      throw apiError;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      ...(options?.headers || {}),
    };
    
    const token = localStorage.getItem("hookflow_token");
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    
    return this.request<T>(endpoint, { 
      ...options, 
      method: "DELETE",
      headers,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
