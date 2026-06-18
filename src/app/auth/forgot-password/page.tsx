"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, ShieldCheck, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { supabase } from "@/utils/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // VULN-06 FIX: Actually call Supabase password reset API
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login`,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden auth-page">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_60%)]" />
      
      <div className="w-full max-w-[440px] relative z-10 space-y-6">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Activity className="h-5 w-5" />
          </Link>
          <h2 className="auth-subtitle tracking-tight text-center font-bold">Recover Credentials</h2>
          <p className="auth-helper text-[12px] flex items-center gap-1 justify-center">
            <ShieldCheck className="h-4 w-4 text-secondary/80" />
            Security Reset Tunnel
          </p>
        </div>

        <GlassCard glowColor="violet" className="border border-foreground/10 shadow-xl">
          
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="h-10 w-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mx-auto text-lg font-bold">
                ✓
              </div>
              <h3 className="text-sm font-semibold tracking-tight">Reset Link Transmitted</h3>
              <p className="text-[13px] text-foreground/70 leading-relaxed font-medium">
                If <strong>{email}</strong> is registered, you will receive a password reset link shortly. Check your inbox and spam folder.
              </p>
              <Link href="/auth/login" className="block pt-2">
                <Button variant="glass" className="w-full font-semibold">
                  Return to secure log in
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[13px] text-foreground/75 leading-relaxed font-medium">
                Enter your registered email address. We will send you a secure link to reset your password.
              </p>

              {errorMsg && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400 font-medium flex items-center gap-2">
                  <span className="shrink-0">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="auth-label">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-foreground placeholder-foreground/35 focus:outline-none input-with-icon"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <Button variant="primary" type="submit" isLoading={loading} className="w-full mt-2 font-semibold">
                Send Reset Link
              </Button>

            </form>
          )}

        </GlassCard>

      </div>
    </div>
  );
}

