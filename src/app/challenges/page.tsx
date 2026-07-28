"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { 
  Target, Users, CheckCircle, 
  Activity, Plus, Flame, RefreshCw, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

export default function HealthyHabitsPage() {
  const { profile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data state
  const [challenges, setChallenges] = useState<any[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  
  // Create Challenge Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Community");
  const [newDifficulty, setNewDifficulty] = useState("Medium");
  const [newDuration, setNewDuration] = useState("7");
  
  const fetchChallenges = async () => {
    if (!supabase) return;
    try {
      setLoadingChallenges(true);
      // 1. Fetch public challenges
      const { data: allC } = await supabase
        .from("challenges")
        .select("*")
        .order("id", { ascending: false });
      
      if (allC) {
        setChallenges(allC);
      } else {
        setChallenges([]);
      }

      // 2. Fetch user joined challenges
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
    } finally {
      setLoadingChallenges(false);
    }
  };

  useEffect(() => {
    fetchChallenges();

    if (!supabase) return;
    const channel = supabase
      .channel("public:challenges_realtime")
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

  const handleJoinChallenge = async (challengeId: string) => {
    const userId = profile?.id;
    if (!userId || !supabase) return;

    try {
      const { error } = await supabase
        .from("user_challenges")
        .insert({ user_id: userId, challenge_id: challengeId, progress_percentage: 10 });
      
      if (!error) {
        await fetchChallenges();
      } else {
        console.error("Failed to join challenge:", error);
      }
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
      duration_days: parseInt(newDuration) || 7
    };

    try {
      const { data, error } = await supabase.from("challenges").insert(newChallenge).select();
      if (!error && data && data.length > 0) {
        // Auto-join created challenge
        await supabase.from("user_challenges").insert({
          user_id: profile.id,
          challenge_id: data[0].id,
          progress_percentage: 10
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
    return userChallenges.some((uc: any) => uc.challenge_id === id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-background to-blue-500/5 border border-foreground/5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-7 w-7 text-emerald-500" />
              Community Challenges
            </h1>
            <p className="text-sm text-foreground/70 font-medium">
              Join challenges, build great habits, and achieve health milestones together.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} variant="primary" className="text-xs font-bold bg-primary text-white flex items-center gap-1.5 shadow-md">
            <Plus className="h-4 w-4" />
            Create Community Challenge
          </Button>
        </div>

        {/* MY ACTIVE CHALLENGES */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            My Active Challenges ({userChallenges.length})
          </h2>
          {userChallenges.length === 0 ? (
            <div className="text-sm text-foreground/50 p-6 text-center border border-dashed rounded-2xl border-foreground/10 font-semibold">
              You haven't joined any challenges yet. Pick or create one below to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userChallenges.map((uc: any, idx: number) => (
                <GlassCard key={idx} className="p-5 flex items-center justify-between gap-4 border-l-4 border-l-orange-500">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base">{uc.challenge?.title || "Community Challenge"}</h4>
                    <p className="text-xs text-foreground/60 font-semibold">{uc.challenge?.description || "Active challenge"}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-28 bg-foreground/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: `${uc.progress_percentage || 10}%` }} />
                      </div>
                      <span className="text-xs font-bold text-foreground/70">{uc.progress_percentage || 10}%</span>
                    </div>
                  </div>
                  <Button onClick={() => setSelectedChallenge(uc)} variant="glass" size="sm" className="text-xs font-bold px-4">
                    Details
                  </Button>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* COMMUNITY CHALLENGES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-500" />
              All Community Challenges
            </h2>
            <Button onClick={fetchChallenges} variant="glass" size="sm" className="text-xs font-bold flex items-center gap-1">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingChallenges ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {loadingChallenges ? (
            <div className="p-12 text-center space-y-3 rounded-3xl glass-panel border border-foreground/5">
              <RefreshCw className="h-6 w-6 text-primary animate-spin mx-auto" />
              <p className="text-xs font-semibold text-foreground/60">Loading community challenges...</p>
            </div>
          ) : challenges.length === 0 ? (
            /* EMPTY STATE */
            <div className="p-12 text-center space-y-4 rounded-3xl glass-panel border border-foreground/10 bg-background">
              <Users className="h-10 w-10 text-primary mx-auto opacity-50" />
              <div>
                <h3 className="text-base font-bold text-foreground">No community challenges available yet.</h3>
                <p className="text-xs text-foreground/60 font-semibold mt-1">Be the first to launch a community challenge!</p>
              </div>
              <Button onClick={() => setShowCreateModal(true)} variant="primary" className="text-xs font-bold bg-primary text-white px-6 py-2.5">
                Create Community Challenge
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((ch: any) => (
                <GlassCard key={ch.id} className="p-5 space-y-4 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 text-[10px] font-bold">
                        {ch.category || "Community"}
                      </span>
                      <span className="text-[11px] font-bold text-foreground/50">{ch.duration_days || 7} Days</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-snug">{ch.title}</h3>
                      <p className="text-xs text-foreground/60 font-normal mt-1 line-clamp-2">{ch.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-3 border-t border-foreground/5">
                    {hasJoined(ch.id) ? (
                      <Button variant="secondary" className="w-full text-xs font-bold py-2.5 opacity-60 cursor-not-allowed bg-emerald-600/10 text-emerald-600 border border-emerald-600/20">
                        <CheckCircle className="h-3.5 w-3.5 mr-1 inline" /> Joined & Active
                      </Button>
                    ) : (
                      <Button onClick={() => handleJoinChallenge(ch.id)} variant="primary" className="w-full text-xs font-bold py-2.5 bg-primary text-white">
                        Join Challenge
                      </Button>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* CREATE COMMUNITY CHALLENGE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-foreground/10 bg-background space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Create Community Challenge
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-foreground/50 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Challenge Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 7-Day Hydration Hero"
                  className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Drink 2.5L water daily and record progress."
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
                    <option value="Community">Community</option>
                    <option value="Hydration">Hydration</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Sleep">Sleep</option>
                    <option value="Nutrition">Nutrition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button size="sm" variant="glass" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} size="sm" variant="primary" className="bg-primary text-white font-bold">
                  {submitting ? "Creating..." : "Publish Challenge"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
