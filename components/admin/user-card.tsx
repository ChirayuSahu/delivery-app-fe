'use client';

import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Fingerprint,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import DeleteUserButton from "@/components/admin/delete-user";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  esId: string;
  phone: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
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

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete user');

      toast.success(json.message || 'User deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error instanceof Error ? error.message : 'Error deleting user');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-white border border-gray-200 rounded-[24px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
        <p className="text-sm font-medium text-gray-400">Syncing Profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full"
    >
      {/* Header Bar - Solid green */}
      <div className="h-20 bg-gray-50 px-6 relative">
        <div className="absolute -bottom-8 left-6">
          <div className="h-16 w-16 rounded-2xl bg-white border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
            <div className="h-full w-full bg-green-50 flex items-center justify-center text-green-600 font-black text-2xl">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-6">
          <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full border border-green-200 uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md shadow-xs">
            <div className="h-1 w-1 rounded-full bg-green-600 animate-pulse" />
            Delivery Executive
          </span>
        </div>
      </div>

      <div className="pt-12 px-6 pb-6">
        {/* Name and Designation */}
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">{user.name}</h3>
        </motion.div>

        {/* Info Content */}
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="flex items-center gap-4 group/item">
            <div className="p-2.5 bg-gray-50 rounded-xl group-hover/item:bg-green-50 transition-colors">
              <Mail className="h-4 w-4 text-gray-400 group-hover/item:text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
              <p className="text-sm font-bold text-gray-700">{user.email}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-4 group/item">
            <div className="p-2.5 bg-gray-50 rounded-xl group-hover/item:bg-green-50 transition-colors">
              <Phone className="h-4 w-4 text-gray-400 group-hover/item:text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Mobile Contact</p>
              <p className="text-sm font-bold text-gray-700">{user.phone}</p>
            </div>
          </motion.div>

          {/* System ID Section - Green Theme */}
          <motion.div variants={itemVariants} className="mt-6 p-4 bg-green-50/50 border border-green-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-green-100">
                <Fingerprint className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-600 uppercase leading-none mb-1">EasySol System ID</p>
                <code className="text-sm font-mono font-black text-gray-900 tracking-wider">#{user.esId}</code>
              </div>
            </div>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </motion.div>
        </div>

        {/* Action Button - Green Theme */}
        <motion.div variants={itemVariants} className="mt-8">
          <DeleteUserButton userId={user.id} userName={user.name} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default UserInfoCard;