import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  User,
  Scale,
  Ruler,
  Target,
  Flame,
  Apple,
  Moon,
  Sun,
  Droplets,
  Dumbbell,
  Activity,
  Stethoscope,
  Pill,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Edit3,
} from 'lucide-react-native';

export default function OnboardingScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, profile, updateProfile, refetchProfile } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // STEP 1: Personal Information
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [age, setAge] = useState(profile?.age ? profile.age.toString() : '');
  const [gender, setGender] = useState(profile?.gender || '');

  // STEP 2: Body Information
  const [heightCm, setHeightCm] = useState(profile?.height_cm ? profile.height_cm.toString() : '');
  const [weightKg, setWeightKg] = useState(profile?.weight_kg ? profile.weight_kg.toString() : '');

  // Auto-calculated BMI
  const hM = (parseFloat(heightCm) || 0) / 100;
  const wK = parseFloat(weightKg) || 0;
  const bmiVal = hM > 0 && wK > 0 ? Math.round((wK / (hM * hM)) * 10) / 10 : 0;

  const getBmiCategory = (bmi: number) => {
    if (bmi <= 0) return { label: 'Enter metrics', color: '#94a3b8' };
    if (bmi < 18.5) return { label: 'Underweight', color: '#38bdf8' };
    if (bmi < 25) return { label: 'Healthy Weight', color: '#34d399' };
    if (bmi < 30) return { label: 'Overweight', color: '#fbbf24' };
    return { label: 'Obese', color: '#f87171' };
  };

  // STEP 3: Health Goals (Multi-Select)
  const [goals, setGoals] = useState<string[]>(profile?.fitness_goal ? profile.fitness_goal.split(', ') : []);
  const availableGoals = [
    { label: 'Weight Loss', icon: Flame, color: '#ef4444' },
    { label: 'Weight Gain', icon: Target, color: '#3b82f6' },
    { label: 'Muscle Gain', icon: Dumbbell, color: '#8b5cf6' },
    { label: 'Strength Building', icon: Activity, color: '#f59e0b' },
    { label: 'Healthy Lifestyle', icon: Heart, color: '#ec4899' },
    { label: 'Improve Sleep', icon: Moon, color: '#06b6d4' },
    { label: 'Better Nutrition', icon: Apple, color: '#10b981' },
    { label: 'Stay Active', icon: Sparkles, color: '#6366f1' },
  ];

  const toggleGoal = (g: string) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]));
  };

  // STEP 4: Food Preference
  const [foodPreference, setFoodPreference] = useState(profile?.food_preference || '');
  const foodOptions = [
    { label: 'Vegetarian', desc: 'Plant foods + dairy, no meat/egg' },
    { label: 'Non-Vegetarian', desc: 'Includes meat, poultry, fish & eggs' },
    { label: 'Vegan', desc: '100% plant-based, no animal products' },
    { label: 'Eggetarian', desc: 'Vegetarian diet + eggs included' },
    { label: 'No Preference', desc: 'Flexible dietary intake' },
  ];

  // STEP 5: Medical Info
  const [medicalConditions, setMedicalConditions] = useState(profile?.medical_conditions || '');
  const [medications, setMedications] = useState(profile?.medications || '');
  const [allergies, setAllergies] = useState(profile?.allergies || '');

  // STEP 6: Lifestyle
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || '');
  const [sleepDuration, setSleepDuration] = useState(profile?.sleep_goal ? profile.sleep_goal.toString() : '');
  const activityOptions = [
    { label: 'Sedentary', desc: 'Little or no exercise, desk job' },
    { label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
    { label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
    { label: 'Very Active', desc: 'Heavy exercise 6-7 days/week' },
  ];

  // STEP 7: Daily Targets (Calculated from user inputs)
  const [calorieGoal, setCalorieGoal] = useState(profile?.calorie_goal ? profile.calorie_goal.toString() : '');
  const [proteinGoal, setProteinGoal] = useState(profile?.protein_goal ? profile.protein_goal.toString() : '');
  const [waterGoal, setWaterGoal] = useState(profile?.water_goal ? profile.water_goal.toString() : '');
  const [stepGoal, setStepGoal] = useState(profile?.step_goal ? profile.step_goal.toString() : '');
  const [isEditingTargets, setIsEditingTargets] = useState(false);

  useEffect(() => {
    if (step === 7 && !calorieGoal) {
      const w = parseFloat(weightKg) || 68;
      const h = parseFloat(heightCm) || 170;
      const a = parseInt(age, 10) || 25;

      let bmr = 10 * w + 6.25 * h - 5 * a + (gender === 'female' ? -161 : 5);
      let mult = 1.375;
      if (activityLevel === 'Sedentary') mult = 1.2;
      if (activityLevel === 'Lightly Active') mult = 1.375;
      if (activityLevel === 'Moderately Active') mult = 1.55;
      if (activityLevel === 'Very Active') mult = 1.725;

      let calcCal = Math.round(bmr * mult);
      if (goals.includes('Weight Loss')) calcCal -= 400;
      else if (goals.includes('Weight Gain') || goals.includes('Muscle Gain')) calcCal += 300;
      calcCal = Math.max(1200, calcCal);

      let protFactor = 1.2;
      if (goals.includes('Muscle Gain') || goals.includes('Strength Building') || goals.includes('Weight Loss')) {
        protFactor = 1.8;
      }
      const calcProt = Math.round(w * protFactor);
      const calcWater = Math.round((w * 35) / 250) * 250;

      let calcSteps = 8000;
      if (activityLevel === 'Sedentary') calcSteps = 6000;
      if (activityLevel === 'Moderately Active') calcSteps = 10000;
      if (activityLevel === 'Very Active') calcSteps = 12000;

      setCalorieGoal(calcCal.toString());
      setProteinGoal(calcProt.toString());
      setWaterGoal(calcWater.toString());
      setStepGoal(calcSteps.toString());
    }
  }, [step]);

  const isStep1Valid = fullName.trim() !== '' && age.trim() !== '' && parseInt(age, 10) >= 5 && parseInt(age, 10) <= 120 && gender !== '';
  const isStep2Valid = heightCm.trim() !== '' && weightKg.trim() !== '' && parseFloat(heightCm) >= 50 && parseFloat(weightKg) >= 10;
  const isStep3Valid = goals.length > 0;
  const isStep4Valid = foodPreference !== '';
  const isStep5Valid = medicalConditions.trim() !== '';
  const isStep6Valid = activityLevel !== '' && sleepDuration.trim() !== '' && parseFloat(sleepDuration) > 0;
  const isStep7Valid = calorieGoal.trim() !== '' && proteinGoal.trim() !== '' && waterGoal.trim() !== '' && stepGoal.trim() !== '';

  const handleNextFromStep1 = () => {
    if (!isStep1Valid) {
      Alert.alert('Validation Required', 'Please enter a valid name, age (5-120), and select your biological sex.');
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!isStep2Valid) {
      Alert.alert('Validation Required', 'Please enter a valid height in cm (e.g. 175) and weight in kg (e.g. 70).');
      return;
    }
    setStep(3);
  };

  const handleFinishOnboarding = async () => {
    console.log('[ONBOARDING] Save & Get Started Pressed');

    if (loading) return;

    try {
      setLoading(true);

      const activeUserId = user?.id || profile?.id;
      if (!activeUserId) {
        Alert.alert('Session Error', 'No active user session found. Please log in again.');
        setLoading(false);
        return;
      }

      const w = isNaN(parseFloat(weightKg)) ? 70 : parseFloat(weightKg);
      const h = isNaN(parseFloat(heightCm)) ? 175 : parseFloat(heightCm);
      const a = isNaN(parseInt(age, 10)) ? 25 : parseInt(age, 10);
      const calTarget = isNaN(parseInt(calorieGoal, 10)) ? 2000 : parseInt(calorieGoal, 10);
      const protTarget = isNaN(parseInt(proteinGoal, 10)) ? 110 : parseInt(proteinGoal, 10);
      const waterTarget = isNaN(parseInt(waterGoal, 10)) ? 2500 : parseInt(waterGoal, 10);
      const stepTarget = isNaN(parseInt(stepGoal, 10)) ? 10000 : parseInt(stepGoal, 10);
      const safeBmi = isNaN(bmiVal) || bmiVal <= 0 ? 22.5 : bmiVal;

      const profileUpdates = {
        full_name: fullName.trim() || profile?.full_name || 'Wellness Explorer',
        age: a,
        gender: gender || 'male',
        weight_kg: w,
        height_cm: h,
        bmi: safeBmi,
        fitness_goal: goals.length > 0 ? goals.join(', ') : 'Healthy Lifestyle',
        food_preference: foodPreference || 'No Preference',
        dietary_preferences: foodPreference || 'No Preference',
        medical_conditions: medicalConditions.trim() || 'None',
        medications: medications.trim() || 'None',
        allergies: allergies.trim() || 'None',
        activity_level: activityLevel || 'Moderately Active',
        sleep_goal: isNaN(parseFloat(sleepDuration)) ? 8.0 : parseFloat(sleepDuration),
        calorie_goal: calTarget,
        protein_goal: protTarget,
        water_goal: waterTarget,
        step_goal: stepTarget,
        onboarding_completed: true,
      };

      console.log('[ONBOARDING] Sending profile updates:', profileUpdates);
      const { error: profileError } = await updateProfile(profileUpdates);

      if (profileError) {
        console.error('[ONBOARDING ERROR] Failed to save profile:', profileError);
        Alert.alert('Save Failed', profileError.message || 'Failed to save onboarding data. Please check connection and try again.');
        setLoading(false);
        return;
      }

      await refetchProfile();

      try {
        if (navigation && typeof navigation.reset === 'function') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        } else if (navigation && typeof navigation.navigate === 'function') {
          navigation.navigate('MainTabs');
        }
      } catch (navErr) {
        console.log('[ONBOARDING NAV] Stack updated automatically by AuthContext:', navErr);
      }
    } catch (e: any) {
      console.error('[CRITICAL ONBOARDING FAILURE]:', e);
      Alert.alert('Unexpected Error', e.message || 'An error occurred while completing onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const bmiCategory = getBmiCategory(bmiVal);
  const progressPercent = Math.round((step / 7) * 100);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Top Header & Progress Indicator */}
        <View style={[styles.headerBar, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.topRow}>
            {step > 1 ? (
              <TouchableOpacity style={[styles.iconBackButton, { backgroundColor: colors.surface }]} onPress={() => setStep(step - 1)}>
                <ArrowLeft size={20} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}

            <View style={[styles.stepBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.stepBadgeText, { color: colors.primary }]}>Step {step} of 7</Text>
            </View>

            <TouchableOpacity style={[styles.themeBtn, { backgroundColor: colors.surface }]} onPress={toggleTheme}>
              {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
            </TouchableOpacity>
          </View>

          {/* Animated Track */}
          <View style={[styles.progressTrackBg, { backgroundColor: colors.surface }]}>
            <View style={[styles.progressTrackFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <User size={24} color="#60a5fa" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Personal Details</Text>
                  <Text style={styles.stepSubtitle}>Let's start with your basic information.</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <User size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#64748b"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Age (years)</Text>
                <TextInput
                  style={[styles.textInputSolo, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder="e.g. 28"
                  placeholderTextColor={colors.textMuted}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Biological Sex / Gender</Text>
                <View style={styles.genderRow}>
                  {['male', 'female', 'other'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderCard,
                        gender === g && styles.genderCardActive,
                      ]}
                      onPress={() => setGender(g)}
                    >
                      <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                        {g === 'male' ? '♂️ Male' : g === 'female' ? '♀️ Female' : '⚧️ Other'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !isStep1Valid && styles.disabledBtn]}
                onPress={handleNextFromStep1}
                disabled={!isStep1Valid}
              >
                <Text style={styles.primaryBtnText}>Continue to Body Metrics</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Body Information */}
          {step === 2 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Scale size={24} color="#34d399" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Body Metrics</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Used for accurate macro & calorie target calculations.</Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Height (cm)</Text>
                  <View style={[styles.inputWithIcon, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    <Ruler size={18} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="175"
                      placeholderTextColor={colors.textMuted}
                      value={heightCm}
                      onChangeText={setHeightCm}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Weight (kg)</Text>
                  <View style={[styles.inputWithIcon, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    <Scale size={18} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="70"
                      placeholderTextColor={colors.textMuted}
                      value={weightKg}
                      onChangeText={setWeightKg}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Dynamic Live BMI Gauge Card */}
              <View style={styles.bmiPreviewCard}>
                <View style={styles.bmiHeader}>
                  <Text style={styles.bmiTitle}>Body Mass Index (BMI)</Text>
                  <View style={[styles.bmiBadge, { backgroundColor: `${bmiCategory.color}22` }]}>
                    <Text style={[styles.bmiBadgeText, { color: bmiCategory.color }]}>
                      {bmiCategory.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bmiScoreText}>{bmiVal > 0 ? bmiVal : '--'}</Text>
                <Text style={styles.bmiNote}>
                  Auto-calculated using standard clinical BMI reference parameters.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !isStep2Valid && styles.disabledBtn]}
                onPress={handleNextFromStep2}
                disabled={!isStep2Valid}
              >
                <Text style={styles.primaryBtnText}>Continue to Health Goals</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Health Goals */}
          {step === 3 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Target size={24} color="#f87171" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Health Goals</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Select all targets you want VitaCore AI to optimize.</Text>
                </View>
              </View>

              <View style={styles.goalsGrid}>
                {availableGoals.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = goals.includes(item.label);

                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.goalCard,
                        isSelected && { borderColor: item.color, backgroundColor: `${item.color}15` },
                      ]}
                      onPress={() => toggleGoal(item.label)}
                    >
                      <View style={[styles.goalIconCircle, { backgroundColor: `${item.color}22` }]}>
                        <IconComp size={20} color={item.color} />
                      </View>
                      <Text style={[styles.goalText, { color: colors.text }]}>{item.label}</Text>
                      {isSelected && (
                        <CheckCircle2 size={16} color={item.color} style={styles.checkPos} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !isStep3Valid && styles.disabledBtn]}
                onPress={() => setStep(4)}
                disabled={!isStep3Valid}
              >
                <Text style={styles.primaryBtnText}>Continue to Nutrition</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: Dietary Preferences */}
          {step === 4 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Apple size={24} color="#34d399" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Food & Diet Preference</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Guides AI meal suggestions and macro distributions.</Text>
                </View>
              </View>

              <View style={styles.radioList}>
                {foodOptions.map((option) => {
                  const isSelected = foodPreference === option.label;
                  return (
                    <TouchableOpacity
                      key={option.label}
                      style={[styles.radioCard, isSelected && styles.radioCardActive]}
                      onPress={() => setFoodPreference(option.label)}
                    >
                      <View style={styles.radioLeft}>
                        <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <View>
                          <Text style={[styles.radioTitle, { color: colors.text }]}>{option.label}</Text>
                          <Text style={[styles.radioSub, { color: colors.textMuted }]}>{option.desc}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !isStep4Valid && styles.disabledBtn]}
                onPress={() => setStep(5)}
                disabled={!isStep4Valid}
              >
                <Text style={styles.primaryBtnText}>Continue to Medical Info</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 5: Medical Information */}
          {step === 5 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Stethoscope size={24} color="#a78bfa" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Medical History</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Optional details for safety & personalized AI guardrails.</Text>
                </View>
              </View>

              {/* Quick condition chips */}
              <Text style={[styles.label, { color: colors.text }]}>Quick Add Medical Conditions</Text>
              <View style={styles.chipRow}>
                {['Diabetes', 'Hypertension', 'Asthma', 'Thyroid', 'PCOS', 'None'].map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={styles.chipItem}
                    onPress={() => {
                      if (chip === 'None') setMedicalConditions('None');
                      else {
                        const current = medicalConditions ? medicalConditions.split(', ') : [];
                        if (!current.includes(chip)) setMedicalConditions([...current, chip].join(', '));
                      }
                    }}
                  >
                    <Text style={[styles.chipText, { color: colors.text }]}>+ {chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Existing Medical Conditions</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Stethoscope size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="e.g. Hypertension, Asthma, or None"
                    placeholderTextColor={colors.textMuted}
                    value={medicalConditions}
                    onChangeText={setMedicalConditions}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Current Medications</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Pill size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="e.g. Metformin 500mg, Vitamin D, or None"
                    placeholderTextColor={colors.textMuted}
                    value={medications}
                    onChangeText={setMedications}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Food or Drug Allergies</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <AlertTriangle size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="e.g. Peanuts, Penicillin, Lactose, or None"
                    placeholderTextColor={colors.textMuted}
                    value={allergies}
                    onChangeText={setAllergies}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !isStep5Valid && styles.disabledBtn]}
                onPress={() => setStep(6)}
                disabled={!isStep5Valid}
              >
                <Text style={styles.primaryBtnText}>Continue to Lifestyle</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 6: Lifestyle & Activity */}
          {step === 6 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Activity size={24} color="#fbbf24" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Lifestyle & Activity</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Determines your baseline daily energy expenditure.</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Physical Activity Level</Text>
                <View style={styles.radioList}>
                  {activityOptions.map((act) => {
                    const isSelected = activityLevel === act.label;
                    return (
                      <TouchableOpacity
                        key={act.label}
                        style={[styles.radioCard, isSelected && styles.radioCardActive]}
                        onPress={() => setActivityLevel(act.label)}
                      >
                        <View style={styles.radioLeft}>
                          <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <View>
                            <Text style={[styles.radioTitle, { color: colors.text }]}>{act.label}</Text>
                            <Text style={[styles.radioSub, { color: colors.textMuted }]}>{act.desc}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Average Daily Sleep (hours)</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Moon size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="7.5"
                    placeholderTextColor={colors.textMuted}
                    value={sleepDuration}
                    onChangeText={setSleepDuration}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !isStep6Valid && styles.disabledBtn]}
                onPress={() => setStep(7)}
                disabled={!isStep6Valid}
              >
                <Text style={styles.primaryBtnText}>Calculate Daily Targets</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 7: Target Review & Confirmation */}
          {step === 7 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Sparkles size={24} color="#60a5fa" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Calculated Health Targets</Text>
                  <Text style={styles.stepSubtitle}>
                    Personalized targets calculated via Mifflin-St Jeor formula.
                  </Text>
                </View>
              </View>

              <View style={styles.targetsGrid}>
                <View style={[styles.targetCard, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                  <Flame size={20} color="#ef4444" />
                  <Text style={styles.targetLabel}>Calories</Text>
                  {isEditingTargets ? (
                    <TextInput
                      style={styles.targetEditInput}
                      value={calorieGoal}
                      onChangeText={setCalorieGoal}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.targetValue}>{calorieGoal} kcal</Text>
                  )}
                </View>

                <View style={[styles.targetCard, { borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
                  <Dumbbell size={20} color="#8b5cf6" />
                  <Text style={styles.targetLabel}>Protein</Text>
                  {isEditingTargets ? (
                    <TextInput
                      style={styles.targetEditInput}
                      value={proteinGoal}
                      onChangeText={setProteinGoal}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.targetValue}>{proteinGoal} g</Text>
                  )}
                </View>

                <View style={[styles.targetCard, { borderColor: 'rgba(6, 182, 212, 0.3)' }]}>
                  <Droplets size={20} color="#06b6d4" />
                  <Text style={styles.targetLabel}>Water</Text>
                  {isEditingTargets ? (
                    <TextInput
                      style={styles.targetEditInput}
                      value={waterGoal}
                      onChangeText={setWaterGoal}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.targetValue}>{waterGoal} ml</Text>
                  )}
                </View>

                <View style={[styles.targetCard, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                  <Activity size={20} color="#10b981" />
                  <Text style={styles.targetLabel}>Steps</Text>
                  {isEditingTargets ? (
                    <TextInput
                      style={styles.targetEditInput}
                      value={stepGoal}
                      onChangeText={setStepGoal}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.targetValue}>{stepGoal} steps</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.toggleEditBtn}
                onPress={() => setIsEditingTargets(!isEditingTargets)}
              >
                <Edit3 size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                <Text style={styles.toggleEditText}>
                  {isEditingTargets ? 'Lock Calculated Targets' : 'Customize Daily Targets'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.disabledBtn]}
                onPress={handleFinishOnboarding}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.saveBtnText}>Save & Get Started</Text>
                    <CheckCircle2 size={22} color="#ffffff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  stepBadgeText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '700',
  },
  percentText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrackBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  progressTrackFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  scrollContent: {
    padding: 20,
  },
  stepCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  textInputSolo: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  genderCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  genderText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bmiPreviewCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    marginTop: 4,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bmiTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  bmiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bmiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bmiScoreText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  bmiNote: {
    fontSize: 12,
    color: '#64748b',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  goalCard: {
    width: '48%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    position: 'relative',
  },
  goalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkPos: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  radioList: {
    gap: 10,
    marginBottom: 16,
  },
  radioCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  radioCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  radioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioOuterActive: {
    borderColor: '#3b82f6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  radioTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  radioSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chipItem: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
  },
  targetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  targetCard: {
    width: '48%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  targetLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 6,
  },
  targetValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 4,
  },
  targetEditInput: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  toggleEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 16,
  },
  toggleEditText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
