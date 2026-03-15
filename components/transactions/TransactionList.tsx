'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { formatEUR, formatINR } from '@/lib/exchangeRate';
import Card from '@/components/ui/Card';
import EditTransactionModal from './EditTransactionModal';

interface TransactionListProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    onUpdate: () => void;
}

export default function TransactionList({ transactions, onDelete, onUpdate }: TransactionListProps) {
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'income':
                return 'text-emerald-400 bg-emerald-500/20';
            case 'expense':
                return 'text-red-400 bg-red-500/20';
            case 'savings':
                return 'text-amber-400 bg-amber-500/20';
            default:
                return 'text-slate-400 bg-slate-500/20';
        }
    };

    if (transactions.length === 0) {
        return (
            <Card className="text-center py-12">
                <div className="text-slate-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-lg font-medium">No transactions yet</p>
                    <p className="text-sm">Add your first transaction to get started</p>
                </div>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {sortedTransactions.map((transaction) => (
                    <Card
                        key={transaction.id}
                        hover
                        className="group"
                    >
                        <div className="flex items-center justify-between gap-4">
                            {/* Left Section - Date & Category */}
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="text-center hidden sm:block">
                                    <div className="text-xs text-slate-500 uppercase">
                                        {new Date(transaction.date).toLocaleDateString('en-GB', { month: 'short' })}
                                    </div>
                                    <div className="text-lg font-semibold text-white">
                                        {new Date(transaction.date).getDate()}
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getTypeColor(transaction.type)}`}>
                                            {transaction.type}
                                        </span>
                                        <span className="text-sm font-medium text-white truncate">
                                            {transaction.category}
                                        </span>
                                    </div>
                                    {transaction.note && (
                                        <p className="text-xs text-slate-400 truncate max-w-[200px]">
                                            {transaction.note}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right Section - Amount & Actions */}
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="font-semibold text-white">
                                        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                                        {formatEUR(transaction.amountEUR)}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {formatINR(transaction.amountINR)}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingTransaction(transaction)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                        title="Edit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>

                                    {deleteConfirm === transaction.id ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    onDelete(transaction.id);
                                                    setDeleteConfirm(null);
                                                }}
                                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                                title="Confirm delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                title="Cancel"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(transaction.id)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit Modal */}
            <EditTransactionModal
                transaction={editingTransaction}
                isOpen={!!editingTransaction}
                onClose={() => setEditingTransaction(null)}
                onSuccess={() => {
                    onUpdate();
                    setEditingTransaction(null);
                }}
            />
        </>
    );
}
