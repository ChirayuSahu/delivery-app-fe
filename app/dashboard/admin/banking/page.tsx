import { IndianRupee } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const bankingLinks = [
  {
    name: 'Central Bank of India',
    link: 'https://www.inb.centralbank.bank.in/#/login',
    image: 'https://wp.logos-download.com/wp-content/uploads/2022/11/Central_Bank_of_India_Logo-700x179.png',
  },
  {
    name: 'ICICI Bank',
    link: 'https://www.icici.bank.in/business-banking/ways-to-bank/corporate-internet-banking',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Bank_Logo.svg/3840px-ICICI_Bank_Logo.svg.png',
  },
  {
    name: 'HDFC Bank (NOW)',
    link: 'https://now.hdfc.bank.in/retail-app/',
    image: 'https://i.ibb.co/cXMrQKdY/now-new.png',

  },
  {
    name: 'HDFC Corporate Banking',
    link: 'https://corporatebanking.hdfcbank.com/cbx/CBXLogin.jsp',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/960px-HDFC_Bank_Logo.svg.png?_=20110306040211',

  },
]

const BakingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 lg:p-10">
        <div
          className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm shadow-green-100/50"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 bg-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
                <IndianRupee className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Banking Services
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  View and manage your banking links here.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8">
          {bankingLinks.map((bank) => (
            <Link
              key={bank.name}
              href={bank.link}
              target="_blank"
              className="group bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200"
            >
              {bank.image ? (
                <img
                  src={bank.image}
                  alt={bank.name}
                  className="w-full h-14 object-contain group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-14 flex items-center justify-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">No Logo</span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 text-center group-hover:text-green-600 transition-colors duration-200">{bank.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BakingPage