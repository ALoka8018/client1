import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type ButtonVariant =
  | "accent"
  | "primary"
  | "outline"
  | "outline-inverse"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleProps {}

const variantClasses: Record<ButtonVariant, string> = {
  // Accent orange: reserved for the single critical CTA on a screen.
  accent:
    "bg-secondary-container text-on-secondary-container hover:brightness-95 shadow-level-1",
  primary: "bg-primary text-on-primary hover:brightness-110 shadow-level-1",
  outline:
    "border border-outline text-primary bg-transparent hover:bg-surface-container-low",
  "outline-inverse":
    "border border-white/40 text-on-primary bg-transparent hover:bg-white/10",
  ghost: "text-primary bg-transparent hover:bg-surface-container-low",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-base gap-2",
  lg: "h-14 px-8 text-lg gap-2",
};

/** Shared class-builder so links (e.g. Next.js `<Link>`) can look exactly like a Button. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  pill = false,
  fullWidth = false,
  className,
}: ButtonStyleProps = {}) {
  return cn(
    "inline-flex items-center justify-center font-sans font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
    pill ? "rounded-full" : "rounded",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

export function Button({
  variant,
  size,
  pill,
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses({ variant, size, pill, fullWidth, className })}
      {...props}
    />
  );
}
