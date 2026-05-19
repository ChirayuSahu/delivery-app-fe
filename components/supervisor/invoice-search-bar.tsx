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
            router.push(`/dashboard/supervisor/invoice/${encodeURIComponent(searchTerm)}`);
        }
    };

    const isValidSearchTerm = (term: string) => {
        return term.match(/^([A-Z]{2})(\d+)$/);
    }

    return (
        <div className="w-full space-y-3">
            {/* Header / Label */}
            <div className="flex items-center gap-2 px-1">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <h2 className="text-xs font-semibold text-slate-900">
                    Invoice Status
                </h2>
            </div>

            {/* Search Bar */}
            <motion.form
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSearch}
                className="flex gap-2"
            >
                <div className="relative flex-1">
                    <Input
                        type="search"
                        value={searchTerm}
                        placeholder="Enter Invoice No. (e.g. SB21602)"
                        className="w-full h-10 text-xs pl-9 bg-white border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-slate-300 transition-all rounded-lg"
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                <Button
                    type="submit"
                    disabled={!isValidSearchTerm(searchTerm)}
                    className="h-10 text-xs font-semibold shadow-none transition-colors bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 rounded-lg px-4"
                >
                    Search
                </Button>
            </motion.form>
        </div>
    );
};

export default InvoiceStatusSearch;