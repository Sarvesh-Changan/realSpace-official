"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to track user inactivity.
 * Returns `true` after `delayMs` milliseconds of continuous inactivity.
 * Resets to `false` immediately on user activity (mouse movement, scroll, click, keypress, touch).
 * Disables automatically when `prefers-reduced-motion: reduce` is enabled or when the document is hidden.
 */
export function useIdleAttention(delayMs: number = 5000): boolean {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    // Check if prefers-reduced-motion is requested
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsIdle(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const resetTimer = () => {
      setIsIdle(false);
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      // Do not set idle state if reduced motion is preferred or document is hidden
      if (mediaQuery.matches || document.hidden) {
        return;
      }

      timer = setTimeout(() => {
        setIsIdle(true);
      }, delayMs);
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsIdle(false);
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      } else {
        resetTimer();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsIdle(false);
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      } else {
        resetTimer();
      }
    };

    // User activity events to monitor
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "pointermove",
      "wheel",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMotionChange);
    }

    // Start timer on mount
    resetTimer();

    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotionChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, [delayMs]);

  return isIdle;
}
