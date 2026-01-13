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
import { motion, Variants } from "motion/react";

type User = {
  id: string;
  name: string;
  email: string;
  esId: string;
  phone: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { x: -10, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export function UsersCard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  const pathname = usePathname();

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

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.esId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  if (loading) {
    return (
      <div className="w-full h-120 bg-white border border-gray-200 rounded-[24px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading Personnel...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-[24px] overflow-hidden flex flex-col shadow-sm min-h-100 h-120">
      {/* Header - Matches your Profile/Trip UI */}
      <div className="bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md text-slate-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Delivery Team</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{users.length} Personnel</p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center shadow-sm">
            <UserCheck className="h-4 w-4 text-green-600" />
          </div>
        </div>

        {/* Search Input inside Header */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-500/20 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white/20 transition-all font-medium"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-150 scrollbar-hide">
        {filteredUsers.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-gray-50"
          >
            {filteredUsers.map((user) => (
              <Link key={user.id} href={`${pathname}/users/${user.id}`}>
                <motion.div
                  variants={itemVariants}
                  className="group flex items-center justify-between py-4 px-6 hover:bg-blue-50/50 transition-all cursor-pointer border-l-4 border-transparent hover:border-blue-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-blue-600 font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-tight">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          <Fingerprint className="h-3 w-3 text-green-500" /> #{user.esId}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          <Phone className="h-3 w-3 text-blue-500" /> {user.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="p-6 bg-gray-50 rounded-full mb-4 border border-dashed border-gray-200">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h4 className="text-gray-900 font-bold text-sm">No Members Found</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersCard;