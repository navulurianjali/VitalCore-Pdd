"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, Mail, Lock, User, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

export default function SignupPage() {
  const { signUp, isMockMode } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await signUp(email, password, fullName, username);
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push("/auth/onboarding");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during secure sign-up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden auth-page">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_60%)]" />
      
      <div className="w-full max-w-[460px] relative z-10 space-y-6">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Activity className="h-5 w-5" />
          </Link>
          <h2 className="auth-subtitle tracking-tight text-center font-bold">Initialize Longevity Profile</h2>
          <p className="auth-helper text-[12px] flex items-center gap-1 justify-center">
            <ShieldCheck className="h-4 w-4 text-secondary/80" />
            Biometric Enrolment Portal
          </p>
        </div>

        <GlassCard glowColor="violet" className="border border-foreground/10 shadow-xl">
          
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400 font-medium flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="auth-label">Explorer Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-foreground placeholder-foreground/35 focus:outline-none input-with-icon"
                  placeholder="e.g. David R."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="auth-label">Unique Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-foreground placeholder-foreground/35 focus:outline-none input-with-icon"
                  placeholder="e.g. davidr_longevity"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="auth-label">Secure Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-foreground placeholder-foreground/35 focus:outline-none input-with-icon"
                  placeholder="david@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="auth-label">Encryption Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-foreground placeholder-foreground/35 focus:outline-none input-with-icon"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <Button variant="primary" type="submit" isLoading={loading} className="w-full mt-2 font-semibold">
              Initialize Profile Console
            </Button>

          </form>

          <div className="mt-5 border-t border-foreground/5 pt-4 text-center text-xs text-foreground/60 font-medium">
            Already registered?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Enter secure console
            </Link>
          </div>

        </GlassCard>

      </div>
    </div>
  );
}
