import { apiClient } from './api';
import type { CreateReactionRequest } from '../types/api';

export const reactionService = {
  // Add reaction
  addReaction: async (postId: string, data: CreateReactionRequest): Promise<string> => {
    const response = await apiClient.post<string>(`/api/posts/${postId}/reactions`, data);
    return response.data;
  },

  // Remove reaction
  removeReaction: async (postId: string, reactionId: string): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}/reactions/${reactionId}`);
  },
};
