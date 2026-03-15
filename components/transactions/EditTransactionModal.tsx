'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVINGS_CATEGORIES } from '@/types';
import { getExchangeRate, convertEURtoINR, formatINR } from '@/lib/exchangeRate';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import TextArea from '@/components/ui/TextArea';

interface EditTransactionModalProps {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditTransactionModal({ transaction, isOpen, onClose, onSuccess }: EditTransactionModalProps) {
    const [type, setType] = useState<TransactionType>('expense');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [amountEUR, setAmountEUR] = useState('');
    const [amountINR, setAmountINR] = useState<number>(0);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [exchangeRate, setExchangeRate] = useState<number>(90.5);

    useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setCategory(transaction.category);
            setDate(transaction.date);
            setAmountEUR(transaction.amountEUR.toString());
            setAmountINR(transaction.amountINR);
            setNote(transaction.note);
        }
    }, [transaction]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transaction || !amountEUR || !category) return;

        setLoading(true);
        try {
            const eur = parseFloat(amountEUR);

            const { error } = await supabase
                .from('transactions')
                .update({
                    type,
                    category,
                    date,
                    amount_eur: eur,
                    amount_inr: convertEURtoINR(eur, exchangeRate),
                    note: note.trim(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', transaction.id);

            if (error) throw error;

            onSuccess();
        } catch (error) {
            console.error('Error updating transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Transaction" size="md">
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
                flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all
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

                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        id="editCategory"
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
                        id="editDate"
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
                        id="editAmountEUR"
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
                            <span className="text-sm text-slate-400">INR Equivalent</span>
                            <span className={`text-lg font-semibold ${amountEUR && parseFloat(amountEUR) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {formatINR(amountINR)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Note */}
                <TextArea
                    id="editNote"
                    label="Note (optional)"
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                />

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !amountEUR || !category}
                        className="flex-1"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
