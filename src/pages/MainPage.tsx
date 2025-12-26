import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { categoryService } from '../services/categoryService';
import { PostCard } from '../components/PostCard';
import type { PostSearchResponse, CategoryRankingResponse } from '../types/api';
import '../styles/MainPage.css';

export const MainPage = () => {
  const navigate = useNavigate();
  const [trendingPosts, setTrendingPosts] = useState<PostSearchResponse[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [categoryRanking, setCategoryRanking] = useState<CategoryRankingResponse[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<PostSearchResponse[]>([]);
  const [allPostsLoading, setAllPostsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<'recent' | 'popular' | 'featured'>('recent');

  // 카테고리 랭킹 조회
  useEffect(() => {
    const fetchCategoryRanking = async () => {
      try {
        setRankingLoading(true);
        const ranking = await categoryService.getCategoryRanking(10);
        setCategoryRanking(ranking);
      } catch (error) {
        console.error('Failed to fetch category ranking:', error);
      } finally {
        setRankingLoading(false);
      }
    };

    fetchCategoryRanking();
  }, []);

  // 실시간 인기 게시물 조회
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        setTrendingLoading(true);
        const posts = await postService.getTrendingPosts();
        setTrendingPosts(posts);
      } catch (error) {
        console.error('Failed to fetch trending posts:', error);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  // 전체 게시물 조회
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setAllPostsLoading(true);

        let response;
        if (viewMode === 'featured') {
          response = await postService.getFeaturedPosts(undefined, currentPage, 10);
        } else {
          response = await postService.searchPosts({
            sortType: viewMode === 'popular' ? 'POPULAR' : 'RECENT',
            page: currentPage,
            size: 10,
          });
        }

        setAllPosts(response.results);
        setTotalPages(Math.ceil(response.totalElements / response.pageSize));
      } catch (error) {
        console.error('Failed to fetch all posts:', error);
      } finally {
        setAllPostsLoading(false);
      }
    };

    fetchAllPosts();
  }, [currentPage, viewMode]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="main-page">
      <div className="main-content-wrapper">
        {/* 인기 카테고리 */}
        <div className="category-ranking-section">
          <h2 className="section-title">인기 카테고리</h2>
          {rankingLoading ? (
            <div className="loading-message">로딩 중...</div>
          ) : !categoryRanking || categoryRanking.length === 0 ? (
            <div className="empty-message">카테고리가 없습니다</div>
          ) : (
            <div className="category-ranking-container">
              {categoryRanking.map((category, index) => (
                <div
                  key={category.categoryId}
                  className={`ranking-item ${index < 3 ? 'top-three' : ''}`}
                  onClick={() => navigate(`/categories/${category.categoryId}`)}
                >
                  <span className="ranking-number">{index + 1}</span>
                  <span className="ranking-name">{category.categoryName}</span>
                  <span className="ranking-stats">
                    <span>게시물 {category.postCount}</span>
                    <span>조회 {category.totalViewCount}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 실시간 인기 게시물 */}
        <div className="trending-section">
          <h2 className="section-title">실시간 인기 게시물</h2>
          {trendingLoading ? (
            <div className="loading-message">로딩 중...</div>
          ) : !trendingPosts || trendingPosts.length === 0 ? (
            <div className="empty-message">인기 게시물이 없습니다</div>
          ) : (
            <>
              <div className="trending-posts-list">
                {(showAllTrending ? trendingPosts : trendingPosts.slice(0, 3)).map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    showCategory={true}
                    size="small"
                  />
                ))}
              </div>
              {trendingPosts && trendingPosts.length > 3 && (
                <div className="show-more-container">
                  <button
                    onClick={() => setShowAllTrending(!showAllTrending)}
                    className="show-more-button"
                  >
                    {showAllTrending ? '접기' : '더보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 전체 게시물 */}
        <div className="all-posts-section">
          <h2 className="section-title">전체 게시물</h2>

          {/* 탭 버튼 */}
          <div className="view-tabs">
            <button
              onClick={() => {
                setViewMode('recent');
                setCurrentPage(0);
              }}
              className={`tab-button ${viewMode === 'recent' ? 'active' : ''}`}
            >
              최신순
            </button>
            <button
              onClick={() => {
                setViewMode('popular');
                setCurrentPage(0);
              }}
              className={`tab-button ${viewMode === 'popular' ? 'active' : ''}`}
            >
              인기순
            </button>
            <button
              onClick={() => {
                setViewMode('featured');
                setCurrentPage(0);
              }}
              className={`tab-button featured ${viewMode === 'featured' ? 'active' : ''}`}
            >
              추천
            </button>
          </div>

          {/* 게시물 목록 */}
          <div className="posts-box">
            <div className="posts-box-header">
              {viewMode === 'recent' && '최신 게시물'}
              {viewMode === 'popular' && '인기 게시물'}
              {viewMode === 'featured' && '추천 게시물'}
            </div>
            <div className="posts-box-content">
              {allPostsLoading ? (
                <div className="loading-message">로딩 중...</div>
              ) : !allPosts || allPosts.length === 0 ? (
                <div className="posts-empty">게시물이 없습니다</div>
              ) : (
                <>
                  <div className="posts-list">
                    {allPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        showCategory={true}
                        size="medium"
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
    </div>
  );
};
