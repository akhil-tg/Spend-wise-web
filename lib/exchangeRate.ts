import { ExchangeRate } from '@/types';

const CACHE_KEY = 'spendwise_eur_inr_rate';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

interface CachedRate {
    rate: number;
    timestamp: number;
}

export async function getExchangeRate(): Promise<ExchangeRate> {
    // Check localStorage cache first
    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed: CachedRate = JSON.parse(cached);
            const now = Date.now();
            if (now - parsed.timestamp < CACHE_DURATION) {
                return {
                    rate: parsed.rate,
                    lastUpdated: new Date(parsed.timestamp)
                };
            }
        }
    }

    try {
        // Use Frankfurter API (free, no key required)
        const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=INR');

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rate');
        }

        const data = await response.json();
        const rate = data.rates.INR;

        // Cache the result
        if (typeof window !== 'undefined') {
            const cacheData: CachedRate = {
                rate,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        }

        return {
            rate,
            lastUpdated: new Date()
        };
    } catch (error) {
        console.error('Error fetching exchange rate:', error);

        // Return cached rate if available, otherwise return default
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed: CachedRate = JSON.parse(cached);
                return {
                    rate: parsed.rate,
                    lastUpdated: new Date(parsed.timestamp)
                };
            }
        }

        // Default fallback rate (approximate)
        return {
            rate: 90.5,
            lastUpdated: new Date()
        };
    }
}

export function convertEURtoINR(amountEUR: number, rate: number): number {
    return Math.round(amountEUR * rate * 100) / 100;
}

export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

export function formatEUR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
