import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

const fieldClasses =
  "w-full rounded bg-surface-container-lowest px-4 py-3 font-sans text-body-md text-on-surface " +
  "border border-outline-variant placeholder:text-on-surface-variant " +
  "focus:outline-none focus:border-2 focus:border-primary focus:px-[15px] focus:py-[11px]";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(fieldClasses, "resize-none", className)} {...props} />
  );
}
