import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full rounded-md border border-navy-100 bg-white px-3.5 py-2 text-sm",
      "placeholder:text-navy-300",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:border-gold-400",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
