import { useState, useEffect } from 'react';
import { recentImagesStorage } from '../utils/recentImagesStorage';
import type { RecentImage } from '../utils/recentImagesStorage';
import '../styles/RecentImagePicker.css';

interface RecentImagePickerProps {
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
}

export const RecentImagePicker = ({ onImageSelect, onClose }: RecentImagePickerProps) => {
  const [images, setImages] = useState<RecentImage[]>([]);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    const recentImages = recentImagesStorage.getImages();
    setImages(recentImages);
  };

  const handleImageClick = (imageUrl: string) => {
    onImageSelect(imageUrl);
    onClose();
  };

  const handleRemoveImage = (imageUrl: string, event: React.MouseEvent) => {
    event.stopPropagation();
    recentImagesStorage.removeImage(imageUrl);
    loadImages();
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return '방금 전';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}주 전`;

    const months = Math.floor(days / 30);
    return `${months}개월 전`;
  };

  return (
    <div className="recent-image-picker-overlay" onClick={onClose}>
      <div className="recent-image-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="recent-image-picker-header">
          <h3>최근 업로드한 이미지</h3>
          <button className="recent-image-picker-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {images.length === 0 ? (
          <div className="recent-image-picker-empty">
            <p>최근 업로드한 이미지가 없습니다.</p>
            <p className="recent-image-picker-empty-hint">
              이미지를 업로드하면 여기에 최근 15개가 저장됩니다.
            </p>
          </div>
        ) : (
          <div className="recent-image-picker-grid">
            {images.map((image) => (
              <div
                key={image.url}
                className="recent-image-item"
                onClick={() => handleImageClick(image.url)}
              >
                <button
                  className="recent-image-remove"
                  onClick={(e) => handleRemoveImage(image.url, e)}
                  title="삭제"
                >
                  ✕
                </button>
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="recent-image-thumbnail"
                  loading="lazy"
                />
                <div className="recent-image-info">
                  <div className="recent-image-filename" title={image.fileName}>
                    {image.fileName}
                  </div>
                  <div className="recent-image-time">
                    {formatTimeAgo(image.uploadedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="recent-image-picker-footer">
          <p className="recent-image-picker-hint">
            이미지를 클릭하면 마크다운 형식으로 삽입됩니다
          </p>
        </div>
      </div>
    </div>
  );
};
