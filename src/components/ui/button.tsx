import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      type={type}
      {...props}
    />
  );
}
