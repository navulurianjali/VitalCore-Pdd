"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { 
  Target, Users, CheckCircle, 
  Activity, Plus, RefreshCw, X,
  Droplets, Moon, Utensils, Smile, Sparkles, Award, Star,
  Clock, ArrowRight, ChevronRight, Trophy, Zap, ShieldCheck, Flame
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  category: "Fitness" | "Nutrition" | "Hydration" | "Sleep" | "Mental Wellness" | "Healthy Habits";
  difficulty: "Easy" | "Medium" | "Hard";
  xp_reward: number;
  duration_days: number;
  participants_count?: number;
}

export const PREDEFINED_CHALLENGES: ChallengeItem[] = [
  // 1. FITNESS
  { id: "c-fit-1", title: "Walk 10,000 Steps Daily", description: "Achieve 10,000 steps every day for 30 days to build foundational cardiovascular endurance.", category: "Fitness", difficulty: "Medium", xp_reward: 350, duration_days: 30, participants_count: 142 },
  { id: "c-fit-2", title: "50 Squats Daily Challenge", description: "Perform 50 bodyweight squats daily to strengthen lower body and improve mobility.", category: "Fitness", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 89 },
  { id: "c-fit-3", title: "Core Strength Sprint", description: "Complete daily plank and core exercises to build trunk stability.", category: "Fitness", difficulty: "Hard", xp_reward: 500, duration_days: 30, participants_count: 215 },
  { id: "c-fit-4", title: "Yoga & Mobility Flow", description: "Practice 20 minutes of daily yoga and hip mobility routines.", category: "Fitness", difficulty: "Easy", xp_reward: 250, duration_days: 21, participants_count: 110 },
  { id: "c-fit-5", title: "7-Day 10k Step Streak", description: "Maintain a continuous 7-day streak of reaching 10,000 steps daily.", category: "Fitness", difficulty: "Medium", xp_reward: 250, duration_days: 7, participants_count: 310 },

  // 2. NUTRITION
  { id: "c-nut-1", title: "High Protein Week", description: "Hit your daily protein target (at least 80g-120g) every day for 7 days.", category: "Nutrition", difficulty: "Medium", xp_reward: 250, duration_days: 7, participants_count: 184 },
  { id: "c-nut-2", title: "Zero Sugary Drinks", description: "Eliminate all sodas, packaged juices, and sweetened beverages for 14 days.", category: "Nutrition", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 275 },
  { id: "c-nut-3", title: "Healthy Protein Breakfast", description: "Eat an evidence-based high-protein, high-fiber breakfast daily.", category: "Nutrition", difficulty: "Easy", xp_reward: 150, duration_days: 7, participants_count: 95 },
  { id: "c-nut-4", title: "No Junk Food Week", description: "Avoid fried foods, processed snacks, and fast food for 7 consecutive days.", category: "Nutrition", difficulty: "Medium", xp_reward: 300, duration_days: 7, participants_count: 420 },
  { id: "c-nut-5", title: "Fiber-Rich Meal Sprint", description: "Consume at least 30g of dietary fiber daily from whole grains & vegetables.", category: "Nutrition", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 130 },
  { id: "c-nut-6", title: "Intermittent Fasting Reset", description: "Follow a 16:8 intermittent fasting schedule for 10 consecutive days.", category: "Nutrition", difficulty: "Hard", xp_reward: 400, duration_days: 10, participants_count: 198 },

  // 3. HYDRATION
  { id: "c-hyd-1", title: "Drink 2.5L Water Daily", description: "Drink 2,500ml of fresh water every day to maintain optimal cellular hydration.", category: "Hydration", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 512 },
  { id: "c-hyd-2", title: "7-Day Hydration Hero", description: "Log at least 2,000ml of water daily for 7 consecutive days.", category: "Hydration", difficulty: "Easy", xp_reward: 150, duration_days: 7, participants_count: 380 },
  { id: "c-hyd-3", title: "Zero Soda & Energy Drinks", description: "Replace all commercial energy drinks and sodas with pure water or herbal tea.", category: "Hydration", difficulty: "Medium", xp_reward: 250, duration_days: 21, participants_count: 165 },
  { id: "c-hyd-4", title: "Morning Water Opener", description: "Drink 500ml of warm water immediately upon waking for 30 consecutive days.", category: "Hydration", difficulty: "Easy", xp_reward: 250, duration_days: 30, participants_count: 240 },

  // 4. SLEEP
  { id: "c-slp-1", title: "Sleep Before 11 PM", description: "Go to bed before 11:00 PM every night for 14 nights to align circadian rhythm.", category: "Sleep", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 290 },
  { id: "c-slp-2", title: "Digital Detox Before Bed", description: "Turn off all smartphone, laptop, and TV screens 45 minutes before sleep.", category: "Sleep", difficulty: "Easy", xp_reward: 200, duration_days: 7, participants_count: 340 },
  { id: "c-slp-3", title: "8-Hour Sleep Sprint", description: "Log 8 hours of restorative sleep per night for 10 consecutive nights.", category: "Sleep", difficulty: "Medium", xp_reward: 350, duration_days: 10, participants_count: 175 },
  { id: "c-slp-4", title: "Consistent Wake Time", description: "Wake up at the exact same hour every morning for 21 days.", category: "Sleep", difficulty: "Hard", xp_reward: 450, duration_days: 21, participants_count: 120 },

  // 5. MENTAL WELLNESS
  { id: "c-men-1", title: "15-Min Daily Meditation", description: "Practice 15 minutes of mindfulness or guided meditation daily for 14 days.", category: "Mental Wellness", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 210 },
  { id: "c-men-2", title: "Daily Gratitude Journal", description: "Write down 3 things you are grateful for every evening for 21 days.", category: "Mental Wellness", difficulty: "Easy", xp_reward: 250, duration_days: 21, participants_count: 185 },
  { id: "c-men-3", title: "Box Breathing Reset", description: "Perform 5 minutes of box breathing whenever stress spike is detected.", category: "Mental Wellness", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 140 },
  { id: "c-men-4", title: "Screen Time Detox", description: "Limit daily non-work screen time to under 2 hours for 7 days.", category: "Mental Wellness", difficulty: "Hard", xp_reward: 400, duration_days: 7, participants_count: 195 },

  // 6. HEALTHY HABITS
  { id: "c-hab-1", title: "No Alcohol Month", description: "Abstain from all alcoholic beverages for 30 consecutive days.", category: "Healthy Habits", difficulty: "Hard", xp_reward: 500, duration_days: 30, participants_count: 160 },
  { id: "c-hab-2", title: "Cold Shower Energy Boost", description: "Take a 60-second cold shower ending every morning for 14 days.", category: "Healthy Habits", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 225 },
  { id: "c-hab-3", title: "Morning Sun Exposure", description: "Get 15 minutes of direct morning sunlight within 1 hour of waking.", category: "Healthy Habits", difficulty: "Easy", xp_reward: 200, duration_days: 21, participants_count: 310 },
  { id: "c-hab-4", title: "Probiotic Gut Health", description: "Consume daily fermented probiotic foods (curd, yogurt, kefir) for 14 days.", category: "Healthy Habits", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 170 }
];

// Circular SVG Progress Ring Component (Primary Teal Design System)
const ProgressRing = ({ percentage = 0, size = 42, strokeWidth = 3.5 }: { percentage: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-foreground/8"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(168, 80%, 36%)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isNaN(strokeDashoffset) ? circumference : strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground tabular-nums">
        {Math.round(percentage)}%
      </span>
    </div>
  );
};

export default function HealthyHabitsPage() {
  const { profile, updateProfile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Data state
  const [challenges, setChallenges] = useState<ChallengeItem[]>(PREDEFINED_CHALLENGES);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [selectedChallengeModal, setSelectedChallengeModal] = useState<any | null>(null);

  const handleCompleteChallenge = async (uc: any) => {
    const userId = profile?.id;
    if (!userId || !supabase) return;

    const ch = uc.challenge || {};
    const chId = uc.challenge_id || ch.id;
    const xpReward = Number(ch.xp_reward || 200);
    const nowIso = new Date().toISOString();

    setUserChallenges((prev) =>
      prev.map((item) => {
        if (item.challenge_id === chId || item.challenge?.id === chId) {
          return {
            ...item,
            completed: true,
            progress_percentage: 100,
            completed_at: nowIso,
          };
        }
        return item;
      })
    );

    try {
      const payloadWithTime = {
        user_id: userId,
        challenge_id: chId,
        completed: true,
        progress_percentage: 100,
        completed_at: nowIso,
      };

      const { error } = await supabase
        .from("user_challenges")
        .upsert(payloadWithTime, { onConflict: "user_id,challenge_id" });

      if (error) {
        // Fallback without completed_at column if column is not yet cached
        await supabase
          .from("user_challenges")
          .upsert(
            {
              user_id: userId,
              challenge_id: chId,
              completed: true,
              progress_percentage: 100,
            },
            { onConflict: "user_id,challenge_id" }
          );
      }

      if (profile && updateProfile) {
        await updateProfile({ xp: (profile.xp || 0) + xpReward });
      }

      await fetchChallenges();
    } catch (err) {
      console.error("Error completing challenge:", err);
    }
  };
  
  // Create Challenge Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Fitness");
  const [newDifficulty, setNewDifficulty] = useState<string>("Medium");
  const [newDuration, setNewDuration] = useState("7");
  const [newXp, setNewXp] = useState("200");
  
  const CATEGORIES = ["All", "Fitness", "Nutrition", "Hydration", "Sleep", "Mental Wellness", "Healthy Habits"];

  const fetchChallenges = async () => {
    if (!supabase) return;
    try {
      setLoadingChallenges(true);
      const { data: allC } = await supabase
        .from("challenges")
        .select("*")
        .order("id", { ascending: false });
      
      if (allC && allC.length > 0) {
        setChallenges(allC.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category || "Fitness",
          difficulty: c.difficulty || "Medium",
          xp_reward: Number(c.xp_reward || 200),
          duration_days: Number(c.duration_days || 7),
          participants_count: Number(c.participants_count || 120)
        })));
      } else {
        setChallenges(PREDEFINED_CHALLENGES);
      }

      if (profile?.id) {
        const { data: uc } = await supabase
          .from("user_challenges")
          .select("*, challenge:challenges(*)")
          .eq("user_id", profile.id);
        
        if (uc) {
          setUserChallenges(uc);
        } else {
          setUserChallenges([]);
        }
      } else {
        setUserChallenges([]);
      }
    } catch (err) {
      console.error("Error fetching challenges:", err);
      setChallenges(PREDEFINED_CHALLENGES);
    } finally {
      setLoadingChallenges(false);
    }
  };

  useEffect(() => {
    fetchChallenges();

    if (!supabase) return;
    const channel = supabase
      .channel("public:challenges_realtime_web")
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, () => {
        fetchChallenges();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "user_challenges" }, () => {
        fetchChallenges();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const handleJoinChallenge = async (ch: ChallengeItem) => {
    const userId = profile?.id;
    if (!userId || !supabase) return;

    const optimisticObj = {
      id: `uc-${Date.now()}`,
      user_id: userId,
      challenge_id: ch.id,
      progress_percentage: 0,
      challenge: ch
    };
    setUserChallenges([optimisticObj, ...userChallenges]);

    try {
      await supabase
        .from("user_challenges")
        .insert({ user_id: userId, challenge_id: ch.id, progress_percentage: 0 });
      fetchChallenges();
    } catch (err) {
      console.error("Join error:", err);
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    const userId = profile?.id;
    if (!userId || !supabase) return;

    setUserChallenges(prev => prev.filter(uc => uc.challenge_id !== challengeId && uc.challenge?.id !== challengeId));

    try {
      await supabase
        .from("user_challenges")
        .delete()
        .eq("user_id", userId)
        .eq("challenge_id", challengeId);
      fetchChallenges();
    } catch (err) {
      console.error("Leave challenge error:", err);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !profile?.id || !supabase) return;
    setSubmitting(true);
    
    const newChallenge = {
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      duration_days: parseInt(newDuration) || 7,
      xp_reward: parseInt(newXp) || 200,
      created_by: profile.id
    };

    try {
      const { data, error } = await supabase.from("challenges").insert(newChallenge).select();
      if (error) {
        console.error("Challenge creation error:", error.message);
      } else if (data && data.length > 0) {
        await supabase.from("user_challenges").insert({
          user_id: profile.id,
          challenge_id: data[0].id,
          progress_percentage: 0
        });
      }
    } catch (err) {
      console.error("Create exception:", err);
    } finally {
      setSubmitting(false);
      setShowCreateModal(false);
      setNewTitle("");
      setNewDesc("");
      fetchChallenges();
    }
  };

  const hasJoined = (id: string) => {
    return userChallenges.some((uc: any) => uc.challenge_id === id || uc.challenge?.id === id);
  };

  // 1. DEDUPLICATION: Remove duplicate challenges by title
  const uniqueChallenges = useMemo(() => {
    const seen = new Set<string>();
    const list: ChallengeItem[] = [];
    for (const c of challenges) {
      const cleanKey = c.title.toLowerCase().trim();
      if (!seen.has(cleanKey)) {
        seen.add(cleanKey);
        list.push(c);
      }
    }
    return list;
  }, [challenges]);

  // Filtered by Category
  const filteredChallenges = useMemo(() => {
    if (selectedCategory === "All") return uniqueChallenges;
    return uniqueChallenges.filter(c => c.category === selectedCategory);
  }, [selectedCategory, uniqueChallenges]);

  // 2. RECOMMENDATION ENGINE: 3 Personalized picks based on user profile & goals
  const recommendedChallenges = useMemo(() => {
    const goal = (profile?.fitness_goal || "").toLowerCase();
    const unjoined = uniqueChallenges.filter(c => !hasJoined(c.id));

    if (goal.includes("weight") || goal.includes("fat") || goal.includes("loss")) {
      return unjoined.filter(c => c.category === "Nutrition" || c.category === "Fitness" || c.category === "Hydration").slice(0, 3);
    } else if (goal.includes("muscle") || goal.includes("strength") || goal.includes("gain")) {
      return unjoined.filter(c => c.category === "Fitness" || c.category === "Nutrition").slice(0, 3);
    } else if (goal.includes("sleep") || goal.includes("stress") || goal.includes("wellness")) {
      return unjoined.filter(c => c.category === "Sleep" || c.category === "Mental Wellness" || c.category === "Healthy Habits").slice(0, 3);
    }
    return unjoined.slice(0, 3);
  }, [uniqueChallenges, profile?.fitness_goal, userChallenges]);

  // Filter active vs completed user challenges
  const activeUserChallenges = useMemo(() => {
    return userChallenges.filter((uc: any) => !uc.completed && (uc.progress_percentage || 0) < 100);
  }, [userChallenges]);

  const completedUserChallenges = useMemo(() => {
    return userChallenges.filter((uc: any) => uc.completed === true || (uc.progress_percentage || 0) >= 100);
  }, [userChallenges]);

  // Stats row calculations
  const completedCount = useMemo(() => {
    return completedUserChallenges.length;
  }, [completedUserChallenges]);

  const totalXp = useMemo(() => {
    return userChallenges.reduce((sum, uc) => sum + (uc.challenge?.xp_reward || 200), 0) + (profile?.xp || 0);
  }, [userChallenges, profile?.xp]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Fitness": return Activity;
      case "Nutrition": return Utensils;
      case "Hydration": return Droplets;
      case "Sleep": return Moon;
      case "Mental Wellness": return Smile;
      default: return Sparkles;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
        
        {/* HEADER & STATISTICS WIDGET ROW */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-foreground/8 shadow-xs">
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Health Challenges
              </h1>
              <p className="text-xs text-foreground/60 font-normal">
                Evidence-based habit protocols and preventative health sprints.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={fetchChallenges}
                variant="glass"
                size="sm"
                className="text-xs font-medium py-1.5 px-3 flex items-center gap-1.5 rounded-xl border border-foreground/10 text-foreground/80"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingChallenges ? "animate-spin" : ""}`} />
                Sync
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                className="py-1.5 px-3.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 shadow-xs rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Create Challenge
              </Button>
            </div>
          </div>

          {/* STATS ROW WIDGETS (VitalCore Minimal Design System) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl glass-panel border border-foreground/8 shadow-xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Active</span>
                <span className="text-sm font-bold text-foreground tabular-nums">{userChallenges.length}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel border border-foreground/8 shadow-xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Completed</span>
                <span className="text-sm font-bold text-foreground tabular-nums">{completedCount}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel border border-foreground/8 shadow-xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Streak</span>
                <span className="text-sm font-bold text-foreground tabular-nums">{profile?.streak_days || 0} Days</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel border border-foreground/8 shadow-xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Health XP</span>
                <span className="text-sm font-bold text-foreground tabular-nums">{totalXp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: ACTIVE CHALLENGES */}
        {activeUserChallenges.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Active Challenges ({activeUserChallenges.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeUserChallenges.map((uc: any, idx: number) => {
                const ch = uc.challenge || {};
                const chId = uc.challenge_id || ch.id;
                const progress = uc.progress_percentage || 0;
                const IconComp = getCategoryIcon(ch.category);

                return (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-2xl glass-panel border border-foreground/8 shadow-xs hover:border-primary/20 transition-all duration-200 flex flex-col gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <ProgressRing percentage={progress} size={42} strokeWidth={3.5} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <IconComp className="h-2.5 w-2.5" />
                            {ch.category || "Active"}
                          </span>
                          <span className="text-[9px] font-medium text-foreground/40">{ch.duration_days || 7}d sprint</span>
                        </div>
                        <h4 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {ch.title || "Custom Challenge"}
                        </h4>
                        <span className="text-[10px] font-medium text-foreground/50 flex items-center gap-1 mt-0.5">
                          <Trophy className="h-2.5 w-2.5 text-foreground/40" /> +{ch.xp_reward || 200} XP
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setSelectedChallengeModal(ch)}
                          className="p-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/70 transition-all text-xs cursor-pointer"
                          title="Details"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleLeaveChallenge(chId)}
                          className="p-1.5 rounded-xl bg-foreground/5 hover:bg-rose-500/10 text-foreground/40 hover:text-rose-500 transition-all text-xs cursor-pointer"
                          title="Leave"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Action Button: Mark as Completed */}
                    <div className="pt-2 border-t border-foreground/5 flex items-center justify-between">
                      <span className="text-[10px] text-foreground/50 font-medium">Ready to claim XP?</span>
                      <button
                        onClick={() => handleCompleteChallenge(uc)}
                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Mark as Completed</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 1.5: COMPLETED CHALLENGES */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Completed Challenges ({completedUserChallenges.length})
          </h2>

          {completedUserChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedUserChallenges.map((uc: any, idx: number) => {
                const ch = uc.challenge || {};
                const IconComp = getCategoryIcon(ch.category);
                const dateCompletedStr = uc.completed_at
                  ? new Date(uc.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Recently";

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-500/[0.03] shadow-xs flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                      <CheckCircle className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <IconComp className="h-2.5 w-2.5" />
                          {ch.category || "Completed"}
                        </span>
                        <span className="text-[9px] font-medium text-emerald-500/80 font-mono">
                          Completed {dateCompletedStr}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-foreground truncate">
                        {ch.title || "Health Challenge"}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                        <Trophy className="h-3 w-3" /> +{ch.xp_reward || 200} XP Awarded
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-2xl glass-panel border border-foreground/8 text-center text-xs font-semibold text-foreground/50">
              No completed challenges yet.
            </div>
          )}
        </section>

        {/* SECTION 2: ⭐ RECOMMENDED FOR YOU (Medical Minimal Glass Cards) */}
        {recommendedChallenges.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-primary" />
                Recommended For You
              </h2>
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Matched to Goals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recommendedChallenges.map((ch: ChallengeItem) => {
                const IconComp = getCategoryIcon(ch.category);
                return (
                  <div 
                    key={ch.id} 
                    className="p-4 rounded-2xl glass-panel border border-primary/20 bg-primary/[0.02] shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold flex items-center gap-1">
                          <IconComp className="h-3 w-3" />
                          {ch.category}
                        </span>
                        <span className="text-[10px] font-medium text-foreground/50 flex items-center gap-1">
                          <Trophy className="h-2.5 w-2.5 text-primary/70" /> +{ch.xp_reward} XP
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {ch.title}
                        </h3>
                        <p className="text-[11px] text-foreground/60 font-normal mt-1 leading-relaxed line-clamp-2">
                          {ch.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-foreground/5">
                      <span className="text-[10px] font-medium text-foreground/50">{ch.duration_days} Days • {ch.difficulty}</span>
                      <Button
                        onClick={() => handleJoinChallenge(ch)}
                        variant="primary"
                        size="sm"
                        className="py-1.5 px-3 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs"
                      >
                        Join Challenge
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 3: CHALLENGE LIBRARY (Segmented Control + Minimal Cards Grid) */}
        <section id="challenge-library" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-primary" />
              Challenge Library ({filteredChallenges.length})
            </h2>
          </div>

          {/* MODERN SEGMENTED CONTROL TAB BAR */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-foreground/5 rounded-2xl border border-foreground/8 text-xs font-medium no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl shrink-0 transition-all text-xs cursor-pointer ${
                    isSelected 
                      ? "bg-primary text-white font-semibold shadow-xs" 
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* COMPACT MINIMAL CHALLENGES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredChallenges.map((ch: ChallengeItem) => {
              const IconComp = getCategoryIcon(ch.category);
              const joined = hasJoined(ch.id);

              return (
                <div 
                  key={ch.id} 
                  className="p-3.5 rounded-2xl glass-panel border border-foreground/8 shadow-xs hover:border-primary/20 transition-all duration-200 flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/70 text-[10px] font-semibold flex items-center gap-1">
                        <IconComp className="h-3 w-3 text-primary" />
                        {ch.category}
                      </span>
                      <span className="text-[10px] font-medium text-foreground/50 flex items-center gap-1">
                        <Trophy className="h-2.5 w-2.5 text-primary/70" /> +{ch.xp_reward} XP
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {ch.title}
                      </h3>
                      <p className="text-[11px] text-foreground/60 font-normal mt-1 leading-relaxed line-clamp-2">
                        {ch.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-foreground/5">
                    <div className="flex items-center justify-between text-[10px] font-medium text-foreground/50">
                      <span>{ch.duration_days} Days • {ch.difficulty}</span>
                      <span>{ch.participants_count || 120}+ Active</span>
                    </div>

                    {joined ? (
                      <div className="w-full text-center text-xs font-semibold py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Joined & Active
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleJoinChallenge(ch)}
                        variant="primary"
                        className="w-full py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs"
                      >
                        Join Challenge
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* CREATE YOUR OWN CHALLENGE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-foreground/10 bg-background space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Create Custom Challenge
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-foreground/50 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Challenge Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 7-Day Morning Hydration Sprint"
                  className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Drink 500ml water immediately upon waking."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-normal focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  >
                    <option value="Fitness">Fitness</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Hydration">Hydration</option>
                    <option value="Sleep">Sleep</option>
                    <option value="Mental Wellness">Mental Wellness</option>
                    <option value="Healthy Habits">Healthy Habits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">XP Reward</label>
                  <input
                    type="number"
                    value={newXp}
                    onChange={(e) => setNewXp(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button size="sm" variant="glass" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} size="sm" variant="primary" className="bg-primary text-white font-semibold">
                  {submitting ? "Publishing..." : "Publish Challenge"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHALLENGE DETAILS MODAL */}
      {selectedChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-foreground/10 bg-background space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                {selectedChallengeModal.category || "Challenge"}
              </span>
              <button onClick={() => setSelectedChallengeModal(null)} className="text-foreground/50 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">{selectedChallengeModal.title}</h3>
              <p className="text-xs text-foreground/60 font-normal mt-1.5 leading-relaxed">{selectedChallengeModal.description}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="glass" onClick={() => setSelectedChallengeModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
