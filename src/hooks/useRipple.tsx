import { useState } from 'react';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const useRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      x,
      y,
      id: Date.now(),
    };

    setRipples([...ripples, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prevRipples) => prevRipples.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const rippleElements = ripples.map((ripple) => (
    <span
      key={ripple.id}
      className="ripple-effect"
      style={{
        left: ripple.x,
        top: ripple.y,
      }}
    />
  ));

  return { createRipple, rippleElements };
};
