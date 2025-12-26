import { useState, useRef } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { RecentImagePicker } from './RecentImagePicker';
import { fileService } from '../services/fileService';
import { recentImagesStorage } from '../utils/recentImagesStorage';
import '../styles/MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const MarkdownEditor = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요... (마크다운 지원)',
  minHeight = '400px'
}: MarkdownEditorProps) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showRecentImages, setShowRecentImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const allowedTypes = ['image/gif', 'image/png', 'image/jpg', 'image/jpeg', 'application/pdf', 'audio/mp3'];
    if (!allowedTypes.includes(file.type)) {
      alert('허용되지 않은 파일 형식입니다. (gif, png, jpg, jpeg, pdf, mp3만 가능)');
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.');
      return;
    }

    try {
      setUploading(true);
      const response = await fileService.uploadFile(file);

      // 이미지는 마크다운 이미지 문법, 그 외는 링크로 삽입
      const isImage = file.type.startsWith('image/');
      const markdownText = isImage
        ? `\n![${file.name}](${response.fileUrl})\n`
        : `\n[${file.name}](${response.fileUrl})\n`;

      onChange(value + markdownText);

      // 이미지인 경우 로컬 스토리지에 저장
      if (isImage) {
        recentImagesStorage.addImage(response.fileUrl, file.name);
      }

      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('File upload failed:', error);
      alert(error.response?.data?.message || '파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRecentImageSelect = (imageUrl: string) => {
    const markdownText = `\n![이미지](${imageUrl})\n`;
    onChange(value + markdownText);
  };

  return (
    <div className="markdown-editor">
      <div className="markdown-editor-tabs">
        <button
          onClick={() => setPreviewMode(false)}
          className={`markdown-tab-button ${!previewMode ? 'active' : 'inactive'}`}
        >
          작성
        </button>
        <button
          onClick={() => setPreviewMode(true)}
          className={`markdown-tab-button ${previewMode ? 'active' : 'inactive'}`}
        >
          미리보기
        </button>
        {!previewMode && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="markdown-file-button"
            >
              {uploading ? '업로드 중...' : '파일 첨부'}
            </button>
            <button
              onClick={() => setShowRecentImages(true)}
              className="markdown-file-button"
            >
              최근 이미지
            </button>
          </>
        )}
        <div className="markdown-editor-hint">
          마크다운 형식 지원
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".gif,.png,.jpg,.jpeg,.pdf,.mp3"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {previewMode ? (
        <div className="markdown-preview-area" style={{ minHeight }}>
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <div className="markdown-preview-empty">내용을 입력하면 미리보기가 표시됩니다.</div>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="markdown-textarea"
          style={{ minHeight }}
        />
      )}

      {!previewMode && (
        <div className="markdown-help">
          <strong>마크다운 사용법:</strong> **굵게**, *기울임*, `코드`, [링크](url), # 제목, - 리스트, &gt; 인용문
        </div>
      )}

      {showRecentImages && (
        <RecentImagePicker
          onImageSelect={handleRecentImageSelect}
          onClose={() => setShowRecentImages(false)}
        />
      )}
    </div>
  );
};
