import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';
import type { Category } from '../types/api';

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export const CategoryManagePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    fetchCategories();
  }, [isAuthenticated, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('카테고리 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

    // 내가 만든 카테고리를 상단에 배치
    const myCategories: CategoryTreeNode[] = [];
    const otherCategories: CategoryTreeNode[] = [];

    rootCategories.forEach(node => {
      if (node.ownerId === user?.id) {
        myCategories.push(node);
      } else {
        otherCategories.push(node);
      }
    });

    return [...myCategories, ...otherCategories];
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('카테고리 이름을 입력하세요.');
      return;
    }

    try {
      await categoryService.createCategory({
        name: newCategoryName,
        parentCategoryId: parentCategoryId || undefined
      });
      setNewCategoryName('');
      setParentCategoryId('');
      await fetchCategories();
      toast.success('카테고리가 생성되었습니다.');
    } catch (error: any) {
      console.error('Failed to create category:', error);
      if (error.response?.status === 403) {
        toast.error('권한이 없습니다.');
      } else {
        toast.error('카테고리 생성에 실패했습니다.');
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`"${categoryName}" 카테고리를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      await fetchCategories();
      toast.success('카테고리가 삭제되었습니다.');
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      if (error.response?.status === 403) {
        toast.error('권한이 없습니다.');
      } else {
        toast.error('카테고리 삭제에 실패했습니다.');
      }
    }
  };

  // 권한 체크: Admin이거나 카테고리 소유자인 경우
  const canManageCategory = (category: Category): boolean => {
    if (!user) return false;
    // Admin이면 모든 카테고리 관리 가능
    if (user.role === 'ADMIN') return true;
    // 소유자이면 관리 가능
    return category.ownerId === user.id;
  };

  // 트리를 재귀적으로 렌더링
  const renderCategoryTree = (nodes: CategoryTreeNode[], depth: number = 0): JSX.Element[] => {
    return nodes.map(node => {
      return (
        <div key={node.id}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 15px',
              borderBottom: '1px solid #555',
              paddingLeft: `${15 + depth * 30}px`,
              background: depth % 2 === 0 ? '#3a3a3a' : '#2b2b2b'
            }}
          >
            <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              {depth > 0 && (
                <span style={{ color: '#999', marginRight: '8px' }}>
                  {'└' + '─'.repeat(depth)}
                </span>
              )}
              <strong style={{ color: depth === 0 ? '#ffffff' : '#cccccc' }}>
                {node.name}
              </strong>
              {node.children.length > 0 && (
                <span style={{ marginLeft: '8px', color: '#999', fontSize: '12px' }}>
                  ({node.children.length}개 하위)
                </span>
              )}
              {node.ownerId === user?.id && (
                <span style={{ marginLeft: '8px', color: '#4CAF50', fontSize: '11px', fontWeight: 'bold' }}>
                  내 카테고리
                </span>
              )}
            </span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => navigate(`/categories/${node.id}/edit`)}
                style={{ fontSize: '12px', background: '#0066cc', color: 'white', border: '1px solid #555' }}
              >
                상세 수정
              </button>
              <button
                onClick={() => handleDeleteCategory(node.id, node.name)}
                style={{ fontSize: '12px', background: '#dc3545', color: 'white', border: '1px solid #555' }}
              >
                삭제
              </button>
            </div>
          </div>
          {node.children.length > 0 && renderCategoryTree(node.children, depth + 1)}
        </div>
      );
    });
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>카테고리 관리</h1>
        <p style={{ color: '#666' }}>카테고리를 생성하고 관리합니다</p>
      </header>

      <div className="box" style={{ marginBottom: '20px' }}>
        <div className="box-header">새 카테고리 생성</div>
        <div className="box-content">
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              부모 카테고리 (선택사항)
            </label>
            <select
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #555', background: '#3a3a3a', color: '#ffffff' }}
            >
              <option value="">최상위 카테고리</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="카테고리 이름"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
              style={{ flex: 1, padding: '8px', border: '1px solid #555', background: '#3a3a3a', color: '#ffffff' }}
            />
            <button onClick={handleCreateCategory}>생성</button>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="box-header">카테고리 목록 ({categories.length}개)</div>
        <div className="box-content" style={{ padding: 0 }}>
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              등록된 카테고리가 없습니다.
            </div>
          ) : (
            <div>
              {(() => {
                const tree = buildCategoryTree(categories);
                const myCategories = tree.filter(node => node.ownerId === user?.id);
                const otherCategories = tree.filter(node => node.ownerId !== user?.id);

                return (
                  <>
                    {myCategories.length > 0 && (
                      <>
                        <div style={{
                          padding: '10px 15px',
                          background: '#4a4a4a',
                          borderBottom: '2px solid #4CAF50',
                          color: '#4CAF50',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          내 카테고리 ({myCategories.length}개)
                        </div>
                        {renderCategoryTree(myCategories)}
                      </>
                    )}
                    {otherCategories.length > 0 && (
                      <>
                        <div style={{
                          padding: '10px 15px',
                          background: '#4a4a4a',
                          borderBottom: '1px solid #555',
                          color: '#999',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginTop: myCategories.length > 0 ? '10px' : '0'
                        }}>
                          전체 카테고리 ({otherCategories.length}개)
                        </div>
                        {renderCategoryTree(otherCategories)}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <button onClick={() => navigate('/')}>목록으로</button>
      </div>
    </div>
  );
};
