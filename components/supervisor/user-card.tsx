'use client';

import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Fingerprint,
  Loader2,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import DeleteUserButton from "@/components/supervisor/delete-user";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  esId: string;
  phone: string;
  wallet: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 0, opacity: 1 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
};

export function UserInfoCard({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const json = await response.json();
        setUser(json.data);
      } catch (error) {
        console.error("Error fetching user detail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-xl p-12 flex flex-col items-center justify-center space-y-3 shadow-sm min-h-[300px]">
        <Loader2 className="animate-spin h-5 w-5 text-green-600" />
        <p className="text-sm font-semibold text-slate-400">Syncing Profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center text-green-700 font-extrabold text-2xl border border-green-100/50">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{user.name}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Delivery Executive</p>
          </div>
        </div>
        
        <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-green-100/50 uppercase tracking-wider flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
          Active
        </span>
      </div>

      {/* Info Content */}
      <div className="space-y-5">
        <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
          <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-green-50 transition-colors">
            <Mail className="h-4.5 w-4.5 text-slate-450 group-hover:text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</p>
            <p className="text-sm font-semibold text-slate-800">{user.email}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
          <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-green-50 transition-colors">
            <Phone className="h-4.5 w-4.5 text-slate-450 group-hover:text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mobile Contact</p>
            <p className="text-sm font-semibold text-slate-800">{user.phone}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
          <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-green-50 transition-colors">
            <Wallet className="h-4.5 w-4.5 text-slate-450 group-hover:text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Wallet Balance</p>
            <p className="text-sm font-semibold text-slate-800">₹{user.wallet?.toFixed(2) || '0.00'}</p>
          </div>
        </motion.div>

        {/* System ID Section - Green Theme */}
        <motion.div variants={itemVariants} className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-2xs border border-slate-100">
              <Fingerprint className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">EasySol System ID</p>
              <code className="text-sm font-mono font-bold text-slate-800 tracking-wider">#{user.esId}</code>
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-green-600" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default UserInfoCard;