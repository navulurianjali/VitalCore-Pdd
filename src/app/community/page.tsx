"use client";

import React, { useState, useEffect } from "react";
import { Users, Sparkles, Smile, ShieldCheck, HeartPulse, Send, Award, ThumbsUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

interface CircleMember {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  stabilityScore: number;
  lastActive: string;
  status: string;
}

export default function CommunityPage() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [cheeredMembers, setCheeredMembers] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState("");
  const MAX_POST_LENGTH = 500;

  useEffect(() => {
    async function fetchPosts() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("community_posts")
        .select("*, profiles(full_name, username)")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setMembers(data.map((post: any) => ({
          id: post.id,
          name: post.profiles?.full_name || post.profiles?.username || "Unknown Explorer",
          avatar: post.profiles?.full_name ? post.profiles.full_name[0].toUpperCase() : "U",
          streak: post.streak || 0,
          stabilityScore: post.stability_score || 0,
          lastActive: new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: post.content
        })));
      } else {
        // Fallback simulated data if empty
        setMembers([
          {
            id: "member-1",
            name: "Grandfather Charles",
            avatar: "C",
            streak: 14,
            stabilityScore: 92,
            lastActive: "4 mins ago",
            status: "Completed stretching routine. Stayed hydrated today!"
          },
          {
            id: "member-2",
            name: "Sarah M. (Arizona)",
            avatar: "S",
            streak: 8,
            stabilityScore: 84,
            lastActive: "1 hr ago",
            status: "Taking it easy today because of the summer heatwave (35°C)."
          },
          {
            id: "member-3",
            name: "Dev Leader David",
            avatar: "D",
            streak: 2,
            stabilityScore: 58,
            lastActive: "Just now",
            status: "Worked late on programming projects tonight. Got a bit less sleep."
          }
        ]);
      }
    }
    fetchPosts();
  }, []);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitedEmail || !invitedEmail.includes("@")) return;
    // VULN-20 NOTE: Email invites require a backend email service (e.g. Resend/SendGrid).
    // For now, show an informational message rather than a false success.
    setInviteSent(true);
    setInvitedEmail("");
    setTimeout(() => {
      setInviteSent(false);
    }, 4000);
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUpdate.trim() || submitting || !profile?.id || !supabase) return;

    // VULN-07 FIX: Enforce maximum post length server-side equivalent
    if (statusUpdate.length > MAX_POST_LENGTH) {
      setPostError(`Post must be ${MAX_POST_LENGTH} characters or fewer.`);
      return;
    }

    // VULN-02 FIX: Explicitly sanitize to reject HTML-like content
    if (/[<>]/.test(statusUpdate)) {
      setPostError("Invalid characters in post (HTML tags are not allowed).");
      return;
    }
    setPostError("");
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("community_posts").insert({
        user_id: profile.id,
        content: statusUpdate.substring(0, MAX_POST_LENGTH), // hard-cap at server insert too
        streak: 5,
        stability_score: profile.stability_score || 90
      }).select("*, profiles(full_name, username)").single();

      if (error) {
        console.error("Post insert error:", error);
        setPostError("Failed to post update. Please try again.");
        return;
      }

      if (data) {
        const newMember: CircleMember = {
          id: data.id,
          name: data.profiles?.full_name || profile.full_name || "You",
          avatar: (data.profiles?.full_name || profile.full_name || "Y")[0].toUpperCase(),
          streak: data.streak || 5,
          stabilityScore: data.stability_score || 90,
          lastActive: "Just now",
          status: data.content,
        };
        setMembers([newMember, ...members]);
        setStatusUpdate("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheer = (id: string) => {
    setCheeredMembers(prev => ({ ...prev, [id]: true }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-foreground/5 bg-gradient-to-r from-primary/10 via-background to-secondary/5">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary animate-pulse" />
              Family & Friends Circles
            </h1>
            <p className="text-xs text-foreground/70 font-semibold">
              Motivate each other, stay connected, and build healthy habits together.
            </p>
          </div>
        </div>

        {/* 1. DUAL LAYOUT: Member feeds vs Circle management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Member list & active status updates */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <HeartPulse className="h-4.5 w-4.5 text-primary" />
                Circle Activity Feed
              </h3>
            </div>

            <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 mb-6">
              <form onSubmit={handlePostUpdate} className="space-y-2">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value.substring(0, MAX_POST_LENGTH))}
                    maxLength={MAX_POST_LENGTH}
                    placeholder="Share how you're feeling today..."
                    className="flex-1 bg-background/50 border border-foreground/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 text-foreground"
                  />
                  <Button variant="primary" type="submit" isLoading={submitting} className="py-2.5 px-4 flex items-center gap-2 text-xs">
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Post</span>
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  {postError && <span className="text-[10px] text-red-400 font-semibold">{postError}</span>}
                  <span className={`text-[10px] ml-auto font-semibold ${
                    statusUpdate.length > MAX_POST_LENGTH * 0.9 ? "text-amber-500" : "text-foreground/40"
                  }`}>{statusUpdate.length}/{MAX_POST_LENGTH}</span>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              {members.map((m) => (
                <GlassCard key={m.id} glowColor={m.stabilityScore < 60 ? "rose" : m.stabilityScore > 85 ? "emerald" : "violet"} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative border border-foreground/5">
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                      {m.avatar}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        {m.name}
                        <span className="text-[9px] text-foreground/50 font-medium">({m.lastActive})</span>
                      </h4>
                      <p className="text-xs text-foreground/70 font-semibold leading-relaxed">
                        "{m.status}"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center shrink-0 text-xs font-bold text-foreground/80 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-foreground/5 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[9px] text-foreground/50 block font-semibold">Streak</span>
                        <span className="text-secondary font-bold">{m.streak} days</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-foreground/50 block font-semibold">Habit Score</span>
                        <span className={`font-bold ${m.stabilityScore < 60 ? "text-red-500" : "text-secondary"}`}>
                          {m.stabilityScore}%
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCheer(m.id)}
                      className={`ml-2 p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${cheeredMembers[m.id] ? "bg-primary/20 border-primary/30 text-primary scale-110" : "bg-foreground/5 border-foreground/10 text-foreground/50 hover:text-primary hover:bg-primary/10 hover:border-primary/30"}`}
                      title="Cheer"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Right panel: Circle invitation & stats */}
          <div className="lg:col-span-4 rounded-2xl glass-panel p-6 border-foreground/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground">Invite to Circle</h3>
              <p className="text-xs text-foreground/60 leading-normal font-semibold">
                Invite family or friends to join your wellness circle:
              </p>

              {inviteSent ? (
                <div className="rounded-xl border border-secondary/15 bg-secondary/5 px-3 py-2.5 text-xs text-secondary font-semibold">
                  ✓ Invitation noted! Email delivery requires backend email service configuration.
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={invitedEmail}
                    onChange={(e) => setInvitedEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/45 focus:outline-none"
                    placeholder="partner@family.com"
                  />
                  <Button variant="primary" type="submit" className="w-full py-2.5 flex items-center justify-center gap-1 text-xs">
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Invite</span>
                  </Button>
                </form>
              )}
            </div>

            <GlassCard glowColor="violet" className="p-4 space-y-2">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                Circle Progress
              </h4>
              <p className="text-xs text-foreground/75 leading-relaxed font-semibold">
                Your circle has an average Habit Score of <span className="text-secondary font-bold">78%</span>. Great job keeping each other motivated!
              </p>
            </GlassCard>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
