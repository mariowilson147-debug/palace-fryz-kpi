import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixStr?: string;
  suffixStr?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, prefixStr, suffixStr, id, ...props }, ref) => {
    const defaultId = React.useId();
    const inputId = id || defaultId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {prefixStr && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <span className="text-sm font-medium">{prefixStr}</span>
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm
              placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'}
              ${prefixStr ? 'pl-8' : ''}
              ${suffixStr ? 'pr-8' : ''}
              ${className}
            `}
            {...props}
          />
          {suffixStr && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <span className="text-sm font-medium">{suffixStr}</span>
            </div>
          )}
        </div>
        {error && <p className="text-[13px] text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
