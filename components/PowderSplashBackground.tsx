"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

export interface PowderSplashBackgroundProps {
  className?: string;
  compact?: boolean;
}

export function PowderSplashBackground({
  className = "",
  compact = false,
}: PowderSplashBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Stroke scale multiplier for mobile / compact mode
  const strokeMultiplier = compact || isMobile ? 0.65 : 1;
  const thickStrokeWidth = 34 * strokeMultiplier;
  const thinStrokeWidth = 16 * strokeMultiplier;

  // Stagger delays
  const redThickDelay = shouldReduceMotion ? 0 : 0.05;
  const yellowThickDelay = shouldReduceMotion ? 0 : 0.2;
  const redThinDelay = shouldReduceMotion ? 0 : 0.35;
  const yellowThinDelay = shouldReduceMotion ? 0 : 0.5;
  const grainsStartDelay = shouldReduceMotion ? 0 : 0.65;

  const pathTransition = (duration = 1.1, delay = 0): Transition => ({
    duration: shouldReduceMotion ? 0.01 : duration,
    delay: shouldReduceMotion ? 0 : delay,
    ease: "easeOut",
  });

  const circleVariants = (finalOpacity: number, staggerIdx: number) => ({
    initial: {
      opacity: shouldReduceMotion ? finalOpacity : 0,
      scale: shouldReduceMotion ? 1 : 0.4,
    },
    animate: {
      opacity: finalOpacity,
      scale: 1,
    },
    transition: {
      duration: shouldReduceMotion ? 0.01 : 0.5,
      delay: shouldReduceMotion ? 0 : grainsStartDelay + staggerIdx * 0.04,
      ease: "easeOut" as const,
    },
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 710 430"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="frame">
            <rect x="0" y="0" width="710" height="430" rx="12" />
          </clipPath>
        </defs>
        <g clipPath="url(#frame)">
          <rect x="0" y="0" width="710" height="430" fill="#FDFCFA" />

          {/* Red streak, bottom-left (Thick) */}
          <motion.path
            d="M -20 420 C 80 380, 60 260, 150 210 C 210 175, 260 190, 300 160 C 260 150, 220 130, 210 90 C 205 60, 230 40, 260 30"
            fill="none"
            stroke="#8F1616"
            strokeWidth={thickStrokeWidth}
            strokeLinecap="round"
            opacity={0.85}
            initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={pathTransition(1.1, redThickDelay)}
          />

          {/* Red streak, bottom-left (Thin Overlay) */}
          <motion.path
            d="M -20 420 C 80 380, 60 260, 150 210"
            fill="none"
            stroke="#B32424"
            strokeWidth={thinStrokeWidth}
            strokeLinecap="round"
            opacity={0.5}
            initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={pathTransition(0.9, redThinDelay)}
          />

          {/* Red powder grains */}
          <motion.circle
            cx="330"
            cy="120"
            r="5"
            fill="#8F1616"
            {...circleVariants(0.7, 0)}
          />
          <motion.circle
            cx="350"
            cy="145"
            r="3.5"
            fill="#B32424"
            {...circleVariants(0.6, 1)}
          />
          <motion.circle
            cx="300"
            cy="95"
            r="4"
            fill="#8F1616"
            {...circleVariants(0.55, 2)}
          />
          <motion.circle
            cx="365"
            cy="110"
            r="2.5"
            fill="#B32424"
            {...circleVariants(0.5, 3)}
          />
          <motion.circle
            cx="290"
            cy="140"
            r="3"
            fill="#8F1616"
            {...circleVariants(0.5, 4)}
          />
          <motion.circle
            cx="240"
            cy="70"
            r="3"
            fill="#B32424"
            {...circleVariants(0.4, 5)}
          />

          {/* Yellow streak, bottom-right (Thick) */}
          <motion.path
            d="M 700 420 C 600 375, 630 250, 540 200 C 480 168, 430 185, 390 155 C 430 145, 470 122, 480 82 C 485 52, 460 32, 430 22"
            fill="none"
            stroke="#E7B90B"
            strokeWidth={thickStrokeWidth}
            strokeLinecap="round"
            opacity={0.85}
            initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={pathTransition(1.1, yellowThickDelay)}
          />

          {/* Yellow streak, bottom-right (Thin Overlay) */}
          <motion.path
            d="M 700 420 C 600 375, 630 250, 540 200"
            fill="none"
            stroke="#F6D23A"
            strokeWidth={thinStrokeWidth}
            strokeLinecap="round"
            opacity={0.5}
            initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={pathTransition(0.9, yellowThinDelay)}
          />

          {/* Yellow powder grains */}
          <motion.circle
            cx="350"
            cy="122"
            r="5"
            fill="#E7B90B"
            {...circleVariants(0.7, 1)}
          />
          <motion.circle
            cx="330"
            cy="148"
            r="3.5"
            fill="#F6D23A"
            {...circleVariants(0.6, 2)}
          />
          <motion.circle
            cx="380"
            cy="98"
            r="4"
            fill="#E7B90B"
            {...circleVariants(0.55, 3)}
          />
          <motion.circle
            cx="315"
            cy="112"
            r="2.5"
            fill="#F6D23A"
            {...circleVariants(0.5, 4)}
          />
          <motion.circle
            cx="390"
            cy="140"
            r="3"
            fill="#E7B90B"
            {...circleVariants(0.5, 5)}
          />
          <motion.circle
            cx="440"
            cy="70"
            r="3"
            fill="#F6D23A"
            {...circleVariants(0.4, 6)}
          />

          {/* Where red + yellow overlap/glow */}
          <motion.circle
            cx="340"
            cy="130"
            r="10"
            fill="#B32424"
            {...circleVariants(0.35, 7)}
          />
          <motion.circle
            cx="345"
            cy="132"
            r="8"
            fill="#E7B90B"
            {...circleVariants(0.35, 8)}
          />
        </g>
      </svg>
    </div>
  );
}
