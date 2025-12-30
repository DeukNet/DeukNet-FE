// Auth Types
export interface LoginRequest {
  provider: 'GOOGLE' | 'GITHUB';
  code: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Post Types
export type PostStatus = 'PRIVATE' | 'PUBLIC' | 'ARCHIVED' | 'DELETED';

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  status: PostStatus;
  viewCount: number;
  thumbnailImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  categoryId?: string;
  authorType?: 'REAL' | 'ANONYMOUS';
  thumbnailImageUrl?: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  categoryId?: string;
  thumbnailImageUrl?: string;
}

export interface PostSearchResponse {
  id: string;
  title: string;
  content?: string; // Optional (리스트 조회 시 제외, 상세 조회 시 포함)
  authorId: string | null;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl: string;
  authorType: 'REAL' | 'ANONYMOUS';
  status: PostStatus;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  dislikeCount: number;
  categoryId?: string;
  categoryName?: string;
  thumbnailImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  hasUserLiked?: boolean;
  hasUserDisliked?: boolean;
  userLikeReactionId?: string | null;
  userDislikeReactionId?: string | null;
  isAuthor?: boolean;
}

export interface PostSearchParams {
  keyword?: string;
  status?: PostStatus;
  categoryId?: string;
  authorId?: string;
  sortType?: 'RECENT' | 'RELEVANCE' | 'POPULAR';
  includeAnonymous?: boolean;
  page?: number;
  size?: number;
}

// Comment Types
export interface Comment {
  id: string;
  postId: string;
  authorId: string | null;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  content: string;
  parentCommentId: string | null;
  isReply: boolean;
  authorType: 'REAL' | 'ANONYMOUS';
  isAuthor?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
  authorType?: 'REAL' | 'ANONYMOUS';
}

export interface UpdateCommentRequest {
  content: string;
}

// Reaction Types
export type ReactionType = 'LIKE' | 'DISLIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY' | 'VIEW';

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: string;
}

export interface CreateReactionRequest {
  reactionType: ReactionType;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  parentCategoryId?: string | null;
  description?: string;
  thumbnailImageUrl?: string;
  ownerId?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  parentCategoryId?: string;
  description?: string;
  thumbnailImageUrl?: string;
}

export interface UpdateCategoryRequest {
  description?: string;
  thumbnailImageUrl?: string;
}

export interface CategoryRankingResponse {
  categoryId: string;
  categoryName: string;
  postCount: number;
  totalViewCount: number;
  totalLikeCount: number;
  rankingScore: number;
}

// User Types
export type UserRole = 'USER' | 'ADMIN';

export interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  role: UserRole;
}

export interface UpdateUserProfileRequest {
  displayName: string;
  bio: string;
  avatarUrl: string;
}

// API Response Types
export interface ApiError {
  message: string;
  status: number;
}

export interface PageResponse<T> {
  results: T[];
  totalElements: number;
  currentPage: number;
  pageSize: number;
}
