import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types/api';
import '../styles/CategoryListPage.css';

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export const CategoryListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return <div className="loading-message">로딩 중...</div>;
  }

  const categoryTree = buildCategoryTree(categories);

  return (
    <div className="category-list-page">
      <div className="category-list-header">
        <h1>카테고리 전체보기</h1>
        <p>관심있는 카테고리를 선택해보세요</p>
      </div>

      <div className="category-list-content">
        {categoryTree.length === 0 ? (
          <div className="empty-message">카테고리가 없습니다</div>
        ) : (
          <div className="category-tree-container">
            {renderCategoryTree(categoryTree)}
          </div>
        )}
      </div>
    </div>
  );
};
