'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-slate-300 mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={`
                        w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl 
                        text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50
                        transition-all duration-200 hover:border-slate-500/50
                        ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
