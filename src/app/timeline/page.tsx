"use client";

import React, { useState, useEffect } from "react";
import { 
  Milestone, TrendingUp, Sparkles, Layers, ShieldAlert, Award, Calendar, Heart, 
  Activity, Droplet, Moon, Footprints, Zap, Brain, Leaf, Shield, Flame, Target, Trophy, Clock,
  ChevronRight, ArrowRight, PlayCircle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useHealthData } from "@/hooks/useHealthData";
import { calculateFutureHealthPredictions, getLongTermProjections, LongTermProjection } from "@/utils/predictiveEngine";

export default function TimelinePage() {
  const { profile } = useAuth();
  const { activeMode } = useTheme();
  const { metrics, loading } = useHealthData();
  
  // Simulator States
  const [simSleep, setSimSleep] = useState<number>(0);
  const [simWater, setSimWater] = useState<number>(0);
  const [simSteps, setSimSteps] = useState<number>(0);
  const [simScreen, setSimScreen] = useState<number>(0);
  
  const [activeProjectionDay, setActiveProjectionDay] = useState(30);

  useEffect(() => {
    if (metrics) {
      setSimSleep(metrics.sleepHours || 7.5);
      setSimWater(metrics.hydrationMl || 2000);
      setSimSteps(metrics.steps || 5000);
      setSimScreen(profile?.screen_time_hours || 6);
    }
  }, [metrics, profile]);

  if (loading || !metrics) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-bold">Initializing Health Future</h2>
          <p className="text-[var(--muted)] text-sm max-w-md text-center">
            Synchronizing telemetry...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Current Reality Predictions
  const currentPredictions = calculateFutureHealthPredictions({
    sleepHours: metrics.sleepHours,
    sleepQuality: metrics.sleepQuality,
    hydrationMl: metrics.hydrationMl,
    hydrationTarget: metrics.hydrationTarget,
    stressLevel: metrics.stressLevel,
    fatigueScore: metrics.fatigueScore,
    physicalFatigue: metrics.physicalFatigue,
    mentalFatigue: metrics.mentalFatigue,
    sorenessLevel: 0,
    recoveryPercentage: metrics.recoveryPercentage,
    stabilityScore: metrics.stabilityScore,
    screenTimeHours: profile?.screen_time_hours || 6,
    caffeineIntake: 'moderate'
  });

  const simulatedStabilityScore = simSleep >= 7 && simWater >= 2000 ? Math.min(100, metrics.stabilityScore + 15) : Math.max(10, metrics.stabilityScore - 15);

  // Simulated Predictions
  const simulatedPredictions = calculateFutureHealthPredictions({
    sleepHours: simSleep,
    sleepQuality: simSleep >= 8 ? 90 : simSleep >= 6 ? 70 : 45,
    hydrationMl: simWater,
    hydrationTarget: metrics.hydrationTarget,
    stressLevel: metrics.stressLevel,
    fatigueScore: (metrics.stressLevel > 60 || simSleep < 6) ? 70 : 30,
    physicalFatigue: metrics.physicalFatigue,
    mentalFatigue: metrics.mentalFatigue,
    sorenessLevel: 0,
    recoveryPercentage: simSleep >= 8 ? 85 : 45,
    stabilityScore: simulatedStabilityScore,
    screenTimeHours: simScreen,
    caffeineIntake: 'moderate'
  });

  // Long-term projections based on CURRENT simulated trajectory
  const projections = getLongTermProjections({
    ...metrics,
    sorenessLevel: 0,
    sleepHours: simSleep,
    hydrationMl: simWater,
    stabilityScore: simulatedStabilityScore
  }, profile?.biological_age || 30);

  const activeProjection = projections.find(p => p.day === activeProjectionDay) || projections[1];

  // Story Feed Generator
  const generateStory = () => {
    let stories = [];
    if (metrics.sleepHours > 7) {
      stories.push("You're prioritizing rest! By sleeping over 7 hours consistently, your body is actively repairing cellular damage overnight.");
    } else {
      stories.push("Your sleep has been a bit short lately. Your body is accumulating a slight rest debt which might make afternoons feel harder.");
    }
    
    if (metrics.hydrationMl >= metrics.hydrationTarget) {
      stories.push("Excellent hydration today. Your metabolic efficiency is operating at its peak.");
    } else {
      stories.push(`You're ${metrics.hydrationTarget - metrics.hydrationMl}ml short of your water goal. This might cause a slight drop in evening energy.`);
    }

    if (simulatedPredictions.burnoutRisk < 40) {
      stories.push("If you keep this current rhythm, your stress levels will remain perfectly balanced next month.");
    }

    return stories;
  };

  const activeStories = generateStory();

  // Streak Garden Level
  const gardenLevel = metrics.stabilityScore > 85 ? 4 : metrics.stabilityScore > 70 ? 3 : metrics.stabilityScore > 50 ? 2 : 1;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10 max-w-7xl mx-auto">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 shadow-lg shadow-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
            <Sparkles className="w-32 h-32 text-primary animate-pulse" />
          </div>
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Interactive AI Dashboard</span>
            <h1 className="text-2xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
              Your Health Future
            </h1>
            <p className="text-sm text-[var(--muted)] font-medium max-w-xl leading-relaxed">
              Explore how your daily habits shape your long-term vitality. Adjust the sliders to see what happens to your energy, stress, and biological age.
            </p>
          </div>
        </div>

        {/* --- 1. FUTURE HEALTH ROADMAP --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Future Health Roadmap</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {projections.map((proj) => (
              <button 
                key={proj.day}
                onClick={() => setActiveProjectionDay(proj.day)}
                className={`text-left p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                  activeProjectionDay === proj.day 
                    ? "bg-primary/10 border-primary/50 shadow-md shadow-primary/10" 
                    : "bg-[var(--card-bg)] border-[var(--border)] hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                {activeProjectionDay === proj.day && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                )}
                <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${activeProjectionDay === proj.day ? "text-primary" : "text-[var(--muted)]"}`}>
                  {proj.label}
                </span>
                <span className="text-xl font-black text-[var(--foreground)] block mb-2">{proj.wellnessScore} <span className="text-sm font-medium text-[var(--muted)]">Score</span></span>
                
                <div className="space-y-1.5 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Vitality Age</span>
                    <span className="font-bold text-emerald-500">{proj.vitalityAge}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--muted-bg)]/50 border border-[var(--border)] mt-4 flex gap-4 items-start">
            <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[var(--foreground)]">{activeProjection.label} AI Insight</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed font-medium">
                {activeProjection.insight} With a {activeProjection.consistencyScore}% consistency score, your biological age is tracking towards {activeProjection.vitalityAge} years old.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- 2. "WHAT IF?" HEALTH SIMULATOR --- */}
          <div className="lg:col-span-7 space-y-6">
            <GlassCard glowColor="violet" className="p-6 sm:p-8 rounded-[32px] space-y-8">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-secondary animate-pulse" />
                  <h2 className="text-lg font-bold">"What If?" Simulator</h2>
                </div>
                <span className="text-[10px] uppercase font-bold bg-secondary/15 text-secondary px-3 py-1 rounded-full">Live Sandbox</span>
              </div>

              <div className="space-y-8">
                {/* Sleep Slider */}
                <div className="space-y-3 group">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                      <Moon className="h-4 w-4 text-violet-500" /> Sleep Duration
                    </label>
                    <span className="font-black text-violet-500 bg-violet-500/10 px-3 py-1 rounded-lg">{simSleep} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="4" max="10" step="0.5"
                    value={simSleep}
                    onChange={(e) => setSimSleep(Number(e.target.value))}
                    className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-violet-500 transition-all group-hover:h-3"
                  />
                </div>

                {/* Water Slider */}
                <div className="space-y-3 group">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-emerald-500" /> Daily Water
                    </label>
                    <span className="font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg">{simWater} ml</span>
                  </div>
                  <input
                    type="range"
                    min="500" max="4000" step="250"
                    value={simWater}
                    onChange={(e) => setSimWater(Number(e.target.value))}
                    className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-emerald-500 transition-all group-hover:h-3"
                  />
                </div>

                {/* Steps Slider */}
                <div className="space-y-3 group">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                      <Footprints className="h-4 w-4 text-amber-500" /> Daily Steps
                    </label>
                    <span className="font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg">{simSteps.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000" max="20000" step="1000"
                    value={simSteps}
                    onChange={(e) => setSimSteps(Number(e.target.value))}
                    className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-amber-500 transition-all group-hover:h-3"
                  />
                </div>

                {/* Screen Time Slider */}
                <div className="space-y-3 group">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                      <Clock className="h-4 w-4 text-rose-500" /> Screen Time
                    </label>
                    <span className="font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-lg">{simScreen} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="1" max="14" step="1"
                    value={simScreen}
                    onChange={(e) => setSimScreen(Number(e.target.value))}
                    className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-rose-500 transition-all group-hover:h-3"
                  />
                </div>
              </div>

              {/* Simulation Results Mini-Cards */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border)]">
                <div className="p-4 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)] flex flex-col items-center justify-center text-center group hover:bg-primary/5 transition-colors">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Burnout Risk</span>
                  <span className={`text-2xl font-black ${simulatedPredictions.burnoutRisk > 60 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {simulatedPredictions.burnoutRisk}%
                  </span>
                </div>
                <div className="p-4 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)] flex flex-col items-center justify-center text-center group hover:bg-secondary/5 transition-colors">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Recovery</span>
                  <span className="text-2xl font-black text-secondary">
                    {100 - simulatedPredictions.recoveryDeclineRisk}%
                  </span>
                </div>
                <div className="p-4 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)] flex flex-col items-center justify-center text-center group hover:bg-violet-500/5 transition-colors">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Sleep Deterioration</span>
                  <span className={`text-2xl font-black ${simulatedPredictions.sleepDeteriorationRisk > 50 ? 'text-rose-500' : 'text-violet-500'}`}>
                    {simulatedPredictions.sleepDeteriorationRisk}%
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* --- 4. HEALTH STORY FEED --- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Your Health Story</h2>
              </div>
              <div className="space-y-3">
                {activeStories.map((story, idx) => (
                  <div key={idx} className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] flex gap-4 group hover:border-primary/40 transition-all">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed font-medium pt-0.5">
                      {story}
                    </p>
                  </div>
                ))}
              </div>
            </div>



          </div>

          <div className="lg:col-span-5 space-y-6">
            
            {/* --- 3. HEALTH EVOLUTION AVATAR --- */}
            <GlassCard glowColor="emerald" className="p-6 rounded-[32px] overflow-hidden relative group text-center flex flex-col items-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-widest mb-6 relative z-10">Health Evolution Avatar</h2>
              
              <div className="relative w-32 h-32 mb-4 group-hover:scale-105 transition-transform duration-500">
                {/* SVG Avatar Representation */}
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border-4 border-dashed border-emerald-500/40 animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-700 ${
                    simulatedStabilityScore > 80 ? "bg-emerald-500 shadow-emerald-500/50" : 
                    simulatedStabilityScore > 50 ? "bg-primary shadow-primary/50" : "bg-amber-500 shadow-amber-500/50"
                  }`}>
                    <Heart className="h-10 w-10 text-white animate-pulse" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-[var(--foreground)] mb-1">
                {simulatedStabilityScore > 80 ? "Peak Vitality" : simulatedStabilityScore > 50 ? "Balanced Rhythm" : "Restoration Needed"}
              </h3>
              <p className="text-xs text-[var(--muted)] font-medium px-4">
                This avatar represents your internal state. It evolves dynamically as your habits improve.
              </p>
            </GlassCard>

            {/* --- 6. STREAK GARDEN --- */}
            <GlassCard glowColor="emerald" className="p-6 rounded-[32px]">
              <div className="flex items-center gap-2 mb-6">
                <Leaf className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold">Streak Garden</h2>
              </div>
              
              <div className="flex justify-center items-end h-32 border-b-2 border-amber-900/20 mb-4 pb-2">
                {/* CSS/SVG Tree that grows based on gardenLevel */}
                <div className="relative w-full flex justify-center items-end">
                  {/* Base Stem */}
                  <div className="w-4 bg-emerald-800 rounded-t-lg transition-all duration-1000" style={{ height: `${gardenLevel * 20}px` }} />
                  
                  {/* Leaves */}
                  {gardenLevel >= 2 && (
                    <div className="absolute bg-emerald-500 w-12 h-12 rounded-full opacity-80 mix-blend-multiply transition-all duration-1000 animate-pulse" style={{ bottom: '30px', left: 'calc(50% - 24px)' }} />
                  )}
                  {gardenLevel >= 3 && (
                    <>
                      <div className="absolute bg-emerald-400 w-16 h-16 rounded-full opacity-80 mix-blend-multiply transition-all duration-1000" style={{ bottom: '40px', left: 'calc(50% - 35px)' }} />
                      <div className="absolute bg-emerald-600 w-14 h-14 rounded-full opacity-80 mix-blend-multiply transition-all duration-1000" style={{ bottom: '20px', left: 'calc(50% + 5px)' }} />
                    </>
                  )}
                  {gardenLevel >= 4 && (
                    <>
                      <div className="absolute bg-green-400 w-20 h-20 rounded-full opacity-90 mix-blend-multiply transition-all duration-1000" style={{ bottom: '50px', left: 'calc(50% - 40px)' }} />
                      <div className="absolute bg-emerald-300 w-12 h-12 rounded-full opacity-90 mix-blend-multiply transition-all duration-1000 animate-bounce" style={{ bottom: '80px', left: 'calc(50% - 10px)' }} />
                    </>
                  )}
                </div>
              </div>
              <p className="text-center text-xs font-bold text-[var(--muted)]">
                {gardenLevel === 4 ? "Your garden is flourishing!" : "Keep up your habits to grow your tree."}
              </p>
            </GlassCard>

            {/* --- 5. ACHIEVEMENTS & MILESTONES --- */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold">Trophy Room</h2>
                </div>
                <span className="text-xs font-bold text-primary cursor-pointer hover:underline">View All</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] text-center group hover:bg-amber-500/5 hover:border-amber-500/30 transition-colors">
                  <div className="h-12 w-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Flame className="h-6 w-6 text-amber-500" />
                  </div>
                  <h4 className="text-xs font-bold text-[var(--foreground)]">7-Day Streak</h4>
                  <p className="text-[10px] text-[var(--muted)] mt-1">Logged every day</p>
                </div>
                
                <div className="p-4 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] text-center group hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-colors">
                  <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Droplet className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h4 className="text-xs font-bold text-[var(--foreground)]">Aqua Master</h4>
                  <p className="text-[10px] text-[var(--muted)] mt-1">Hit target 5x</p>
                </div>
              </div>
            </div>

            {/* --- 9. COMMUNITY CHALLENGES --- */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 px-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Active Challenges</h2>
              </div>
              
              <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] group cursor-pointer hover:border-primary/40 transition-all relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary/5 to-transparent" />
                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Public Challenge</span>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">100k Steps Week</h3>
                    <p className="text-xs text-[var(--muted)] font-medium">342 people joined • Ends in 2 days</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[var(--muted)] group-hover:text-primary transition-colors" />
                </div>
                <div className="w-full h-1.5 bg-foreground/10 rounded-full mt-4 overflow-hidden relative z-10">
                  <div className="h-full bg-primary w-[75%]" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
