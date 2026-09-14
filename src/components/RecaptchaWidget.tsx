import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready?: (callback: () => void) => void;
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode?: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark';
          size?: 'normal' | 'compact';
        }
      ) => number | string;
      reset: (widgetId?: number | string) => void;
      getResponse: (widgetId?: number | string) => string;
    };
  }
}

export interface RecaptchaHandle {
  reset: () => void;
}

interface RecaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: string) => void;
  theme?: 'light' | 'dark';
  className?: string;
}

const RECAPTCHA_SITE_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY)) ||
  '6LfgT7stAAAAAEE0s2_tngDonSeaNmch9r56wAdk';

export const RecaptchaWidget = forwardRef<RecaptchaHandle, RecaptchaWidgetProps>(
  ({ onVerify, onExpire, onError, theme = 'light', className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.grecaptcha && widgetIdRef.current !== null) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
          } catch (_) {}
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;
      let checkInterval: NodeJS.Timeout | null = null;

      const renderWidget = () => {
        if (!isMounted || !containerRef.current || !window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
          return false;
        }

        // If already rendered inside this container, avoid duplicate render errors
        if (containerRef.current.childNodes.length > 0 && widgetIdRef.current !== null) {
          return true;
        }

        try {
          // Clear container content just in case
          containerRef.current.innerHTML = '';

          const id = window.grecaptcha.render(containerRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
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
          console.error('reCAPTCHA render error:', err);
          return false;
        }
      };

      const initRecaptcha = () => {
        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
          if (window.grecaptcha.ready) {
            window.grecaptcha.ready(() => {
              if (isMounted) renderWidget();
            });
          } else {
            renderWidget();
          }
        } else {
          let attempts = 0;
          checkInterval = setInterval(() => {
            attempts++;
            if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
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

      initRecaptcha();

      return () => {
        isMounted = false;
        if (checkInterval) clearInterval(checkInterval);
        if (widgetIdRef.current !== null && window.grecaptcha) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
          } catch (_) {}
          widgetIdRef.current = null;
        }
      };
    }, [theme]);

    return (
      <div className={`flex flex-col items-center justify-center my-3 ${className}`}>
        <div ref={containerRef} className="min-h-[78px] flex justify-center items-center" />
      </div>
    );
  }
);

RecaptchaWidget.displayName = 'RecaptchaWidget';
