'use client';

import { Transaction } from '@/types';
import {
    calculateTotals,
    calculateSpendingByCategory,
    getSpendingTrend,
    calculateDailyAverage,
    calculateWeeklyAverage,
    projectMonthlySpending,
    calculateNetPosition,
    formatCompactEUR,
    formatPercentageChange
} from '@/lib/financial';
import { getExchangeRate, formatEUR, formatINR, convertEURtoINR } from '@/lib/exchangeRate';
import { useEffect, useState } from 'react';

interface AnalyticsProps {
    transactions: Transaction[];
}

export default function Analytics({ transactions }: AnalyticsProps) {
    const [exchangeRate, setExchangeRate] = useState<number>(90.5);

    useEffect(() => {
        getExchangeRate().then(rate => setExchangeRate(rate.rate));
    }, []);

    const totals = calculateTotals(transactions);
    const categoryBreakdown = calculateSpendingByCategory(transactions);
    const trend = getSpendingTrend(transactions);
    const dailyAvg = calculateDailyAverage(transactions);
    const weeklyAvg = calculateWeeklyAverage(transactions);
    const projectedSpending = projectMonthlySpending(transactions);
    const netPosition = calculateNetPosition(transactions);

    // Default monthly budget (can be made configurable)
    const monthlyBudget = 2000; // €2000
    const budgetUsed = (totals.expense / monthlyBudget) * 100;

    return (
        <div className="space-y-6">
            {/* Budget Progress */}
            <div className="glass-card p-6 border-amber-500/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg font-semibold text-white">Monthly Budget</h3>
                    <span className="text-sm text-slate-400">
                        {formatEUR(totals.expense)} / {formatEUR(monthlyBudget)}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden mb-2">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${budgetUsed > 90 ? 'bg-red-500' :
                            budgetUsed > 70 ? 'bg-amber-500' :
                                'bg-emerald-500'
                            }`}
                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                </div>

                <div className="flex justify-between text-sm">
                    <span className={budgetUsed > 100 ? 'text-red-400' : 'text-slate-400'}>
                        {budgetUsed.toFixed(0)}% used
                    </span>
                    <span className="text-emerald-400">
                        {formatEUR(Math.max(monthlyBudget - totals.expense, 0))} remaining
                    </span>
                </div>
            </div>

            {/* Spending Insights Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Daily Average */}
                <div className="glass-card p-4 border-slate-600/30">
                    <p className="text-slate-400 text-xs mb-1">Daily Average</p>
                    <p className="text-xl font-bold text-white">{formatEUR(dailyAvg)}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatINR(convertEURtoINR(dailyAvg, exchangeRate))}</p>
                </div>

                {/* Weekly Average */}
                <div className="glass-card p-4 border-slate-600/30">
                    <p className="text-slate-400 text-xs mb-1">Weekly Average</p>
                    <p className="text-xl font-bold text-white">{formatEUR(weeklyAvg)}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatINR(convertEURtoINR(weeklyAvg, exchangeRate))}</p>
                </div>

                {/* Projected Monthly */}
                <div className="glass-card p-4 border-slate-600/30">
                    <p className="text-slate-400 text-xs mb-1">Projected Month</p>
                    <p className="text-xl font-bold text-white">{formatEUR(projectedSpending)}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatINR(convertEURtoINR(projectedSpending, exchangeRate))}</p>
                </div>

                {/* Net Position */}
                <div className="glass-card p-4 border-slate-600/30">
                    <p className="text-slate-400 text-xs mb-1">Net Position</p>
                    <p className={`text-xl font-bold ${netPosition >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatEUR(netPosition)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{formatINR(convertEURtoINR(netPosition, exchangeRate))}</p>
                </div>
            </div>

            {/* Week-over-Week Trend */}
            <div className="glass-card p-6 border-slate-600/30">
                <h3 className="font-heading text-lg font-semibold text-white mb-4">This Week vs Last Week</h3>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div>
                            <p className="text-slate-400 text-xs mb-1">This Week</p>
                            <p className="text-2xl font-bold text-white">{formatEUR(trend.currentWeek)}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs mb-1">Last Week</p>
                            <p className="text-2xl font-bold text-slate-500">{formatEUR(trend.previousWeek)}</p>
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${trend.direction === 'down' ? 'bg-emerald-500/20 text-emerald-400' :
                        trend.direction === 'up' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-700/50 text-slate-400'
                        }`}>
                        {trend.direction === 'down' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        ) : trend.direction === 'up' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                            </svg>
                        )}
                        <span className="font-semibold">{formatPercentageChange(trend.change)}</span>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
                <div className="glass-card p-6 border-slate-600/30">
                    <h3 className="font-heading text-lg font-semibold text-white mb-4">Spending by Category</h3>

                    <div className="space-y-4">
                        {categoryBreakdown.slice(0, 5).map((cat, index) => (
                            <div key={cat.category}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white text-sm">{cat.category}</span>
                                    <span className="text-slate-400 text-sm">
                                        {formatEUR(cat.amount)} ({cat.percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-700/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                                        style={{ width: `${cat.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center border-emerald-500/20">
                    <p className="text-emerald-400 text-2xl font-bold">{formatEUR(totals.income)}</p>
                    <p className="text-slate-400 text-xs mt-1">Total Income</p>
                </div>
                <div className="glass-card p-4 text-center border-red-500/20">
                    <p className="text-red-400 text-2xl font-bold">{formatEUR(totals.expense)}</p>
                    <p className="text-slate-400 text-xs mt-1">Total Expenses</p>
                </div>
                <div className="glass-card p-4 text-center border-amber-500/20">
                    <p className="text-amber-400 text-2xl font-bold">{formatEUR(totals.savings)}</p>
                    <p className="text-slate-400 text-xs mt-1">Total Savings</p>
                </div>
            </div>
        </div>
    );
}
