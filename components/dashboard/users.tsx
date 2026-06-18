'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Loader2,
  ChevronRight,
  Search,
  Phone,
  Fingerprint,
  UserCheck
} from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, Variants } from "framer-motion";
import { useAuth } from '@/components/providers/auth-provider';

type User = {
  id: string;
  name: string;
  email: string;
  esId: string;
  phone: string;
  time: Date[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

import { useRef } from 'react';

interface Props {
  onInitialLoad?: () => void;
}

export function UsersCard({ onInitialLoad }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  const pathname = usePathname();
  const { userRole } = useAuth();
  const rolePrefix = userRole?.toLowerCase() || 'admin';

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const json = await response.json();
        setUsers(json.data || []);
      } catch (error) {
        console.error("Error fetching team:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const hasReportedLoad = useRef(false);
  useEffect(() => {
    if (!loading && !hasReportedLoad.current) {
      hasReportedLoad.current = true;
      onInitialLoad?.();
    }
  }, [loading, onInitialLoad]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.esId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  if (loading) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-xl p-12 flex flex-col items-center justify-center shadow-sm">
        <Loader2 className="animate-spin h-5 w-5 text-slate-400 mb-2" />
        <span className="text-xs text-slate-400 font-medium">Loading team...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[450px] bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-3 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-900">Delivery Team</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-0.5 rounded text-[10px] font-semibold text-slate-600 border border-slate-200/25">
          {users.length} {users.length === 1 ? 'member' : 'members'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100">
        {filteredUsers.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredUsers.map((user) => (
              <Link key={user.id} href={`/dashboard/${rolePrefix}/users/${user.id}`} className="block">
                <motion.div
                  variants={itemVariants}
                  className="group flex items-center justify-between py-3.5 px-5 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs group-hover:bg-slate-200 transition-colors">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 leading-normal">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-0.5">
                          <Fingerprint className="h-3 w-3 text-slate-400" />
                          #{user.esId}
                        </span>
                        <span className="h-1 w-1 bg-slate-200 rounded-full" />
                        <span className="flex items-center gap-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {user.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {user.time.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {user.time.map((deltime, index) => {
                          const mins = Math.ceil((new Date().getTime() - new Date(deltime).getTime()) / 60000);
                          return (
                            <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                              <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                              {mins}m ago
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="text-slate-900 font-semibold text-sm">No members found</h4>
            <p className="text-xs text-slate-400 mt-0.5">Try adding a new member to your team.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersCard;