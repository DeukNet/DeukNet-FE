import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TERMS_AGREED_KEY = 'deuknet_terms_agreed';

export const LoginPage = () => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 동의 여부 불러오기
  useEffect(() => {
    const savedAgreement = localStorage.getItem(TERMS_AGREED_KEY);
    if (savedAgreement === 'true') {
      setAgreedToTerms(true);
    }
  }, []);

  // 체크박스 변경 시 로컬 스토리지에 저장
  const handleAgreementChange = (checked: boolean) => {
    setAgreedToTerms(checked);
    localStorage.setItem(TERMS_AGREED_KEY, checked.toString());
  };

  const handleGoogleLogin = () => {
    if (!agreedToTerms) {
      toast.error('이용약관에 동의해주세요.');
      return;
    }
    window.location.href = `${BACKEND_URL}/api/auth/oauth/google`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2b2b2b' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
        <div style={{ background: '#3a3a3a', border: '1px solid #555', marginBottom: '20px' }}>
          <div style={{ background: '#4a4a4a', padding: '10px 15px', borderBottom: '1px solid #555', fontWeight: 'bold', textAlign: 'center', fontSize: '20px', color: '#ffffff' }}>
            DeukNet
          </div>
          <div style={{ padding: '15px' }}>
            <p style={{ textAlign: 'center', color: '#999', marginBottom: '20px' }}>
              소셜 계정으로 로그인하세요
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* 이용약관 동의 체크박스 */}
              <div style={{
                padding: '15px',
                background: '#2b2b2b',
                border: '1px solid #555',
                borderRadius: '4px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  gap: '10px'
                }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => handleAgreementChange(e.target.checked)}
                    style={{
                      marginTop: '3px',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#e0e0e0', lineHeight: '1.5' }}>
                    DeukNet의{' '}
                    <Link
                      to="/terms"
                      style={{ color: '#66b3ff', textDecoration: 'underline' }}
                      target="_blank"
                    >
                      이용약관
                    </Link>
                    에 동의합니다.
                    <br />
                    <span style={{ fontSize: '11px', color: '#999' }}>
                      (필수) 서비스 이용을 위해 반드시 동의해주세요.
                    </span>
                  </span>
                </label>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={!agreedToTerms}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: agreedToTerms ? '#4a4a4a' : '#333',
                  border: '1px solid #555',
                  color: agreedToTerms ? '#ffffff' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: agreedToTerms ? 'pointer' : 'not-allowed',
                  opacity: agreedToTerms ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (agreedToTerms) e.currentTarget.style.background = '#555';
                }}
                onMouseLeave={(e) => {
                  if (agreedToTerms) e.currentTarget.style.background = '#4a4a4a';
                }}
              >
                <span style={{ fontSize: '20px' }}>G</span>
                <span>Google로 계속하기</span>
              </button>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
              <p style={{ marginBottom: '10px' }}>
                로그인하면 DeukNet의 이용약관에 동의하게 됩니다.
              </p>
              <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.5' }}>
                ⚠️ 본 서비스는 무료 개인 프로젝트로 제공됩니다.<br />
                게시물에 대한 모든 법적 책임은 작성자에게 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#999', fontSize: '13px' }}>홈으로 돌아가기</a>
        </div>
      </div>
    </div>
  );
};
