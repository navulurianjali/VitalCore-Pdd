"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, Heart, Target, Utensils, Stethoscope, Compass, Flame, Droplet, Footprints, Check, Search, Plus, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import confetti from "canvas-confetti";

export const COMMON_MEDICAL_CONDITIONS = [
  "None",
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Arthritis",
  "High Cholesterol",
  "Thyroid Disorder",
  "Obesity",
  "Osteoporosis",
  "Kidney Disease",
  "Liver Disease",
  "PCOS",
  "Depression",
  "Anxiety",
  "Sleep Apnea",
  "Back Pain",
  "Knee Pain",
  "Pregnancy",
  "Other"
];

export default function OnboardingPage() {
  const { profile, updateProfile } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // STEP 1: Personal Information
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [age, setAge] = useState<number | "">(profile?.age || "");
  const [gender, setGender] = useState(profile?.gender || "male");

  // STEP 2: Body Information
  const [height, setHeight] = useState<number | "">(profile?.height_cm || "");
  const [weight, setWeight] = useState<number | "">(profile?.weight_kg || "");

  // Auto calculated BMI
  const heightM = height && Number(height) > 0 ? Number(height) / 100 : 0;
  const bmi = heightM > 0 && weight && Number(weight) > 0 ? Math.round((Number(weight) / (heightM * heightM)) * 10) / 10 : 0;
  
  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: "Underweight", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
    if (val < 25) return { label: "Normal Weight", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
    if (val < 30) return { label: "Overweight", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    return { label: "Obese", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
  };

  // STEP 3: Health Goals (Multi-Select)
  const [goals, setGoals] = useState<string[]>([]);
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

  // STEP 5: Medical Information (Searchable Multi-Select)
  const [selectedMedicalConditions, setSelectedMedicalConditions] = useState<string[]>(["None"]);
  const [medicalSearchQuery, setMedicalSearchQuery] = useState("");
  const [customOtherCondition, setCustomOtherCondition] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");

  const filteredMedicalOptions = useMemo(() => {
    if (!medicalSearchQuery.trim()) return COMMON_MEDICAL_CONDITIONS;
    return COMMON_MEDICAL_CONDITIONS.filter(c => c.toLowerCase().includes(medicalSearchQuery.toLowerCase().trim()));
  }, [medicalSearchQuery]);

  const toggleMedicalCondition = (cond: string) => {
    if (cond === "None") {
      setSelectedMedicalConditions(["None"]);
      setCustomOtherCondition("");
      return;
    }

    setSelectedMedicalConditions(prev => {
      const withoutNone = prev.filter(c => c !== "None");
      if (withoutNone.includes(cond)) {
        const next = withoutNone.filter(c => c !== cond);
        return next.length === 0 ? ["None"] : next;
      } else {
        return [...withoutNone, cond];
      }
    });
  };

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

      let bmr = (10 * w) + (6.25 * h) - (5 * a);
      bmr += (gender === "female" ? -161 : 5);

      let mult = 1.375;
      if (activityLevel === "Sedentary") mult = 1.2;
      if (activityLevel === "Lightly Active") mult = 1.375;
      if (activityLevel === "Moderately Active") mult = 1.55;
      if (activityLevel === "Very Active") mult = 1.725;

      let calculatedCalories = Math.round(bmr * mult);

      if (goals.includes("Weight Loss")) calculatedCalories -= 400;
      else if (goals.includes("Weight Gain") || goals.includes("Muscle Gain")) calculatedCalories += 300;

      calculatedCalories = Math.max(1200, calculatedCalories);

      let proteinFactor = 1.2;
      if (goals.includes("Muscle Gain") || goals.includes("Strength Building") || goals.includes("Weight Loss")) {
        proteinFactor = 1.8;
      }
      const calculatedProtein = Math.round(w * proteinFactor);
      const calculatedWater = Math.round((w * 35) / 250) * 250;

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
      const userAge = age !== "" ? Number(age) : (profile?.age || 0);
      const isElderlyAuto = userAge >= 60;
      const assignedMode: "wellness" | "elderly" = isElderlyAuto ? "elderly" : "wellness";

      // Build Medical Conditions string
      const finalMedicalArray = selectedMedicalConditions.filter(c => c !== "Other");
      if (selectedMedicalConditions.includes("Other") && customOtherCondition.trim()) {
        finalMedicalArray.push(`Other: ${customOtherCondition.trim()}`);
      }
      const medicalConditionsString = finalMedicalArray.join(", ");

      const updates = {
        full_name: fullName.trim() || profile?.full_name || "",
        age: userAge > 0 ? userAge : null,
        gender: gender,
        weight_kg: weight !== "" ? Number(weight) : null,
        height_cm: height !== "" ? Number(height) : null,
        bmi: bmi > 0 ? bmi : null,
        fitness_goal: goals.length > 0 ? goals.join(", ") : "",
        food_preference: foodPreference,
        dietary_preferences: foodPreference,
        medical_conditions: medicalConditionsString,
        medications: medications.trim() || "",
        allergies: allergies.trim() || "",
        activity_level: activityLevel,
        sleep_goal: Number(sleepDuration) || 8.0,
        calorie_goal: Number(calorieGoal) || 2000,
        protein_goal: Number(proteinGoal) || 110,
        water_goal: Number(waterGoal) || 2500,
        step_goal: Number(stepGoal) || 10000,
        active_mode: assignedMode,
        is_auto_assigned_mode: isElderlyAuto,
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
                  <UserCheck className="h-4 w-4" /> Personal Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-foreground">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g., Jane Doe"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground">Age (Years)</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={e => setAge(e.target.value ? parseInt(e.target.value) : "")}
                        placeholder="e.g. 28"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary mt-1"
                      />
                      {age !== "" && Number(age) >= 60 && (
                        <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                          👵 Elderly Mode will be auto-assigned.
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground">Biological Gender</label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary mt-1 font-semibold"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other / Rather not say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Body Metrics & BMI */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Footprints className="h-4 w-4" /> Body Metrics & BMI Calculation
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={e => setHeight(e.target.value ? parseInt(e.target.value) : "")}
                      placeholder="e.g. 175"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={e => setWeight(e.target.value ? parseInt(e.target.value) : "")}
                      placeholder="e.g. 70"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary mt-1"
                    />
                  </div>
                </div>

                {bmi > 0 && (
                  <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Calculated BMI</span>
                      <span className="text-xl font-extrabold text-foreground tabular-nums">{bmi} kg/m²</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBmiCategory(bmi).color}`}>
                      {getBmiCategory(bmi).label}
                    </span>
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
                  <Target className="h-4 w-4" /> Select Your Primary Health Goals
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  {availableGoals.map(g => {
                    const isSelected = goals.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() => toggleGoal(g)}
                        className={`p-3 rounded-2xl text-left text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm"
                            : "bg-foreground/5 border-foreground/8 text-foreground/70 hover:bg-foreground/10"
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
                  <Utensils className="h-4 w-4" /> Dietary & Food Preference
                </h3>

                <div className="space-y-2">
                  {foodOptions.map(opt => {
                    const isSelected = foodPreference === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setFoodPreference(opt)}
                        className={`w-full p-3.5 rounded-2xl text-left text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm"
                            : "bg-foreground/5 border-foreground/8 text-foreground/70 hover:bg-foreground/10"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: Medical Information (Searchable Multi-Select) */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Stethoscope className="h-4 w-4" /> Existing Medical Conditions
                  </h3>
                  <p className="text-xs text-foreground/60">
                    Do you have any existing medical conditions? Select all that apply.
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40 pointer-events-none" />
                  <input
                    type="text"
                    value={medicalSearchQuery}
                    onChange={e => setMedicalSearchQuery(e.target.value)}
                    placeholder="Search medical conditions..."
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Condition Pills */}
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 border border-foreground/5 rounded-2xl bg-foreground/[0.02]">
                  {filteredMedicalOptions.map(cond => {
                    const isSelected = selectedMedicalConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleMedicalCondition(cond)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                            : "bg-foreground/5 border-foreground/10 text-foreground/70 hover:bg-foreground/10"
                        }`}
                      >
                        <span>{cond}</span>
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Other Input */}
                {selectedMedicalConditions.includes("Other") && (
                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-bold text-foreground">Specify Other Medical Condition</label>
                    <input
                      type="text"
                      value={customOtherCondition}
                      onChange={e => setCustomOtherCondition(e.target.value)}
                      placeholder="e.g. Chronic Migraines, Vertigo..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-foreground">Active Medications</label>
                    <input
                      type="text"
                      value={medications}
                      onChange={e => setMedications(e.target.value)}
                      placeholder="e.g. Metformin, Insulin"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground">Known Allergies</label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={e => setAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Peanuts"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary mt-1"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Activity Level */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Compass className="h-4 w-4" /> Activity Level & Sleep
                </h3>

                <div className="space-y-2">
                  {activityOptions.map(opt => {
                    const isSelected = activityLevel === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => setActivityLevel(opt.label)}
                        className={`w-full p-3.5 rounded-2xl text-left text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm"
                            : "bg-foreground/5 border-foreground/8 text-foreground/70 hover:bg-foreground/10"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-foreground">{opt.label}</p>
                          <p className="text-[11px] text-foreground/50 font-normal mt-0.5">{opt.desc}</p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 7: Final Target Confirmation */}
            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" /> Suggested Daily Targets
                  </h3>
                  <p className="text-xs text-foreground/60">
                    Calibrated specifically for your bio-metrics & goals. You can customize them anytime.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1">
                    <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" /> Daily Calories
                    </span>
                    <input
                      type="number"
                      value={calorieGoal}
                      onChange={e => setCalorieGoal(Number(e.target.value))}
                      className="w-full text-lg font-black text-foreground bg-transparent border-none p-0 focus:outline-none tabular-nums"
                    />
                    <span className="text-[10px] text-foreground/40 font-semibold block">kcal / day</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1">
                    <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1">
                      <Utensils className="h-3 w-3 text-emerald-500" /> Daily Protein
                    </span>
                    <input
                      type="number"
                      value={proteinGoal}
                      onChange={e => setProteinGoal(Number(e.target.value))}
                      className="w-full text-lg font-black text-foreground bg-transparent border-none p-0 focus:outline-none tabular-nums"
                    />
                    <span className="text-[10px] text-foreground/40 font-semibold block">grams / day</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1">
                    <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1">
                      <Droplet className="h-3 w-3 text-blue-500" /> Daily Hydration
                    </span>
                    <input
                      type="number"
                      step="250"
                      value={waterGoal}
                      onChange={e => setWaterGoal(Number(e.target.value))}
                      className="w-full text-lg font-black text-foreground bg-transparent border-none p-0 focus:outline-none tabular-nums"
                    />
                    <span className="text-[10px] text-foreground/40 font-semibold block">ml / day</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1">
                    <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1">
                      <Footprints className="h-3 w-3 text-purple-500" /> Daily Step Target
                    </span>
                    <input
                      type="number"
                      step="500"
                      value={stepGoal}
                      onChange={e => setStepGoal(Number(e.target.value))}
                      className="w-full text-lg font-black text-foreground bg-transparent border-none p-0 focus:outline-none tabular-nums"
                    />
                    <span className="text-[10px] text-foreground/40 font-semibold block">steps / day</span>
                  </div>
                </div>

                {age !== "" && Number(age) >= 60 && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Elderly Mode automatically selected for smooth navigation & low-impact protocols.</span>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-foreground/10 mt-6">
            {step > 1 ? (
              <Button onClick={handleBack} variant="glass" size="sm" className="text-xs font-bold flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 7 ? (
              <Button onClick={handleNext} variant="primary" size="sm" className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCompleteOnboarding}
                variant="primary"
                isLoading={loading}
                className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-6 shadow-md shadow-emerald-500/20"
              >
                Complete Setup & Launch
              </Button>
            )}
          </div>

        </GlassCard>

      </div>
    </div>
  );
}
