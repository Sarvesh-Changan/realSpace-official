"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

export interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  scale = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const [isSupported, setIsSupported] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  useEffect(() => {
    // Detect desktop hover capability and prefers-reduced-motion
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkSupport = () => {
      setIsSupported(hoverMedia.matches && !motionMedia.matches);
    };

    checkSupport();

    if (hoverMedia.addEventListener) {
      hoverMedia.addEventListener("change", checkSupport);
      motionMedia.addEventListener("change", checkSupport);
    } else {
      hoverMedia.addListener(checkSupport);
      motionMedia.addListener(checkSupport);
    }

    return () => {
      if (hoverMedia.removeEventListener) {
        hoverMedia.removeEventListener("change", checkSupport);
        motionMedia.removeEventListener("change", checkSupport);
      } else {
        hoverMedia.removeListener(checkSupport);
        motionMedia.removeListener(checkSupport);
      }
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isSupported || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) return;

      // Cursor offset from center (-1 to +1)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const px = (mouseX / width) * 2 - 1;
      const py = (mouseY / height) * 2 - 1;

      // Percentage coordinates for glare overlay (0% to 100%)
      const glareX = Math.round((mouseX / width) * 100);
      const glareY = Math.round((mouseY / height) * 100);

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const rotateX = (-py * maxTilt).toFixed(2);
        const rotateY = (px * maxTilt).toFixed(2);

        setTiltStyle({
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
          transition: "transform 100ms ease-out",
        });

        setGlareStyle({
          opacity: 0.85,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(254, 204, 0, 0.18) 0%, rgba(153, 0, 0, 0.05) 50%, transparent 80%)`,
          transition: "opacity 300ms ease-out",
        });
      });
    },
    [isSupported, maxTilt, scale]
  );

  const handleMouseEnter = useCallback(() => {
    if (!isSupported) return;
    setIsHovered(true);
  }, [isSupported]);

  const handleMouseLeave = useCallback(() => {
    if (!isSupported) return;

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    setIsHovered(false);
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 350ms ease-out",
    });
    setGlareStyle({
      opacity: 0,
      transition: "opacity 350ms ease-out",
    });
  }, [isSupported]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl transition-shadow duration-300 ${
        isHovered ? "shadow-xl z-10" : "shadow-sm hover:shadow-md"
      } ${className}`}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...tiltStyle,
      }}
    >
      {children}

      {/* Subtle brand-accent glare overlay */}
      {isSupported && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl z-20 transition-opacity"
          style={glareStyle}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
