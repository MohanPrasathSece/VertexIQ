import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      ready: (callback: () => void) => void;
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode?: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export interface TurnstileHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: string) => void;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

const TURNSTILE_SITE_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TURNSTILE_SITE_KEY) ||
  '0x4AAAAAAEz-kEAfMeEGvrZA';

export const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(
  ({ onVerify, onExpire, onError, theme = 'light', className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current !== null) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (_) {}
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;
      let checkInterval: NodeJS.Timeout | null = null;

      const renderWidget = () => {
        if (!isMounted || !containerRef.current || !window.turnstile || typeof window.turnstile.render !== 'function') {
          return false;
        }

        // If already rendered, skip
        if (containerRef.current.childNodes.length > 0 && widgetIdRef.current !== null) {
          return true;
        }

        try {
          containerRef.current.innerHTML = '';

          const id = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => {
              if (isMounted) onVerify(token);
            },
            'expired-callback': () => {
              if (isMounted && onExpire) onExpire();
            },
            'error-callback': () => {
              if (isMounted && onError) onError();
            },
            theme,
            size: 'normal',
          });

          widgetIdRef.current = id;
          return true;
        } catch (err) {
          console.error('Turnstile render error:', err);
          return false;
        }
      };

      const initTurnstile = () => {
        if (window.turnstile && typeof window.turnstile.render === 'function') {
          window.turnstile.ready(() => {
            if (isMounted) renderWidget();
          });
        } else {
          let attempts = 0;
          checkInterval = setInterval(() => {
            attempts++;
            if (window.turnstile && typeof window.turnstile.render === 'function') {
              if (renderWidget() && checkInterval) {
                clearInterval(checkInterval);
              }
            }
            if (attempts > 60 && checkInterval) {
              clearInterval(checkInterval);
            }
          }, 150);
        }
      };

      initTurnstile();

      return () => {
        isMounted = false;
        if (checkInterval) clearInterval(checkInterval);
        if (widgetIdRef.current !== null && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (_) {}
          widgetIdRef.current = null;
        }
      };
    }, [theme]);

    return (
      <div className={`flex flex-col items-center justify-center my-3 ${className}`}>
        <div ref={containerRef} className="min-h-[65px] flex justify-center items-center" />
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';
