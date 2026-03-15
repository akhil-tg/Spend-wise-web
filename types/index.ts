export interface User {
    uid: string;
    email: string;
    displayName: string;
    fullName: string;
    age?: number;
    dateOfBirth?: string;
    avatar?: string;
    createdAt: Date;
}

export interface Transaction {
    id: string;
    userId: string;
    type: 'expense' | 'income' | 'savings';
    category: string;
    date: string;
    amountEUR: number;
    amountINR: number;
    note: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ShoppingItem {
    id: string;
    name: string;
    unitPriceEUR: number;
    quantity: number;
    lineTotalEUR: number;
    lineTotalINR: number;
}

export interface ExchangeRate {
    rate: number;
    lastUpdated: Date;
}

export const EXPENSE_CATEGORIES = [
    'Food & Groceries',
    'Rent',
    'Utilities',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Other'
] as const;

export const INCOME_CATEGORIES = [
    'Salary',
    'Freelance',
    'Investment',
    'Gift',
    'Other'
] as const;

export const SAVINGS_CATEGORIES = [
    'Bank Savings',
    'Emergency Fund',
    'Investment',
    'Travel',
    'Other'
] as const;

export type TransactionType = 'expense' | 'income' | 'savings';
