"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, ArrowRight, LogIn, UserPlus, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";

export default function AuthChoicePage() {
  const { user } = useAuth();
  const router = useRouter();

  // If already authenticated, send straight to dashboard
  if (user) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden auth-page">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_60%)]" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] aspect-square rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 space-y-6">

        {/* Logo & heading */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3"
        >
          <Link
            href="/"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
          >
            <Activity className="h-6 w-6" />
          </Link>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 border border-primary/12 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse" />
              <span>Your Health, Reimagined</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome to VitalCore AI
            </h1>
            <p className="text-sm text-foreground/60 font-medium">
              Continue your health journey.
            </p>
          </div>
        </motion.div>

        {/* Choice card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <GlassCard glowColor="emerald" className="border border-foreground/10 shadow-sm p-6 space-y-5">

            {/* Create Account — primary action */}
            <div className="space-y-2">
              <p className="text-[14px] font-medium text-foreground/75">
                New to VitalCore?
              </p>
              <Link href="/auth/signup" className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-between gap-2 px-4 h-10.5 shadow-sm shadow-primary/10 group"
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="h-4.5 w-4.5 shrink-0" />
                    <span className="text-[15px] font-medium">Create an account</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Button>
              </Link>
            </div>

            {/* Log In — secondary action */}
            <div className="space-y-2">
              <p className="text-[14px] font-medium text-foreground/75">
                Already have an account?
              </p>
              <Link href="/auth/login" className="block">
                <Button
                  variant="glass"
                  size="md"
                  className="w-full flex items-center justify-between gap-2 px-4 h-10.5 border border-foreground/10 hover:border-primary/30 group"
                >
                  <div className="flex items-center gap-2.5">
                    <LogIn className="h-4.5 w-4.5 shrink-0" />
                    <span className="text-[15px] font-medium">Log in</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Button>
              </Link>
            </div>

          </GlassCard>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/"
            className="text-xs text-foreground/40 hover:text-foreground/70 font-medium transition-colors"
          >
            ← Back to home
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
