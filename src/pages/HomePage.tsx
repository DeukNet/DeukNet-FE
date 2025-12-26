import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import type { PostSearchResponse, Category, CategoryRankingResponse } from '../types/api';
import '../styles/HomePage.css';

export const HomePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [recentPosts, setRecentPosts] = useState<PostSearchResponse[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<PostSearchResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [frequentCategories, setFrequentCategories] = useState<{ categoryId: string; count: number; categoryName: string }[]>([]);
  const [categoryRanking, setCategoryRanking] = useState<CategoryRankingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'recent' | 'popular' | 'featured'>('recent');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
  const categoryId = searchParams.get('category');
  const keyword = searchParams.get('keyword');

  const prevFiltersRef = useRef({ categoryId, keyword, viewMode });

  // 로컬 스토리지에서 카테고리 조회 기록 관리 (최근 본 순서)
  useEffect(() => {
    if (categoryId && categories.length > 0) {
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

        const currentCategory = categories.find(c => c.id === categoryId);
        if (!currentCategory) return;

        viewHistory[categoryId] = {
          name: currentCategory.name,
          timestamp: Date.now()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(viewHistory));

        const sortedCategories = Object.entries(viewHistory)
          .filter(([_, data]) => typeof data === 'object' && data.name && typeof data.timestamp === 'number')
          .map(([catId, data]) => ({
            categoryId: catId,
            categoryName: data.name,
            count: 0
          }))
          .sort((a, b) => {
            const aTimestamp = viewHistory[a.categoryId]?.timestamp || 0;
            const bTimestamp = viewHistory[b.categoryId]?.timestamp || 0;
            return bTimestamp - aTimestamp;
          })
          .slice(0, 3);

        setFrequentCategories(sortedCategories);
      } catch (error) {
        console.error('Error updating category view history:', error);
      }
    }
  }, [categoryId, categories]);

  // 최근 본 카테고리 초기 로드
  useEffect(() => {
    try {
      const STORAGE_KEY = 'categoryViewHistory_v3';
      const history = localStorage.getItem(STORAGE_KEY);

      if (!history) {
        setFrequentCategories([]);
        return;
      }

      const viewHistory: { [key: string]: { name: string; timestamp: number } } = JSON.parse(history);

      const sortedCategories = Object.entries(viewHistory)
        .filter(([_, data]) => typeof data === 'object' && data.name && typeof data.timestamp === 'number')
        .map(([catId, data]) => ({
          categoryId: catId,
          categoryName: data.name,
          count: 0,
          timestamp: data.timestamp
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3);

      setFrequentCategories(sortedCategories);
    } catch (error) {
      console.error('Error loading category view history:', error);
      setFrequentCategories([]);
    }
  }, []);

  // 실시간 인기 게시글 조회
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        setTrendingLoading(true);
        const trending = await postService.getTrendingPosts();
        setTrendingPosts(trending);
      } catch (error) {
        console.error('Failed to fetch trending posts:', error);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  // 카테고리 랭킹 조회
  useEffect(() => {
    const fetchCategoryRanking = async () => {
      try {
        setRankingLoading(true);
        const ranking = await categoryService.getCategoryRanking(5);
        setCategoryRanking(ranking);
      } catch (error) {
        console.error('Failed to fetch category ranking:', error);
      } finally {
        setRankingLoading(false);
      }
    };

    fetchCategoryRanking();
  }, []);

  // 카테고리 목록 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // 게시물 조회
  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.categoryId !== categoryId ||
      prevFiltersRef.current.keyword !== keyword ||
      prevFiltersRef.current.viewMode !== viewMode;

    if (filtersChanged && currentPage !== 0) {
      setCurrentPage(0);
      prevFiltersRef.current = { categoryId, keyword, viewMode };
      return;
    }

    prevFiltersRef.current = { categoryId, keyword, viewMode };

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;

        if (viewMode === 'featured') {
          response = await postService.getFeaturedPosts(
            categoryId || undefined,
            currentPage,
            20
          );
        } else {
          response = await postService.searchPosts({
            categoryId: categoryId || undefined,
            keyword: keyword || undefined,
            sortType: viewMode === 'popular' ? 'POPULAR' : 'RECENT',
            page: currentPage,
            size: 20,
          });
        }

        setRecentPosts(response.results);
        setTotalPages(Math.ceil(response.totalElements / response.pageSize));
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setError('백엔드 서버에 연결할 수 없습니다. http://localhost:8080 에서 서버를 실행해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryId, keyword, viewMode, currentPage]);

  const getCurrentCategory = (): Category | null => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId) || null;
  };

  const getChildCategories = (): Category[] => {
    if (!categoryId) {
      return categories.filter(c => !c.parentCategoryId);
    }
    return categories.filter(c => c.parentCategoryId === categoryId);
  };

  const navigateToParent = () => {
    const currentCategory = getCurrentCategory();
    if (currentCategory?.parentCategoryId) {
      navigate(`/?category=${currentCategory.parentCategoryId}`);
    } else {
      navigate('/');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="home-page">
      {/* 카테고리 헤더 */}
      {categoryId && getCurrentCategory() && (
        <div className="category-header">
          <h2>{getCurrentCategory()?.name}</h2>
          <hr />
        </div>
      )}

      {/* 검색 결과 표시 */}
      {keyword && (
        <div className="search-result-banner">
          검색어: <strong>{keyword}</strong>
          {totalElements > 0 && <span className="result-count">({totalElements}개 결과)</span>}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          <strong>⚠ 서버 연결 오류</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="main-layout">
        {/* 카테고리 사이드바 */}
        {categories.length > 0 && !isCategoryCollapsed && (
          <div className="category-sidebar">
            <div className="category-box">
              <div className="category-box-header">
                <span>카테고리</span>
                <button
                  onClick={() => setIsCategoryCollapsed(true)}
                  className="collapse-button"
                  title="카테고리 접기"
                >
                  ◀
                </button>
              </div>
              <div>
                {categoryId && (
                  <div onClick={navigateToParent} className="category-back-button">
                    ← 뒤로가기
                  </div>
                )}

                {categoryId && getCurrentCategory() && (
                  <div className="category-current">
                    {getCurrentCategory()?.name}
                  </div>
                )}

                {!categoryId && (
                  <div onClick={() => navigate('/')} className="category-item all-board">
                    전체 게시판
                  </div>
                )}

                <div className="category-list">
                  {getChildCategories().length > 0 ? (
                    getChildCategories().map((category) => (
                      <div
                        key={category.id}
                        onClick={() => navigate(`/?category=${category.id}`)}
                        className="category-item"
                      >
                        {category.name}
                      </div>
                    ))
                  ) : (
                    <div className="category-empty">
                      하위 카테고리가 없습니다
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 카테고리 접기 버튼 */}
        {categories.length > 0 && isCategoryCollapsed && (
          <div className="category-sidebar collapsed">
            <button
              onClick={() => setIsCategoryCollapsed(false)}
              className="expand-button"
              title="카테고리 펼치기"
            >
              ▶
            </button>
          </div>
        )}

        {/* 메인 컨텐츠 */}
        <div className="main-content">
          {/* 실검 + 관심 카테고리 + 인기 카테고리 */}
          {!categoryId && !keyword && (
            <div className="info-section">
              {/* 실시간 인기 게시글 */}
              <div className="info-box">
                <div className="info-box-header trending">
                  실시간 인기 TOP 10
                </div>
                <div className="info-box-content">
                  {trendingLoading ? (
                    <div className="loading-message">로딩 중...</div>
                  ) : trendingPosts.length === 0 ? (
                    <div className="empty-message">인기 게시글이 없습니다</div>
                  ) : (
                    <div className="post-list">
                      {trendingPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          showCategory={true}
                          size="small"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 관심 카테고리 + 인기 카테고리 */}
              <div>
                <div className="info-box" style={{ marginBottom: '10px' }}>
                  <div className="info-box-header interest">
                    관심 카테고리
                  </div>
                  <div className="info-box-content">
                    {frequentCategories.length === 0 ? (
                      <div className="empty-message">
                        카테고리를 방문하면 여기에 표시됩니다
                      </div>
                    ) : (
                      <div className="interest-category-list">
                        {frequentCategories.map((item) => (
                          <div
                            key={item.categoryId}
                            onClick={() => navigate(`/?category=${item.categoryId}`)}
                            className="interest-category-item"
                          >
                            <span className="name">{item.categoryName}</span>
                            <span className="count">조회 {item.count}회</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-box">
                  <div className="info-box-header ranking">
                    인기 카테고리 TOP 5
                  </div>
                  <div className="info-box-content">
                    {rankingLoading ? (
                      <div className="loading-message">로딩 중...</div>
                    ) : categoryRanking.length === 0 ? (
                      <div className="empty-message">카테고리 랭킹이 없습니다</div>
                    ) : (
                      <div className="ranking-list">
                        {categoryRanking.map((item, index) => (
                          <div
                            key={item.categoryId}
                            onClick={() => navigate(`/?category=${item.categoryId}`)}
                            className={`ranking-item ${index < 3 ? 'top-three' : ''}`}
                          >
                            <div className="ranking-number">{index + 1}</div>
                            <div className="ranking-name">{item.categoryName}</div>
                            <div className="ranking-stats">
                              <span>글 {item.postCount}</span>
                              <span>조회 {item.totalViewCount}</span>
                              <span>추천 {item.totalLikeCount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 탭 */}
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
            <button
              onClick={() => setViewMode('featured')}
              className={`tab-button featured ${viewMode === 'featured' ? 'active' : ''}`}
            >
              개념글
            </button>
            {isAuthenticated && (
              <button
                onClick={() => navigate(categoryId ? `/posts/new?categoryId=${categoryId}` : '/posts/new')}
                className="write-button"
              >
                글쓰기
              </button>
            )}
          </div>

          {/* 게시물 목록 */}
          <div className="posts-box">
            <div className="posts-box-header">
              {viewMode === 'featured'
                ? '개념글'
                : viewMode === 'popular'
                ? '인기순'
                : categoryId
                  ? `${categories.find(c => c.id === categoryId)?.name || ''} 게시판`
                  : '전체 게시판'}
            </div>
            <div className="posts-box-content">
              {recentPosts.length === 0 ? (
                <div className="posts-empty">
                  게시글이 없습니다.
                </div>
              ) : (
                <div className="posts-list">
                  {recentPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      showCategory={!categoryId}
                      size="medium"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="pagination-button"
              >
                ◀ 이전
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

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
                disabled={currentPage === totalPages - 1}
                className="pagination-button"
              >
                다음 ▶
              </button>

              <span className="pagination-info">
                {currentPage + 1} / {totalPages} 페이지 (총 {totalElements}개)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
