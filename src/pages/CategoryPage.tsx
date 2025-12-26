import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import { postService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import type { Category, PostSearchResponse } from '../types/api';
import { trackViewCategory } from '../utils/analyticsEvents';
import '../styles/CategoryPage.css';

export const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<PostSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'recent' | 'popular' | 'featured'>('recent');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [inputKeyword, setInputKeyword] = useState(''); // 입력 필드용
  const [searchKeyword, setSearchKeyword] = useState(''); // 실제 검색용

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
            sortType: viewMode === 'popular' ? 'POPULAR' : 'RECENT',
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
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(inputKeyword);
    setCurrentPage(0);
  };

  const handleSearchClear = () => {
    setInputKeyword('');
    setSearchKeyword('');
    setCurrentPage(0);
  };

  if (!category) {
    return <div className="loading">카테고리를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="category-page">
      {/* 카테고리 썸네일 헤더 */}
      <div
        className="category-header-banner"
        style={{
          backgroundImage: category.thumbnailImageUrl
            ? `url(${category.thumbnailImageUrl})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: category.thumbnailImageUrl ? 'cover' : 'auto',
          backgroundPosition: 'center',
          backgroundRepeat: category.thumbnailImageUrl ? 'no-repeat' : 'repeat',
        }}
      >
        <div className="category-header-overlay">
          <div className="category-header-content">
            <h1 className="category-title">{category.name}</h1>
            {category.description && (
              <p className="category-description">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* 하위 카테고리 */}
      {childCategories.length > 0 && (
        <div className="child-categories-section">
          <h2 className="section-title">하위 카테고리</h2>
          <div className="child-categories-list">
            {childCategories.map((child) => (
              <div
                key={child.id}
                className="child-category-item"
                onClick={() => navigate(`/categories/${child.id}`)}
              >
                <span className="child-category-name">
                  <span className="child-category-indent">└─</span>
                  <strong>{child.name}</strong>
                </span>
                {child.description && (
                  <span className="child-category-description">{child.description}</span>
                )}
              </div>
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

        <div className="posts-header">
          <div className="view-tabs">
            <button
              onClick={() => setViewMode('recent')}
              className={`tab-button ${viewMode === 'recent' ? 'active' : ''}`}
            >
              최신순
            </button>
            <button
              onClick={() => setViewMode('popular')}
              className={`tab-button ${viewMode === 'popular' ? 'active' : ''}`}
            >
              인기순
            </button>
            {!searchKeyword && (
              <button
                onClick={() => setViewMode('featured')}
                className={`tab-button featured ${viewMode === 'featured' ? 'active' : ''}`}
              >
                추천
              </button>
            )}
          </div>

          {isAuthenticated && (
            <button onClick={() => navigate(`/posts/new?category=${categoryId}`)} className="write-button">
              글쓰기
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : !posts || posts.length === 0 ? (
          <div className="posts-empty">게시물이 없습니다.</div>
        ) : (
          <>
            <div className="posts-list">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showCategory={false} size="medium" />
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
  );
};
