import { Transaction } from '@/types';

/**
 * Calculate total amount by transaction type
 */
export function calculateTotalByType(
    transactions: Transaction[],
    type: 'income' | 'expense' | 'savings'
): number {
    return transactions
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + t.amountEUR, 0);
}

/**
 * Calculate totals for income, expenses, and savings
 */
export function calculateTotals(transactions: Transaction[]) {
    return {
        income: calculateTotalByType(transactions, 'income'),
        expense: calculateTotalByType(transactions, 'expense'),
        savings: calculateTotalByType(transactions, 'savings')
    };
}

/**
 * Calculate spending by category with percentages
 */
export function calculateSpendingByCategory(transactions: Transaction[]): {
    category: string;
    amount: number;
    percentage: number;
    count: number;
}[] {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amountEUR, 0);

    const categoryMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach(t => {
        const current = categoryMap.get(t.category) || { amount: 0, count: 0 };
        categoryMap.set(t.category, {
            amount: current.amount + t.amountEUR,
            count: current.count + 1
        });
    });

    return Array.from(categoryMap.entries())
        .map(([category, data]) => ({
            category,
            amount: data.amount,
            percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
            count: data.count
        }))
        .sort((a, b) => b.amount - a.amount);
}

/**
 * Get transactions for current month
 */
export function getCurrentMonthTransactions(transactions: Transaction[]): Transaction[] {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions.filter(t => new Date(t.date) >= startOfMonth);
}

/**
 * Get transactions for previous month
 */
export function getPreviousMonthTransactions(transactions: Transaction[]): Transaction[] {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return transactions.filter(t => {
        const date = new Date(t.date);
        return date >= startOfLastMonth && date < startOfThisMonth;
    });
}

/**
 * Calculate month-over-month change
 */
export function calculateMonthOverMonthChange(
    current: Transaction[],
    previous: Transaction[]
): { amount: number; percentage: number; direction: 'up' | 'down' | 'same' } {
    const currentTotal = calculateTotalByType(current, 'expense');
    const previousTotal = calculateTotalByType(previous, 'expense');

    const difference = currentTotal - previousTotal;
    const percentage = previousTotal > 0 ? (difference / previousTotal) * 100 : 0;

    let direction: 'up' | 'down' | 'same' = 'same';
    if (difference > 0) direction = 'up';
    else if (difference < 0) direction = 'down';

    return {
        amount: difference,
        percentage: Math.abs(percentage),
        direction
    };
}

/**
 * Calculate daily average spending for current month
 */
export function calculateDailyAverage(transactions: Transaction[]): number {
    const currentMonth = getCurrentMonthTransactions(transactions);
    const now = new Date();
    const dayOfMonth = now.getDate(); // Days passed in current month

    const totalExpenses = calculateTotalByType(currentMonth, 'expense');

    return dayOfMonth > 0 ? totalExpenses / dayOfMonth : 0;
}

/**
 * Calculate weekly average spending
 */
export function calculateWeeklyAverage(transactions: Transaction[]): number {
    const currentMonth = getCurrentMonthTransactions(transactions);
    const now = new Date();
    const dayOfMonth = now.getDate();
    const weekNumber = Math.ceil(dayOfMonth / 7); // Approximate week number

    const totalExpenses = calculateTotalByType(currentMonth, 'expense');

    return weekNumber > 0 ? totalExpenses / weekNumber : 0;
}

/**
 * Project monthly spending based on current trend
 */
export function projectMonthlySpending(transactions: Transaction[]): number {
    const currentMonth = getCurrentMonthTransactions(transactions);
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const totalExpenses = calculateTotalByType(currentMonth, 'expense');

    // Project based on current daily average
    const dailyAverage = dayOfMonth > 0 ? totalExpenses / dayOfMonth : 0;
    return dailyAverage * daysInMonth;
}

/**
 * Calculate remaining budget
 */
export function calculateRemainingBudget(
    transactions: Transaction[],
    monthlyBudget: number
): { remaining: number; percentage: number; isOverBudget: boolean } {
    const currentMonth = getCurrentMonthTransactions(transactions);
    const spent = calculateTotalByType(currentMonth, 'expense');
    const remaining = monthlyBudget - spent;
    const percentage = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;

    return {
        remaining,
        percentage: Math.min(percentage, 100),
        isOverBudget: spent > monthlyBudget
    };
}

/**
 * Get spending trend (last 7 days vs previous 7 days)
 */
export function getSpendingTrend(transactions: Transaction[]): {
    currentWeek: number;
    previousWeek: number;
    change: number;
    direction: 'up' | 'down' | 'same';
} {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentWeek = transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= sevenDaysAgo && date <= now;
        })
        .reduce((sum, t) => sum + t.amountEUR, 0);

    const previousWeek = transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= fourteenDaysAgo && date < sevenDaysAgo;
        })
        .reduce((sum, t) => sum + t.amountEUR, 0);

    const difference = currentWeek - previousWeek;
    const change = previousWeek > 0 ? Math.abs((difference / previousWeek) * 100) : 0;

    let direction: 'up' | 'down' | 'same' = 'same';
    if (difference > 0) direction = 'up';
    else if (difference < 0) direction = 'down';

    return {
        currentWeek,
        previousWeek,
        change,
        direction
    };
}

/**
 * Get top spending categories
 */
export function getTopCategories(
    transactions: Transaction[],
    limit: number = 3
): { category: string; amount: number; percentage: number }[] {
    const byCategory = calculateSpendingByCategory(transactions);
    return byCategory.slice(0, limit).map(c => ({
        category: c.category,
        amount: c.amount,
        percentage: c.percentage
    }));
}

/**
 * Calculate net worth (income - expenses + savings)
 */
export function calculateNetPosition(transactions: Transaction[]): number {
    const totals = calculateTotals(transactions);
    return totals.income - totals.expense + totals.savings;
}

/**
 * Format currency with abbreviation (K, L, Cr for INR style)
 */
export function formatCompactEUR(amount: number): string {
    if (amount >= 1000) {
        return `€${(amount / 1000).toFixed(1)}K`;
    }
    return `€${amount.toFixed(2)}`;
}

/**
 * Format percentage with sign
 */
export function formatPercentageChange(percentage: number): string {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
}
