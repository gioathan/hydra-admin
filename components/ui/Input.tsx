"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1B2B4B]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`px-3 py-2 border rounded-md text-sm text-[#1B2B4B] bg-white placeholder:text-[#6B7280] outline-none transition-colors
            ${error ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-[#1B2B4B] focus:ring-1 focus:ring-[#1B2B4B]"}
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[#6B7280]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
