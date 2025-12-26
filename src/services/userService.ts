import { api } from './api';
import type { UserResponse, UpdateUserProfileRequest, PageResponse } from '../types/api';

export const userService = {
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/api/users/me');
    return response.data;
  },

  getUserById: async (userId: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/api/users/${userId}`);
    return response.data;
  },

  getUsers: async (page = 0, size = 20): Promise<PageResponse<UserResponse>> => {
    const response = await api.get<PageResponse<UserResponse>>('/api/users', {
      params: { page, size }
    });
    return response.data;
  },

  updateProfile: async (request: UpdateUserProfileRequest): Promise<void> => {
    await api.put('/api/users/me', request);
  },

  searchUsers: async (keyword: string, page: number = 0, size: number = 20): Promise<PageResponse<UserResponse>> => {
    const response = await api.get<PageResponse<UserResponse>>('/api/users/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },
};
