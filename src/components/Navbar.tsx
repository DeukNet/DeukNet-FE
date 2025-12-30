import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SearchBar } from './SearchBar';
import { useEffect, useState } from 'react';
import '../styles/Navbar.css';

export const Navbar = () => {
  const { isAuthenticated, user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  // 페이지 이동 시마다 사용자 정보 갱신
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [location.pathname]);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      // 최상단이거나 근접하면 항상 보이기
      if (currentScrollPos < 7) {
        setVisible(true);
      } else {
        // 위로 스크롤하면 보이기, 아래로 스크롤하면 숨기기
        setVisible(prevScrollPos > currentScrollPos);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  return (
    <nav className={`navbar ${visible ? 'navbar-visible' : 'navbar-hidden'}`}>
      <div className="navbar-container">
        <div className="navbar-header">
          <div className="navbar-left">
            <Link to="/" className="navbar-logo-link">
              <img src="/deuknet-logo.png" alt="DeukNet" className="navbar-logo-image" />
              <span className="navbar-logo-text">DeukNet</span>
            </Link>
            <div className="navbar-links">
              {isAuthenticated && (
                <Link to="/posts/select-category" className="navbar-link">
                  글쓰기
                </Link>
              )}
              <Link to="/posts" className="navbar-link">
                전체 게시물
              </Link>
              <Link to="/categories" className="navbar-link">
                카테고리
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/categories/manage" className="navbar-link">
                  카테고리 관리
                </Link>
              )}
            </div>
          </div>

          <div className="navbar-search-container">
            <SearchBar />
          </div>
          <div className="navbar-right">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.id ? `/users/${user.id}` : '/profile'}
                  className="navbar-user-link"
                >
                  {user?.displayName || '닉네임'}
                </Link>
                <button
                  onClick={logout}
                  className="navbar-logout-button"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="navbar-login-button"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
