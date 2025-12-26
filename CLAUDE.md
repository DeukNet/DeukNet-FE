# Frontend Development Guide - DeukNet

## Project Overview

DeukNet 프론트엔드는 React + TypeScript + Vite로 구성된 커뮤니티 플랫폼입니다.

## 코딩 스타일 및 규칙

### 중요: 이모지 및 이모티콘 사용 금지

**절대 금지**: 코드, 주석, UI 텍스트에 이모지/이모티콘을 사용하지 마세요.

❌ 잘못된 예시:
```tsx
<button>📎 파일 업로드</button>
<span>👍 {post.likeCount}</span>
// TODO: 🔥 성능 개선 필요
```

✅ 올바른 예시:
```tsx
<button>파일 업로드</button>
<span>좋아요 {post.likeCount}</span>
// TODO: 성능 개선 필요
```

### 중요: 레트로 다크 테마 디자인

**이 애플리케이션은 레트로 스타일의 다크 테마만 사용합니다.** 라이트 테마는 지원하지 않습니다.

모든 UI 컴포넌트는 레트로 감성의 다크 배경을 전제로 설계되어야 하며, 텍스트/요소의 색상은 다크 배경에서 잘 보이는 색상을 사용해야 합니다.

**레트로 다크 테마 색상 팔레트**:
- 배경: `#1a1a1a` (메인), `#2b2b2b` (컨테이너), `#3a3a3a` (카드)
- 텍스트: `#00ff00` (레트로 그린 강조), `#ffffff` (제목), `#cccccc` (본문), `#999` (보조), `#666` (비활성)
- 강조: `#00ff00` (레트로 그린), `#ff6b00` (오렌지 포인트), `#00ffff` (시안 보조)
- 테두리: `#444` (기본), `#00ff00` (강조)

**레트로 디자인 원칙**:
- **호버 효과 금지**: 모든 호버 효과(hover, transform, box-shadow 등)를 사용하지 않습니다
- **플랫 디자인**: 그라데이션, 그림자 최소화
- **선명한 테두리**: `border: 2px solid` 사용
- **모노스페이스 폰트 권장**: 가능한 경우 `font-family: 'Courier New', monospace` 사용
- **네온 효과**: 강조 요소에 `text-shadow` 사용 가능 (예: `text-shadow: 0 0 10px #00ff00`)

❌ 잘못된 예시 (호버 효과 사용):
```tsx
<div style={{ transition: 'all 0.2s' }} onMouseEnter={() => setHover(true)}>
  호버 금지
</div>
```

✅ 올바른 예시 (레트로 스타일):
```tsx
<div style={{
  border: '2px solid #00ff00',
  background: '#2b2b2b',
  color: '#00ff00'
}}>
  레트로 텍스트
</div>
```

### 기타 규칙

1. **타입 안전성**: 모든 컴포넌트와 함수에 TypeScript 타입 정의
2. **접근성**: 버튼에는 명확한 텍스트 레이블 제공
3. **에러 핸들링**: try-catch로 모든 API 호출 처리

## 주요 디렉토리 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── contexts/       # React Context (Auth 등)
├── pages/          # 페이지 컴포넌트
├── services/       # API 서비스 레이어
└── types/          # TypeScript 타입 정의
```

## API 통신

- 모든 API 호출은 `services/` 디렉토리의 서비스 함수를 통해 처리
- `apiClient`를 사용하여 인증 토큰 자동 관리
- 에러 응답은 `ApiError` 타입으로 처리

## 상태 관리

- 전역 상태: React Context (AuthContext)
- 로컬 상태: useState, useEffect
- 복잡한 상태는 필요 시 커스텀 훅으로 분리

## 스타일링

- Inline styles 사용 (Tailwind CSS 미사용)
- 다크 테마 색상 팔레트 통일
- 호버 효과는 onMouseEnter/onMouseLeave 이벤트로 처리

## 주요 기능

### 최근 이미지 URL 관리 (Local Storage)

마크다운 에디터에서 업로드한 이미지를 로컬 스토리지에 저장하고 재사용할 수 있는 기능입니다.

**구현된 파일**:
- `src/utils/recentImagesStorage.ts` - 로컬 스토리지 관리 유틸리티
- `src/components/RecentImagePicker.tsx` - 최근 이미지 선택 UI (다크 테마)
- `src/styles/RecentImagePicker.css` - 다크 테마 스타일
- `src/components/MarkdownEditor.tsx` - 통합 구현

**주요 기능**:
- 이미지 업로드 시 자동으로 로컬 스토리지에 저장 (최대 15개, FIFO 방식)
- "최근 이미지" 버튼 클릭 시 모달로 썸네일 표시
- 썸네일 클릭 시 마크다운 문법으로 자동 삽입
- 개별 이미지 삭제 기능
- 상대 시간 표시 ("방금 전", "5분 전" 등)
- 반응형 그리드 레이아웃 (PC: 4열, 모바일: 2열)

**사용 예시**:
```typescript
import { recentImagesStorage } from '../utils/recentImagesStorage';

// 이미지 추가 (MarkdownEditor에서 자동 호출)
recentImagesStorage.addImage(imageUrl, fileName);

// 모든 이미지 조회
const images = recentImagesStorage.getImages();

// 특정 이미지 삭제
recentImagesStorage.removeImage(imageUrl);

// 전체 삭제
recentImagesStorage.clearAll();
```

**레트로 다크 테마 색상 (RecentImagePicker)**:
- 모달 배경: `#1a1a1a`
- 카드 배경: `#2b2b2b`
- 테두리: `#00ff00` (레트로 그린)
- 제목 텍스트: `#00ff00` (네온 효과)
- 본문 텍스트: `#cccccc`
- 보조 텍스트: `#999`
- 호버 효과: 없음 (레트로 디자인 원칙 준수)
