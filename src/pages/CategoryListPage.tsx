import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import { CategoryScroller } from '../components/CategoryScroller';
import type { Category, CategoryRankingResponse } from '../types/api';
import { getBookmarks, type CategoryBookmark } from '../utils/categoryBookmarks';
import '../styles/CategoryListPage.css';

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export const CategoryListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<CategoryBookmark[]>(() => getBookmarks());
  const [categoryRanking, setCategoryRanking] = useState<CategoryRankingResponse[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 북마크 업데이트 리스너
  useEffect(() => {
    const handleStorageChange = () => {
      setBookmarks(getBookmarks());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarksUpdated' as any, handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarksUpdated' as any, handleStorageChange);
    };
  }, []);

  // 카테고리 및 랭킹 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setRankingLoading(true);
        const [allCategories, ranking] = await Promise.all([
          categoryService.getAllCategories(),
          categoryService.getCategoryRanking(10)
        ]);
        setCategories(allCategories);
        setCategoryRanking(ranking);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
        setRankingLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 평면 배열을 트리 구조로 변환
  const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // 모든 카테고리를 맵에 추가
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // 트리 구조 생성
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      if (category.parentCategoryId) {
        const parent = categoryMap.get(category.parentCategoryId);
        if (parent) {
          parent.children.push(node);
        } else {
          // 부모가 없으면 루트로 추가
          rootCategories.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  };

  // 검색어로 카테고리 필터링
  const filterCategories = (categories: Category[], query: string): Category[] => {
    if (!query.trim()) return categories;

    const lowerQuery = query.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(lowerQuery) ||
      category.description?.toLowerCase().includes(lowerQuery)
    );
  };

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/categories/${categoryId}`);
  };

  // 트리를 재귀적으로 렌더링
  const renderCategoryTree = (nodes: CategoryTreeNode[], depth: number = 0): JSX.Element[] => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          className="category-tree-item"
          style={{
            paddingLeft: `${15 + depth * 30}px`,
            background: depth % 2 === 0 ? '#3a3a3a' : '#2b2b2b'
          }}
          onClick={() => handleCategoryClick(node.id)}
        >
          <span className="category-tree-name">
            {depth > 0 && (
              <span className="category-tree-indent">
                {'└' + '─'.repeat(depth)}
              </span>
            )}
            <strong style={{ color: depth === 0 ? '#ffffff' : '#cccccc' }}>
              {node.name}
            </strong>
            {node.children.length > 0 && (
              <span className="category-tree-count">
                ({node.children.length}개 하위)
              </span>
            )}
          </span>
          {node.description && (
            <span className="category-tree-description">
              {node.description}
            </span>
          )}
        </div>
        {node.children.length > 0 && renderCategoryTree(node.children, depth + 1)}
      </div>
    ));
  };

  const filteredCategories = filterCategories(categories, searchQuery);
  const categoryTree = buildCategoryTree(filteredCategories);

  return (
    <div className="category-list-page">
      <div className="category-list-header">
        <h1>카테고리</h1>
        <hr />
      </div>

      <div className="category-list-content">
        {/* 카테고리 즐겨찾기 */}
        {bookmarks.length > 0 && (
          <>
            <h2 className="section-title">카테고리 즐겨찾기</h2>
            <div className="category-scroller-wrapper">
              <CategoryScroller
                categories={bookmarks.map(b => ({
                  id: b.id,
                  name: b.name,
                  thumbnailUrl: b.thumbnailImageUrl
                }))}
              />
            </div>
          </>
        )}

        {/* 인기 카테고리 */}
        <h2 className="section-title">인기 카테고리</h2>
        {rankingLoading ? (
          <div className="loading-message">로딩 중...</div>
        ) : categoryRanking.length === 0 ? (
          <div className="empty-message">인기 카테고리가 없습니다</div>
        ) : (
          <div className="category-scroller-wrapper">
            <CategoryScroller
              categories={categoryRanking.map(ranking => {
                const categoryDetail = categories.find(c => c.id === ranking.categoryId);
                return {
                  id: ranking.categoryId,
                  name: ranking.categoryName,
                  thumbnailUrl: categoryDetail?.thumbnailImageUrl
                };
              })}
            />
          </div>
        )}

        {/* 전체 카테고리 보기 */}
        <h2 className="section-title">전체 카테고리</h2>

        {/* 검색 바 */}
        <div className="category-search-container">
          <form className="category-search-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="카테고리 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="category-search-input"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="category-search-clear"
              >
                초기화
              </button>
            )}
          </form>
        </div>

        {/* 카테고리 트리 */}
        {loading ? (
          <div className="loading-message">로딩 중...</div>
        ) : categoryTree.length === 0 ? (
          <div className="empty-message">
            {searchQuery ? '검색 결과가 없습니다' : '카테고리가 없습니다'}
          </div>
        ) : (
          <div className="category-tree-container">
            {renderCategoryTree(categoryTree)}
          </div>
        )}
      </div>
    </div>
  );
};
