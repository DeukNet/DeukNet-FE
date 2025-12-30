import confetti from 'canvas-confetti';
import Matter from 'matter-js';

/**
 * "중력" 이스터 에그 - 모든 요소가 충돌하며 떨어지는 효과
 */
export const triggerGravityEffect = () => {
  // 물리 엔진 설정
  const Engine = Matter.Engine;
  const World = Matter.World;
  const Bodies = Matter.Bodies;
  const Body = Matter.Body;

  const engine = Engine.create();
  engine.gravity.y = 2; // 중력 가속도 증가 (더 빠르게 떨어짐)

  // 고정된 Y 좌표 1200을 바닥으로 사용
  const groundY = 1200;

  // 바닥 생성 (더 두껍고 넓게)
  const ground = Bodies.rectangle(
    window.innerWidth / 2,
    groundY + 250, // 바닥 중심을 아래로 (1200이 바닥 상단이 되도록)
    window.innerWidth * 4, // 더 넓게
    500, // 더 두껍게 (뚫고 지나가지 못하도록)
    {
      isStatic: true,
      restitution: 0.3,
      friction: 0.8
    }
  );
  World.add(engine.world, ground);

  // 좌우 벽 생성
  const leftWall = Bodies.rectangle(
    -50, // 왼쪽 벽
    window.innerHeight / 2,
    100,
    window.innerHeight * 3,
    {
      isStatic: true,
      restitution: 0.3,
      friction: 0.5
    }
  );
  const rightWall = Bodies.rectangle(
    window.innerWidth + 50, // 오른쪽 벽
    window.innerHeight / 2,
    100,
    window.innerHeight * 3,
    {
      isStatic: true,
      restitution: 0.3,
      friction: 0.5
    }
  );
  World.add(engine.world, leftWall);
  World.add(engine.world, rightWall);

  // body의 overflow를 임시로 visible로 변경
  const originalBodyOverflow = document.body.style.overflow;
  const originalHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'visible';
  document.documentElement.style.overflow = 'visible';

  // 주요 요소들만 선택
  const selectors = [
    '.post-card',
    '.posts-box',
    '.post-content',
    '.search-result-banner',
    '.category-thumbnail',
    'button:not(.suggestion-item):not(.recent-search-button)',
    '.navbar',
    '.footer',
    'img',
    '.comment',
    'article',
    'section > div',
    'h1', 'h2', 'h3',
    'p',
  ];

  const elements: HTMLElement[] = [];
  selectors.forEach(selector => {
    const found = document.querySelectorAll(selector);
    found.forEach(el => {
      const element = el as HTMLElement;
      if (!elements.includes(element)) {
        elements.push(element);
      }
    });
  });

  // 요소-바디 매핑
  const elementBodyMap = new Map<HTMLElement, Matter.Body>();

  // 각 요소를 물리 바디로 변환
  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();

    // 너무 작은 요소는 제외
    if (rect.width < 10 || rect.height < 10) return;

    // 물리 바디 생성
    const body = Bodies.rectangle(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      rect.width,
      rect.height,
      {
        restitution: 0.5, // 튀어오름 정도 증가
        friction: 0.3, // 마찰 감소 (더 미끄러짐)
        density: 0.002, // 밀도 증가 (더 무거움)
      }
    );

    World.add(engine.world, body);
    elementBodyMap.set(element, body);

    // 초기 속도 추가 (가속도 효과)
    const randomVelocityX = (Math.random() - 0.5) * 2; // 좌우 랜덤 속도
    const randomVelocityY = Math.random() * 3; // 아래로 초기 속도
    Body.setVelocity(body, { x: randomVelocityX, y: randomVelocityY });

    // 원래 스타일 저장
    element.dataset.originalPosition = element.style.position;
    element.dataset.originalTransform = element.style.transform;
    element.dataset.originalTransition = element.style.transition;
    element.dataset.originalTop = element.style.top;
    element.dataset.originalLeft = element.style.left;

    // position을 absolute로 변경하여 현재 문서 흐름에서 위치 유지
    element.style.position = 'absolute';
    element.style.top = `${rect.top + window.scrollY}px`;
    element.style.left = `${rect.left + window.scrollX}px`;
    element.style.margin = '0';
    element.style.transition = 'none';
  });

  // 물리 시뮬레이션 실행
  let frameCount = 0;
  const maxFrames = 120; // 약 2초 (60fps 기준)

  const animate = () => {
    if (frameCount >= maxFrames) {
      // 애니메이션 종료
      Engine.clear(engine);

      // 원래 상태로 복구
      elements.forEach((element) => {
        element.style.transition = 'all 0.5s ease-in-out';
        element.style.transform = element.dataset.originalTransform || '';
        element.style.position = element.dataset.originalPosition || '';

        setTimeout(() => {
          element.style.top = element.dataset.originalTop || '';
          element.style.left = element.dataset.originalLeft || '';
          element.style.transition = element.dataset.originalTransition || '';

          // dataset 정리
          delete element.dataset.originalPosition;
          delete element.dataset.originalTransform;
          delete element.dataset.originalTransition;
          delete element.dataset.originalTop;
          delete element.dataset.originalLeft;
        }, 500);
      });

      // overflow 복구
      setTimeout(() => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      }, 1000);

      return;
    }

    Engine.update(engine, 1000 / 60);

    // 각 요소의 위치 업데이트 (absolute positioning이므로 top/left 직접 업데이트)
    elementBodyMap.forEach((body, element) => {
      const newTop = body.position.y - element.offsetHeight / 2 + window.scrollY;
      const newLeft = body.position.x - element.offsetWidth / 2 + window.scrollX;
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
      element.style.transform = `rotate(${body.angle}rad)`;
    });

    frameCount++;
    requestAnimationFrame(animate);
  };

  animate();

  console.log(`🌍 중력 효과 발동! ${elements.length}개의 요소가 충돌하며 떨어집니다!`);
};

/**
 * "폭발" 이스터 에그 - 모든 요소가 폭발 후 떨어짐
 */
export const triggerExplosionEffect = () => {
  // 물리 엔진 설정
  const Engine = Matter.Engine;
  const World = Matter.World;
  const Bodies = Matter.Bodies;
  const Body = Matter.Body;

  const engine = Engine.create();
  engine.gravity.y = 1.5;

  // 바닥 생성
  const groundY = 1400;
  const ground = Bodies.rectangle(
    window.innerWidth / 2,
    groundY,
    window.innerWidth * 2,
    100,
    { isStatic: true }
  );
  World.add(engine.world, ground);

  // 좌우 벽 생성
  const leftWall = Bodies.rectangle(
    -50,
    window.innerHeight / 2,
    100,
    window.innerHeight * 3,
    {
      isStatic: true,
      restitution: 0.3,
      friction: 0.5
    }
  );
  const rightWall = Bodies.rectangle(
    window.innerWidth + 50,
    window.innerHeight / 2,
    100,
    window.innerHeight * 3,
    {
      isStatic: true,
      restitution: 0.3,
      friction: 0.5
    }
  );
  World.add(engine.world, leftWall);
  World.add(engine.world, rightWall);

  // overflow 설정
  const originalBodyOverflow = document.body.style.overflow;
  const originalHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'visible';
  document.documentElement.style.overflow = 'visible';

  // 주요 요소들만 선택
  const selectors = [
    '.post-card',
    '.posts-box',
    '.post-content',
    '.search-result-banner',
    '.category-thumbnail',
    'button:not(.suggestion-item):not(.recent-search-button)',
    '.navbar',
    '.footer',
    'img',
    '.comment',
    'article',
    'section > div',
    'h1', 'h2', 'h3',
    'p',
  ];

  const elements: HTMLElement[] = [];
  selectors.forEach(selector => {
    const found = document.querySelectorAll(selector);
    found.forEach(el => {
      const element = el as HTMLElement;
      if (!elements.includes(element)) {
        elements.push(element);
      }
    });
  });

  const elementBodyMap = new Map<HTMLElement, Matter.Body>();
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // 각 요소를 물리 바디로 변환하고 폭발력 적용
  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;

    // 중심으로부터의 방향 계산
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;
    const deltaX = elementCenterX - centerX;
    const deltaY = elementCenterY - centerY;
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 물리 바디 생성
    const body = Bodies.rectangle(
      elementCenterX,
      elementCenterY,
      rect.width,
      rect.height,
      {
        restitution: 0.6,
        friction: 0.2,
        density: 0.003,
      }
    );

    World.add(engine.world, body);
    elementBodyMap.set(element, body);

    // 폭발력 계산 (중심에서 멀수록 강하게)
    const explosionPower = 20 + (distance / 100) * 10;
    const velocityX = Math.cos(angle) * explosionPower;
    const velocityY = Math.sin(angle) * explosionPower;

    // 강력한 폭발 속도 적용
    Body.setVelocity(body, { x: velocityX, y: velocityY });

    // 회전력 추가
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);

    // 스타일 저장
    element.dataset.originalPosition = element.style.position;
    element.dataset.originalTransform = element.style.transform;
    element.dataset.originalTransition = element.style.transition;
    element.dataset.originalTop = element.style.top;
    element.dataset.originalLeft = element.style.left;

    // position을 absolute로 변경하여 현재 문서 흐름에서 위치 유지
    element.style.position = 'absolute';
    element.style.top = `${rect.top + window.scrollY}px`;
    element.style.left = `${rect.left + window.scrollX}px`;
    element.style.margin = '0';
    element.style.transition = 'none';
  });

  // 격렬한 폭발 파티클 효과
  const explosionDuration = 1000;
  const particleInterval = setInterval(() => {
    confetti({
      particleCount: 100,
      spread: 360,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ff0066', '#ff0033'],
      startVelocity: 80,
      gravity: 1.5,
      scalar: 1.5,
      shapes: ['circle', 'square'],
      ticks: 200,
    });
  }, 100);

  setTimeout(() => {
    clearInterval(particleInterval);
  }, explosionDuration);

  // 물리 시뮬레이션 실행
  let frameCount = 0;
  const maxFrames = 240; // 4초

  const animate = () => {
    if (frameCount >= maxFrames) {
      Engine.clear(engine);

      // 원래 상태로 복구
      elements.forEach((element) => {
        element.style.transition = 'all 0.5s ease-in-out';
        element.style.transform = element.dataset.originalTransform || '';
        element.style.position = element.dataset.originalPosition || '';

        setTimeout(() => {
          element.style.top = element.dataset.originalTop || '';
          element.style.left = element.dataset.originalLeft || '';
          element.style.transition = element.dataset.originalTransition || '';

          delete element.dataset.originalPosition;
          delete element.dataset.originalTransform;
          delete element.dataset.originalTransition;
          delete element.dataset.originalTop;
          delete element.dataset.originalLeft;
        }, 500);
      });

      setTimeout(() => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      }, 1000);

      return;
    }

    Engine.update(engine, 1000 / 60);

    elementBodyMap.forEach((body, element) => {
      const newTop = body.position.y - element.offsetHeight / 2 + window.scrollY;
      const newLeft = body.position.x - element.offsetWidth / 2 + window.scrollX;
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
      element.style.transform = `rotate(${body.angle}rad)`;
    });

    frameCount++;
    requestAnimationFrame(animate);
  };

  animate();

  console.log(`💥 대폭발! ${elements.length}개의 요소가 폭발 후 떨어집니다!`);
};

/**
 * "회전" 이스터 에그 - 모든 요소가 빙글빙글 회전
 */
export const triggerRotateEffect = () => {
  const elements = document.querySelectorAll('body *:not(script):not(style):not(head):not(meta):not(link)');

  elements.forEach((el) => {
    const element = el as HTMLElement;
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;

    const rotations = 3 + Math.floor(Math.random() * 3); // 3~5바퀴
    const duration = 3000 + Math.random() * 2000; // 3~5초
    const direction = Math.random() > 0.5 ? 1 : -1; // 랜덤 방향

    element.style.transition = `transform ${duration}ms ease-in-out`;

    setTimeout(() => {
      element.style.transform = `${originalTransform} rotate(${direction * rotations * 360}deg)`;
    }, Math.random() * 100);

    setTimeout(() => {
      element.style.transition = 'transform 1s ease-in-out';
      element.style.transform = originalTransform;
    }, duration + 100);

    setTimeout(() => {
      element.style.transition = originalTransition;
    }, duration + 1100);
  });

  console.log(`🌀 회전! ${elements.length}개의 요소가 돌아갑니다!`);
};

/**
 * "흔들" 이스터 에그 - 지진처럼 모든 요소가 흔들림
 */
export const triggerShakeEffect = () => {
  const elements = document.querySelectorAll('body *:not(script):not(style):not(head):not(meta):not(link)');

  elements.forEach((el) => {
    const element = el as HTMLElement;
    const originalTransform = element.style.transform;

    let shakeCount = 0;
    const maxShakes = 20;
    const shakeInterval = setInterval(() => {
      if (shakeCount >= maxShakes) {
        clearInterval(shakeInterval);
        element.style.transform = originalTransform;
        return;
      }

      const randomX = (Math.random() - 0.5) * 20;
      const randomY = (Math.random() - 0.5) * 20;
      const randomRotate = (Math.random() - 0.5) * 10;

      element.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
      shakeCount++;
    }, 100);
  });

  // 지진 파티클
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 180,
        origin: { x: Math.random(), y: 1 },
        colors: ['#8b4513', '#a0522d', '#d2691e'],
        gravity: 2,
      });
    }, i * 400);
  }

  console.log(`🌋 지진! ${elements.length}개의 요소가 흔들립니다!`);
};

/**
 * "무지개" 이스터 에그 - 모든 요소가 무지개 색으로 변함
 */
export const triggerRainbowEffect = () => {
  const elements = document.querySelectorAll('body *:not(script):not(style):not(head):not(meta):not(link)');
  const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];

  elements.forEach((el) => {
    const element = el as HTMLElement;
    const originalColor = element.style.color;
    const originalBackground = element.style.backgroundColor;
    const originalBorder = element.style.borderColor;
    const originalTransition = element.style.transition;

    element.style.transition = 'all 0.5s ease-in-out';

    let colorIndex = 0;
    const colorInterval = setInterval(() => {
      if (colorIndex >= rainbowColors.length * 2) {
        clearInterval(colorInterval);
        element.style.color = originalColor;
        element.style.backgroundColor = originalBackground;
        element.style.borderColor = originalBorder;
        element.style.transition = originalTransition;
        return;
      }

      const color = rainbowColors[colorIndex % rainbowColors.length];
      element.style.color = color;
      element.style.backgroundColor = `${color}22`; // 투명도 추가
      element.style.borderColor = color;
      colorIndex++;
    }, 300);
  });

  // 무지개 파티클
  setTimeout(() => {
    rainbowColors.forEach((color, index) => {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: index / rainbowColors.length, y: 0 },
          colors: [color],
        });
      }, index * 100);
    });
  }, 500);

  console.log(`🌈 무지개! ${elements.length}개의 요소가 색상 변경됩니다!`);
};

/**
 * "뒤집기" 이스터 에그 - 모든 것이 뒤집힘
 */
export const triggerFlipEffect = () => {
  const elements = document.querySelectorAll('body *:not(script):not(style):not(head):not(meta):not(link)');

  elements.forEach((el) => {
    const element = el as HTMLElement;
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;

    const flipType = Math.random() > 0.5 ? 'rotateY' : 'rotateX'; // X축 또는 Y축
    const delay = Math.random() * 500;

    element.style.transition = 'transform 1.5s ease-in-out';

    setTimeout(() => {
      element.style.transform = `${originalTransform} ${flipType}(180deg)`;
    }, delay);

    setTimeout(() => {
      element.style.transform = `${originalTransform} ${flipType}(360deg)`;
    }, delay + 1500);

    setTimeout(() => {
      element.style.transform = originalTransform;
      element.style.transition = originalTransition;
    }, delay + 3000);
  });

  console.log(`🔄 뒤집기! ${elements.length}개의 요소가 뒤집힙니다!`);
};

/**
 * "블랙홀" 이스터 에그 - 중심으로 소용돌이치며 빨려들어감
 */
export const triggerBlackHoleEffect = () => {
  const Engine = Matter.Engine;
  const World = Matter.World;
  const Bodies = Matter.Bodies;
  const Body = Matter.Body;

  const engine = Engine.create();
  engine.gravity.y = 0; // 중력 없음

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // 좌우 벽 생성
  const leftWall = Bodies.rectangle(
    -50,
    window.innerHeight / 2,
    100,
    window.innerHeight * 3,
    {
      isStatic: true,
      restitution: 0.3,
      friction: 0.5
    }
  );
  const rightWall = Bodies.rectangle(
    window.innerWidth + 50,
    window.innerHeight / 2,
    100,
    window.innerHeight * 3,
    {
      isStatic: true,
      restitution: 0.3,
      friction: 0.5
    }
  );
  World.add(engine.world, leftWall);
  World.add(engine.world, rightWall);

  // overflow 설정
  const originalBodyOverflow = document.body.style.overflow;
  const originalHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'visible';
  document.documentElement.style.overflow = 'visible';

  // 가운데 검은 원 먼저 생성 (물리 효과 제외하기 위해)
  const blackHole = document.createElement('div');
  blackHole.className = 'blackhole-effect-element'; // 식별용 클래스
  blackHole.style.position = 'fixed';
  blackHole.style.top = '50%';
  blackHole.style.left = '50%';
  blackHole.style.transform = 'translate(-50%, -50%)';
  blackHole.style.width = '150px';
  blackHole.style.height = '150px';
  blackHole.style.borderRadius = '50%';
  blackHole.style.background = 'radial-gradient(circle, #000000 0%, #1a1a1a 40%, #4a0080 70%, transparent 100%)';
  blackHole.style.boxShadow = '0 0 50px 30px rgba(74, 0, 128, 0.8), inset 0 0 30px 10px rgba(0, 0, 0, 0.9)';
  blackHole.style.zIndex = '9997';
  blackHole.style.pointerEvents = 'none';
  document.body.appendChild(blackHole);

  // 주요 요소들만 선택
  const selectors = [
    '.post-card',
    '.posts-box',
    '.post-content',
    '.search-result-banner',
    '.category-thumbnail',
    'button:not(.suggestion-item):not(.recent-search-button)',
    '.navbar',
    '.footer',
    'img',
    '.comment',
    'article',
    'section > div',
    'h1', 'h2', 'h3',
    'p',
  ];

  const elements: HTMLElement[] = [];
  selectors.forEach(selector => {
    const found = document.querySelectorAll(selector);
    found.forEach(el => {
      const element = el as HTMLElement;
      if (!elements.includes(element)) {
        elements.push(element);
      }
    });
  });

  const elementBodyMap = new Map<HTMLElement, Matter.Body>();

  elements.forEach((element) => {
    // 블랙홀 요소는 제외
    if (element.classList.contains('blackhole-effect-element')) {
      return;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;

    const body = Bodies.rectangle(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      rect.width,
      rect.height,
      { restitution: 0, friction: 0, density: 0.001 }
    );

    World.add(engine.world, body);
    elementBodyMap.set(element, body);

    element.dataset.originalPosition = element.style.position;
    element.dataset.originalTransform = element.style.transform;
    element.dataset.originalTransition = element.style.transition;
    element.dataset.originalTop = element.style.top;
    element.dataset.originalLeft = element.style.left;

    // position을 absolute로 변경하여 현재 문서 흐름에서 위치 유지
    element.style.position = 'absolute';
    element.style.top = `${rect.top + window.scrollY}px`;
    element.style.left = `${rect.left + window.scrollX}px`;
    element.style.margin = '0';
    element.style.transition = 'none';
  });

  // 블랙홀 펄스 애니메이션
  let pulseScale = 1;
  let pulseDirection = 1;
  const pulseInterval = setInterval(() => {
    pulseScale += 0.05 * pulseDirection;
    if (pulseScale >= 1.3 || pulseScale <= 1) {
      pulseDirection *= -1;
    }
    blackHole.style.transform = `translate(-50%, -50%) scale(${pulseScale})`;
  }, 50);

  // 블랙홀 파티클
  const particleInterval = setInterval(() => {
    confetti({
      particleCount: 50,
      spread: 360,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#000000', '#1a1a1a', '#333333', '#4a0080', '#8000ff'],
      startVelocity: 0,
      gravity: -0.5,
      scalar: 0.5,
    });
  }, 100);

  let frameCount = 0;
  const maxFrames = 180;

  const animate = () => {
    if (frameCount >= maxFrames) {
      clearInterval(particleInterval);
      clearInterval(pulseInterval);
      document.body.removeChild(blackHole);
      Engine.clear(engine);

      elements.forEach((element) => {
        element.style.transition = 'all 0.5s ease-in-out';
        element.style.transform = element.dataset.originalTransform || '';
        element.style.position = element.dataset.originalPosition || '';
        element.style.opacity = '1';

        setTimeout(() => {
          element.style.top = element.dataset.originalTop || '';
          element.style.left = element.dataset.originalLeft || '';
          element.style.transition = element.dataset.originalTransition || '';

          delete element.dataset.originalPosition;
          delete element.dataset.originalTransform;
          delete element.dataset.originalTransition;
          delete element.dataset.originalTop;
          delete element.dataset.originalLeft;
        }, 500);
      });

      setTimeout(() => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      }, 1000);

      return;
    }

    Engine.update(engine, 1000 / 60);

    // 블랙홀 중심으로 끌어당기기
    elementBodyMap.forEach((body) => {
      const deltaX = centerX - body.position.x;
      const deltaY = centerY - body.position.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 10) {
        const strength = 0.3 * (1 + frameCount / 60); // 점점 강해짐
        const forceX = (deltaX / distance) * strength;
        const forceY = (deltaY / distance) * strength;

        Body.applyForce(body, body.position, { x: forceX, y: forceY });
        Body.setAngularVelocity(body, 0.1);
      }
    });

    elementBodyMap.forEach((body, element) => {
      const opacity = Math.max(0, 1 - frameCount / maxFrames);
      const newTop = body.position.y - element.offsetHeight / 2 + window.scrollY;
      const newLeft = body.position.x - element.offsetWidth / 2 + window.scrollX;
      element.style.opacity = opacity.toString();
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
      element.style.transform = `rotate(${body.angle}rad) scale(${opacity})`;
    });

    frameCount++;
    requestAnimationFrame(animate);
  };

  animate();
  console.log(`🌀 블랙홀! ${elements.length}개의 요소가 빨려들어갑니다!`);
};

// 눈 효과 인터벌 저장 (다른 효과 실행 시 중지용)
let snowInterval: number | null = null;

/**
 * "눈" 이스터 에그 - 눈 파티클만 계속 내림 (영구 지속)
 */
export const triggerSnowEffect = () => {
  // 기존 눈 효과가 있으면 중지
  if (snowInterval) {
    clearInterval(snowInterval);
  }

  // 눈 파티클 영구 지속 (페이지 이동 전까지)
  snowInterval = setInterval(() => {
    // 화면 전체에 랜덤 위치에서 눈송이 1개씩 생성 (뭉치지 않게)
    const randomX = Math.random();

    confetti({
      particleCount: 1,
      spread: 30,
      origin: { x: randomX, y: -0.2 },
      colors: ['#ffffff', '#f0f8ff', '#e6f3ff'],
      gravity: 0.4,
      scalar: 0.5,
      drift: Math.random() * 0.6 - 0.3,
      ticks: 800,
      startVelocity: 1,
      shapes: ['circle'],
    });
  }, 150);

  console.log(`❄️ 눈! 눈송이가 계속 내립니다! (페이지 이동 전까지 지속)`);
};

/**
 * "파도" 이스터 에그 - 요소들이 파도처럼 물결침
 */
export const triggerWaveEffect = () => {
  const elements = document.querySelectorAll('body *:not(script):not(style):not(head):not(meta):not(link)');

  elements.forEach((el, index) => {
    const element = el as HTMLElement;
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;

    const delay = index * 10; // 순차적 파도

    element.style.transition = 'none';

    let waveCount = 0;
    const maxWaves = 60;

    const waveInterval = setInterval(() => {
      if (waveCount >= maxWaves) {
        clearInterval(waveInterval);
        element.style.transition = 'transform 0.5s ease-in-out';
        element.style.transform = originalTransform;

        setTimeout(() => {
          element.style.transition = originalTransition;
        }, 500);
        return;
      }

      const time = waveCount * 0.1;
      const amplitude = 30;
      const frequency = 0.5;

      const offsetY = Math.sin(time * frequency) * amplitude;
      const offsetX = Math.cos(time * frequency * 0.5) * (amplitude / 2);

      element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      waveCount++;
    }, 50);

    setTimeout(() => {
      // 시작 지연
    }, delay);
  });

  console.log(`🌊 파도! ${elements.length}개의 요소가 물결칩니다!`);
};

/**
 * "매트릭스" 이스터 에그 - 초록색 코드 빗줄기 효과
 */
export const triggerMatrixEffect = () => {
  // 매트릭스 오버레이 생성
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.zIndex = '9998';
  overlay.style.pointerEvents = 'none';
  overlay.style.background = 'rgba(0, 0, 0, 0.8)';
  document.body.appendChild(overlay);

  // 캔버스 생성
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'none';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops: number[] = [];

  for (let i = 0; i < columns; i++) {
    drops[i] = Math.floor(Math.random() * -100);
  }

  let frameCount = 0;
  const maxFrames = 180;

  const draw = () => {
    if (frameCount >= maxFrames) {
      document.body.removeChild(canvas);
      document.body.removeChild(overlay);
      return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f0';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }

    frameCount++;
    requestAnimationFrame(draw);
  };

  draw();

  // 요소들 깜빡이기
  const elements = document.querySelectorAll('body *:not(script):not(style):not(head):not(meta):not(link):not(canvas)');
  elements.forEach((el) => {
    const element = el as HTMLElement;
    const originalFilter = element.style.filter;

    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      if (blinkCount >= 18) {
        clearInterval(blinkInterval);
        element.style.filter = originalFilter;
        return;
      }

      element.style.filter = blinkCount % 2 === 0 ? 'hue-rotate(120deg) brightness(1.5)' : originalFilter;
      blinkCount++;
    }, 100);
  });

  console.log('🟢 매트릭스 효과 발동!');
};

/**
 * "반전" 이스터 에그 - 색상 반전 + 화면 뒤집기
 */
export const triggerInvertEffect = () => {
  const body = document.body;
  const originalFilter = body.style.filter;
  const originalTransform = body.style.transform;
  const originalTransition = body.style.transition;

  body.style.transition = 'all 1s ease-in-out';

  // 색상 반전 + 180도 회전 (확대/축소 없음)
  setTimeout(() => {
    body.style.filter = 'invert(1) hue-rotate(180deg)';
    body.style.transform = 'rotate(180deg)';
  }, 100);

  // 원래대로
  setTimeout(() => {
    body.style.filter = originalFilter;
    body.style.transform = originalTransform;
  }, 3500);

  setTimeout(() => {
    body.style.transition = originalTransition;
  }, 4500);

  console.log('🔄 반전! 세상이 뒤집힙니다!');
};

/**
 * "축하" 이스터 에그 - 파티클 효과
 */
export const triggerEasterEggEffect = () => {
  const duration = 6000; // 6초
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);

    // 왼쪽에서 파티클
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
    });

    // 오른쪽에서 파티클
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
    });

    // 중앙에서 파티클
    confetti({
      ...defaults,
      particleCount: particleCount * 2,
      origin: { x: randomInRange(0.4, 0.6), y: randomInRange(0.3, 0.7) },
      colors: ['#fa709a', '#fee140', '#30cfd0', '#330867'],
      shapes: ['circle', 'square'],
      scalar: randomInRange(0.8, 1.2),
    });
  }, 250);

  // 초기 폭발 효과
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
    shapes: ['circle', 'square'],
    scalar: 1.2,
    gravity: 1.2,
    drift: 0.5,
  });

  // 하트 모양 파티클 (이모지로 커스텀)
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#ff0000', '#ff69b4', '#ff1493'],
      shapes: ['circle'],
      scalar: 2,
      gravity: 0.8,
    });
  }, 500);

  // 별 효과
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 120,
      origin: { y: 0.4, x: 0.5 },
      colors: ['#ffd700', '#ffff00', '#ffa500'],
      shapes: ['star'],
      scalar: 1.5,
      gravity: 0.6,
    });
  }, 1000);
};

/**
 * "손희찬" 이스터 에그 - 배경 변경 + UI 반투명/어두움
 */
export const triggerHChanEffect = () => {
  // 원래 body 배경 저장
  const originalBodyBg = document.body.style.backgroundImage;
  const originalBodyBgColor = document.body.style.backgroundColor;
  const originalBodyBgSize = document.body.style.backgroundSize;
  const originalBodyBgPosition = document.body.style.backgroundPosition;
  const originalBodyBgRepeat = document.body.style.backgroundRepeat;
  const originalBodyBgAttachment = document.body.style.backgroundAttachment;

  // body 배경을 어둡게 변경 (빠른 전환)
  document.body.style.transition = 'background 0.2s ease-in-out';
  document.body.style.backgroundColor = '#1a1a2e';
  document.body.style.backgroundImage = 'url(/hchan.png)';
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundAttachment = 'fixed';

  // 어두운 오버레이 추가 (가운데는 밝게, 주변은 어둡게 - 비네팅 효과)
  const darkOverlay = document.createElement('div');
  darkOverlay.className = 'hchan-dark-overlay';
  darkOverlay.style.position = 'fixed';
  darkOverlay.style.top = '0';
  darkOverlay.style.left = '0';
  darkOverlay.style.width = '100vw';
  darkOverlay.style.height = '100vh';
  darkOverlay.style.background = 'radial-gradient(circle at center, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.7) 100%)';
  darkOverlay.style.zIndex = '0';
  darkOverlay.style.pointerEvents = 'none';
  darkOverlay.style.transition = 'opacity 0.2s ease-in-out';
  darkOverlay.style.opacity = '0';
  document.body.appendChild(darkOverlay);

  setTimeout(() => {
    darkOverlay.style.opacity = '1';
  }, 50);

  // 모든 UI 요소를 반투명하고 어둡게
  const allElements = document.querySelectorAll('body *:not(.hchan-effect-overlay)');
  const originalStyles = new Map<HTMLElement, { opacity: string; filter: string }>();

  allElements.forEach(el => {
    const element = el as HTMLElement;
    originalStyles.set(element, {
      opacity: element.style.opacity,
      filter: element.style.filter
    });

    element.style.transition = 'opacity 0.2s ease-in-out, filter 0.2s ease-in-out';
    element.style.opacity = '0.7';
    element.style.filter = 'brightness(0.8)';
  });

  // 0.5초 후 원래대로 복구
  setTimeout(() => {

    // UI 원래대로
    allElements.forEach(el => {
      const element = el as HTMLElement;
      const original = originalStyles.get(element);
      if (original) {
        element.style.opacity = original.opacity;
        element.style.filter = original.filter;
      }
    });

    // 어두운 오버레이 페이드아웃
    darkOverlay.style.opacity = '0';

    // body 배경 원래대로
    document.body.style.backgroundColor = originalBodyBgColor;
    document.body.style.backgroundImage = originalBodyBg;
    document.body.style.backgroundSize = originalBodyBgSize;
    document.body.style.backgroundPosition = originalBodyBgPosition;
    document.body.style.backgroundRepeat = originalBodyBgRepeat;
    document.body.style.backgroundAttachment = originalBodyBgAttachment;

    setTimeout(() => {
      darkOverlay.remove();
    }, 300);
  }, 500);

  console.log('🎨 손희찬 효과 발동!');
};

/**
 * 검색어에 따라 적절한 이스터 애그 효과를 반환
 */
export const getEasterEggByKeyword = (keyword: string): (() => void) | null => {
  const lowerKeyword = keyword.toLowerCase().trim();

  const keywordMap: Record<string, () => void> = {
    '축하': triggerEasterEggEffect,
    '중력': triggerGravityEffect,
    '폭발': triggerExplosionEffect,
    '회전': triggerRotateEffect,
    '흔들': triggerShakeEffect,
    '무지개': triggerRainbowEffect,
    '뒤집기': triggerFlipEffect,
    '블랙홀': triggerBlackHoleEffect,
    '눈': triggerSnowEffect,
    '파도': triggerWaveEffect,
    '매트릭스': triggerMatrixEffect,
    '반전': triggerInvertEffect,
    '손희찬': triggerHChanEffect,
  };

  return keywordMap[lowerKeyword] || null;
};
