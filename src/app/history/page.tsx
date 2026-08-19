"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import {
  getLocalDateString,
  formatDisplayDate,
  addDaysToDate,
  getLastNDaysDates,
} from "@/utils/dateUtils";
import {
  getOrCreateDailyRecord,
  fetchDailyHistory,
  computeHistoryAnalytics,
  calculateGoalBreakdown,
  DailyHealthRecord,
  HistoryAnalytics,
} from "@/services/dailyTracker";
import { DatePickerPopover } from "@/components/ui/DatePickerPopover";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Droplets,
  Dumbbell,
  Moon,
  CheckCircle2,
  Activity,
  TrendingUp,
  Award,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function HealthHistoryPage() {
  const { user, profile } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<"day" | "7days" | "30days">("day");
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(undefined, profile?.timezone));
  const [dayRecord, setDayRecord] = useState<DailyHealthRecord | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [historyRecords, setHistoryRecords] = useState<DailyHealthRecord[]>([]);
  const [analytics, setAnalytics] = useState<HistoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch single day record
  const loadSingleDay = useCallback(async (dateStr: string) => {
    if (!user?.id || !supabase) return;
    try {
      setLoading(true);
      const rec = await getOrCreateDailyRecord(supabase, user.id, dateStr, profile);
      setDayRecord(rec);
    } catch (e) {
      console.error("Error loading single day history:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile]);

  // Fetch range history
  const loadPeriodHistory = useCallback(async (daysCount: number) => {
    if (!user?.id || !supabase) return;
    try {
      setLoading(true);
      const dateList = getLastNDaysDates(daysCount, getLocalDateString(undefined, profile?.timezone), profile?.timezone);
      const records = await fetchDailyHistory(supabase, user.id, dateList, profile);
      setHistoryRecords(records);
      const stats = computeHistoryAnalytics(records);
      setAnalytics(stats);
    } catch (e) {
      console.error("Error loading period history:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile]);

  useEffect(() => {
    if (activeTab === "day") {
      loadSingleDay(selectedDate);
    } else if (activeTab === "7days") {
      loadPeriodHistory(7);
    } else if (activeTab === "30days") {
      loadPeriodHistory(30);
    }
  }, [activeTab, selectedDate, loadSingleDay, loadPeriodHistory]);

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDaysToDate(prev, -1, profile?.timezone));
  };

  const handleNextDay = () => {
    const today = getLocalDateString(undefined, profile?.timezone);
    if (selectedDate < today) {
      setSelectedDate((prev) => addDaysToDate(prev, 1, profile?.timezone));
    }
  };

  const isToday = selectedDate === getLocalDateString(undefined, profile?.timezone);
  const dayBreakdown = dayRecord ? calculateGoalBreakdown(dayRecord) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Health History
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Track your long-term wellness telemetry, daily goal scores, and habits.
            </p>
          </div>

          {/* View Tab Selector */}
          <div className="flex items-center p-1 bg-[var(--muted-bg)] rounded-xl border border-[var(--border)] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("day")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "day"
                  ? "bg-primary text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Today / Day
            </button>
            <button
              onClick={() => setActiveTab("7days")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "7days"
                  ? "bg-primary text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setActiveTab("30days")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "30days"
                  ? "bg-primary text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* DAY VIEW */}
        {activeTab === "day" && (
          <div className="space-y-6">
            {/* Date Navigator Bar */}
            <GlassCard className="p-4 flex items-center justify-between">
              <Button
                variant="glass"
                size="sm"
                onClick={handlePrevDay}
                className="flex items-center gap-1 text-sm text-[var(--foreground)] cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Day
              </Button>

              {/* Clickable Date Display Trigger */}
              <button
                onClick={() => setIsDatePickerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--muted-bg)]/60 hover:bg-[var(--muted-bg)] border border-[var(--border)] transition-all cursor-pointer group"
                title="Click to open calendar date picker"
              >
                <CalendarIcon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-base text-[var(--foreground)]">
                  {formatDisplayDate(selectedDate, profile?.timezone)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--card-bg)] text-[var(--muted)] font-mono border border-[var(--border)]">
                  {selectedDate}
                </span>
              </button>

              <Button
                variant="glass"
                size="sm"
                onClick={handleNextDay}
                disabled={isToday}
                className="flex items-center gap-1 text-sm text-[var(--foreground)] disabled:opacity-30 cursor-pointer"
              >
                Next Day
                <ChevronRight className="h-4 w-4" />
              </Button>
            </GlassCard>

            {/* Calendar Popover Modal */}
            <DatePickerPopover
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              selectedDate={selectedDate}
              onSelectDate={(newDate) => {
                setSelectedDate(newDate);
              }}
              userId={user?.id}
              timezone={profile?.timezone}
            />

            {loading ? (
              <GlassCard className="p-12 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
                <p className="text-sm text-[var(--muted)]">Loading daily telemetry...</p>
              </GlassCard>
            ) : !dayRecord || !dayRecord.has_data ? (
              <GlassCard className="p-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-[var(--muted-bg)] flex items-center justify-center mx-auto text-[var(--muted)]">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">No data recorded</h3>
                <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
                  No health telemetry was logged for {formatDisplayDate(selectedDate, profile?.timezone)}. Historical records are strictly preserved without fabricated values.
                </p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Goal Score */}
                <GlassCard className="md:col-span-1 p-6 flex flex-col justify-between items-center text-center bg-gradient-to-b from-primary/10 to-transparent border-primary/20">
                  <div className="w-full">
                    <span className="text-xs uppercase tracking-wider font-semibold text-primary">Daily Goal Score</span>
                    <div className="my-6 relative flex items-center justify-center">
                      <div className="h-32 w-32 rounded-full border-8 border-primary/20 flex flex-col items-center justify-center bg-[var(--card-bg)] shadow-inner">
                        <span className="text-3xl font-extrabold text-[var(--foreground)]">{dayBreakdown?.overallScore}%</span>
                        <span className="text-[10px] text-[var(--muted)] font-medium">COMPLETED</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-2 text-left pt-4 border-t border-[var(--border)]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--muted)]">Active Mode:</span>
                      <span className="font-semibold capitalize text-primary">{profile?.active_mode || 'wellness'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--muted)]">Record Status:</span>
                      <span className="font-semibold text-emerald-500 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Verified Database Row
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* Metrics Breakdown Grid */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Calories */}
                  <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                          <Flame className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] font-medium">Calories</p>
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            {dayRecord.calories_consumed.toLocaleString()} / {dayRecord.calorie_goal.toLocaleString()} kcal
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-500">{dayBreakdown?.caloriesPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--muted-bg)] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dayBreakdown?.caloriesPct}%` }} />
                    </div>
                  </GlassCard>

                  {/* Water */}
                  <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                          <Droplets className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] font-medium">Hydration</p>
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            {dayRecord.water_ml.toLocaleString()} / {dayRecord.water_goal_ml.toLocaleString()} ml
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-cyan-500">{dayBreakdown?.waterPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--muted-bg)] rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${dayBreakdown?.waterPct}%` }} />
                    </div>
                  </GlassCard>

                  {/* Protein */}
                  <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] font-medium">Protein</p>
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            {dayRecord.protein_g} / {dayRecord.protein_goal} g
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-500">{dayBreakdown?.proteinPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--muted-bg)] rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${dayBreakdown?.proteinPct}%` }} />
                    </div>
                  </GlassCard>

                  {/* Workout */}
                  <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                          <Dumbbell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] font-medium">Workout / Fitness</p>
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            {dayRecord.workout_minutes} / {dayRecord.workout_goal_minutes} min
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-500">{dayBreakdown?.workoutPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--muted-bg)] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dayBreakdown?.workoutPct}%` }} />
                    </div>
                  </GlassCard>

                  {/* Sleep */}
                  <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                          <Moon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] font-medium">Sleep Rest</p>
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            {dayRecord.sleep_hours > 0 ? `${dayRecord.sleep_hours} / ${dayRecord.sleep_goal_hours} hrs` : 'Not logged'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-500">{dayBreakdown?.sleepPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--muted-bg)] rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${dayBreakdown?.sleepPct}%` }} />
                    </div>
                  </GlassCard>

                  {/* Habits */}
                  <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] font-medium">Healthy Habits</p>
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            {dayRecord.habit_completion}% Progress
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">{dayBreakdown?.habitPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--muted-bg)] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dayBreakdown?.habitPct}%` }} />
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PERIOD VIEW (7 DAYS & 30 DAYS) */}
        {(activeTab === "7days" || activeTab === "30days") && (
          <div className="space-y-6">
            {/* Overview Analytics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <GlassCard className="p-4 text-center">
                <span className="text-xs text-[var(--muted)] block">Avg Goal Score</span>
                <span className="text-2xl font-extrabold text-primary">{analytics?.goalCompletionRate || 0}%</span>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <span className="text-xs text-[var(--muted)] block">Avg Calories</span>
                <span className="text-2xl font-extrabold text-amber-500">{analytics?.averageCalories.toLocaleString() || 0} kcal</span>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <span className="text-xs text-[var(--muted)] block">Avg Water</span>
                <span className="text-2xl font-extrabold text-cyan-500">{analytics?.averageWater.toLocaleString() || 0} ml</span>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <span className="text-xs text-[var(--muted)] block">Total Workouts</span>
                <span className="text-2xl font-extrabold text-indigo-500">{analytics?.totalWorkouts || 0} sessions</span>
              </GlassCard>
            </div>

            {/* Daily Breakdown Bars */}
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {activeTab === "7days" ? "Last 7 Days Progress" : "Last 30 Days Progress"}
              </h3>

              <div className="space-y-3 pt-2">
                {historyRecords.slice().reverse().map((rec) => {
                  const b = calculateGoalBreakdown(rec);
                  const isCurToday = rec.date === getLocalDateString(undefined, profile?.timezone);

                  return (
                    <div
                      key={rec.date}
                      onClick={() => {
                        setSelectedDate(rec.date);
                        setActiveTab("day");
                      }}
                      className="p-3 rounded-xl bg-[var(--muted-bg)]/40 hover:bg-[var(--muted-bg)] transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="w-32 shrink-0">
                        <span className="text-xs font-semibold text-[var(--foreground)] block">
                          {isCurToday ? "Today" : formatDisplayDate(rec.date, profile?.timezone)}
                        </span>
                        <span className="text-[10px] text-[var(--muted)] font-mono">{rec.date}</span>
                      </div>

                      <div className="flex-1 flex items-center gap-3">
                        {rec.has_data ? (
                          <>
                            <div className="h-2 flex-1 bg-[var(--card-bg)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${b.overallScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-primary w-10 text-right">
                              {b.overallScore}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs italic text-[var(--muted)]">No data recorded</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
