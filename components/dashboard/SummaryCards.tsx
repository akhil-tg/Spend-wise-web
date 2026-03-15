'use client';

import { Transaction } from '@/types';
import { formatEUR, formatINR } from '@/lib/exchangeRate';
import React, { useEffect, useState } from 'react';

interface SummaryCardsProps {
    transactions: Transaction[];
}

export default function SummaryCards({ transactions }: SummaryCardsProps): React.ReactElement {
    const [animatedValues, setAnimatedValues] = useState({
        incomeEUR: 0,
        expenseEUR: 0,
        savingsEUR: 0,
        balanceEUR: 0
    });

    // Calculate totals
    const totals = transactions.reduce(
        (acc, t) => {
            if (t.type === 'income') {
                acc.incomeEUR += t.amountEUR;
                acc.incomeINR += t.amountINR;
            } else if (t.type === 'expense') {
                acc.expenseEUR += t.amountEUR;
                acc.expenseINR += t.amountINR;
            } else if (t.type === 'savings') {
                acc.savingsEUR += t.amountEUR;
                acc.savingsINR += t.amountINR;
            }
            return acc;
        },
        { incomeEUR: 0, incomeINR: 0, expenseEUR: 0, expenseINR: 0, savingsEUR: 0, savingsINR: 0 }
    );

    // Available balance = Income - Expenses - Savings
    const availableBalance = totals.incomeEUR - totals.expenseEUR - totals.savingsEUR;
    const availableBalanceINR = totals.incomeINR - totals.expenseINR - totals.savingsINR;

    // Animate numbers on mount/update
    useEffect(() => {
        const duration = 800;
        const steps = 30;
        const interval = duration / steps;

        const targetValues = {
            incomeEUR: totals.incomeEUR,
            expenseEUR: totals.expenseEUR,
            savingsEUR: totals.savingsEUR,
            balanceEUR: availableBalance
        };

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out

            setAnimatedValues({
                incomeEUR: targetValues.incomeEUR * easeOut,
                expenseEUR: targetValues.expenseEUR * easeOut,
                savingsEUR: targetValues.savingsEUR * easeOut,
                balanceEUR: targetValues.balanceEUR * easeOut
            });

            if (step >= steps) {
                clearInterval(timer);
                setAnimatedValues(targetValues);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [totals.incomeEUR, totals.expenseEUR, totals.savingsEUR, availableBalance]);

    const cards = [
        {
            title: 'Available Balance',
            amountEUR: animatedValues.balanceEUR,
            amountINR: availableBalanceINR,
            bgGradient: availableBalance >= 0 ? 'from-emerald-500/20 via-emerald-600/10 to-transparent' : 'from-red-500/20 via-red-600/10 to-transparent',
            borderColor: availableBalance >= 0 ? 'border-emerald-500/30' : 'border-red-500/30',
            iconColor: availableBalance >= 0 ? 'text-emerald-400' : 'text-red-400',
            glowColor: availableBalance >= 0 ? 'shadow-emerald-500/10' : 'shadow-red-500/10',
            isHighlighted: true,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        },
        {
            title: 'Total Income',
            amountEUR: animatedValues.incomeEUR,
            amountINR: totals.incomeINR,
            bgGradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
            borderColor: 'border-emerald-500/30',
            iconColor: 'text-emerald-400',
            glowColor: 'shadow-emerald-500/10',
            isHighlighted: false,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Total Expenses',
            amountEUR: animatedValues.expenseEUR,
            amountINR: totals.expenseINR,
            bgGradient: 'from-red-500/20 via-red-600/10 to-transparent',
            borderColor: 'border-red-500/30',
            iconColor: 'text-red-400',
            glowColor: 'shadow-red-500/10',
            isHighlighted: false,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            title: 'Total Savings',
            amountEUR: animatedValues.savingsEUR,
            amountINR: totals.savingsINR,
            bgGradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
            borderColor: 'border-amber-500/30',
            iconColor: 'text-amber-400',
            glowColor: 'shadow-amber-500/10',
            isHighlighted: false,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div
                    key={card.title}
                    className={`
                        glass-card p-5 border ${card.borderColor} ${card.glowColor} hover-lift
                        animate-scaleIn
                        ${card.isHighlighted ? 'ring-2 ring-amber-500/30' : ''}
                    `}
                    style={{
                        animationDelay: `${index * 0.08}s`,
                        animationFillMode: 'both'
                    }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${card.bgGradient} border border-white/5`}>
                            <div className={card.iconColor}>
                                {card.icon}
                            </div>
                        </div>
                        {card.isHighlighted && (
                            <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                                LIVE
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-medium mb-1">{card.title}</p>
                        <p className={`text-2xl font-bold tracking-tight ${card.iconColor}`}>
                            {formatEUR(card.amountEUR)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-light">
                            {formatINR(card.amountINR)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
