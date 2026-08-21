import React, { useState, useEffect, useMemo } from 'react';
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
import { CustomTextInput } from '../../components/CustomTextInput';
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
  Search,
  Check,
  ShieldCheck,
} from 'lucide-react-native';

export const COMMON_MEDICAL_CONDITIONS = [
  "None",
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Arthritis",
  "High Cholesterol",
  "Thyroid Disorder",
  "Obesity",
  "Osteoporosis",
  "Kidney Disease",
  "Liver Disease",
  "PCOS",
  "Depression",
  "Anxiety",
  "Sleep Apnea",
  "Back Pain",
  "Knee Pain",
  "Pregnancy",
  "Other"
];

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

  // STEP 5: Medical Info (Searchable Multi-Select)
  const [selectedMedicalConditions, setSelectedMedicalConditions] = useState<string[]>(["None"]);
  const [medicalSearchQuery, setMedicalSearchQuery] = useState('');
  const [customOtherCondition, setCustomOtherCondition] = useState('');
  const [medications, setMedications] = useState(profile?.medications || '');
  const [allergies, setAllergies] = useState(profile?.allergies || '');

  const filteredMedicalOptions = useMemo(() => {
    if (!medicalSearchQuery.trim()) return COMMON_MEDICAL_CONDITIONS;
    return COMMON_MEDICAL_CONDITIONS.filter(c => c.toLowerCase().includes(medicalSearchQuery.toLowerCase().trim()));
  }, [medicalSearchQuery]);

  const toggleMedicalCondition = (cond: string) => {
    if (cond === "None") {
      setSelectedMedicalConditions(["None"]);
      setCustomOtherCondition('');
      return;
    }

    setSelectedMedicalConditions(prev => {
      const withoutNone = prev.filter(c => c !== "None");
      if (withoutNone.includes(cond)) {
        const next = withoutNone.filter(c => c !== cond);
        return next.length === 0 ? ["None"] : next;
      } else {
        return [...withoutNone, cond];
      }
    });
  };

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
  const isStep5Valid = selectedMedicalConditions.length > 0;
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

  const handleCompleteOnboarding = async () => {
    if (!isStep7Valid) {
      Alert.alert('Validation Required', 'Please ensure all daily health targets are non-empty numbers.');
      return;
    }

    setLoading(true);
    try {
      const a = parseInt(age, 10);
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm);

      const isElderlyAuto = a >= 60;
      const assignedMode: 'wellness' | 'elderly' = isElderlyAuto ? 'elderly' : 'wellness';

      const finalMedicalArray = selectedMedicalConditions.filter(c => c !== "Other");
      if (selectedMedicalConditions.includes("Other") && customOtherCondition.trim()) {
        finalMedicalArray.push(`Other: ${customOtherCondition.trim()}`);
      }
      const medicalConditionsString = finalMedicalArray.join(", ");

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
        medical_conditions: medicalConditionsString,
        medications: medications.trim() || 'None',
        allergies: allergies.trim() || 'None',
        activity_level: activityLevel || 'Moderately Active',
        sleep_goal: isNaN(parseFloat(sleepDuration)) ? 8.0 : parseFloat(sleepDuration),
        calorie_goal: calTarget,
        protein_goal: protTarget,
        water_goal: waterTarget,
        step_goal: stepTarget,
        active_mode: assignedMode,
        is_auto_assigned_mode: isElderlyAuto,
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

            <View style={styles.badgeStep}>
              <Text style={[styles.badgeStepText, { color: colors.primary }]}>Step {step} of 7</Text>
            </View>

            <TouchableOpacity style={[styles.iconBackButton, { backgroundColor: colors.surface }]} onPress={toggleTheme}>
              {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
            </TouchableOpacity>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: colors.surface }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* STEP 1: Personal Profile */}
          {step === 1 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <User size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Personal Profile</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Let us personalize your preventive care protocol.</Text>
                </View>
              </View>

              <CustomTextInput
                testID="onboarding_name_input"
                accessibilityLabel="onboarding_name_input"
                label="Full Name *"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                leftIcon={<User size={18} color={colors.textMuted} />}
                containerStyle={styles.inputGroup}
              />

              <CustomTextInput
                testID="onboarding_age_input"
                accessibilityLabel="onboarding_age_input"
                label="Age (Years) *"
                placeholder="e.g. 28"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                leftIcon={<Activity size={18} color={colors.textMuted} />}
                containerStyle={styles.inputGroup}
              />
              {age.trim() !== '' && parseInt(age, 10) >= 60 && (
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary, marginTop: -6, marginBottom: 12 }}>
                  👵 Elderly Mode will be auto-assigned upon setup.
                </Text>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Biological Sex *</Text>
                <View style={styles.genderRow}>
                  {['male', 'female', 'other'].map((g) => {
                    const isSelected = gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        testID={`onboarding_gender_${g}`}
                        accessibilityLabel={`onboarding_gender_${g}`}
                        style={[
                          styles.genderBtn,
                          {
                            backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.cardBorder,
                          },
                        ]}
                        onPress={() => setGender(g)}
                      >
                        <Text style={[styles.genderText, { color: isSelected ? colors.primary : colors.text }]}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                testID="onboarding_step1_next"
                accessibilityLabel="onboarding_step1_next"
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, !isStep1Valid && styles.disabledBtn]}
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
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Scale size={24} color="#60a5fa" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Body Metrics & BMI</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Used to calculate BMR and energy baselines.</Text>
                </View>
              </View>

              <CustomTextInput
                testID="onboarding_height_input"
                accessibilityLabel="onboarding_height_input"
                label="Height (cm) *"
                placeholder="e.g. 175"
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                leftIcon={<Ruler size={18} color={colors.textMuted} />}
                containerStyle={styles.inputGroup}
              />

              <CustomTextInput
                testID="onboarding_weight_input"
                accessibilityLabel="onboarding_weight_input"
                label="Weight (kg) *"
                placeholder="e.g. 70"
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="numeric"
                leftIcon={<Scale size={18} color={colors.textMuted} />}
                containerStyle={styles.inputGroup}
              />

              {bmiVal > 0 && (
                <View testID="onboarding_bmi_box" accessibilityLabel="onboarding_bmi_box" style={[styles.bmiBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bmiLabel, { color: colors.textMuted }]}>Calculated BMI</Text>
                    <Text style={[styles.bmiValue, { color: colors.text }]}>{bmiVal} <Text style={{ fontSize: 13, fontWeight: 'normal' }}>kg/m²</Text></Text>
                  </View>
                  <View style={[styles.bmiTag, { backgroundColor: bmiCategory.color + '22', borderColor: bmiCategory.color }]}>
                    <Text style={[styles.bmiTagText, { color: bmiCategory.color }]}>{bmiCategory.label}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                testID="onboarding_step2_next"
                accessibilityLabel="onboarding_step2_next"
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, !isStep2Valid && styles.disabledBtn]}
                onPress={handleNextFromStep2}
                disabled={!isStep2Valid}
              >
                <Text style={styles.primaryBtnText}>Continue to Goals</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Primary Health Goals */}
          {step === 3 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Target size={24} color="#f87171" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Primary Health Goals</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Select one or more objectives.</Text>
                </View>
              </View>

              <View style={styles.gridGoals}>
                {availableGoals.map((g, idx) => {
                  const isSelected = goals.includes(g.label);
                  const IconComp = g.icon;
                  return (
                    <TouchableOpacity
                      key={g.label}
                      testID={`onboarding_goal_${idx}`}
                      accessibilityLabel={`onboarding_goal_${idx}`}
                      style={[
                        styles.goalCard,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.cardBorder,
                        },
                      ]}
                      onPress={() => toggleGoal(g.label)}
                    >
                      <IconComp size={20} color={isSelected ? colors.primary : g.color} />
                      <Text style={[styles.goalText, { color: isSelected ? colors.primary : colors.text }]}>{g.label}</Text>
                      {isSelected && <CheckCircle2 size={16} color={colors.primary} style={styles.goalCheck} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                testID="onboarding_step3_next"
                accessibilityLabel="onboarding_step3_next"
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, !isStep3Valid && styles.disabledBtn]}
                onPress={() => setStep(4)}
                disabled={!isStep3Valid}
              >
                <Text style={styles.primaryBtnText}>Continue to Nutrition</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: Food Preference */}
          {step === 4 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Apple size={24} color="#34d399" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Dietary Preferences</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Helps AI tailor personalized food recommendations.</Text>
                </View>
              </View>

              <View style={styles.radioList}>
                {foodOptions.map((opt, idx) => {
                  const isSelected = foodPreference === opt.label;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      testID={`onboarding_food_${idx}`}
                      accessibilityLabel={`onboarding_food_${idx}`}
                      style={[
                        styles.radioCard,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.cardBorder,
                        },
                      ]}
                      onPress={() => setFoodPreference(opt.label)}
                    >
                      <View style={styles.radioLeft}>
                        <View
                          style={[
                            styles.radioOuter,
                            { borderColor: isSelected ? colors.primary : colors.textMuted },
                          ]}
                        >
                          {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                        </View>
                        <View>
                          <Text style={[styles.radioTitle, { color: colors.text }]}>{opt.label}</Text>
                          <Text style={[styles.radioSub, { color: colors.textMuted }]}>{opt.desc}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                testID="onboarding_step4_next"
                accessibilityLabel="onboarding_step4_next"
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, !isStep4Valid && styles.disabledBtn]}
                onPress={() => setStep(5)}
                disabled={!isStep4Valid}
              >
                <Text style={styles.primaryBtnText}>Continue to Medical History</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 5: Medical History (Searchable Multi-Select) */}
          {step === 5 && (
            <View style={[styles.stepCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Stethoscope size={24} color="#a78bfa" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Medical History</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Select all existing medical conditions that apply.</Text>
                </View>
              </View>

              {/* Search Box */}
              <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search conditions..."
                  placeholderTextColor={colors.textMuted}
                  value={medicalSearchQuery}
                  onChangeText={setMedicalSearchQuery}
                />
              </View>

              {/* Conditions Chip Grid */}
              <View style={styles.chipGrid}>
                {filteredMedicalOptions.map((chip, idx) => {
                  const isSelected = selectedMedicalConditions.includes(chip);
                  return (
                    <TouchableOpacity
                      key={chip}
                      testID={`onboarding_med_${idx}`}
                      accessibilityLabel={`onboarding_med_${idx}`}
                      style={[
                        styles.medicalChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.cardBorder,
                        },
                      ]}
                      onPress={() => toggleMedicalCondition(chip)}
                    >
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: isSelected ? '#ffffff' : colors.text }}>
                        {isSelected ? `✓ ${chip}` : `+ ${chip}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedMedicalConditions.includes("Other") && (
                <CustomTextInput
                  label="Specify Other Condition"
                  placeholder="e.g. Chronic Migraines, Vertigo"
                  value={customOtherCondition}
                  onChangeText={setCustomOtherCondition}
                  leftIcon={<Stethoscope size={18} color={colors.textMuted} />}
                  containerStyle={styles.inputGroup}
                />
              )}

              <CustomTextInput
                testID="onboarding_medications_input"
                accessibilityLabel="onboarding_medications_input"
                label="Current Medications"
                placeholder="e.g. Metformin 500mg, Vitamin D, or None"
                value={medications}
                onChangeText={setMedications}
                leftIcon={<Pill size={18} color={colors.textMuted} />}
                containerStyle={styles.inputGroup}
              />

              <CustomTextInput
                testID="onboarding_allergies_input"
                accessibilityLabel="onboarding_allergies_input"
                label="Food or Drug Allergies"
                placeholder="e.g. Peanuts, Penicillin, Lactose, or None"
                value={allergies}
                onChangeText={setAllergies}
                leftIcon={<AlertTriangle size={18} color={colors.textMuted} />}
                containerStyle={styles.inputGroup}
              />

              <TouchableOpacity
                testID="onboarding_step5_next"
                accessibilityLabel="onboarding_step5_next"
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, !isStep5Valid && styles.disabledBtn]}
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
                  {activityOptions.map((act, idx) => {
                    const isSelected = activityLevel === act.label;
                    return (
                      <TouchableOpacity
                        key={act.label}
                        testID={`onboarding_activity_${idx}`}
                        accessibilityLabel={`onboarding_activity_${idx}`}
                        style={[
                          styles.radioCard,
                          {
                            backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.cardBorder,
                          },
                        ]}
                        onPress={() => setActivityLevel(act.label)}
                      >
                        <View style={styles.radioLeft}>
                          <View
                            style={[
                              styles.radioOuter,
                              { borderColor: isSelected ? colors.primary : colors.textMuted },
                            ]}
                          >
                            {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
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

              <CustomTextInput
                testID="onboarding_sleep_input"
                accessibilityLabel="onboarding_sleep_input"
                label="Average Daily Sleep (hours)"
                placeholder="7.5"
                value={sleepDuration}
                onChangeText={setSleepDuration}
                keyboardType="numeric"
                leftIcon={<Moon size={18} color={colors.textMuted} />}
                containerStyle={styles.inputGroup}
              />

              <TouchableOpacity
                testID="onboarding_step6_next"
                accessibilityLabel="onboarding_step6_next"
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, !isStep6Valid && styles.disabledBtn]}
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
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Calculated Health Targets</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
                    Personalized targets calculated via Mifflin-St Jeor formula.
                  </Text>
                </View>
              </View>

              <View style={styles.targetsGrid}>
                <View style={[styles.targetCard, { backgroundColor: colors.surface, borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                  <Flame size={20} color="#ef4444" />
                  <Text style={[styles.targetLabel, { color: colors.textMuted }]}>Calories</Text>
                  {isEditingTargets ? (
                    <CustomTextInput
                      testID="onboarding_cal_input"
                      accessibilityLabel="onboarding_cal_input"
                      value={calorieGoal}
                      onChangeText={setCalorieGoal}
                      keyboardType="numeric"
                      height={36}
                      inputStyle={{ textAlign: 'center', fontSize: 13 }}
                    />
                  ) : (
                    <Text testID="onboarding_cal_display" accessibilityLabel="onboarding_cal_display" style={[styles.targetValue, { color: colors.text }]}>{calorieGoal} kcal</Text>
                  )}
                </View>

                <View style={[styles.targetCard, { backgroundColor: colors.surface, borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
                  <Dumbbell size={20} color="#8b5cf6" />
                  <Text style={[styles.targetLabel, { color: colors.textMuted }]}>Protein</Text>
                  {isEditingTargets ? (
                    <CustomTextInput
                      testID="onboarding_prot_input"
                      accessibilityLabel="onboarding_prot_input"
                      value={proteinGoal}
                      onChangeText={setProteinGoal}
                      keyboardType="numeric"
                      height={36}
                      inputStyle={{ textAlign: 'center', fontSize: 13 }}
                    />
                  ) : (
                    <Text testID="onboarding_prot_display" accessibilityLabel="onboarding_prot_display" style={[styles.targetValue, { color: colors.text }]}>{proteinGoal} g</Text>
                  )}
                </View>

                <View style={[styles.targetCard, { backgroundColor: colors.surface, borderColor: 'rgba(6, 182, 212, 0.3)' }]}>
                  <Droplets size={20} color="#06b6d4" />
                  <Text style={[styles.targetLabel, { color: colors.textMuted }]}>Water</Text>
                  {isEditingTargets ? (
                    <CustomTextInput
                      testID="onboarding_water_input"
                      accessibilityLabel="onboarding_water_input"
                      value={waterGoal}
                      onChangeText={setWaterGoal}
                      keyboardType="numeric"
                      height={36}
                      inputStyle={{ textAlign: 'center', fontSize: 13 }}
                    />
                  ) : (
                    <Text testID="onboarding_water_display" accessibilityLabel="onboarding_water_display" style={[styles.targetValue, { color: colors.text }]}>{waterGoal} ml</Text>
                  )}
                </View>

                <View style={[styles.targetCard, { backgroundColor: colors.surface, borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                  <Activity size={20} color="#10b981" />
                  <Text style={[styles.targetLabel, { color: colors.textMuted }]}>Daily Steps</Text>
                  {isEditingTargets ? (
                    <CustomTextInput
                      testID="onboarding_step_input"
                      accessibilityLabel="onboarding_step_input"
                      value={stepGoal}
                      onChangeText={setStepGoal}
                      keyboardType="numeric"
                      height={36}
                      inputStyle={{ textAlign: 'center', fontSize: 13 }}
                    />
                  ) : (
                    <Text testID="onboarding_step_display" accessibilityLabel="onboarding_step_display" style={[styles.targetValue, { color: colors.text }]}>{stepGoal} steps</Text>
                  )}
                </View>
              </View>

              {parseInt(age, 10) >= 60 && (
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 10, borderRadius: 10, marginVertical: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary }}>
                    👵 Elderly Mode automatically selected for smooth navigation & low-impact protocols.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                testID="onboarding_edit_targets_btn"
                accessibilityLabel="onboarding_edit_targets_btn"
                style={[styles.editTargetsBtn, { borderColor: colors.cardBorder }]}
                onPress={() => setIsEditingTargets(!isEditingTargets)}
              >
                <Edit3 size={16} color={colors.primary} />
                <Text style={[styles.editTargetsText, { color: colors.primary }]}>
                  {isEditingTargets ? 'Done Editing' : 'Customize Target Numbers'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="onboarding_finish_btn"
                accessibilityLabel="onboarding_finish_btn"
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, !isStep7Valid && styles.disabledBtn]}
                onPress={handleCompleteOnboarding}
                disabled={loading || !isStep7Valid}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Complete Setup & Enter Dashboard</Text>
                    <Sparkles size={20} color="#ffffff" style={{ marginLeft: 8 }} />
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
  safeArea: { flex: 1 },
  container: { flex: 1 },
  headerBar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, borderBottomWidth: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconBackButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badgeStep: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.12)' },
  badgeStepText: { fontSize: 12, fontWeight: 'bold' },
  progressBarBg: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  scrollContent: { padding: 18 },
  stepCard: { borderRadius: 20, padding: 18, borderWidth: 1 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  stepIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: 17, fontWeight: 'bold' },
  stepSubtitle: { fontSize: 12, marginTop: 2 },
  inputGroup: { marginBottom: 14 },
  genderRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  genderText: { fontSize: 13, fontWeight: 'bold' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, marginTop: 10 },
  primaryBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.5 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  bmiBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 14 },
  bmiLabel: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  bmiValue: { fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  bmiTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  bmiTagText: { fontSize: 11, fontWeight: 'bold' },
  gridGoals: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  goalCard: { width: '48%', padding: 12, borderRadius: 14, borderWidth: 1, position: 'relative' },
  goalText: { fontSize: 12, fontWeight: 'bold', marginTop: 8 },
  goalCheck: { position: 'absolute', top: 10, right: 10 },
  radioList: { gap: 10, marginBottom: 14 },
  radioCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  radioLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioTitle: { fontSize: 13, fontWeight: 'bold' },
  radioSub: { fontSize: 11, marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 13, fontWeight: 'bold', padding: 0 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  medicalChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chipItem: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  chipText: { fontSize: 11, fontWeight: 'bold' },
  targetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  targetCard: { width: '48%', padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  targetLabel: { fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  targetValue: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  editTargetsBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 6, marginBottom: 10 },
  editTargetsText: { fontSize: 12, fontWeight: 'bold' },
});
