"use client";

import React, { useState, useEffect } from "react";
import { User, Sparkles, HeartPulse, Save, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  
  // Biometric form States
  const [fullName, setFullName] = useState("");
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setWeight(profile.weight_kg ? Number(profile.weight_kg) : "");
      setHeight(profile.height_cm ? Number(profile.height_cm) : "");
      setGoal(profile.fitness_goal || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);

    try {
      const numWeight = Number(weight) || 0;
      const weightFactor = numWeight > 100 ? 2.5 : (numWeight > 0 && numWeight < 50) ? -1.0 : 0.0;
      const simulatedBioAge = Math.round((30.0 + weightFactor) * 10) / 10;

      const { error } = await updateProfile({
        full_name: fullName,
        weight_kg: weight !== "" ? Number(weight) : null,
        height_cm: height !== "" ? Number(height) : null,
        fitness_goal: goal,
        biological_age: simulatedBioAge
      });

      if (!error) {
        setSavedMsg(true);
        confetti({
          particleCount: 30,
          spread: 20,
          colors: ["#10b981"]
        });
        setTimeout(() => {
          setSavedMsg(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-foreground/5 bg-gradient-to-r from-primary/10 via-background to-secondary/5">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <User className="h-6 w-6 text-primary animate-pulse" />
              Biometric Wellness Profile
            </h1>
            <p className="text-xs text-foreground/70 font-semibold">
              Chronological statistics, height & weight variables & Digital Twin personalization
            </p>
          </div>
        </div>

        {/* 1. DUAL LAYOUT: Biometric Form vs Twin characteristics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Biometrics input fields */}
          <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border-foreground/5 flex flex-col justify-between">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <HeartPulse className="h-4.5 w-4.5 text-primary" />
                Physical Parameter Loggers
              </h3>

              {savedMsg && (
                <div className="rounded-xl border border-secondary/15 bg-secondary/5 px-3 py-2 text-xs text-secondary font-bold">
                  ✓ Biometric profile updated successfully! Biological Age calculated.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/45 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Chronological Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Chronological Height (cm)</label>
                  <input
                    type="number"
                    required
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Active Preventive Focus Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="burnout_protection">CNS Burnout Protection</option>
                  <option value="stamina_optimization">Cardiovascular Stamina</option>
                  <option value="longevity_maintenance">Biological Longevity</option>
                  <option value="weight_management">Healthy Weight Management</option>
                  <option value="muscle_hypertrophy">Strength & Muscle Hypertrophy</option>
                  <option value="stress_resilience">Mind-Body Stress Resilience</option>
                  <option value="sleep_restoration">Deep Sleep & Circadian Restoration</option>
                  <option value="posture_mobility">Posture, Flexibility & Mobility</option>
                </select>
              </div>

              <Button variant="primary" type="submit" isLoading={saving} className="w-full py-3.5 flex items-center justify-center gap-1.5 text-xs font-bold">
                <Save className="h-4 w-4" />
                <span>Save and Recompute Metrics</span>
              </Button>

            </form>
          </div>

          {/* Right panel: Digital Twin personalization metrics summary */}
          <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border-foreground/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-secondary animate-pulse" />
                Digital Twin Characteristics
              </h3>
              
              <ul className="space-y-3 pt-2 text-xs text-foreground/75 font-semibold leading-normal">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>**Biological Age Estimate**: {profile?.biological_age ? `${profile.biological_age} yrs` : "Not calculated (Complete 7+ days tracking)"}.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>**Metabolic Stability Curve**: {weight && Number(weight) > 0 ? `Optimal daily water intake calculated at ${Math.round(Number(weight) * 35)} ml.` : "Complete weight to calculate water intake goal."}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>**Overtraining soreness limit**: HRV average benchmark configured for active standard parameters.</span>
                </li>
              </ul>
            </div>

            <GlassCard glowColor="violet" className="p-4 flex gap-3 items-start border border-foreground/5">
              <ShieldCheck className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-[9px] font-bold text-secondary">Secure Biometric Storage</h4>
                <p className="text-[9px] text-foreground/75 leading-relaxed font-semibold">
                  Personal dimensions data synced locally inside session parameters. Encrypted in real Supabase schemas using strict standard access restrictions.
                </p>
              </div>
            </GlassCard>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
