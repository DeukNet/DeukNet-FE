import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { trackLogin } from '../utils/analyticsEvents';

export const OAuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSuccess = () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        toast.error('로그인에 실패했습니다.');
        navigate('/login');
        return;
      }

      if (!accessToken || !refreshToken) {
        console.error('No tokens received');
        toast.error('토큰을 받지 못했습니다.');
        navigate('/login');
        return;
      }

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Track login event (assuming Google OAuth for now)
      trackLogin('Google');

      // Navigate to home
      navigate('/');
    };

    handleSuccess();
  }, [searchParams, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p>로그인 처리 중...</p>
      </div>
    </div>
  );
};
