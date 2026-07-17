import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Tiered elevation model from DESIGN.md:
   * 0 = base surface, 1 = white card with soft blue-tinted shadow,
   * 2 = glass (semi-transparent + backdrop blur), for nav/floating overlays.
   */
  elevation?: 0 | 1 | 2;
}

const elevationClasses: Record<0 | 1 | 2, string> = {
  0: "bg-surface",
  1: "bg-surface-container-lowest shadow-level-1",
  2: "glass",
};

export function Card({ elevation = 1, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        elevationClasses[elevation],
        className,
      )}
      {...props}
    />
  );
}
