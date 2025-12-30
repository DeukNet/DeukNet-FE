import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { categoryService } from '../services/categoryService';
import { fileService } from '../services/fileService';
import { useAuth } from '../contexts/AuthContext';
import type { Category } from '../types/api';

export const CategoryEditPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 권한 확인 및 카테고리 조회
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        navigate('/');
        return;
      }

      // 어드민 권한 확인
      if (user?.role !== 'ADMIN') {
        toast.error('권한이 없습니다.');
        navigate(`/categories/${categoryId}`);
        return;
      }

      try {
        setLoading(true);
        const allCategories = await categoryService.getAllCategories();
        const currentCategory = allCategories.find(c => c.id === categoryId);

        if (!currentCategory) {
          toast.error('카테고리를 찾을 수 없습니다.');
          navigate('/');
          return;
        }

        setCategory(currentCategory);
        setDescription(currentCategory.description || '');
        setThumbnailImageUrl(currentCategory.thumbnailImageUrl || '');
      } catch (error: any) {
        console.error('Failed to fetch category:', error);
        toast.error('카테고리 정보를 불러오는데 실패했습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, user, navigate]);

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
    if (!categoryId) return;

    try {
      setSaving(true);

      await categoryService.updateCategory(categoryId, {
        description: description.trim() || undefined,
        thumbnailImageUrl: thumbnailImageUrl.trim() || undefined,
      });

      toast.success('카테고리가 수정되었습니다.');
      navigate(`/categories/${categoryId}`);
    } catch (error: any) {
      console.error('Failed to update category:', error);
      toast.error(error.response?.data?.message || '카테고리 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="box">
          <div className="box-content" style={{ textAlign: 'center', padding: '40px' }}>
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="container">
      <div className="box">
        <div className="box-header">카테고리 수정</div>
        <div className="box-content">
          {/* 카테고리 이름 (수정 불가) */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              카테고리 이름
            </label>
            <input
              type="text"
              value={category.name}
              disabled
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #555',
                borderRadius: '4px',
                background: '#2a2a2a',
                color: '#999',
                cursor: 'not-allowed'
              }}
            />
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              카테고리 이름은 수정할 수 없습니다
            </div>
          </div>

          {/* 썸네일 이미지 */}
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
                disabled={saving || uploading}
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
                disabled={saving || uploading}
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

          {/* 설명 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="카테고리 설명을 입력하세요..."
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '10px',
                border: '1px solid #555',
                borderRadius: '4px',
                background: '#3a3a3a',
                color: '#ffffff',
                fontSize: '13px',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              disabled={saving || uploading}
            />
          </div>

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubmit}
              disabled={saving || uploading}
              style={{
                flex: 1,
                background: '#0066cc',
                color: 'white',
                border: '1px solid #0066cc',
              }}
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
            <button
              onClick={() => navigate(`/categories/${categoryId}`)}
              disabled={saving || uploading}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
