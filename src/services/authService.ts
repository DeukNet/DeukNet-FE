import { apiClient } from './api';
import type { LoginRequest, TokenResponse, RefreshTokenRequest } from '../types/api';

export const authService = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/refresh', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
};
