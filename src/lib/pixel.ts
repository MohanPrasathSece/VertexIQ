/**
 * Safely trigger a Meta/Facebook Pixel tracking event.
 * Checks if window.fbq is defined before calling.
 */
export const trackPixelEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined") {
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
      try {
        fbq("track", event, data);
        console.log(`[Meta Pixel] Event tracked: ${event}`, data);
      } catch (err) {
        console.error(`[Meta Pixel] Failed to track event: ${event}`, err);
      }
    } else {
      console.warn(`[Meta Pixel] fbq not defined on window when tracking: ${event}`, data);
    }
  }
};
