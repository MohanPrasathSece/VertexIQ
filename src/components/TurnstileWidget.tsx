import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
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
  onError?: (error: string) => void;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

const TURNSTILE_SITE_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TURNSTILE_SITE_KEY) ||
  '0x4AAAAAAEz2IqiQUH0ZVVPJ';

export const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(
  ({ onVerify, onExpire, onError, theme = 'light', className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;
      let checkInterval: NodeJS.Timeout | null = null;

      const renderWidget = () => {
        if (!isMounted || !containerRef.current || !window.turnstile) return false;
        
        // Clear previous widget if any
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (_) {}
          widgetIdRef.current = null;
        }

        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => {
              if (isMounted) onVerify(token);
            },
            'expired-callback': () => {
              if (isMounted && onExpire) onExpire();
            },
            'error-callback': (err: string) => {
              if (isMounted && onError) onError(err);
            },
            theme,
            size: 'normal',
          });
          return true;
        } catch (err) {
          console.error('Turnstile render error:', err);
          return false;
        }
      };

      if (window.turnstile) {
        renderWidget();
      } else {
        // Poll for Turnstile script load
        let attempts = 0;
        checkInterval = setInterval(() => {
          attempts++;
          if (window.turnstile) {
            if (renderWidget() && checkInterval) {
              clearInterval(checkInterval);
            }
          }
          if (attempts > 50 && checkInterval) {
            clearInterval(checkInterval);
          }
        }, 150);
      }

      return () => {
        isMounted = false;
        if (checkInterval) clearInterval(checkInterval);
        if (window.turnstile && widgetIdRef.current) {
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
