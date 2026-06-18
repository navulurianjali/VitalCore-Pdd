"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Sparkles, Trash2, ShieldCheck, Sun, Moon, Info } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import confetti from "canvas-confetti";

export default function SettingsPage() {
  const { theme, toggleTheme, activeMode, setActiveMode } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  
  const [cleared, setCleared] = useState(false);
  const [wipeError, setWipeError] = useState("");

  const handleWipeCache = async () => {
    if (confirm("Are you absolutely sure you want to delete all of your logged data? This action is permanent and cannot be undone.")) {
      if (typeof window !== "undefined" && supabase && profile?.id) {
        setWipeError("");
        // VULN-18 FIX: Use Promise.all to run all deletes in parallel
        // and check every result for errors before confirming success.
        const results = await Promise.all([
          supabase.from("hydration_logs").delete().eq("user_id", profile.id),
          supabase.from("workouts").delete().eq("user_id", profile.id),
          supabase.from("sleep_logs").delete().eq("user_id", profile.id),
          supabase.from("user_challenges").delete().eq("user_id", profile.id),
        ]);

        const hasError = results.some(r => r.error);
        if (hasError) {
          setWipeError("Some data could not be deleted. Please try again.");
          return;
        }
      }
      setCleared(true);
      
      confetti({
        particleCount: 40,
        spread: 30,
        colors: ["#ef4444"]
      });

      // VULN-19 FIX: Use router.push instead of window.location.href
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-foreground/5 bg-gradient-to-br from-primary/10 via-background to-secondary/5 p-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary animate-pulse" />
              App Settings & Privacy
            </h1>
            <p className="text-xs text-foreground/70 font-semibold">
              Customize your theme, adjust readability modes, and manage your account privacy settings.
            </p>
          </div>
        </div>

        {/* 1. DUAL LAYOUT: Active mode setup vs Security wipe */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Theme and active modes toggles */}
          <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border-foreground/5 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              
              {/* Active visual mode toggle */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  Readability & Experience Modes
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed font-semibold">
                  Choose an app experience that matches your active lifestyle. Select Elderly Mode to increase text contrast and font sizes for easier reading:
                </p>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {(["wellness", "performance", "elderly"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMode(m)}
                      className={`px-3 py-3 text-xs capitalize rounded-xl font-bold transition-all border ${
                        activeMode === m 
                          ? "bg-primary text-white border-primary/20 shadow-md shadow-primary/15" 
                          : "bg-foreground/5 hover:bg-foreground/10 border-foreground/5 text-foreground/85"
                      }`}
                    >
                      {m} Mode
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme light dark mode toggle */}
              <div className="space-y-3 pt-3 border-t border-foreground/5">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  {theme === "dark" ? <Moon className="h-4.5 w-4.5 text-primary" /> : <Sun className="h-4.5 w-4.5 text-amber-500" />}
                  Interface Color Theme
                </h3>
                <div className="flex gap-2">
                  <Button variant={theme === "dark" ? "primary" : "glass"} onClick={toggleTheme} className="flex-1 text-xs">
                    Dark Theme
                  </Button>
                  <Button variant={theme === "light" ? "primary" : "glass"} onClick={toggleTheme} className="flex-1 text-xs">
                    Light Theme
                  </Button>
                </div>
              </div>

            </div>

            <div className="text-xs text-foreground/50 leading-normal font-semibold border-t border-foreground/5 pt-3">
              Designed for high contrast and readability across all screens.
            </div>
          </div>

          {/* Right panel: Security purger cache */}
          <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border-foreground/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Trash2 className="h-4 w-4 text-red-500 animate-pulse" />
                Clear Saved Health Data
              </h3>
              <p className="text-xs text-foreground/60 leading-normal font-semibold">
                Erase all saved weight, steps, sleep, and nutrition logs stored locally on your device:
              </p>

              {cleared ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-500 font-semibold">
                  ⚠ All logged data has been deleted! Redirecting...
                </div>
              ) : wipeError ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-400 font-semibold">
                  ⚠ {wipeError}
                </div>
              ) : (
                <Button variant="danger" onClick={handleWipeCache} className="w-full py-3 flex items-center justify-center gap-1 text-xs font-bold">
                  <Trash2 className="h-4 w-4" />
                  <span>Reset All Saved Data</span>
                </Button>
              )}
            </div>

            <GlassCard glowColor="rose" className="p-4 flex gap-3 items-start border border-foreground/5">
              <ShieldCheck className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-bold text-red-500">Secure Health Privacy</h4>
                <p className="text-[9px] text-foreground/75 leading-relaxed font-semibold">
                  Your privacy is our priority. All medical, workout, and personal profile information is securely locked down using modern encryption standard procedures.
                </p>
              </div>
            </GlassCard>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
