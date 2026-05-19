"use client"

import React, { useState, useEffect } from "react"
import { 
  Loader2, 
  FileText, 
  ChevronRight, 
  Clock, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  X 
} from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useRouter } from "next/navigation"

interface Expense {
  id: string
  amount: number
  notes: string
  proofUrl: string
  userId: string
  createdAt: string
  user?: {
    name: string
  }
}

interface ExpensesTableProps {
  dateRange?: DateRange
  userId?: string
  role?: 'ADMIN' | 'SUPERVISOR' | 'DELIVERY_MAN'
}

type SortField = 'createdAt' | 'user' | 'notes' | 'amount';
type SortOrder = 'asc' | 'desc';

export function ExpensesTable({ dateRange, userId, role }: ExpensesTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField | null>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const router = useRouter()

  const isAdmin = role === 'ADMIN'

  const handleRowClick = (expenseId: string) => {
    const dashboardPath = role?.toLowerCase().replace('_', '')
    const baseUrl = `/dashboard/${dashboardPath}/${role === 'DELIVERY_MAN' ? 'expenses' : 'transactions/expenses'}/${expenseId}`
    router.push(baseUrl)
  }

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)
      try {
        let url = userId ? `/api/expenses/${userId}` : '/api/expenses'
        const params = new URLSearchParams()
        if (dateRange?.from) {
            params.append('from', format(dateRange.from, 'yyyy-MM-dd'))
        }
        if (dateRange?.to) {
            params.append('to', format(dateRange.to, 'yyyy-MM-dd'))
        }
        if (params.toString()) {
            url += `?${params.toString()}`
        }

        const res = await fetch(url)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.message || 'Failed to fetch expenses')
        }

        setExpenses(json.data || [])
      } catch (error) {
        console.error("Failed to fetch expenses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [dateRange, userId])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter(expense => {
      const notesMatch = expense.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const userMatch = (expense.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         expense.userId.toLowerCase().includes(searchQuery.toLowerCase());
      return notesMatch || (isAdmin && userMatch);
    });
  }, [expenses, searchQuery, isAdmin]);

  const sortedExpenses = React.useMemo(() => {
    if (!sortField) return filteredExpenses;

    return [...filteredExpenses].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case 'createdAt':
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
        case 'user':
          valA = (a.user?.name || a.userId).toLowerCase();
          valB = (b.user?.name || b.userId).toLowerCase();
          break;
        case 'notes':
          valA = a.notes.toLowerCase();
          valB = b.notes.toLowerCase();
          break;
        case 'amount':
          valA = a.amount;
          valB = b.amount;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredExpenses, sortField, sortOrder]);

  if (loading) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-xl p-12 flex flex-col items-center justify-center shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-green-600 mb-2" />
        <span className="text-xs font-medium text-slate-400">Loading expenses...</span>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-100 rounded-xl shadow-sm">
        <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
          <FileText className="h-6 w-6" />
        </div>
        <h4 className="text-slate-900 font-semibold text-sm">
          No expenses found
        </h4>
        <p className="text-xs text-slate-400 mt-0.5 max-w-xs">
          There are no recorded expenses for this period.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Minimal Toolbar */}
      <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={isAdmin ? "Search by user or notes..." : "Search notes..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all font-semibold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 hover:text-slate-600 text-slate-400 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 self-end sm:self-auto">
          <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
          <span className="text-[11px] font-semibold text-slate-600">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
          </span>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {sortedExpenses.map((expense) => (
          <div
            key={expense.id}
            onClick={() => handleRowClick(expense.id)}
            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:bg-slate-50/50 hover:border-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expense</p>
                  <p className="text-sm font-bold text-slate-900">₹{expense.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-semibold text-slate-500">
                    {format(new Date(expense.createdAt), 'dd MMM, HH:mm')}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 mb-3 py-2 border-y border-slate-50">
                <div className="h-5 w-5 rounded bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600 uppercase">
                  {(expense.user?.name || expense.userId).charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-700">{expense.user?.name || expense.userId}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]">{expense.notes}</p>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <th 
                  onClick={() => handleSort('createdAt')}
                  className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortField === 'createdAt' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                    )}
                  </div>
                </th>
                {isAdmin && (
                  <th 
                    onClick={() => handleSort('user')}
                    className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      User
                      {sortField === 'user' ? (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                <th 
                  onClick={() => handleSort('notes')}
                  className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Notes
                    {sortField === 'notes' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('amount')}
                  className="py-3 px-5 text-right font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Amount
                    {sortField === 'amount' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {sortedExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  onClick={() => handleRowClick(expense.id)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 px-5 text-slate-500 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {format(new Date(expense.createdAt), 'dd MMM yyyy, HH:mm')}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                          {(expense.user?.name || expense.userId).charAt(0)}
                        </div>
                        {expense.user?.name || expense.userId}
                      </div>
                    </td>
                  )}
                  <td className="py-3.5 px-5 text-slate-600 font-medium max-w-xs truncate" title={expense.notes}>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {expense.notes}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-right font-semibold text-slate-900">
                    ₹{expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
