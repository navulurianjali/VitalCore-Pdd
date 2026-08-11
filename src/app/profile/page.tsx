"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User, HeartPulse, Activity, Utensils, Moon, PhoneCall,
  ShieldCheck, Scale, Edit3, Save, RefreshCw, CheckCircle,
  AlertCircle, ChevronRight
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

type TabId = "personal" | "body" | "medical" | "lifestyle" | "nutrition" | "fitness" | "sleep" | "emergency";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "personal",   label: "Personal",       icon: User       },
  { id: "body",       label: "Body",            icon: Scale      },
  { id: "medical",    label: "Medical",         icon: ShieldCheck},
  { id: "lifestyle",  label: "Lifestyle",       icon: HeartPulse },
  { id: "nutrition",  label: "Nutrition",       icon: Utensils   },
  { id: "fitness",    label: "Fitness",         icon: Activity   },
  { id: "sleep",      label: "Sleep",           icon: Moon       },
  { id: "emergency",  label: "Emergency",       icon: PhoneCall  },
];

// ─── MODULE-LEVEL CONSTANTS & HELPERS ─────────────────────────────────────────
// CRITICAL: These MUST be outside ProfilePage.
// Defining component functions (Field, ViewTile) inside a render function creates
// a new function reference on every render. React uses reference equality to
// compare component types — a new reference means React unmounts the old Field
// and mounts a brand-new one, destroying the DOM input and losing focus after
// every single keystroke ("first character only" bug).
// Moving them here gives them a stable reference that never changes.

const inputCls = "w-full text-xs px-3 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground placeholder-foreground/35 focus:outline-none focus:border-primary/40 transition-colors";
const selectCls = "w-full text-xs px-3 py-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-primary/40 transition-colors";
const labelCls = "block text-[11px] font-semibold text-foreground/60 mb-1";

const f = (id: string) => `profile-field-${id}`;

const val = (v: any, suffix = "") => {
  if (v === null || v === undefined || v === "" || v === 0) {
    return <span className="text-foreground/35 italic font-normal text-xs">Not provided</span>;
  }
  return <span className="text-foreground font-semibold text-xs">{v}{suffix}</span>;
};

const Field = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
  <div className="space-y-1" id={id}>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

const ViewTile = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="p-3 bg-foreground/[0.04] rounded-xl border border-foreground/5 space-y-1">
    <span className="text-[10px] font-bold uppercase tracking-wide text-foreground/40">{label}</span>
    <div>{children}</div>
  </div>
);

export default function ProfilePage() {
  const { profile, updateProfile, refreshProfile, user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Guard: populate form from DB profile only once on initial load.
  // Without this, any profile object reference change (e.g. from updateProfile's
  // optimistic setProfile call, or a Supabase auth token refresh) re-triggers
  // useEffect([profile]) and wipes whatever the user is currently typing.
  const formInitialized = useRef(false);
  const pendingFormReset = useRef(false);

  const [form, setForm] = useState({
    // Personal
    full_name: "",
    date_of_birth: "",
    gender: "",
    occupation: "",
    country: "",
    state: "",
    city: "",

    // Body
    height_cm: "" as number | "",
    weight_kg: "" as number | "",
    blood_group: "",

    // Medical
    medical_conditions: "",
    medications: "",
    allergies: "",
    food_allergies: "",
    surgeries: "",
    chronic_conditions: "",
    family_history: "",
    pregnancy_status: "",

    // Lifestyle
    smoking_status: "",
    alcohol_status: "",
    stress_level_onboard: "" as number | "",
    working_hours: "",
    sleep_schedule: "",

    // Nutrition
    food_preference: "",
    favorite_foods: "",
    disliked_foods: "",
    cuisine_preference: "",
    calorie_goal: "" as number | "",
    protein_goal: "" as number | "",
    carb_goal: "" as number | "",
    fat_goal: "" as number | "",

    // Fitness
    fitness_goal: "",
    activity_level: "",
    exercise_frequency: "",
    workout_preference: "",
    fitness_experience: "",
    step_goal: "" as number | "",
    water_goal: "" as number | "",

    // Sleep
    sleep_goal: "" as number | "",
    wind_down_routine: "",

    // Emergency
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  });

  const populateForm = (p: typeof profile) => {
    if (!p) return;
    setForm({
      full_name: p.full_name || "",
      date_of_birth: p.date_of_birth || "",
      gender: p.gender || "",
      occupation: p.occupation || "",
      country: p.country || "",
      state: p.state || "",
      city: p.city || "",

      height_cm: p.height_cm ? Number(p.height_cm) : "",
      weight_kg: p.weight_kg ? Number(p.weight_kg) : "",
      blood_group: p.blood_group || "",

      medical_conditions: p.medical_conditions || "",
      medications: p.medications || "",
      allergies: p.allergies || "",
      food_allergies: p.food_allergies || "",
      surgeries: p.surgeries || "",
      chronic_conditions: p.chronic_conditions || "",
      family_history: p.family_history || "",
      pregnancy_status: p.pregnancy_status || "",

      smoking_status: p.smoking_status || "",
      alcohol_status: p.alcohol_status || "",
      stress_level_onboard: p.stress_level_onboard ? Number(p.stress_level_onboard) : "",
      working_hours: p.working_hours || "",
      sleep_schedule: p.sleep_schedule || "",

      food_preference: p.food_preference || "",
      favorite_foods: Array.isArray(p.favorite_foods) ? p.favorite_foods.join(", ") : (p.favorite_foods || ""),
      disliked_foods: Array.isArray(p.disliked_foods) ? p.disliked_foods.join(", ") : (p.disliked_foods || ""),
      cuisine_preference: p.cuisine_preference || "",
      calorie_goal: p.calorie_goal ? Number(p.calorie_goal) : "",
      protein_goal: p.protein_goal ? Number(p.protein_goal) : "",
      carb_goal: p.carb_goal ? Number(p.carb_goal) : "",
      fat_goal: p.fat_goal ? Number(p.fat_goal) : "",

      fitness_goal: p.fitness_goal || "",
      activity_level: p.activity_level || "",
      exercise_frequency: p.exercise_frequency || "",
      workout_preference: p.workout_preference || "",
      fitness_experience: p.fitness_experience || "",
      step_goal: p.step_goal ? Number(p.step_goal) : "",
      water_goal: p.water_goal ? Number(p.water_goal) : "",

      sleep_goal: p.sleep_goal ? Number(p.sleep_goal) : "",
      wind_down_routine: p.wind_down_routine || "",

      emergency_contact_name: p.emergency_contact_name || "",
      emergency_contact_phone: p.emergency_contact_phone || "",
      emergency_contact_relation: p.emergency_contact_relation || "",
    });
  };

  useEffect(() => {
    if (!profile) return;
    // Only seed the form on the very first load, OR when handleSave explicitly
    // requests a re-seed after a successful save (pendingFormReset.current = true).
    // This prevents TOKEN_REFRESHED / optimistic updateProfile calls from
    // overwriting whatever the user is currently typing.
    if (!formInitialized.current || pendingFormReset.current) {
      formInitialized.current = true;
      pendingFormReset.current = false;
      populateForm(profile);
    }
  }, [profile]);

  // Derived values
  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    return Math.abs(new Date(Date.now() - d.getTime()).getUTCFullYear() - 1970);
  };
  const calculatedAge = calculateAge(form.date_of_birth);
  const heightVal = form.height_cm !== "" ? Number(form.height_cm) : 0;
  const weightVal = form.weight_kg !== "" ? Number(form.weight_kg) : 0;
  const calculatedBMI = heightVal > 0 && weightVal > 0
    ? Number((weightVal / Math.pow(heightVal / 100, 2)).toFixed(1))
    : null;

  const bmiCategory = (bmi: number | null) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { label: "Healthy", color: "text-emerald-500" };
    if (bmi < 30) return { label: "Overweight", color: "text-amber-500" };
    return { label: "Obese", color: "text-rose-500" };
  };
  const bmiInfo = bmiCategory(calculatedBMI);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !supabase) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const { error } = await updateProfile({
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        occupation: form.occupation || null,
        country: form.country || null,
        state: form.state || null,
        city: form.city || null,

        height_cm: form.height_cm !== "" ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg !== "" ? Number(form.weight_kg) : null,
        bmi: calculatedBMI,
        blood_group: form.blood_group || null,

        medical_conditions: form.medical_conditions || null,
        medications: form.medications || null,
        allergies: form.allergies || null,
        food_allergies: form.food_allergies || null,
        surgeries: form.surgeries || null,
        chronic_conditions: form.chronic_conditions || null,
        family_history: form.family_history || null,
        pregnancy_status: form.pregnancy_status || null,

        smoking_status: form.smoking_status || null,
        alcohol_status: form.alcohol_status || null,
        stress_level_onboard: form.stress_level_onboard !== "" ? Number(form.stress_level_onboard) : null,
        working_hours: form.working_hours || null,
        sleep_schedule: form.sleep_schedule || null,

        food_preference: form.food_preference || null,
        favorite_foods: form.favorite_foods ? form.favorite_foods.split(",").map(s => s.trim()).filter(Boolean) : null,
        disliked_foods: form.disliked_foods ? form.disliked_foods.split(",").map(s => s.trim()).filter(Boolean) : null,
        cuisine_preference: form.cuisine_preference || null,
        calorie_goal: form.calorie_goal !== "" ? Number(form.calorie_goal) : null,
        protein_goal: form.protein_goal !== "" ? Number(form.protein_goal) : null,
        carb_goal: form.carb_goal !== "" ? Number(form.carb_goal) : null,
        fat_goal: form.fat_goal !== "" ? Number(form.fat_goal) : null,

        fitness_goal: form.fitness_goal || null,
        activity_level: form.activity_level || null,
        exercise_frequency: form.exercise_frequency || null,
        workout_preference: form.workout_preference || null,
        fitness_experience: form.fitness_experience || null,
        step_goal: form.step_goal !== "" ? Number(form.step_goal) : null,
        water_goal: form.water_goal !== "" ? Number(form.water_goal) : null,

        sleep_goal: form.sleep_goal !== "" ? Number(form.sleep_goal) : null,
        wind_down_routine: form.wind_down_routine || null,

        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        emergency_contact_relation: form.emergency_contact_relation || null,
        // NOTE: updated_at is intentionally omitted — the DB column has a default
        // that updates automatically. Explicitly setting it can conflict with triggers.
      } as any);

      if (error) {
        // Surface the actual Supabase PostgrestError for debugging
        console.error("[ProfilePage] Supabase save error:", {
          message: (error as any).message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
          status: (error as any).status,
          fullError: error,
        });
        throw error;
      }

      // Signal that the next profile change (from refreshProfile below)
      // should re-populate the form with the confirmed DB values.
      pendingFormReset.current = true;
      await refreshProfile();
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      // Show the actual error message from Supabase if available
      const msg = err?.message || err?.details || err?.hint || "Unknown error";
      console.error("[ProfilePage] handleSave caught:", err);
      setSaveError(`Save failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };



  // Field, ViewTile, inputCls, selectCls, labelCls, val, f are all defined
  // at module level (outside this component) to keep their references stable.

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-4xl mx-auto pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              My Profile
            </h1>
            <p className="text-xs text-foreground/50 mt-0.5 font-medium ml-10">
              Your personal information and health data
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => { setIsEditing(false); setSaveError(""); }}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-foreground/15 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isEditing && saving}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                isEditing
                  ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                  : "bg-foreground/8 text-foreground hover:bg-foreground/10 border border-foreground/10"
              }`}
              id="profile-save-btn"
            >
              {isEditing
                ? saving
                  ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                  : <><Save className="h-3.5 w-3.5" /> Save Changes</>
                : <><Edit3 className="h-3.5 w-3.5" /> Edit Profile</>
              }
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {saveSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 text-xs font-semibold">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Profile saved successfully.
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {saveError}
          </div>
        )}

        {/* Stat summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Age", value: calculatedAge ? `${calculatedAge} yrs` : null },
            { label: "Height", value: heightVal > 0 ? `${heightVal} cm` : null },
            { label: "Weight", value: weightVal > 0 ? `${weightVal} kg` : null },
            { label: "BMI", value: calculatedBMI ? String(calculatedBMI) : null, extra: bmiInfo },
          ].map(({ label, value, extra }) => (
            <div key={label} className="p-3 rounded-xl border border-foreground/8 bg-foreground/[0.03] text-center">
              <div className="text-[10px] font-bold uppercase tracking-wide text-foreground/40 mb-1">{label}</div>
              {value
                ? <div className={`text-base font-bold ${extra ? (extra as any).color : "text-foreground"}`}>{value}</div>
                : <div className="text-xs text-foreground/30 italic">—</div>
              }
              {extra && value && (
                <div className={`text-[10px] font-semibold mt-0.5 ${(extra as any).color}`}>{(extra as any).label}</div>
              )}
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar bg-foreground/[0.04] rounded-2xl p-1 border border-foreground/8">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`profile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  active ? "bg-primary text-white shadow-sm" : "text-foreground/55 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content card */}
        <form onSubmit={handleSave} id="profile-form">
          <div className="rounded-2xl border border-foreground/8 bg-[var(--card-bg)] p-6">

            {/* ── PERSONAL ── */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-foreground/8 pb-3">
                  <User className="h-4 w-4 text-primary" /> Personal Information
                </h2>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Full Name" id={f("full_name")}>
                      <input id="input-full-name" type="text" value={form.full_name}
                        onChange={e => setForm({ ...form, full_name: e.target.value })}
                        placeholder="Your full name" className={inputCls} />
                    </Field>
                    <Field label="Username" id={f("username")}>
                      <input type="text" value={profile?.username || ""} disabled
                        className={inputCls + " opacity-50 cursor-not-allowed"} />
                    </Field>
                    <Field label="Email" id={f("email")}>
                      <input type="email" value={user?.email || profile?.email || ""} disabled
                        className={inputCls + " opacity-50 cursor-not-allowed"} />
                    </Field>
                    <Field label="Date of Birth" id={f("dob")}>
                      <input id="input-dob" type="date" value={form.date_of_birth}
                        onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="Gender" id={f("gender")}>
                      <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className={selectCls}>
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </Field>
                    <Field label="Occupation" id={f("occupation")}>
                      <input type="text" value={form.occupation}
                        onChange={e => setForm({ ...form, occupation: e.target.value })}
                        placeholder="e.g. Software Engineer" className={inputCls} />
                    </Field>
                    <Field label="Country" id={f("country")}>
                      <input type="text" value={form.country}
                        onChange={e => setForm({ ...form, country: e.target.value })}
                        placeholder="e.g. India" className={inputCls} />
                    </Field>
                    <Field label="City" id={f("city")}>
                      <input type="text" value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        placeholder="e.g. Mumbai" className={inputCls} />
                    </Field>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ViewTile label="Full Name">{val(form.full_name)}</ViewTile>
                    <ViewTile label="Username">{val(profile?.username)}</ViewTile>
                    <ViewTile label="Email">{val(user?.email || profile?.email)}</ViewTile>
                    <ViewTile label="Date of Birth">{val(form.date_of_birth)}</ViewTile>
                    <ViewTile label="Age">{val(calculatedAge, " yrs")}</ViewTile>
                    <ViewTile label="Gender">{val(form.gender)}</ViewTile>
                    <ViewTile label="Occupation">{val(form.occupation)}</ViewTile>
                    <ViewTile label="Country">{val(form.country)}</ViewTile>
                    <ViewTile label="City">{val(form.city)}</ViewTile>
                  </div>
                )}
              </div>
            )}

            {/* ── BODY ── */}
            {activeTab === "body" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-foreground/8 pb-3">
                  <Scale className="h-4 w-4 text-primary" /> Body Measurements
                </h2>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Height (cm)" id={f("height")}>
                      <input id="input-height" type="number" value={form.height_cm}
                        onChange={e => setForm({ ...form, height_cm: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 175" className={inputCls} />
                    </Field>
                    <Field label="Weight (kg)" id={f("weight")}>
                      <input id="input-weight" type="number" value={form.weight_kg}
                        onChange={e => setForm({ ...form, weight_kg: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 70" className={inputCls} />
                    </Field>
                    <Field label="Blood Group" id={f("blood_group")}>
                      <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })} className={selectCls}>
                        <option value="">Select blood group</option>
                        {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg}>{bg}</option>)}
                      </select>
                    </Field>
                    <div className="p-3 rounded-xl bg-foreground/[0.04] border border-foreground/8">
                      <div className="text-[10px] font-bold uppercase text-foreground/40 mb-1">Calculated BMI</div>
                      {calculatedBMI
                        ? <div className={`text-lg font-bold ${bmiInfo?.color}`}>{calculatedBMI} <span className="text-xs font-semibold text-foreground/50">({bmiInfo?.label})</span></div>
                        : <div className="text-xs text-foreground/35 italic">Enter height & weight to calculate</div>
                      }
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ViewTile label="Height">{val(form.height_cm, " cm")}</ViewTile>
                    <ViewTile label="Weight">{val(form.weight_kg, " kg")}</ViewTile>
                    <ViewTile label="Blood Group">{val(form.blood_group)}</ViewTile>
                    <ViewTile label="BMI">
                      {calculatedBMI
                        ? <><span className={`font-bold text-sm ${bmiInfo?.color}`}>{calculatedBMI}</span><span className="text-xs text-foreground/50 ml-1">({bmiInfo?.label})</span></>
                        : val(null)
                      }
                    </ViewTile>
                  </div>
                )}
              </div>
            )}

            {/* ── MEDICAL ── */}
            {activeTab === "medical" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-foreground/8 pb-3">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Medical & Health
                </h2>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Medical Conditions" id={f("medical_conditions")}>
                      <input type="text" value={form.medical_conditions}
                        onChange={e => setForm({ ...form, medical_conditions: e.target.value })}
                        placeholder="e.g. Diabetes, Hypertension" className={inputCls} />
                    </Field>
                    <Field label="Current Medications" id={f("medications")}>
                      <input type="text" value={form.medications}
                        onChange={e => setForm({ ...form, medications: e.target.value })}
                        placeholder="e.g. Metformin 500mg" className={inputCls} />
                    </Field>
                    <Field label="Allergies" id={f("allergies")}>
                      <input type="text" value={form.allergies}
                        onChange={e => setForm({ ...form, allergies: e.target.value })}
                        placeholder="e.g. Dust, Pollen" className={inputCls} />
                    </Field>
                    <Field label="Food Allergies" id={f("food_allergies")}>
                      <input type="text" value={form.food_allergies}
                        onChange={e => setForm({ ...form, food_allergies: e.target.value })}
                        placeholder="e.g. Peanuts, Shellfish" className={inputCls} />
                    </Field>
                    <Field label="Chronic Conditions" id={f("chronic_conditions")}>
                      <input type="text" value={form.chronic_conditions}
                        onChange={e => setForm({ ...form, chronic_conditions: e.target.value })}
                        placeholder="e.g. Asthma, Arthritis" className={inputCls} />
                    </Field>
                    <Field label="Past Surgeries" id={f("surgeries")}>
                      <input type="text" value={form.surgeries}
                        onChange={e => setForm({ ...form, surgeries: e.target.value })}
                        placeholder="e.g. Appendectomy (2019)" className={inputCls} />
                    </Field>
                    <Field label="Family Health History" id={f("family_history")}>
                      <input type="text" value={form.family_history}
                        onChange={e => setForm({ ...form, family_history: e.target.value })}
                        placeholder="e.g. Heart disease, Diabetes" className={inputCls} />
                    </Field>
                    <Field label="Pregnancy Status" id={f("pregnancy_status")}>
                      <select value={form.pregnancy_status} onChange={e => setForm({ ...form, pregnancy_status: e.target.value })} className={selectCls}>
                        <option value="">Select (if applicable)</option>
                        <option>Not applicable</option>
                        <option>Pregnant</option>
                        <option>Postpartum</option>
                      </select>
                    </Field>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ViewTile label="Medical Conditions">{val(form.medical_conditions)}</ViewTile>
                    <ViewTile label="Current Medications">{val(form.medications)}</ViewTile>
                    <ViewTile label="Allergies">{val(form.allergies)}</ViewTile>
                    <ViewTile label="Food Allergies">{val(form.food_allergies)}</ViewTile>
                    <ViewTile label="Chronic Conditions">{val(form.chronic_conditions)}</ViewTile>
                    <ViewTile label="Past Surgeries">{val(form.surgeries)}</ViewTile>
                    <ViewTile label="Family History">{val(form.family_history)}</ViewTile>
                    <ViewTile label="Pregnancy Status">{val(form.pregnancy_status)}</ViewTile>
                  </div>
                )}
              </div>
            )}

            {/* ── LIFESTYLE ── */}
            {activeTab === "lifestyle" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-foreground/8 pb-3">
                  <HeartPulse className="h-4 w-4 text-primary" /> Lifestyle
                </h2>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Smoking Status" id={f("smoking_status")}>
                      <select value={form.smoking_status} onChange={e => setForm({ ...form, smoking_status: e.target.value })} className={selectCls}>
                        <option value="">Select</option>
                        <option>Never</option>
                        <option>Former smoker</option>
                        <option>Occasional</option>
                        <option>Regular</option>
                      </select>
                    </Field>
                    <Field label="Alcohol Consumption" id={f("alcohol_status")}>
                      <select value={form.alcohol_status} onChange={e => setForm({ ...form, alcohol_status: e.target.value })} className={selectCls}>
                        <option value="">Select</option>
                        <option>Never</option>
                        <option>Rarely</option>
                        <option>Occasional</option>
                        <option>Moderate</option>
                        <option>Regular</option>
                      </select>
                    </Field>
                    <Field label="Daily Working Hours" id={f("working_hours")}>
                      <input type="text" value={form.working_hours}
                        onChange={e => setForm({ ...form, working_hours: e.target.value })}
                        placeholder="e.g. 8 hours, 9am–6pm" className={inputCls} />
                    </Field>
                    <Field label="Usual Sleep Schedule" id={f("sleep_schedule")}>
                      <input type="text" value={form.sleep_schedule}
                        onChange={e => setForm({ ...form, sleep_schedule: e.target.value })}
                        placeholder="e.g. 11pm – 7am" className={inputCls} />
                    </Field>
                    <Field label="Stress Level (1–10)" id={f("stress")}>
                      <input type="number" min="1" max="10" value={form.stress_level_onboard}
                        onChange={e => setForm({ ...form, stress_level_onboard: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="1 = very low, 10 = very high" className={inputCls} />
                    </Field>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ViewTile label="Smoking Status">{val(form.smoking_status)}</ViewTile>
                    <ViewTile label="Alcohol Consumption">{val(form.alcohol_status)}</ViewTile>
                    <ViewTile label="Working Hours">{val(form.working_hours)}</ViewTile>
                    <ViewTile label="Sleep Schedule">{val(form.sleep_schedule)}</ViewTile>
                    <ViewTile label="Stress Level">{val(form.stress_level_onboard, " / 10")}</ViewTile>
                  </div>
                )}
              </div>
            )}

            {/* ── NUTRITION ── */}
            {activeTab === "nutrition" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-foreground/8 pb-3">
                  <Utensils className="h-4 w-4 text-primary" /> Nutrition
                </h2>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Diet Preference" id={f("food_preference")}>
                      <select value={form.food_preference} onChange={e => setForm({ ...form, food_preference: e.target.value })} className={selectCls}>
                        <option value="">Select preference</option>
                        <option>Omnivore</option>
                        <option>Vegetarian</option>
                        <option>Vegan</option>
                        <option>Pescatarian</option>
                        <option>Keto</option>
                        <option>Paleo</option>
                        <option>Gluten-free</option>
                      </select>
                    </Field>
                    <Field label="Cuisine Preference" id={f("cuisine")}>
                      <input type="text" value={form.cuisine_preference}
                        onChange={e => setForm({ ...form, cuisine_preference: e.target.value })}
                        placeholder="e.g. Indian, Mediterranean" className={inputCls} />
                    </Field>
                    <Field label="Favorite Foods (comma-separated)" id={f("favorite_foods")}>
                      <input type="text" value={form.favorite_foods}
                        onChange={e => setForm({ ...form, favorite_foods: e.target.value })}
                        placeholder="e.g. Rice, Dal, Salad" className={inputCls} />
                    </Field>
                    <Field label="Disliked Foods (comma-separated)" id={f("disliked_foods")}>
                      <input type="text" value={form.disliked_foods}
                        onChange={e => setForm({ ...form, disliked_foods: e.target.value })}
                        placeholder="e.g. Broccoli, Mushrooms" className={inputCls} />
                    </Field>
                    <Field label="Daily Calorie Target (kcal)" id={f("calorie_goal")}>
                      <input type="number" value={form.calorie_goal}
                        onChange={e => setForm({ ...form, calorie_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 2000" className={inputCls} />
                    </Field>
                    <Field label="Protein Target (g/day)" id={f("protein_goal")}>
                      <input type="number" value={form.protein_goal}
                        onChange={e => setForm({ ...form, protein_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 120" className={inputCls} />
                    </Field>
                    <Field label="Carb Target (g/day)" id={f("carb_goal")}>
                      <input type="number" value={form.carb_goal}
                        onChange={e => setForm({ ...form, carb_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 250" className={inputCls} />
                    </Field>
                    <Field label="Fat Target (g/day)" id={f("fat_goal")}>
                      <input type="number" value={form.fat_goal}
                        onChange={e => setForm({ ...form, fat_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 65" className={inputCls} />
                    </Field>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ViewTile label="Diet Preference">{val(form.food_preference)}</ViewTile>
                    <ViewTile label="Cuisine Preference">{val(form.cuisine_preference)}</ViewTile>
                    <ViewTile label="Favorite Foods">{val(form.favorite_foods)}</ViewTile>
                    <ViewTile label="Disliked Foods">{val(form.disliked_foods)}</ViewTile>
                    <ViewTile label="Calorie Target">{val(form.calorie_goal, " kcal/day")}</ViewTile>
                    <ViewTile label="Protein Target">{val(form.protein_goal, " g/day")}</ViewTile>
                    <ViewTile label="Carb Target">{val(form.carb_goal, " g/day")}</ViewTile>
                    <ViewTile label="Fat Target">{val(form.fat_goal, " g/day")}</ViewTile>
                  </div>
                )}
              </div>
            )}

            {/* ── FITNESS ── */}
            {activeTab === "fitness" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-foreground/8 pb-3">
                  <Activity className="h-4 w-4 text-primary" /> Fitness
                </h2>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Fitness Goal" id={f("fitness_goal")}>
                      <select value={form.fitness_goal} onChange={e => setForm({ ...form, fitness_goal: e.target.value })} className={selectCls}>
                        <option value="">Select goal</option>
                        <option value="weight_loss">Weight Loss</option>
                        <option value="muscle_gain">Muscle Gain</option>
                        <option value="endurance">Build Endurance</option>
                        <option value="flexibility">Improve Flexibility</option>
                        <option value="general_health">General Health</option>
                        <option value="stress_management">Stress Management</option>
                        <option value="sleep_improvement">Better Sleep</option>
                      </select>
                    </Field>
                    <Field label="Activity Level" id={f("activity_level")}>
                      <select value={form.activity_level} onChange={e => setForm({ ...form, activity_level: e.target.value })} className={selectCls}>
                        <option value="">Select level</option>
                        <option>Sedentary</option>
                        <option>Lightly active</option>
                        <option>Moderately active</option>
                        <option>Very active</option>
                        <option>Extremely active</option>
                      </select>
                    </Field>
                    <Field label="Exercise Frequency" id={f("exercise_frequency")}>
                      <select value={form.exercise_frequency} onChange={e => setForm({ ...form, exercise_frequency: e.target.value })} className={selectCls}>
                        <option value="">Select frequency</option>
                        <option>Never</option>
                        <option>1–2 times/week</option>
                        <option>3–4 times/week</option>
                        <option>5–6 times/week</option>
                        <option>Daily</option>
                      </select>
                    </Field>
                    <Field label="Workout Preference" id={f("workout_preference")}>
                      <input type="text" value={form.workout_preference}
                        onChange={e => setForm({ ...form, workout_preference: e.target.value })}
                        placeholder="e.g. Gym, Running, Yoga" className={inputCls} />
                    </Field>
                    <Field label="Fitness Experience" id={f("fitness_experience")}>
                      <select value={form.fitness_experience} onChange={e => setForm({ ...form, fitness_experience: e.target.value })} className={selectCls}>
                        <option value="">Select level</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Athlete</option>
                      </select>
                    </Field>
                    <Field label="Daily Step Goal" id={f("step_goal")}>
                      <input type="number" value={form.step_goal}
                        onChange={e => setForm({ ...form, step_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 10000" className={inputCls} />
                    </Field>
                    <Field label="Daily Water Goal (ml)" id={f("water_goal")}>
                      <input type="number" value={form.water_goal}
                        onChange={e => setForm({ ...form, water_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 2500" className={inputCls} />
                    </Field>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ViewTile label="Fitness Goal">{val(form.fitness_goal)}</ViewTile>
                    <ViewTile label="Activity Level">{val(form.activity_level)}</ViewTile>
                    <ViewTile label="Exercise Frequency">{val(form.exercise_frequency)}</ViewTile>
                    <ViewTile label="Workout Preference">{val(form.workout_preference)}</ViewTile>
                    <ViewTile label="Fitness Experience">{val(form.fitness_experience)}</ViewTile>
                    <ViewTile label="Daily Step Goal">{val(form.step_goal, " steps")}</ViewTile>
                    <ViewTile label="Daily Water Goal">{val(form.water_goal, " ml")}</ViewTile>
                  </div>
                )}
              </div>
            )}

            {/* ── SLEEP ── */}
            {activeTab === "sleep" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-foreground/8 pb-3">
                  <Moon className="h-4 w-4 text-primary" /> Sleep
                </h2>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Sleep Goal (hours/night)" id={f("sleep_goal")}>
                      <input id="input-sleep-goal" type="number" step="0.5" value={form.sleep_goal}
                        onChange={e => setForm({ ...form, sleep_goal: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="e.g. 8" className={inputCls} />
                    </Field>
                    <Field label="Wind-Down Routine" id={f("wind_down")}>
                      <input type="text" value={form.wind_down_routine}
                        onChange={e => setForm({ ...form, wind_down_routine: e.target.value })}
                        placeholder="e.g. Reading, meditation" className={inputCls} />
                    </Field>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ViewTile label="Sleep Goal">{val(form.sleep_goal, " hrs/night")}</ViewTile>
                    <ViewTile label="Wind-Down Routine">{val(form.wind_down_routine)}</ViewTile>
                  </div>
                )}
              </div>
            )}

            {/* ── EMERGENCY ── */}
            {activeTab === "emergency" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-foreground/8 pb-3">
                  <PhoneCall className="h-4 w-4 text-primary" /> Emergency Contact
                </h2>

                <p className="text-xs text-foreground/50">
                  This information may be used in critical health situations. Please keep it up to date.
                </p>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Contact Name" id={f("emergency_name")}>
                      <input id="input-emergency-name" type="text" value={form.emergency_contact_name}
                        onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })}
                        placeholder="e.g. Jane Doe" className={inputCls} />
                    </Field>
                    <Field label="Phone Number" id={f("emergency_phone")}>
                      <input id="input-emergency-phone" type="tel" value={form.emergency_contact_phone}
                        onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })}
                        placeholder="+91 98765 43210" className={inputCls} />
                    </Field>
                    <Field label="Relationship" id={f("emergency_relation")}>
                      <select value={form.emergency_contact_relation} onChange={e => setForm({ ...form, emergency_contact_relation: e.target.value })} className={selectCls}>
                        <option value="">Select relationship</option>
                        <option>Spouse</option>
                        <option>Parent</option>
                        <option>Sibling</option>
                        <option>Child</option>
                        <option>Friend</option>
                        <option>Other</option>
                      </select>
                    </Field>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ViewTile label="Contact Name">{val(form.emergency_contact_name)}</ViewTile>
                    <ViewTile label="Phone Number">{val(form.emergency_contact_phone)}</ViewTile>
                    <ViewTile label="Relationship">{val(form.emergency_contact_relation)}</ViewTile>
                  </div>
                )}
              </div>
            )}

            {/* Inline save (when editing) */}
            {isEditing && (
              <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-foreground/8">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setSaveError(""); }}
                  className="text-xs font-semibold px-4 py-2 rounded-xl border border-foreground/15 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…</> : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
                </button>
              </div>
            )}

          </div>
        </form>

      </div>
    </DashboardLayout>
  );
}
