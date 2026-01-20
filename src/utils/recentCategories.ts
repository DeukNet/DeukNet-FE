const RECENT_CATEGORIES_KEY = 'recentCategories_v1';
const MAX_RECENT_CATEGORIES = 6;

export interface RecentCategory {
  id: string;
  name: string;
  thumbnailImageUrl?: string;
  timestamp: number;
}

/**
 * 최근 사용한 카테고리 목록 조회 (최신순, FIFO)
 */
export const getRecentCategories = (): RecentCategory[] => {
  try {
    const stored = localStorage.getItem(RECENT_CATEGORIES_KEY);
    if (!stored) return [];

    const categories = JSON.parse(stored) as RecentCategory[];
    // 최신순 정렬 (timestamp 내림차순)
    return categories.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load recent categories:', error);
    return [];
  }
};

/**
 * 최근 사용한 카테고리 추가 (FIFO)
 */
export const addRecentCategory = (id: string, name: string, thumbnailImageUrl?: string): void => {
  try {
    const categories = getRecentCategories();

    // 이미 존재하면 timestamp만 업데이트 (맨 앞으로 이동)
    const existingIndex = categories.findIndex(c => c.id === id);
    if (existingIndex !== -1) {
      categories[existingIndex].timestamp = Date.now();
      categories[existingIndex].name = name;
      categories[existingIndex].thumbnailImageUrl = thumbnailImageUrl;
      // 다시 정렬
      categories.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      // 새로 추가
      categories.unshift({
        id,
        name,
        thumbnailImageUrl,
        timestamp: Date.now()
      });

      // 최대 6개 제한 (FIFO)
      if (categories.length > MAX_RECENT_CATEGORIES) {
        categories.pop();
      }
    }

    localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(categories));

    // 커스텀 이벤트 발생 (같은 탭에서도 업데이트)
    window.dispatchEvent(new Event('recentCategoriesUpdated'));
  } catch (error) {
    console.error('Failed to add recent category:', error);
  }
};
