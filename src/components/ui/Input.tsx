"use client";

import React, { forwardRef } from "react";
import { LucideIcon } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  rightIcon?: LucideIcon | React.ReactNode;
  onRightIconClick?: () => void;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon: Icon,
      rightIcon: RightIcon,
      onRightIconClick,
      error,
      helperText,
      containerClassName = "",
      className = "",
      type = "text",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label className="block text-xs font-semibold text-foreground/80">
            {label}
          </label>
        )}

        <div className="relative w-full flex items-center">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-foreground/40 pointer-events-none z-10">
              <Icon className="h-4 w-4 shrink-0" />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={`w-full text-xs py-2.5 rounded-xl border bg-foreground/5 text-foreground transition-all focus:outline-none ${
              Icon ? "pl-11 input-with-icon" : "pl-3.5"
            } ${RightIcon ? "pr-11 input-with-right-icon" : "pr-3.5"} ${
              error
                ? "border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
                : "border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary/20"
            } placeholder:text-foreground/40 ${className}`}
            {...props}
          />

          {RightIcon && (
            <div
              onClick={onRightIconClick}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-foreground/40 ${
                onRightIconClick ? "cursor-pointer hover:text-foreground/70" : "pointer-events-none"
              } z-10`}
            >
              {typeof RightIcon === "function" ? <RightIcon className="h-4 w-4 shrink-0" /> : RightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] text-rose-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-foreground/50 font-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
