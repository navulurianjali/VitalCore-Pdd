"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { useHealthData, HealthDigitalTwin } from "@/hooks/useHealthData";
import {
  Activity, ArrowRight, Brain, Clock, Droplet, Flame, Heart, 
  Leaf, Milestone, Moon, ShieldAlert, Sparkles, Target, 
  TrendingDown, TrendingUp, Zap, Footprints
} from "lucide-react";

import {
  getFutureHealthScore,
  getHabitEvolution,
  getFoodEvolution,
  getEarlyWarnings,
  getFutureTimeline,
  getHealthMilestoneForecast,
  getPersonalizedStory,
  simulateDecisionImpact
} from "@/utils/futureLabEngine";

export default function FutureHealthLabPage() {
  const { profile } = useAuth();
  const { metrics, loading } = useHealthData();
  
  const [simSleep, setSimSleep] = useState(0);
  const [simWater, setSimWater] = useState(0);
  const [simSteps, setSimSteps] = useState(0);

  if (loading || !metrics) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-[var(--muted)]">Entering Future Health Lab...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate Modules
  const healthScore = getFutureHealthScore(metrics);
  const habitEvo = getHabitEvolution(metrics);
  const foodEvo = getFoodEvolution(metrics);
  const earlyWarnings = getEarlyWarnings(metrics);
  const timeline = getFutureTimeline(metrics, profile?.biological_age || 30);
  const milestones = getHealthMilestoneForecast(metrics);
  const storyFeed = getPersonalizedStory(metrics);
  const simImpact = simulateDecisionImpact(metrics, simSleep, simWater, simSteps);

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-12">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
            <Sparkles className="w-40 h-40 text-primary animate-pulse" />
          </div>
          <div className="space-y-3 relative z-10">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full">Premium Feature</span>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
              Future Health Lab
            </h1>
            <p className="text-base text-[var(--muted)] font-medium max-w-2xl leading-relaxed">
              Your personal health future simulator. Understand where your habits are leading you, identify risks before they happen, and discover your potential.
            </p>
          </div>
        </div>

        {/* 1. FUTURE HEALTH SCORE & 6. FUTURE SELF PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard glowColor={healthScore.direction === 'Improving' ? 'emerald' : healthScore.direction === 'Declining' ? 'rose' : 'none'} className="p-8">
            <div className="space-y-6 h-full flex flex-col justify-center">
              <div>
                <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Current Health Direction
                </h2>
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${healthScore.direction === 'Improving' ? 'bg-emerald-500/10' : healthScore.direction === 'Declining' ? 'bg-rose-500/10' : 'bg-blue-500/10'}`}>
                    {healthScore.direction === 'Improving' ? <TrendingUp className="h-8 w-8 text-emerald-500" /> : 
                     healthScore.direction === 'Declining' ? <TrendingDown className="h-8 w-8 text-rose-500" /> : 
                     <Activity className="h-8 w-8 text-blue-500" />}
                  </div>
                  <h3 className={`text-4xl font-black uppercase tracking-wider ${healthScore.direction === 'Improving' ? 'text-emerald-500' : healthScore.direction === 'Declining' ? 'text-rose-500' : 'text-blue-500'}`}>
                    {healthScore.direction}
                  </h3>
                </div>
              </div>
              <p className="text-base text-[var(--foreground)] font-medium leading-relaxed bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)]">
                {healthScore.explanation}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Future Self Preview
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-3">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
                  <span className="text-xl font-bold">You</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--muted)] uppercase">Current</h4>
                  <p className="text-sm font-black text-[var(--foreground)]">Age {profile?.biological_age || 30}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/5">
                  <span className="text-2xl font-bold text-primary">You</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-primary uppercase">30 Days</h4>
                  <p className="text-sm font-black text-[var(--foreground)]">Age {timeline[1].vitalityAge}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-24 w-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shadow-xl shadow-primary/10">
                  <span className="text-3xl font-black text-primary">You</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-primary uppercase">90 Days</h4>
                  <p className="text-sm font-black text-[var(--foreground)]">Age {timeline[2].vitalityAge}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 2. FUTURE HEALTH TIMELINE */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 px-2">
            <Milestone className="h-6 w-6 text-primary" /> Future Health Timeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeline.map((t, i) => (
              <GlassCard key={i} className="p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Clock className="w-24 h-24 text-[var(--foreground)]" />
                </div>
                <span className="text-xs font-black text-primary uppercase tracking-widest mb-4 block">{t.label} Project</span>
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--muted)] font-medium">Energy</span>
                    <span className="font-bold">{t.energy}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--muted)] font-medium">Recovery</span>
                    <span className="font-bold">{t.recovery}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--muted)] font-medium">Sleep</span>
                    <span className="font-bold">{t.sleep}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--muted)] font-bold uppercase text-[10px]">Vitality Age</span>
                    <span className="font-black text-emerald-500">{t.vitalityAge}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3. HABIT EVOLUTION CENTER */}
          <GlassCard className="p-8 space-y-6">
            <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-500" /> Habit Evolution Center
            </h2>
            <div className="space-y-4">
              {habitEvo.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                  <span className="font-bold text-sm">{h.habit}</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    h.status === 'Growing' ? 'bg-emerald-500/10 text-emerald-500' :
                    h.status === 'Stable' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {h.status}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 4. FOOD EVOLUTION TRACKER */}
          <GlassCard className="p-8 space-y-6">
            <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" /> Food Evolution Tracker
            </h2>
            <div className="space-y-4">
              {foodEvo.map((f, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  f.isPositive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                }`}>
                  <div className="mt-0.5">
                    {f.isPositive ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                  </div>
                  <span className="text-sm font-medium">{f.trend}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            {/* 7. DECISION IMPACT TOOL */}
            <GlassCard glowColor="violet" className="p-8 space-y-8">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-violet-500" /> Decision Impact Tool
                </h2>
                <span className="text-[10px] uppercase font-bold bg-violet-500/10 text-violet-500 px-3 py-1.5 rounded-full">Live Sandbox</span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-[var(--foreground)] flex justify-between mb-3">
                    <span className="flex items-center gap-2"><Moon className="h-4 w-4 text-violet-500" /> What if I sleep...</span>
                    <span className="font-black text-violet-500">{simSleep > 0 ? `+${simSleep}` : simSleep} hrs</span>
                  </label>
                  <input type="range" min="-2" max="2" step="0.5" value={simSleep} onChange={(e) => setSimSleep(Number(e.target.value))} className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-violet-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--foreground)] flex justify-between mb-3">
                    <span className="flex items-center gap-2"><Droplet className="h-4 w-4 text-emerald-500" /> What if I drink...</span>
                    <span className="font-black text-emerald-500">{simWater > 0 ? `+${simWater}` : simWater} ml</span>
                  </label>
                  <input type="range" min="-1000" max="2000" step="250" value={simWater} onChange={(e) => setSimWater(Number(e.target.value))} className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-emerald-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--foreground)] flex justify-between mb-3">
                    <span className="flex items-center gap-2"><Footprints className="h-4 w-4 text-amber-500" /> What if I walk...</span>
                    <span className="font-black text-amber-500">{simSteps > 0 ? `+${simSteps}` : simSteps} steps</span>
                  </label>
                  <input type="range" min="-3000" max="10000" step="1000" value={simSteps} onChange={(e) => setSimSteps(Number(e.target.value))} className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                <div className="bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)] text-center">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">Energy Impact</span>
                  <span className="text-2xl font-black text-primary">{simImpact.energyProjected}%</span>
                </div>
                <div className="bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)] text-center">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">Burnout Risk</span>
                  <span className={`text-2xl font-black ${simImpact.burnoutRiskProjected > 60 ? 'text-rose-500' : 'text-emerald-500'}`}>{simImpact.burnoutRiskProjected}%</span>
                </div>
              </div>
            </GlassCard>

            {/* 10. PERSONALIZED HEALTH STORY */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 px-2">
                <Heart className="h-5 w-5 text-rose-500" /> Personalized Health Story
              </h2>
              <div className="space-y-3">
                {storyFeed.map((story, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex gap-4 items-start shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4 text-rose-500" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{story}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            
            {/* 5. EARLY WARNING SYSTEM & 9. HEALTH RISK RADAR */}
            <GlassCard className="p-8 space-y-6 border border-rose-500/20 shadow-sm shadow-rose-500/5">
              <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2 mb-2">
                <ShieldAlert className="h-4 w-4 text-rose-500" /> Early Warning System
              </h2>
              {earlyWarnings.length === 0 ? (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-sm font-medium text-emerald-500 text-center">
                  All systems clear. No incoming health risks detected.
                </div>
              ) : (
                <div className="space-y-4">
                  {earlyWarnings.map((w, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${w.severity === 'high' ? 'bg-rose-500/5 border-rose-500/30 shadow-sm shadow-rose-500/10' : 'bg-amber-500/5 border-amber-500/30 shadow-sm shadow-amber-500/10'} flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`h-2 w-2 rounded-full ${w.severity === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span className="text-xs font-bold uppercase tracking-wider">{w.type} Risk</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed mb-4">{w.message}</p>
                      </div>
                      <button onClick={() => alert(`${w.actionTrigger} initiated!`)} className={`w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${w.severity === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'}`}>
                        {w.actionTrigger || 'Acknowledge Risk'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* 8. HEALTH MILESTONE FORECAST */}
            <GlassCard className="p-8 space-y-6">
              <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2 mb-2">
                <Milestone className="h-4 w-4 text-blue-500" /> Milestone Forecast
              </h2>
              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Award className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-bold">{m}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

// Needed imported icon not defined earlier
import { Award } from "lucide-react";
