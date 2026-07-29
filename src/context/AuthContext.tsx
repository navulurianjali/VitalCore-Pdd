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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isMockMode = false;

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          fetchSupabaseProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser(session.user);
          fetchSupabaseProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
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

  const fetchSupabaseProfile = async (uid: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (!error && data) {
        setProfile({
          ...data,
          email: user?.email || "",
          onboarding_completed: data.onboarding_completed === true,
          soreness_level: Number(data.soreness_level) || 0,
          biological_age: Number(data.biological_age) || 25,
          stability_score: Number(data.stability_score) || 100
        });
      } else {
        // If profile doesn't exist yet, insert basic profile for new user with onboarding_completed: false
        const { data: newProfile } = await supabase
          .from("profiles")
          .upsert({
            id: uid,
            full_name: user?.user_metadata?.full_name || "Wellness Explorer",
            onboarding_completed: false
          })
          .select()
          .single();

        setProfile(newProfile ? { ...newProfile, onboarding_completed: false } : {
          id: uid,
          email: user?.email || "",
          full_name: user?.user_metadata?.full_name || "Wellness Explorer",
          username: user?.user_metadata?.username || "",
          active_mode: "wellness",
          onboarding_completed: false,
          soreness_level: 0,
          biological_age: 25,
          stability_score: 100
        });
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchSupabaseProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error("Supabase client not initialized") };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data?.user) {
      setUser(data.user);
      await fetchSupabaseProfile(data.user.id);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    if (!supabase) return { error: new Error("Supabase client not initialized") };
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
    if (!error && data?.user) {
      setUser(data.user);
      await fetchSupabaseProfile(data.user.id);
    }
    return { error };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !supabase) return { error: new Error("No active profile") };

    try {
      const validColumns = new Set([
        "username", "full_name", "avatar_url", "date_of_birth", "gender",
        "weight_kg", "height_cm", "fitness_goal", "activity_level", "active_mode",
        "soreness_level", "biological_age", "stability_score", "onboarding_completed",
        "bmi", "body_fat_estimate", "occupation", "timezone", "fitness_level",
        "workout_duration_preference", "preferred_workout_time", "home_gym_preference",
        "previous_injuries", "chronic_conditions", "surgeries", "mobility_limitations",
        "sleep_problems", "dietary_preferences", "disliked_foods", "favorite_foods",
        "allergies", "meal_timing_habits", "caffeine_intake", "wearable_synced",
        "anxiety_rating", "motivation_level", "stress_level_onboard",
        "screen_time_hours", "sitting_hours", "updated_at"
      ]);

      const validUpdates: Record<string, any> = {};
      for (const [key, val] of Object.entries(updates)) {
        if (validColumns.has(key)) {
          validUpdates[key] = val;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update(validUpdates)
        .eq("id", profile.id);

      if (!error) {
        setProfile({ ...profile, ...updates });
        return { error: null };
      }
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile, refreshProfile, isMockMode }}>
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
