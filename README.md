# DeukNet Frontend

DeukNet API를 위한 React + TypeScript 프론트엔드 애플리케이션입니다.

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **Tailwind CSS** - 스타일링
- **TanStack Query** - 서버 상태 관리 (설치됨, 추후 적용 가능)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 3. 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

## 프로젝트 구조

```
src/
├── components/        # 재사용 가능한 컴포넌트
│   ├── Layout.tsx
│   └── Navbar.tsx
├── contexts/          # React Context (전역 상태)
│   └── AuthContext.tsx
├── pages/             # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── PostDetailPage.tsx
│   ├── SearchPage.tsx
│   └── LoginPage.tsx
├── services/          # API 서비스 레이어
│   ├── api.ts
│   ├── authService.ts
│   ├── postService.ts
│   ├── commentService.ts
│   ├── reactionService.ts
│   └── categoryService.ts
├── types/             # TypeScript 타입 정의
│   └── api.ts
├── hooks/             # 커스텀 React Hooks (추후 추가)
├── utils/             # 유틸리티 함수 (추후 추가)
├── App.tsx            # 메인 앱 컴포넌트
└── main.tsx           # 앱 진입점
```

## 주요 기능

### 구현된 기능

✅ **게시글**
- 홈페이지 (인기 게시글 + 최신 게시글)
- 게시글 상세 보기
- 게시글 검색

✅ **인증**
- 로그인 페이지 UI
- 인증 컨텍스트 (AuthContext)
- 자동 토큰 갱신 (Axios Interceptor)

✅ **네비게이션**
- 반응형 네비게이션 바
- 라우팅 설정

### 추후 구현 가능한 기능

🔜 **게시글 작성/수정**
- 게시글 작성 폼
- 마크다운 에디터
- 카테고리 선택

🔜 **댓글 시스템**
- 댓글 목록
- 댓글 작성/수정/삭제
- 대댓글 (Nested Comments)

🔜 **리액션**
- 좋아요 버튼
- 다양한 리액션 타입

🔜 **사용자 프로필**
- 사용자 프로필 페이지
- 작성 글 목록

🔜 **OAuth 로그인**
- Google OAuth 연동
- GitHub OAuth 연동

## API 연동

백엔드 API 서버가 `http://localhost:8080`에서 실행되어야 합니다.

### API 엔드포인트

```
POST   /auth/login              # OAuth 로그인
POST   /auth/refresh            # 토큰 갱신
GET    /posts                   # 게시글 검색
GET    /posts/{id}              # 게시글 조회
POST   /posts                   # 게시글 작성
PUT    /posts/{id}              # 게시글 수정
DELETE /posts/{id}              # 게시글 삭제
POST   /posts/{id}/publish      # 게시글 발행
POST   /posts/{id}/view         # 조회수 증가
GET    /posts/popular           # 인기 게시글
GET    /api/search/posts        # 통합 검색
```

자세한 API 스펙은 백엔드의 `API_SPEC.md`와 `SEARCH_API.md`를 참고하세요.

## 인증

이 애플리케이션은 JWT 기반 인증을 사용합니다:

1. 로그인 시 `accessToken`과 `refreshToken`을 받아 localStorage에 저장
2. API 요청 시 자동으로 `Authorization: Bearer {token}` 헤더 추가
3. 401 에러 발생 시 자동으로 토큰 갱신 시도
4. 토큰 갱신 실패 시 로그인 페이지로 리다이렉트

## 스타일링

Tailwind CSS를 사용하여 스타일링했습니다. `tailwind.config.js`에서 커스터마이징 가능합니다.

## 개발 팁

### TanStack Query 사용 예시

TanStack Query가 설치되어 있으므로, 추후 다음과 같이 사용할 수 있습니다:

```typescript
import { useQuery } from '@tanstack/react-query';
import { postService } from '../services/postService';

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => postService.getPostById(postId),
  });
};
```

### 환경별 API URL 설정

- 개발: `http://localhost:8080`
- 프로덕션: `.env.production` 파일에 실제 API URL 설정

## 라이센스

MIT
