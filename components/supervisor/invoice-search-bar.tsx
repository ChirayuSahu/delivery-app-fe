'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import the router
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const InvoiceSearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent page reload
        
        if (searchTerm.trim()) {
            router.push(`/dashboard/supervisor/invoice/${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex gap-2">
            <Input
                type="search"
                value={searchTerm}
                placeholder="Search Invoice"
                className="w-full bg-white border-gray-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className='bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 shadow-xs' type="submit">Search</Button>
        </form>
    );
}

export default InvoiceSearchBar;