import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { fileService } from '../services/fileService';
import { postService } from '../services/postService';
import { permissionService } from '../services/permissionService';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import type { UserResponse, UpdateUserProfileRequest, PostSearchResponse } from '../types/api';
import { trackViewProfile, trackUpdateProfile, trackUploadAvatar } from '../utils/analyticsEvents';
import '../styles/UserProfilePage.css';

export const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, refreshUser } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 익명 권한 관련 상태
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionPassword, setPermissionPassword] = useState('');
  const [permissionLoading, setPermissionLoading] = useState(false);

  // 게시글 목록 상태
  const [posts, setPosts] = useState<PostSearchResponse[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const isMyProfile = currentUser?.id === userId;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const userData = await userService.getUserById(userId);
        setUser(userData);
        setDisplayName(userData.displayName);
        setBio(userData.bio || '');
        setAvatarUrl(userData.avatarUrl || '');
        trackViewProfile(userId);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // 유저의 게시글 목록 조회
  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) return;

      try {
        setPostsLoading(true);
        let response;

        if (isMyProfile) {
          response = await postService.getMyPosts(currentPage, pageSize);
        } else {
          response = await postService.searchPosts({
            authorId: userId,
            page: currentPage,
            size: pageSize,
          });
        }

        setPosts(response.results);
        setTotalPages(Math.ceil(response.totalElements / response.pageSize));
      } catch (err) {
        console.error('Failed to fetch user posts:', err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [userId, currentPage, isMyProfile]);

  const handleEdit = () => {
    if (!user) return;
    setDisplayName(user.displayName);
    setBio(user.bio || '');
    setAvatarUrl(user.avatarUrl || '');
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await fileService.uploadFile(file);
      setAvatarUrl(response.fileUrl);
      trackUploadAvatar();
    } catch (err) {
      console.error('Failed to upload file:', err);
      setError('파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('닉네임을 입력하세요.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const request: UpdateUserProfileRequest = {
        displayName,
        bio,
        avatarUrl,
      };

      await userService.updateProfile(request);
      trackUpdateProfile();
      setSuccess(true);
      setIsEditing(false);

      if (userId) {
        const userData = await userService.getUserById(userId);
        setUser(userData);
      }

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('프로필 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionRequest = async () => {
    if (!permissionPassword.trim()) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setPermissionLoading(true);
      await permissionService.requestAnonymousAccess(permissionPassword);
      toast.success('익명 권한이 부여되었습니다.');
      setShowPermissionModal(false);
      setPermissionPassword('');
      await refreshUser();
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

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="posts-loading">로딩 중...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="user-profile-page">
        <div className="error-message">{error || '사용자를 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-page">
        <div className="error-message">사용자를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-box">
        <div className="profile-header">
          <h1 className="profile-title">
            {isMyProfile ? '내 프로필' : '사용자 프로필'}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isMyProfile && !isEditing && (
              <>
                <button
                  onClick={() => setShowPermissionModal(true)}
                  className="edit-button"
                  style={{
                    background: currentUser?.canAccessAnonymous ? '#28a745' : '#6c757d',
                    borderColor: currentUser?.canAccessAnonymous ? '#28a745' : '#6c757d',
                  }}
                >
                  {currentUser?.canAccessAnonymous ? '익명 권한 있음' : '익명 권한 신청'}
                </button>
                <button onClick={handleEdit} className="edit-button">
                  수정하기
                </button>
              </>
            )}
          </div>
        </div>
        <hr />

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">프로필이 성공적으로 수정되었습니다.</div>}

        {isEditing ? (
          <div className="profile-edit-form">
            <div className="form-group">
              <label className="form-label">닉네임 *</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="form-input"
                placeholder="닉네임을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label className="form-label">소개</label>
              <MarkdownEditor
                value={bio}
                onChange={setBio}
                placeholder="자기소개를 입력하세요 (마크다운 지원)"
                minHeight="200px"
              />
            </div>

            <div className="form-group">
              <label className="form-label">프로필 이미지</label>
              <div className="form-file-group">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="file-upload-button"
                >
                  {uploading ? '업로드 중...' : '이미지 업로드'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="또는 URL을 직접 입력"
                />
              </div>
              {avatarUrl && (
                <div className="avatar-preview">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-buttons">
              <button onClick={handleSave} disabled={saving} className="save-button">
                {saving ? '저장 중...' : '저장'}
              </button>
              <button onClick={handleCancel} disabled={saving} className="cancel-button">
                취소
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="profile-content">
              <div className="profile-avatar-container">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <span className="profile-avatar-initial">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{user.displayName}</h2>
                <p className="profile-username">@{user.username}</p>
              </div>
            </div>

            <div className="profile-bio-section">
              <h3 className="profile-bio-title">소개</h3>
              {user.bio ? (
                <div className="profile-bio-content">
                  <MarkdownRenderer content={user.bio} />
                </div>
              ) : (
                <p className="profile-bio-empty">소개가 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 유저가 작성한 게시글 목록 */}
      <div className="posts-box">
        <h2 className="posts-title">
          {isMyProfile ? '내가 작성한 글' : `${user.displayName}님이 작성한 글`}
        </h2>

        {postsLoading ? (
          <div className="posts-loading">로딩 중...</div>
        ) : !posts || posts.length === 0 ? (
          <div className="posts-empty">
            {isMyProfile ? '작성한 글이 없습니다.' : '작성한 글이 없습니다.'}
          </div>
        ) : (
          <>
            <div className="posts-list">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showCategory={true}
                  size="medium"
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="pagination-button"
                >
                  이전
                </button>
                <span className="pagination-info">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="pagination-button"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
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
              {currentUser?.canAccessAnonymous ? '익명 권한 상태' : '익명 권한 신청'}
            </h2>
            {currentUser?.canAccessAnonymous ? (
              <div>
                <p style={{ color: '#28a745', marginBottom: '20px' }}>
                  익명 작성 권한이 있습니다.
                </p>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  닫기
                </button>
              </div>
            ) : (
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
                    onClick={() => {
                      setShowPermissionModal(false);
                      setPermissionPassword('');
                    }}
                    disabled={permissionLoading}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
