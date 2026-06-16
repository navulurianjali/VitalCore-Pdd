"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Activity, 
  Brain, 
  HeartPulse, 
  Sparkles, 
  Moon, 
  ArrowRight, 
  TrendingUp, 
  ShieldAlert, 
  Zap, 
  Shield, 
  Thermometer, 
  AlertTriangle,
  Smile,
  Compass,
  Layers,
  ChevronDown,
  CheckCircle,
  Scan
} from "lucide-react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {

  const features = [
    {
      title: "Your Future Health Trends",
      description: "Simple wellness insights that look at your habits to help you see patterns and stay healthy 3 to 6 months ahead.",
      icon: TrendingUp,
      color: "violet"
    },
    {
      title: "Burnout Warning Radar",
      description: "Flags small shifts in your sleep and recovery patterns early, helping you avoid fatigue before it starts.",
      icon: ShieldAlert,
      color: "rose"
    },
    {
      title: "Daily Fatigue & Energy Guide",
      description: "Checks your sleep quality, daily stress, and physical fatigue to guide you toward perfect rest.",
      icon: HeartPulse,
      color: "emerald"
    },
    {
      title: "Your Personal Wellness Coach",
      description: "A friendly wellness companion that checks in on your daily routine, prompts you to stay hydrated, and helps you organize your energy.",
      icon: Brain,
      color: "amber"
    },
    {
      title: "Weather-Smart Recommendations",
      description: "Checks local weather, temperatures, and air quality to automatically suggest perfect indoor alternatives when needed.",
      icon: Thermometer,
      color: "violet"
    },
    {
      title: "Focus & Mind Relaxer",
      description: "Tracks screen time and mental fatigue to help you take timely breaks, unwind, and clear your mind.",
      icon: Zap,
      color: "rose"
    }
  ];




  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden w-full max-w-[100vw]">
      {/* Premium Ambient Glow Orbs & Mesh Background */}
      <div className="absolute top-0 left-0 right-0 h-[900px] overflow-hidden pointer-events-none z-0">
        {/* Glow Orb 1 (Forest Sage Green) */}
        <div className="absolute -top-[15%] -left-[10%] w-[55%] aspect-square rounded-full bg-primary/15 blur-[120px] dark:bg-primary/5" />
        {/* Glow Orb 2 (Luxury Lavender/Lilac) */}
        <div className="absolute top-[15%] -right-[15%] w-[65%] aspect-square rounded-full bg-secondary/20 blur-[130px] dark:bg-secondary/5" />
        {/* Glow Orb 3 (Warm Terracotta Clay) */}
        <div className="absolute -top-[10%] left-[25%] w-[45%] aspect-square rounded-full bg-accent/12 blur-[100px]" />
      </div>
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-24 overflow-hidden z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT SIDE: Hero text copy */}
            <div className="lg:col-span-6 text-left space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 border border-primary/12 px-3 py-1 text-xs font-semibold text-primary"
              >
                <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse" />
                <span>Your Friendly Personal Wellness Companion</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[var(--foreground)] leading-[1.1]"
              >
                Understand your health before{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                  problems begin.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm sm:text-base text-foreground/75 leading-relaxed font-semibold max-w-xl"
              >
                Track fitness, sleep, nutrition, stress, and recovery in one simple, beautiful wellness platform designed for real people.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Link href="/auth/signup">
                  <Button variant="primary" size="lg" className="flex items-center gap-2 px-6 py-3 font-semibold shadow-sm hover:scale-[1.01] transition-transform">
                    <span>Start Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="glass" size="lg" className="px-6 py-3 font-semibold hover:bg-foreground/5 hover:scale-[1.01] transition-transform">
                    See How It Works
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* RIGHT SIDE: Interactive Wellness Simulator Widget */}
            <div className="lg:col-span-6 relative z-20 mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
                className="relative mx-auto max-w-lg lg:max-w-none w-full"
              >
                <div className="relative group p-4">
                  {/* Subtle glow effect behind the image */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-accent/10 to-secondary/30 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                  <img 
                    src="/images/hero_wellness.png" 
                    alt="VitalCore Wellness Tracking" 
                    className="relative z-10 w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-700 hover:scale-[1.02]" 
                  />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Thin horizontal minimal feature bar for breathing room and startup-like trust */}
      <section className="border-y border-foreground/5 py-8 bg-background/25">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-6 text-xs font-bold text-foreground/60">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span>Smart Wellness Companion</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-secondary" />
              <span>Adaptive Rest & Recovery Guidance</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              <span>Burnout Warning Radar</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS TIMELINE */}
      <section className="py-20 md:py-28 bg-[var(--card-bg)] relative z-10 border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-[var(--foreground)]">
              How It Works
            </h2>
            <p className="text-[15px] font-medium text-[var(--muted)] leading-relaxed">
              Four simple steps to transform your wellness journey.
            </p>
          </div>

          <div className="relative">
            {/* Horizontal Line connecting steps (hidden on mobile) */}
            <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-[var(--muted-bg)] z-0" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
              
              {/* STEP 1 */}
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="h-[88px] w-[88px] rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Scan className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Step 1</span>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Log Your Data</h3>
                  <p className="text-[13px] font-medium text-[var(--muted)] max-w-[220px] mx-auto leading-relaxed">
                    Track your daily meals, sleep duration, and physical activity easily.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="h-[88px] w-[88px] rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Step 2</span>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Get AI Insights</h3>
                  <p className="text-[13px] font-medium text-[var(--muted)] max-w-[220px] mx-auto leading-relaxed">
                    Our system identifies patterns in your health metrics and rest quality.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="h-[88px] w-[88px] rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Step 3</span>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Predict Trends</h3>
                  <p className="text-[13px] font-medium text-[var(--muted)] max-w-[220px] mx-auto leading-relaxed">
                    Use the Future Health Lab to see where your habits will lead you.
                  </p>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="h-[88px] w-[88px] rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Step 4</span>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Achieve Goals</h3>
                  <p className="text-[13px] font-medium text-[var(--muted)] max-w-[220px] mx-auto leading-relaxed">
                    Follow personalized daily recommendations to optimize your energy.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY CORE FEATURES GRID */}
      <section className="py-24 bg-background relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-[var(--foreground)]">
              Why Use VitalCore?
            </h2>
            <p className="text-[15px] font-medium text-[var(--muted)] leading-relaxed">
              Wellness management shouldn't be complicated. We empower you with the simple, actionable insights you need to stay energized and healthy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={index} 
                  className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 hover:border-primary/30 transition-colors flex flex-col items-start space-y-5"
                >
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">{feat.title}</h3>
                    <p className="text-[14px] text-[var(--muted)] leading-relaxed font-medium">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* 7. PRE-FOOTER CTA CONSOLE BLOCK */}
      <section className="py-20 bg-background relative border-t border-foreground/5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl glass-panel border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/5 p-8 md:p-12 text-center relative overflow-hidden space-y-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_60%)]" />
            
            <h2 className="text-2xl font-bold sm:text-4xl relative z-10">
              Ready to start your wellness journey?
            </h2>
            <p className="text-sm text-foreground/75 max-w-2xl mx-auto leading-relaxed relative z-10">
              Join today to start building healthy habits, track your daily energy and sleep quality, and get warm, supportive guidance from your AI Coach.
            </p>
            
            <div className="flex justify-center pt-2 relative z-10">
              <Link href="/auth/signup">
                <Button variant="primary" size="lg" className="flex items-center gap-2 px-8">
                  <span>Get Started</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
