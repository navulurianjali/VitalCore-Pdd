"use client";

import React, { useState, useEffect } from "react";
import { 
  Moon, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Zap, 
  ChevronRight, 
  Plus, 
  Percent, 
  Calendar,
  CheckCircle2,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import confetti from "canvas-confetti";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Line
} from "recharts";

interface SleepLog {
  date: string;
  duration: number; // hrs
  quality: number; // 1-10
  wakings: number;
  refreshment: number; // 1-10
  mood: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  muscleRepair: number; // %
}

export default function SleepPage() {
  const { activeMode } = useTheme();
  const { profile } = useAuth();
  
  // Mounted check to bypass hydration bugs in Recharts
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form parameters
  const [showLogForm, setShowLogForm] = useState(false);
  const [onset, setOnset] = useState("22:30");
  const [wake, setWake] = useState("06:30");
  const [quality, setQuality] = useState(8);
  const [wakings, setWakings] = useState(1);
  const [refreshment, setRefreshment] = useState(8);
  const [mood, setMood] = useState(8);
  const [stress, setStress] = useState(3);

  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [dbError, setDbError] = useState("");

  const fetchSleepLogs = async () => {
    setLoadingLogs(true);
    setDbError("");
    
    if (supabase && profile) {
      try {
        const { data, error } = await supabase
          .from("sleep_logs")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: true })
          .limit(7);
        
        if (!error && data && data.length > 0) {
          setLogs(data.map((d: any) => ({
            date: d.date ? d.date.substring(5, 10).replace("-", "/") : new Date(d.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
            duration: Number(d.sleep_hours),
            quality: Number(d.sleep_rating || 0),
            wakings: d.night_wakings ? 1 : 0,
            refreshment: Number(d.refreshment_level || 0),
            mood: Number(d.sleep_rating || 0),
            energy: Number(d.refreshment_level || 0),
            stress: Math.max(1, 10 - Number(d.sleep_rating || 0)),
            muscleRepair: Number(d.recovery_quality || 0)
          })));
        } else if (error) {
          console.error("Supabase sleep_logs fetch error:", error.message);
          setDbError(error.message);
        } else {
          setLogs([]);
        }
      } catch (e: any) {
        console.error("Supabase sleep_logs exception:", e.message);
        setDbError(e.message);
      }
    } else {
      setLogs([]);
    }
    setLoadingLogs(false);
  };

  useEffect(() => {
    if (profile?.id) {
      fetchSleepLogs();
    } else {
      setLoadingLogs(false);
    }
  }, [profile]);

  // Parse time differences
  const parseTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const getDuration = (onsetVal: string, wakeVal: string) => {
    const onsetM = parseTime(onsetVal);
    const wakeM = parseTime(wakeVal);
    let diff = wakeM - onsetM;
    if (diff < 0) diff += 24 * 60; // crossovers midnight
    return Math.round((diff / 60) * 10) / 10;
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const durationHrs = getDuration(onset, wake);
    
    // Estimate muscle repair
    let muscle = Math.round(durationHrs * 11);
    if (quality > 8) muscle += 10;
    if (wakings > 2) muscle -= 15;
    muscle = Math.max(30, Math.min(99, muscle));

    const targetSleep = profile?.sleep_problems ? 8.5 : 8.0;
    const sleepDebt = Math.max(0, Math.round((targetSleep - durationHrs) * 10) / 10);

    const newLogItem: SleepLog = {
      date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
      duration: durationHrs,
      quality: Number(quality),
      wakings: Number(wakings),
      refreshment: Number(refreshment),
      mood: Number(mood),
      energy: Number(mood), // estimate energy based on mood
      stress: Number(stress),
      muscleRepair: muscle
    };

    setLoadingLogs(true);

    // Save strictly to Supabase
    if (supabase && profile) {
      try {
        const { error } = await supabase
          .from("sleep_logs")
          .insert({
            user_id: profile.id,
            date: new Date().toISOString().split("T")[0],
            sleep_onset: onset,
            wake_time: wake,
            sleep_rating: Number(quality),
            night_wakings: Number(wakings) > 0,
            refreshment_level: Number(refreshment),
            sleep_hours: durationHrs,
            sleep_debt: sleepDebt,
            recovery_quality: muscle
          });
        
        if (!error) {
          // Update local state directly so UI reflects immediately
          const currentLogs = [...logs, newLogItem];
          setLogs(currentLogs);
        } else {
          console.error("Failed to save sleep log to Supabase:", error.message);
          setDbError(error.message);
        }
      } catch (err: any) {
        console.error("Exception during Supabase save:", err.message);
        setDbError(err.message);
      }
    }


    setLoadingLogs(false);
    setShowLogForm(false);
    
    // Dispatch event so dashboard and other components sync the new data automatically
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vitalcore-data-updated"));
    }
    
    confetti({
      particleCount: 80,
      spread: 60,
      colors: ["#3b82f6", "#8b5cf6", "#10b981"]
    });
  };

  // Calculations
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const targetSleep = profile?.sleep_problems ? 8.5 : 8.0;
  
  const avgDuration = logs.length > 0 ? Math.round((logs.reduce((acc, curr) => acc + curr.duration, 0) / logs.length) * 10) / 10 : 0;
  const sleepDebt = latestLog ? Math.max(0, Math.round((targetSleep - latestLog.duration) * 10) / 10) : 0;
  
  // Consistency index calculated based on deviation of duration
  const calculateConsistency = (items: SleepLog[]) => {
    if (items.length <= 1) return 100;
    const avg = items.reduce((acc, curr) => acc + curr.duration, 0) / items.length;
    const variance = items.reduce((acc, curr) => acc + Math.pow(curr.duration - avg, 2), 0) / items.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(45, Math.round(100 - stdDev * 16));
  };
  const consistencyIndex = logs.length > 0 ? calculateConsistency(logs) : 0;

  const recoveryScore = logs.length > 0 ? Math.round(
    logs.reduce((acc, curr) => {
      const score = (curr.quality * 6 + curr.refreshment * 4) - (curr.wakings * 4);
      return acc + Math.max(10, Math.min(100, score * 10));
    }, 0) / logs.length
  ) : 0;

  // Dynamic warning alerts
  const showAlert = latestLog ? (latestLog.duration < 6.5 || latestLog.wakings >= 3 || latestLog.quality < 6) : false;

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-background/95 border border-foreground/10 rounded-xl shadow-xl text-xs font-semibold backdrop-blur-md">
          <p className="text-foreground/50 mb-1">Sleep Date: {label}</p>
          {payload.map((pld: any) => (
            <p key={pld.name} style={{ color: pld.color || pld.fill }}>
              {pld.name}: {pld.value} {pld.name.includes("Repair") ? "%" : pld.name.includes("Duration") ? "hrs" : "/ 10"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-10 max-w-5xl">
        
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Sleep & Recovery</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Track your sleep patterns and recovery quality</p>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowLogForm(!showLogForm)} 
            className="gap-1.5 self-start sm:self-center"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Sleep
          </Button>
        </div>

        {dbError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400 font-medium">
            ⚠️ <strong>Supabase connection issue:</strong> {dbError}
          </div>
        )}

        {loadingLogs ? (
          <div className="flex items-center justify-center py-16 gap-2 text-sm text-[var(--muted)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            Loading sleep data...
          </div>
        ) : logs.length === 0 ? (
          <div className="glass-panel p-10 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Moon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">No sleep logs yet</h3>
              <p className="text-sm text-[var(--muted)] mt-1 max-w-sm">
                Log your first night's sleep to see quality scores, trends, and recovery insights.
              </p>
            </div>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowLogForm(true)} 
              className="gap-1.5 mt-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Your First Sleep
            </Button>
          </div>
        ) : (
          <>
            {/* Sleep warning */}
            {showAlert && latestLog && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 flex gap-3 items-start">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-rose-500">Low sleep detected</p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">
                    Last night was {latestLog.duration}h — below your {targetSleep}h target. Try to avoid caffeine after 2 PM today.
                  </p>
                </div>
              </div>
            )}

            {/* Core sleep metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              
              <GlassCard glowColor="violet" className="p-4">
                <span className="text-xs font-medium text-[var(--muted)] block mb-2">Sleep Quality</span>
                <div className="analytics-number text-[var(--foreground)]">{latestLog ? `${latestLog.quality * 10}%` : "—"}</div>
                <div className="progress-bar mt-3">
                  {latestLog && <div className="progress-bar-fill bg-primary" style={{ width: `${latestLog.quality * 10}%` }} />}
                </div>
                {latestLog && (
                  <p className="text-xs text-[var(--muted)] mt-1.5">Deep sleep: ~{Math.round(latestLog.quality * 5.2)}% of total</p>
                )}
              </GlassCard>

              <GlassCard glowColor="emerald" className="p-4">
                <span className="text-xs font-medium text-[var(--muted)] block mb-2">Consistency</span>
                <div className="analytics-number text-[var(--foreground)]">{consistencyIndex}%</div>
                <div className="progress-bar mt-3">
                  <div className="progress-bar-fill bg-emerald-500" style={{ width: `${consistencyIndex}%` }} />
                </div>
                <p className="text-xs text-[var(--muted)] mt-1.5">{Math.round((100 - consistencyIndex) * 0.8)} min wakeup difference</p>
              </GlassCard>

              <GlassCard glowColor="rose" className="p-4">
                <span className="text-xs font-medium text-[var(--muted)] block mb-2">Sleep Debt</span>
                <div className="analytics-number text-[var(--foreground)]">{sleepDebt}h</div>
                <div className="progress-bar mt-3">
                  <div className="progress-bar-fill bg-rose-500" style={{ width: `${Math.min(100, (sleepDebt / 3) * 100)}%` }} />
                </div>
                {latestLog && (
                  <p className="text-xs text-[var(--muted)] mt-1.5">Need {Math.round((latestLog.duration + sleepDebt) * 10) / 10}h tonight</p>
                )}
              </GlassCard>

              <GlassCard glowColor="none" className="p-4">
                <span className="text-xs font-medium text-[var(--muted)] block mb-2">Recovery</span>
                <div className="analytics-number text-[var(--foreground)]">{recoveryScore}%</div>
                <div className="progress-bar mt-3">
                  <div className="progress-bar-fill bg-sky-500" style={{ width: `${recoveryScore}%` }} />
                </div>
                <p className="text-xs text-[var(--muted)] mt-1.5">Quality, wakings & refreshment</p>
              </GlassCard>

            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              <div className="glass-panel p-4 flex flex-col gap-3">
                <div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Sleep Duration & Energy
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">7-day trend: sleep hours vs next-day energy</p>
                </div>

                <div className="h-52 w-full min-w-0">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                      <AreaChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "9px", fontWeight: "bold" }} />
                        <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: "9px", fontWeight: "bold" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold", paddingTop: "10px" }} />
                        <Area 
                          type="monotone" 
                          name="Duration (hrs)" 
                          dataKey="duration" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#colorDuration)" 
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          name="Energy Level" 
                          dataKey="energy" 
                          stroke="#10b981" 
                          fillOpacity={1} 
                          fill="url(#colorEnergy)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-foreground/30 font-bold">
                      Initializing Charts...
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-panel p-4 flex flex-col gap-3">
                <div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                    <BrainCircuit className="h-4 w-4 text-secondary" />
                    Quality, Stress & Recovery
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Sleep quality, stress, and muscle recovery</p>
                </div>

                <div className="h-52 w-full min-w-0">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                      <BarChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "9px", fontWeight: "bold" }} />
                        <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: "9px", fontWeight: "bold" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold", paddingTop: "10px" }} />
                        <Bar 
                          name="Quality Score" 
                          dataKey="quality" 
                          fill="#8b5cf6" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={30}
                        />
                        <Line 
                          type="monotone" 
                          name="Stress Level" 
                          dataKey="stress" 
                          stroke="#ef4444" 
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          name="Body Recovery Index" 
                          dataKey="muscleRepair" 
                          stroke="#f59e0b" 
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-foreground/30 font-bold">
                      Initializing Charts...
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Sleep schedule & insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              <div className="glass-panel p-4 space-y-3">
                <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  Optimal Sleep Schedule
                </h3>
                
                <div className="space-y-0">
                  {[
                    { label: "Best Bedtime", value: "9:45 PM – 10:20 PM", color: "text-primary" },
                    { label: "Deepest Sleep Time", value: "11:15 PM", color: "text-secondary" },
                    { label: "Rest & Recovery Phase", value: "11:30 PM – 2:30 AM", color: "text-amber-500" },
                    { label: "Wakeup Difference", value: "± 12 min (Excellent)", color: "text-emerald-500" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-[var(--border)] last:border-0">
                      <span className="text-sm text-[var(--muted)]">{row.label}</span>
                      <span className={`text-sm font-medium ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-4 space-y-3">
                <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-secondary" />
                  Sleep Insights
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Sleeping under 7 hours raises cortisol levels, which blocks muscle protein synthesis and slows fat loss. Consistent sleep timing is one of the most impactful health habits.
                </p>
                <div className="p-3 bg-[var(--muted-bg)] rounded-lg border border-[var(--border)]">
                  <p className="text-xs font-medium text-[var(--foreground)]">
                    On nights with under 6.5h sleep, focus efficiency drops ~28% and anxiety increases ~42%. An extra 1.5h tonight significantly boosts recovery.
                  </p>
                </div>
              </div>

            </div>
          </>
        )}

        {/* History Table */}
        {!loadingLogs && logs.length > 0 && (
          <div className="glass-panel p-4 space-y-4">
            <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              Sleep History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-[var(--muted)]">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Duration</th>
                    <th className="pb-2 font-medium">Quality</th>
                    <th className="pb-2 font-medium">Recovery</th>
                    <th className="pb-2 font-medium text-right">Energy</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {logs.map((log, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 text-[var(--foreground)]">{log.date}</td>
                      <td className="py-3 font-semibold text-primary">{log.duration}h</td>
                      <td className="py-3">{log.quality}/10</td>
                      <td className="py-3">{log.muscleRepair}%</td>
                      <td className="py-3 text-right text-emerald-500 font-medium">{log.energy}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Redesigned Sleep Logger Form Modal Overlay */}
        {showLogForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl p-6 space-y-4">
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-[var(--foreground)]">Log Sleep</h3>
                </div>
                <button 
                  onClick={() => setShowLogForm(false)}
                  className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm px-2 py-1 rounded-lg hover:bg-[var(--muted-bg)] transition-all"
                  aria-label="Close sleep modal"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleAddLog} className="space-y-4">
                
                {/* Time inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label>Bedtime</label>
                    <input 
                      type="time" 
                      value={onset} 
                      onChange={(e) => setOnset(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label>Wake time</label>
                    <input 
                      type="time" 
                      value={wake} 
                      onChange={(e) => setWake(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Sleep Quality slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="mb-0">Sleep Quality</label>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{quality} / 10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="10" step="0.5" 
                    value={quality} 
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                    <span>Poor (1)</span><span>Great (10)</span>
                  </div>
                </div>

                {/* Night wakings + refreshment */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label>Night Wakings</label>
                    <input 
                      type="number" min="0" max="10" 
                      value={wakings} 
                      onChange={(e) => setWakings(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="mb-0">Refreshment</label>
                      <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{refreshment} / 10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" max="10" step="0.5" 
                      value={refreshment} 
                      onChange={(e) => setRefreshment(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Mood + Stress */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="mb-0">Morning Mood</label>
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{mood}/10</span>
                    </div>
                    <input type="range" min="1" max="10" value={mood} onChange={(e) => setMood(Number(e.target.value))} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="mb-0">Stress Level</label>
                      <span className="text-xs font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">{stress}/10</span>
                    </div>
                    <input type="range" min="1" max="10" value={stress} onChange={(e) => setStress(Number(e.target.value))} />
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  type="submit"
                  size="md"
                  isLoading={loadingLogs}
                  className="w-full gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Save Sleep Log
                </Button>
                
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
