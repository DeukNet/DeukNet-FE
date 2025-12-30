import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { categoryService } from '../services/categoryService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import type { PostSearchResponse, Category, UserResponse } from '../types/api';
import { getEasterEggByKeyword } from '../utils/easterEggEffects';
import '../styles/PostListPage.css';

export const PostListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PostSearchResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchedCategories, setSearchedCategories] = useState<Category[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<UserResponse[]>([]);
  const [categorySearchPage, setCategorySearchPage] = useState(0);
  const [categoryTotalPages, setCategoryTotalPages] = useState(0);
  const [userSearchPage, setUserSearchPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'recent' | 'popular' | 'featured'>('recent');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const categoryId = searchParams.get('category');
  const keyword = searchParams.get('keyword');

  const prevFiltersRef = useRef({ categoryId, keyword, viewMode });

  // 이스터 애그 트리거를 위한 상태
  const [accuracyClickCount, setAccuracyClickCount] = useState(0);
  const accuracyClickTimerRef = useRef<number | null>(null);

  // 검색 키워드가 변경되면 추천 탭에서 최신순으로 전환
  useEffect(() => {
    if (keyword && viewMode === 'featured') {
      setViewMode('recent');
    }
  }, [keyword, viewMode]);

  // 정확도순 버튼 클릭 핸들러 (이스터 애그 트리거)
  const handleAccuracyClick = () => {
    setViewMode('recent');

    // 검색어가 있을 때만 이스터 애그 카운트
    if (keyword) {
      const newCount = accuracyClickCount + 1;
      setAccuracyClickCount(newCount);

      // 기존 타이머 클리어
      if (accuracyClickTimerRef.current) {
        clearTimeout(accuracyClickTimerRef.current);
      }

      // 3번 클릭 시 이스터 애그 발동
      if (newCount >= 3) {
        // 검색어에 따라 다른 효과 적용
        const easterEggEffect = getEasterEggByKeyword(keyword);
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

  // 카테고리 목록 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // 카테고리 조회 기록 저장 (최근 본 순서)
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
      } catch (error) {
        console.error('Error updating category view history:', error);
      }
    }
  }, [categoryId, categories]);

  // 필터 변경 감지 및 페이지 초기화
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.categoryId !== categoryId ||
      prev.keyword !== keyword ||
      prev.viewMode !== viewMode
    ) {
      setCurrentPage(0);
      prevFiltersRef.current = { categoryId, keyword, viewMode };
    }
  }, [categoryId, keyword, viewMode]);

  // 검색 키워드가 변경되면 페이지 초기화
  useEffect(() => {
    setCategorySearchPage(0);
    setUserSearchPage(0);
  }, [keyword]);

  // 카테고리 검색
  useEffect(() => {
    const fetchCategories = async () => {
      if (!keyword) {
        setSearchedCategories([]);
        setCategoryTotalPages(0);
        return;
      }

      try {
        const response = await categoryService.searchCategories(keyword, categorySearchPage, 10);
        setSearchedCategories(response.results);
        setCategoryTotalPages(Math.ceil(response.totalElements / response.pageSize));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, [keyword, categorySearchPage]);

  // 유저 검색
  useEffect(() => {
    const fetchUsers = async () => {
      if (!keyword) {
        setSearchedUsers([]);
        setUserTotalPages(0);
        return;
      }

      try {
        const response = await userService.searchUsers(keyword, userSearchPage, 10);
        setSearchedUsers(response.results);
        setUserTotalPages(Math.ceil(response.totalElements / response.pageSize));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, [keyword, userSearchPage]);

  // 게시물 조회
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;

        if (viewMode === 'featured') {
          response = await postService.getFeaturedPosts(categoryId || undefined, currentPage, 20);
        } else {
          response = await postService.searchPosts({
            keyword: keyword || undefined,
            categoryId: categoryId || undefined,
            sortType: viewMode === 'popular' ? 'POPULAR' : (keyword ? 'RELEVANCE' : 'RECENT'),
            page: currentPage,
            size: 20,
          });
        }

        setPosts(response.results);
        setTotalPages(Math.ceil(response.totalElements / response.pageSize));
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setError('게시물을 불러오는데 실패했습니다.');
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="post-list-page">
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
          <span className="result-count">
            {searchedCategories && searchedCategories.length > 0 && <span>{searchedCategories.length}개의 카테고리</span>}
            {searchedCategories && searchedCategories.length > 0 && searchedUsers && searchedUsers.length > 0 && <span>, </span>}
            {searchedUsers && searchedUsers.length > 0 && <span>{searchedUsers.length}명의 사용자</span>}
            {((searchedCategories && searchedCategories.length > 0) || (searchedUsers && searchedUsers.length > 0)) && totalElements > 0 && <span>, </span>}
            {totalElements > 0 && <span>{totalElements}개의 게시물</span>}
          </span>
        </div>
      )}

      {/* 카테고리 및 유저 검색 결과 */}
      {keyword && ((searchedCategories && searchedCategories.length > 0) || (searchedUsers && searchedUsers.length > 0)) && (
        <div className="search-results-section">
          {searchedCategories && searchedCategories.length > 0 && (
            <div className="search-category-section">
              <h3 className="search-section-title">
                카테고리 ({searchedCategories.length}개)
                {categoryTotalPages > 1 && (
                  <span className="total-pages-info"> - {categorySearchPage + 1} / {categoryTotalPages} 페이지</span>
                )}
              </h3>
              <div className="search-category-list">
                {searchedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="search-category-item"
                    onClick={() => navigate(`/categories/${category.id}`)}
                  >
                    <span className="category-name">{category.name}</span>
                    {category.description && (
                      <span className="category-description">{category.description}</span>
                    )}
                  </div>
                ))}
              </div>
              {categoryTotalPages > 1 && (
                <div className="search-pagination">
                  <button
                    onClick={() => setCategorySearchPage(prev => Math.max(0, prev - 1))}
                    disabled={categorySearchPage === 0}
                    className="pagination-button"
                  >
                    이전
                  </button>
                  <span className="pagination-text">
                    {categorySearchPage + 1} / {categoryTotalPages}
                  </span>
                  <button
                    onClick={() => setCategorySearchPage(prev => Math.min(categoryTotalPages - 1, prev + 1))}
                    disabled={categorySearchPage >= categoryTotalPages - 1}
                    className="pagination-button"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}

          {searchedUsers && searchedUsers.length > 0 && (
            <div className="search-user-section">
              <h3 className="search-section-title">
                사용자 ({searchedUsers.length}명)
                {userTotalPages > 1 && (
                  <span className="total-pages-info"> - {userSearchPage + 1} / {userTotalPages} 페이지</span>
                )}
              </h3>
              <div className="search-user-list">
                {searchedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="search-user-item"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <div className="user-info">
                      {user.avatarUrl && (
                        <img src={user.avatarUrl} alt={user.displayName} className="user-avatar" />
                      )}
                      <div className="user-details">
                        <span className="user-display-name">{user.displayName}</span>
                        <span className="user-username">@{user.username}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {userTotalPages > 1 && (
                <div className="search-pagination">
                  <button
                    onClick={() => setUserSearchPage(prev => Math.max(0, prev - 1))}
                    disabled={userSearchPage === 0}
                    className="pagination-button"
                  >
                    이전
                  </button>
                  <span className="pagination-text">
                    {userSearchPage + 1} / {userTotalPages}
                  </span>
                  <button
                    onClick={() => setUserSearchPage(prev => Math.min(userTotalPages - 1, prev + 1))}
                    disabled={userSearchPage >= userTotalPages - 1}
                    className="pagination-button"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          <strong>⚠ 오류</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="main-content">
        {/* 탭 및 글쓰기 버튼 */}
        <div className="view-tabs">
          <button
            onClick={handleAccuracyClick}
            className={`tab-button ${viewMode === 'recent' ? 'active' : ''}`}
          >
            {keyword ? '정확도순' : '최신순'}
          </button>
          <button
            onClick={() => setViewMode('popular')}
            className={`tab-button ${viewMode === 'popular' ? 'active' : ''}`}
          >
            인기순
          </button>
          {!keyword && (
            <button
              onClick={() => setViewMode('featured')}
              className={`tab-button featured ${viewMode === 'featured' ? 'active' : ''}`}
            >
              추천
            </button>
          )}

          {isAuthenticated && !keyword && (
            <button onClick={() => navigate('/posts/select-category')} className="write-button">
              글쓰기
            </button>
          )}
        </div>

        {/* 게시물 목록 */}
        <div className="posts-box">
          <div className="posts-box-header">
            {viewMode === 'recent' && (keyword ? '정확도순 게시물' : '최신 게시물')}
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
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      showCategory={!categoryId}
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
