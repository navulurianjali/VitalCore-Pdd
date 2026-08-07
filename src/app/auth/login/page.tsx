"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-16 relative overflow-hidden auth-page">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_60%)]" />
      
      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Activity className="h-5 w-5" />
          </Link>
          <h2 className="auth-subtitle tracking-tight text-center font-bold">Welcome Back</h2>
          <p className="auth-helper text-[12px] flex items-center gap-1 justify-center">
            <ShieldCheck className="h-4 w-4 text-secondary/80" />
            Log in to your VitalCore account
          </p>
        </div>

        <GlassCard glowColor="violet" className="border border-foreground/10 shadow-xl p-6">
          
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400 font-medium flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            <Input
              label="Email Address"
              icon={Mail}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground/80">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <Input
                icon={Lock}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button variant="primary" type="submit" isLoading={loading} className="w-full mt-2 font-semibold">
              Log In
            </Button>

          </form>

          <div className="mt-5 border-t border-foreground/5 pt-4 text-center text-xs text-foreground/60 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/auth/get-started" className="font-semibold text-primary hover:underline">
              Sign Up Free
            </Link>
          </div>

        </GlassCard>

      </div>
    </div>
  );
}
