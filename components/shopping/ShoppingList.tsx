'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ShoppingItem } from '@/types';
import { getExchangeRate, convertEURtoINR, formatEUR, formatINR } from '@/lib/exchangeRate';
import { generateId, getToday } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

export default function ShoppingList() {
    const { user } = useAuth();
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [exchangeRate, setExchangeRate] = useState<number>(90.5);
    const [loading, setLoading] = useState(false);
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

    // Load items from localStorage on mount
    useEffect(() => {
        const savedItems = localStorage.getItem('shoppingList');
        if (savedItems) {
            try {
                setItems(JSON.parse(savedItems));
            } catch (e) {
                console.error('Failed to parse saved items:', e);
            }
        }
    }, []);

    // Save items to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('shoppingList', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        const fetchRate = async () => {
            const rate = await getExchangeRate();
            setExchangeRate(rate.rate);
        };
        fetchRate();
    }, []);

    const addItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        const newItem: ShoppingItem = {
            id: generateId(),
            name: newItemName.trim(),
            unitPriceEUR: 0,
            quantity: 0,
            lineTotalEUR: 0,
            lineTotalINR: 0
        };

        setItems([...items, newItem]);
        setNewItemName('');
    };

    const updateItem = (id: string, field: keyof ShoppingItem, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };

                // Recalculate totals
                if (field === 'unitPriceEUR' || field === 'quantity') {
                    updated.lineTotalEUR = updated.unitPriceEUR * updated.quantity;
                    updated.lineTotalINR = convertEURtoINR(updated.lineTotalEUR, exchangeRate);
                }

                return updated;
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const getTotal = () => {
        return items.reduce((acc, item) => acc + item.lineTotalEUR, 0);
    };

    const getTotalINR = () => {
        return items.reduce((acc, item) => acc + item.lineTotalINR, 0);
    };

    const handleCheckout = async () => {
        if (!user || getTotal() === 0) return;

        setLoading(true);
        try {
            // Create a single expense entry for all items
            const itemDetails = items
                .filter(item => item.unitPriceEUR > 0)
                .map(item => `${item.name} (${item.quantity} × ${formatEUR(item.unitPriceEUR)})`)
                .join(', ');

            const { error } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    type: 'expense',
                    category: 'Shopping',
                    date: getToday(),
                    amount_eur: getTotal(),
                    amount_inr: getTotalINR(),
                    note: itemDetails || 'Shopping expense'
                });

            if (error) throw error;

            // Clear the shopping list
            setItems([]);
            setCheckoutSuccess(true);
        } catch (error) {
            console.error('Error during checkout:', error);
        } finally {
            setLoading(false);
        }
    };

    if (checkoutSuccess) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Checkout Complete!</h3>
                <p className="text-slate-400 mb-6">Your shopping expenses have been logged</p>
                <Button onClick={() => setCheckoutSuccess(false)}>
                    Add More Items
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Add Item Form */}
            <Card>
                <form onSubmit={addItem} className="flex gap-3">
                    <Input
                        placeholder="Enter item name (e.g., Milk, Rice)"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!newItemName.trim()}>
                        Add
                    </Button>
                </form>
            </Card>

            {/* Shopping List */}
            {items.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium">Your shopping list is empty</p>
                        <p className="text-sm">Add items to start tracking</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <Card key={item.id} className="group">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Item Name */}
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        className="w-full bg-transparent text-white font-medium border-b border-transparent focus:border-emerald-500 focus:outline-none pb-1"
                                        placeholder="Item name"
                                    />
                                </div>

                                {/* Price & Quantity */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-sm">€</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={item.unitPriceEUR || ''}
                                            onChange={(e) => updateItem(item.id, 'unitPriceEUR', parseFloat(e.target.value) || 0)}
                                            className="w-20 px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <span className="text-slate-400">×</span>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className="w-14 px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {/* Line Total */}
                                    <div className="min-w-[100px] text-right">
                                        <div className="text-white font-medium">
                                            {formatEUR(item.lineTotalEUR)}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {formatINR(item.lineTotalINR)}
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Total & Checkout */}
            {items.length > 0 && (
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-slate-400 text-sm">Total</p>
                            <div className="text-2xl font-bold text-white">{formatEUR(getTotal())}</div>
                            <div className="text-sm text-emerald-400">{formatINR(getTotalINR())}</div>
                        </div>
                        <Button
                            onClick={() => setCheckoutModalOpen(true)}
                            disabled={getTotal() === 0}
                            className="w-full sm:w-auto"
                        >
                            Check out and Log
                        </Button>
                    </div>
                </Card>
            )}

            {/* Checkout Confirmation Modal */}
            <Modal
                isOpen={checkoutModalOpen}
                onClose={() => setCheckoutModalOpen(false)}
                title="Confirm Checkout"
            >
                <div className="space-y-4">
                    <p className="text-slate-300">
                        This will log the following expense to your transaction history:
                    </p>

                    <div className="bg-slate-700/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                        {items.filter(i => i.unitPriceEUR > 0).map(item => (
                            <div key={item.id} className="flex justify-between py-2 border-b border-slate-600/50 last:border-0">
                                <span className="text-white">{item.name} × {item.quantity}</span>
                                <span className="text-slate-300">{formatEUR(item.lineTotalEUR)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-600">
                        <span className="text-white font-medium">Total</span>
                        <div className="text-right">
                            <div className="text-xl font-bold text-white">{formatEUR(getTotal())}</div>
                            <div className="text-sm text-emerald-400">{formatINR(getTotalINR())}</div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setCheckoutModalOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCheckout}
                            disabled={loading || getTotal() === 0}
                            className="flex-1"
                        >
                            {loading ? 'Processing...' : 'Confirm & Log'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
