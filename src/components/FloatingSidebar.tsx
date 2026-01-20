import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/FloatingSidebar.css';

export const FloatingSidebar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 토글 버튼 */}
      <button
        className="floating-sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* 사이드바 */}
      <div className={`floating-sidebar ${isOpen ? 'open' : ''}`}>
        {/* 내 정보 */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">내 정보</div>
          <div className="sidebar-section-content">
            {isAuthenticated && user ? (
              <div className="user-info">
                {user.avatarUrl && (
                  <img src={user.avatarUrl} alt={user.displayName} className="user-avatar" />
                )}
                <div className="user-details">
                  <Link to={`/users/${user.id}`} className="user-name">
                    {user.displayName}
                  </Link>
                  <div className="user-username">@{user.username}</div>
                </div>
              </div>
            ) : (
              <div className="not-logged-in">
                <div className="login-message">로그인이 필요합니다</div>
                <Link to="/login" className="login-link">
                  로그인하기 →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 바로가기 */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">바로가기</div>
          <div className="sidebar-section-content">
            <div className="quick-links">
              {isAuthenticated && (
                <Link to="/posts/liked" className="quick-link" onClick={() => setIsOpen(false)}>
                  좋아요 누른 게시물
                </Link>
              )}
              <Link to="/categories" className="quick-link" onClick={() => setIsOpen(false)}>
                전체 카테고리
              </Link>
              <Link to="/posts" className="quick-link" onClick={() => setIsOpen(false)}>
                전체 게시물
              </Link>
              {isAuthenticated && (
                <Link to="/posts/select-category" className="quick-link" onClick={() => setIsOpen(false)}>
                  글쓰기
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="floating-sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
