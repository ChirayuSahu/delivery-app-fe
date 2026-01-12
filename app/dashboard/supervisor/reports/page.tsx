'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Download,
  FileSpreadsheet,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Home
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

export default function ReportsPage() {
  const router = useRouter();

  const [from, setFrom] = useState<Date>();
  const [to, setTo] = useState<Date>();

  const [loading, setLoading] = useState(false);

  const downloadReport = () => {
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

    const url = `/api/reports/custom?from=${fromStr}&to=${toStr}`;

    window.location.href = url;

    setTimeout(() => {
      setLoading(false);
      toast.success('Report downloaded successfully');
    }, 1500);
  };

  const getDuration = () => {
    if (!from || !to) return null;
    if (from > to) return null;

    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  return (
    <div className="min-h-screen pb-12 font-sans">
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
              <h1 className="text-lg font-bold text-slate-900 leading-none">Custom Report</h1>
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
        {/* Hero / Context Card */}
        <motion.div variants={itemVariants} className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm shadow-green-100/50 mb-6">
          <div className="flex items-center gap-5">
            {/* THEME CHANGE: Icon background is now Green */}
            <div className="h-14 w-14 bg-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
              <Download className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Invoice Report</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Generate Excel sheets for accounting and audits.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div variants={itemVariants} className="bg-white border border-green-100 rounded-2xl overflow-hidden shadow-sm shadow-green-100/50">
          <div className="px-6 py-4 border-b border-green-100">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-green-600" />
              Select Date Range
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                        "w-full h-auto bg-white border-green-200 rounded-xl px-4 py-2.5 text-sm font-bold justify-start text-left hover:bg-green-50 hover:text-green-900 hover:border-green-300 shadow-none transition-all",
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
                        "w-full h-auto bg-white border-green-200 rounded-xl px-4 py-2.5 text-sm font-bold justify-start text-left hover:bg-green-50 hover:text-green-900 hover:border-green-300 shadow-none transition-all",
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

            {/* THEME CHANGE: Main button is now Green */}
            <button
              onClick={downloadReport}
              disabled={loading}
              className={`
                        w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all relative overflow-hidden
                        ${loading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-green-300'
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
                  <span>Download Excel Report</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        <p className="text-center text-slate-400 text-xs font-medium mt-6">
          Securely generated from system records.
        </p>
      </motion.div>
    </div>
  );
}