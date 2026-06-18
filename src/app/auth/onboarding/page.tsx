"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, ArrowRight, ArrowLeft, HeartPulse, Sparkles, LayoutGrid } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import confetti from "canvas-confetti";

export default function OnboardingPage() {
  const { profile, updateProfile } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);

  // STEP 1: Basic Info
  const [age, setAge] = useState<number | "">(28);
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState<number | "">(72);
  const [height, setHeight] = useState<number | "">(178);
  const [occupation, setOccupation] = useState("Software Engineer");
  const [timezone, setTimezone] = useState("UTC+5:30");

  // STEP 2: Fitness Info
  const [fitnessLevel, setFitnessLevel] = useState("intermediate");
  const [goal, setGoal] = useState("burnout_protection");
  const [workoutDuration, setWorkoutDuration] = useState<number | "">(30);
  const [workoutTime, setWorkoutTime] = useState("morning");
  const [homeGym, setHomeGym] = useState("home");

  // STEP 3: Health Info
  const [injuries, setInjuries] = useState("none");
  const [conditions, setConditions] = useState("none");
  const [surgeries, setSurgeries] = useState("none");
  const [mobilityLimits, setMobilityLimits] = useState("none");
  const [sleepProblems, setSleepProblems] = useState(false);
  const [medications, setMedications] = useState("none");

  // STEP 4: Nutrition & Mental Wellness
  const [diet, setDiet] = useState("standard");
  const [allergies, setAllergies] = useState("none");
  const [caffeine, setCaffeine] = useState("medium");
  const [anxietyRating, setAnxietyRating] = useState(4);
  const [motivation, setMotivation] = useState(80);

  // STEP 5: Lifestyle & Smart Sync
  const [screenTime, setScreenTime] = useState<number | "">(9);
  const [sittingHours, setSittingHours] = useState<number | "">(8);
  const [wearableType, setWearableType] = useState("apple_health");
  const [loading, setLoading] = useState(false);
  const [chosenMode, setChosenMode] = useState<"wellness" | "performance" | "elderly">("wellness");

  // Math variables
  const heightM = height ? Number(height) / 100 : 0;
  const bmi = heightM > 0 && weight ? Math.round((Number(weight) / (heightM * heightM)) * 10) / 10 : 0;
  const bodyFat = heightM > 0 && weight && age ? Math.round(
    (1.20 * bmi + 0.23 * Number(age) - (gender === "male" ? 16.2 : 5.4)) * 10
  ) / 10 : 0;

  const handleNext = () => {
    // When transitioning to step 6, pre-fill the recommended mode
    if (step === 5) {
      let recommended: "wellness" | "performance" | "elderly" = "wellness";
      if (
        goal === "burnout_protection" ||
        goal === "stress_resilience" ||
        goal === "sleep_restoration" ||
        goal === "posture_mobility"
      ) {
        recommended = "wellness";
      }
      if (
        fitnessLevel === "advanced" ||
        goal === "stamina_optimization" ||
        goal === "muscle_hypertrophy" ||
        goal === "weight_management"
      ) {
        recommended = "performance";
      }
      if (age && Number(age) > 65) recommended = "elderly";
      setChosenMode(recommended);
    }
    setStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const updates = {
        weight_kg: Number(weight),
        height_cm: Number(height),
        fitness_goal: goal,
        bmi: bmi,
        body_fat_estimate: bodyFat,
        occupation: occupation,
        timezone: timezone,
        fitness_level: fitnessLevel,
        workout_duration_preference: Number(workoutDuration),
        preferred_workout_time: workoutTime,
        home_gym_preference: homeGym,
        previous_injuries: injuries,
        chronic_conditions: conditions,
        surgeries: surgeries,
        mobility_limitations: mobilityLimits,
        sleep_problems: sleepProblems,
        dietary_preferences: diet,
        allergies: allergies,
        caffeine_intake: caffeine,
        wearable_synced: wearableType !== "none", // VULN-15 FIX: Only true if user actually selected a wearable
        anxiety_rating: Number(anxietyRating),
        motivation_level: Number(motivation),
        screen_time_hours: Number(screenTime),
        sitting_hours: Number(sittingHours),
        active_mode: chosenMode,
        onboarding_completed: true
      };

      await updateProfile(updates);

      // confettis
      confetti({
        particleCount: 120,
        spread: 80,
        colors: ["#8b5cf6", "#10b981", "#ec4899"]
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_60%)]" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20">
            <Activity className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Setting up VitalCore</h2>
          <p className="text-xs text-[var(--muted)] font-semibold tracking-wide flex items-center gap-1 justify-center">
            <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
            Let's customize your experience (Step {step} of 6)
          </p>
        </div>

        <GlassCard glowColor="violet" className="rounded-3xl p-6">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Basic Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  Your basic details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Your age</label>
                    <input
                      type="number"
                      value={age === 0 ? "" : age}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAge(val === "" ? 0 : Number(val));
                      }}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight === 0 ? "" : weight}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWeight(val === "" ? 0 : Number(val));
                      }}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Height (cm)</label>
                    <input
                      type="number"
                      value={height === 0 ? "" : height}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHeight(val === "" ? 0 : Number(val));
                      }}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-foreground/5 bg-foreground/5 p-4 flex justify-between items-center text-xs font-semibold">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block uppercase tracking-wider">BMI</span>
                    <span className="text-primary font-bold text-sm">{bmi}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block uppercase tracking-wider">Estimated Body Fat</span>
                    <span className="text-secondary font-bold text-sm">{bodyFat}%</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Lifestyle stats */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Your daily routine</h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Main job / Occupation</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Screen time (hours / day)</label>
                    <input
                      type="number"
                      value={screenTime === 0 ? "" : screenTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        setScreenTime(val === "" ? 0 : Number(val));
                      }}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Sitting hours</label>
                    <input
                      type="number"
                      value={sittingHours === 0 ? "" : sittingHours}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSittingHours(val === "" ? 0 : Number(val));
                      }}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Fitness & Goals */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Your goals</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Active Focus Goal</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none"
                    >
                      <option value="burnout_protection">Avoid burnout</option>
                      <option value="stamina_optimization">Improve stamina</option>
                      <option value="longevity_maintenance">Long-term wellness</option>
                      <option value="weight_management">Healthy weight management</option>
                      <option value="muscle_hypertrophy">Strength & muscle gain</option>
                      <option value="stress_resilience">Stress resilience</option>
                      <option value="sleep_restoration">Better sleep quality</option>
                      <option value="posture_mobility">Posture & mobility stretch</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Current Level</label>
                    <select
                      value={fitnessLevel}
                      onChange={(e) => setFitnessLevel(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Preferred workout length (minutes)</label>
                  <input
                    type="number"
                    value={workoutDuration === 0 ? "" : workoutDuration}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWorkoutDuration(val === "" ? 0 : Number(val));
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 4: Injuries & medicals */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Injuries and conditions</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Previous Injuries</label>
                    <input
                      type="text"
                      value={injuries}
                      onChange={(e) => setInjuries(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Surgeries History</label>
                    <input
                      type="text"
                      value={surgeries}
                      onChange={(e) => setSurgeries(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Chronic Conditions</label>
                  <input
                    type="text"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-xl border border-foreground/5">
                  <label className="text-xs font-semibold text-foreground">Do you have sleep issues?</label>
                  <input
                    type="checkbox"
                    checked={sleepProblems}
                    onChange={(e) => setSleepProblems(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 5: Diets & Wearable integrations */}
            {step === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Dietary Preferences & Wearable Sync</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Dietary Focus</label>
                    <select
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none"
                    >
                      <option value="standard">Standard Balanced</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="keto">Keto</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Allergies / Restrictions</label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Smartwatch Connection</label>
                  <select
                    value={wearableType}
                    onChange={(e) => setWearableType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none"
                  >
                    <option value="apple_health">Connect Apple Health</option>
                    <option value="google_fit">Connect Google Fit</option>
                    <option value="fitbit">Connect Fitbit</option>
                    <option value="none">No smartwatch (Manual logs)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Active Mode Selection */}
            {step === 6 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  Choose your focus mode
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed font-normal">
                  VitalCore scales its visuals, features, and accessibility layout to align with your health focus. Choose the mode that governs your experience.
                </p>

                <div className="space-y-3 pt-1">
                  {/* Everyday Wellness Card */}
                  <div
                    onClick={() => setChosenMode("wellness")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      chosenMode === "wellness"
                        ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10 scale-[1.01]"
                        : "bg-foreground/5 border-foreground/10 hover:bg-foreground/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
                        🌿
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-foreground">Everyday Wellness</h4>
                          {chosenMode === "wellness" && (
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Active Mode
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed font-normal">
                          Calming breath exercises, easy sleep tracking, and daily recovery balance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Athletic Performance Card */}
                  <div
                    onClick={() => setChosenMode("performance")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      chosenMode === "performance"
                        ? "bg-violet-500/10 border-violet-500 shadow-md shadow-violet-500/10 scale-[1.01]"
                        : "bg-foreground/5 border-foreground/10 hover:bg-foreground/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold text-lg">
                        ⚡
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-foreground">Athletic Performance</h4>
                          {chosenMode === "performance" && (
                            <span className="text-[9px] font-bold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full">
                              Active Mode
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed font-normal">
                          Track muscle tiredness, protein targets, and metabolic strength.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Elderly Care & Longevity Card */}
                  <div
                    onClick={() => setChosenMode("elderly")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      chosenMode === "elderly"
                        ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 scale-[1.01]"
                        : "bg-foreground/5 border-foreground/10 hover:bg-foreground/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg">
                        🩺
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-foreground">Elderly Mode</h4>
                          {chosenMode === "elderly" && (
                            <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              Active Mode
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed font-normal">
                          Easy-to-read layout, helpful medication reminders, and light flexibility stretch tips.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="pt-6 mt-6 border-t border-foreground/5 flex justify-between gap-3">
            {step > 1 ? (
              <Button variant="glass" onClick={handleBack} className="flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <Button variant="primary" onClick={handleNext} className="flex items-center gap-1.5 ml-auto">
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="primary" onClick={handleCompleteOnboarding} isLoading={loading} className="flex items-center gap-1.5 ml-auto">
                <span>Finish setup</span>
                <ShieldCheck className="h-4 w-4" />
              </Button>
            )}
          </div>

        </GlassCard>

      </div>
    </div>
  );
}
