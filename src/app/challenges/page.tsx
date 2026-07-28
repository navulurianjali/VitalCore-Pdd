"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { 
  Target, Users, CheckCircle, 
  Activity, Plus, Flame, RefreshCw, X,
  Droplets, Moon, Utensils, Smile, Sparkles, Award
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
  { id: "c-fit-1", title: "Walk 10,000 Steps for 30 Days", description: "Achieve 10,000 steps every day for 30 days to build foundational cardiovascular endurance.", category: "Fitness", difficulty: "Medium", xp_reward: 350, duration_days: 30, participants_count: 142 },
  { id: "c-fit-2", title: "50 Squats Daily Challenge", description: "Perform 50 bodyweight squats daily to strengthen lower body and improve mobility.", category: "Fitness", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 89 },
  { id: "c-fit-3", title: "30-Day Core Strength Sprint", description: "Complete daily plank and core exercises to build trunk stability.", category: "Fitness", difficulty: "Hard", xp_reward: 500, duration_days: 30, participants_count: 215 },
  { id: "c-fit-4", title: "Yoga & Mobility for 21 Days", description: "Practice 20 minutes of daily yoga and hip mobility routines.", category: "Fitness", difficulty: "Easy", xp_reward: 250, duration_days: 21, participants_count: 110 },
  { id: "c-fit-5", title: "10k Step Streak Sprint", description: "Maintain a continuous 7-day streak of reaching 10,000 steps daily.", category: "Fitness", difficulty: "Medium", xp_reward: 250, duration_days: 7, participants_count: 310 },

  // 2. NUTRITION
  { id: "c-nut-1", title: "High Protein Week", description: "Hit your daily protein target (at least 80g-120g) every day for 7 days.", category: "Nutrition", difficulty: "Medium", xp_reward: 250, duration_days: 7, participants_count: 184 },
  { id: "c-nut-2", title: "No Sugary Drinks Challenge", description: "Eliminate all sodas, packaged juices, and sweetened beverages for 14 days.", category: "Nutrition", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 275 },
  { id: "c-nut-3", title: "Healthy Breakfast Challenge", description: "Eat an evidence-based high-protein, high-fiber breakfast daily.", category: "Nutrition", difficulty: "Easy", xp_reward: 150, duration_days: 7, participants_count: 95 },
  { id: "c-nut-4", title: "No Junk Food Week", description: "Avoid fried foods, processed snacks, and fast food for 7 consecutive days.", category: "Nutrition", difficulty: "Medium", xp_reward: 300, duration_days: 7, participants_count: 420 },
  { id: "c-nut-5", title: "Fiber-Rich Meal Sprint", description: "Consume at least 30g of dietary fiber daily from whole grains & vegetables.", category: "Nutrition", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 130 },
  { id: "c-nut-6", title: "Intermittent Fasting Reset", description: "Follow a 16:8 intermittent fasting schedule for 10 consecutive days.", category: "Nutrition", difficulty: "Hard", xp_reward: 400, duration_days: 10, participants_count: 198 },

  // 3. HYDRATION
  { id: "c-hyd-1", title: "Drink 2.5L Water Daily", description: "Drink 2,500ml of fresh water every day to maintain optimal cellular hydration.", category: "Hydration", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 512 },
  { id: "c-hyd-2", title: "7-Day Hydration Hero", description: "Log at least 2,000ml of water daily for 7 consecutive days.", category: "Hydration", difficulty: "Easy", xp_reward: 150, duration_days: 7, participants_count: 380 },
  { id: "c-hyd-3", title: "Zero Soda & Energy Drinks", description: "Replace all commercial energy drinks and sodas with pure water or herbal tea.", category: "Hydration", difficulty: "Medium", xp_reward: 250, duration_days: 21, participants_count: 165 },
  { id: "c-hyd-4", title: "Morning Hydration Opener", description: "Drink 500ml of warm water immediately upon waking for 30 consecutive days.", category: "Hydration", difficulty: "Easy", xp_reward: 250, duration_days: 30, participants_count: 240 },

  // 4. SLEEP
  { id: "c-slp-1", title: "Sleep Before 11 PM", description: "Go to bed before 11:00 PM every night for 14 nights to align circadian rhythm.", category: "Sleep", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 290 },
  { id: "c-slp-2", title: "Digital Detox Before Bed", description: "Turn off all smartphone, laptop, and TV screens 45 minutes before sleep.", category: "Sleep", difficulty: "Easy", xp_reward: 200, duration_days: 7, participants_count: 340 },
  { id: "c-slp-3", title: "8-Hour Sleep Routine Sprint", description: "Log 8 hours of restorative sleep per night for 10 consecutive nights.", category: "Sleep", difficulty: "Medium", xp_reward: 350, duration_days: 10, participants_count: 175 },
  { id: "c-slp-4", title: "Consistent Wake Time Challenge", description: "Wake up at the exact same hour every morning for 21 days.", category: "Sleep", difficulty: "Hard", xp_reward: 450, duration_days: 21, participants_count: 120 },

  // 5. MENTAL WELLNESS
  { id: "c-men-1", title: "15-Min Daily Meditation", description: "Practice 15 minutes of mindfulness or guided meditation daily for 14 days.", category: "Mental Wellness", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 210 },
  { id: "c-men-2", title: "Daily Gratitude Journal", description: "Write down 3 things you are grateful for every evening for 21 days.", category: "Mental Wellness", difficulty: "Easy", xp_reward: 250, duration_days: 21, participants_count: 185 },
  { id: "c-men-3", title: "Stress Resilience Reset", description: "Perform 5 minutes of box breathing whenever stress spike is detected.", category: "Mental Wellness", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 140 },
  { id: "c-men-4", title: "Mindful Screen Detox", description: "Limit daily non-work screen time to under 2 hours for 7 days.", category: "Mental Wellness", difficulty: "Hard", xp_reward: 400, duration_days: 7, participants_count: 195 },

  // 6. HEALTHY HABITS
  { id: "c-hab-1", title: "No Alcohol Month", description: "Abstain from all alcoholic beverages for 30 consecutive days.", category: "Healthy Habits", difficulty: "Hard", xp_reward: 500, duration_days: 30, participants_count: 160 },
  { id: "c-hab-2", title: "Cold Shower Energy Boost", description: "Take a 60-second cold shower ending every morning for 14 days.", category: "Healthy Habits", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 225 },
  { id: "c-hab-3", title: "Morning Sun Exposure", description: "Get 15 minutes of direct morning sunlight within 1 hour of waking.", category: "Healthy Habits", difficulty: "Easy", xp_reward: 200, duration_days: 21, participants_count: 310 },
  { id: "c-hab-4", title: "Probiotic Gut Health Sprint", description: "Consume daily fermented probiotic foods (curd, yogurt, kefir) for 14 days.", category: "Healthy Habits", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 170 }
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
        const combined = [...allC.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category || "Fitness",
          difficulty: c.difficulty || "Medium",
          xp_reward: Number(c.xp_reward || 200),
          duration_days: Number(c.duration_days || 7),
          participants_count: Math.floor(Math.random() * 80) + 20
        })), ...PREDEFINED_CHALLENGES];
        setChallenges(combined);
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

    // Optimistic UI Update: add to userChallenges state
    const optimisticObj = {
      id: `uc-${Date.now()}`,
      user_id: userId,
      challenge_id: ch.id,
      progress_percentage: 15,
      challenge: ch
    };
    setUserChallenges([optimisticObj, ...userChallenges]);

    try {
      await supabase
        .from("user_challenges")
        .insert({ user_id: userId, challenge_id: ch.id, progress_percentage: 15 });
    } catch (err) {
      console.error("Join error:", err);
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
          progress_percentage: 15
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

  const filteredChallenges = selectedCategory === "All"
    ? challenges
    : challenges.filter(c => c.category === selectedCategory);

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
      <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
        
        {/* BANNER & TWO MAIN ACTION BUTTONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-background to-blue-500/5 border border-foreground/5 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
              <Users className="h-7 w-7 text-emerald-500" />
              Community Health Challenges
            </h1>
            <p className="text-xs sm:text-sm text-foreground/70 font-medium">
              Join evidence-based health sprints or build your own custom challenges.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                const el = document.getElementById("challenge-library");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-2.5 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all border border-primary/20 flex items-center gap-1.5"
            >
              <Target className="h-4 w-4" />
              Join Challenges
            </button>

            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="px-4 py-2.5 text-xs font-bold bg-primary text-white flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Create Your Own Challenge
            </Button>
          </div>
        </div>

        {/* SECTION 1: MY ACTIVE CHALLENGES */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            My Active Challenges ({userChallenges.length})
          </h2>
          {userChallenges.length === 0 ? (
            <div className="p-6 text-center border border-dashed rounded-2xl border-foreground/10 text-xs font-semibold text-foreground/50">
              You haven't joined any challenges yet. Pick a challenge below to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userChallenges.map((uc: any, idx: number) => {
                const ch = uc.challenge || {};
                return (
                  <GlassCard key={idx} className="p-5 flex items-center justify-between gap-4 border-l-4 border-l-orange-500">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 text-[10px] font-bold">
                          {ch.category || "Active"}
                        </span>
                        <span className="text-[10px] font-bold text-foreground/50">{ch.duration_days || 7} Days</span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{ch.title || "Custom Challenge"}</h4>
                      <div className="flex items-center gap-2 pt-1.5">
                        <div className="flex-1 bg-foreground/10 h-2 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full transition-all duration-300" style={{ width: `${uc.progress_percentage || 15}%` }} />
                        </div>
                        <span className="text-xs font-bold text-foreground/70">{uc.progress_percentage || 15}%</span>
                      </div>
                    </div>
                    <Button onClick={() => setSelectedChallengeModal(ch)} variant="glass" size="sm" className="text-xs font-bold px-3 shrink-0">
                      Details
                    </Button>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: PREDEFINED CHALLENGE LIBRARY GRID */}
        <section id="challenge-library" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Predefined Challenge Library
              </h2>
              <p className="text-xs text-foreground/60 font-medium">
                Showing {filteredChallenges.length} challenges
              </p>
            </div>
            
            <Button onClick={fetchChallenges} variant="glass" size="sm" className="text-xs font-bold flex items-center gap-1">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingChallenges ? "animate-spin" : ""}`} />
              Refresh Library
            </Button>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar p-1 bg-foreground/5 rounded-2xl border border-foreground/10 text-xs font-bold">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl shrink-0 transition-all ${
                    isSelected ? "bg-primary text-white shadow-sm" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* CHALLENGES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((ch: ChallengeItem) => {
              const IconComp = getCategoryIcon(ch.category);
              const joined = hasJoined(ch.id);

              return (
                <GlassCard key={ch.id} className="p-5 space-y-4 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 shadow-sm">
                  <div className="space-y-3">
                    {/* Header Row: Category Badge & XP Reward */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                        <IconComp className="h-3 w-3" />
                        {ch.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                        🏆 +{ch.xp_reward} XP
                      </span>
                    </div>

                    {/* Challenge Title & Description */}
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-snug">{ch.title}</h3>
                      <p className="text-xs text-foreground/60 font-medium mt-1 leading-relaxed line-clamp-2">{ch.description}</p>
                    </div>
                  </div>

                  {/* Metadata Row: Difficulty, Duration, Participants */}
                  <div className="space-y-3 pt-3 border-t border-foreground/5">
                    <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold text-foreground/60">
                      <div><span className="block text-foreground">{ch.difficulty}</span>Difficulty</div>
                      <div><span className="block text-foreground">{ch.duration_days} Days</span>Duration</div>
                      <div><span className="block text-foreground">{ch.participants_count || 120}+</span>Joined</div>
                    </div>

                    {/* Action Button */}
                    {joined ? (
                      <Button variant="secondary" className="w-full text-xs font-bold py-2.5 opacity-70 cursor-not-allowed bg-emerald-600/10 text-emerald-600 border border-emerald-600/20">
                        <CheckCircle className="h-3.5 w-3.5 mr-1 inline" /> Joined & Active
                      </Button>
                    ) : (
                      <Button onClick={() => handleJoinChallenge(ch)} variant="primary" className="w-full text-xs font-bold py-2.5 bg-primary text-white">
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
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
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
              <h3 className="text-lg font-bold text-foreground">{selectedChallengeModal.title}</h3>
              <p className="text-xs text-foreground/60 font-semibold mt-1">{selectedChallengeModal.description}</p>
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
