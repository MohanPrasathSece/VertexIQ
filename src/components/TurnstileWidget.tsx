import { RecaptchaWidget, type RecaptchaHandle } from './RecaptchaWidget';

// Backward compatibility alias for TurnstileWidget
export type TurnstileHandle = RecaptchaHandle;
export const TurnstileWidget = RecaptchaWidget;
