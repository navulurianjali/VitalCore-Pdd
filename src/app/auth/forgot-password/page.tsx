"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, ShieldCheck, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (!supabase) {
        setSuccessMsg("If an account exists for this email, password reset instructions have been dispatched.");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("If an account exists for this email, you will receive password reset instructions shortly.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-16 relative overflow-hidden auth-page">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_60%)]" />
      
      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        
        {/* Back Link */}
        <div>
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-primary font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Activity className="h-5 w-5" />
          </div>
          <h2 className="auth-subtitle tracking-tight text-center font-bold">Reset Password</h2>
          <p className="auth-helper text-[12px] flex items-center gap-1 justify-center">
            <ShieldCheck className="h-4 w-4 text-secondary/80" />
            VitalCore Security Subsystem
          </p>
        </div>

        <GlassCard glowColor="violet" className="border border-foreground/10 shadow-xl p-6">
          
          {successMsg ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-400 font-medium flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
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
              
              <Input
                label="Registered Email"
                icon={Mail}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />

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
