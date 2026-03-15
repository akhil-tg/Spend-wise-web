'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/ui/Navbar';
import ExchangeRateDisplay from '@/components/dashboard/ExchangeRate';
import ShoppingList from '@/components/shopping/ShoppingList';

export default function ShoppingPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !userData)) {
            router.push('/');
        }
    }, [user, userData, loading, router]);

    if (loading || !user || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center relative">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="text-center relative z-10">
                    <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-light">Loading your shopping list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            {/* Background gradient mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute top-0 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8 animate-slideDown">
                    <h1 className="font-heading text-4xl font-bold text-white mb-2">
                        Smart Shopping
                    </h1>
                    <p className="text-slate-400 mt-1 font-light text-lg">
                        Create your list, compare prices, and log expenses automatically
                    </p>
                </div>

                {/* Exchange Rate */}
                <div className="mb-8 animate-slideUp stagger-2">
                    <ExchangeRateDisplay />
                </div>

                {/* Shopping List */}
                <div className="animate-slideUp stagger-3">
                    <ShoppingList />
                </div>

                {/* Tips */}
                <div className="mt-8 glass-card p-5 animate-slideUp stagger-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <span>💡</span> Shopping Tips
                    </h3>
                    <ul className="text-sm text-slate-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            <span>Add items to your list before entering the store</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            <span>Enter the unit price as you shop to see real-time totals</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            <span>The INR equivalent updates automatically with live rates</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            <span>Check out to automatically log your expenses</span>
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
