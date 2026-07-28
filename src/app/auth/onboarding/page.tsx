"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, Heart, Target, Utensils, Stethoscope, Compass, Flame, Droplet, Footprints, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import confetti from "canvas-confetti";

export default function OnboardingPage() {
  const { profile, updateProfile } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // STEP 1: Personal Information
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [age, setAge] = useState<number | "">(profile?.age || 25);
  const [gender, setGender] = useState(profile?.gender || "male");

  // STEP 2: Body Information
  const [height, setHeight] = useState<number | "">(profile?.height_cm || 170);
  const [weight, setWeight] = useState<number | "">(profile?.weight_kg || 68);

  // Auto calculated BMI
  const heightM = height ? Number(height) / 100 : 0;
  const bmi = heightM > 0 && weight ? Math.round((Number(weight) / (heightM * heightM)) * 10) / 10 : 0;
  
  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: "Underweight", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
    if (val < 25) return { label: "Normal Weight", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
    if (val < 30) return { label: "Overweight", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    return { label: "Obese", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
  };

  // STEP 3: Health Goals (Multi-Select)
  const [goals, setGoals] = useState<string[]>(["Healthy Lifestyle", "Better Nutrition"]);
  const availableGoals = [
    "Weight Loss",
    "Weight Gain",
    "Muscle Gain",
    "Strength Building",
    "Healthy Lifestyle",
    "Improve Sleep",
    "Better Nutrition",
    "Stay Active"
  ];

  const toggleGoal = (g: string) => {
    setGoals(prev => prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g]);
  };

  // STEP 4: Food Preference
  const [foodPreference, setFoodPreference] = useState("Non-Vegetarian");
  const foodOptions = ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian", "No Preference"];

  // STEP 5: Medical Information (Optional)
  const [medicalConditions, setMedicalConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");

  // STEP 6: Lifestyle
  const [activityLevel, setActivityLevel] = useState("Moderately Active");
  const [sleepDuration, setSleepDuration] = useState<number | "">(7.5);

  const activityOptions = [
    { label: "Sedentary", desc: "Little or no exercise, desk job" },
    { label: "Lightly Active", desc: "Light exercise / sports 1-3 days/week" },
    { label: "Moderately Active", desc: "Moderate exercise / sports 3-5 days/week" },
    { label: "Very Active", desc: "Hard exercise / physical job 6-7 days/week" }
  ];

  // STEP 7: Daily Targets (Auto-Calculated & Editable)
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [proteinGoal, setProteinGoal] = useState<number>(110);
  const [waterGoal, setWaterGoal] = useState<number>(2500);
  const [stepGoal, setStepGoal] = useState<number>(10000);

  // Auto-calculate suggested daily targets when transitioning to Step 7
  useEffect(() => {
    if (step === 7) {
      const w = Number(weight) || 68;
      const h = Number(height) || 170;
      const a = Number(age) || 25;

      // BMR (Mifflin-St Jeor)
      let bmr = (10 * w) + (6.25 * h) - (5 * a);
      bmr += (gender === "female" ? -161 : 5);

      // Activity Multiplier
      let mult = 1.375;
      if (activityLevel === "Sedentary") mult = 1.2;
      if (activityLevel === "Lightly Active") mult = 1.375;
      if (activityLevel === "Moderately Active") mult = 1.55;
      if (activityLevel === "Very Active") mult = 1.725;

      let calculatedCalories = Math.round(bmr * mult);

      // Goal adjustments
      if (goals.includes("Weight Loss")) calculatedCalories -= 400;
      else if (goals.includes("Weight Gain") || goals.includes("Muscle Gain")) calculatedCalories += 300;

      calculatedCalories = Math.max(1200, calculatedCalories);

      // Protein calculation (1.2g - 1.8g per kg)
      let proteinFactor = 1.2;
      if (goals.includes("Muscle Gain") || goals.includes("Strength Building") || goals.includes("Weight Loss")) {
        proteinFactor = 1.8;
      }
      const calculatedProtein = Math.round(w * proteinFactor);

      // Water Goal (35ml per kg)
      const calculatedWater = Math.round((w * 35) / 250) * 250;

      // Step Goal
      let calculatedSteps = 8000;
      if (activityLevel === "Sedentary") calculatedSteps = 6000;
      if (activityLevel === "Moderately Active") calculatedSteps = 10000;
      if (activityLevel === "Very Active") calculatedSteps = 12000;
      if (goals.includes("Weight Loss") || goals.includes("Stay Active")) calculatedSteps += 2000;

      setCalorieGoal(calculatedCalories);
      setProteinGoal(calculatedProtein);
      setWaterGoal(calculatedWater);
      setStepGoal(calculatedSteps);
    }
  }, [step]);

  const handleNext = () => {
    setStep(prev => Math.min(7, prev + 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const updates = {
        full_name: fullName.trim() || profile?.full_name || "Wellness Explorer",
        age: Number(age) || 25,
        gender: gender,
        weight_kg: Number(weight) || 68,
        height_cm: Number(height) || 170,
        bmi: bmi,
        fitness_goal: goals.length > 0 ? goals.join(", ") : "Healthy Lifestyle",
        food_preference: foodPreference,
        dietary_preferences: foodPreference,
        medical_conditions: medicalConditions.trim() || "None",
        medications: medications.trim() || "None",
        allergies: allergies.trim() || "None",
        activity_level: activityLevel,
        sleep_goal: Number(sleepDuration) || 8.0,
        calorie_goal: Number(calorieGoal) || 2000,
        protein_goal: Number(proteinGoal) || 110,
        water_goal: Number(waterGoal) || 2500,
        step_goal: Number(stepGoal) || 10000,
        onboarding_completed: true
      };

      await updateProfile(updates);

      confetti({
        particleCount: 140,
        spread: 90,
        colors: ["#10b981", "#8b5cf6", "#3b82f6"]
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding completion error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_60%)]" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Welcome to VitaCore AI</h1>
          <p className="text-xs text-[var(--muted)] font-semibold tracking-wide flex items-center gap-1 justify-center">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Step {step} of 7 — Customizing Your Health Profile
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-foreground/10 h-2 rounded-full overflow-hidden mt-3 max-w-md mx-auto">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        <GlassCard glowColor="emerald" className="rounded-3xl p-6 border border-foreground/10">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Personal Information */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  Step 1: Personal Information
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Age</label>
                    <input
                      type="number"
                      value={age === 0 ? "" : age}
                      onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 25"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-emerald-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Body Information */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Heart className="h-4 w-4" />
                  Step 2: Body Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Height (cm)</label>
                    <input
                      type="number"
                      value={height === 0 ? "" : height}
                      onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 170"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight === 0 ? "" : weight}
                      onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 68"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Automatically Calculated BMI Preview */}
                {bmi > 0 && (
                  <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                      ⚡ Auto-Calculated Body Mass Index (BMI)
                    </span>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-foreground">{bmi}</span>
                        <span className="text-xs text-[var(--muted)] font-semibold block">kg/m²</span>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getBmiCategory(bmi).color}`}>
                        {getBmiCategory(bmi).label}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Health Goals */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Target className="h-4 w-4" />
                  Step 3: What are your primary health goals?
                </h3>
                <p className="text-xs text-[var(--muted)] font-medium">Select one or more goals to align your targets.</p>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {availableGoals.map(g => {
                    const isSelected = goals.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGoal(g)}
                        className={`p-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm"
                            : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10"
                        }`}
                      >
                        <span>{g}</span>
                        {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Food Preference */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Utensils className="h-4 w-4" />
                  Step 4: Dietary / Food Preference
                </h3>

                <div className="space-y-2 pt-1">
                  {foodOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFoodPreference(opt)}
                      className={`w-full p-3.5 rounded-2xl text-xs font-bold transition-all border text-left flex items-center justify-between ${
                        foodPreference === opt
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm"
                          : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10"
                      }`}
                    >
                      <span>{opt}</span>
                      {foodPreference === opt && <Check className="h-4 w-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: Medical Information */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Stethoscope className="h-4 w-4" />
                  Step 5: Medical Information (Optional)
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Existing Medical Conditions</label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="e.g. Hypertension, Asthma, Type 2 Diabetes, or None"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Current Medications</label>
                  <input
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="e.g. Vitamin D3, Metformin, or None"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Allergies / Sensitivities</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Peanuts, Lactose, Gluten, or None"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 6: Lifestyle */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Compass className="h-4 w-4" />
                  Step 6: Lifestyle & Daily Routine
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Activity Level</label>
                  <div className="space-y-2">
                    {activityOptions.map(act => (
                      <button
                        key={act.label}
                        type="button"
                        onClick={() => setActivityLevel(act.label)}
                        className={`w-full p-3 rounded-xl text-left border transition-all ${
                          activityLevel === act.label
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                            : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10"
                        }`}
                      >
                        <div className="text-xs font-bold">{act.label}</div>
                        <div className="text-[11px] opacity-70 font-medium">{act.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-foreground">Typical Sleep Duration (Hours / Night)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepDuration === 0 ? "" : sleepDuration}
                    onChange={(e) => setSleepDuration(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 7.5"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 7: Daily Targets */}
            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Flame className="h-4 w-4" />
                  Step 7: Personal Daily Targets
                </h3>
                <p className="text-xs text-[var(--muted)] font-medium">
                  We've calculated personalized baseline targets for you. Feel free to tweak them before saving!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Calorie Goal */}
                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1 uppercase">
                      <Flame className="h-3.5 w-3.5" />
                      Daily Calorie Target (kcal)
                    </label>
                    <input
                      type="number"
                      value={calorieGoal}
                      onChange={(e) => setCalorieGoal(Number(e.target.value))}
                      className="w-full text-sm font-bold px-3 py-1.5 rounded-lg border border-foreground/10 bg-background text-foreground focus:outline-none"
                    />
                  </div>

                  {/* Protein Goal */}
                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1.5">
                    <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 uppercase">
                      <Utensils className="h-3.5 w-3.5" />
                      Daily Protein Target (grams)
                    </label>
                    <input
                      type="number"
                      value={proteinGoal}
                      onChange={(e) => setProteinGoal(Number(e.target.value))}
                      className="w-full text-sm font-bold px-3 py-1.5 rounded-lg border border-foreground/10 bg-background text-foreground focus:outline-none"
                    />
                  </div>

                  {/* Water Goal */}
                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1.5">
                    <label className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 uppercase">
                      <Droplet className="h-3.5 w-3.5" />
                      Daily Water Target (ml)
                    </label>
                    <input
                      type="number"
                      step="250"
                      value={waterGoal}
                      onChange={(e) => setWaterGoal(Number(e.target.value))}
                      className="w-full text-sm font-bold px-3 py-1.5 rounded-lg border border-foreground/10 bg-background text-foreground focus:outline-none"
                    />
                  </div>

                  {/* Step Goal */}
                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1.5">
                    <label className="text-[11px] font-bold text-violet-400 flex items-center gap-1 uppercase">
                      <Footprints className="h-3.5 w-3.5" />
                      Daily Step Target (steps)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={stepGoal}
                      onChange={(e) => setStepGoal(Number(e.target.value))}
                      className="w-full text-sm font-bold px-3 py-1.5 rounded-lg border border-foreground/10 bg-background text-foreground focus:outline-none"
                    />
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

            {step < 7 ? (
              <Button variant="primary" onClick={handleNext} className="flex items-center gap-1.5 ml-auto">
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleCompleteOnboarding} 
                isLoading={loading} 
                className="flex items-center gap-1.5 ml-auto shadow-lg shadow-emerald-500/20"
              >
                <span>Save Profile & Get Started ✨</span>
                <ShieldCheck className="h-4 w-4" />
              </Button>
            )}
          </div>

        </GlassCard>

      </div>
    </div>
  );
}
