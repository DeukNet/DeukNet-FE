const BOOKMARKS_KEY = 'categoryBookmarks_v1';
const MAX_BOOKMARKS = 15;

export interface CategoryBookmark {
  id: string;
  name: string;
  thumbnailImageUrl?: string;
  timestamp: number;
}

/**
 * 북마크 목록 조회 (최신순)
 */
export const getBookmarks = (): CategoryBookmark[] => {
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (!stored) return [];

    const bookmarks = JSON.parse(stored) as CategoryBookmark[];
    // 최신순 정렬 (timestamp 내림차순)
    return bookmarks.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load bookmarks:', error);
    return [];
  }
};

/**
 * 북마크 추가
 */
export const addBookmark = (id: string, name: string, thumbnailImageUrl?: string): void => {
  try {
    const bookmarks = getBookmarks();

    // 이미 존재하면 timestamp와 썸네일만 업데이트
    const existingIndex = bookmarks.findIndex(b => b.id === id);
    if (existingIndex !== -1) {
      bookmarks[existingIndex].timestamp = Date.now();
      bookmarks[existingIndex].name = name;
      bookmarks[existingIndex].thumbnailImageUrl = thumbnailImageUrl;
    } else {
      // 새로 추가
      bookmarks.unshift({
        id,
        name,
        thumbnailImageUrl,
        timestamp: Date.now()
      });

      // 최대 개수 제한
      if (bookmarks.length > MAX_BOOKMARKS) {
        bookmarks.pop();
      }
    }

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));

    // 커스텀 이벤트 발생 (같은 탭에서도 업데이트)
    window.dispatchEvent(new Event('bookmarksUpdated'));
  } catch (error) {
    console.error('Failed to add bookmark:', error);
  }
};

/**
 * 북마크 제거
 */
export const removeBookmark = (id: string): void => {
  try {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== id);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));

    // 커스텀 이벤트 발생 (같은 탭에서도 업데이트)
    window.dispatchEvent(new Event('bookmarksUpdated'));
  } catch (error) {
    console.error('Failed to remove bookmark:', error);
  }
};

/**
 * 북마크 여부 확인
 */
export const isBookmarked = (id: string): boolean => {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.id === id);
};

/**
 * 북마크 토글
 */
export const toggleBookmark = (id: string, name: string, thumbnailImageUrl?: string): boolean => {
  if (isBookmarked(id)) {
    removeBookmark(id);
    return false;
  } else {
    addBookmark(id, name, thumbnailImageUrl);
    return true;
  }
};
