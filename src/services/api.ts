import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        console.log('[API] Request to:', config.url, 'Token exists:', !!token);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[API] Authorization header set');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh and transform PageResponse
    this.client.interceptors.response.use(
      (response) => {
        // Transform PageResponse with numeric indices to proper array format
        if (response.data && typeof response.data === 'object') {
          const data = response.data;

          // Check if this looks like a PageResponse (has totalElements, pageSize, etc.)
          if ('totalElements' in data && 'pageSize' in data && 'currentPage' in data) {
            // Case 1: Backend sends 'content' field - rename to 'results'
            if ('content' in data && Array.isArray(data.content)) {
              console.log('[API Transform] Converting "content" to "results":', data.content.length, 'items');
              response.data = {
                results: data.content,
                totalElements: data.totalElements,
                totalPages: data.totalPages,
                currentPage: data.currentPage,
                pageSize: data.pageSize,
              };
            }
            // Case 2: Backend sends numeric keys (0, 1, 2...) - convert to array
            else {
              const numericKeys = Object.keys(data)
                .map(key => parseInt(key))
                .filter(num => !isNaN(num))
                .sort((a, b) => a - b);

              if (numericKeys.length > 0) {
                const results = numericKeys.map(key => data[key]);
                console.log('[API Transform] Converting numeric keys to array:', results.length, 'items');

                response.data = {
                  results: results,
                  totalElements: data.totalElements,
                  totalPages: data.totalPages,
                  currentPage: data.currentPage,
                  pageSize: data.pageSize,
                };
              }
            }
          }
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // 현재 사용자 조회 API에서 403/401 발생 시에만 로그아웃
        // /api/users/me 정확히 일치하는 경우만 (complete-onboarding 등 제외)
        const isCurrentUserGetEndpoint = originalRequest.url === '/api/users/me' && originalRequest.method?.toLowerCase() === 'get';

        // 403 에러 처리
        if (error.response?.status === 403) {
          if (isCurrentUserGetEndpoint) {
            console.error('[API] 403 Forbidden on current user endpoint - Logging out');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              console.error('[API] No refresh token available');
              throw new Error('No refresh token');
            }

            console.log('[API] Attempting token refresh...');
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
              refreshToken,
            });

            console.log('[API] Token refresh successful');
            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Access token과 새 refresh token 모두 저장
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            console.error('[API] Token refresh failed:', refreshError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
export const api = apiClient;
