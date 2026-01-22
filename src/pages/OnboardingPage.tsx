import { useState, useEffect } from 'react';
import { permissionService } from '../services/permissionService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const OnboardingPage = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionPassword, setPermissionPassword] = useState('');
  const [permissionLoading, setPermissionLoading] = useState(false);

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('로그인이 필요합니다.');
      window.location.href = '/login';
    }
  }, [user, authLoading]);

  const handleComplete = () => {
    setIsLoading(true);

    // localStorage에 온보딩 완료 플래그 저장
    localStorage.setItem('hasSeenOnboarding', 'true');

    toast.success('환영합니다! DeukNet 사용을 시작합니다.');

    // 홈으로 리다이렉트
    window.location.href = '/';
  };

  const handlePermissionRequest = async () => {
    if (!permissionPassword.trim()) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setPermissionLoading(true);
      await permissionService.requestAnonymousAccess(permissionPassword);
      toast.success('익명 권한이 부여되었습니다! 잠시 후 메인 페이지로 이동합니다.');
      setShowPermissionModal(false);
      setPermissionPassword('');

      // localStorage에 온보딩 완료 플래그 저장
      localStorage.setItem('hasSeenOnboarding', 'true');

      // 사용자 정보 캐시 업데이트
      await refreshUser();

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err: any) {
      console.error('Failed to request permission:', err);
      if (err.response?.status === 401) {
        toast.error('비밀번호가 일치하지 않습니다.');
      } else if (err.response?.status === 404) {
        toast.error('비밀번호가 설정되지 않았습니다. 관리자에게 문의하세요.');
      } else {
        toast.error('권한 신청에 실패했습니다.');
      }
    } finally {
      setPermissionLoading(false);
    }
  };

  // 인증 로딩 중이면 로딩 화면 표시
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2b2b2b' }}>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2b2b2b' }}>
      <div style={{ maxWidth: '600px', width: '100%', padding: '20px' }}>
        <div style={{ background: '#3a3a3a', border: '1px solid #555' }}>
          <div style={{ background: '#4a4a4a', padding: '15px 20px', borderBottom: '1px solid #555', fontWeight: 'bold', textAlign: 'center', fontSize: '24px', color: '#ffffff' }}>
            DeukNet에 오신 것을 환영합니다!
          </div>
          <div style={{ padding: '30px 20px' }}>
            <div style={{ marginBottom: '25px', textAlign: 'center' }}>
              <p style={{ color: '#e0e0e0', fontSize: '16px', lineHeight: '1.6', marginBottom: '10px' }}>
                DeukNet은 <strong style={{ color: '#66b3ff', fontSize: '18px' }}>익명 작성 기능</strong>을 제공합니다
              </p>
            </div>

            <div style={{ background: '#2b2b2b', border: '2px solid #66b3ff', borderRadius: '8px', padding: '20px', marginBottom: '25px' }}>
              <h4 style={{
                color: '#66b3ff',
                fontSize: '17px',
                marginBottom: '15px',
                fontWeight: 'bold',
                borderBottom: '2px solid #66b3ff',
                paddingBottom: '8px'
              }}>
                💡 익명 권한이란?
              </h4>
              <p style={{ color: '#e0e0e0', lineHeight: '1.7', fontSize: '14px', marginBottom: '12px' }}>
                • 게시글/댓글 작성 시 <strong style={{ textDecoration: 'underline' }}>실명 또는 익명</strong> 선택 가능<br/>
                • 익명 작성 시 작성자 정보가 <strong>"익명"</strong>으로 표시
              </p>
            </div>

            <div style={{ background: '#2b2b2b', border: '2px solid #555', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
              <h4 style={{
                color: '#ffffff',
                fontSize: '17px',
                marginBottom: '12px',
                fontWeight: 'bold',
                borderBottom: '2px solid #555',
                paddingBottom: '8px'
              }}>
                🔑 권한 신청 방법
              </h4>
              <p style={{ color: '#e0e0e0', lineHeight: '1.7', fontSize: '14px' }}>
                <strong style={{ color: '#66b3ff' }}>1.</strong> 아래 버튼 클릭 → <strong style={{ color: '#66b3ff' }}>2.</strong> 비밀번호 입력 → <strong style={{ color: '#66b3ff' }}>3.</strong> 승인 완료
              </p>
            </div>

            <div style={{ background: '#3a2b2b', border: '1px solid #cc6666', borderRadius: '6px', padding: '12px', marginBottom: '25px' }}>
              <p style={{ color: '#ffcccc', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                ⚠️ <strong>악용 시 권한이 회수될 수 있습니다</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowPermissionModal(true)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: isLoading ? '#333' : '#28a745',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  opacity: isLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.background = '#218838';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.background = '#28a745';
                }}
              >
                익명 권한 신청하기
              </button>
              <button
                onClick={handleComplete}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: isLoading ? '#333' : '#6c757d',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  opacity: isLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.background = '#5a6268';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.background = '#6c757d';
                }}
              >
                {isLoading ? '처리 중...' : '나중에 하기'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
          <p>익명 권한은 나중에 프로필 페이지에서도 신청할 수 있습니다.</p>
        </div>
      </div>

      {/* 익명 권한 신청 모달 */}
      {showPermissionModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowPermissionModal(false)}
        >
          <div
            style={{
              background: '#2a2a2a',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid #444',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 20px 0', color: '#fff' }}>
              익명 권한 신청
            </h2>
            <div>
              <p style={{ color: '#aaa', marginBottom: '15px', fontSize: '14px' }}>
                익명으로 게시글과 댓글을 작성하려면 비밀번호를 입력하세요.
              </p>
              <input
                type="password"
                value={permissionPassword}
                onChange={(e) => setPermissionPassword(e.target.value)}
                placeholder="비밀번호 입력"
                onKeyDown={(e) => e.key === 'Enter' && handlePermissionRequest()}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '15px',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  background: '#3a3a3a',
                  color: '#fff',
                  boxSizing: 'border-box',
                }}
                disabled={permissionLoading}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePermissionRequest}
                  disabled={permissionLoading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#0066cc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: permissionLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {permissionLoading ? '신청 중...' : '신청하기'}
                </button>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  disabled={permissionLoading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: permissionLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
