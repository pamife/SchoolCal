import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

type TiltSurfaceProps = PropsWithChildren<{
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
}>;

const spring = { damping: 28, stiffness: 150, mass: 1.2 };

export function TiltSurface({
  children,
  className = '',
  rotateAmplitude = 3.2,
  scaleOnHover = 1.008,
}: TiltSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );
  const rotateX = useSpring(useMotionValue(0), spring);
  const rotateY = useSpring(useMotionValue(0), spring);
  const scale = useSpring(useMotionValue(1), spring);

  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFinePointer(pointerQuery.matches);
    pointerQuery.addEventListener('change', update);
    return () => pointerQuery.removeEventListener('change', update);
  }, []);

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (reduceMotion || !finePointer || !surfaceRef.current) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(y * -rotateAmplitude * 2);
    rotateY.set(x * rotateAmplitude * 2);
  };

  return (
    <div className={`tilt-surface ${className}`.trim()}>
      <motion.div
        ref={surfaceRef}
        className="tilt-surface__inner"
        style={{ rotateX, rotateY, scale }}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => !reduceMotion && finePointer && scale.set(scaleOnHover)}
        onPointerLeave={reset}
      >
        {children}
      </motion.div>
    </div>
  );
}
