'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Predefined avatar options
const AVATAR_OPTIONS = [
    '👨', '👩', '🧑', '👴', '👵',
    '🧔', '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱',
    '👩‍🦱', '🦸', '🦹', '🧙', '🧝'
];

export default function OnboardingForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        avatar: '👨'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedAvatar, setSelectedAvatar] = useState('👨');

    const { user, updateUserData } = useAuth();
    const router = useRouter();

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !user) return;

        setLoading(true);
        try {
            // Save user data to Supabase
            const { error } = await supabase
                .from('users')
                .upsert({
                    uid: user.id,
                    email: user.email,
                    display_name: formData.fullName.trim(),
                    full_name: formData.fullName.trim(),
                    avatar: selectedAvatar,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // Update local state and wait a bit for it to persist
            await updateUserData({
                fullName: formData.fullName.trim(),
                avatar: selectedAvatar
            });

            // Small delay to ensure state is updated, then redirect
            setTimeout(() => {
                router.push('/dashboard');
            }, 500);
        } catch (error) {
            console.error('Error saving user data:', error);
            setErrors({ submit: 'Failed to save your information. Please try again.' });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-3 sm:p-4">
            {/* Full page loading overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
                    <div className="text-center px-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-amber-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <p className="text-lg sm:text-xl font-medium text-white animate-pulse">Setting up your account...</p>
                        <p className="text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">Almost there!</p>
                    </div>
                </div>
            )}

            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="w-full max-w-md relative z-10 px-2">
                {/* Logo with animation */}
                <div className="text-center mb-6 sm:mb-8 animate-slideDown">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 mb-3 sm:mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/10 animate-float">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white">
                        Spend<span className="gradient-text">Wise</span>
                    </h1>
                </div>

                {/* Form Card with animation */}
                <div className="glass-card p-5 sm:p-8 animate-scaleIn">
                    <h2 className="font-heading text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2">
                        Welcome! 👋
                    </h2>
                    <p className="text-slate-400 mb-5 sm:mb-6 text-sm sm:text-base">
                        Let's set up your profile
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        {/* Avatar Selection */}
                        <div className="text-center">
                            <label className="block text-sm font-medium text-slate-300 mb-2 sm:mb-3">
                                Choose your avatar
                            </label>
                            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                                {AVATAR_OPTIONS.map((avatar) => (
                                    <button
                                        key={avatar}
                                        type="button"
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className={`
                                            w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl rounded-xl transition-all duration-200
                                            ${selectedAvatar === avatar
                                                ? 'bg-amber-500/30 border-2 border-amber-500 scale-110'
                                                : 'bg-slate-700/50 border-2 border-transparent hover:border-slate-600'
                                            }
                                        `}
                                    >
                                        {avatar}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input
                            id="fullName"
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            error={errors.fullName}
                            autoFocus
                        />

                        {errors.submit && (
                            <p className="text-sm text-red-500">{errors.submit}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || !formData.fullName.trim()}
                            className="w-full"
                            variant="gold"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Setting up...
                                </span>
                            ) : (
                                'Get Started →'
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs sm:text-sm mt-5 sm:mt-6 animate-fadeIn">
                    This helps us personalize your experience
                </p>
            </div>
        </div>
    );
}
