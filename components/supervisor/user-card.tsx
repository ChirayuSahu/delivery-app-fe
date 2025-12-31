'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  Fingerprint, 
  Loader2, 
  Copy,
  ArrowRight
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  esId: string;
  phone: string;
}

export function UserInfoCard({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      <Card className="border-slate-200 h-full flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
          <div className="absolute h-12 w-12 border-4 border-slate-100 rounded-full border-t-transparent animate-pulse" />
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">Syncing profile data...</p>
      </Card>
    );
  }

  if (!user) return null;

  return (
    <Card className="group border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col overflow-hidden bg-white">
      {/* Header / Banner Section */}
      <div className="relative shrink-0">
        <div className="px-6 -mt-12 pb-4 relative z-10">          
          <div className="flex justify-between items-center mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h3>
               <Badge className="text-xs bg-gray-50 border border-slate-400 text-slate-400 font-medium tracking-wide">Delivery Executive</Badge>
          </div>
        </div>
      </div>

      <CardContent className="px-6 py-6 flex-1 flex flex-col justify-between">
        {/* Contact Information */}
        <div className="space-y-5">
          <div className="flex flex-col gap-4">
            <div className="group/item flex items-center gap-4 cursor-pointer">
                <Mail className="h-5 w-5 text-slate-400 group-hover/item:text-indigo-600" />
              <div className="flex-1">
                <p className="text-md text-slate-400 font-bold uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-semibold text-slate-700">{user.email}</p>
              </div>
            </div>

            <div className="group/item flex items-center gap-4 cursor-pointer">
                <Phone className="h-5 w-5 text-slate-400 group-hover/item:text-indigo-600" />
              <div className="flex-1">
                <p className="text-md text-slate-400 font-bold uppercase tracking-widest">Mobile Contact</p>
                <p className="text-sm font-semibold text-slate-700">{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Employee ID Badge Area */}
          <div className="mt-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Fingerprint className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">EasySol ID</p>
                <code className="text-sm font-mono font-bold text-slate-700">#{user.esId}</code>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 mt-auto">
          <button className="group/btn w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:shadow-indigo-500/20">
            View Profile Analytics
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserInfoCard;