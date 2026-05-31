'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    Loader2,
    Users,
    Search,
    Phone,
    UserCircle,
    Clock,
    Fingerprint,
    ScanFace,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface PersonInfo {
    personId: string;
    groupId: string;
    firstName: string;
    lastName: string;
    gender: number;
    phone: string;
    email: string;
    personCode: string;
    description: string;
    startDate: number;
    endDate: number;
    headPicUrl: string;
}

interface Person {
    personInfo: PersonInfo;
    pinCode: string;
}

type SortField = 'name' | 'phone' | 'personCode';
type SortOrder = 'asc' | 'desc';

export default function AttendancePage() {
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    useEffect(() => {
        async function fetchPersons() {
            try {
                const res = await fetch('/api/hik/persons');
                const json = await res.json();
                if (json.success && json.data?.personList) {
                    setPersons(json.data.personList);
                }
            } catch (err) {
                console.error('Failed to fetch persons:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchPersons();
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField === field) {
            return sortOrder === 'asc' ? (
                <ArrowUp className="h-3 w-3 text-slate-600" />
            ) : (
                <ArrowDown className="h-3 w-3 text-slate-600" />
            );
        }
        return <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />;
    };

    const filteredAndSortedPersons = useMemo(() => {
        let result = persons.filter((p) => {
            const fullName = `${p.personInfo.firstName} ${p.personInfo.lastName}`.toLowerCase();
            const query = searchQuery.toLowerCase();
            return (
                fullName.includes(query) ||
                p.personInfo.phone.includes(query) ||
                p.personInfo.personCode.includes(query)
            );
        });

        if (sortField) {
            result = [...result].sort((a, b) => {
                let valA: string;
                let valB: string;

                switch (sortField) {
                    case 'name':
                        valA = `${a.personInfo.firstName} ${a.personInfo.lastName}`.toLowerCase();
                        valB = `${b.personInfo.firstName} ${b.personInfo.lastName}`.toLowerCase();
                        break;
                    case 'phone':
                        valA = a.personInfo.phone;
                        valB = b.personInfo.phone;
                        break;
                    case 'personCode':
                        valA = a.personInfo.personCode;
                        valB = b.personInfo.personCode;
                        break;
                    default:
                        return 0;
                }

                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [persons, searchQuery, sortField, sortOrder]);

    const getInitials = (first: string, last: string) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    const formatPhone = (phone: string) => {
        // "91-6263850630" → "+91 6263850630"
        if (phone.includes('-')) {
            const [code, number] = phone.split('-');
            return `+${code} ${number}`;
        }
        return phone;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 lg:p-10">
                {/* Header Card */}
                <div
                    className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm shadow-green-100/50"
                >
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
                            <ScanFace className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">
                                Staff Attendance
                            </h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                View all registered staff members from HikConnect.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                >
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 transition-all"
                        />
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shrink-0 self-start sm:self-auto">
                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                        <span className="text-[11px] font-semibold text-slate-600">
                            {filteredAndSortedPersons.length}{' '}
                            {filteredAndSortedPersons.length === 1 ? 'person' : 'persons'}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div
                    className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden"
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                            <span className="text-xs font-medium text-slate-400">
                                Loading staff members...
                            </span>
                        </div>
                    ) : filteredAndSortedPersons.length > 0 ? (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                                            <th className="py-3 px-5 font-semibold">Person</th>
                                            <th
                                                onClick={() => handleSort('phone')}
                                                className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-1">
                                                    Phone
                                                    <SortIcon field="phone" />
                                                </div>
                                            </th>
                                            <th
                                                onClick={() => handleSort('personCode')}
                                                className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-1">
                                                    Person Code
                                                    <SortIcon field="personCode" />
                                                </div>
                                            </th>
                                            <th className="py-3 px-5 font-semibold">
                                                Work Time
                                            </th>
                                            <th className="py-3 px-5 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody
                                        className="divide-y divide-slate-100 text-slate-700 text-xs"
                                    >
                                        {filteredAndSortedPersons.map((person) => {
                                            const { personInfo } = person;
                                            const fullName = `${personInfo.firstName} ${personInfo.lastName}`;
                                            const isActive =
                                                Date.now() >= personInfo.startDate &&
                                                Date.now() <= personInfo.endDate;

                                            return (
                                                <tr
                                                    key={personInfo.personId}
                                                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                                    onClick={() => window.location.href = `/dashboard/admin/attendance/${personInfo.personCode}`}
                                                >
                                                    {/* Person */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-3">
                                                            {personInfo.headPicUrl ? (
                                                                <img
                                                                    src={personInfo.headPicUrl}
                                                                    alt={fullName}
                                                                    className="h-12 w-12 rounded-lg object-cover border border-slate-100 bg-slate-50"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        const fallback = target.nextElementSibling as HTMLElement;
                                                                        if (fallback) fallback.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div
                                                                className={`h-12 w-12 rounded-lg bg-green-50 border border-green-100 items-center justify-center text-green-700 font-bold text-sm shrink-0 ${personInfo.headPicUrl ? 'hidden' : 'flex'}`}
                                                            >
                                                                {getInitials(personInfo.firstName, personInfo.lastName)}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-slate-900 leading-normal">
                                                                    {fullName}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                    {personInfo.gender === 1 ? 'Male' : 'Female'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Phone */}
                                                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                            {formatPhone(personInfo.phone)}
                                                        </div>
                                                    </td>

                                                    {/* Person Code */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                                                            <span className="font-mono text-xs font-semibold text-slate-600">
                                                                {personInfo.personCode}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Work Time (placeholder for future) */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5 text-slate-300" />
                                                            <span className="text-[11px] text-slate-400 italic font-medium">
                                                                —
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center justify-between">
                                                            {isActive ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                                                                    <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                                                                    <span className="h-1 w-1 bg-slate-400 rounded-full" />
                                                                    Inactive
                                                                </span>
                                                            )}
                                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards View */}
                            <div className="md:hidden flex flex-col gap-3 p-3 bg-white">
                                {filteredAndSortedPersons.map((person) => {
                                    const { personInfo } = person;
                                    const fullName = `${personInfo.firstName} ${personInfo.lastName}`;
                                    const isActive =
                                        Date.now() >= personInfo.startDate &&
                                        Date.now() <= personInfo.endDate;

                                    return (
                                        <div
                                            key={personInfo.personId}
                                            onClick={() => window.location.href = `/dashboard/admin/attendance/${personInfo.personCode}`}
                                            className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl hover:border-green-200 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {personInfo.headPicUrl ? (
                                                        <img
                                                            src={personInfo.headPicUrl}
                                                            alt={fullName}
                                                            className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                const fallback = target.nextElementSibling as HTMLElement;
                                                                if (fallback) fallback.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className={`h-12 w-12 rounded-xl bg-green-50 border border-green-100 items-center justify-center text-green-700 font-bold text-lg shrink-0 shadow-sm ${personInfo.headPicUrl ? 'hidden' : 'flex'}`}
                                                    >
                                                        {getInitials(personInfo.firstName, personInfo.lastName)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                                                            {fullName}
                                                        </h3>
                                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                                                            {personInfo.gender === 1 ? 'Male' : 'Female'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                                                        <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                                                        <span className="h-1 w-1 bg-slate-400 rounded-full" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                    <Phone className="h-4 w-4 text-slate-400" />
                                                    <span className="text-xs font-semibold text-slate-600">{formatPhone(personInfo.phone)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                    <Fingerprint className="h-4 w-4 text-slate-400" />
                                                    <span className="text-xs font-mono font-semibold text-slate-600">{personInfo.personCode}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                                <Users className="h-6 w-6" />
                            </div>
                            <h4 className="text-slate-900 font-semibold text-sm">
                                No persons found
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs">
                                {searchQuery
                                    ? 'Try adjusting your search query.'
                                    : 'No staff members are registered in HikConnect.'}
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center text-slate-400 text-xs font-medium mt-4">
                    Data synced from HikConnect access control system.
                </p>
            </div>
        </div>
    );
}
