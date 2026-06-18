'use client';

import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Fingerprint,
  Loader2,
  ShieldCheck,
  Wallet,
  Shield,
  Settings,
  Power
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AdminPinSettings } from "@/components/dashboard/admin-pin-settings";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  esId: string;
  phone: string;
  wallet: number;
  permissions?: string[];
  isActive?: boolean;
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

const AVAILABLE_PERMISSIONS = [
  { id: "read:delivery", label: "Read Deliveries" },
  { id: "write:delivery", label: "Write Deliveries" },
  { id: "read:finance", label: "Read Finance" },
  { id: "write:finance", label: "Write Finance" },
  { id: "read:report", label: "Read Reports & Attendance" },
];

export function UserInfoCard({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isUpdatingPerms, setIsUpdatingPerms] = useState(false);
  const [permsOpen, setPermsOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const json = await response.json();
        setUser(json.data);
        setPermissions(json.data?.permissions || []);
      } catch (error) {
        console.error("Error fetching user detail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [userId]);

  const handleUpdatePermissions = async () => {
    setIsUpdatingPerms(true);
    try {
      const res = await fetch(`/api/users/${userId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Permissions updated successfully");
        setPermsOpen(false);
        setUser(prev => prev ? { ...prev, permissions } : null);
      } else {
        toast.error(json.message || "Failed to update permissions");
      }
    } catch (err) {
      toast.error("Error updating permissions");
      console.error(err);
    } finally {
      setIsUpdatingPerms(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextActiveState = user?.isActive === false; // true if currently false (disabled), false if currently active
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActiveState }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(nextActiveState ? "User activated successfully" : "User disabled successfully");
        setUser(prev => prev ? { ...prev, isActive: nextActiveState } : null);
      } else {
        toast.error(json.message || "Failed to update user status");
      }
    } catch (err) {
      toast.error("Error updating user status");
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
      className="w-full bg-white border border-slate-100 rounded-sm p-6 shadow-sm space-y-6"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-sm bg-green-50 flex items-center justify-center text-green-700 font-extrabold text-2xl border border-green-100/50">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{user.name}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Agent Details</p>
          </div>
        </div>
        
        {user.isActive !== false ? (
          <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-sm border border-green-100/50 uppercase tracking-wider flex items-center gap-1.5 animate-in fade-in duration-350">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
            Active
          </span>
        ) : (
          <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-sm border border-red-100/50 uppercase tracking-wider flex items-center gap-1.5 animate-in fade-in duration-350">
            <span className="h-1.5 w-1.5 rounded-full bg-red-650" />
            Disabled
          </span>
        )}
      </div>

      {/* Info Content */}
      <div className="space-y-5">
        <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
          <div className="p-2.5 bg-slate-50 rounded-sm group-hover:bg-green-50 transition-colors">
            <Mail className="h-4.5 w-4.5 text-slate-400 group-hover:text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</p>
            <p className="text-sm font-semibold text-slate-800">{user.email}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
          <div className="p-2.5 bg-slate-50 rounded-sm group-hover:bg-green-50 transition-colors">
            <Phone className="h-4.5 w-4.5 text-slate-400 group-hover:text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mobile Contact</p>
            <p className="text-sm font-semibold text-slate-800">{user.phone}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
          <div className="p-2.5 bg-slate-50 rounded-sm group-hover:bg-green-50 transition-colors">
            <Wallet className="h-4.5 w-4.5 text-slate-400 group-hover:text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Wallet Balance</p>
            <p className="text-sm font-semibold text-slate-800">₹{user.wallet?.toFixed(2) || '0.00'}</p>
          </div>
        </motion.div>

        {/* System ID Section */}
        <motion.div variants={itemVariants} className="p-4 bg-slate-50/50 border border-slate-100 rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-sm shadow-xs border border-slate-100">
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

      {/* Action Button - Green Theme */}
      <motion.div variants={itemVariants} className="pt-5 border-t border-slate-100 flex flex-wrap gap-3">
        <AdminPinSettings userId={user.id} userName={user.name} />
        
        {/* Edit Permissions Modal */}
        <Dialog open={permsOpen} onOpenChange={setPermsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-sm text-xs font-bold text-slate-700 cursor-pointer">
              <Shield className="w-3.5 h-3.5" />
              Permissions
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-sm">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-650" />
                Manage Page Permissions
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure which panels and views {user.name} is authorized to access.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3.5 py-4 border-y border-slate-100 my-2">
              {AVAILABLE_PERMISSIONS.map((permission) => {
                const isChecked = permissions.includes(permission.id);
                return (
                  <label key={permission.id} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setPermissions(prev =>
                          isChecked
                            ? prev.filter(p => p !== permission.id)
                            : [...prev, permission.id]
                        );
                      }}
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500 h-4.5 w-4.5"
                    />
                    <span>{permission.label}</span>
                  </label>
                );
              })}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" size="sm" onClick={() => setPermsOpen(false)} disabled={isUpdatingPerms} className="rounded-sm">
                Cancel
              </Button>
              <Button onClick={handleUpdatePermissions} disabled={isUpdatingPerms} className="bg-green-600 hover:bg-green-700 rounded-sm text-white font-bold size-sm gap-2">
                {isUpdatingPerms ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enable / Disable User Toggle */}
        <Button
          variant={user.isActive !== false ? "destructive" : "default"}
          size="sm"
          disabled={isUpdatingStatus}
          onClick={handleToggleStatus}
          className={`gap-1.5 rounded-sm text-xs font-bold cursor-pointer transition-colors ${
            user.isActive !== false
              ? "bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 border border-red-200/50"
              : "bg-green-600 hover:bg-green-700 text-white border-0"
          }`}
        >
          {isUpdatingStatus ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Power className="w-3.5 h-3.5" />
              <span>{user.isActive !== false ? "Disable" : "Enable"}</span>
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default UserInfoCard;