import { apiClient } from './api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryRankingResponse, PageResponse } from '../types/api';

export const categoryService = {
  // Create category
  createCategory: async (data: CreateCategoryRequest): Promise<string> => {
    const response = await apiClient.post<string>('/api/categories', data);
    return response.data;
  },

  // Update category
  updateCategory: async (categoryId: string, data: UpdateCategoryRequest): Promise<void> => {
    await apiClient.put(`/api/categories/${categoryId}`, data);
  },

  // Delete category
  deleteCategory: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/api/categories/${categoryId}`);
  },

  // Get all categories
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/api/categories');
    return response.data;
  },

  // Get category ranking
  getCategoryRanking: async (size: number = 10): Promise<CategoryRankingResponse[]> => {
    const response = await apiClient.get<CategoryRankingResponse[]>('/api/categories/ranking', {
      params: { size }
    });
    return response.data;
  },

  // Grant ownership
  grantOwnership: async (categoryId: string, targetUserId: string): Promise<void> => {
    await apiClient.put(`/api/categories/${categoryId}/owner/${targetUserId}`);
  },

  // Record category view
  recordCategoryView: async (categoryId: string): Promise<void> => {
    await apiClient.post(`/api/categories/${categoryId}/view`);
  },

  // Search categories
  searchCategories: async (keyword: string, page: number = 0, size: number = 20): Promise<PageResponse<Category>> => {
    const response = await apiClient.get<PageResponse<Category>>('/api/categories/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },
};
