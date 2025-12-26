import { apiClient } from './api';
import type {
  PostSearchResponse,
  PostSearchParams,
  CreatePostRequest,
  UpdatePostRequest,
  PageResponse,
} from '../types/api';

export const postService = {
  // Create post
  createPost: async (data: CreatePostRequest): Promise<string> => {
    const response = await apiClient.post<string>('/api/posts', data);
    return response.data;
  },

  // Update post
  updatePost: async (postId: string, data: UpdatePostRequest): Promise<void> => {
    await apiClient.put(`/api/posts/${postId}`, data);
  },

  // Publish post
  publishPost: async (postId: string): Promise<void> => {
    await apiClient.post(`/api/posts/${postId}/publish`);
  },

  // Delete post
  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}`);
  },

  // Get post by ID
  getPostById: async (postId: string, forceCommandModel = false): Promise<PostSearchResponse> => {
    const response = await apiClient.get<PostSearchResponse>(`/api/posts/${postId}`, {
      params: { forceCommandModel },
    });
    return response.data;
  },

  // Search posts (통합: sortType으로 최신순/인기순 구분)
  searchPosts: async (params: PostSearchParams): Promise<PageResponse<PostSearchResponse>> => {
    const response = await apiClient.get<PageResponse<PostSearchResponse>>('/api/posts', { params });
    return response.data;
  },

  // Get my posts (내가 쓴 게시물, 익명 포함)
  getMyPosts: async (page = 0, size = 20): Promise<PageResponse<PostSearchResponse>> => {
    const response = await apiClient.get<PageResponse<PostSearchResponse>>('/api/posts/my', {
      params: { page, size },
    });
    return response.data;
  },

  // Get liked posts (내가 좋아요 누른 게시물)
  getLikedPosts: async (page = 0, size = 20): Promise<PageResponse<PostSearchResponse>> => {
    const response = await apiClient.get<PageResponse<PostSearchResponse>>('/api/posts/liked', {
      params: { page, size },
    });
    return response.data;
  },

  // Get featured posts (개념글: 좋아요 많은 상위 20개)
  getFeaturedPosts: async (categoryId?: string, page = 0, size = 20): Promise<PageResponse<PostSearchResponse>> => {
    const response = await apiClient.get<PageResponse<PostSearchResponse>>('/api/posts/featured', {
      params: { categoryId, page, size },
    });
    return response.data;
  },

  // Search API endpoints
  searchPostsAdvanced: async (params: PostSearchParams): Promise<PostSearchResponse[]> => {
    const response = await apiClient.get<PostSearchResponse[]>('/api/search/posts', { params });
    return response.data;
  },

  // Get trending posts (실검 Top 10)
  getTrendingPosts: async (): Promise<PostSearchResponse[]> => {
    const response = await apiClient.get<PostSearchResponse[]>('/api/posts/trending');
    return response.data;
  },

  getRecentPosts: async (page = 0, size = 20): Promise<PostSearchResponse[]> => {
    const response = await apiClient.get<PostSearchResponse[]>('/api/search/posts/recent', {
      params: { page, size },
    });
    return response.data;
  },

  // Search suggestions (autocomplete)
  suggestKeywords: async (query: string, size = 10): Promise<string[]> => {
    if (!query || query.trim().length === 0) {
      return [];
    }
    const response = await apiClient.get<string[]>('/api/posts/suggest', {
      params: { q: query.trim(), size },
    });
    return response.data;
  },
};
