'use client';

import { useState, useEffect, useRef } from 'react';
import TransactionForm from '@/components/dashboard/TransactionForm';

interface FloatingActionButtonProps {
    transactions?: any[];
    onSuccess?: () => void;
}

export default function FloatingActionButton({ transactions = [], onSuccess }: FloatingActionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isAtTop, setIsAtTop] = useState(true);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show FAB when at top, hide when scrolling down (unless at bottom)
            if (currentScrollY <= 100) {
                setIsVisible(true);
                setIsAtTop(true);
            } else {
                setIsAtTop(false);
                // Show when scrolling up, hide when scrolling down
                if (currentScrollY < lastScrollY) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            }

            setLastScrollY(currentScrollY);
        };

        // Use timeout to debounce scroll events
        const handleScrollWithTimeout = () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(handleScroll, 10);
        };

        window.addEventListener('scroll', handleScrollWithTimeout, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScrollWithTimeout);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [lastScrollY]);

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`
                    fixed bottom-20 right-4 z-30 md:hidden
                    w-14 h-14 rounded-full
                    bg-gradient-to-r from-amber-500 to-amber-600
                    text-white shadow-lg shadow-amber-500/30
                    flex items-center justify-center
                    hover:scale-110 active:scale-95
                    transition-all duration-300
                    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
                `}
                style={{
                    transitionProperty: 'transform, opacity, visibility',
                    transitionDuration: '300ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-label="Add Transaction"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {/* Bottom Sheet Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Bottom Sheet Content */}
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-800 rounded-t-2xl shadow-2xl border border-slate-700 animate-slideUp max-h-[80vh] flex flex-col">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-slate-600 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                            <h2 className="text-lg font-semibold text-white">Add Transaction</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-4 overflow-y-auto">
                            <TransactionForm
                                onSuccess={() => {
                                    setIsOpen(false);
                                    onSuccess?.();
                                }}
                                transactions={transactions}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
