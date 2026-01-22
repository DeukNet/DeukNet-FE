import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingSidebar } from './FloatingSidebar';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // localStorage에서 온보딩 완료 여부 체크
    if (!loading && user) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

      // 익명 권한이 있는 사용자는 온보딩 건너뛰기
      if (user.canAccessAnonymous && !hasSeenOnboarding) {
        localStorage.setItem('hasSeenOnboarding', 'true');
        return;
      }

      // 온보딩을 아직 보지 않은 경우 온보딩 페이지로 리다이렉트
      if (!hasSeenOnboarding) {
        navigate('/onboarding');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="layout-container">
      <FloatingSidebar />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};
