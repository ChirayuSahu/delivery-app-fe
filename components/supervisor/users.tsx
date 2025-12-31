'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, ChevronRight, Search, Phone, Fingerprint } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from "@/components/ui/input";

type User = {
  id: string;
  name: string;
  email: string;
  esId: string;
  phone: string;
}

const dummyUsers = Array.from({ length: 10 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  esId: `ES${1000 + i}`,
  phone: `+1234567890${i}`
}));

function UsersCard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p className="text-sm text-slate-500 font-medium">Loading team...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden flex flex-col min-h-full pt-0">
      <CardHeader className="border-b bg-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
                Delivery Team
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium">{users.length} registered personnel</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto scrollbar-thin h-20 scrollbar-thumb-slate-200">
        {users.length > 0 ? (
          <div className="flex flex-col gap-4 divide-slate-50">
            {users.map((user) => (
              <Link key={user.id} href={`${pathname}/users/${user.id}`}>
                <div className="group flex items-center justify-between py-3 px-4 hover:bg-blue-50/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Fingerprint className="h-3 w-3" /> {user.esId}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Phone className="h-3 w-3" /> {user.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-full text-slate-400 py-10">
            <Search className="h-10 w-10 mb-2 opacity-10" />
            <p className="text-sm font-medium">No team members found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UsersCard;