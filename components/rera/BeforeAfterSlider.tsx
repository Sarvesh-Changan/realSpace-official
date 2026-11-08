'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage = '',
  afterImage = '',
  beforeLabel = 'Bare Shell Developer Handover',
  afterLabel = 'REALSPACE Turnkey Luxury Execution',
  title = 'Interactive Transformation: From Raw Concrete to Turnkey Grandeur',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return;
    handleMove(e.clientX);
  };

  return (
    <div className="bg-white border border-[#E8E2DA] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-4 border-b border-[#E8E2DA]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
            <Sparkles className="w-4 h-4" />
            REALSPACE Architectural Proof
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1C1C1C]">
            {title}
          </h3>
        </div>
        <div className="text-xs text-[#6D6A66] flex items-center gap-2">
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#C8A96A]" />
          <span>Drag the central divider to compare</span>
        </div>
      </div>

      {/* Interactive Drag Container */}
      {beforeImage && afterImage ? (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative aspect-[16/10] w-full overflow-hidden select-none cursor-ew-resize bg-[#1C1C1C]"
      >
        {/* AFTER Image (Full background) */}
        <Image
          src={afterImage}
          alt="REALSPACE Finished Interior"
          fill
          sizes="(max-width: 1024px) 100vw, 896px"
          className="object-cover"
          priority
          referrerPolicy="no-referrer"
        />

        {/* AFTER Badge */}
        <div className="absolute top-4 right-4 bg-[#1C1C1C]/90 backdrop-blur-sm text-[#C8A96A] text-xs font-semibold uppercase tracking-wider px-3 py-1 shadow-md pointer-events-none z-10">
          {afterLabel}
        </div>

        {/* BEFORE Image (Clipped overlay) */}
        <div
          style={{ width: `${sliderPosition}%` }}
          className="absolute inset-y-0 left-0 overflow-hidden z-20"
        >
          <div className="relative w-full h-full" style={{ width: '100vw', maxWidth: '896px' }}>
            <Image
              src={beforeImage}
              alt="Raw Bare Shell Handover"
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover filter grayscale"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* BEFORE Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider px-3 py-1 shadow-md pointer-events-none">
            {beforeLabel}
          </div>
        </div>

        {/* Slider Divider Line & Thumb */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute inset-y-0 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[2px] h-full bg-white shadow-xl" />
          <div className="absolute w-9 h-9 rounded-full bg-[#1C1C1C] text-[#C8A96A] border-2 border-white flex items-center justify-center shadow-2xl">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>
      </div>
      ) : (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEE6DD] flex items-center justify-center">
          <span className="text-xs text-[#A39E98] uppercase tracking-wider">Before / After images not configured</span>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-[#E8E2DA] flex flex-wrap items-center justify-between text-xs text-[#6D6A66]">
        <div>
          <strong className="text-[#1C1C1C]">Key Upgrades:</strong> Botticino Italian marble flooring · Recessed cove lighting · Smoked French oak panelling · Häfele kitchen joinery.
        </div>
        <div className="text-[11px] font-semibold text-[#C8A96A] uppercase tracking-wider">
          45-Day Guaranteed Handover
        </div>
      </div>
    </div>
  );
};
