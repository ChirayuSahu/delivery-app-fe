'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Fingerprint, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export default function CreateUserButton() {
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [viewPassword, setViewPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        esId: ''
    });

    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const json = await response.json();
            if (!response.ok) throw new Error(json.message || 'Failed to create user');

            toast.success('User account created successfully');
            setOpen(false);
            setFormData({ name: '', email: '', password: '', phone: '', esId: '' });
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Error creating user");
        } finally {
            setIsCreating(false);
        }
    };

    const validateForm = () => {
        return formData.name && formData.email && formData.password && formData.phone.length === 10 && formData.esId;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700 shadow-sm">
                    <UserPlus className="w-4 h-4" />
                    Add New User
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25 rounded-lg">
                <form onSubmit={handleCreateUser}>
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-2">
                            <UserPlus className="w-6 h-6 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-xl font-bold">New User Account</DialogTitle>
                        <DialogDescription className="text-center">
                            Set up credentials and details for a new employee.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-6">
                        {/* Name Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-500 ml-1">Full Name</Label>
                            <Input 
                                id="name" name="name" placeholder="John Doe" 
                                value={formData.name} onChange={handleInputChange} required 
                                className="rounded-lg border-slate-200 focus:ring-green-500"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500 ml-1">Email Address</Label>
                            <Input 
                                id="email" name="email" type="email" placeholder="john@rajeshpharma.com" 
                                value={formData.email} onChange={handleInputChange} required 
                                className="rounded-lg border-slate-200"
                            />
                        </div>

                        {/* Password Field with Toggle */}
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-500 ml-1">Password</Label>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type={viewPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    value={formData.password} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="rounded-lg border-slate-200 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setViewPassword(!viewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {viewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Two-Column Phone & ES ID */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="text-xs font-bold uppercase text-slate-500 ml-1">Phone</Label>
                                <Input 
                                    id="phone" name="phone" placeholder="98765..." 
                                    value={formData.phone} onChange={handleInputChange} required 
                                    className="rounded-lg border-slate-200"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="esId" className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                                    <Fingerprint className="w-3 h-3 text-green-600" /> ES ID
                                </Label>
                                <Input 
                                    id="esId" name="esId" placeholder="ES123" 
                                    value={formData.esId} onChange={handleInputChange} required 
                                    className="rounded-lg border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row gap-3 sm:justify-center">
                        <Button 
                            type="button"
                            variant="ghost" 
                            onClick={() => setOpen(false)}
                            className="flex-1 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isCreating || !validateForm()}
                            className="flex-1 bg-green-600 hover:bg-green-700 rounded-lg font-bold shadow-md shadow-green-100"
                        >
                            {isCreating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}