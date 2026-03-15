'use client';

import { useEffect, useState } from 'react';
import { getExchangeRate, formatINR } from '@/lib/exchangeRate';
import { ExchangeRate } from '@/types';

export default function ExchangeRateDisplay() {
    const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const rate = await getExchangeRate();
                setExchangeRate(rate);
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRate();

        // Refresh every 10 minutes
        const interval = setInterval(fetchRate, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const formatLastUpdated = (date: Date) => {
        return new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
        }).format(date);
    };

    return (
        <div className="glass-card p-6 border-amber-500/20 animate-slideUp">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Currency icons */}
                    <div className="flex items-center -space-x-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-500/30 flex items-center justify-center">
                            <span className="text-emerald-400 font-bold text-sm">€</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/20 border-2 border-amber-500/30 flex items-center justify-center">
                            <span className="text-amber-400 font-bold text-sm">₹</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-slate-400 text-sm mb-1">EUR/INR Exchange Rate</p>
                        {loading ? (
                            <div className="h-8 bg-slate-700/30 rounded animate-pulse w-40" />
                        ) : exchangeRate ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">€1</span>
                                <span className="text-slate-500">=</span>
                                <span className="text-3xl font-bold gradient-text">₹{exchangeRate.rate.toFixed(2)}</span>
                            </div>
                        ) : (
                            <span className="text-slate-500">Unable to load rate</span>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium">Live</span>
                    </div>
                    {exchangeRate && (
                        <p className="text-xs text-slate-500 mt-2">
                            Updated {formatLastUpdated(exchangeRate.lastUpdated)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
