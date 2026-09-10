import { useRef, useState } from 'react';
import type { HTMLAttributes, PropsWithChildren } from 'react';

type SpotlightCardProps = PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
  }
>;

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(0, 122, 255, 0.18)',
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [opacity, setOpacity] = useState(0);

  const handlePointerMove: React.PointerEventHandler<HTMLElement> = (event) => {
    const card = cardRef.current;
    if (!card || event.pointerType === 'touch') return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
  };

  return (
    <article
      ref={cardRef}
      className={`spotlight-card ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerEnter={(event) => event.pointerType !== 'touch' && setOpacity(1)}
      onPointerLeave={() => setOpacity(0)}
      style={{
        '--spotlight-color': spotlightColor,
        '--spotlight-opacity': opacity,
      } as React.CSSProperties}
      {...props}
    >
      <span className="spotlight-card__light" aria-hidden="true" />
      <div className="spotlight-card__content">{children}</div>
    </article>
  );
}

