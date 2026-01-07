'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    RefreshCw,
    Sparkles,
    CheckCircle,
    Store,
    Truck,
    ArrowRight,
    DollarSign,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface GroceryItem {
    id: string;
    name: string;
    category: string;
    estimatedPrice: number;
    quantity: number;
    inCart: boolean;
}

interface StorePricing {
    store: string;
    totalPrice: number;
    savings: number;
    deliveryFee: number;
    estimatedDelivery: string;
}

const mockItems: GroceryItem[] = [
    { id: '1', name: 'Milk (1 gallon)', category: 'Dairy', estimatedPrice: 4.99, quantity: 1, inCart: true },
    { id: '2', name: 'Bread (Whole Wheat)', category: 'Bakery', estimatedPrice: 3.49, quantity: 1, inCart: true },
    { id: '3', name: 'Eggs (dozen)', category: 'Dairy', estimatedPrice: 4.99, quantity: 1, inCart: true },
    { id: '4', name: 'Bananas (bunch)', category: 'Produce', estimatedPrice: 1.99, quantity: 1, inCart: true },
    { id: '5', name: 'Chicken Breast (2 lb)', category: 'Meat', estimatedPrice: 12.99, quantity: 2, inCart: true },
    { id: '6', name: 'Greek Yogurt', category: 'Dairy', estimatedPrice: 5.49, quantity: 1, inCart: true },
    { id: '7', name: 'Spinach (bag)', category: 'Produce', estimatedPrice: 3.99, quantity: 1, inCart: true },
    { id: '8', name: 'Rice (2 lb)', category: 'Pantry', estimatedPrice: 3.99, quantity: 1, inCart: false },
    { id: '9', name: 'Pasta Sauce', category: 'Pantry', estimatedPrice: 4.29, quantity: 1, inCart: false },
    { id: '10', name: 'Cereal', category: 'Pantry', estimatedPrice: 4.99, quantity: 1, inCart: false },
];

const storeOptions: StorePricing[] = [
    { store: 'Walmart', totalPrice: 0, savings: 0, deliveryFee: 0, estimatedDelivery: 'Today, 2-4 PM' },
    { store: 'Instacart (Kroger)', totalPrice: 0, savings: 0, deliveryFee: 3.99, estimatedDelivery: 'Today, 1-3 PM' },
    { store: 'Amazon Fresh', totalPrice: 0, savings: 0, deliveryFee: 0, estimatedDelivery: 'Tomorrow, 8 AM' },
];

export default function GroceryPage() {
    const [items, setItems] = useState<GroceryItem[]>([]);
    const [stores, setStores] = useState<StorePricing[]>(storeOptions);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedStore, setSelectedStore] = useState<string | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    const cartItems = items.filter(i => i.inCart);
    const subtotal = cartItems.reduce((sum, i) => sum + i.estimatedPrice * i.quantity, 0);

    const generateList = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/grocery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate' }),
            });
            const data = await response.json();
            if (data.items) {
                setItems(data.items.map((item: any) => ({ ...item, inCart: true })));
            }
            if (data.stores) {
                setStores(data.stores);
            }
        } catch (error) {
            console.error('Failed to generate grocery list:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleItem = (id: string) => {
        setItems(items.map(i => i.id === id ? { ...i, inCart: !i.inCart } : i));
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems(items.map(i => {
            if (i.id === id) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6 text-green-400" />
                        Smart Grocery List
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        AI-generated based on your purchase history
                    </p>
                </div>
                <Button onClick={generateList} disabled={isGenerating} className="gap-2">
                    {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    {isGenerating ? 'Analyzing...' : 'Regenerate List'}
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Group by category */}
                    {['Dairy', 'Produce', 'Meat', 'Bakery', 'Pantry'].map(category => {
                        const categoryItems = items.filter(i => i.category === category);
                        if (categoryItems.length === 0) return null;

                        return (
                            <Card key={category} className="overflow-hidden">
                                <div className="p-4 border-b border-white/[0.04] bg-white/[0.01]">
                                    <h3 className="font-medium text-sm text-slate-400">{category}</h3>
                                </div>
                                <div className="divide-y divide-white/[0.04]">
                                    {categoryItems.map(item => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            className={`flex items-center gap-4 p-4 transition-colors ${item.inCart ? '' : 'opacity-50'
                                                }`}
                                        >
                                            <button
                                                onClick={() => toggleItem(item.id)}
                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${item.inCart
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-white/20'
                                                    }`}
                                            >
                                                {item.inCart && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                            </button>

                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    ${item.estimatedPrice.toFixed(2)} each
                                                </p>
                                            </div>

                                            {item.inCart && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="p-1 rounded-lg hover:bg-white/[0.04] text-slate-400"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-6 text-center font-mono">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="p-1 rounded-lg hover:bg-white/[0.04] text-slate-400"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}

                                            <p className="font-semibold font-mono w-16 text-right">
                                                ${(item.estimatedPrice * item.quantity).toFixed(2)}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Order Panel */}
                <div className="space-y-4">
                    {/* Summary Card */}
                    <Card className="p-5">
                        <h3 className="font-semibold mb-4">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Items ({cartItems.length})</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Est. Tax</span>
                                <span>${(subtotal * 0.07).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-white/[0.06]">
                                <span>Total</span>
                                <span className="text-emerald-400">${(subtotal * 1.07).toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Store Comparison */}
                    <Card className="p-5">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Store className="w-4 h-4 text-blue-400" />
                            Compare Prices
                        </h3>
                        <div className="space-y-3">
                            {stores.map((store, index) => (
                                <button
                                    key={store.store}
                                    onClick={() => setSelectedStore(store.store)}
                                    className={`w-full p-3 rounded-xl border transition-all text-left ${selectedStore === store.store
                                        ? 'border-emerald-500/50 bg-emerald-500/5'
                                        : 'border-white/[0.06] hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">{store.store}</span>
                                        {index === 0 && (
                                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                Best Price
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">{store.estimatedDelivery}</span>
                                        <span className="font-semibold">${store.totalPrice.toFixed(2)}</span>
                                    </div>
                                    {store.savings > 0 && (
                                        <p className="text-xs text-emerald-400 mt-1">
                                            Save ${store.savings.toFixed(2)}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Order Button */}
                    <Button
                        onClick={() => setShowOrderModal(true)}
                        disabled={!selectedStore || cartItems.length === 0}
                        className="w-full gap-2"
                    >
                        <Truck className="w-4 h-4" />
                        Order from {selectedStore || 'Select Store'}
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Order Confirmation Modal */}
            {showOrderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
                    <Card className="relative z-10 w-full max-w-md p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Ready to Order!</h2>
                        <p className="text-slate-400 mb-6">
                            You'll be redirected to {selectedStore} to complete your order of {cartItems.length} items.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setShowOrderModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={() => setShowOrderModal(false)} className="flex-1">
                                Continue to {selectedStore?.split(' ')[0]}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
