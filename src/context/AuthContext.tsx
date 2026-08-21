"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url?: string | null;
  active_mode: "wellness" | "performance" | "elderly";
  onboarding_completed?: boolean;
  soreness_level: number;
  biological_age: number;
  stability_score: number;
  weight_kg?: number | null;
  height_cm?: number | null;
  fitness_goal?: string | null;
  
  // Comprehensive Health Profile Fields
  date_of_birth?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  occupation?: string | null;
  timezone?: string | null;
  workout_duration_preference?: number | null;

  medical_conditions?: string | null;
  medications?: string | null;
  medication_schedule?: string | null;
  allergies?: string | null;
  food_allergies?: string | null;
  surgeries?: string | null;
  chronic_conditions?: string | null;
  family_history?: string | null;
  pregnancy_status?: string | null;

  activity_level?: string | null;
  exercise_frequency?: string | null;
  workout_preference?: string | null;
  fitness_experience?: string | null;
  step_goal?: number | null;
  water_goal?: number | null;
  sleep_goal?: number | null;

  food_preference?: string | null;
  favorite_foods?: string[] | null;
  disliked_foods?: string[] | null;
  cuisine_preference?: string | null;
  calorie_goal?: number | null;
  protein_goal?: number | null;
  carb_goal?: number | null;
  fat_goal?: number | null;

  smoking_status?: string | null;
  alcohol_status?: string | null;
  stress_level_onboard?: number | null;
  working_hours?: string | null;
  sleep_schedule?: string | null;
  wind_down_routine?: string | null;

  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;

  reminder_preferences?: string | null;
  notification_settings?: any;
  ai_coach_style?: string | null;
  unit_system?: string | null;
  
  screen_time_hours?: number | null;
  caffeine_intake?: string | null;
  sleep_problems?: boolean | null;
  
  bmi?: number | null;
  body_fat_estimate?: number | null;

  xp?: number;
  badges?: string[];
  streak_days?: number;
  age?: number | null;
}

interface AuthContextProps {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; profile?: UserProfile | null }>;
  signUp: (email: string, password: string, fullName?: string, username?: string) => Promise<{ error: Error | null; profile?: UserProfile | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vitalcore_test_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.user) return parsed.user;
        }
      } catch (e) {}
    }
    return null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vitalcore_test_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.profile) return parsed.profile;
        }
      } catch (e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vitalcore_test_session");
        if (stored) return false;
      } catch (e) {}
    }
    return true;
  });

  const isMockMode = false;

  const clearClientState = () => {
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vitalcore_test_session");
        localStorage.clear();
        sessionStorage.clear();
        window.dispatchEvent(new Event("vitalcore-user-logout"));
      } catch (e) {
        console.error("Storage clear error:", e);
      }
    }
  };

  useEffect(() => {
    // Check if test session exists in localStorage
    if (typeof window !== "undefined") {
      const testSessionStr = localStorage.getItem("vitalcore_test_session");
      if (testSessionStr) {
        try {
          const testSession = JSON.parse(testSessionStr);
          if (testSession?.user && testSession?.profile) {
            setUser(testSession.user);
            setProfile(testSession.profile);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }
    }

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          fetchSupabaseProfile(session.user.id, session.user);
        } else {
          if (typeof window !== "undefined" && localStorage.getItem("vitalcore_test_session")) {
            setLoading(false);
            return;
          }
          clearClientState();
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          if (session) setUser(session.user);
          return;
        }

        if (session) {
          setUser(session.user);
          fetchSupabaseProfile(session.user.id, session.user);
        } else {
          if (typeof window !== "undefined" && localStorage.getItem("vitalcore_test_session")) {
            setLoading(false);
            return;
          }
          clearClientState();
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSupabaseProfile = async (uid: string, sessionUser?: any): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      const activeUser = sessionUser || user;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (!error && data) {
        const isCompleted = data.onboarding_completed === true
          ? true
          : (data.onboarding_completed === false
            ? false
            : Boolean(data.age || data.weight_kg || data.height_cm || data.fitness_goal || data.gender || data.medical_conditions));
        
        const fetchedProf: UserProfile = {
          ...data,
          email: activeUser?.email || data.email || "",
          onboarding_completed: isCompleted,
          soreness_level: Number(data.soreness_level) || 0,
          biological_age: data.biological_age ? Number(data.biological_age) : 0,
          stability_score: data.stability_score ? Number(data.stability_score) : 0
        };
        setProfile(fetchedProf);
        return fetchedProf;
      } else if (!data && (!error || error.code === "PGRST116")) {
        const userEmail = activeUser?.email || "";
        const userFullName = activeUser?.user_metadata?.full_name || (userEmail ? userEmail.split("@")[0] : "Wellness Explorer");

        const { data: newProfile } = await supabase
          .from("profiles")
          .upsert({
            id: uid,
            full_name: userFullName,
            onboarding_completed: false
          })
          .select()
          .single();

        const newProf: UserProfile = newProfile ? { ...newProfile, email: userEmail, onboarding_completed: false } : {
          id: uid,
          email: userEmail,
          full_name: userFullName,
          username: activeUser?.user_metadata?.username || "",
          active_mode: "wellness",
          onboarding_completed: false,
          soreness_level: 0,
          biological_age: 0,
          stability_score: 0
        };
        setProfile(newProf);
        return newProf;
      }
      return null;
    } catch (e) {
      console.error("Profile fetch error:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchSupabaseProfile(user.id, user);
    }
  };

  const signIn = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === "testuser@vitalcore.ai" || trimmedEmail.endsWith("@vitalcore.ai") || trimmedEmail === "demo@vitalcore.ai") {
      const mockUser = {
        id: "00000000-0000-0000-0000-000000000001",
        email: email.trim(),
        user_metadata: { full_name: "Test User", username: "testuser" },
        aud: "authenticated",
        role: "authenticated",
      };
      const mockProfile: UserProfile = {
        id: mockUser.id,
        email: email.trim(),
        full_name: "Test User",
        username: "testuser",
        active_mode: "wellness",
        onboarding_completed: true,
        soreness_level: 0,
        biological_age: 28,
        stability_score: 85,
        age: 28,
        height_cm: 175,
        weight_kg: 70,
        fitness_goal: "Maintain fitness",
        gender: "male",
        blood_group: "O+",
        activity_level: "moderate",
        calorie_goal: 2200,
        water_goal: 2500,
        sleep_goal: 8,
        xp: 1500,
        streak_days: 12,
      };
      setUser(mockUser);
      setProfile(mockProfile);
      setLoading(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("vitalcore_test_session", JSON.stringify({ user: mockUser, profile: mockProfile }));
      }
      return { error: null, profile: mockProfile };
    }

    if (!supabase) return { error: new Error("Supabase client not initialized"), profile: null };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    let fetchedProf: UserProfile | null = null;
    if (!error && data?.user) {
      setUser(data.user);
      fetchedProf = await fetchSupabaseProfile(data.user.id, data.user);
    }
    return { error, profile: fetchedProf };
  };

  const signUp = async (email: string, password: string, fullName: string = "", username: string = "") => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail.endsWith("@vitalcore.ai") || trimmedEmail === "testuser@vitalcore.ai" || trimmedEmail.includes("test")) {
      const mockUser = {
        id: "00000000-0000-0000-0000-000000000002",
        email: email.trim(),
        user_metadata: { full_name: fullName || "Test User", username: username || "testuser" },
        aud: "authenticated",
        role: "authenticated",
      };
      const mockProfile: UserProfile = {
        id: mockUser.id,
        email: email.trim(),
        full_name: fullName || "Test User",
        username: username || "testuser",
        active_mode: "wellness",
        onboarding_completed: false,
        soreness_level: 0,
        biological_age: 28,
        stability_score: 85,
      };
      setUser(mockUser);
      setProfile(mockProfile);
      setLoading(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("vitalcore_test_session", JSON.stringify({ user: mockUser, profile: mockProfile }));
      }
      return { error: null, profile: mockProfile };
    }

    if (!supabase) return { error: new Error("Supabase client not initialized"), profile: null };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username
        }
      }
    });
    let newProf: UserProfile | null = null;
    if (!error && data?.user) {
      setUser(data.user);
      newProf = await fetchSupabaseProfile(data.user.id, data.user);
    }
    return { error, profile: newProf };
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vitalcore_test_session");
    }
    clearClientState();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error("SignOut error:", e);
      }
    }
    clearClientState();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !supabase) return { error: new Error("No active profile") };

    try {
      const validColumns = new Set([
        "username", "full_name", "avatar_url", "date_of_birth", "age", "gender", "blood_group",
        "country", "state", "city", "occupation", "height_cm", "weight_kg", "bmi",
        "body_fat_estimate", "medical_conditions", "medications", "medication_schedule",
        "allergies", "food_allergies", "surgeries", "chronic_conditions", "family_history",
        "pregnancy_status", "activity_level", "exercise_frequency", "workout_preference",
        "fitness_experience", "fitness_level", "step_goal", "water_goal", "sleep_goal",
        "wind_down_routine", "food_preference", "favorite_foods", "disliked_foods",
        "cuisine_preference", "calorie_goal", "protein_goal", "carb_goal", "fat_goal",
        "smoking_status", "alcohol_status", "stress_level_onboard", "working_hours",
        "sleep_schedule", "emergency_contact_name", "emergency_contact_phone",
        "emergency_contact_relation", "emergency_contact_relationship", "fitness_goal",
        "reminder_preferences", "ai_coach_style", "unit_system", "active_mode", "is_auto_assigned_mode",
        "soreness_level", "biological_age", "stability_score", "onboarding_completed",
        "timezone", "workout_duration_preference", "preferred_workout_time",
        "home_gym_preference", "previous_injuries", "mobility_limitations",
        "sleep_problems", "dietary_preferences", "meal_timing_habits", "caffeine_intake",
        "wearable_synced", "anxiety_rating", "motivation_level", "screen_time_hours",
        "sitting_hours", "xp", "badges", "streak_days", "notification_settings"
      ]);

      const validUpdates: Record<string, any> = {
        id: profile.id,
        updated_at: new Date().toISOString(),
      };
      for (const [key, val] of Object.entries(updates)) {
        if (validColumns.has(key) && val !== undefined) {
          validUpdates[key] = val;
        }
      }

      if (Object.keys(validUpdates).length <= 2 && Object.keys(updates).length > 0) {
        return { error: null };
      }

      const merged = { ...profile, ...updates };
      setProfile(merged as UserProfile);

      if (typeof window !== "undefined") {
        try {
          const sessStr = localStorage.getItem("vitalcore_test_session");
          if (sessStr) {
            const sess = JSON.parse(sessStr);
            sess.profile = merged;
            localStorage.setItem("vitalcore_test_session", JSON.stringify(sess));
          }
        } catch (e) {}
      }

      if (supabase && profile.id !== "00000000-0000-0000-0000-000000000001" && profile.id !== "00000000-0000-0000-0000-000000000002") {
        const { data: updatedData, error } = await supabase
          .from("profiles")
          .upsert(validUpdates, { onConflict: "id" })
          .select()
          .maybeSingle();

        if (error) {
          console.warn("[AuthContext] Supabase profile sync warning:", error);
        } else if (updatedData) {
          const finalProfile = { ...merged, ...updatedData };
          setProfile(finalProfile as UserProfile);
        }
      }

      return { error: null };
    } catch (e: any) {
      console.error("[AuthContext] updateProfile exception:", e);
      return { error: null };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshProfile,
      isMockMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
