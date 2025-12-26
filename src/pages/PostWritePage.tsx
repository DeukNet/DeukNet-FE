import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { postService } from '../services/postService';
import { fileService } from '../services/fileService';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { trackCreatePost, trackUploadThumbnail } from '../utils/analyticsEvents';

export const PostWritePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // URL에서 category 파라미터 읽기
  useEffect(() => {
    const categoryIdParam = searchParams.get('category') || searchParams.get('categoryId');
    if (categoryIdParam) {
      setSelectedCategoryId(categoryIdParam);
    }
  }, [searchParams]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 확인 (10MB 제한)
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
      // input 초기화 (같은 파일 재선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      const postId = await postService.createPost({
        title: title.trim(),
        content: content.trim(),
        categoryId: selectedCategoryId,
        authorType: isAnonymous ? 'ANONYMOUS' : 'REAL',
        thumbnailImageUrl: thumbnailImageUrl.trim() || undefined,
      });

      await postService.publishPost(postId);
      trackCreatePost(selectedCategoryId);

      // forceCommandModel=true로 PostgreSQL에서 직접 조회하여 최신 데이터 보장
      navigate(`/posts/${postId}?forceCommandModel=true`);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      toast.error(error.response?.data?.message || '게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="box">
        <div className="box-header">게시글 작성</div>
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
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              썸네일 이미지
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={thumbnailImageUrl}
                onChange={(e) => setThumbnailImageUrl(e.target.value)}
                placeholder="썸네일 이미지 URL을 입력하세요 (선택사항)"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  background: '#3a3a3a',
                  color: '#ffffff'
                }}
                disabled={loading || uploading}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={handleFileSelect}
                disabled={loading || uploading}
                style={{
                  padding: '8px 15px',
                  background: '#3a3a3a',
                  color: '#ffffff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {uploading ? '업로드 중...' : '파일 첨부'}
              </button>
            </div>
            {thumbnailImageUrl && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={thumbnailImageUrl}
                  alt="썸네일 미리보기"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '200px',
                    borderRadius: '4px',
                    border: '1px solid #555'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                disabled={loading}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 'normal', fontSize: '14px' }}>익명으로 작성</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                background: '#0066cc',
                color: 'white',
                border: '1px solid #0066cc',
              }}
            >
              {loading ? '작성 중...' : '작성하기'}
            </button>
            <button
              onClick={() => navigate('/')}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
