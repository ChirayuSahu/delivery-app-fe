'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DollarSign, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type ExpenseData = {
    id: string;
    amount: number;
    notes: string;
    createdAt: string;
};

interface InvoiceExpenseDialogProps {
    deliveryId: string;
    invType: string;
    invNo: string;
    expenseAmount: number;
    expenses?: ExpenseData[];
    endedAt: string | null;
    onUpdate: () => void;
}

export default function InvoiceExpenseDialog({ deliveryId, invType, invNo, expenseAmount, expenses, endedAt, onUpdate }: InvoiceExpenseDialogProps) {
    const [open, setOpen] = useState(false);
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
            const res = await fetch(`/api/deliveries/${deliveryId}/invoices/${invType}${invNo}/expense`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: parsedAmount, notes })
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            toast.success('Invoice expense updated successfully');
            setOpen(false);
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[10px] px-2 font-bold uppercase gap-1"
                >
                    <DollarSign className="w-3 h-3 text-green-600" />
                    {expenseAmount > 0 ? `₹${expenseAmount}` : 'Add Expense'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md border bg-slate-50 border-slate-200 text-slate-500">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        Invoice Expense
                    </DialogTitle>
                    <DialogDescription>
                        Manage expenses for Invoice {invType}/{invNo}.
                        {endedAt && <span className="block mt-1 text-red-500">This delivery is completed. Expenses cannot be changed.</span>}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase">Amount (₹)</label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1"
                            placeholder="0.00"
                            disabled={!!endedAt}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase">Notes (Optional)</label>
                        <Input 
                            type="text" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1"
                            placeholder="e.g. Tolls, fuel, etc."
                            disabled={!!endedAt}
                        />
                    </div>
                </div>

                {!endedAt && (
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            <X className="w-4 h-4 mr-1.5" /> Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                            Save Expense
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
