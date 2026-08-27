"use client";

import React, { ElementType } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type ScrollRevealDirection = "up" | "down" | "left" | "right" | "none";

export interface ScrollRevealProps extends Omit<HTMLMotionProps<"div">, "direction"> {
  children: React.ReactNode;
  direction?: ScrollRevealDirection;
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
  as?: ElementType;
}

export function ScrollReveal({
  children,
  direction = "up",
  distance = 24,
  delay = 0,
  duration = 0.5,
  once = true,
  threshold = 0.2,
  className = "",
  as = "div",
  ...motionProps
}: ScrollRevealProps) {
  const shouldReduceMotion = usePrefersReducedMotion();

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = shouldReduceMotion
    ? { opacity: 1, x: 0, y: 0 }
    : { opacity: 0, ...getInitialPosition() };

  const animate = { opacity: 1, x: 0, y: 0 };

  const transition = {
    duration: shouldReduceMotion ? 0.01 : duration,
    delay: shouldReduceMotion ? 0 : delay,
    ease: [0.25, 0.1, 0.25, 1.0],
  };

  const MotionComponent = motion.create(as);

  return (
    <MotionComponent
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount: threshold }}
      transition={transition}
      className={className}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
}
