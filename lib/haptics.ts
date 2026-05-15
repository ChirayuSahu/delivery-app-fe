import { WebHaptics } from 'web-haptics';

/**
 * Haptic feedback utility for PWAs.
 * Wraps the web-haptics library for consistent behavior.
 */

// Create a singleton instance safely for SSR
const haptics = typeof window !== 'undefined' ? new WebHaptics() : null;

export type HapticPattern = 
  | "light" 
  | "medium" 
  | "heavy" 
  | "success" 
  | "warning" 
  | "error"
  | "selection"
  | "soft"
  | "rigid"
  | "nudge"
  | "buzz";

/**
 * Triggers a haptic feedback if supported by the browser.
 */
export const triggerHaptic = (pattern: HapticPattern = "medium") => {
  if (!haptics) return;
  
  try {
    // web-haptics uses .trigger() which accepts pattern names as strings
    haptics.trigger(pattern);
  } catch (e) {
    // Ignore vibration errors
    console.error("Haptics error:", e);
  }
};
