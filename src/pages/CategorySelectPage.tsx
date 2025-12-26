import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types/api';
import '../styles/CategorySelectPage.css';

export const CategorySelectPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');

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

  // 검색어 debounce (700ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
    }, 700);

    return () => clearTimeout(timeoutId);
  }, [searchKeyword]);

  // 카테고리를 계층 구조로 구성
  const rootCategories = categories.filter(c => !c.parentCategoryId);

  const getCategoryWithChildren = (category: Category): { category: Category; children: Category[] } => {
    const children = categories.filter(c => c.parentCategoryId === category.id);
    return { category, children };
  };

  // 검색 필터링 (debounced keyword 사용)
  const filteredRootCategories = debouncedSearchKeyword
    ? rootCategories.filter(c =>
        c.name.toLowerCase().includes(debouncedSearchKeyword.toLowerCase()) ||
        c.description?.toLowerCase().includes(debouncedSearchKeyword.toLowerCase())
      )
    : rootCategories;

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/posts/new?category=${categoryId}`);
  };

  const handleWriteWithoutCategory = () => {
    navigate('/posts/new');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">카테고리를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="container category-select-page">
      <div className="box">
        <div className="box-header">글쓰기할 카테고리를 선택해주세요</div>
        <div className="box-content">
          {/* 검색바 */}
          <div className="category-search-container">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="카테고리 검색..."
              className="category-search-input"
              autoComplete="off"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="category-search-clear"
              >
                초기화
              </button>
            )}
          </div>

          {/* 카테고리 없이 작성 버튼 */}
          <div
            className="no-category-option"
            onClick={handleWriteWithoutCategory}
          >
            카테고리 없이 작성
          </div>

          {/* 카테고리 목록 */}
          {filteredRootCategories.length === 0 ? (
            <div className="empty-message">
              {debouncedSearchKeyword ? '검색 결과가 없습니다.' : '카테고리가 없습니다.'}
            </div>
          ) : (
            <div className="category-list">
              {filteredRootCategories.map((rootCategory) => {
                const { category, children } = getCategoryWithChildren(rootCategory);
                return (
                  <div key={category.id} className="category-group">
                    {/* 부모 카테고리 */}
                    <div
                      className="category-item parent"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className="category-info">
                        <div className="category-name-section">
                          <span className="category-name">{category.name}</span>
                          {children.length > 0 && (
                            <span className="child-count">({children.length}개의 하위 카테고리)</span>
                          )}
                        </div>
                        {category.description && (
                          <div className="category-description">{category.description}</div>
                        )}
                      </div>
                      <div className="category-arrow">→</div>
                    </div>

                    {/* 하위 카테고리 */}
                    {children.length > 0 && (
                      <div className="children-categories">
                        {children.map((child) => (
                          <div
                            key={child.id}
                            className="category-item child"
                            onClick={() => handleCategorySelect(child.id)}
                          >
                            <div className="category-info">
                              <div className="category-name-section">
                                <span className="child-indent">└─</span>
                                <span className="category-name">{child.name}</span>
                              </div>
                              {child.description && (
                                <div className="category-description">{child.description}</div>
                              )}
                            </div>
                            <div className="category-arrow">→</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 하단 안내 */}
          <div className="bottom-guide">
            <p>💡 카테고리를 선택하면 해당 카테고리의 독자들에게 더 잘 노출됩니다.</p>
          </div>
        </div>
      </div>

      {/* 취소 버튼 */}
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button onClick={() => navigate(-1)}>취소</button>
      </div>
    </div>
  );
};
