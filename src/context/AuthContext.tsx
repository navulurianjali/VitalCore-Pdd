"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  active_mode: "wellness" | "performance" | "elderly";
  onboarding_completed?: boolean;
  soreness_level: number;
  biological_age: number;
  stability_score: number;
  weight_kg?: number;
  height_cm?: number;
  fitness_goal?: string;
  
  // Comprehensive Health Profile Fields
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  country?: string;
  state?: string;
  city?: string;
  occupation?: string;

  medical_conditions?: string;
  medications?: string;
  medication_schedule?: string;
  allergies?: string;
  food_allergies?: string;
  surgeries?: string;
  chronic_conditions?: string;
  family_history?: string;
  pregnancy_status?: string;

  activity_level?: string;
  exercise_frequency?: string;
  workout_preference?: string;
  fitness_experience?: string;
  step_goal?: number;
  water_goal?: number;
  sleep_goal?: number;

  food_preference?: string;
  favorite_foods?: string[];
  disliked_foods?: string[];
  cuisine_preference?: string;
  calorie_goal?: number;
  protein_goal?: number;
  carb_goal?: number;
  fat_goal?: number;

  smoking_status?: string;
  alcohol_status?: string;
  stress_level_onboard?: number;
  working_hours?: string;
  sleep_schedule?: string;

  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;

  reminder_preferences?: string;
  notification_settings?: any;
  ai_coach_style?: string;
  unit_system?: string;
  
  screen_time_hours?: number;
  caffeine_intake?: string;
  sleep_problems?: boolean;
  
  bmi?: number;
  body_fat_estimate?: number;

  xp?: number;
  badges?: string[];
  streak_days?: number;
  age?: number;
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
