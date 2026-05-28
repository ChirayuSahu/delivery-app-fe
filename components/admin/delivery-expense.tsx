'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DollarSign, Edit2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ExpenseData = {
    id: string;
    amount: number;
    notes: string;
    createdAt: string;
};

interface DeliveryExpenseProps {
    deliveryId: string;
    expenseAmount: number;
    expenses?: ExpenseData[];
    endedAt: string | null;
    onUpdate: () => void;
}

export default function DeliveryExpense({ deliveryId, expenseAmount, expenses, endedAt, onUpdate }: DeliveryExpenseProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState(expenseAmount.toString());
    const [notes, setNotes] = useState(expenses && expenses.length > 0 ? expenses[0].notes : '');
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            toast.error('Please enter a valid positive amount.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/deliveries/${deliveryId}/expense`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: parsedAmount, notes })
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            toast.success('Expense updated successfully');
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to update expense');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-900">
                    <div className="p-1.5 rounded-md border bg-slate-50 border-slate-200 text-slate-500">
                        <DollarSign className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold leading-none">Delivery Expenses</h3>
                </div>
                {!isEditing && !endedAt && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-slate-100" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-3 h-3 text-slate-500" />
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (₹)</label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-8 mt-1 text-xs"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Notes (Optional)</label>
                        <Input 
                            type="text" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)}
                            className="h-8 mt-1 text-xs"
                            placeholder="e.g. Tolls, fuel, etc."
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(false)} disabled={loading}>
                            <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                        <Button variant="default" size="sm" className="h-7 text-xs" onClick={handleSave} disabled={loading}>
                            {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                            Save
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-slate-900 leading-none">
                            ₹{expenseAmount.toFixed(2)}
                        </span>
                        <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Total</span>
                    </div>
                    
                    {expenses && expenses.length > 0 && expenses[0].notes && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="font-semibold block mb-1">Notes:</span>
                            {expenses[0].notes}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
