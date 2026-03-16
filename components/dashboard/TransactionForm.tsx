'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getExchangeRate, convertEURtoINR, formatINR, formatEUR } from '@/lib/exchangeRate';
import { getToday } from '@/lib/utils';
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVINGS_CATEGORIES } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import TextArea from '@/components/ui/TextArea';
import Card from '@/components/ui/Card';

interface TransactionFormProps {
    onSuccess?: () => void;
    transactions?: Transaction[];
}

export default function TransactionForm({ onSuccess, transactions = [] }: TransactionFormProps) {
    const { user } = useAuth();
    const [type, setType] = useState<TransactionType>('expense');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(getToday());
    const [amountEUR, setAmountEUR] = useState('');
    const [amountINR, setAmountINR] = useState<number>(0);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [exchangeRate, setExchangeRate] = useState<number>(90.5);

    // Calculate totals from transactions
    const totals = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.income += t.amountEUR;
            } else if (t.type === 'expense') {
                acc.expense += t.amountEUR;
            } else if (t.type === 'savings') {
                acc.savings += t.amountEUR;
            }
            return acc;
        }, { income: 0, expense: 0, savings: 0 });
    }, [transactions]);

    // Calculate available balance (income - expenses - savings)
    const availableBalance = totals.income - totals.expense - totals.savings;
    const currentAmount = parseFloat(amountEUR) || 0;

    // For expense/savings: show deducted from income
    // For income: show added to balance
    const balanceChange = type === 'income' ? currentAmount : -currentAmount;
    const projectedBalance = availableBalance + balanceChange;

    useEffect(() => {
        const fetchRate = async () => {
            const rate = await getExchangeRate();
            setExchangeRate(rate.rate);
        };
        fetchRate();
    }, []);

    useEffect(() => {
        const eur = parseFloat(amountEUR) || 0;
        setAmountINR(convertEURtoINR(eur, exchangeRate));
    }, [amountEUR, exchangeRate]);

    const getCategories = () => {
        switch (type) {
            case 'expense':
                return EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }));
            case 'income':
                return INCOME_CATEGORIES.map(c => ({ value: c, label: c }));
            case 'savings':
                return SAVINGS_CATEGORIES.map(c => ({ value: c, label: c }));
        }
    };

    // Check if user can add expense/savings
    const canAddExpense = type === 'income' || totals.income > 0;
    const showBalanceWarning = (type === 'expense' || type === 'savings') &&
        totals.income > 0 &&
        currentAmount > availableBalance;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Can't add expense/savings without income
        if ((type === 'expense' || type === 'savings') && totals.income === 0) {
            alert('Please add income first before adding expenses or savings!');
            return;
        }

        if (!user || !amountEUR || !category) return;

        setLoading(true);
        try {
            const eur = parseFloat(amountEUR);

            const { error } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    type,
                    category,
                    date,
                    amount_eur: eur,
                    amount_inr: convertEURtoINR(eur, exchangeRate),
                    note: note.trim()
                });

            if (error) throw error;

            // Reset form
            setCategory('');
            setAmountEUR('');
            setNote('');

            onSuccess?.();
        } catch (error) {
            console.error('Error adding transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Add Transaction</h3>

            {/* Balance Summary */}
            <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Income:</span>
                    <span className="text-emerald-400 font-medium">{formatEUR(totals.income)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-400">Total Expenses:</span>
                    <span className="text-red-400 font-medium">{formatEUR(totals.expense)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-400">Total Savings:</span>
                    <span className="text-amber-400 font-medium">{formatEUR(totals.savings)}</span>
                </div>
                <div className="border-t border-slate-700/50 mt-2 pt-2 flex justify-between">
                    <span className="text-white font-medium">Available Balance:</span>
                    <span className={`font-bold ${availableBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatEUR(availableBalance)}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Selector */}
                <div className="flex gap-2">
                    {(['expense', 'income', 'savings'] as TransactionType[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => {
                                setType(t);
                                setCategory('');
                            }}
                            className={`
                                flex-1 py-2.5 sm:py-2 px-2 sm:px-3 rounded-lg text-sm font-medium capitalize transition-all
                                min-h-[44px]
                                ${type === t
                                    ? t === 'expense'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : t === 'income'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700'
                                }
                            `}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Validation Message */}
                {!canAddExpense && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-red-400 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Add income first before adding expenses or savings!
                        </p>
                    </div>
                )}

                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        id="category"
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        options={[
                            { value: '', label: 'Select category' },
                            ...getCategories()
                        ]}
                        required
                    />
                    <Input
                        id="date"
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                {/* Amount with Live INR Preview */}
                <div className="space-y-2">
                    <Input
                        id="amountEUR"
                        label="Amount (EUR)"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={amountEUR}
                        onChange={(e) => setAmountEUR(e.target.value)}
                        required
                    />

                    {/* Live INR Preview */}
                    <div className={`
                        px-4 py-3 rounded-lg border transition-all
                        ${amountEUR && parseFloat(amountEUR) > 0
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-slate-700/30 border-slate-600'
                        }
                    `}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Live INR Preview</span>
                            <span className={`text-lg font-semibold ${amountEUR && parseFloat(amountEUR) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {formatINR(amountINR)}
                            </span>
                        </div>
                    </div>

                    {/* Projected Balance (for expense/savings) */}
                    {(type === 'expense' || type === 'savings') && amountEUR && parseFloat(amountEUR) > 0 && (
                        <div className={`
                            px-4 py-3 rounded-lg border transition-all
                            ${showBalanceWarning
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-emerald-500/10 border-emerald-500/30'
                            }
                        `}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">
                                    {type === 'expense' ? '💸 Deducted from Income:' : '💰 Saved from Income:'}
                                </span>
                                <span className={`text-lg font-semibold ${showBalanceWarning ? 'text-red-400' : 'text-emerald-400'}`}>
                                    -{formatEUR(currentAmount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-600/30">
                                <span className="text-sm text-white font-medium">Remaining Balance:</span>
                                <span className={`text-lg font-bold ${projectedBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {formatEUR(projectedBalance)}
                                </span>
                            </div>
                            {showBalanceWarning && (
                                <p className="text-xs text-red-400 mt-2">
                                    ⚠️ Warning: This exceeds your total income!
                                </p>
                            )}
                        </div>
                    )}

                    {/* Income - show added to balance */}
                    {type === 'income' && amountEUR && parseFloat(amountEUR) > 0 && (
                        <div className="px-4 py-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">💵 Added to Balance:</span>
                                <span className="text-lg font-semibold text-emerald-400">
                                    +{formatEUR(currentAmount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-600/30">
                                <span className="text-sm text-white font-medium">New Balance:</span>
                                <span className="text-lg font-bold text-emerald-400">
                                    {formatEUR(projectedBalance)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Note */}
                <TextArea
                    id="note"
                    label="Note (optional)"
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                />

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={loading || !amountEUR || !category || !canAddExpense}
                    className="w-full"
                    variant={type === 'expense' ? 'danger' : type === 'income' ? 'success' : 'gold'}
                >
                    {loading ? 'Adding...' : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                </Button>
            </form>
        </Card>
    );
}
