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
import { UserMinus, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

interface DeleteUserProps {
    userId: string;
    userName: string;
}

export default function DeleteUserButton({ userId, userName }: DeleteUserProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    const handleDeleteUser = async () => {
        setIsDeleting(true);
        
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            const json = await response.json();
            if (!response.ok) throw new Error(json.message || 'Failed to delete user');

            toast.success(`User ${userName} deleted successfully`);
            setOpen(false);
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || "Error deleting user");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full bg-red-50 border border-red-200 text-red-700 hover:text-red-800 hover:bg-red-100 px-3 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                    Delete User
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-[24px]">
                <DialogHeader>
                    {/* Visual Warning Indicator */}
                    <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-7 h-7 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold">Delete User Account?</DialogTitle>
                    <DialogDescription className="text-center px-2">
                        You are about to permanently delete <span className="font-bold text-slate-900">{userName}</span>. 
                        This action cannot be undone and will revoke all system access immediately.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setOpen(false)}
                        className="flex-1 rounded-xl border-slate-200"
                    >
                        Keep User
                    </Button>
                    <Button 
                        onClick={handleDeleteUser} 
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-100"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Confirm Delete"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}