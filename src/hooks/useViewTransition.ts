import { useNavigate, type NavigateOptions } from 'react-router-dom';

// View Transitions API 타입 체크
function supportsViewTransitions() {
  return 'startViewTransition' in document;
}

export function useViewTransitionNavigate() {
  const navigate = useNavigate();

  const viewTransitionNavigate = (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      // history.go() 같은 숫자 내비게이션은 View Transition 없이 실행
      navigate(to);
      return;
    }

    if (!supportsViewTransitions()) {
      // View Transitions API 미지원 브라우저는 일반 navigate
      navigate(to, options);
      return;
    }

    // View Transitions API 지원 브라우저
    (document as any).startViewTransition(() => {
      navigate(to, options);
    });
  };

  return viewTransitionNavigate;
}
