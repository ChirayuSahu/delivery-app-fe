'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { Button } from '@/components/ui/button'

type ReportResponse = {
  success: boolean
  data: {
    date: string
    summary: {
      totalInvoices: number
      completed: number
      failed: number
      pending: number
    }
    logistics: {
      boxes: number
      bags: number
      icePacks: number
      cases: number
    }
    charts: {
      statusDistribution: {
        labels: string[]
        data: number[]
        colors: string[]
      }
      deliveryManPerformance: {
        labels: string[]
        data: number[]
        colors: string[]
      }
    }
    tableData: {
      id: string
      customer: string
      status: string
      driver: string
      amount: number
    }[]
  }
}

export default function DailyReportWithPrint() {
  const [report, setReport] = useState<ReportResponse['data'] | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/reports/daily', { credentials: 'include' })
      .then(res => res.json())
      .then((json: ReportResponse) => {
        if (json.success) setReport(json.data)
      })
  }, [])

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Daily_Delivery_Report'
  })

  const { statusChartData, deliveryChartData, totalAmount } = useMemo(() => {
    if (!report) return { statusChartData: [], deliveryChartData: [], totalAmount: 0 }

    return {
      statusChartData: report.charts.statusDistribution.labels.map((l, i) => ({
        name: l,
        value: report.charts.statusDistribution.data[i],
        color: report.charts.statusDistribution.colors[i]
      })),
      deliveryChartData: report.charts.deliveryManPerformance.labels.map((l, i) => ({
        name: l,
        value: report.charts.deliveryManPerformance.data[i],
        color: report.charts.deliveryManPerformance.colors[i]
      })),
      totalAmount: report.tableData.reduce((s, r) => s + r.amount, 0)
    }
  }, [report])

  if (!report) return <p>Loading…</p>

  return (
    <div>
      <Button onClick={handlePrint}>Print Report</Button>

      {/* PRINTABLE AREA */}
      <div ref={printRef} style={{ padding: 24, fontFamily: 'Arial' }}>
        <h2>Daily Delivery Report</h2>
        <p>Date: {new Date(report.date).toLocaleDateString('en-GB')}</p>

        <hr />

        <h3>Summary</h3>
        <table width="100%" border={1} cellPadding={6}>
          <tbody>
            <tr>
              <td>Total Invoices</td>
              <td>{report.summary.totalInvoices}</td>
              <td>Completed</td>
              <td>{report.summary.completed}</td>
            </tr>
            <tr>
              <td>Failed</td>
              <td>{report.summary.failed}</td>
              <td>Pending</td>
              <td>{report.summary.pending}</td>
            </tr>
          </tbody>
        </table>

        <h3>Logistics</h3>
        <table width="100%" border={1} cellPadding={6}>
          <tbody>
            <tr>
              <td>Boxes</td>
              <td>{report.logistics.boxes}</td>
              <td>Bags</td>
              <td>{report.logistics.bags}</td>
            </tr>
            <tr>
              <td>Ice Packs</td>
              <td>{report.logistics.icePacks}</td>
              <td>Cases</td>
              <td>{report.logistics.cases}</td>
            </tr>
          </tbody>
        </table>

        <h3>Status Distribution</h3>
        <div style={{ width: 400, height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={statusChartData} dataKey="value">
                {statusChartData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <h3>Delivery Executive Performance</h3>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={deliveryChartData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {deliveryChartData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h3>Invoice Details</h3>
        <table width="100%" border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {report.tableData.map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.customer}</td>
                <td>{row.driver}</td>
                <td>{row.status}</td>
                <td style={{ textAlign: 'right' }}>
                  ₹{row.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}><strong>Total</strong></td>
              <td style={{ textAlign: 'right' }}>
                <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
