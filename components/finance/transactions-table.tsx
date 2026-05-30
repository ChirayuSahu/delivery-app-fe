"use client"

import React, { useState, useEffect } from "react"
import { 
  Loader2, 
  ArrowRightLeft, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  X 
} from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  fromUserId: string | null
  toUserId: string | null
  createdAt: string
  fromUser?: { name: string }
  toUser?: { name: string }
}

interface TransactionsTableProps {
  dateRange?: DateRange
  userId?: string
  role?: string
}

type SortField = 'createdAt' | 'type' | 'fromUser' | 'toUser' | 'description' | 'amount';
type SortOrder = 'asc' | 'desc';

export function TransactionsTable({ dateRange, userId, role }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [sortField, setSortField] = useState<SortField | null>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const isDeliveryMan = role === 'DELIVERY_MAN'

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        let url = userId ? `/api/transactions/${userId}` : '/api/transactions'
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
          throw new Error(json.message || 'Failed to fetch transactions')
        }

        setTransactions(json.data || [])
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [dateRange, userId])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(tx => {
      const searchLower = searchQuery.toLowerCase();
      const descMatch = (tx.description || '').toLowerCase().includes(searchLower);
      const fromMatch = (tx.fromUser?.name || '').toLowerCase().includes(searchLower);
      const toMatch = (tx.toUser?.name || '').toLowerCase().includes(searchLower);
      const searchMatch = descMatch || fromMatch || toMatch;

      const typeMatch = typeFilter === 'ALL' || 
                        (typeFilter === 'BUDGET' && tx.type === 'EXPENSE_BUDGET') ||
                        (typeFilter === 'ASSIGNMENT' && tx.type === 'DELIVERY_ASSIGNMENT') ||
                        (typeFilter === 'ADJUSTMENT' && tx.type === 'ADJUSTMENT') ||
                        (typeFilter === 'REFUND' && tx.type === 'REFUND') ||
                        (typeFilter === 'DEPOSIT' && tx.type === 'CASH_DEPOSIT');

      return searchMatch && typeMatch;
    });
  }, [transactions, searchQuery, typeFilter]);

  const sortedTransactions = React.useMemo(() => {
    if (!sortField) return filteredTransactions;

    return [...filteredTransactions].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case 'createdAt':
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
        case 'type':
          valA = a.type.toLowerCase();
          valB = b.type.toLowerCase();
          break;
        case 'fromUser':
          valA = (a.fromUser?.name || '').toLowerCase();
          valB = (b.fromUser?.name || '').toLowerCase();
          break;
        case 'toUser':
          valA = (a.toUser?.name || '').toLowerCase();
          valB = (b.toUser?.name || '').toLowerCase();
          break;
        case 'description':
          valA = (a.description || '').toLowerCase();
          valB = (b.description || '').toLowerCase();
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
  }, [filteredTransactions, sortField, sortOrder]);

  if (loading) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-xl p-12 flex flex-col items-center justify-center shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-green-600 mb-2" />
        <span className="text-xs font-medium text-slate-400">Loading transactions...</span>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-100 rounded-xl shadow-sm">
        <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
          <ArrowRightLeft className="h-6 w-6" />
        </div>
        <h4 className="text-slate-900 font-semibold text-sm">
          No transactions found
        </h4>
        <p className="text-xs text-slate-400 mt-0.5 max-w-xs">
          There are no recorded transactions for this period.
        </p>
      </div>
    )
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'EXPENSE_BUDGET':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase">Budget</span>
      case 'CASH_DEPOSIT':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">Deposit</span>
      case 'ADJUSTMENT':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-100 uppercase">Adjustment</span>
      case 'REFUND':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">Refund</span>
      case 'DELIVERY_ASSIGNMENT':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase">Assignment</span>
      default:
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-100 uppercase">{type}</span>
    }
  }

  return (
    <div className="space-y-4">
      {/* Minimal Toolbar */}
      {!isDeliveryMan && (
        <div className="hidden md:flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search description or user..."
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
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
              </span>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-row overflow-x-auto gap-1.5 pt-1 border-t border-slate-50 whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'BUDGET', label: 'Budgets' },
              { id: 'DEPOSIT', label: 'Deposits' },
              { id: 'ASSIGNMENT', label: 'Assignments' },
              { id: 'ADJUSTMENT', label: 'Adjustments' },
              { id: 'REFUND', label: 'Refunds' }
            ].map((pill) => {
              const isActive = typeFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setTypeFilter(pill.id)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer select-none shrink-0 ${
                    isActive 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                      : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {sortedTransactions.map((tx) => {
          const isCredit = userId ? tx.toUserId === userId : false;
          return (
            <div
              key={tx.id}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:bg-slate-50/50 hover:border-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg border border-slate-100 ${isCredit ? 'bg-green-50/50' : 'bg-slate-50/50'}`}>
                    {isCredit ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-slate-505" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction</p>
                       {getTypeBadge(tx.type)}
                    </div>
                    <p className={`text-sm font-bold ${isCredit && userId ? 'text-green-600' : 'text-slate-900'}`}>
                      {isCredit && userId ? '+' : ''}₹{tx.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-semibold text-slate-500">
                    {format(new Date(tx.createdAt), 'dd MMM, HH:mm')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 py-2 border-y border-slate-50">
                {tx.fromUserId && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">From</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{tx.fromUser?.name || 'User'}</p>
                  </div>
                )}
                {tx.toUserId && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">To</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{tx.toUser?.name || 'User'}</p>
                  </div>
                )}
              </div>

              <p className="text-xs font-medium text-slate-500 truncate">{tx.description || '-'}</p>
            </div>
          )
        })}
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
                <th 
                  onClick={() => handleSort('type')}
                  className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Type
                    {sortField === 'type' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('fromUser')}
                  className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    From
                    {sortField === 'fromUser' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('toUser')}
                  className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    To
                    {sortField === 'toUser' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('description')}
                  className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Description
                    {sortField === 'description' ? (
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
              {sortedTransactions.map((tx) => {
                const isCredit = userId ? tx.toUserId === userId : false;
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-5 text-slate-500 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">{getTypeBadge(tx.type)}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {tx.fromUser?.name ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                            {tx.fromUser.name.charAt(0)}
                          </div>
                          {tx.fromUser.name}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {tx.toUser?.name ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                            {tx.toUser.name.charAt(0)}
                          </div>
                          {tx.toUser.name}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-medium max-w-xs truncate" title={tx.description || ''}>
                      {tx.description || '-'}
                    </td>
                    <td className={`py-3.5 px-5 text-right font-semibold text-slate-900 ${isCredit && userId ? 'text-green-600 font-bold' : ''}`}>
                      {isCredit && userId ? '+' : ''}₹{tx.amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
