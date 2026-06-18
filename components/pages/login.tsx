"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, Package, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                toast.success("Welcome back! Login successful.");
                router.push("/dashboard");
            } else {
                toast.error(data.message || "Invalid credentials. Please try again.");
                console.log("Login error:", data);
            }
        } catch (err) {
            toast.error("Network error. Please try again later.");
            console.error("Login catch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin(e as unknown as React.FormEvent);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 overflow-hidden">
            {/* Top-right subtle glow matching the v2.0 live pill theme */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-200/10 blur-[100px] pointer-events-none" />
            
            {/* Main Wrapper */}
            <div className="w-full max-w-md z-10 space-y-6">
                {/* Branding/Logo */}
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-sm bg-green-600 text-white shadow-md transform transition-transform hover:scale-105 duration-300">
                        <Package className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-3">
                        {process.env.NEXT_PUBLIC_COMPANY_NAME || "Rajesh Pharma"}
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                        Logistics & Invoice Portal
                    </p>
                </div>

                {/* Light Card container using standard shadcn Card components for perfect uniformity */}
                <Card className="w-full shadow-lg border-slate-100 bg-white">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold text-center text-slate-900">Agent Sign In</CardTitle>
                        <CardDescription className="text-center text-slate-500 text-xs">
                            Please log in with your credentials to access your session.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4" onKeyDown={handleKeyDown}>
                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-bold text-slate-700 tracking-wider">
                                EMAIL ADDRESS
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 placeholder-slate-400 focus:border-green-600 transition-all text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-bold text-slate-700 tracking-wider">
                                PASSWORD
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2 bg-white text-slate-900 placeholder-slate-400 focus:border-green-600 transition-all text-sm outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-605 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-2 pb-6">
                        <Button
                            disabled={loading}
                            onClick={handleLogin}
                            className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-sm shadow-sm active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Signing you in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Footer Copyright */}
                <p className="text-center text-xs text-slate-400">
                    © 2026 {process.env.NEXT_PUBLIC_COMPANY_NAME || "Rajesh Pharma"}. All rights reserved.
                </p>
            </div>
        </div>
    );
}