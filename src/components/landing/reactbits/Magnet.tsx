import { useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

type MagnetProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  wrapperClassName?: string;
  innerClassName?: string;
};

export function Magnet({
  children,
  padding = 70,
  disabled = false,
  magnetStrength = 7,
  wrapperClassName = '',
  innerClassName = '',
  ...props
}: MagnetProps) {
  const magnetRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (disabled || reducedMotion || !finePointer) return undefined;

    const handlePointerMove = (event: PointerEvent) => {
      const magnet = magnetRef.current;
      if (!magnet) return;
      const rect = magnet.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const inRange =
        Math.abs(centerX - event.clientX) < rect.width / 2 + padding
        && Math.abs(centerY - event.clientY) < rect.height / 2 + padding;

      setActive(inRange);
      setPosition(inRange
        ? { x: (event.clientX - centerX) / magnetStrength, y: (event.clientY - centerY) / magnetStrength }
        : { x: 0, y: 0 });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [disabled, magnetStrength, padding]);

  return (
    <div ref={magnetRef} className={wrapperClassName} {...props}>
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: active ? 'transform 180ms ease-out' : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: active ? 'transform' : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

