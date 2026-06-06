'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { format, startOfMonth, endOfMonth, parse, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday } from 'date-fns';
import {
    Loader2,
    Clock,
    CalendarDays,
    Timer,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Calendar as CalendarIcon,
    Coffee,
    TrendingUp,
    UserCircle,
    IndianRupee,
    LayoutGrid,
    List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface AttendanceRecord {
    firstName: string;
    lastName: string;
    fullName: string;
    personCode: string;
    groupName: string;
    date: string;
    weekday: number;
    timetableName: string;
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime: string;
    clockInDate: string;
    clockInTime: string;
    clockInSource: number;
    clockInDevice: string;
    clockInArea: string;
    clockOutDate: string;
    clockOutTime: string;
    clockOutSource: number;
    clockOutDevice: string;
    clockOutArea: string;
    attendanceStatus: number;
    workDuration: string;
    absenceDuration: string;
    lateDuration: string;
    earlyDuration: string;
    breakDuration: string;
    leaveDuration: string;
    overtimeDuration: string;
    workdayOvertimeDuration: string;
    weekendOvertimeDuration: string;
    leaveTypes: string;
}



const WEEKDAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type SortField = 'date' | 'workDuration' | 'attendanceStatus';
type SortOrder = 'asc' | 'desc';

function formatTime(timeStr?: string | null) {
    if (!timeStr || timeStr === '') return '—';
    const [h, m] = timeStr.split(':');
    if (!h || !m) return timeStr;
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${m} ${ampm}`;
}

function parseDuration(duration: string | number): number {
    if (!duration) return 0;
    if (typeof duration === 'number') return duration;
    const str = String(duration).trim();
    if (!str.includes(':')) {
        return parseInt(str, 10) || 0;
    }
    const parts = str.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return (h * 60) + m;
}

function formatDurationMinutes(totalMinutes: number): string {
    if (isNaN(totalMinutes) || totalMinutes < 0) return "0h 0m";
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
}

function getStatusInfo(status: number) {
    switch (status) {
        case 0:
            return { label: 'Undefined', color: 'slate', icon: Clock };
        case 1:
            return { label: 'On Work', color: 'green', icon: CheckCircle2 };
        case 2:
            return { label: 'Off Work', color: 'slate', icon: CheckCircle2 };
        case 3:
            return { label: 'Break Starts', color: 'orange', icon: Coffee };
        case 4:
            return { label: 'Break Ends', color: 'amber', icon: Timer };
        case 5:
            return { label: 'Overtime Starts', color: 'purple', icon: TrendingUp };
        case 6:
            return { label: 'Overtime Ends', color: 'blue', icon: TrendingUp };
        default:
            return { label: 'Unknown', color: 'slate', icon: Clock };
    }
}

const statusColorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', dot: 'bg-green-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', dot: 'bg-orange-500' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', dot: 'bg-red-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-500' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', dot: 'bg-slate-400' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', dot: 'bg-purple-500' },
};

export default function PersonAttendancePage() {
    const params = useParams();
    const personCode = params.personCode as string;

    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [personName, setPersonName] = useState('');

    const [fromDate, setFromDate] = useState<Date>(startOfMonth(new Date()));
    const [toDate, setToDate] = useState<Date>(endOfMonth(new Date()));

    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [salaryPerDay, setSalaryPerDay] = useState<string>('');

    const fetchAttendance = async (from: Date, to: Date) => {
        setLoading(true);
        try {
            const beginTime = format(from, "yyyy-MM-dd'T'00:00:00'+05:30'");
            const endTime = format(to, "yyyy-MM-dd'T'23:59:59'+05:30'");

            const params = new URLSearchParams({
                beginTime,
                endTime,
                personCode,
            });

            const res = await fetch(`/api/hik/attendance?${params.toString()}`);
            const json = await res.json();

            if (json.success && json.data?.reportDataList) {
                setRecords(json.data.reportDataList);
                if (json.data.reportDataList.length > 0) {
                    setPersonName(json.data.reportDataList[0].fullName);
                }
            } else {
                setRecords([]);
            }
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance(fromDate, toDate);
    }, [fromDate, toDate, personCode]);

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

    const sortedRecords = useMemo(() => {
        if (!sortField) return records;

        return [...records].sort((a, b) => {
            let valA: number;
            let valB: number;

            switch (sortField) {
                case 'date': {
                    const dateA = parse(a.date, 'dd/MM/yyyy', new Date());
                    const dateB = parse(b.date, 'dd/MM/yyyy', new Date());
                    valA = dateA.getTime();
                    valB = dateB.getTime();
                    break;
                }
                case 'workDuration':
                    valA = parseDuration(a.workDuration);
                    valB = parseDuration(b.workDuration);
                    break;
                case 'attendanceStatus':
                    valA = a.attendanceStatus;
                    valB = b.attendanceStatus;
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [records, sortField, sortOrder]);

    // Summary stats
    const stats = useMemo(() => {
        const totalWorkMinutes = records.reduce((sum, r) => sum + parseDuration(r.workDuration), 0);
        const totalAbsenceMinutes = records.reduce((sum, r) => sum + parseDuration(r.absenceDuration), 0);
        const totalLateMinutes = records.reduce((sum, r) => sum + parseDuration(r.lateDuration), 0);
        const totalOvertimeMinutes = records.reduce((sum, r) => sum + parseDuration(r.overtimeDuration), 0);
        const presentDays = records.filter((r) => r.attendanceStatus >= 1 && r.attendanceStatus <= 6).length;
        const absentDays = records.filter((r) => r.attendanceStatus === 0).length;
        const totalDays = records.length;

        return {
            totalWorkMinutes,
            totalAbsenceMinutes,
            totalLateMinutes,
            totalOvertimeMinutes,
            presentDays,
            absentDays,
            totalDays,
        };
    }, [records]);

    const calendarDays = useMemo(() => {
        const start = startOfWeek(fromDate, { weekStartsOn: 1 }); // Monday
        const end = endOfWeek(toDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [fromDate, toDate]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 lg:p-10">
                {/* Header */}
                <div
                    className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm shadow-green-100/50"
                >
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
                            <UserCircle className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">
                                {personName || `Person #${personCode}`}
                            </h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                Attendance records &middot; Code: <span className="font-mono font-bold text-slate-600">{personCode}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Date Range Picker */}
                <div
                    className="bg-white border border-slate-100 rounded-xl shadow-sm p-4"
                >
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                            <CalendarDays className="w-4 h-4 text-green-600" />
                            Date Range
                        </div>

                        <div className="flex flex-1 flex-col sm:flex-row items-stretch gap-3">
                            {/* From Date */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'justify-start text-left font-semibold text-xs rounded-lg h-9 border-slate-200 hover:bg-slate-50 hover:border-slate-300 bg-white min-w-[160px] shadow-none',
                                            !fromDate && 'text-muted-foreground font-medium'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                                        {fromDate ? format(fromDate, 'PPP') : 'From date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-lg border border-slate-100" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={fromDate}
                                        onSelect={(d) => d && setFromDate(d)}
                                        disabled={(d) => d > new Date()}
                                        initialFocus
                                        className="rounded-xl border-none"
                                    />
                                </PopoverContent>
                            </Popover>

                            <span className="hidden sm:flex items-center text-slate-300 text-xs font-bold">→</span>

                            {/* To Date */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'justify-start text-left font-semibold text-xs rounded-lg h-9 border-slate-200 hover:bg-slate-50 hover:border-slate-300 bg-white min-w-[160px] shadow-none',
                                            !toDate && 'text-muted-foreground font-medium'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                                        {toDate ? format(toDate, 'PPP') : 'To date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-lg border border-slate-100" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={toDate}
                                        onSelect={(d) => d && setToDate(d)}
                                        disabled={(d) => d > new Date() || (fromDate ? d < fromDate : false)}
                                        initialFocus
                                        className="rounded-xl border-none"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shrink-0 self-start sm:self-auto">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                            <span className="text-[11px] font-semibold text-slate-600">
                                {records.length} {records.length === 1 ? 'day' : 'days'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {!loading && records.length > 0 && (
                    <div
                    className="grid grid-cols-2 md:grid-cols-5 gap-3"
                    >
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center">
                                    <Timer className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Work</span>
                            </div>
                            <p className="text-lg font-black text-slate-900">{formatDurationMinutes(stats.totalWorkMinutes)}</p>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Present</span>
                            </div>
                            <p className="text-lg font-black text-slate-900">
                                {stats.presentDays}<span className="text-sm font-semibold text-slate-400">/{stats.totalDays} days</span>
                            </p>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 bg-red-50 rounded-lg flex items-center justify-center">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Absent</span>
                            </div>
                            <p className="text-lg font-black text-slate-900">
                                {stats.absentDays}<span className="text-sm font-semibold text-slate-400"> days</span>
                            </p>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-amber-600" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overtime</span>
                            </div>
                            <p className="text-lg font-black text-slate-900">{formatDurationMinutes(stats.totalOvertimeMinutes)}</p>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Late</span>
                            </div>
                            <p className="text-lg font-black text-slate-900">{formatDurationMinutes(stats.totalLateMinutes)}</p>
                        </div>
                    </div>
                )}

                {/* Salary Calculator */}
                {!loading && records.length > 0 && (
                    <div
                    >
                        <Card className="py-0 gap-0 overflow-hidden shadow-sm border-slate-100">
                            <CardContent className="p-5">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                                            <IndianRupee className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 text-sm">Salary Calculator</h3>
                                            <p className="text-[10px] text-slate-500 font-medium">Estimated payout for this period</p>
                                        </div>
                                    </div>

                                    <div className="w-px h-10 bg-slate-100 hidden sm:block mx-2" />

                                    <div className="flex flex-1 items-center gap-3 flex-wrap">
                                        <div className="relative flex items-center">
                                            <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 z-10" />
                                            <Input
                                                id="salary"
                                                type="text"
                                                inputMode="decimal"
                                                value={salaryPerDay}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                        setSalaryPerDay(val);
                                                    }
                                                }}
                                                className="w-32 pl-8 pr-10 h-9 text-sm font-semibold shadow-none border-slate-200 focus-visible:ring-emerald-500"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">/day</span>
                                        </div>

                                        <span className="hidden sm:flex items-center text-muted-foreground text-sm font-bold">×</span>
                                        
                                        <Badge variant="outline" className="h-9 px-3 gap-1.5 text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-50">
                                            <span className="font-bold text-slate-900">{stats.presentDays}</span> 
                                            <span className="text-[10px] uppercase tracking-wider font-semibold">Days Present</span>
                                        </Badge>

                                        <span className="hidden sm:flex items-center text-muted-foreground text-sm font-bold">=</span>

                                        <div className="flex items-center gap-1.5 px-2">
                                            <IndianRupee className={cn(
                                                'h-5 w-5',
                                                salaryPerDay && parseFloat(salaryPerDay) > 0 ? 'text-emerald-600' : 'text-slate-400'
                                            )} />
                                            <span className={cn(
                                                'text-xl font-black tracking-tight',
                                                salaryPerDay && parseFloat(salaryPerDay) > 0 ? 'text-emerald-700' : 'text-slate-600'
                                            )}>
                                                {salaryPerDay && parseFloat(salaryPerDay) > 0
                                                    ? (parseFloat(salaryPerDay) * stats.presentDays).toLocaleString('en-IN')
                                                    : '0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main Content Area */}
                <Tabs defaultValue="list" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-white border border-slate-100 shadow-sm">
                            <TabsTrigger value="calendar" className="gap-2 text-xs font-semibold data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none">
                                <LayoutGrid className="w-4 h-4" />
                                Calendar
                            </TabsTrigger>
                            <TabsTrigger value="list" className="gap-2 text-xs font-semibold data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none">
                                <List className="w-4 h-4" />
                                List
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="calendar" className="outline-none">
                        <div
                    className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                    <span className="text-xs font-medium text-slate-400">Loading calendar...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-7 w-full border-b border-slate-100">
                                    {/* Weekday Headers */}
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                        <div key={d} className="bg-slate-50/80 border-r last:border-r-0 border-slate-100 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {d}
                                        </div>
                                    ))}
                                    
                                    {/* Calendar Days */}
                                    {calendarDays.map((day, idx) => {
                                        const dateStr = format(day, 'dd/MM/yyyy');
                                        const record = records.find(r => r.date === dateStr);
                                        const isCurrentMonth = isSameMonth(day, fromDate);
                                        
                                        return (
                                            <div 
                                                key={day.toISOString()} 
                                                className={cn(
                                                    "min-h-[120px] p-2 border-r border-b border-slate-100 transition-colors hover:bg-slate-50/50",
                                                    (idx + 1) % 7 === 0 && "border-r-0",
                                                    !isCurrentMonth && "bg-slate-50/30 opacity-60 grayscale"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    {record ? (
                                                        <span className={cn(
                                                            "h-1.5 w-1.5 rounded-full",
                                                            statusColorMap[getStatusInfo(record.attendanceStatus).color]?.dot || "bg-slate-300"
                                                        )} />
                                                    ) : (
                                                        <span className="h-1.5 w-1.5" />
                                                    )}
                                                    <span className={cn(
                                                        "text-xs font-bold",
                                                        isToday(day) ? "bg-emerald-500 text-white h-6 w-6 flex items-center justify-center rounded-full shadow-md shadow-emerald-200" : "text-slate-400"
                                                    )}>
                                                        {format(day, 'd')}
                                                    </span>
                                                </div>

                                                {record && (
                                                    <div className="space-y-1.5 mt-2">
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                                                <Clock className="w-3 h-3 text-emerald-500" />
                                                                {formatTime(record.clockInTime)}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                                                <Clock className="w-3 h-3 text-rose-400" />
                                                                {formatTime(record.clockOutTime)}
                                                            </div>
                                                        </div>

                                                        {parseDuration(record.workDuration) > 0 && (
                                                            <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-100 w-fit">
                                                                {record.workDuration}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="list" className="outline-none">
                        <div
                    className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                                    <span className="text-xs font-medium text-slate-400">
                                        Loading attendance records...
                                    </span>
                                </div>
                            ) : sortedRecords.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                                        <th
                                            onClick={() => handleSort('date')}
                                            className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-1">
                                                Date
                                                <SortIcon field="date" />
                                            </div>
                                        </th>
                                        <th className="py-3 px-5 font-semibold">Day</th>
                                        <th className="py-3 px-5 font-semibold">Clock In</th>
                                        <th className="py-3 px-5 font-semibold">Clock Out</th>
                                        <th
                                            onClick={() => handleSort('workDuration')}
                                            className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-1">
                                                Work Duration
                                                <SortIcon field="workDuration" />
                                            </div>
                                        </th>
                                        <th className="py-3 px-5 font-semibold">Late</th>
                                        <th className="py-3 px-5 font-semibold">Early</th>
                                        <th className="py-3 px-5 font-semibold">Overtime</th>
                                        <th
                                            onClick={() => handleSort('attendanceStatus')}
                                            className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-1">
                                                Status
                                                <SortIcon field="attendanceStatus" />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody
                                   
                                   
                                   
                                    className="divide-y divide-slate-100 text-slate-700 text-xs"
                                >
                                    {sortedRecords.map((record, index) => {
                                        const statusInfo = getStatusInfo(record.attendanceStatus);
                                        const colors = statusColorMap[statusInfo.color] || statusColorMap.slate;
                                        const StatusIcon = statusInfo.icon;
                                        const hasClockIn = record.clockInTime && record.clockInTime !== '';
                                        const hasClockOut = record.clockOutTime && record.clockOutTime !== '';
                                        const workMinutes = parseDuration(record.workDuration);

                                        return (
                                            <tr
                                                key={`${record.date}-${index}`}
                                               
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                {/* Date */}
                                                <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                                        {record.date}
                                                    </div>
                                                </td>

                                                {/* Weekday */}
                                                <td className="py-3.5 px-5 text-slate-500 font-medium">
                                                    {WEEKDAY_NAMES[record.weekday] || '—'}
                                                </td>

                                                {/* Clock In */}
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    {hasClockIn ? (
                                                        <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                                                            <Clock className="h-3.5 w-3.5 text-green-500" />
                                                            {formatTime(record.clockInTime)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 italic font-medium">—</span>
                                                    )}
                                                </td>

                                                {/* Clock Out */}
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    {hasClockOut ? (
                                                        <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                                                            <Clock className="h-3.5 w-3.5 text-red-400" />
                                                            {formatTime(record.clockOutTime)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 italic font-medium">—</span>
                                                    )}
                                                </td>

                                                {/* Work Duration */}
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    {workMinutes > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                                                            <Timer className="h-3 w-3" />
                                                            {record.workDuration}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 font-medium">00:00</span>
                                                    )}
                                                </td>

                                                {/* Late */}
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    {parseDuration(record.lateDuration) > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                            {record.lateDuration}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 font-medium">—</span>
                                                    )}
                                                </td>

                                                {/* Early */}
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    {parseDuration(record.earlyDuration) > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                                                            {record.earlyDuration}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 font-medium">—</span>
                                                    )}
                                                </td>

                                                {/* Overtime */}
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    {parseDuration(record.overtimeDuration) > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                            {record.overtimeDuration}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 font-medium">—</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-5">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                                                        <span className={`h-1 w-1 rounded-full ${colors.dot} ${[1, 5].includes(record.attendanceStatus) ? 'animate-pulse' : ''}`} />
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                                <CalendarDays className="h-6 w-6" />
                            </div>
                            <h4 className="text-slate-900 font-semibold text-sm">
                                No attendance records
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs">
                                No attendance data found for this date range. Try selecting a different period.
                            </p>
                        </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <p className="text-center text-slate-400 text-xs font-medium mt-4">
                    Data synced from HikConnect access control system.
                </p>
            </div>
        </div>
    );
}
