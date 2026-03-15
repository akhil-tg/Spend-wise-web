'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingForm from '@/components/auth/OnboardingForm';

export default function OnboardingPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in - redirect to login
                router.push('/');
            } else if (userData) {
                // Already has profile - go to dashboard
                router.push('/dashboard');
            }
        }
    }, [user, userData, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center relative">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="text-center relative z-10">
                    <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-light">Setting up your profile...</p>
                </div>
            </div>
        );
    }

    // User logged in but no profile - show onboarding
    if (user && !userData) {
        return <OnboardingForm />;
    }

    return null;
}
