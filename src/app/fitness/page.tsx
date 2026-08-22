"use client";

import React, { useState, useEffect } from "react";
import { 
  Dumbbell, Play, Pause, RotateCcw, Check, Sparkles, ShieldAlert, 
  Award, Clock, Flame, Droplet, Calendar, TrendingUp, Compass, 
  Heart, CheckSquare, Plus, Save, BookOpen, AlertTriangle, ArrowRight, ArrowLeft,
  ChevronRight, RefreshCw, Layers, Activity
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useHealthData } from "@/hooks/useHealthData";
import { supabase } from "@/utils/supabase";
import confetti from "canvas-confetti";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { EXERCISE_LIBRARY, ExerciseDetail, generatePersonalizedWorkoutPlan } from "@/utils/exerciseLibrary";
import { fetchExercisesForPlan } from "@/services/exerciseDatabase";
import { getLocalDateString } from "@/utils/dateUtils";

const EXERCISE_DATABASE = EXERCISE_LIBRARY;

export default function FitnessPage() {
  const { profile } = useAuth();
  const { activeMode } = useTheme();
  
  const { metrics, loading, refetch } = useHealthData();
  const [activeTab, setActiveTab] = useState<"coach" | "history">("coach");
  const [coachState, setCoachState] = useState<"form" | "generating" | "preview" | "active" | "summary">("form");

  // Onboarding questionnaire steps (1 to 6)
  const [questionStep, setQuestionStep] = useState(1);

  // Questionnaire form states
  const [feeling, setFeeling] = useState("normal");
  const [location, setLocation] = useState("home");
  const [focus, setFocus] = useState("full_body");
  const [duration, setDuration] = useState(30);
  const [equipment, setEquipment] = useState("none");
  const [intensity, setIntensity] = useState("moderate");

  // Loading screen ticks state
  const [loadingTick, setLoadingTick] = useState(0);

  // Generated workout session states
  const [generatedWorkout, setGeneratedWorkout] = useState<ExerciseDetail[]>([]);
  const [recoveryWarning, setRecoveryWarning] = useState("");
  const [activeWorkoutName, setActiveWorkoutName] = useState("Custom Adaptive Workout");

  // Readiness / Fatigue Score
  const [readinessScore, setReadinessScore] = useState(85);

  // Live Timer states
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isResting, setIsResting] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<boolean[]>([]);

  // Post workout stats
  const [workoutDurationSpent, setWorkoutDurationSpent] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [postWorkoutFeedback, setPostWorkoutFeedback] = useState("");

  // History states
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);

  // Saved routines states
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);

  // Dynamic AI coaching cue generator based on active exercise and timer
  const getCoachingCue = (exerciseName: string, timeRemaining: number, isRest: boolean) => {
    if (isRest) {
      return "🧘 Rest interval: Take deep box breaths into your diaphragm to lower cardiac load.";
    }
    const name = exerciseName.toLowerCase();
    if (name.includes("squat")) {
      if (timeRemaining > 30) return "💡 Keep your chest tall and drive your hips back smoothly.";
      if (timeRemaining > 15) return "💡 Push firmly through your heels and engage glutes at the top.";
      return "💡 Final reps! Keep your knees tracking over your mid-foot.";
    }
    if (name.includes("plank") || name.includes("core") || name.includes("crunch")) {
      if (timeRemaining > 30) return "💡 Draw your navel gently inward and brace your core.";
      if (timeRemaining > 15) return "💡 Keep a neutral neck and spine. Don't let your lower back sag.";
      return "💡 Hold strong! Breathe steadily through the final seconds.";
    }
    if (name.includes("push") || name.includes("press") || name.includes("chest")) {
      if (timeRemaining > 30) return "💡 Keep elbows at a 45-degree angle to protect rotator cuffs.";
      if (timeRemaining > 15) return "💡 Control the descent and press back up with power.";
      return "💡 Finish strong with strict shoulder and core alignment!";
    }
    if (name.includes("pull") || name.includes("row") || name.includes("lat")) {
      if (timeRemaining > 30) return "💡 Initiate each rep by squeezing your shoulder blades together.";
      if (timeRemaining > 15) return "💡 Avoid shrugging your shoulders toward your ears.";
      return "💡 Squeeze and hold for a split-second at peak contraction!";
    }
    if (name.includes("lunge") || name.includes("leg")) {
      if (timeRemaining > 30) return "💡 Keep your front knee stacked over your ankle.";
      if (timeRemaining > 15) return "💡 Lower your back knee toward the floor under control.";
      return "💡 Maintain upright posture and balanced foot pressure.";
    }
    if (name.includes("stretch") || name.includes("mobility") || name.includes("yoga")) {
      return "💡 Breathe deeply and relax into the stretch. Never force past mild tension.";
    }
    if (timeRemaining > 30) return "💡 Establish a controlled tempo and steady breathing rhythm.";
    if (timeRemaining > 15) return "💡 Maintain strict form and focus on the working muscles.";
    return "💡 Final stretch! Keep smooth control all the way through.";
  };


  // Fetch Supabase workouts if possible
  useEffect(() => {
    async function fetchDBWorkouts() {
      if (supabase && profile?.id) {
        try {
          const { data, error } = await supabase
            .from("workouts")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false });
          if (data && !error) {
            const wHistory = data.filter((w: any) => w.type !== "POSTURE" && w.type !== "steps").map((w: any) => ({
              date: new Date(w.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              focus: w.type,
              duration: w.duration_minutes,
              calories: w.calories_burned,
              completed: w.completed,
              rating: w.intensity
            }));
            setWorkoutHistory(wHistory);
          }
        } catch (e) {
          console.warn("Error fetching workouts from Supabase.");
        }
      }
    }
    fetchDBWorkouts();
  }, [profile?.id]);

  // Timer intervals & localStorage sync
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      setTimerRunning(false);
      handleTimeExpired();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Save active timer state to localStorage (user-scoped)
  useEffect(() => {
    if (typeof window === "undefined" || !profile?.id) return;
    const key = `vitalcore_workout_${profile.id}`;
    if (timerRunning) {
      localStorage.setItem(key, JSON.stringify({
        currentExerciseIdx,
        timeLeft,
        isResting,
        timerRunning: true,
        lastUpdated: Date.now()
      }));
    } else if (coachState !== "active") {
      localStorage.removeItem(key);
    }
  }, [timerRunning, currentExerciseIdx, timeLeft, isResting, coachState, profile?.id]);

  // Restore workout session on page load
  useEffect(() => {
    if (typeof window === "undefined" || !profile?.id) return;
    const key = `vitalcore_workout_${profile.id}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const elapsed = Math.floor((Date.now() - (parsed.lastUpdated || Date.now())) / 1000);
        const remaining = Math.max(0, (parsed.timeLeft || 45) - elapsed);
        if (remaining > 0) {
          setCurrentExerciseIdx(parsed.currentExerciseIdx || 0);
          setTimeLeft(remaining);
          setIsResting(Boolean(parsed.isResting));
          setTimerRunning(Boolean(parsed.timerRunning));
          setCoachState("active");
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error("Error restoring workout session:", e);
    }
  }, [profile?.id]);

  // Loading Screen ticks animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (coachState === "generating") {
      interval = setInterval(() => {
        setLoadingTick(prev => {
          if (prev >= 3) {
            clearInterval(interval);
            setTimeout(() => {
              setCoachState("preview");
            }, 600);
            return 3;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [coachState]);

  const handleTimeExpired = () => {
    if (isResting) {
      setIsResting(false);
      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setCurrentExerciseIdx(nextIdx);
        setTimeLeft(generatedWorkout[nextIdx].durationSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    } else {
      const updated = [...completedExercises];
      updated[currentExerciseIdx] = true;
      setCompletedExercises(updated);

      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setIsResting(true);
        setTimeLeft(generatedWorkout[currentExerciseIdx].restSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    }
  };

  // Compile final adaptive workout
  const compileWorkout = async () => {
    setRecoveryWarning("");
    setLoadingTick(0);
    setCoachState("generating");

    try {
      // 1. Personalized recommendation engine calculation
      const recResult = generatePersonalizedWorkoutPlan({
        profile,
        metrics,
        focus,
        duration,
        equipment,
        location,
        intensity,
        feeling,
      });

      // 2. Fetch exercises: Supabase exercise_database -> ExerciseDB API -> local dataset fallback
      const liveExercises = await fetchExercisesForPlan({
        category: focus,
        equipment: equipment,
        location: location === "home" ? "Home" : location === "gym" ? "Gym" : "Both",
        limit: recResult.exercises.length || 4,
      });

      const finalExercises = (liveExercises && liveExercises.length >= 3)
        ? liveExercises
        : recResult.exercises;

      setReadinessScore(recResult.readinessScore);
      if (recResult.recommendationReason) {
        setRecoveryWarning(recResult.recommendationReason);
      }

      const titleFocus = focus.replace("_", " ").toUpperCase();
      setActiveWorkoutName(`AI ${intensity.toUpperCase()} ${titleFocus} ROUTINE`);
      setGeneratedWorkout(finalExercises);
      setCompletedExercises(new Array(finalExercises.length).fill(false));
      setCurrentExerciseIdx(0);
      setTimeLeft(finalExercises[0]?.durationSeconds || 45);
      setIsResting(false);
      setTimerRunning(false);
    } catch (e) {
      console.warn("ExerciseDB/Supabase fetch error, using local recommendation engine:", e);
      const recResult = generatePersonalizedWorkoutPlan({
        profile,
        metrics,
        focus,
        duration,
        equipment,
        location,
        intensity,
        feeling,
      });
      setReadinessScore(recResult.readinessScore);
      if (recResult.recommendationReason) {
        setRecoveryWarning(recResult.recommendationReason);
      }
      setActiveWorkoutName(`AI ${intensity.toUpperCase()} ${focus.replace("_", " ").toUpperCase()} ROUTINE`);
      setGeneratedWorkout(recResult.exercises);
      setCompletedExercises(new Array(recResult.exercises.length).fill(false));
      setCurrentExerciseIdx(0);
      setTimeLeft(recResult.exercises[0]?.durationSeconds || 45);
      setIsResting(false);
      setTimerRunning(false);
    }
  };

  const handleMarkComplete = () => {
    if (isResting) {
      setIsResting(false);
      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setCurrentExerciseIdx(nextIdx);
        setTimeLeft(generatedWorkout[nextIdx].durationSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    } else {
      const updated = [...completedExercises];
      updated[currentExerciseIdx] = true;
      setCompletedExercises(updated);

      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setIsResting(true);
        setTimeLeft(generatedWorkout[currentExerciseIdx].restSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    }
  };

  const handleSkipExercise = () => {
    const nextIdx = currentExerciseIdx + 1;
    if (nextIdx < generatedWorkout.length) {
      setCurrentExerciseIdx(nextIdx);
      setTimeLeft(generatedWorkout[nextIdx].durationSeconds);
      setIsResting(false);
      setTimerRunning(false);
    } else {
      finishWorkoutSession();
    }
  };

  const finishWorkoutSession = async () => {
    setTimerRunning(false);
    confetti({
      particleCount: 150,
      spread: 80,
      colors: ["#8b5cf6", "#10b981", "#ec4899"]
    });

    const mins = duration;
    setWorkoutDurationSpent(mins);
    
    const calorieBurn = Math.round(mins * (intensity === "intense" ? 10 : intensity === "moderate" ? 7 : 4));
    setCaloriesBurned(calorieBurn);

    let feedback = "";
    if (feeling === "tired" || feeling === "stressed") {
      feedback = "🧘 Excellent! Your active mobility and gentle intensity choice today kept cardiac strain low. Remember to hydrate with 600ml of mineralized water within 30 minutes to reduce muscle tension.";
    } else {
      feedback = "⚡ Outstanding! High coordination capacity detected. Your active training today has optimized your muscle glycogen pathways and increased metabolic burn indexes. Great work!";
    }
    setPostWorkoutFeedback(feedback);

    const newLog = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      focus: focus.replace("_", " ").toUpperCase(),
      duration: mins,
      calories: calorieBurn,
      completed: true,
      rating: intensity.toUpperCase()
    };

    setWorkoutHistory(prev => [newLog, ...prev]);
    if (supabase && profile?.id) {
      try {
        await supabase.from("workouts").insert({
          user_id: profile.id,
          date: getLocalDateString(undefined, profile?.timezone),
          name: activeWorkoutName,
          type: focus.replace("_", " ").toUpperCase(),
          duration_minutes: mins,
          intensity: intensity.toLowerCase() as any,
          calories_burned: calorieBurn,
          completed: true,
          adaptive_adapted: recoveryWarning !== "",
          notes: feedback
        });
        window.dispatchEvent(new Event("vitalcore-data-updated"));
      } catch (err) {
        console.error("Database save failed.");
      }
    }

    setCoachState("summary");
  };

  const handleSaveRoutine = () => {
    const newRoutine = {
      id: `r-${Date.now()}`,
      name: activeWorkoutName,
      focus: focus,
      duration: duration,
      exercisesCount: generatedWorkout.length
    };
    setSavedRoutines(prev => [newRoutine, ...prev]);
    alert("Routine successfully added to your Saved Routines library!");
  };

  // Advance step in form and automatically submit if final step
  const handleSelectOption = (key: string, val: any) => {
    if (key === "feeling") setFeeling(val);
    if (key === "location") setLocation(val);
    if (key === "focus") setFocus(val);
    if (key === "duration") setDuration(Number(val));
    if (key === "equipment") setEquipment(val);
    if (key === "intensity") {
      setIntensity(val);
      // Last step answered, compile immediately
      setTimeout(() => {
        compileWorkout();
      }, 200);
      return;
    }
    
    // Smooth transition to next step
    setTimeout(() => {
      setQuestionStep(prev => Math.min(6, prev + 1));
    }, 200);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-foreground/5 bg-gradient-to-r from-primary/10 via-background to-secondary/5 p-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary animate-pulse" />
              My Workout Companion
            </h1>
            <p className="text-xs text-foreground/70 font-semibold">
              Your guided workout sessions and companion tools designed for your daily rhythm.
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="grid grid-cols-2 gap-2 border-b border-foreground/5 pb-1">
          {[
            { id: "coach", label: "Guided Workouts", icon: Dumbbell },
            { id: "history", label: "My History", icon: Calendar }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "coach") {
                    setCoachState("form");
                    setQuestionStep(1);
                  }
                }}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/15"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="space-y-6">
          
          {/* TAB 1: COACH TAB */}
          {activeTab === "coach" && (
            <>
              {/* STATE A: MULTI-STEP CONVERSATIONAL QUESTIONNAIRE */}
              {coachState === "form" && (
                <div className="max-w-[500px] mx-auto py-10">
                  <GlassCard glowColor="violet" className="p-6 border border-foreground/5 space-y-6">
                    
                    {/* Header Step progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-foreground/50 tracking-wider uppercase">
                        <span>Step {questionStep} of 6</span>
                        <span>{Math.round((questionStep / 6) * 100)}% Complete</span>
                      </div>
                      <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${(questionStep / 6) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Step 1: Feeling */}
                    {questionStep === 1 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          How are you feeling today?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "energetic", label: "💪 Energetic & Dynamic" },
                            { value: "normal", label: "😌 Good & Normal" },
                            { value: "tired", label: "😴 Tired & Low Energy" },
                            { value: "stressed", label: "🧠 Stressed & Burnt-out" },
                            { value: "sore", label: "🩹 Sore Muscles" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("feeling", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                feeling === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Location */}
                    {questionStep === 2 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          Where are you working out today?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "home", label: "🏡 Home Living Space" },
                            { value: "gym", label: "🏋️ Commercial Gym" },
                            { value: "outdoors", label: "🌳 Outdoors & Park" },
                            { value: "office", label: "🏢 Office Desk Area" },
                            { value: "traveling", label: "✈️ Hotel / Traveling" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("location", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                location === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Focus */}
                    {questionStep === 3 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          What is your target focus today?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "full_body", label: "🌀 Full Body Integration" },
                            { value: "chest", label: "🏋️ Chest Press & Push" },
                            { value: "back", label: "👐 Back Pulls & Lats" },
                            { value: "legs", label: "🦿 Leg strength & Squat" },
                            { value: "core", label: "🪵 Core Stability & Abs" },
                            { value: "shoulders", label: "🛡️ Shoulders & Upper Posture" },
                            { value: "mobility", label: "🧘 Restorative Mobility Flow" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("focus", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                focus === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Duration */}
                    {questionStep === 4 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          How much time do you have today?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "15", label: "⏱️ 15 Mins (Express Routine)" },
                            { value: "30", label: "⏱️ 30 Mins (Standard Balance)" },
                            { value: "45", label: "⏱️ 45 Mins (Optimized Power)" },
                            { value: "60", label: "⏱️ 60+ Mins (Peak Performance)" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("duration", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                duration.toString() === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 5: Equipment */}
                    {questionStep === 5 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          What equipment is available?
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: "bodyweight", label: "🤸 Bodyweight Only", desc: "No weights or machines" },
                            { value: "dumbbells", label: "🏋️ Dumbbells Only", desc: "Dumbbells or kettlebells" },
                            { value: "bands", label: "🧬 Resistance Bands", desc: "Elastic loops or tubes" },
                            { value: "home_gym", label: "🏡 Home Gym Setup", desc: "Dumbbells, bands & bench" },
                            { value: "commercial_gym", label: "🏢 Full Commercial Gym", desc: "Barbells, cables & machines" },
                            { value: "yoga_mobility", label: "🧘 Yoga & Mobility Props", desc: "Foam roller, mat, straps" },
                            { value: "outdoor", label: "🌳 Outdoor Setup", desc: "Bodyweight, stairs & tracks" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("equipment", opt.value)}
                              className={`text-left p-3.5 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 flex flex-col gap-1.5 cursor-pointer ${
                                equipment === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5 scale-[1.02]"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              <span className="text-sm font-bold block">{opt.label}</span>
                              <span className="text-[10px] text-foreground/45 block font-semibold leading-normal">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 6: Intensity */}
                    {questionStep === 6 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          How intense should today be?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "light", label: "🕊️ Light (Aerobic & Recovery)" },
                            { value: "moderate", label: "⚡ Moderate (Steady & Active)" },
                            { value: "intense", label: "🔥 Intense (High Power & Stamina)" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("intensity", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                intensity === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Nav Controls */}
                    <div className="flex justify-between items-center pt-4 border-t border-foreground/5 text-xs font-semibold">
                      {questionStep > 1 ? (
                        <button 
                          onClick={() => setQuestionStep(prev => prev - 1)} 
                          className="flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back</span>
                        </button>
                      ) : (
                        <div />
                      )}
                      
                      {questionStep < 6 && (
                        <button 
                          onClick={() => setQuestionStep(prev => prev + 1)}
                          className="flex items-center gap-1 text-primary hover:underline transition-colors"
                        >
                          <span>Skip</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                  </GlassCard>
                </div>
              )}

              {/* STATE B: NEURAL GENERATING LOADING SCREEN */}
              {coachState === "generating" && (
                <div className="max-w-[460px] mx-auto py-16 text-center">
                  <GlassCard glowColor="violet" className="p-8 space-y-6">
                    <div className="flex justify-center">
                      <RefreshCw className="h-12 w-12 text-primary animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-foreground">Preparing Your Wellness Session...</h3>
                      <p className="text-[10px] text-primary font-bold tracking-widest uppercase">
                        Calibrating active adjustments
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 text-left max-w-sm mx-auto">
                      {[
                        "Analyzing sleep and recovery patterns...",
                        "Reviewing recent physical loads...",
                        "Assessing daily fatigue markers...",
                        "Calibrating movements for today's physical capacity..."
                      ].map((stepMsg, idx) => (
                        <div key={idx} className="flex gap-2.5 items-center text-xs font-semibold">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                            loadingTick >= idx 
                              ? "bg-primary/10 text-primary font-bold" 
                              : "bg-foreground/5 text-foreground/20"
                          }`}>
                            {loadingTick >= idx ? "✓" : idx + 1}
                          </div>
                          <span className={loadingTick >= idx ? "text-foreground" : "text-foreground/30"}>
                            {stepMsg}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* STATE C: PRE-WORKOUT PREVIEW DASHBOARD */}
              {coachState === "preview" && generatedWorkout.length > 0 && (
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* Premium Illustration Header Card */}
                  <div className="rounded-[28px] overflow-hidden relative min-h-[160px] bg-[var(--muted-bg)]/45 border border-[var(--border)] flex items-center shadow-sm p-6 sm:p-8">
                    <img 
                      src="/images/workout_illustration.png" 
                      alt="Workout illustration" 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-44 sm:w-56 object-contain pointer-events-none opacity-90 hidden sm:block"
                    />
                    <div className="space-y-2 relative z-10 max-w-full sm:max-w-[65%]">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">Active Session Outline</span>
                      <h2 className="text-lg font-semibold text-[var(--foreground)] tracking-tight leading-tight capitalize">
                        {activeWorkoutName.replace("AI ", "").toLowerCase()}
                      </h2>
                      <p className="text-xs text-[var(--muted)] leading-relaxed font-normal">
                        Ready to begin? The session includes {generatedWorkout.length} tailored movements optimized for your biological recovery capacity.
                      </p>
                    </div>
                  </div>

                  {/* Integrated Readiness & Reasoning */}
                  <GlassCard glowColor="violet" className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-foreground/5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Session details</span>
                        <h3 className="text-base font-semibold text-foreground">Coach Guidance</h3>
                      </div>
                      
                      {/* Integrated Readiness Badge */}
                      <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 shrink-0">
                        <div className="text-right">
                          <span className="text-[8px] font-bold text-foreground/50 uppercase block">Energy Status</span>
                          <span className="text-xs font-semibold text-foreground">
                            {metrics?.hasEnergyTelemetry 
                              ? (readinessScore > 75 ? "Ready to Move" : "Restorative Recovery")
                              : "Not enough telemetry"}
                          </span>
                        </div>
                        <div className="h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center font-bold text-sm text-primary shadow-lg shadow-primary/10 bg-background shrink-0">
                          {metrics?.hasEnergyTelemetry ? `${readinessScore}%` : "--"}
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning Text */}
                    <div className="text-xs text-foreground/80 leading-relaxed font-semibold bg-foreground/5 p-4 rounded-xl border border-foreground/5">
                      {metrics?.hasEnergyTelemetry 
                        ? (recoveryWarning || "Your body is fully recharged! We compiled a strength and cardio session to support your metabolic wellness and cardiac health.")
                        : "Insufficient telemetry logged today. Complete your sleep log, fatigue check, or recovery score to generate accurate Energy Status guidance."}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-foreground/50 font-bold uppercase tracking-wider pt-2">
                      <span>Recent activity analyzed</span>
                      <span>Target: {duration} Mins</span>
                    </div>
                  </GlassCard>

                  {/* Exercises list preview */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest pl-1">
                      Exercise Routine Preview ({generatedWorkout.length} exercises)
                    </h3>
                    <div className="space-y-3">
                      {generatedWorkout.map((ex, idx) => (
                        <div key={idx} className="p-4 rounded-2xl glass-panel border border-foreground/5 bg-background/30 flex justify-between items-center gap-4">
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground leading-normal flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-primary bg-primary/10 h-5 w-5 rounded-lg flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              {ex.name}
                            </h4>
                            <p className="text-[11px] text-foreground/60 leading-relaxed font-semibold max-w-lg truncate">
                              {ex.description}
                            </p>
                          </div>

                          <div className="flex gap-4 text-xs font-bold shrink-0">
                            <div className="text-right">
                              <span className="text-[9px] text-foreground/45 uppercase block">Target</span>
                              <span>{ex.reps}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-secondary uppercase block">Equipment</span>
                              <span className="text-secondary">{ex.equipment}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action triggers */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <Button 
                      variant="glass" 
                      onClick={() => {
                        setCoachState("form");
                        setQuestionStep(1);
                      }} 
                      className="flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Re-compile Questionnaire</span>
                    </Button>

                    <Button 
                      variant="primary" 
                      onClick={() => setCoachState("active")} 
                      className="flex-[2] py-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/25"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      <span>Launch Guided Workout Terminal</span>
                    </Button>
                  </div>

                </div>
              )}

              {/* STATE D: ACTIVE GUIDED WORKOUT PLAYER (NO CAMERA) */}
              {coachState === "active" && generatedWorkout.length > 0 && (
                <div className="max-w-2xl mx-auto space-y-6">
                  
                  {/* Header Progress Header */}
                  <GlassCard glowColor="violet" className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {activeWorkoutName}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="flex items-center gap-4 text-xs font-bold text-foreground/70 shrink-0">
                      <span>Exercise {currentExerciseIdx + 1} of {generatedWorkout.length}</span>
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px]">
                        {Math.round(((currentExerciseIdx) / generatedWorkout.length) * 100)}% Done
                      </span>
                      <span className="text-rose-400">
                        🔥 {Math.round((currentExerciseIdx / generatedWorkout.length) * caloriesBurned || (currentExerciseIdx * 35))} kcal
                      </span>
                    </div>
                  </GlassCard>

                  {/* Main Active Exercise Terminal */}
                  <GlassCard glowColor={isResting ? "emerald" : "violet"} className="p-6 sm:p-8 space-y-6">
                    
                    {/* Header: Routine Tag & 1. Exercise Name & 2. Description */}
                    <div className="text-center space-y-2">
                      {isResting ? (
                        <>
                          <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                            🧘 Rest & Transition Interval
                          </span>
                          <h2 className="text-2xl font-black text-foreground pt-2">Catch Your Breath</h2>
                          <p className="text-xs text-foreground/60 leading-relaxed font-semibold max-w-md mx-auto">
                            Up Next: <span className="text-foreground font-bold">{generatedWorkout[Math.min(generatedWorkout.length - 1, currentExerciseIdx + 1)].name}</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-[11px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
                            Active Exercise {currentExerciseIdx + 1} / {generatedWorkout.length}
                          </span>
                          {/* 1. Exercise Name */}
                          <h2 className="text-2xl sm:text-3xl font-black text-foreground pt-2 leading-tight">
                            {generatedWorkout[currentExerciseIdx].name}
                          </h2>
                          {/* 2. Clear Description */}
                          <p className="text-xs sm:text-sm text-foreground/70 font-semibold leading-relaxed max-w-lg mx-auto">
                            {generatedWorkout[currentExerciseIdx].description}
                          </p>
                        </>
                      )}
                    </div>

                    {/* 3. Exercise Duration / Countdown Timer Display */}
                    <div className="flex flex-col items-center py-2">
                      <div className={`h-36 w-36 rounded-full border-4 flex flex-col items-center justify-center relative shadow-xl transition-colors ${
                        isResting 
                          ? "border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/10" 
                          : "border-primary/30 bg-primary/5 shadow-primary/10"
                      }`}>
                        <span className="text-4xl font-black tracking-tight text-foreground">{timeLeft}s</span>
                        <span className="text-[10px] uppercase font-bold text-foreground/50 mt-1 tracking-wider">
                          {isResting ? "rest interval" : "seconds left"}
                        </span>
                      </div>
                    </div>

                    {/* 4. Target Reps, 5. Sets, 6. Equipment */}
                    {!isResting && (
                      <div className="grid grid-cols-3 gap-3 text-center border-y border-foreground/5 py-4">
                        <div className="p-2.5 rounded-xl bg-foreground/5">
                          <span className="text-foreground/45 uppercase text-[9px] font-bold block tracking-wider">Target Reps</span>
                          <span className="text-foreground font-black text-xs sm:text-sm">{generatedWorkout[currentExerciseIdx].reps}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-foreground/5">
                          <span className="text-foreground/45 uppercase text-[9px] font-bold block tracking-wider">Sets</span>
                          <span className="text-foreground font-black text-xs sm:text-sm">{generatedWorkout[currentExerciseIdx].sets} Sets</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-foreground/5">
                          <span className="text-foreground/45 uppercase text-[9px] font-bold block tracking-wider">Equipment</span>
                          <span className="text-secondary font-black text-xs sm:text-sm truncate block">{generatedWorkout[currentExerciseIdx].equipment}</span>
                        </div>
                      </div>
                    )}

                    {/* 7. AI-generated / Dynamic Coaching Cue */}
                    <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl text-xs font-bold text-primary leading-normal text-center flex items-center justify-center">
                      <span>{getCoachingCue(generatedWorkout[currentExerciseIdx].name, timeLeft, isResting)}</span>
                    </div>

                    {/* 8. Play/Pause, 9. Skip, 10. Complete Controls */}
                    <div className="flex flex-col gap-4 pt-2">
                      <div className="flex justify-center items-center gap-6">
                        
                        {/* 9. Skip Set Button */}
                        <Button 
                          variant="glass" 
                          size="md" 
                          onClick={handleSkipExercise} 
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5"
                        >
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span>Skip Set →</span>
                        </Button>

                        {/* 8. Play/Pause Timer */}
                        <button 
                          onClick={() => setTimerRunning(!timerRunning)}
                          className={`h-16 w-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            timerRunning 
                              ? "bg-amber-500 shadow-amber-500/25 ring-4 ring-amber-500/20" 
                              : "bg-primary shadow-primary/25 ring-4 ring-primary/20"
                          }`}
                          title={timerRunning ? "Pause timer" : "Start timer"}
                        >
                          {timerRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
                        </button>

                        {/* 10. Complete Set Button */}
                        <Button 
                          variant="primary" 
                          size="md" 
                          onClick={handleMarkComplete} 
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                        >
                          <Check className="h-4 w-4" />
                          <span>Complete Set ✓</span>
                        </Button>

                      </div>

                      {/* 11. Quit Workout Option */}
                      <div className="text-center pt-2">
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to stop this workout? Your active progress will be lost.")) {
                              setCoachState("form");
                            }
                          }}
                          className="text-[11px] font-bold text-foreground/40 hover:text-red-400 transition-colors uppercase tracking-widest cursor-pointer"
                        >
                          ✕ Quit Active Session
                        </button>
                      </div>
                    </div>

                  </GlassCard>

                </div>
              )}

              {/* STATE E: SESSION SUMMARY */}
              {coachState === "summary" && (
                <div className="max-w-xl mx-auto space-y-6">
                  
                  <GlassCard glowColor="emerald" className="p-6 space-y-6 text-center">
                    
                    <div className="space-y-2">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-xl animate-bounce">
                        🎉
                      </div>
                      <h2 className="text-2xl font-bold">Session Completed!</h2>
                      <p className="text-xs text-foreground/60 leading-relaxed font-semibold">
                        Sensory tracking records successfully logged. Let's look at your dynamic session telemetry:
                      </p>
                    </div>

                    {/* Stats metrics grid */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-foreground/5">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] text-foreground/50 uppercase font-bold flex items-center gap-1 justify-center">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          Duration
                        </span>
                        <div className="text-base font-extrabold">{workoutDurationSpent} mins</div>
                      </div>

                      <div className="text-center space-y-1">
                        <span className="text-[10px] text-foreground/50 uppercase font-bold flex items-center gap-1 justify-center">
                          <Flame className="h-3.5 w-3.5 text-rose-500" />
                          Burned Est
                        </span>
                        <div className="text-base font-extrabold text-rose-400">{caloriesBurned} kcal</div>
                      </div>

                      <div className="text-center space-y-1">
                        <span className="text-[10px] text-foreground/50 uppercase font-bold flex items-center gap-1 justify-center">
                          <Droplet className="h-3.5 w-3.5 text-secondary" />
                          Water Add
                        </span>
                        <div className="text-base font-extrabold text-secondary">600 ml</div>
                      </div>
                    </div>

                    {/* AI Coach Feedback */}
                    <div className="text-left space-y-2.5 bg-foreground/5 p-4 rounded-2xl border border-foreground/5">
                      <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        AI Coach Adaptive Feedback
                      </h4>
                      <p className="text-xs text-foreground/75 leading-relaxed font-semibold">
                        {postWorkoutFeedback}
                      </p>
                    </div>

                    {/* Interactive controls */}
                    <div className="flex justify-center pt-2">
                      <Button variant="primary" onClick={() => setCoachState("form")} className="w-full py-3 text-xs font-bold">
                        Finish Portal
                      </Button>
                    </div>

                  </GlassCard>

                </div>
              )}
            </>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === "history" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest pl-1">
                Your Fitness History Logs
              </h3>

              {workoutHistory.length === 0 ? (
                <GlassCard className="p-8 text-center text-xs text-foreground/50 font-bold">
                  No fitness records logged yet. Go to Guided Workouts to generate your first session!
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {workoutHistory.map((item, idx) => (
                    <GlassCard key={idx} className="p-4 flex items-center justify-between border border-foreground/5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm shrink-0">
                          💪
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground leading-normal">{item.focus} Routine</h4>
                          <span className="text-[10px] text-foreground/45 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {item.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs font-bold">
                        <div className="text-right">
                          <span className="text-[9px] text-foreground/50 uppercase block">Duration</span>
                          <span>{item.duration} mins</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-rose-400/80 uppercase block">Burned</span>
                          <span className="text-rose-400">{item.calories} kcal</span>
                        </div>
                        <span className="text-[9px] uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">
                          {item.rating || "MODERATE"}
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}
