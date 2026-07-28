"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { 
  User, ShieldCheck, Activity, Utensils, HeartPulse, 
  PhoneCall, Bot, Save, CheckCircle, AlertCircle, RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"personal" | "health" | "fitness" | "nutrition" | "lifestyle" | "emergency" | "ai">("personal");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // FORM STATE FOR ALL 7 HEALTH PROFILE SECTIONS
  const [form, setForm] = useState({
    // Personal Information
    full_name: "",
    avatar_url: "",
    date_of_birth: "1995-05-15",
    gender: "Male",
    height_cm: 175,
    weight_kg: 70,
    blood_group: "O+",
    country: "India",
    state: "Telangana",
    city: "Hyderabad",
    occupation: "Software Engineer",

    // Health Information
    medical_conditions: "None",
    medications: "None",
    medication_schedule: "N/A",
    allergies: "Dust",
    food_allergies: "Peanuts",
    surgeries: "None",
    chronic_diseases: "None",
    family_history: "Diabetes",
    pregnancy_status: "N/A",

    // Fitness Information
    activity_level: "Moderate",
    exercise_frequency: "4 times/week",
    workout_preference: "Gym & Running",
    fitness_experience: "Intermediate",
    step_goal: 8000,
    water_goal: 2500,
    sleep_goal: 8.0,

    // Nutrition Information
    food_preference: "Non-Vegetarian",
    favorite_foods: "Idli, Grilled Chicken, Biryani",
    disliked_foods: "Bitter Gourd",
    cuisine_preference: "South Indian",
    calorie_goal: 2200,
    protein_goal: 90,
    carb_goal: 250,
    fat_goal: 60,

    // Lifestyle
    smoking_status: "Never",
    alcohol_status: "Occasional",
    stress_level_onboard: 40,
    working_hours: "8 hours/day",
    sleep_schedule: "22:30 - 06:30",

    // Emergency
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "Spouse",

    // AI Preferences
    fitness_goal: "Muscle Gain",
    reminder_preferences: "Daily Morning & Evening",
    ai_coach_style: "Supportive & Clinical",
    unit_system: "Metric"
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        date_of_birth: profile.date_of_birth || "1995-05-15",
        gender: profile.gender || "Male",
        height_cm: Number(profile.height_cm) || 175,
        weight_kg: Number(profile.weight_kg) || 70,
        blood_group: profile.blood_group || "O+",
        country: profile.country || "India",
        state: profile.state || "Telangana",
        city: profile.city || "Hyderabad",
        occupation: profile.occupation || "Software Engineer",

        medical_conditions: profile.medical_conditions || "None",
        medications: profile.medications || "None",
        medication_schedule: profile.medication_schedule || "N/A",
        allergies: profile.allergies || "Dust",
        food_allergies: profile.food_allergies || "Peanuts",
        surgeries: profile.surgeries || "None",
        chronic_diseases: profile.chronic_conditions || "None",
        family_history: profile.family_history || "Diabetes",
        pregnancy_status: profile.pregnancy_status || "N/A",

        activity_level: profile.activity_level || "Moderate",
        exercise_frequency: profile.exercise_frequency || "4 times/week",
        workout_preference: profile.workout_preference || "Gym & Running",
        fitness_experience: profile.fitness_experience || "Intermediate",
        step_goal: Number(profile.step_goal) || 8000,
        water_goal: Number(profile.water_goal) || 2500,
        sleep_goal: Number(profile.sleep_goal) || 8.0,

        food_preference: profile.food_preference || "Non-Vegetarian",
        favorite_foods: Array.isArray(profile.favorite_foods) ? profile.favorite_foods.join(", ") : (profile.favorite_foods || "Idli, Grilled Chicken"),
        disliked_foods: Array.isArray(profile.disliked_foods) ? profile.disliked_foods.join(", ") : (profile.disliked_foods || "Bitter Gourd"),
        cuisine_preference: profile.cuisine_preference || "South Indian",
        calorie_goal: Number(profile.calorie_goal) || 2200,
        protein_goal: Number(profile.protein_goal) || 90,
        carb_goal: Number(profile.carb_goal) || 250,
        fat_goal: Number(profile.fat_goal) || 60,

        smoking_status: profile.smoking_status || "Never",
        alcohol_status: profile.alcohol_status || "Occasional",
        stress_level_onboard: Number(profile.stress_level_onboard) || 40,
        working_hours: profile.working_hours || "8 hours/day",
        sleep_schedule: profile.sleep_schedule || "22:30 - 06:30",

        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
        emergency_contact_relation: profile.emergency_contact_relation || "Spouse",

        fitness_goal: profile.fitness_goal || "Muscle Gain",
        reminder_preferences: profile.reminder_preferences || "Daily Morning & Evening",
        ai_coach_style: profile.ai_coach_style || "Supportive & Clinical",
        unit_system: profile.unit_system || "Metric"
      });
    }
  }, [profile]);

  // AUTO CALCULATED AGE & BMI
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 28;
    const dob = new Date(dobString);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const calculatedAge = calculateAge(form.date_of_birth);
  const calculatedBMI = Number((form.weight_kg / Math.pow(form.height_cm / 100, 2)).toFixed(1));

  // SAVE TO SUPABASE
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !supabase) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const updateData = {
        full_name: form.full_name,
        avatar_url: form.avatar_url,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        bmi: calculatedBMI,
        blood_group: form.blood_group,
        country: form.country,
        state: form.state,
        city: form.city,
        occupation: form.occupation,

        medical_conditions: form.medical_conditions,
        medications: form.medications,
        medication_schedule: form.medication_schedule,
        allergies: form.allergies,
        food_allergies: form.food_allergies,
        surgeries: form.surgeries,
        chronic_conditions: form.chronic_diseases,
        family_history: form.family_history,
        pregnancy_status: form.pregnancy_status,

        activity_level: form.activity_level,
        exercise_frequency: form.exercise_frequency,
        workout_preference: form.workout_preference,
        fitness_experience: form.fitness_experience,
        step_goal: Number(form.step_goal),
        water_goal: Number(form.water_goal),
        sleep_goal: Number(form.sleep_goal),

        food_preference: form.food_preference,
        favorite_foods: form.favorite_foods.split(",").map(s => s.trim()),
        disliked_foods: form.disliked_foods.split(",").map(s => s.trim()),
        cuisine_preference: form.cuisine_preference,
        calorie_goal: Number(form.calorie_goal),
        protein_goal: Number(form.protein_goal),
        carb_goal: Number(form.carb_goal),
        fat_goal: Number(form.fat_goal),

        smoking_status: form.smoking_status,
        alcohol_status: form.alcohol_status,
        stress_level_onboard: Number(form.stress_level_onboard),
        working_hours: form.working_hours,
        sleep_schedule: form.sleep_schedule,

        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        emergency_contact_relation: form.emergency_contact_relation,

        fitness_goal: form.fitness_goal,
        reminder_preferences: form.reminder_preferences,
        ai_coach_style: form.ai_coach_style,
        unit_system: form.unit_system,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err.message || "Failed to update Health Profile.");
    } finally {
      setSaving(false);
    }
  };

  const TAB_BUTTONS = [
    { id: "personal", label: "Personal", icon: User },
    { id: "health", label: "Health & Medical", icon: ShieldCheck },
    { id: "fitness", label: "Fitness Goals", icon: Activity },
    { id: "nutrition", label: "Nutrition", icon: Utensils },
    { id: "lifestyle", label: "Lifestyle", icon: HeartPulse },
    { id: "emergency", label: "Emergency", icon: PhoneCall },
    { id: "ai", label: "AI Preferences", icon: Bot },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Centralized Health Profile
            </h1>
            <p className="text-xs text-foreground/60 font-medium">
              Single source of truth for all VitalCore AI health recommendations
            </p>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            variant="primary"
            className="text-xs font-bold bg-primary text-white flex items-center gap-1.5 shadow-md"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Health Profile"}
          </Button>
        </div>

        {/* FEEDBACK BANNERS */}
        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Health Profile saved & synchronized live across all devices!
          </div>
        )}
        {saveError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {saveError}
          </div>
        )}

        {/* TAB NAVIGATION BAR */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar p-1 bg-foreground/5 rounded-2xl border border-foreground/10 text-xs font-bold">
          {TAB_BUTTONS.map((tab) => {
            const IconComp = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected ? "bg-primary text-white shadow-sm" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                <IconComp className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT CARDS */}
        <form onSubmit={handleSaveProfile} className="space-y-6">

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === "personal" && (
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-primary font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-primary font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Age (Calculated)</label>
                    <div className="p-2.5 rounded-xl border border-foreground/10 bg-foreground/5 font-black text-primary text-sm">
                      {calculatedAge} years
                    </div>
                  </div>
                  <div>
                    <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={form.height_cm}
                      onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={form.weight_kg}
                      onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">BMI (Auto)</label>
                    <div className="p-2.5 rounded-xl border border-foreground/10 bg-foreground/5 font-black text-rose-500 text-sm">
                      {calculatedBMI}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Blood Group</label>
                  <select
                    value={form.blood_group}
                    onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  >
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Occupation</label>
                  <input
                    type="text"
                    value={form.occupation}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">City & State</label>
                  <input
                    type="text"
                    value={`${form.city}, ${form.state}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(",");
                      setForm({ ...form, city: parts[0] || "", state: parts[1]?.trim() || "" });
                    }}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 2: HEALTH & MEDICAL INFORMATION */}
          {activeTab === "health" && (
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Health & Medical Record
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Existing Medical Conditions</label>
                  <textarea
                    value={form.medical_conditions}
                    onChange={(e) => setForm({ ...form, medical_conditions: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Current Medications & Schedule</label>
                  <textarea
                    value={`${form.medications} (${form.medication_schedule})`}
                    onChange={(e) => setForm({ ...form, medications: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Food & General Allergies</label>
                  <input
                    type="text"
                    value={`${form.allergies}, ${form.food_allergies}`}
                    onChange={(e) => setForm({ ...form, food_allergies: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Family History & Surgeries</label>
                  <input
                    type="text"
                    value={form.family_history}
                    onChange={(e) => setForm({ ...form, family_history: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 3: FITNESS GOALS */}
          {activeTab === "fitness" && (
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Fitness Targets
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Daily Step Goal</label>
                  <input
                    type="number"
                    value={form.step_goal}
                    onChange={(e) => setForm({ ...form, step_goal: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Water Intake Goal (ml)</label>
                  <input
                    type="number"
                    value={form.water_goal}
                    onChange={(e) => setForm({ ...form, water_goal: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Sleep Goal (hours)</label>
                  <input
                    type="number"
                    value={form.sleep_goal}
                    onChange={(e) => setForm({ ...form, sleep_goal: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 4: NUTRITION INFORMATION */}
          {activeTab === "nutrition" && (
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Utensils className="h-4 w-4 text-primary" /> Daily Macro & Nutrition Targets
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Calorie Target</label>
                  <input
                    type="number"
                    value={form.calorie_goal}
                    onChange={(e) => setForm({ ...form, calorie_goal: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Protein Target (g)</label>
                  <input
                    type="number"
                    value={form.protein_goal}
                    onChange={(e) => setForm({ ...form, protein_goal: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Carb Target (g)</label>
                  <input
                    type="number"
                    value={form.carb_goal}
                    onChange={(e) => setForm({ ...form, carb_goal: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Fat Target (g)</label>
                  <input
                    type="number"
                    value={form.fat_goal}
                    onChange={(e) => setForm({ ...form, fat_goal: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 5: LIFESTYLE */}
          {activeTab === "lifestyle" && (
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-primary" /> Lifestyle Habits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Smoking & Alcohol</label>
                  <input
                    type="text"
                    value={`Smoking: ${form.smoking_status}, Alcohol: ${form.alcohol_status}`}
                    onChange={(e) => setForm({ ...form, smoking_status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Working Hours & Sleep Schedule</label>
                  <input
                    type="text"
                    value={`${form.working_hours} | ${form.sleep_schedule}`}
                    onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-semibold"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 6: EMERGENCY CONTACT */}
          {activeTab === "emergency" && (
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-primary" /> Emergency Contact Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={form.emergency_contact_name}
                    onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.emergency_contact_phone}
                    onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Relationship</label>
                  <input
                    type="text"
                    value={form.emergency_contact_relation}
                    onChange={(e) => setForm({ ...form, emergency_contact_relation: e.target.value })}
                    placeholder="Spouse / Parent"
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 7: AI PREFERENCES */}
          {activeTab === "ai" && (
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> VitalCore AI Engine Preferences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">AI Coach Style</label>
                  <select
                    value={form.ai_coach_style}
                    onChange={(e) => setForm({ ...form, ai_coach_style: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  >
                    <option value="Supportive & Clinical">Supportive & Clinical</option>
                    <option value="Direct & Athletic">Direct & Athletic</option>
                    <option value="Ayurvedic & Holistic">Ayurvedic & Holistic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Unit System</label>
                  <select
                    value={form.unit_system}
                    onChange={(e) => setForm({ ...form, unit_system: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground font-bold"
                  >
                    <option value="Metric">Metric (kg, cm, ml)</option>
                    <option value="Imperial">Imperial (lbs, in, oz)</option>
                  </select>
                </div>
              </div>
            </GlassCard>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
              className="px-8 py-3 text-xs font-bold bg-primary text-white shadow-lg"
            >
              {saving ? "Saving Changes..." : "Save Health Profile"}
            </Button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
