"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { 
  User, ShieldCheck, Activity, Utensils, HeartPulse, 
  PhoneCall, Bot, Save, CheckCircle, AlertCircle, RefreshCw,
  Edit3, Moon, Clock, Check
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"personal" | "health" | "lifestyle" | "nutrition" | "sleep" | "fitness" | "emergency" | "ai">("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // FORM STATE FOR ALL 8 HEALTH PROFILE SECTIONS (NO DEMO FALLBACKS)
  const [form, setForm] = useState({
    // Personal Information
    full_name: "",
    avatar_url: "",
    date_of_birth: "",
    gender: "",
    height_cm: "" as number | "",
    weight_kg: "" as number | "",
    blood_group: "",
    country: "",
    state: "",
    city: "",
    occupation: "",

    // Medical Information
    medical_conditions: "",
    medications: "",
    medication_schedule: "",
    allergies: "",
    food_allergies: "",
    surgeries: "",
    chronic_diseases: "",
    family_history: "",
    pregnancy_status: "",

    // Lifestyle
    smoking_status: "",
    alcohol_status: "",
    stress_level_onboard: "" as number | "",
    working_hours: "",
    sleep_schedule: "",

    // Nutrition Information
    food_preference: "",
    favorite_foods: "",
    disliked_foods: "",
    cuisine_preference: "",
    calorie_goal: "" as number | "",
    protein_goal: "" as number | "",
    carb_goal: "" as number | "",
    fat_goal: "" as number | "",

    // Sleep Information
    sleep_goal: "" as number | "",
    wind_down_routine: "",

    // Fitness Information
    activity_level: "",
    exercise_frequency: "",
    workout_preference: "",
    fitness_experience: "",
    step_goal: "" as number | "",
    water_goal: "" as number | "",

    // Emergency Contact
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",

    // AI Preferences
    fitness_goal: "",
    reminder_preferences: "",
    ai_coach_style: "",
    unit_system: "Metric"
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        height_cm: profile.height_cm ? Number(profile.height_cm) : "",
        weight_kg: profile.weight_kg ? Number(profile.weight_kg) : "",
        blood_group: profile.blood_group || "",
        country: profile.country || "",
        state: profile.state || "",
        city: profile.city || "",
        occupation: profile.occupation || "",

        medical_conditions: profile.medical_conditions || "",
        medications: profile.medications || "",
        medication_schedule: profile.medication_schedule || "",
        allergies: profile.allergies || "",
        food_allergies: profile.food_allergies || "",
        surgeries: profile.surgeries || "",
        chronic_diseases: profile.chronic_conditions || "",
        family_history: profile.family_history || "",
        pregnancy_status: profile.pregnancy_status || "",

        smoking_status: profile.smoking_status || "",
        alcohol_status: profile.alcohol_status || "",
        stress_level_onboard: profile.stress_level_onboard ? Number(profile.stress_level_onboard) : "",
        working_hours: profile.working_hours || "",
        sleep_schedule: profile.sleep_schedule || "",

        food_preference: profile.food_preference || "",
        favorite_foods: Array.isArray(profile.favorite_foods) ? profile.favorite_foods.join(", ") : (profile.favorite_foods || ""),
        disliked_foods: Array.isArray(profile.disliked_foods) ? profile.disliked_foods.join(", ") : (profile.disliked_foods || ""),
        cuisine_preference: profile.cuisine_preference || "",
        calorie_goal: profile.calorie_goal ? Number(profile.calorie_goal) : "",
        protein_goal: profile.protein_goal ? Number(profile.protein_goal) : "",
        carb_goal: profile.carb_goal ? Number(profile.carb_goal) : "",
        fat_goal: profile.fat_goal ? Number(profile.fat_goal) : "",

        sleep_goal: profile.sleep_goal ? Number(profile.sleep_goal) : "",
        wind_down_routine: profile.wind_down_routine || "",

        activity_level: profile.activity_level || "",
        exercise_frequency: profile.exercise_frequency || "",
        workout_preference: profile.workout_preference || "",
        fitness_experience: profile.fitness_experience || "",
        step_goal: profile.step_goal ? Number(profile.step_goal) : "",
        water_goal: profile.water_goal ? Number(profile.water_goal) : "",

        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
        emergency_contact_relation: profile.emergency_contact_relation || "",

        fitness_goal: profile.fitness_goal || "",
        reminder_preferences: profile.reminder_preferences || "",
        ai_coach_style: profile.ai_coach_style || "",
        unit_system: profile.unit_system || "Metric"
      });
    }
  }, [profile]);

  // CALCULATION LOGIC (ONLY FOR PROVIDED VALUES)
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const calculatedAge = calculateAge(form.date_of_birth);
  const heightVal = form.height_cm !== "" ? Number(form.height_cm) : 0;
  const weightVal = form.weight_kg !== "" ? Number(form.weight_kg) : 0;
  const calculatedBMI = heightVal > 0 && weightVal > 0 
    ? Number((weightVal / Math.pow(heightVal / 100, 2)).toFixed(1)) 
    : null;

  const renderValue = (val: any, suffix: string = "") => {
    if (val === undefined || val === null || val === "" || val === 0) {
      return <span className="text-foreground/40 italic font-normal">Not provided</span>;
    }
    return <span className="text-foreground font-semibold">{val}{suffix}</span>;
  };

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
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        height_cm: form.height_cm !== "" ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg !== "" ? Number(form.weight_kg) : null,
        bmi: calculatedBMI,
        blood_group: form.blood_group || null,
        country: form.country || null,
        state: form.state || null,
        city: form.city || null,
        occupation: form.occupation || null,

        medical_conditions: form.medical_conditions || null,
        medications: form.medications || null,
        medication_schedule: form.medication_schedule || null,
        allergies: form.allergies || null,
        food_allergies: form.food_allergies || null,
        surgeries: form.surgeries || null,
        chronic_conditions: form.chronic_diseases || null,
        family_history: form.family_history || null,
        pregnancy_status: form.pregnancy_status || null,

        activity_level: form.activity_level || null,
        exercise_frequency: form.exercise_frequency || null,
        workout_preference: form.workout_preference || null,
        fitness_experience: form.fitness_experience || null,
        step_goal: form.step_goal !== "" ? Number(form.step_goal) : null,
        water_goal: form.water_goal !== "" ? Number(form.water_goal) : null,
        sleep_goal: form.sleep_goal !== "" ? Number(form.sleep_goal) : null,
        wind_down_routine: form.wind_down_routine || null,

        food_preference: form.food_preference || null,
        favorite_foods: form.favorite_foods ? form.favorite_foods.split(",").map(s => s.trim()) : null,
        disliked_foods: form.disliked_foods ? form.disliked_foods.split(",").map(s => s.trim()) : null,
        cuisine_preference: form.cuisine_preference || null,
        calorie_goal: form.calorie_goal !== "" ? Number(form.calorie_goal) : null,
        protein_goal: form.protein_goal !== "" ? Number(form.protein_goal) : null,
        carb_goal: form.carb_goal !== "" ? Number(form.carb_goal) : null,
        fat_goal: form.fat_goal !== "" ? Number(form.fat_goal) : null,

        smoking_status: form.smoking_status || null,
        alcohol_status: form.alcohol_status || null,
        stress_level_onboard: form.stress_level_onboard !== "" ? Number(form.stress_level_onboard) : null,
        working_hours: form.working_hours || null,
        sleep_schedule: form.sleep_schedule || null,

        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        emergency_contact_relation: form.emergency_contact_relation || null,

        fitness_goal: form.fitness_goal || null,
        reminder_preferences: form.reminder_preferences || null,
        ai_coach_style: form.ai_coach_style || null,
        unit_system: form.unit_system || "Metric",
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
      setIsEditing(false);
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
    { id: "health", label: "Medical & Health", icon: ShieldCheck },
    { id: "lifestyle", label: "Lifestyle", icon: HeartPulse },
    { id: "nutrition", label: "Nutrition", icon: Utensils },
    { id: "sleep", label: "Sleep", icon: Moon },
    { id: "fitness", label: "Fitness", icon: Activity },
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
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "glass" : "primary"}
              className="text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? "View Mode" : "Edit Profile"}
            </Button>
            {isEditing && (
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                variant="primary"
                className="text-xs font-bold bg-primary text-white flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Health Profile saved & synchronized across all VitalCore modules!
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
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-md"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <IconComp className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT CONTAINER */}
        <GlassCard className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* 1. PERSONAL INFORMATION */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-foreground/10 pb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Personal Information
                </h3>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Full Name</label>
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={e => setForm({ ...form, full_name: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Date of Birth</label>
                      <input
                        type="date"
                        value={form.date_of_birth}
                        onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Gender</label>
                      <select
                        value={form.gender}
                        onChange={e => setForm({ ...form, gender: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Height (cm)</label>
                      <input
                        type="number"
                        value={form.height_cm}
                        onChange={e => setForm({ ...form, height_cm: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 175"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Weight (kg)</label>
                      <input
                        type="number"
                        value={form.weight_kg}
                        onChange={e => setForm({ ...form, weight_kg: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 70"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Blood Group</label>
                      <input
                        type="text"
                        value={form.blood_group}
                        onChange={e => setForm({ ...form, blood_group: e.target.value })}
                        placeholder="e.g. O+, A+, B-"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Occupation</label>
                      <input
                        type="text"
                        value={form.occupation}
                        onChange={e => setForm({ ...form, occupation: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Country</label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={e => setForm({ ...form, country: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Full Name</span>
                      <div>{renderValue(form.full_name)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Date of Birth</span>
                      <div>{renderValue(form.date_of_birth)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Calculated Age</span>
                      <div>{renderValue(calculatedAge, " yrs")}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Gender</span>
                      <div>{renderValue(form.gender)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Height</span>
                      <div>{renderValue(form.height_cm, " cm")}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Weight</span>
                      <div>{renderValue(form.weight_kg, " kg")}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Calculated BMI</span>
                      <div>{renderValue(calculatedBMI)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Blood Group</span>
                      <div>{renderValue(form.blood_group)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Occupation</span>
                      <div>{renderValue(form.occupation)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. MEDICAL INFORMATION */}
            {activeTab === "health" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-foreground/10 pb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Medical & Health History
                </h3>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Medical Conditions</label>
                      <input
                        type="text"
                        value={form.medical_conditions}
                        onChange={e => setForm({ ...form, medical_conditions: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Medications</label>
                      <input
                        type="text"
                        value={form.medications}
                        onChange={e => setForm({ ...form, medications: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Allergies</label>
                      <input
                        type="text"
                        value={form.allergies}
                        onChange={e => setForm({ ...form, allergies: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Food Allergies</label>
                      <input
                        type="text"
                        value={form.food_allergies}
                        onChange={e => setForm({ ...form, food_allergies: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Past Surgeries</label>
                      <input
                        type="text"
                        value={form.surgeries}
                        onChange={e => setForm({ ...form, surgeries: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Chronic Diseases</label>
                      <input
                        type="text"
                        value={form.chronic_diseases}
                        onChange={e => setForm({ ...form, chronic_diseases: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Medical Conditions</span>
                      <div>{renderValue(form.medical_conditions)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Active Medications</span>
                      <div>{renderValue(form.medications)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Environmental Allergies</span>
                      <div>{renderValue(form.allergies)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Food Allergies</span>
                      <div>{renderValue(form.food_allergies)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Surgeries</span>
                      <div>{renderValue(form.surgeries)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Chronic Conditions</span>
                      <div>{renderValue(form.chronic_diseases)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. LIFESTYLE INFORMATION */}
            {activeTab === "lifestyle" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-foreground/10 pb-2 flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-primary" /> Lifestyle & Habit Tracking
                </h3>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Smoking Status</label>
                      <input
                        type="text"
                        value={form.smoking_status}
                        onChange={e => setForm({ ...form, smoking_status: e.target.value })}
                        placeholder="e.g. Never / Former / Active"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Alcohol Status</label>
                      <input
                        type="text"
                        value={form.alcohol_status}
                        onChange={e => setForm({ ...form, alcohol_status: e.target.value })}
                        placeholder="e.g. Never / Occasional / Moderate"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Working Hours</label>
                      <input
                        type="text"
                        value={form.working_hours}
                        onChange={e => setForm({ ...form, working_hours: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Sleep Schedule</label>
                      <input
                        type="text"
                        value={form.sleep_schedule}
                        onChange={e => setForm({ ...form, sleep_schedule: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Smoking Status</span>
                      <div>{renderValue(form.smoking_status)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Alcohol Intake</span>
                      <div>{renderValue(form.alcohol_status)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Daily Working Hours</span>
                      <div>{renderValue(form.working_hours)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Target Sleep Schedule</span>
                      <div>{renderValue(form.sleep_schedule)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. NUTRITION INFORMATION */}
            {activeTab === "nutrition" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-foreground/10 pb-2 flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" /> Nutrition Preferences & Goals
                </h3>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Dietary Preference</label>
                      <input
                        type="text"
                        value={form.food_preference}
                        onChange={e => setForm({ ...form, food_preference: e.target.value })}
                        placeholder="e.g. Vegetarian, Vegan, Non-Veg"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Favorite Foods</label>
                      <input
                        type="text"
                        value={form.favorite_foods}
                        onChange={e => setForm({ ...form, favorite_foods: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Disliked Foods</label>
                      <input
                        type="text"
                        value={form.disliked_foods}
                        onChange={e => setForm({ ...form, disliked_foods: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Daily Calorie Target (kcal)</label>
                      <input
                        type="number"
                        value={form.calorie_goal}
                        onChange={e => setForm({ ...form, calorie_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 2000"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Diet Preference</span>
                      <div>{renderValue(form.food_preference)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Favorite Foods</span>
                      <div>{renderValue(form.favorite_foods)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Disliked Foods</span>
                      <div>{renderValue(form.disliked_foods)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Calorie Target</span>
                      <div>{renderValue(form.calorie_goal, " kcal")}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Protein Target</span>
                      <div>{renderValue(form.protein_goal, " g")}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. SLEEP INFORMATION */}
            {activeTab === "sleep" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-foreground/10 pb-2 flex items-center gap-2">
                  <Moon className="h-4 w-4 text-primary" /> Circadian & Sleep Goals
                </h3>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Sleep Goal (Hours)</label>
                      <input
                        type="number"
                        value={form.sleep_goal}
                        onChange={e => setForm({ ...form, sleep_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 8.0"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Wind Down Routine</label>
                      <input
                        type="text"
                        value={form.wind_down_routine}
                        onChange={e => setForm({ ...form, wind_down_routine: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Sleep Goal</span>
                      <div>{renderValue(form.sleep_goal, " hours/night")}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Wind-down Routine</span>
                      <div>{renderValue(form.wind_down_routine)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. FITNESS INFORMATION */}
            {activeTab === "fitness" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-foreground/10 pb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Fitness Parameters & Activity Goals
                </h3>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Activity Level</label>
                      <input
                        type="text"
                        value={form.activity_level}
                        onChange={e => setForm({ ...form, activity_level: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Exercise Frequency</label>
                      <input
                        type="text"
                        value={form.exercise_frequency}
                        onChange={e => setForm({ ...form, exercise_frequency: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Daily Step Target</label>
                      <input
                        type="number"
                        value={form.step_goal}
                        onChange={e => setForm({ ...form, step_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 10000"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Daily Water Target (ml)</label>
                      <input
                        type="number"
                        value={form.water_goal}
                        onChange={e => setForm({ ...form, water_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 2500"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Activity Level</span>
                      <div>{renderValue(form.activity_level)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Exercise Frequency</span>
                      <div>{renderValue(form.exercise_frequency)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Daily Step Goal</span>
                      <div>{renderValue(form.step_goal, " steps")}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Daily Hydration Goal</span>
                      <div>{renderValue(form.water_goal, " ml")}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. EMERGENCY CONTACT */}
            {activeTab === "emergency" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-foreground/10 pb-2 flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-primary" /> Emergency Contact Details
                </h3>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Contact Name</label>
                      <input
                        type="text"
                        value={form.emergency_contact_name}
                        onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Phone Number</label>
                      <input
                        type="text"
                        value={form.emergency_contact_phone}
                        onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Relationship</label>
                      <input
                        type="text"
                        value={form.emergency_contact_relation}
                        onChange={e => setForm({ ...form, emergency_contact_relation: e.target.value })}
                        placeholder="e.g. Spouse / Parent"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Contact Name</span>
                      <div>{renderValue(form.emergency_contact_name)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Phone Number</span>
                      <div>{renderValue(form.emergency_contact_phone)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Relationship</span>
                      <div>{renderValue(form.emergency_contact_relation)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. AI PREFERENCES */}
            {activeTab === "ai" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-foreground/10 pb-2 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" /> AI Coach Persona & System Preferences
                </h3>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">Primary Fitness Goal</label>
                      <input
                        type="text"
                        value={form.fitness_goal}
                        onChange={e => setForm({ ...form, fitness_goal: e.target.value })}
                        placeholder="Complete in Profile"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/70">AI Coach Persona Style</label>
                      <input
                        type="text"
                        value={form.ai_coach_style}
                        onChange={e => setForm({ ...form, ai_coach_style: e.target.value })}
                        placeholder="e.g. Supportive & Clinical"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">Primary Goal</span>
                      <div>{renderValue(form.fitness_goal)}</div>
                    </div>
                    <div className="p-3 bg-foreground/5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-foreground/45">AI Coach Style</span>
                      <div>{renderValue(form.ai_coach_style)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="pt-4 border-t border-foreground/10 flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  variant="glass"
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  variant="primary"
                  className="text-xs font-bold bg-primary text-white flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

          </form>
        </GlassCard>

      </div>
    </DashboardLayout>
  );
}
