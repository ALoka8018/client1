import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type BadgeVariant = "neutral" | "accent" | "primary" | "error";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-surface-container-high text-on-surface-variant",
  accent: "bg-secondary-container/15 text-secondary",
  primary: "bg-primary-container/10 text-primary",
  error: "bg-error-container text-on-error-container",
};

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-label-md uppercase",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
