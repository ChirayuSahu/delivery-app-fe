'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Download,
  Loader2,
  ArrowLeft,
  CalendarDays,
  Home,
  Users,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function AttendanceReportPage() {
  const router = useRouter();

  const [from, setFrom] = useState<Date>();
  const [to, setTo] = useState<Date>();

  const [loading, setLoading] = useState(false);

  const downloadReport = async () => {
    if (!from || !to) {
      toast.error('Please select both From and To dates');
      return;
    }

    if (from > to) {
      toast.error('Start date cannot be after End date');
      return;
    }

    setLoading(true);

    const fromStr = format(from, 'yyyy-MM-dd');
    const toStr = format(to, 'yyyy-MM-dd');

    const url = `/api/reports/attendance?from=${fromStr}&to=${toStr}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to download report");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `attendance-report-${fromStr}-to-${toStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Report downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdfReport = async () => {
    if (!from || !to) {
      toast.error('Please select both From and To dates');
      return;
    }

    if (from > to) {
      toast.error('Start date cannot be after End date');
      return;
    }

    setLoading(true);
    const fromStr = format(from, 'yyyy-MM-dd');
    const toStr = format(to, 'yyyy-MM-dd');
    const url = `/api/reports/attendance-pdf?from=${fromStr}&to=${toStr}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to download PDF report");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const displayDate = fromStr === toStr ? fromStr : `${fromStr}-to-${toStr}`;
      a.download = `attendance-report-${displayDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('PDF Report downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download PDF report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 font-sans bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Home className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Attendance Report</h1>
            </div>
          </div>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6 p-4 md:p-8"
      >
        {/* Hero Card */}
        <motion.div variants={itemVariants} className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm shadow-green-100/50 mb-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Staff Attendance</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Download a detailed breakdown of all staff attendance and present statuses.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-green-600" />
              Select Date Range
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                  From Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-auto bg-white border-slate-200 rounded-xl px-4 py-3 text-sm font-bold justify-start text-left hover:bg-slate-50 shadow-none transition-all",
                        !from && "text-slate-400 font-medium",
                        from && "text-slate-900"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                      {from ? format(from, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={from}
                      onSelect={setFrom}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="rounded-md border shadow-md"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                  To Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-auto bg-white border-slate-200 rounded-xl px-4 py-3 text-sm font-bold justify-start text-left hover:bg-slate-50 shadow-none transition-all",
                        !to && "text-slate-400 font-medium",
                        to && "text-slate-900"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                      {to ? format(to, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={to}
                      onSelect={setTo}
                      disabled={(date) =>
                        date > new Date() || (from ? date < from : false)
                      }
                      initialFocus
                      className="rounded-md border shadow-md"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={downloadReport}
                disabled={loading}
                className={`
                  w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all relative overflow-hidden
                  ${loading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Excel</span>
                  </>
                )}
              </button>

              <button
                onClick={downloadPdfReport}
                disabled={loading}
                className={`
                  w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all relative overflow-hidden
                  ${loading
                    ? 'bg-red-50 text-red-200 cursor-not-allowed border border-red-100'
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-slate-400 text-xs font-medium mt-6">
          Admin-only report generation.
        </p>
      </motion.div>
    </div>
  );
}
