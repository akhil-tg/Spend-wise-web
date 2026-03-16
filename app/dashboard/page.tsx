'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';
import Navbar from '@/components/ui/Navbar';
import ExchangeRateDisplay from '@/components/dashboard/ExchangeRate';
import SummaryCards from '@/components/dashboard/SummaryCards';
import TransactionForm from '@/components/dashboard/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import Analytics from '@/components/dashboard/Analytics';
import MobileNav from '@/components/ui/MobileNav';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

export default function DashboardPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!loading && (!user || !userData)) {
            router.push('/');
        }
    }, [user, userData, loading, router]);

    useEffect(() => {
        if (!user || !supabase) return;

        const fetchTransactions = async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (data) {
                setTransactions(data.map(t => ({
                    id: t.id,
                    userId: t.user_id,
                    type: t.type,
                    category: t.category,
                    date: t.date,
                    amountEUR: t.amount_eur,
                    amountINR: t.amount_inr,
                    note: t.note || '',
                    createdAt: new Date(t.created_at),
                    updatedAt: new Date(t.updated_at)
                })));
            }
        };

        fetchTransactions();
    }, [user, refreshKey]);

    const handleDelete = async (id: string) => {
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (loading || !user || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center relative">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="text-center relative z-10">
                    <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-light">Loading your finances...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative pb-20 md:pb-0">
            {/* Background gradient mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute top-0 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

            <Navbar />

            <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 pb-32 md:pb-8">
                {/* Welcome Header */}
                <div className="mb-6 sm:mb-8 animate-slideDown">
                    <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                        Welcome back, {userData.fullName.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-slate-400 mt-1 font-light text-sm sm:text-lg">
                        Here's an overview of your finances
                    </p>
                </div>

                {/* Exchange Rate */}
                <div className="mb-6 sm:mb-8">
                    <ExchangeRateDisplay />
                </div>

                {/* Summary Cards */}
                <div className="mb-6 sm:mb-8">
                    <SummaryCards transactions={transactions} />
                </div>

                {/* Analytics & Insights */}
                <div className="mb-6 sm:mb-8 animate-slideUp stagger-4">
                    <h2 className="font-heading text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Financial Insights</h2>
                    <Analytics transactions={transactions} />
                </div>

                {/* Transaction Form & Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="animate-slideUp stagger-2">
                        <h2 className="font-heading text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Add Transaction</h2>
                        <TransactionForm onSuccess={handleSuccess} transactions={transactions} />
                    </div>

                    <div className="animate-slideUp stagger-3">
                        <h2 className="font-heading text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Recent Transactions</h2>
                        <TransactionList
                            transactions={transactions.slice(0, 5)}
                            onDelete={handleDelete}
                            onUpdate={handleSuccess}
                        />
                    </div>
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Floating Action Button for Quick Add */}
            <FloatingActionButton
                transactions={transactions}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
