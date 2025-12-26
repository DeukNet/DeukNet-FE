import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type { LoginRequest, TokenResponse, UserResponse } from '../types/api';
import { trackLogout } from '../utils/analyticsEvents';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponse | null;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // localStorage에서 캐싱된 사용자 정보 확인
        const cachedUser = localStorage.getItem('currentUser');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
            setLoading(false);
            return;
          } catch (error) {
            console.error('Failed to parse cached user:', error);
            localStorage.removeItem('currentUser');
          }
        }

        // 캐시가 없으면 API 호출
        try {
          const currentUser = await userService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } catch (error) {
          console.error('Failed to fetch user:', error);
          authService.logout();
          setIsAuthenticated(false);
          localStorage.removeItem('currentUser');
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response: TokenResponse = await authService.login(data);
      authService.setTokens(response.accessToken, response.refreshToken);
      setIsAuthenticated(true);

      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('currentUser');
    trackLogout();
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return;

    try {
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      // 401 또는 403 에러 시 로그아웃
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
