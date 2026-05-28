"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

interface UserProfile {
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
  
  // Onboarding metadata parameters
  bmi?: number;
  body_fat_estimate?: number;
  occupation?: string;
  timezone?: string;
  fitness_level?: string;
  workout_duration_preference?: number;
  preferred_workout_time?: string;
  home_gym_preference?: string;
  previous_injuries?: string;
  chronic_conditions?: string;
  surgeries?: string;
  mobility_limitations?: string;
  sleep_problems?: boolean;
  dietary_preferences?: string;
  disliked_foods?: string[];
  favorite_foods?: string[];
  allergies?: string;
  meal_timing_habits?: string;
  caffeine_intake?: string;
  wearable_synced?: boolean;
  anxiety_rating?: number;
  motivation_level?: number;
  stress_level_onboard?: number;
  screen_time_hours?: number;
  sitting_hours?: number;
}

interface AuthContextProps {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isMockMode = false; // Supabase is now exclusively active

  useEffect(() => {
    if (supabase) {
      // Supabase Active mode listener
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
      if (data && !error) {
        setProfile(data as UserProfile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      setUser(data.user);
      return { error: null };
    }
    return { error: new Error("Supabase client is not initialized.") };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    username: string
  ): Promise<{ error: Error | null }> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
        },
      });
      if (error) return { error };
      
      // Explicitly insert into profiles table to guarantee instant profile creation
      if (data.user) {
        const newProfile = {
          id: data.user.id,
          email: email,
          full_name: fullName,
          username: username,
          active_mode: "wellness" as const,
          onboarding_completed: false,
          soreness_level: 0,
          biological_age: 28.5,
          stability_score: 95.0,
        };
        const { error: profileError } = await supabase.from("profiles").insert(newProfile);
        if (profileError) {
          console.error("Error creating user profile:", profileError);
        } else {
          setProfile(newProfile);
        }
      }
      
      setUser(data.user);
      return { error: null };
    }
    return { error: new Error("Supabase client is not initialized.") };
  };

  const signOut = async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    if (!profile) return { error: new Error("No active session profile found.") };

    if (supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)
        .select()
        .single();
      
      if (error) return { error };
      setProfile(data as UserProfile);
      return { error: null };
    }
    return { error: new Error("Supabase client is not initialized.") };
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile, isMockMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

