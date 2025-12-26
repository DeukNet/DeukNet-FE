import { apiClient } from './api';
import type { CreateCommentRequest, UpdateCommentRequest, Comment } from '../types/api';

export const commentService = {
  // Get comments for a post
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/api/posts/${postId}/comments`);
    return response.data;
  },

  // Create comment
  createComment: async (postId: string, data: CreateCommentRequest): Promise<string> => {
    const response = await apiClient.post<string>(`/api/posts/${postId}/comments`, data);
    return response.data;
  },

  // Update comment
  updateComment: async (
    postId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<void> => {
    await apiClient.put(`/api/posts/${postId}/comments/${commentId}`, data);
  },

  // Delete comment
  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}/comments/${commentId}`);
  },
};
