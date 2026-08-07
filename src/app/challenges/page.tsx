"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { 
  Target, Users, CheckCircle, 
  Activity, Plus, Flame, RefreshCw, X,
  Droplets, Moon, Utensils, Smile, Sparkles, Award, Star,
  Clock, ArrowRight, ChevronRight
} from "lucide-react";
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

export default function HealthyHabitsPage() {
  const { profile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Data state
  const [challenges, setChallenges] = useState<ChallengeItem[]>(PREDEFINED_CHALLENGES);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [selectedChallengeModal, setSelectedChallengeModal] = useState<any | null>(null);
  
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
      title: newTitle,
      description: newDesc,
      category: newCategory,
      difficulty: newDifficulty,
      duration_days: parseInt(newDuration) || 7,
      xp_reward: parseInt(newXp) || 200
    };

    try {
      const { data, error } = await supabase.from("challenges").insert(newChallenge).select();
      if (!error && data && data.length > 0) {
        await supabase.from("user_challenges").insert({
          user_id: profile.id,
          challenge_id: data[0].id,
          progress_percentage: 0
        });
      }
    } catch (err) {
      console.error("Create error:", err);
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

  // 2. RECOMMENDATION ENGINE: 3-4 Personalized picks based on user profile & goals
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
        
        {/* HEADER & ACTION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-foreground/5 border border-foreground/8 shadow-sm backdrop-blur-md">
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2 text-foreground">
              <Award className="h-6 w-6 text-emerald-500 shrink-0" />
              Health Challenges & Sprints
            </h1>
            <p className="text-xs text-foreground/60 font-medium">
              Join evidence-based health sprints, earn XP, and build sustainable habits.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={fetchChallenges}
              variant="glass"
              size="sm"
              className="text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingChallenges ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="py-2 px-3.5 text-xs font-bold bg-primary text-white flex items-center gap-1.5 shadow-sm rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </div>
        </div>

        {/* SECTION 1: ACTIVE CHALLENGES (Compact Cards) */}
        {userChallenges.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-foreground tracking-wide flex items-center gap-2 uppercase">
                <Flame className="h-4 w-4 text-orange-500" />
                Active Challenges ({userChallenges.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userChallenges.map((uc: any, idx: number) => {
                const ch = uc.challenge || {};
                const chId = uc.challenge_id || ch.id;
                const progress = uc.progress_percentage || 0;

                return (
                  <GlassCard key={idx} className="p-4 space-y-3 border-l-4 border-l-orange-500 rounded-2xl shadow-sm hover:scale-[1.01] transition-transform">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold">
                            {ch.category || "Active"}
                          </span>
                          <span className="text-[10px] font-semibold text-foreground/50">{ch.duration_days || 7} Days</span>
                        </div>
                        <h4 className="font-bold text-xs text-foreground truncate mt-1">{ch.title || "Custom Challenge"}</h4>
                      </div>
                      <button
                        onClick={() => handleLeaveChallenge(chId)}
                        className="text-[10px] font-bold text-foreground/40 hover:text-rose-500 transition-colors p-1"
                        title="Leave challenge"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Progress Bar & Details Row */}
                    <div className="space-y-1.5 pt-1 border-t border-foreground/5">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-foreground/60">Progress</span>
                        <span className="text-orange-500 tabular-nums">{progress}%</span>
                      </div>
                      <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setSelectedChallengeModal(ch)}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          View Details <ChevronRight className="h-3 w-3" />
                        </button>
                        <span className="text-[10px] font-semibold text-foreground/50">🏆 +{ch.xp_reward || 200} XP</span>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 2: ⭐ RECOMMENDED FOR YOU (Personalized 3-4 Picks) */}
        {recommendedChallenges.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-foreground tracking-wide flex items-center gap-2 uppercase">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                Recommended For You
              </h2>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Matched to Your Goals
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendedChallenges.map((ch: ChallengeItem) => {
                const IconComp = getCategoryIcon(ch.category);
                return (
                  <GlassCard key={ch.id} className="p-4 flex flex-col justify-between space-y-3 border-amber-500/20 bg-amber-500/5 hover:scale-[1.01] transition-transform">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold flex items-center gap-1">
                          <IconComp className="h-3 w-3" />
                          {ch.category}
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-500">🏆 +{ch.xp_reward} XP</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-foreground line-clamp-1">{ch.title}</h3>
                        <p className="text-[11px] text-foreground/60 font-medium line-clamp-2 mt-0.5 leading-tight">
                          {ch.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-foreground/5">
                      <span className="text-[10px] font-semibold text-foreground/50">{ch.duration_days} Days • {ch.difficulty}</span>
                      <Button
                        onClick={() => handleJoinChallenge(ch)}
                        variant="primary"
                        size="sm"
                        className="py-1 px-2.5 text-[11px] font-bold bg-amber-500 text-black hover:bg-amber-400 border-none shadow-sm rounded-lg"
                      >
                        Join Now
                      </Button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 3: CHALLENGE LIBRARY (Modern Segmented Control + Compact Grid) */}
        <section id="challenge-library" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-foreground tracking-wide flex items-center gap-2 uppercase">
                <Target className="h-4 w-4 text-primary" />
                Challenge Library
              </h2>
              <p className="text-[11px] text-foreground/60 font-medium">
                {filteredChallenges.length} challenges available
              </p>
            </div>
          </div>

          {/* MODERN SEGMENTED CONTROL / PILL CATEGORY FILTER */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-foreground/5 rounded-2xl border border-foreground/8 text-xs font-semibold no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl shrink-0 transition-all text-xs ${
                    isSelected 
                      ? "bg-primary text-white font-bold shadow-sm" 
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5 font-medium"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* COMPACT CHALLENGES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredChallenges.map((ch: ChallengeItem) => {
              const IconComp = getCategoryIcon(ch.category);
              const joined = hasJoined(ch.id);

              return (
                <GlassCard key={ch.id} className="p-4 space-y-3 flex flex-col justify-between hover:scale-[1.008] transition-transform duration-150 shadow-sm border-foreground/8">
                  <div className="space-y-2">
                    {/* Category Badge & XP */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                        <IconComp className="h-3 w-3" />
                        {ch.category}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500 tabular-nums">
                        🏆 +{ch.xp_reward} XP
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-xs text-foreground leading-snug line-clamp-1">{ch.title}</h3>
                      <p className="text-[11px] text-foreground/60 font-medium mt-1 leading-normal line-clamp-2">{ch.description}</p>
                    </div>
                  </div>

                  {/* Metadata & Join Button */}
                  <div className="space-y-2.5 pt-2 border-t border-foreground/5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-foreground/50">
                      <span>{ch.duration_days} Days • {ch.difficulty}</span>
                      <span>{ch.participants_count || 120}+ Active</span>
                    </div>

                    {joined ? (
                      <div className="w-full text-center text-xs font-bold py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Joined & Active
                      </div>
                    ) : (
                      <Button onClick={() => handleJoinChallenge(ch)} variant="primary" className="w-full text-xs font-bold py-2 bg-primary text-white rounded-xl shadow-sm">
                        Join Challenge
                      </Button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>

      </div>

      {/* CREATE YOUR OWN CHALLENGE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-foreground/10 bg-background space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Create Your Own Challenge
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-foreground/50 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Challenge Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 7-Day Morning Electrolyte Sprint"
                  className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Drink 500ml water with electrolyte salt every morning."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
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
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
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
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">XP Reward</label>
                  <input
                    type="number"
                    value={newXp}
                    onChange={(e) => setNewXp(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button size="sm" variant="glass" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} size="sm" variant="primary" className="bg-primary text-white font-bold">
                  {submitting ? "Publishing..." : "Publish Challenge"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHALLENGE DETAILS MODAL */}
      {selectedChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-foreground/10 bg-background space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {selectedChallengeModal.category || "Challenge"}
              </span>
              <button onClick={() => setSelectedChallengeModal(null)} className="text-foreground/50 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">{selectedChallengeModal.title}</h3>
              <p className="text-xs text-foreground/60 font-semibold mt-1.5 leading-relaxed">{selectedChallengeModal.description}</p>
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
