"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(50);

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPercent((x / rect.width) * 100);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return;
    updateFromClientX(event.clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl shadow-primary/5"
    >
      <Image src={beforeSrc} alt={beforeAlt} fill className="object-cover" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${percent}%)` }}
      >
        <Image src={afterSrc} alt={afterAlt} fill className="object-cover" />
      </div>

      <div
        className="absolute inset-y-0 z-10 w-1 cursor-ew-resize bg-secondary-container shadow-[0_0_15px_rgba(254,107,0,0.4)]"
        style={{ left: `${percent}%` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary-container text-white shadow-lg">
          <span className="material-symbols-outlined">unfold_more</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-md">
        BEFORE
      </div>
      <div className="absolute bottom-4 right-4 rounded-full bg-primary/80 px-3 py-1 text-xs text-white backdrop-blur-md">
        AFTER
      </div>
    </div>
  );
}
