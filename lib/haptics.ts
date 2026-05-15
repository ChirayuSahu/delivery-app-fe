import { WebHaptics } from 'web-haptics';

/**
 * Haptic feedback utility for PWAs.
 * Wraps the web-haptics library for consistent behavior.
 */

// Device detection
const isIPhone = typeof window !== 'undefined' && /iPhone/.test(navigator.userAgent);

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
 * Triggers a haptic feedback if supported by the browser and on an iPhone.
 */
export const triggerHaptic = (pattern: HapticPattern = "medium") => {
  // Only play haptics on iPhone as requested
  if (!haptics || !isIPhone) return;
  
  try {
    // web-haptics uses .trigger() which accepts pattern names as strings
    haptics.trigger(pattern);
  } catch (e) {
    // Ignore vibration errors
    console.error("Haptics error:", e);
  }
};
