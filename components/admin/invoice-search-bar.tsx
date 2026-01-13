'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, Info } from 'lucide-react';

const InvoiceStatusSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValidSearchTerm(searchTerm)) {
            router.push(`/dashboard/admin/invoice/${encodeURIComponent(searchTerm)}`);
        }
    };

    // Regex to match your pattern (e.g., SB21602)
    const isValidSearchTerm = (term: string) => {
        return term.match(/^([A-Z]{2})(\d+)$/);
    }

    return (
        <div className="w-full space-y-4">
            {/* Header / Label */}
            <div className="flex items-center gap-2 px-1">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                    Invoice Status
                </h2>
            </div>

            {/* Search Bar */}
            <motion.form
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSearch}
                className="flex gap-2"
            >
                <div className="relative flex-1">
                    <Input
                        type="search"
                        value={searchTerm}
                        placeholder="Enter Invoice No. (e.g. SB21602)"
                        className="w-full h-12 pl-10 bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all rounded-xl"
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                <Button
                    type="submit"
                    disabled={!isValidSearchTerm(searchTerm)}
                    className="h-12 px-6 font-bold shadow-sm transition-all active:scale-95 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 rounded-xl"
                >
                    Search
                </Button>
            </motion.form>

            <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-widest">
                Search verified records
            </p>
        </div>
    );
};

export default InvoiceStatusSearch;