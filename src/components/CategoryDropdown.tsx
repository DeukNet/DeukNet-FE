import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types/api';
import '../styles/CategoryDropdown.css';

export const CategoryDropdown = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rootCategories = categories.filter(c => !c.parentCategoryId);

  const getChildCategories = (parentId: string) => {
    return categories.filter(c => c.parentCategoryId === parentId);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/categories/${categoryId}`);
    setIsOpen(false);
  };

  return (
    <div className="category-dropdown" ref={dropdownRef}>
      <button
        className="category-dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        📁 카테고리
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="category-dropdown-menu">
          <div className="category-dropdown-header">
            <button
              className="view-all-categories-button"
              onClick={() => {
                navigate('/categories');
                setIsOpen(false);
              }}
            >
              전체 카테고리 보기 →
            </button>
          </div>
          <div className="category-dropdown-content">
            {rootCategories.length === 0 ? (
              <div className="category-dropdown-empty">
                카테고리가 없습니다
              </div>
            ) : (
              rootCategories.map((category) => {
                const children = getChildCategories(category.id);
                return (
                  <div key={category.id} className="category-group">
                    <div
                      className="category-parent-item"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <span className="category-name">{category.name}</span>
                      {category.thumbnailImageUrl && (
                        <img
                          src={category.thumbnailImageUrl}
                          alt={category.name}
                          className="category-thumbnail-small"
                        />
                      )}
                    </div>
                    {children.length > 0 && (
                      <div className="category-children">
                        {children.map((child) => (
                          <div
                            key={child.id}
                            className="category-child-item"
                            onClick={() => handleCategoryClick(child.id)}
                          >
                            <span className="category-name">{child.name}</span>
                            {child.thumbnailImageUrl && (
                              <img
                                src={child.thumbnailImageUrl}
                                alt={child.name}
                                className="category-thumbnail-small"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
