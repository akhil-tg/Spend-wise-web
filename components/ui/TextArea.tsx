'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className = '', label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-slate-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={id}
                    className={`
            w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-600 rounded-lg 
            text-white placeholder-slate-400 resize-none text-base
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            transition-all duration-150
            min-h-[80px]
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
                    style={{ fontSize: '16px' }}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';

export default TextArea;
