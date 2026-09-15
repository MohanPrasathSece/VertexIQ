import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode?: any) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          action?: string;
          cData?: string;
          [key: string]: any;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}

export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string | undefined;
}

export interface TurnstileProps {
  siteKey?: string;
  onSuccess: (token: string) => void;
  onError?: (error?: any) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  action?: string;
  className?: string;
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  (
    {
      siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAEz2IqiQUH0ZVVPJ',
      onSuccess,
      onError,
      onExpire,
      theme = 'auto',
      size = 'normal',
      action,
      className = '',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            console.warn('[Turnstile] Error resetting widget:', e);
          }
        }
      },
      getResponse: () => {
        if (window.turnstile && widgetIdRef.current) {
          try {
            return window.turnstile.getResponse(widgetIdRef.current);
          } catch (e) {
            return undefined;
          }
        }
        return undefined;
      },
    }));

    useEffect(() => {
      let isMounted = true;
      let intervalId: NodeJS.Timeout | null = null;

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

        try {
          // Clear any leftover inner elements before rendering
          containerRef.current.innerHTML = '';

          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            size,
            action,
            callback: (token: string) => {
              if (isMounted) onSuccess(token);
            },
            'error-callback': (err: any) => {
              console.warn('[Turnstile] Challenge error:', err);
              if (isMounted && onError) onError(err);
            },
            'expired-callback': () => {
              if (isMounted && onExpire) onExpire();
            },
          });

          widgetIdRef.current = id;
        } catch (err) {
          console.error('[Turnstile] Failed to render widget:', err);
        }
      };

      if (window.turnstile) {
        renderWidget();
      } else {
        // Poll briefly until turnstile script loads
        intervalId = setInterval(() => {
          if (window.turnstile) {
            if (intervalId) clearInterval(intervalId);
            if (isMounted) renderWidget();
          }
        }, 100);
      }

      return () => {
        isMounted = false;
        if (intervalId) clearInterval(intervalId);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // ignore cleanup errors on unmount
          }
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, theme, size, action, onSuccess, onError, onExpire]);

    return (
      <div className={`min-h-[65px] flex items-center justify-start ${className}`}>
        <div ref={containerRef} className="cf-turnstile-container" />
      </div>
    );
  }
);

Turnstile.displayName = 'Turnstile';
