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
  ChevronDown
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


  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does VitalCore predict future health changes?",
      answer: "VitalCore looks at your daily habits – like sleep quality, heart rate trends, active steps, stress levels, and meals. By noticing small changes in these numbers over time, we can show you how your energy is trending and help you stay ahead of burnout before you even start feeling tired."
    },
    {
      question: "What is the Burnout Warning Radar?",
      answer: "It's easy to miss tiny daily shifts, like sleeping 15 minutes less each night or having slightly higher stress. The warning radar spots these slow, creeping patterns early, letting you know with friendly tips (like: 'Your sleep has been a little short this week, let's take it easy today!') so you can recharge before feeling drained."
    },
    {
      question: "How do the Elderly and Beginner Modes work?",
      answer: "You can easily switch modes in the top navigation bar! Beginner Mode makes charts simpler and offers daily activity tips, while Elderly Mode uses larger, high-contrast text, simplifies the screen, and focuses entirely on easy, important goals like gentle stretching, water reminders, and daily walks."
    },
    {
      question: "How secure is my wellness data?",
      answer: "Your privacy is our top priority. If you're using our standard Mock Mode, everything you track stays completely private on your own device – none of your data ever leaves your browser. If you choose to connect an account to our secure cloud, your personal logs are strictly locked to you, ensuring nobody else can ever access them."
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
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

            {/* RIGHT SIDE: Visual representation */}
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
                className="relative mx-auto max-w-xl lg:max-w-none"
              >
                <div className="rounded-[28px] overflow-hidden border border-foreground/5 bg-[var(--card-bg)] shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-2 relative group">
                  {/* Subtle soft gradient */}
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary/8 via-secondary/8 to-accent/5 rounded-[30px] blur-lg opacity-40" />
                  
                  <div 
                    className="relative rounded-[22px] overflow-hidden border border-foreground/5 aspect-[16/10] bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/saas_background.png')" }}
                  >
                    {/* Dark gradient visual layer for professional depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Floating elegant glass panel */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-[16px] bg-background/70 backdrop-blur-xl border border-white/5 text-left space-y-1 shadow-xl max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[8px] font-bold text-foreground/75 uppercase tracking-widest">Wellness Twin</span>
                      </div>
                      <h3 className="text-xs font-bold text-foreground">Today's Energy Balance</h3>
                      <p className="text-[10px] text-foreground/60 leading-normal font-semibold">
                        Rest routine successfully applied. Your body is recharging beautifully today.
                      </p>
                    </div>
                  </div>
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


      {/* 3. KEY CORE FEATURES GRID */}
      <section className="py-20 bg-background relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <motion.h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI Preventive Architecture Features
            </motion.h2>
            <p className="text-sm text-foreground/75 leading-relaxed">
              VitalCore replaces complicated trackers with a single, simple wellness companion designed to help you stay healthy and feel energized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <GlassCard key={index} glowColor={feat.color as any} className="space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{feat.title}</h3>
                  <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                    {feat.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS SLIDER SECTION */}
      <section className="py-20 bg-background/50 relative border-t border-foreground/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl font-bold">Real Success Stories</h2>
            <p className="text-sm text-foreground/60 font-semibold">what our members say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <GlassCard glowColor="violet" className="flex flex-col justify-between min-h-[220px]">
              <p className="text-xs text-foreground/75 leading-relaxed font-medium italic">
                "As a lead software developer working long hours, I was always feeling tired. VitalCore's fatigue checks noticed when my energy was dropping and gently suggested a lighter routine. Swapping to active recovery saved my energy!"
              </p>
              <div className="border-t border-foreground/5 pt-4 mt-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/25 font-bold text-xs flex items-center justify-center text-primary">DR</div>
                <div>
                  <h4 className="text-xs font-bold">David R.</h4>
                  <p className="text-xs text-foreground/50">Lead Developer</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard glowColor="emerald" className="flex flex-col justify-between min-h-[220px]">
              <p className="text-xs text-foreground/75 leading-relaxed font-medium italic">
                "I turned on the Elderly Mode for my grandfather. The large text, bright water meters, and gentle joint stretching routines are perfect for him. It's so easy to read, and it helps our family stay connected and look out for him."
              </p>
              <div className="border-t border-foreground/5 pt-4 mt-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary/25 font-bold text-xs flex items-center justify-center text-secondary">LK</div>
                <div>
                  <h4 className="text-xs font-bold">Linda K.</h4>
                  <p className="text-xs text-foreground/50">Family Circle Administrator</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard glowColor="rose" className="flex flex-col justify-between min-h-[220px]">
              <p className="text-xs text-foreground/75 leading-relaxed font-medium italic">
                "The Environmental AI is magical. On days with poor AQI air quality or high heat warnings in Arizona, VitalCore instantly recalculates my running schedule to suggest respiratory-safe indoor resistance workouts. Absolute game changer!"
              </p>
              <div className="border-t border-foreground/5 pt-4 mt-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/25 font-bold text-xs flex items-center justify-center text-accent">SM</div>
                <div>
                  <h4 className="text-xs font-bold">Sarah M.</h4>
                  <p className="text-xs text-foreground/50">Competitive Triathlete</p>
                </div>
              </div>
            </GlassCard>

          </div>
        </div>
      </section>


      {/* 6. FAQ COLLAPSIBLE ACCORDION */}
      <section className="py-20 bg-background/30 relative border-t border-foreground/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-sm text-foreground/60 font-semibold">answers to common questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl glass-panel border border-foreground/5 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-foreground hover:bg-foreground/5 transition-colors focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 text-foreground/60 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-foreground/75 leading-relaxed font-medium border-t border-foreground/5">
                      {faq.answer}
                    </div>
                  )}
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
