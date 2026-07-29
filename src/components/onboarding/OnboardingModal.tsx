"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Brain, 
  Scan, 
  Sparkles, 
  Moon, 
  Droplet, 
  ShieldCheck, 
  TrendingUp, 
  ChevronRight, 
  X, 
  Check, 
  Heart, 
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides = [
  {
    id: "welcome",
    tag: "Welcome to VitalCore AI",
    title: "Not Just a Tracker — Your AI Health Companion",
    description: "Welcome! VitalCore AI goes beyond simple calorie counters. It is a complete, predictive healthcare ecosystem designed to understand your body, monitor your lifestyle, and keep you energized.",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    highlights: [
      "Real-time biometric monitoring",
      "Unified Web & Android synchronization",
      "Predictive preventive health insights"
    ]
  },
  {
    id: "aicoach",
    tag: "Meet Your AI Coach",
    title: "Personalized Guidance Driven by Real Data",
    description: "Your AI Wellness Coach analyzes your real-time sleep quality, hydration, stress levels, and recovery indices to provide empathetic, actionable advice tailored to your exact daily routine.",
    icon: Brain,
    color: "from-amber-500 to-orange-600",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    highlights: [
      "Understands your fatigue and stress load",
      "Gives specific, non-generic health advice",
      "Adapts continuously as your habits improve"
    ]
  },
  {
    id: "smarttracking",
    tag: "Smart Lifestyle Modules",
    title: "Sleep, Water & Fitness Integrated",
    description: "Every aspect of your health works together. Record sleep debt, track fluid hydration, and monitor workouts — all contributing to a complete, unified understanding of your wellness.",
    icon: Activity,
    color: "from-blue-500 to-cyan-600",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    highlights: [
      "Circadian sleep & wind-down schedules",
      "Hydration goals with smart reminders",
      "Comprehensive fitness analytics"
    ]
  },
  {
    id: "digitaltwin",
    tag: "The Digital Twin Engine",
    title: "Your Virtual Biometric Health Profile",
    description: "VitalCore AI continuously builds a dynamic Digital Twin model of your body. It learns from your body measurements, chronic conditions, injuries, sleep quality, and exercise to forecast your health baseline.",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    highlights: [
      "Living virtual biometric health model",
      "Calculates real-time biological age",
      "Monitors metabolic efficiency & stability"
    ]
  },
  {
    id: "futurelab",
    tag: "Flagship Feature",
    title: "Future Health Lab & Early Warning System",
    description: "Predict future health risks before they become serious! Our flagship module analyzes your lifestyle patterns to issue proactive warnings for burnout, sleep deficits, dehydration, and cardiovascular strain.",
    icon: TrendingUp,
    color: "from-emerald-500 to-cyan-600",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    highlights: [
      "Visual risk scores & 6-axis health radar",
      "Interactive Decision Impact Sandbox",
      "Coordinated daily longevity improvement plan"
    ]
  },
  {
    id: "security",
    tag: "Privacy & Sync",
    title: "Securely Stored & Synchronized Everywhere",
    description: "Your health data belongs to you. All your metrics are encrypted and safely stored in Supabase. Changes made on your phone automatically appear on the web application without requiring separate accounts.",
    icon: ShieldCheck,
    color: "from-teal-500 to-emerald-600",
    badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    highlights: [
      "Bank-grade Supabase RLS encryption",
      "Instant Web & Android cross-platform sync",
      "Used strictly for your personal health insights"
    ]
  }
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { updateProfile, profile } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const current = slides[currentSlide];
  const Icon = current.icon;
  const isLast = currentSlide === slides.length - 1;

  const markCompleted = async () => {
    try {
      if (typeof window !== "undefined" && profile?.id) {
        localStorage.setItem(`vitalcore_onboarding_${profile.id}_completed`, "true");
      }
      if (profile?.id) {
        await updateProfile({ onboarding_completed: true });
      }
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      markCompleted();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    markCompleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] shadow-2xl overflow-hidden flex flex-col justify-between max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${current.badgeColor}`}>
              {current.tag}
            </span>
            <span className="text-xs font-bold text-[var(--muted)]">
              {currentSlide + 1} of {slides.length}
            </span>
          </div>

          <button 
            onClick={handleSkip}
            className="text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors px-3 py-1.5 rounded-full hover:bg-foreground/5"
          >
            Skip Intro
          </button>
        </div>

        {/* Slide Content with Animation */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Icon Container */}
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-lg text-white shrink-0`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight leading-tight">
                    {current.title}
                  </h2>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-[var(--muted)] font-medium leading-relaxed">
                {current.description}
              </p>

              {/* Bullet Highlights */}
              <div className="space-y-2.5 pt-2">
                {current.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-[var(--foreground)]">{item}</span>
                  </div>
                ))}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Bar with Progress Indicators & Action Buttons */}
        <div className="p-6 border-t border-[var(--border)] bg-[var(--background)] flex items-center justify-between gap-4">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide 
                    ? "w-7 bg-primary" 
                    : "w-2 bg-foreground/20 hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <Button 
                variant="glass" 
                size="md"
                onClick={() => setCurrentSlide(prev => prev - 1)}
                className="text-xs font-bold px-4"
              >
                Back
              </Button>
            )}

            <Button 
              variant="primary" 
              size="md"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 font-bold shadow-md hover:scale-[1.02] transition-all"
            >
              <span>{isLast ? "Get Started" : "Next"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
