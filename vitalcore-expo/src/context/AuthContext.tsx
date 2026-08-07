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
        setProfile({
          ...data,
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
        'weight_kg', 'height_cm', 'fitness_goal', 'activity_level', 'active_mode',
        'soreness_level', 'biological_age', 'stability_score', 'onboarding_completed',
        'bmi', 'body_fat_estimate', 'occupation', 'timezone', 'fitness_level',
        'workout_duration_preference', 'preferred_workout_time', 'home_gym_preference',
        'previous_injuries', 'chronic_conditions', 'surgeries', 'mobility_limitations',
        'sleep_problems', 'dietary_preferences', 'disliked_foods', 'favorite_foods',
        'allergies', 'meal_timing_habits', 'caffeine_intake', 'wearable_synced',
        'anxiety_rating', 'motivation_level', 'stress_level_onboard',
        'screen_time_hours', 'sitting_hours', 'medical_conditions', 'medications',
        'food_preference', 'sleep_goal', 'calorie_goal', 'protein_goal', 'water_goal',
        'step_goal', 'carb_goal', 'fat_goal', 'country', 'state', 'city', 'blood_group'
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

      let { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[AuthContext WARNING] Full payload upsert failed, retrying with core columns:', error);
        
        // Fallback with minimal guaranteed columns
        const corePayload: Record<string, any> = {
          id: userId,
          full_name: updates.full_name || profile?.full_name || 'User',
          onboarding_completed: updates.onboarding_completed ?? true,
          updated_at: new Date().toISOString(),
        };
        if (updates.height_cm) corePayload.height_cm = updates.height_cm;
        if (updates.weight_kg) corePayload.weight_kg = updates.weight_kg;
        if (updates.fitness_goal) corePayload.fitness_goal = updates.fitness_goal;
        if (updates.activity_level) corePayload.activity_level = updates.activity_level;
        if (updates.bmi) corePayload.bmi = updates.bmi;
        if (payload.date_of_birth) corePayload.date_of_birth = payload.date_of_birth;

        const { error: coreError } = await supabase
          .from('profiles')
          .upsert(corePayload, { onConflict: 'id' });

        error = coreError;
      }

      if (error) {
        console.error('[AuthContext ERROR] Supabase profile upsert failed:', error);
      }

      console.log('[AuthContext] Updating local state synchronously...');
      setProfile((prev) => (prev ? { ...prev, ...updates } : ({ id: userId, ...updates } as UserProfile)));
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
