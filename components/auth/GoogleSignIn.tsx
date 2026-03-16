'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function GoogleSignIn() {
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle } = useAuth();

    const handleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Sign in error:', error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-3 sm:px-4">
            {/* Decorative floating orbs */}
            <div className="absolute top-1/4 -left-20 w-60 sm:w-80 h-60 sm:h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="w-full max-w-md px-3 sm:px-6 relative z-10">
                {/* Logo and Title with staggered animation */}
                <div className="text-center mb-8 sm:mb-10 animate-slideDown">
                    {/* Premium logo icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 mb-4 sm:mb-6 border border-amber-500/20 shadow-lg shadow-amber-500/10 animate-float">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 sm:w-12 sm:h-12 text-amber-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    {/* Heading with serif font */}
                    <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                        Spend<span className="gradient-text">Wise</span>
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg font-light">
                        Track in Euros, Visualize in Rupees
                    </p>
                </div>

                {/* Sign In Card - Premium glassmorphism */}
                <div className="glass-card p-5 sm:p-8 animate-slideUp stagger-2">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="font-heading text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base">
                            Sign in to manage your finances with style
                        </p>
                    </div>

                    {/* Google Sign In Button - Premium styling */}
                    <button
                        onClick={handleSignIn}
                        disabled={loading}
                        className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/30 hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden"
                    >
                        {/* Button shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                        {loading ? (
                            <span className="flex items-center justify-center gap-2 relative z-10">
                                <svg className="animate-spin h-5 w-5 text-amber-500" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span className="text-slate-300">Signing in...</span>
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5">
                                    <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 5c1.62 0 3.06.55 4.21 1.45l3.15-3.15A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.24 6.65l4.03 3.11Z" />
                                    <path fill="#34A853" d="M16.04 18.01A7.03 7.03 0 0 1 12 19c-2.69 0-5-1.5-6.18-3.71l-4.02 3.09A11.95 11.95 0 0 0 12 24c3.19 0 6.07-1.24 8.21-3.28l-3.54-2.71H16.04Z" />
                                    <path fill="#4A90E2" d="M19.35 10.03C18.67 6.59 15.64 4 12 4 7.7 4 4.07 6.48 2.53 10.22l4.09-3.13C8.18 4.03 10.01 3 12 3c3.19 0 6.07 1.24 8.21 3.28l-2.86 3.75Z" />
                                    <path fill="#FBBC05" d="M6.18 13.71a7.03 7.03 0 0 1 0-3.42l-4.09-3.13A11.95 11.95 0 0 0 0 12c0 1.93.46 3.76 1.28 5.38l4.9-3.67Z" />
                                </svg>
                                <span className="text-white font-medium text-sm sm:text-base">Continue with Google</span>
                            </span>
                        )}
                    </button>

                    <p className="text-center text-slate-500 text-xs mt-5 sm:mt-6">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>

                {/* Features Preview - Enhanced cards */}
                <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-2 sm:gap-4 animate-slideUp stagger-4">
                    {[
                        { icon: '💶', label: 'EUR Tracking', desc: 'Track spending' },
                        { icon: '💵', label: 'Live INR', desc: 'Real-time rates' },
                        { icon: '🛒', label: 'Smart Lists', desc: 'Shopping assistant' }
                    ].map((feature, index) => (
                        <div
                            key={feature.label}
                            className="glass-card p-3 sm:p-4 text-center hover-lift cursor-default"
                            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                        >
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{feature.icon}</div>
                            <div className="text-white font-medium text-xs sm:text-sm">{feature.label}</div>
                            <div className="text-slate-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{feature.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4 sm:gap-6 animate-fadeIn stagger-5">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 text-xs">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 text-xs">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Private</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 text-xs">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Global</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
