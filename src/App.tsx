import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { Layout } from './components/Layout';
import { MainPage } from './pages/MainPage';
import { CategoryPage } from './pages/CategoryPage';
import { CategoryEditPage } from './pages/CategoryEditPage';
import { CategoryListPage } from './pages/CategoryListPage';
import { PostListPage } from './pages/PostListPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { PostWritePage } from './pages/PostWritePage';
import { PostEditPage } from './pages/PostEditPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { OAuthSuccessPage } from './pages/OAuthSuccessPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { CategoryManagePage } from './pages/CategoryManagePage';
import { UserProfilePage } from './pages/UserProfilePage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { CategorySelectPage } from './pages/CategorySelectPage';
import { LikedPostsPage } from './pages/LikedPostsPage';
import { initGA, trackPageView } from './utils/analytics';

// Google Analytics 페이지뷰 추적 컴포넌트
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  // Google Analytics 초기화
  useEffect(() => {
    initGA();
  }, []);
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <AuthProvider>
        <AnalyticsTracker />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#f44336',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/auth/success" element={<OAuthSuccessPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/"
            element={
              <Layout>
                <MainPage />
              </Layout>
            }
          />
          <Route
            path="/categories"
            element={
              <Layout>
                <CategoryListPage />
              </Layout>
            }
          />
          <Route
            path="/categories/:categoryId"
            element={
              <Layout>
                <CategoryPage />
              </Layout>
            }
          />
          <Route
            path="/categories/:categoryId/edit"
            element={
              <Layout>
                <CategoryEditPage />
              </Layout>
            }
          />
          <Route
            path="/posts"
            element={
              <Layout>
                <PostListPage />
              </Layout>
            }
          />
          <Route
            path="/posts/liked"
            element={
              <Layout>
                <LikedPostsPage />
              </Layout>
            }
          />
          <Route
            path="/posts/select-category"
            element={
              <Layout>
                <CategorySelectPage />
              </Layout>
            }
          />
          <Route
            path="/posts/new"
            element={
              <Layout>
                <PostWritePage />
              </Layout>
            }
          />
          <Route
            path="/posts/:id"
            element={
              <Layout>
                <PostDetailPage />
              </Layout>
            }
          />
          <Route
            path="/posts/:id/edit"
            element={
              <Layout>
                <PostEditPage />
              </Layout>
            }
          />
          <Route
            path="/search"
            element={
              <Layout>
                <SearchPage />
              </Layout>
            }
          />
          <Route
            path="/categories/manage"
            element={
              <Layout>
                <CategoryManagePage />
              </Layout>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <Layout>
                <UserProfilePage />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </DarkModeProvider>
    </BrowserRouter>
  );
}

export default App;
