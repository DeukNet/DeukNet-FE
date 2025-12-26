import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { postService } from '../services/postService';
import { fileService } from '../services/fileService';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { trackUpdatePost, trackUploadThumbnail } from '../utils/analyticsEvents';

export const PostEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast.error('게시글 ID가 없습니다.');
        navigate('/');
        return;
      }

      try {
        setLoading(true);

        const postData = await postService.getPostById(id);

        setTitle(postData.title);
        setContent(postData.content || '');
        setThumbnailImageUrl(postData.thumbnailImageUrl || '');
      } catch (error: any) {
        console.error('Failed to fetch post:', error);
        toast.error(error.response?.data?.message || '게시글을 불러오는데 실패했습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleThumbnailSelect = () => {
    thumbnailInputRef.current?.click();
  };

  const handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    try {
      setUploading(true);
      const response = await fileService.uploadFile(file);
      setThumbnailImageUrl(response.fileUrl);
      trackUploadThumbnail();
      toast.success('썸네일 이미지가 업로드되었습니다.');
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      toast.error(error.response?.data?.message || '파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    if (!id) return;

    if (!title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);

      await postService.updatePost(id, {
        title: title.trim(),
        content: content.trim(),
        thumbnailImageUrl: thumbnailImageUrl || undefined,
      });
      trackUpdatePost(id);

      toast.success('게시글이 수정되었습니다.');
      // forceCommandModel=true로 PostgreSQL에서 직접 조회하여 최신 데이터 보장
      navigate(`/posts/${id}?forceCommandModel=true`);
    } catch (error: any) {
      console.error('Failed to update post:', error);
      toast.error(error.response?.data?.message || '게시글 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="box">
        <div className="box-header">게시글 수정</div>
        <div className="box-content">
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #555',
                borderRadius: '4px',
                background: '#3a3a3a',
                color: '#ffffff'
              }}
              disabled={saving}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              썸네일 이미지
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={handleThumbnailSelect}
                disabled={uploading || saving}
                style={{
                  padding: '8px 15px',
                  background: '#4a4a4a',
                  color: '#ffffff',
                  border: '1px solid #555',
                  cursor: uploading || saving ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading ? '업로드 중...' : '이미지 업로드'}
              </button>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                style={{ display: 'none' }}
              />
              <input
                type="text"
                value={thumbnailImageUrl}
                onChange={(e) => setThumbnailImageUrl(e.target.value)}
                placeholder="또는 URL을 직접 입력"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  background: '#3a3a3a',
                  color: '#ffffff'
                }}
                disabled={saving}
              />
            </div>
            {thumbnailImageUrl && (
              <div style={{ marginBottom: '10px' }}>
                <img
                  src={thumbnailImageUrl}
                  alt="Thumbnail preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '150px',
                    border: '1px solid #555',
                    borderRadius: '4px',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              내용
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="내용을 입력하세요 (마크다운 지원)"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                flex: 1,
                background: '#0066cc',
                color: 'white',
                border: '1px solid #0066cc',
              }}
            >
              {saving ? '수정 중...' : '수정하기'}
            </button>
            <button
              onClick={() => navigate(`/posts/${id}`)}
              disabled={saving}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
