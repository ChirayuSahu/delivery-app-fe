'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Truck, ShieldCheck, Zap, ArrowRight, Package } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">{process.env.NEXT_PUBLIC_COMPANY_NAME}</span>
          </div>
          
          <Link href="/login">
            <Button variant="default" className="bg-green-600 hover:bg-green-700 rounded-full px-6">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">v2.0 Live Now</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Streamlined delivery Delivery Workflow for <span className="text-green-600">{process.env.NEXT_PUBLIC_COMPANY_NAME}</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            A high-performance logistics tool designed for scanning, tracking, and managing 
            pharmaceutical invoices with precision and speed.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 bg-green-600 hover:bg-green-700 text-lg shadow-lg shadow-green-200">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-green-600" />}
              title="Quick Scan"
              description="Camera-integrated barcode scanning for rapid invoice entry on any device."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
              title="Secure Tracking"
              description="Live status updates for customers with encrypted delivery verification."
            />
            <FeatureCard 
              icon={<Truck className="w-6 h-6 text-amber-600" />}
              title="Run Management"
              description="Batch invoices into delivery runs and lock them once dispatched."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <Package className="w-5 h-5" />
            <span className="font-bold tracking-tight">{process.env.NEXT_PUBLIC_COMPANY_NAME}</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2025 All Rights Reserved.
          </p>
          <div className="mt-2 py-2 px-4 rounded-full bg-slate-50 border border-slate-100">
            <Link href={'https://chirayusahu.com'}>
            <p className="text-xs font-medium text-slate-500">
              Made with ❤️ by <span className="text-slate-900 font-bold">Chirayu Sahu</span>
            </p>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 inline-block">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}