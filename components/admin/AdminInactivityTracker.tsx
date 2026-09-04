"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { adminLogoutAction } from "@/app/admin/actions";
import { AlertTriangle, Clock, LogOut } from "lucide-react";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (1,800,000 ms)
const WARNING_TIMEOUT_MS = 29.5 * 60 * 1000; // 29 minutes 30 seconds (1,770,000 ms)
const COUNTDOWN_SECONDS = 30; // 30 seconds warning countdown

export function AdminInactivityTracker() {
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(COUNTDOWN_SECONDS);

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isWarningActiveRef = useRef(false);

  useEffect(() => {
    isWarningActiveRef.current = showWarning;
  }, [showWarning]);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    try {
      await adminLogoutAction();
    } catch {
      window.location.href = "/admin/login";
    }
  }, [clearAllTimers]);

  const startTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setRemainingSeconds(COUNTDOWN_SECONDS);

    // Set timer for warning modal at 4 min 30 sec
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(COUNTDOWN_SECONDS);

      // Interval to update countdown every second
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, WARNING_TIMEOUT_MS);

    // Set timer for automatic logout at 5 min
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearAllTimers, handleLogout]);

  const handleStayLoggedIn = () => {
    startTimers();
  };

  useEffect(() => {
    // Only run when inside authenticated /admin/** routes, excluding /admin/login
    if (!pathname || pathname === "/admin/login") {
      clearAllTimers();
      return;
    }

    const handleUserActivity = () => {
      // Do not automatically clear warning modal on passive mouse movement; user must click "Stay Logged In"
      if (!isWarningActiveRef.current) {
        startTimers();
      }
    };

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
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Initialize timers on mount
    startTimers();

    return () => {
      clearAllTimers();
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [pathname, startTimers, clearAllTimers]);

  if (!pathname || pathname === "/admin/login" || !showWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden p-6 text-neutral-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inactivity-dialog-title"
      >
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-amber-100 rounded-full text-amber-600 shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="inactivity-dialog-title" className="text-lg font-semibold text-neutral-900 leading-6">
              Session Expiring Soon
            </h3>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              You have been inactive for over 29.5 minutes. For security, your admin session will automatically log out in:
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg py-2.5 px-4 font-mono font-bold text-lg">
              <Clock className="h-5 w-5 text-amber-600 animate-pulse" />
              <span>{remainingSeconds} seconds</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors inline-flex items-center justify-center cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2 text-neutral-500" />
            Log Out Now
          </button>
          <button
            type="button"
            onClick={handleStayLoggedIn}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brand-red text-white text-sm font-medium hover:bg-brand-red/90 transition-colors shadow-sm cursor-pointer"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
