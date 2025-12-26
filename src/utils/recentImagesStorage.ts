export interface RecentImage {
  url: string;
  fileName: string;
  uploadedAt: number;
}

const STORAGE_KEY = 'deuknet_recent_images';
const MAX_IMAGES = 15;

export const recentImagesStorage = {
  /**
   * 새로운 이미지를 로컬 스토리지에 추가
   * 최대 15개까지 저장하며, 초과 시 가장 오래된 이미지를 제거
   */
  addImage(url: string, fileName: string): void {
    const images = this.getImages();

    // 중복 URL 체크 (이미 존재하면 제거 후 최신으로 추가)
    const filteredImages = images.filter(img => img.url !== url);

    // 새 이미지를 맨 앞에 추가
    const newImages: RecentImage[] = [
      { url, fileName, uploadedAt: Date.now() },
      ...filteredImages
    ];

    // 최대 15개까지만 유지
    const limitedImages = newImages.slice(0, MAX_IMAGES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedImages));
  },

  /**
   * 저장된 모든 이미지 목록 조회
   * 최신 순으로 정렬되어 반환
   */
  getImages(): RecentImage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const images: RecentImage[] = JSON.parse(data);
      return images;
    } catch (error) {
      console.error('Failed to load recent images:', error);
      return [];
    }
  },

  /**
   * 특정 이미지 제거
   */
  removeImage(url: string): void {
    const images = this.getImages();
    const filteredImages = images.filter(img => img.url !== url);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredImages));
  },

  /**
   * 모든 이미지 삭제
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
