import ReactGA from 'react-ga4';

// Window gtag 타입 선언
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Google Analytics 측정 ID
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Google Analytics 초기화
 * 개발 환경에서는 디버그 모드로 실행
 */
export const initGA = () => {
  if (!MEASUREMENT_ID) {
    console.warn('[GA] Measurement ID not found. Google Analytics will not be initialized.');
    return;
  }

  console.log('[GA] Initializing with ID:', MEASUREMENT_ID);
  console.log('[GA] Environment:', import.meta.env.MODE);

  ReactGA.initialize(MEASUREMENT_ID, {
    gtagOptions: {
      debug_mode: true, // 항상 debug mode 활성화
    },
  });

  // debug_mode 파라미터 명시적 설정
  if (typeof window.gtag !== 'undefined') {
    window.gtag('set', { debug_mode: true });
  }

  console.log('[GA] Google Analytics initialized with debug_mode enabled');
  console.log('[GA] window.gtag exists:', typeof window.gtag !== 'undefined');

  // 테스트 이벤트 전송
  setTimeout(() => {
    console.log('[GA] Sending test event...');
    ReactGA.gtag('event', 'test_event', {
      event_category: 'Test',
      event_label: 'Initialization Test',
      debug_mode: true
    });
  }, 1000);
};

/**
 * 페이지뷰 추적
 * @param path - 페이지 경로 (예: '/posts', '/categories/123')
 * @param title - 페이지 제목 (선택사항)
 */
export const trackPageView = (path: string, title?: string) => {
  if (!MEASUREMENT_ID) return;

  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title || document.title,
  });

  if (import.meta.env.DEV) {
    console.log('[GA] Page view tracked:', path, title);
  }
};

/**
 * 커스텀 이벤트 추적 (GA4 형식)
 * @param category - 이벤트 카테고리 (예: 'User', 'Post', 'Comment')
 * @param action - 이벤트 액션 (예: 'Login', 'Create', 'Like')
 * @param label - 이벤트 레이블 (선택사항)
 * @param value - 이벤트 값 (선택사항)
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (!MEASUREMENT_ID) return;

  // GA4 형식: 이벤트 이름을 category_action으로 만들고, 파라미터로 전달
  const eventName = `${category.toLowerCase()}_${action.toLowerCase()}`;
  const eventParams: Record<string, any> = {
    event_category: category,
    event_label: label || '',
    debug_mode: true, // DebugView에서 확인 가능하도록
  };

  if (value !== undefined) {
    eventParams.value = value;
  }

  console.log('[GA] Sending event:', eventName, eventParams);

  // GA4 gtag 직접 호출
  try {
    ReactGA.gtag('event', eventName, eventParams);
    console.log('[GA] ✓ Event sent:', eventName);
  } catch (error) {
    console.error('[GA] ✗ Error sending event:', error);
  }
};

/**
 * 예외 추적 (에러 로깅)
 * @param description - 에러 설명
 * @param fatal - 치명적 에러 여부
 */
export const trackException = (description: string, fatal = false) => {
  if (!MEASUREMENT_ID) return;

  ReactGA.gtag('event', 'exception', {
    description,
    fatal,
  });

  if (import.meta.env.DEV) {
    console.log('[GA] Exception tracked:', description, 'Fatal:', fatal);
  }
};
