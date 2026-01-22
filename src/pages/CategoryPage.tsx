import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryService } from '../services/categoryService';
import { postService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import type { Category, PostSearchResponse } from '../types/api';
import { trackViewCategory } from '../utils/analyticsEvents';
import { isBookmarked, toggleBookmark } from '../utils/categoryBookmarks';
import { useViewTransitionNavigate } from '../hooks/useViewTransition';
import { getEasterEggByKeyword } from '../utils/easterEggEffects';
import '../styles/CategoryPage.css';

export const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useViewTransitionNavigate();
  const { isAuthenticated, user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<PostSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'recent' | 'popular' | 'featured'>('recent');

  // URL에서 페이지 번호 읽기 (없으면 0)
  const pageFromUrl = parseInt(searchParams.get('page') || '0', 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const [totalPages, setTotalPages] = useState(0);
  const [inputKeyword, setInputKeyword] = useState(''); // 입력 필드용
  const [searchKeyword, setSearchKeyword] = useState(''); // 실제 검색용
  const [bookmarked, setBookmarked] = useState(false);

  // URL 쿼리 파라미터 변경 시 currentPage 동기화
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '0', 10);
    setCurrentPage(page);
  }, [searchParams]);

  // 이스터 애그 트리거를 위한 상태
  const [accuracyClickCount, setAccuracyClickCount] = useState(0);
  const accuracyClickTimerRef = useRef<number | null>(null);

  // 북마크 상태 확인
  useEffect(() => {
    if (categoryId) {
      setBookmarked(isBookmarked(categoryId));
    }
  }, [categoryId]);

  // 정확도순 버튼 클릭 핸들러 (이스터 애그 트리거)
  const handleAccuracyClick = () => {
    setViewMode('recent');

    // 검색어가 있을 때만 이스터 애그 카운트
    if (searchKeyword) {
      const newCount = accuracyClickCount + 1;
      setAccuracyClickCount(newCount);

      // 기존 타이머 클리어
      if (accuracyClickTimerRef.current) {
        clearTimeout(accuracyClickTimerRef.current);
      }

      // 3번 클릭 시 이스터 애그 발동
      if (newCount >= 3) {
        // 검색어에 따라 다른 효과 적용
        const easterEggEffect = getEasterEggByKeyword(searchKeyword);
        if (easterEggEffect) {
          easterEggEffect();
        }

        // 카운트 리셋
        setAccuracyClickCount(0);
      } else {
        // 2초 후 카운트 리셋
        accuracyClickTimerRef.current = window.setTimeout(() => {
          setAccuracyClickCount(0);
        }, 2000);
      }
    }
  };

  // 검색 키워드가 변경되면 추천 탭에서 최신순으로 전환
  useEffect(() => {
    if (searchKeyword && viewMode === 'featured') {
      setViewMode('recent');
    }
  }, [searchKeyword]);

  // 카테고리 정보 조회
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;

      try {
        const allCategories = await categoryService.getAllCategories();
        const currentCategory = allCategories.find(c => c.id === categoryId);
        setCategory(currentCategory || null);

        const children = allCategories.filter(c => c.parentCategoryId === categoryId);
        setChildCategories(children);

        // Track category view
        if (currentCategory) {
          trackViewCategory(categoryId, currentCategory.name);
        }

        // 카테고리 조회 기록을 로컬 스토리지에 저장 (최근 본 순서)
        try {
          const STORAGE_KEY = 'categoryViewHistory_v3';
          const history = localStorage.getItem(STORAGE_KEY);
          let viewHistory: { [key: string]: { name: string; timestamp: number } } = {};

          if (history) {
            try {
              viewHistory = JSON.parse(history);
              if (typeof viewHistory !== 'object' || viewHistory === null) {
                viewHistory = {};
              }
            } catch (e) {
              console.error('Failed to parse category history:', e);
              viewHistory = {};
            }
          }

          if (currentCategory) {
            viewHistory[categoryId] = {
              name: currentCategory.name,
              timestamp: Date.now()
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(viewHistory));
          }
        } catch (error) {
          console.error('Error updating category view history:', error);
        }
      } catch (error) {
        console.error('Failed to fetch category:', error);
      }
    };

    fetchCategory();
  }, [categoryId]);

  // 게시물 조회
  useEffect(() => {
    const fetchPosts = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        let response;

        if (viewMode === 'featured') {
          response = await postService.getFeaturedPosts(categoryId, currentPage, 20);
        } else {
          response = await postService.searchPosts({
            categoryId,
            keyword: searchKeyword || undefined,
            sortType: viewMode === 'popular' ? 'POPULAR' : (searchKeyword ? 'RELEVANCE' : 'RECENT'),
            page: currentPage,
            size: 20,
          });
        }

        setPosts(response.results);
        setTotalPages(Math.ceil(response.totalElements / response.pageSize));
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryId, viewMode, currentPage, searchKeyword]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(inputKeyword);
    setSearchParams({ page: '0' });
  };

  const handleSearchClear = () => {
    setInputKeyword('');
    setSearchKeyword('');
    setSearchParams({ page: '0' });
  };

  const handleBookmarkToggle = () => {
    if (category && categoryId) {
      const newBookmarked = toggleBookmark(categoryId, category.name, category.thumbnailImageUrl);
      setBookmarked(newBookmarked);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOwner = category?.ownerId === user?.id;
  const canEdit = isAdmin || isOwner;

  if (!category) {
    return <div className="loading">카테고리를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="category-page">
      {/* 카테고리 헤더 */}
      <div
        className="category-header-banner"
        style={{
          backgroundColor: '#3a3a3a',
        }}
      >
        <div className="category-header-overlay">
          <div className="category-header-content">
            <h1 className="category-title">{category.name}</h1>
            {category.description && (
              <p className="category-description">{category.description}</p>
            )}
          </div>
          <div className="category-header-actions">
            {canEdit && (
              <button
                className="edit-button"
                onClick={() => navigate(`/categories/${categoryId}/edit`)}
                title="카테고리 수정"
              >
                수정
              </button>
            )}
            <button
              className={`bookmark-button ${bookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmarkToggle}
              title={bookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              {bookmarked ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
            </button>
          </div>
        </div>
      </div>
      <hr />

      {/* 하위 카테고리 */}
      {childCategories.length > 0 && (
        <div className="child-categories-section">
          <h2 className="section-title">하위 카테고리</h2>
          <div className="child-categories-list">
            {childCategories.map((child, index) => (
              <motion.div
                key={child.id}
                className="child-category-item"
                onClick={() => navigate(`/categories/${child.id}`)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="child-category-content">
                  <span className="child-category-name">
                    <span className="child-category-indent">└─</span>
                    <strong>{child.name}</strong>
                  </span>
                  {child.description && (
                    <span className="child-category-description">{child.description}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 게시물 섹션 */}
      <div className="posts-section">
        {/* 검색바 */}
        <div className="category-search-container">
          <form onSubmit={handleSearch} className="category-search-form">
            <input
              type="text"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              placeholder="이 카테고리에서 검색..."
              className="category-search-input"
              autoComplete="off"
            />
            <button type="submit" className="category-search-button">
              검색
            </button>
            {(inputKeyword || searchKeyword) && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="category-search-clear"
              >
                초기화
              </button>
            )}
          </form>
        </div>

        {/* 탭 및 글쓰기 버튼 */}
        <div className="view-tabs">
          <button
            onClick={handleAccuracyClick}
            className={`tab-button ${viewMode === 'recent' ? 'active' : ''}`}
          >
            {searchKeyword ? '정확도순' : '최신순'}
          </button>
          <button
            onClick={() => {
              setViewMode('popular');
              setSearchParams({ page: '0' });
            }}
            className={`tab-button ${viewMode === 'popular' ? 'active' : ''}`}
          >
            인기순
          </button>
          {!searchKeyword && (
            <button
              onClick={() => {
                setViewMode('featured');
                setSearchParams({ page: '0' });
              }}
              className={`tab-button featured ${viewMode === 'featured' ? 'active' : ''}`}
            >
              추천
            </button>
          )}

          {isAuthenticated && (
            <button onClick={() => navigate(`/posts/new?category=${categoryId}`)} className="write-button">
              글쓰기
            </button>
          )}
        </div>

        {/* 게시물 목록 */}
        <div className="posts-box">
          <div className="posts-box-header">
            {viewMode === 'recent' && (searchKeyword ? '정확도순 게시물' : '최신 게시물')}
            {viewMode === 'popular' && '인기 게시물'}
            {viewMode === 'featured' && '추천 게시물'}
          </div>
          <div className="posts-box-content">
            {loading ? (
              <div className="posts-empty">
                로딩 중...
              </div>
            ) : posts.length === 0 ? (
              <div className="posts-empty">
                게시물이 없습니다.
              </div>
            ) : (
              <>
                <div className="posts-list">
                  {posts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      showCategory={false}
                      size="medium"
                      index={index}
                    />
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(0)}
                      disabled={currentPage === 0}
                      className="pagination-button"
                    >
                      ≪
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="pagination-button"
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const startPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                      const pageNum = startPage + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="pagination-button"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages - 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="pagination-button"
                    >
                      ≫
                    </button>
                    <span className="pagination-info">
                      {currentPage + 1} / {totalPages} 페이지
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
