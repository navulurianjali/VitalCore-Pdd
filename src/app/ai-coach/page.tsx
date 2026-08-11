"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Brain, Send, Bot, User, Sparkles, MessageSquare, History, Calendar, X, Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useHealthData } from "@/hooks/useHealthData";
import { supabase } from "@/utils/supabase";
import { getLocalDateString, formatDisplayDate } from "@/utils/dateUtils";
import { generateLocalAICoachResponse } from "@/services/aiCoachEngine";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  conversation_date?: string;
}

interface HistoryDaySummary {
  dateStr: string;
  count: number;
  lastMessageSnippet: string;
}

const INITIAL_SUGGESTIONS = [
  "How can I improve my fitness?",
  "Why am I feeling tired?",
  "How much water should I drink?",
  "What should I eat today?",
  "How many calories do I need?",
  "How can I sleep better?",
  "What workout should I do?",
  "How can I improve my recovery?",
];

export default function AICoachPage() {
  const { profile } = useAuth();
  const { activeMode } = useTheme();
  
  const { metrics } = useHealthData();
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [currentChatDate, setCurrentChatDate] = useState<string>(
    getLocalDateString(undefined, profile?.timezone)
  );

  // Available Suggested Questions State
  const [availableSuggestions, setAvailableSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);

  // State for Chat History Modal / Past Conversations
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pastDays, setPastDays] = useState<HistoryDaySummary[]>([]);
  const [selectedPastDate, setSelectedPastDate] = useState<string | null>(null);
  const [pastDateMessages, setPastDateMessages] = useState<ChatMessage[]>([]);
  const [loadingPastChat, setLoadingPastChat] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Get current local calendar date safely
  const getTodayStr = useCallback(() => {
    return getLocalDateString(undefined, profile?.timezone);
  }, [profile?.timezone]);

  // Reset & load today's messages on profile change or logout
  useEffect(() => {
    setMessages([]);
    setHistoryLoaded(false);

    const handleLogout = () => {
      setMessages([]);
      setHistoryLoaded(false);
    };

    window.addEventListener("vitalcore-user-logout", handleLogout);
    return () => window.removeEventListener("vitalcore-user-logout", handleLogout);
  }, [profile?.id]);

  // Helper to query today's AI messages with fallback if conversation_date column is missing
  const fetchAIMessagesForDate = async (userId: string, targetDate: string) => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", userId)
        .eq("conversation_date", targetDate)
        .order("created_at", { ascending: true });

      if (!error && data) return data;

      if (error && (error.code === "PGRST204" || error.code === "42703")) {
        const dayStart = new Date(targetDate + "T00:00:00");
        const dayEnd = new Date(targetDate + "T23:59:59.999");
        const { data: fbData } = await supabase
          .from("ai_conversations")
          .select("*")
          .eq("user_id", userId)
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString())
          .order("created_at", { ascending: true });
        return fbData || [];
      }
      return [];
    } catch (err) {
      console.warn("[AI COACH] Error querying messages:", err);
      return [];
    }
  };

  // Helper to safely persist AI message
  const saveAIMessage = async (userId: string, sender: "user" | "ai", message: string, targetDate: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("ai_conversations").insert({
        user_id: userId,
        sender,
        message,
        conversation_date: targetDate
      });

      if (error && (error.code === "PGRST204" || error.code === "42703")) {
        await supabase.from("ai_conversations").insert({
          user_id: userId,
          sender,
          message
        });
      }
    } catch (err) {
      console.warn("[AI COACH] Error persisting message:", err);
    }
  };

  // Fetch TODAY'S conversation only from database
  const loadTodayHistory = useCallback(async (targetDate?: string) => {
    if (!profile?.id || !supabase) {
      setMessages([]);
      setHistoryLoaded(false);
      return;
    }

    const dateToQuery = targetDate || getTodayStr();
    setCurrentChatDate(dateToQuery);

    try {
      const data = await fetchAIMessagesForDate(profile.id, dateToQuery);

      if (data && data.length > 0) {
        setMessages(data.map((row: any) => ({
          id: row.id,
          sender: row.sender as "user" | "ai",
          text: row.message,
          timestamp: new Date(row.created_at),
          conversation_date: row.conversation_date || dateToQuery
        })));
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn("Failed to load today's chat history:", err);
      setMessages([]);
    } finally {
      setHistoryLoaded(true);
    }
  }, [profile?.id, profile?.timezone, getTodayStr]);

  useEffect(() => {
    loadTodayHistory();
  }, [loadTodayHistory]);

  // Midnight / Date boundary transition detector
  useEffect(() => {
    const checkDateTransition = () => {
      const todayStr = getTodayStr();
      if (todayStr !== currentChatDate) {
        setCurrentChatDate(todayStr);
        loadTodayHistory(todayStr);
      }
    };

    const handleFocus = () => checkDateTransition();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkDateTransition();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    const timer = setInterval(checkDateTransition, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(timer);
    };
  }, [currentChatDate, getTodayStr, loadTodayHistory]);

  // Fresh Chat Initial Welcome Message (only if today's DB messages are empty)
  useEffect(() => {
    if (messages.length === 0 && historyLoaded) {
      const isBrandNew = !metrics || !metrics.hasTelemetry || metrics.trackingDaysCount === 0;
      const initialWelcomeText = isBrandNew
        ? "Welcome! Start logging your daily health activities. I'll learn your habits over time and provide personalized recommendations once enough data is available."
        : `Hi ${profile?.full_name?.split(" ")[0] || "friend"}! Good day! I've loaded your health metrics for today. How can I help you reach your goals today?`;

      setMessages([
        {
          id: "welcome-msg",
          sender: "ai",
          text: initialWelcomeText,
          timestamp: new Date(),
          conversation_date: currentChatDate
        }
      ]);
    }
  }, [metrics, profile, historyLoaded, messages.length, currentChatDate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch past dates for Chat History Modal
  const loadPastChatDates = async () => {
    if (!profile?.id || !supabase) return;
    try {
      const todayStr = getTodayStr();
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("conversation_date, message, created_at")
        .eq("user_id", profile.id)
        .lt("conversation_date", todayStr)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const dateMap = new Map<string, { count: number; lastMsg: string }>();
        data.forEach((row: any) => {
          const dStr = row.conversation_date || row.created_at?.split("T")[0];
          if (dStr && dStr < todayStr) {
            if (!dateMap.has(dStr)) {
              dateMap.set(dStr, { count: 1, lastMsg: row.message });
            } else {
              const item = dateMap.get(dStr)!;
              item.count += 1;
            }
          }
        });

        const summaries: HistoryDaySummary[] = Array.from(dateMap.entries()).map(([dateStr, info]) => ({
          dateStr,
          count: info.count,
          lastMessageSnippet: info.lastMsg
        })).sort((a, b) => b.dateStr.localeCompare(a.dateStr));

        setPastDays(summaries);
      }
    } catch (err) {
      console.warn("Failed to load past chat dates:", err);
    }
  };

  const handleOpenHistoryModal = () => {
    setShowHistoryModal(true);
    setSelectedPastDate(null);
    setPastDateMessages([]);
    loadPastChatDates();
  };

  const handleSelectPastDate = async (dateStr: string) => {
    if (!profile?.id || !supabase) return;
    setSelectedPastDate(dateStr);
    setLoadingPastChat(true);

    try {
      const data = await fetchAIMessagesForDate(profile.id, dateStr);

      if (data && data.length > 0) {
        setPastDateMessages(data.map((row: any) => ({
          id: row.id,
          sender: row.sender as "user" | "ai",
          text: row.message,
          timestamp: new Date(row.created_at),
          conversation_date: row.conversation_date || dateStr
        })));
      } else {
        setPastDateMessages([]);
      }
    } catch (err) {
      console.warn("Failed to load past conversation:", err);
      setPastDateMessages([]);
    } finally {
      setLoadingPastChat(false);
    }
  };

  const generateHeuristicResponse = (userMsg: string): string => {
    return generateLocalAICoachResponse(userMsg, profile, metrics);
  };

  const sendUserPromptMessage = async (promptText: string) => {
    if (!promptText.trim()) return;

    const todayDate = getTodayStr();

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: promptText.trim(),
      timestamp: new Date(),
      conversation_date: todayDate
    };

    // Save user message to database with conversation_date
    if (profile?.id) {
      await saveAIMessage(profile.id, "user", promptText.trim(), todayDate);
    }

    const currentInput = promptText.trim();
    // Pass only today's messages to AI context
    const currentTodayMessages = [...messages.filter(m => m.id !== "welcome-msg"), userMsg];
    setMessages(prev => [...prev.filter(m => m.id !== "welcome-msg" || prev.length === 1), userMsg]);
    setInputVal("");

    const aiMsgId = `msg-ai-${Date.now()}`;

    // Add initial typing placeholder
    setMessages(prev => [...prev, {
      id: aiMsgId,
      sender: "ai",
      text: "...",
      timestamp: new Date(),
      conversation_date: todayDate
    }]);

    let streamedText = "";

    try {
      // Call server-side API with today's messages + live telemetry
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: currentTodayMessages,
          profile,
          metrics
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(`API returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: streamedText } : m));
      }

      if (!streamedText.trim()) {
        throw new Error("Empty response stream");
      }

      // Persist AI message to database with conversation_date
      if (profile?.id) {
        await saveAIMessage(profile.id, "ai", streamedText, todayDate);
      }
    } catch (err: any) {
      console.warn("API stream failed, activating heuristic fallback:", err);
      const fallbackText = generateHeuristicResponse(currentInput);

      // Type out fallback response smoothly
      const words = fallbackText.split(" ");
      let currentText = "";
      let wordIndex = 0;

      const timer = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: currentText } : m));
          wordIndex++;
        } else {
          clearInterval(timer);
        }
      }, 25);

      if (profile?.id) {
        await saveAIMessage(profile.id, "ai", fallbackText, todayDate);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    await sendUserPromptMessage(inputVal);
  };

  const handleSelectSuggestion = (question: string) => {
    setAvailableSuggestions(prev => prev.filter(q => q !== question));
    sendUserPromptMessage(question);
  };

  const samplePrompts = [
    "How can I improve my fitness?",
    "Why am I feeling tired?",
    "How much water should I drink?",
    "What should I eat today?"
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full flex flex-col justify-between max-h-[85vh]">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-foreground/5 bg-gradient-to-r from-primary/10 via-background to-secondary/5 shrink-0">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary animate-pulse" />
              Your Personal Wellness Coach
            </h1>
            <p className="text-xs text-foreground/70 font-semibold">
              Today's Session ({formatDisplayDate(currentChatDate, profile?.timezone)}) • Fresh daily chat
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenHistoryModal}
              className="px-3 py-1.5 rounded-xl bg-foreground/10 hover:bg-foreground/15 border border-foreground/10 text-xs font-bold text-foreground flex items-center gap-1.5 transition-all"
            >
              <History className="h-4 w-4 text-primary" />
              <span>Chat History</span>
            </button>
            <div className="text-xs font-bold text-foreground/50 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span>Wellness Profile Connected</span>
            </div>
          </div>
        </div>

        {/* Chat Console container */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Chat messages panel */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl glass-panel border-foreground/5 bg-background/40 min-h-[380px] p-4">
            
            {/* Scrollable Messages viewport */}
            <div className="flex-1 overflow-y-auto space-y-4 px-2 py-4 scrollbar-none max-h-[48vh]">
              {messages.map((msg) => {
                const isAI = msg.sender === "ai";
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isAI ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-secondary text-white shadow-md shadow-secondary/20"
                    }`}>
                      {isAI ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed font-semibold border ${
                      isAI 
                        ? "bg-foreground/5 text-foreground border-foreground/5" 
                        : "bg-primary text-white border-primary/20 shadow-md shadow-primary/10"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Horizontally Scrollable Suggested Questions Bar */}
            {availableSuggestions.length > 0 && (
              <div className="border-t border-foreground/5 py-2 shrink-0 overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x px-1">
                  {availableSuggestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleSelectSuggestion(question)}
                      className="whitespace-nowrap px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-xs font-semibold text-foreground/90 transition-all flex items-center gap-1.5 shrink-0 snap-start active:scale-95 cursor-pointer"
                    >
                      <span>{question}</span>
                      <span className="text-primary font-bold">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Input footer */}
            <form onSubmit={handleSendMessage} className="border-t border-foreground/5 pt-3 flex gap-2 shrink-0">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask your coach anything... (e.g., 'I am feeling a bit tired today...')"
                className="w-full text-xs px-4 py-3 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/45 focus:outline-none focus:border-primary/50"
              />
              <Button variant="primary" type="submit" className="p-3.5 rounded-xl shrink-0">
                <Send className="h-4.5 w-4.5" />
              </Button>
            </form>

          </div>

          {/* Right side helper Panel: memory parameters & prompts */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Sample Prompts */}
            <GlassCard glowColor="violet" className="space-y-4 p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Suggested Topics
                </h3>
                <p className="text-xs text-foreground/60 leading-normal font-semibold">
                  Pick a topic below to start chatting with your coach:
                </p>
              </div>

              <div className="space-y-2.5 pt-2 flex-1">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(prompt)}
                    className="w-full text-left p-3 rounded-xl bg-foreground/5 border border-foreground/5 text-xs font-semibold text-foreground/80 hover:bg-foreground/10 hover:border-primary/20 transition-all leading-normal cursor-pointer active:scale-98"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* AI Companion Memory specs */}
            <GlassCard glowColor="amber" className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-foreground">Wellness Coach Observations</h3>
              <ul className="space-y-2 text-xs text-foreground/75 font-semibold leading-normal">
                <li className="flex gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Activity patterns</strong>: You tend to skip your evening walks when you're caught up in late-night work projects.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Eating patterns</strong>: We noticed you crave sweet snacks a bit more on high-stress days.</span>
                </li>
              </ul>
            </GlassCard>

          </div>

        </div>

      </div>

      {/* Chat History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-background border border-foreground/10 rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">AI Chat History</h2>
                  <p className="text-xs text-foreground/60 font-semibold">
                    {selectedPastDate ? formatDisplayDate(selectedPastDate, profile?.timezone) : "Select a past day to view conversation"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {!selectedPastDate ? (
                /* List of Past Days */
                pastDays.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Clock className="h-10 w-10 text-foreground/30 mx-auto" />
                    <p className="text-xs font-semibold text-foreground/60">No previous conversations recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pastDays.map((pd) => (
                      <button
                        key={pd.dateStr}
                        onClick={() => handleSelectPastDate(pd.dateStr)}
                        className="w-full text-left p-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/5 transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-bold text-foreground">
                              {formatDisplayDate(pd.dateStr, profile?.timezone)}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                              {pd.count} messages
                            </span>
                          </div>
                          <p className="text-xs text-foreground/60 line-clamp-1 italic font-semibold">
                            "{pd.lastMessageSnippet}"
                          </p>
                        </div>
                        <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          View →
                        </span>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                /* View Past Day Chat */
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedPastDate(null)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mb-2"
                  >
                    ← Back to all dates
                  </button>

                  {loadingPastChat ? (
                    <div className="text-center py-8 text-xs font-semibold text-foreground/60">
                      Loading conversation...
                    </div>
                  ) : pastDateMessages.length === 0 ? (
                    <div className="text-center py-8 text-xs font-semibold text-foreground/60">
                      No messages found for this date.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                      {pastDateMessages.map((msg) => {
                        const isAI = msg.sender === "ai";
                        return (
                          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                              isAI ? "bg-primary text-white" : "bg-secondary text-white"
                            }`}>
                              {isAI ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-semibold border ${
                              isAI 
                                ? "bg-foreground/5 text-foreground border-foreground/5" 
                                : "bg-primary text-white border-primary/20"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
