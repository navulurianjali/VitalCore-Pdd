import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  active_mode: 'wellness' | 'performance' | 'elderly';
  onboarding_completed?: boolean;
  soreness_level: number;
  biological_age: number;
  stability_score: number;
  weight_kg?: number;
  height_cm?: number;
  fitness_goal?: string;
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

  // Comprehensive Health Profile Fields
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  country?: string;
  state?: string;
  city?: string;
  medical_conditions?: string;
  medications?: string;
  medication_schedule?: string;
  food_allergies?: string;
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
  cuisine_preference?: string;
  calorie_goal?: number;
  protein_goal?: number;
  carb_goal?: number;
  fat_goal?: number;
  smoking_status?: string;
  alcohol_status?: string;
  working_hours?: string;
  sleep_schedule?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  reminder_preferences?: string;
  notification_settings?: any;
  ai_coach_style?: string;
  unit_system?: string;
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
  signUp: (email: string, password: string, fullName: string, username: string, dateOfBirth: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refetchProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSupabaseProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (data && !error) {
        let ageVal = data.age;
        if (!ageVal && data.date_of_birth) {
          const dobYear = new Date(data.date_of_birth).getFullYear();
          if (!isNaN(dobYear)) {
            ageVal = new Date().getFullYear() - dobYear;
          }
        }
        const isCompleted = data.onboarding_completed === true || Boolean(data.age || data.weight_kg || data.height_cm || data.fitness_goal || data.gender || data.medical_conditions);
        setProfile({
          ...data,
          onboarding_completed: isCompleted,
          age: ageVal,
        } as UserProfile);
      } else if (error && error.code === 'PGRST116') {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const email = authData.user.email || '';
          const fullName = authData.user.user_metadata?.full_name || 'User';
          const username = authData.user.user_metadata?.username || `user_${uid.substring(0, 6)}`;
          const dob = authData.user.user_metadata?.date_of_birth || null;

          const newProfile = {
            id: uid,
            full_name: fullName,
            username: username,
            date_of_birth: dob,
            active_mode: 'wellness' as const,
            onboarding_completed: false,
            soreness_level: 0,
            biological_age: 30,
            stability_score: 100,
          };
          const { data: newDbProfile, error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (newDbProfile && !insertError) {
            setProfile(newDbProfile as UserProfile);
          }
        }
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const refetchProfile = async () => {
    if (user?.id) {
      await fetchSupabaseProfile(user.id);
    }
  };

  const refreshProfile = refetchProfile;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchSupabaseProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
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
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, username: string, dateOfBirth: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
          date_of_birth: dateOfBirth,
        },
      },
    });

    if (data?.user && !error) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        username: username,
        date_of_birth: dateOfBirth,
        active_mode: 'wellness',
        onboarding_completed: false,
      });
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('[AuthContext] Supabase signOut error:', e);
    } finally {
      setUser(null);
      setProfile(null);
      try {
        await AsyncStorage.clear();
      } catch (err) {
        console.error('[AuthContext] AsyncStorage clear error:', err);
      }
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const userId = profile?.id || user?.id;
    if (!userId) {
      console.error('[AuthContext] Cannot update profile: No user session active.');
      return { error: new Error('No user session active. Please log in again.') };
    }

    try {
      console.log(`[AuthContext] Updating profile for user: ${userId}`, updates);

      const validDbColumns = new Set([
        'id', 'updated_at', 'username', 'full_name', 'avatar_url', 'date_of_birth', 'gender',
        'blood_group', 'country', 'state', 'city', 'occupation', 'height_cm', 'weight_kg', 'bmi',
        'body_fat_estimate', 'medical_conditions', 'medications', 'medication_schedule',
        'allergies', 'food_allergies', 'surgeries', 'chronic_conditions', 'family_history',
        'pregnancy_status', 'activity_level', 'exercise_frequency', 'workout_preference',
        'fitness_experience', 'fitness_level', 'step_goal', 'water_goal', 'sleep_goal',
        'wind_down_routine', 'food_preference', 'favorite_foods', 'disliked_foods',
        'cuisine_preference', 'calorie_goal', 'protein_goal', 'carb_goal', 'fat_goal',
        'smoking_status', 'alcohol_status', 'stress_level_onboard', 'working_hours',
        'sleep_schedule', 'emergency_contact_name', 'emergency_contact_phone',
        'emergency_contact_relation', 'emergency_contact_relationship', 'fitness_goal',
        'reminder_preferences', 'ai_coach_style', 'unit_system', 'active_mode',
        'soreness_level', 'biological_age', 'stability_score', 'onboarding_completed',
        'timezone', 'workout_duration_preference', 'preferred_workout_time',
        'home_gym_preference', 'previous_injuries', 'mobility_limitations',
        'sleep_problems', 'dietary_preferences', 'meal_timing_habits', 'caffeine_intake',
        'wearable_synced', 'anxiety_rating', 'motivation_level', 'screen_time_hours', 'sitting_hours'
      ]);

      const payload: Record<string, any> = {
        id: userId,
        updated_at: new Date().toISOString(),
      };

      if (updates.age && typeof updates.age === 'number' && !updates.date_of_birth) {
        const birthYear = new Date().getFullYear() - updates.age;
        payload.date_of_birth = `${birthYear}-01-01`;
      }

      for (const [key, val] of Object.entries(updates)) {
        if (validDbColumns.has(key) && val !== undefined) {
          payload[key] = val;
        }
      }

      if (Object.keys(payload).length <= 2 && payload.id && payload.updated_at && Object.keys(updates).length > 0) {
        console.warn('[AuthContext] No valid columns passed in updates payload.');
        return { error: null };
      }

      console.log(`[AuthContext] Executing Supabase profile upsert for ${userId}...`, payload);

      const { data: updatedData, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (error) {
        console.error('[AuthContext ERROR] Supabase profile upsert failed:', error);
        return { error };
      }

      console.log('[AuthContext] Profile upsert succeeded! Updating local state and re-fetching profile...');
      const merged = updatedData ? { ...profile, ...updatedData } : { ...profile, ...payload };
      setProfile(merged as UserProfile);
      await fetchSupabaseProfile(userId);
      return { error: null };
    } catch (e: any) {
      console.error('[AuthContext EXCEPTION] updateProfile failed:', e);
      return { error: e };
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refetchProfile,
        refreshProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
