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
  const [allPosts, setAllPosts] = useState<PostSearchResponse[]>([]);
  const [allPostsLoading, setAllPostsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<'recent' | 'popular' | 'featured'>('recent');
  const [categoryRanking, setCategoryRanking] = useState<CategoryRankingResponse[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
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
        <div className="main-layout">
          {/* 전체 게시물 - 왼쪽 메인 영역 */}
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
                    {allPosts.map((post, index) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        showCategory={true}
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

        {/* 실시간 인기 게시물 - 오른쪽 상단 */}
        <div className="trending-sidebar">
          <div className="trending-section">
            <h2 className="section-title">실시간 인기 TOP 10</h2>
            {trendingLoading ? (
              <div className="loading-message">로딩 중...</div>
            ) : !trendingPosts || trendingPosts.length === 0 ? (
              <div className="empty-message">인기 게시물이 없습니다</div>
            ) : (
              <>
                <div className="trending-posts-simple-list">
                  {(showAllTrending
                    ? trendingPosts
                    : trendingPosts.slice(0, isMobile ? 3 : 10)
                  ).map((post, index) => (
                    <div
                      key={post.id}
                      className="trending-post-simple-item"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      <span className="item-number">{index + 1}.</span>
                      <span className="item-title">{post.title}</span>
                      {post.commentCount > 0 && (
                        <span className="comment-count-badge">[{post.commentCount}]</span>
                      )}
                    </div>
                  ))}
                </div>
                {trendingPosts && trendingPosts.length > (isMobile ? 3 : 10) && (
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

          {/* 인기 카테고리 */}
          <div className="category-ranking-section">
            <h2 className="section-title">인기 카테고리 TOP 10</h2>
            {rankingLoading ? (
              <div className="loading-message">로딩 중...</div>
            ) : categoryRanking.length === 0 ? (
              <div className="empty-message">카테고리 랭킹이 없습니다</div>
            ) : (
              <>
                <div className="trending-posts-simple-list">
                  {(showAllCategories
                    ? categoryRanking
                    : categoryRanking.slice(0, isMobile ? 3 : 10)
                  ).map((item, index) => (
                    <div
                      key={item.categoryId}
                      onClick={() => navigate(`/?category=${item.categoryId}`)}
                      className="trending-post-simple-item"
                    >
                      <span className="item-number">{index + 1}.</span>
                      <span className="item-title">
                        {item.categoryName}
                        <span className="category-stats">
                          (글 {item.postCount})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
                {categoryRanking && categoryRanking.length > (isMobile ? 3 : 10) && (
                  <div className="show-more-container">
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="show-more-button"
                    >
                      {showAllCategories ? '접기' : '더보기'}
                    </button>
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
