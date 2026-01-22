import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import type { PostSearchResponse } from '../types/api';
import '../styles/PostListPage.css';

export const LikedPostsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<PostSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 게시물 조회
  useEffect(() => {
    if (!isAuthenticated) return;

    // AuthContext loading 완료 대기 (사용자 권한 정보 로딩)
    if (authLoading) {
      console.log('[LikedPostsPage] Auth loading, skipping posts fetch...');
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await postService.getLikedPosts(currentPage, 20);

        setPosts(response.results);
        setTotalPages(Math.ceil(response.totalElements / response.pageSize));
        setTotalElements(response.totalElements);
      } catch (error: any) {
        console.error('Failed to fetch liked posts:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError('로그인이 필요합니다.');
          navigate('/login');
        } else {
          setError('좋아요 누른 게시물을 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, isAuthenticated, navigate, authLoading]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="post-list-page">
      {/* 헤더 */}
      <div className="category-header">
        <h2>내가 좋아요 누른 게시물</h2>
        <hr />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          <strong>⚠ 오류</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="main-content">
        {/* 게시물 목록 */}
        <div className="posts-box">
          <div className="posts-box-header">
            좋아요 누른 게시물 {totalElements > 0 && `(${totalElements}개)`}
          </div>
          <div className="posts-box-content">
            {loading ? (
              <div className="posts-empty">
                로딩 중...
              </div>
            ) : !posts || posts.length === 0 ? (
              <div className="posts-empty">
                좋아요 누른 게시물이 없습니다.
              </div>
            ) : (
              <>
                <div className="posts-list">
                  {posts.map((post) => (
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
  );
};
