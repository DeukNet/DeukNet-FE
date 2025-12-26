import { trackEvent } from './analytics';

/**
 * Google Analytics 커스텀 이벤트 정의
 * 사용자 행동별로 이벤트를 추적합니다
 */

// ========== 인증 관련 이벤트 ==========

/**
 * 로그인 성공
 */
export const trackLogin = (provider: string) => {
  trackEvent('Auth', 'Login', provider);
};

/**
 * 로그아웃
 */
export const trackLogout = () => {
  trackEvent('Auth', 'Logout');
};

// ========== 게시물 관련 이벤트 ==========

/**
 * 게시물 조회
 */
export const trackViewPost = (postId: string) => {
  trackEvent('Post', 'View', postId);
};

/**
 * 게시물 작성
 */
export const trackCreatePost = (categoryId?: string) => {
  trackEvent('Post', 'Create', categoryId);
};

/**
 * 게시물 수정
 */
export const trackUpdatePost = (postId: string) => {
  trackEvent('Post', 'Update', postId);
};

/**
 * 게시물 삭제
 */
export const trackDeletePost = (postId: string) => {
  trackEvent('Post', 'Delete', postId);
};

/**
 * 게시물 좋아요
 */
export const trackLikePost = (postId: string) => {
  trackEvent('Post', 'Like', postId);
};

/**
 * 게시물 좋아요 취소
 */
export const trackUnlikePost = (postId: string) => {
  trackEvent('Post', 'Unlike', postId);
};

/**
 * 게시물 싫어요
 */
export const trackDislikePost = (postId: string) => {
  trackEvent('Post', 'Dislike', postId);
};

/**
 * 게시물 싫어요 취소
 */
export const trackUndislikePost = (postId: string) => {
  trackEvent('Post', 'Undislike', postId);
};

// ========== 댓글 관련 이벤트 ==========

/**
 * 댓글 작성
 */
export const trackCreateComment = (postId: string, isReply: boolean) => {
  trackEvent('Comment', 'Create', `${isReply ? 'Reply' : 'Comment'}_Post_${postId}`);
};

/**
 * 댓글 수정
 */
export const trackUpdateComment = (commentId: string) => {
  trackEvent('Comment', 'Update', commentId);
};

/**
 * 댓글 삭제
 */
export const trackDeleteComment = (commentId: string) => {
  trackEvent('Comment', 'Delete', commentId);
};

// ========== 카테고리 관련 이벤트 ==========

/**
 * 카테고리 조회
 */
export const trackViewCategory = (categoryId: string, categoryName: string) => {
  trackEvent('Category', 'View', `${categoryName}_${categoryId}`);
};

/**
 * 카테고리 생성
 */
export const trackCreateCategory = (categoryName: string) => {
  trackEvent('Category', 'Create', categoryName);
};

/**
 * 카테고리 수정
 */
export const trackUpdateCategory = (categoryId: string) => {
  trackEvent('Category', 'Update', categoryId);
};

/**
 * 카테고리 삭제
 */
export const trackDeleteCategory = (categoryId: string) => {
  trackEvent('Category', 'Delete', categoryId);
};

// ========== 검색 관련 이벤트 ==========

/**
 * 검색 실행
 */
export const trackSearch = (keyword: string, resultCount: number) => {
  trackEvent('Search', 'Query', keyword, resultCount);
};

/**
 * 검색 결과 클릭
 */
export const trackSearchResultClick = (postId: string, position: number) => {
  trackEvent('Search', 'ResultClick', postId, position);
};

// ========== 사용자 프로필 관련 이벤트 ==========

/**
 * 프로필 조회
 */
export const trackViewProfile = (userId: string) => {
  trackEvent('Profile', 'View', userId);
};

/**
 * 프로필 수정
 */
export const trackUpdateProfile = () => {
  trackEvent('Profile', 'Update');
};

/**
 * 아바타 업로드
 */
export const trackUploadAvatar = () => {
  trackEvent('Profile', 'UploadAvatar');
};

// ========== 파일 업로드 관련 이벤트 ==========

/**
 * 이미지 업로드 (게시물 썸네일)
 */
export const trackUploadThumbnail = () => {
  trackEvent('File', 'UploadThumbnail');
};

/**
 * 이미지 업로드 (본문 내 이미지)
 */
export const trackUploadInlineImage = () => {
  trackEvent('File', 'UploadInlineImage');
};

// ========== 네비게이션 관련 이벤트 ==========

/**
 * 카테고리 드롭다운 열기
 */
export const trackOpenCategoryDropdown = () => {
  trackEvent('Navigation', 'OpenCategoryDropdown');
};

/**
 * 사이드바 열기
 */
export const trackOpenSidebar = () => {
  trackEvent('Navigation', 'OpenSidebar');
};

/**
 * 사이드바 닫기
 */
export const trackCloseSidebar = () => {
  trackEvent('Navigation', 'CloseSidebar');
};

// ========== 공유 관련 이벤트 ==========

/**
 * 게시물 공유
 */
export const trackSharePost = (postId: string, method: string) => {
  trackEvent('Social', 'SharePost', `${method}_${postId}`);
};

// ========== 에러 관련 이벤트 ==========

/**
 * API 에러
 */
export const trackApiError = (endpoint: string, statusCode: number) => {
  trackEvent('Error', 'API', `${endpoint}_${statusCode}`);
};

/**
 * 폼 제출 에러
 */
export const trackFormError = (formName: string, errorMessage: string) => {
  trackEvent('Error', 'Form', `${formName}: ${errorMessage}`);
};
