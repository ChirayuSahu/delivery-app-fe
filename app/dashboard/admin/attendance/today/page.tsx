'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    Loader2,
    Search,
    CalendarDays,
    Users,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Fingerprint,
    Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export interface AttendanceRecord {
    personName: string;
    personCode: string;
    status: string;
    image?: string;
    checkIn?: string | null;
    checkOut?: string | null;
}

type SortField = 'personName' | 'personCode' | 'status' | 'checkIn' | 'checkOut';
type SortOrder = 'asc' | 'desc';

import { Suspense } from 'react';

function formatTime(timeStr?: string | null) {
    if (!timeStr) return '--:--';
    const [h, m] = timeStr.split(':');
    if (!h || !m) return timeStr;
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${m} ${ampm}`;
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Present') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100 h-fit whitespace-nowrap">
                <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                {status}
            </span>
        );
    }
    if (status === 'Absent') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100 h-fit whitespace-nowrap">
                <span className="h-1 w-1 bg-red-500 rounded-full" />
                {status}
            </span>
        );
    }
    if (status === 'Present - CO only' || status === 'Present - CI only') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-100 h-fit whitespace-nowrap">
                <span className="h-1 w-1 bg-orange-500 rounded-full" />
                {status}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200 h-fit whitespace-nowrap">
            <span className="h-1 w-1 bg-slate-500 rounded-full" />
            {status}
        </span>
    );
}

function TodayAttendanceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Present' | 'Absent'>('All');
    const [sortField, setSortField] = useState<SortField | null>('checkIn');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    
    // Initialize date from URL if present
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            const parsed = new Date(dateParam);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        return new Date();
    });

    const [downloadingReport, setDownloadingReport] = useState(false);

    const downloadReport = async () => {
        setDownloadingReport(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const url = `/api/hik/attendance/report?date=${dateStr}`;
            
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to generate report");
            
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            
            // Try to parse filename from content-disposition header if available
            const disposition = res.headers.get('content-disposition');
            let filename = `attendance-report-${dateStr}.xlsx`;
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
            
            toast.success("Report generated successfully");
        } catch (error: any) {
            console.error("Download error:", error);
            toast.error(error.message || "Failed to generate report");
        } finally {
            setDownloadingReport(false);
        }
    };

    useEffect(() => {
        async function fetchTodayData() {
            setLoading(true);
            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const query = new URLSearchParams({
                    date: dateStr,
                });
                
                const res = await fetch(`/api/hik/attendance/today?${query.toString()}`);
                const json = await res.json();
                
                const fetchedRecords = json.data || [];
                if (Array.isArray(fetchedRecords)) {
                    setRecords(fetchedRecords);
                } else {
                    setRecords([]);
                }
            } catch (err) {
                console.error('Failed to fetch today attendance:', err);
                setRecords([]);
            } finally {
                setLoading(false);
            }
        }
        fetchTodayData();
    }, [selectedDate]);

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

    const filteredAndSortedRecords = useMemo(() => {
        let result = records.filter((r) => {
            if (filterStatus !== 'All') {
                if (filterStatus === 'Present' && !r.status?.startsWith('Present')) return false;
                if (filterStatus === 'Absent' && r.status !== 'Absent') return false;
            }
            const name = (r.personName || '').toLowerCase();
            const query = searchQuery.toLowerCase();
            return name.includes(query) || (r.personCode || '').includes(query);
        });

        if (sortField) {
            result = [...result].sort((a, b) => {
                let valA = String(a[sortField] || '').toLowerCase();
                let valB = String(b[sortField] || '').toLowerCase();

                // Push empty values (absent records) to the bottom regardless of sort order
                if ((sortField === 'checkIn' || sortField === 'checkOut') && valA !== valB) {
                    if (!valA) return 1;
                    if (!valB) return -1;
                }

                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [records, searchQuery, filterStatus, sortField, sortOrder]);

    const activeCount = records.filter(r => r.status?.startsWith('Present')).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 lg:p-10">
                
                {/* Header Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center text-green-600 shadow-sm">
                            <CalendarDays className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Daily Attendance
                            </h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                {format(selectedDate, 'EEEE, MMMM do, yyyy')} • {activeCount} staff present
                            </p>
                        </div>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute -right-12 -top-12 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 transition-all"
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        {/* Filter Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 overflow-x-auto">
                            {['All', 'Present', 'Absent'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status as any)}
                                    className={`px-4 py-2 sm:py-1.5 text-xs font-bold rounded-md transition-all flex-1 sm:flex-none text-center ${filterStatus === status ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-start text-left font-semibold w-full sm:w-[220px] border-slate-200 hover:bg-slate-50 h-[42px]"
                                >
                                    <CalendarDays className="mr-2 h-4 w-4 text-slate-500" />
                                    {format(selectedDate, 'MMMM d, yyyy')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedDate(date);
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.set('date', format(date, 'yyyy-MM-dd'));
                                            router.push(`?${params.toString()}`);
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Generate Report Button */}
                        <Button
                            onClick={downloadReport}
                            disabled={downloadingReport}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold h-[42px] px-4 rounded-lg shadow-sm"
                        >
                            {downloadingReport ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Generate Report
                        </Button>

                        {/* Count Badge */}
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 h-[42px] rounded-lg border border-slate-100 shrink-0 hidden sm:flex">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                            <span className="text-[11px] font-semibold text-slate-600">
                                {filteredAndSortedRecords.length} Records
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                            <span className="text-xs font-medium text-slate-400">Loading today's attendance...</span>
                        </div>
                    ) : filteredAndSortedRecords.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                                            <th
                                                onClick={() => handleSort('personName')}
                                                className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-1">
                                                    Staff Member
                                                    <SortIcon field="personName" />
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
                                            <th
                                                onClick={() => handleSort('status')}
                                                className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-1">
                                                    Status
                                                    <SortIcon field="status" />
                                                </div>
                                            </th>
                                            <th
                                                onClick={() => handleSort('checkIn')}
                                                className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-1">
                                                    Check In
                                                    <SortIcon field="checkIn" />
                                                </div>
                                            </th>
                                            <th
                                                onClick={() => handleSort('checkOut')}
                                                className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-1">
                                                    Check Out
                                                    <SortIcon field="checkOut" />
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                                        {filteredAndSortedRecords.map((record, index) => {
                                            return (
                                                <tr
                                                    key={`${record.personCode}-${index}`}
                                                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                                    onClick={() => window.location.href = `/dashboard/admin/attendance/${record.personCode}`}
                                                >
                                                    {/* Staff Name & Avatar */}
                                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            {record.image ? (
                                                                <img 
                                                                    src={record.image} 
                                                                    alt={record.personName} 
                                                                    className="h-8 w-8 rounded-lg object-cover border border-slate-100 shadow-sm"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        const fallback = target.nextElementSibling as HTMLElement;
                                                                        if (fallback) fallback.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className={`h-8 w-8 rounded-lg bg-green-50 border border-green-100 items-center justify-center text-green-700 font-bold text-xs shrink-0 shadow-sm ${record.image ? 'hidden' : 'flex'}`}>
                                                                {record.personName?.charAt(0) || '?'}
                                                            </div>
                                                            <span className="font-semibold text-slate-900">{record.personName}</span>
                                                        </div>
                                                    </td>

                                                    {/* Person Code */}
                                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                                                            <span className="font-mono text-xs font-semibold text-slate-600">
                                                                {record.personCode}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-5">
                                                        <StatusBadge status={record.status || 'Unknown'} />
                                                    </td>

                                                    {/* Check In */}
                                                    <td className="py-3.5 px-5">
                                                        <span className="text-xs font-medium text-slate-600">
                                                            {formatTime(record.checkIn)}
                                                        </span>
                                                    </td>

                                                    {/* Check Out */}
                                                    <td className="py-3.5 px-5">
                                                        <span className="text-xs font-medium text-slate-600">
                                                            {formatTime(record.checkOut)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards View */}
                            <div className="md:hidden flex flex-col gap-3 p-3 bg-slate-50/50">
                                {filteredAndSortedRecords.map((record, index) => {
                                    return (
                                        <div
                                            key={`${record.personCode}-${index}`}
                                            onClick={() => window.location.href = `/dashboard/admin/attendance/${record.personCode}`}
                                            className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl hover:border-green-200 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {record.image ? (
                                                        <img 
                                                            src={record.image} 
                                                            alt={record.personName} 
                                                            className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                const fallback = target.nextElementSibling as HTMLElement;
                                                                if (fallback) fallback.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`h-12 w-12 rounded-xl bg-green-50 border border-green-100 items-center justify-center text-green-700 font-bold text-lg shrink-0 shadow-sm ${record.image ? 'hidden' : 'flex'}`}>
                                                        {record.personName?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                                                            {record.personName}
                                                        </h3>
                                                        <p className="text-[10px] text-slate-400 font-mono font-semibold tracking-wide mt-0.5">
                                                            {record.personCode}
                                                        </p>
                                                    </div>
                                                </div>
                                                <StatusBadge status={record.status || 'Unknown'} />
                                            </div>

                                            <div className="flex items-center gap-4 mt-1 pt-3 border-t border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Check In</span>
                                                    <span className="text-xs font-semibold text-slate-700">{formatTime(record.checkIn)}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Check Out</span>
                                                    <span className="text-xs font-semibold text-slate-700">{formatTime(record.checkOut)}</span>
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
                                No records found
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs">
                                There are no attendance records matching your criteria.
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

export default function TodayAttendancePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm font-medium text-slate-400">Loading UI...</div>}>
            <TodayAttendanceContent />
        </Suspense>
    );
}
