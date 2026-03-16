'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Content - Bottom sheet on mobile, center on desktop */}
            <div className={`
        relative w-full sm:w-auto ${sizes[size]} 
        bg-slate-800 rounded-t-2xl sm:rounded-xl 
        shadow-2xl border border-slate-700
        animate-slideUp
        max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col
        sm:mx-4
      `}>
                {/* Handle bar for mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-slate-600 rounded-full" />
                </div>

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700 flex-shrink-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 sm:p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Body - Scrollable */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
