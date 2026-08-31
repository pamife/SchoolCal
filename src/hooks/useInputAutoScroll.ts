import { useEffect } from 'react';

/**
 * useInputAutoScroll
 * Global listener that scrolls focused form controls into comfortable view when the mobile virtual keyboard opens.
 */
export function useInputAutoScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: number | undefined;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tagName = target.tagName.toLowerCase();
      const isInput =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable;

      if (!isInput) return;

      // Ignore checkboxes, radios, hidden inputs
      if (tagName === 'input') {
        const type = (target as HTMLInputElement).type;
        if (type === 'checkbox' || type === 'radio' || type === 'hidden' || type === 'file') {
          return;
        }
      }

      // Delay scroll to allow keyboard slide-up animation to complete
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        try {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        } catch {
          // Fallback if options not supported
          target.scrollIntoView(false);
        }
      }, 300);
    };

    document.addEventListener('focusin', handleFocusIn, { passive: true });

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);
}

export default useInputAutoScroll;
