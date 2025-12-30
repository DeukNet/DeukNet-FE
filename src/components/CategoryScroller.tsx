import { useRef, useState, useEffect } from 'react';
import { CategoryThumbnail } from './CategoryThumbnail';
import '../styles/CategoryScroller.css';

interface CategoryScrollerProps {
  categories: Array<{
    id: string;
    name: string;
    thumbnailUrl?: string | null;
  }>;
}

export const CategoryScroller = ({ categories }: CategoryScrollerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  // 스크롤 필요 여부 체크
  const checkScrollNeeded = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setShowArrows(scrollWidth > clientWidth);
    }
  };

  // 초기 로드 및 카테고리 변경 시 체크
  useEffect(() => {
    // 즉시 체크
    checkScrollNeeded();

    // 이미지 로드를 위한 약간의 지연 후 재체크
    const timer = setTimeout(checkScrollNeeded, 100);

    return () => clearTimeout(timer);
  }, [categories]);

  // 윈도우 리사이즈 시 체크
  useEffect(() => {
    window.addEventListener('resize', checkScrollNeeded);
    return () => window.removeEventListener('resize', checkScrollNeeded);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="category-scroller-container">
      {showArrows && (
        <button
          className="category-scroller-button left"
          onClick={() => scroll('left')}
          aria-label="왼쪽으로 스크롤"
        >
          ◄
        </button>
      )}
      <div className="category-scroller-scroll" ref={scrollRef}>
        {categories.map((category) => (
          <CategoryThumbnail
            key={category.id}
            id={category.id}
            name={category.name}
            thumbnailUrl={category.thumbnailUrl}
            className="category-scroller-item"
          />
        ))}
      </div>
      {showArrows && (
        <button
          className="category-scroller-button right"
          onClick={() => scroll('right')}
          aria-label="오른쪽으로 스크롤"
        >
          ►
        </button>
      )}
    </div>
  );
};
