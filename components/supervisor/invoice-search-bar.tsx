'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchMode = 'status' | 'track';

const InvoiceSearchContainer = () => {
    const [mode, setMode] = useState<SearchMode>('status');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const config = {
        status: {
            placeholder: "Enter Invoice No. for Status...",
            redirect: (id: string) => `/dashboard/supervisor/invoice/${id}`,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200"
        },
        track: {
            placeholder: "Enter Invoice No. to Track...",
            redirect: (id: string) => `/dashboard/supervisor/invoice/track/${id}`,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200"
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            const url = config[mode].redirect(encodeURIComponent(searchTerm));
            router.push(url);
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Toggle Buttons */}
            <div className="flex p-1 bg-slate-100 rounded-xl relative">
                {(['status', 'track'] as SearchMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => {
                            setMode(m);
                            setSearchTerm(''); // Clear on switch
                        }}
                        className={cn(
                            "relative flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors z-10",
                            mode === m ? "text-slate-900" : "text-slate-500"
                        )}
                    >
                        {m === 'status' ? <Info className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        <span className="capitalize">{m === 'status' ? 'Invoice Status' : 'Track Invoice'}</span>

                        {mode === m && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Search Bar with Animation */}
            <AnimatePresence mode="wait">
                <motion.form
                    key={mode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSearch}
                    className="flex gap-2"
                >
                    <div className="relative flex-1">
                        <Input
                            type="search"
                            value={searchTerm}
                            placeholder={config[mode].placeholder}
                            className="w-full h-12 pl-10 bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-offset-0 focus:ring-slate-200 transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    <Button
                        type="submit"
                        className={cn(
                            "h-12 px-6 font-bold shadow-sm transition-all active:scale-95",
                            config[mode].bg,
                            config[mode].color,
                            config[mode].border,
                            "hover:brightness-95 border"
                        )}
                    >
                        Search
                    </Button>
                </motion.form>
            </AnimatePresence>

            <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-widest">
                Currently searching by <span className="font-bold text-slate-600">{mode}</span>
            </p>
        </div>
    );
};

export default InvoiceSearchContainer;