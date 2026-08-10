import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHealthData } from '../../hooks/useHealthData';
import { supabase } from '../../services/supabase';
import { getLocalDateString } from '../../utils/dateUtils';
import { EXERCISE_LIBRARY, ExerciseDetail, generatePersonalizedWorkoutPlan } from '../../utils/exerciseLibrary';
import { fetchLiveExercisesFromDB } from '../../services/exerciseDbApi';
import {
  Dumbbell,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Activity,
  Heart,
  Target,
  Apple,
} from 'lucide-react-native';

export default function FitnessScreen({ navigation }: any) {
  const { profile } = useAuth();
  const { colors, isCareMode } = useTheme();
  const { metrics, refetch } = useHealthData();

  const [activeTab, setActiveTab] = useState<'coach' | 'history'>('coach');
  const [coachState, setCoachState] = useState<'form' | 'generating' | 'preview' | 'active' | 'summary'>('form');
  const [questionStep, setQuestionStep] = useState(1);

  // Questionnaire States
  const [feeling, setFeeling] = useState('normal');
  const [location, setLocation] = useState('home');
  const [focus, setFocus] = useState('full_body');
  const [duration, setDuration] = useState(30);
  const [equipment, setEquipment] = useState('none');
  const [intensity, setIntensity] = useState('moderate');

  // Loading animation tick
  const [loadingTick, setLoadingTick] = useState(0);

  // Workout Session State
  const [generatedWorkout, setGeneratedWorkout] = useState<ExerciseDetail[]>([]);
  const [recoveryWarning, setRecoveryWarning] = useState('');
  const [activeWorkoutName, setActiveWorkoutName] = useState('Custom Adaptive Workout');
  const [readinessScore, setReadinessScore] = useState(85);

  // Live Timer State
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isResting, setIsResting] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<boolean[]>([]);

  // Post Workout Stats
  const [workoutDurationSpent, setWorkoutDurationSpent] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [savingWorkout, setSavingWorkout] = useState(false);

  // History State
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  // Fetch Workout History from Supabase
  const fetchWorkoutHistory = async () => {
    if (!profile?.id) return;
    try {
      setFetchingHistory(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setWorkoutHistory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchWorkoutHistory();
    }
  }, [activeTab, profile?.id]);

  // Timer Tick Effect
  useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      setTimerRunning(false);
      handleTimeExpired();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Generating Screen Animation Ticks
  useEffect(() => {
    let interval: any;
    if (coachState === 'generating') {
      interval = setInterval(() => {
        setLoadingTick((prev) => {
          if (prev >= 3) {
            clearInterval(interval);
            setTimeout(() => {
              setCoachState('preview');
            }, 600);
            return 3;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [coachState]);

  const handleTimeExpired = () => {
    if (isResting) {
      setIsResting(false);
      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setCurrentExerciseIdx(nextIdx);
        setTimeLeft(generatedWorkout[nextIdx].durationSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    } else {
      const updated = [...completedExercises];
      updated[currentExerciseIdx] = true;
      setCompletedExercises(updated);

      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setIsResting(true);
        setTimeLeft(generatedWorkout[currentExerciseIdx].restSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    }
  };

  // Compile Adaptive Workout (using ExerciseDB API & profile-driven engine)
  const compileWorkout = async () => {
    setRecoveryWarning('');
    setLoadingTick(0);
    setCoachState('generating');

    try {
      const liveExercises = await fetchLiveExercisesFromDB({
        bodyPart: focus === 'full_body' ? undefined : focus,
        limit: 20,
      });

      const result = generatePersonalizedWorkoutPlan({
        profile,
        metrics,
        focus,
        duration,
        equipment,
        location,
        intensity,
        feeling,
      });

      // Merge live ExerciseDB exercises if returned
      const finalExercises = (liveExercises && liveExercises.length >= 4) ? liveExercises.slice(0, result.exercises.length) : result.exercises;

      setReadinessScore(result.readinessScore);
      if (result.recommendationReason) {
        setRecoveryWarning(result.recommendationReason);
      }

      const titleFocus = focus.replace('_', ' ').toUpperCase();
      setActiveWorkoutName(`ADAPTIVE ${titleFocus} SESSION`);
      setGeneratedWorkout(finalExercises);
      setCompletedExercises(new Array(finalExercises.length).fill(false));
      setCurrentExerciseIdx(0);
      setIsResting(false);
    } catch (e) {
      console.warn('ExerciseDB fetch error, using local engine:', e);
      const result = generatePersonalizedWorkoutPlan({
        profile,
        metrics,
        focus,
        duration,
        equipment,
        location,
        intensity,
        feeling,
      });
      setReadinessScore(result.readinessScore);
      setGeneratedWorkout(result.exercises);
      setCompletedExercises(new Array(result.exercises.length).fill(false));
      setCurrentExerciseIdx(0);
      setIsResting(false);
    }
  };

  const startWorkoutSession = () => {
    if (generatedWorkout.length === 0) return;
    setCoachState('active');
    setCurrentExerciseIdx(0);
    setTimeLeft(generatedWorkout[0].durationSeconds);
    setTimerRunning(true);
    setIsResting(false);
  };

  const finishWorkoutSession = async () => {
    setTimerRunning(false);

    const totalSecs = generatedWorkout.reduce((acc, ex) => acc + ex.durationSeconds, 0);
    const minsSpent = Math.max(1, Math.round(totalSecs / 60));
    const estimatedCals = Math.round(minsSpent * (intensity === 'intense' ? 9.5 : intensity === 'light' ? 5.5 : 7.5));

    setWorkoutDurationSpent(minsSpent);
    setCaloriesBurned(estimatedCals);
    setCoachState('summary');

    if (profile?.id && supabase) {
      try {
        setSavingWorkout(true);
        await supabase.from('workouts').insert({
          user_id: profile.id,
          date: getLocalDateString(undefined, profile?.timezone),
          name: activeWorkoutName,
          type: focus,
          duration_minutes: minsSpent,
          intensity: intensity,
          calories_burned: estimatedCals,
        });
        await refetch();
        fetchWorkoutHistory();
      } catch (e) {
        console.error('Failed to save workout session:', e);
      } finally {
        setSavingWorkout(false);
      }
    }
  };

  const currentExercise = generatedWorkout[currentExerciseIdx];

  return (
    <ScreenWrapper
      showBack
      onBack={() => navigation.goBack()}
      title="🏋️‍♂️ Fitness & Workouts"
      subtitle="AI-personalized training routines & workout tracking"
    >
      {/* Top Segmented Controls */}
      <View style={[styles.tabRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'coach' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('coach')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'coach' ? '#ffffff' : colors.textMuted }]}>
            Workout Coach
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'history' ? '#ffffff' : colors.textMuted }]}>
            Workout History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'coach' && (
        <View style={styles.coachContainer}>
          {/* STEP 1: QUESTIONNAIRE FORM */}
          {coachState === 'form' && (
            <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Personalize Today's Workout</Text>

              {/* Step 1: Body Focus */}
              {questionStep === 1 && (
                <View style={styles.stepGroup}>
                  <Text style={[styles.stepLabel, { color: colors.text }]}>1. Target Body Focus</Text>
                  <View style={styles.optionsGrid}>
                    {[
                      { id: 'full_body', label: 'Full Body' },
                      { id: 'chest', label: 'Chest & Push' },
                      { id: 'back', label: 'Back & Pull' },
                      { id: 'legs', label: 'Legs & Lower' },
                      { id: 'core', label: 'Core Abs' },
                      { id: 'mobility', label: 'Flexibility' },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.optionCard,
                          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                          focus === item.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => setFocus(item.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            focus === item.id && { color: colors.primary, fontWeight: 'bold' },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Step 2: Duration */}
              {questionStep === 2 && (
                <View style={styles.stepGroup}>
                  <Text style={[styles.stepLabel, { color: colors.text }]}>2. Available Time</Text>
                  <View style={styles.optionsGrid}>
                    {[15, 30, 45, 60].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[
                          styles.optionCard,
                          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                          duration === d && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => setDuration(d)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            duration === d && { color: colors.primary, fontWeight: 'bold' },
                          ]}
                        >
                          {d} Minutes
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Step 3: Equipment */}
              {questionStep === 3 && (
                <View style={styles.stepGroup}>
                  <Text style={[styles.stepLabel, { color: colors.text }]}>3. Available Equipment</Text>
                  <View style={styles.optionsGrid}>
                    {[
                      { id: 'none', label: 'No Equipment (Bodyweight)' },
                      { id: 'dumbbells', label: 'Dumbbells' },
                      { id: 'bands', label: 'Resistance Bands' },
                      { id: 'commercial_gym', label: 'Full Gym' },
                    ].map((eq) => (
                      <TouchableOpacity
                        key={eq.id}
                        style={[
                          styles.optionCard,
                          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                          equipment === eq.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => setEquipment(eq.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            equipment === eq.id && { color: colors.primary, fontWeight: 'bold' },
                          ]}
                        >
                          {eq.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Step 4: Intensity */}
              {questionStep === 4 && (
                <View style={styles.stepGroup}>
                  <Text style={[styles.stepLabel, { color: colors.text }]}>4. Workout Intensity</Text>
                  <View style={styles.optionsGrid}>
                    {[
                      { id: 'light', label: 'Light / Recovery' },
                      { id: 'moderate', label: 'Moderate' },
                      { id: 'intense', label: 'High Intensity' },
                    ].map((int) => (
                      <TouchableOpacity
                        key={int.id}
                        style={[
                          styles.optionCard,
                          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                          intensity === int.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => setIntensity(int.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            intensity === int.id && { color: colors.primary, fontWeight: 'bold' },
                          ]}
                        >
                          {int.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Step 5: How are you feeling */}
              {questionStep === 5 && (
                <View style={styles.stepGroup}>
                  <Text style={[styles.stepLabel, { color: colors.text }]}>5. How are you feeling today?</Text>
                  <View style={styles.optionsGrid}>
                    {[
                      { id: 'energized', label: '⚡ Fully Energized' },
                      { id: 'normal', label: '👍 Normal / Ready' },
                      { id: 'tired', label: '😴 Slightly Tired' },
                      { id: 'sore', label: '🤕 Muscle Soreness' },
                    ].map((f) => (
                      <TouchableOpacity
                        key={f.id}
                        style={[
                          styles.optionCard,
                          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                          feeling === f.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => setFeeling(f.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            feeling === f.id && { color: colors.primary, fontWeight: 'bold' },
                          ]}
                        >
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Step 6: Location */}
              {questionStep === 6 && (
                <View style={styles.stepGroup}>
                  <Text style={[styles.stepLabel, { color: colors.text }]}>6. Workout Location</Text>
                  <View style={styles.optionsGrid}>
                    {[
                      { id: 'home', label: '🏠 At Home' },
                      { id: 'gym', label: '🏋️‍♂️ At Gym' },
                      { id: 'outdoor', label: '🌳 Outdoor / Park' },
                    ].map((loc) => (
                      <TouchableOpacity
                        key={loc.id}
                        style={[
                          styles.optionCard,
                          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                          location === loc.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => setLocation(loc.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            location === loc.id && { color: colors.primary, fontWeight: 'bold' },
                          ]}
                        >
                          {loc.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Questionnaire Navigation Buttons */}
              <View style={styles.navRow}>
                {questionStep > 1 ? (
                  <TouchableOpacity
                    style={[styles.subBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                    onPress={() => setQuestionStep(questionStep - 1)}
                  >
                    <ArrowLeft size={16} color={colors.text} />
                    <Text style={[styles.subBtnText, { color: colors.text }]}>Previous</Text>
                  </TouchableOpacity>
                ) : <View />}

                {questionStep < 6 ? (
                  <TouchableOpacity
                    style={[styles.mainBtn, { backgroundColor: colors.primary }]}
                    onPress={() => setQuestionStep(questionStep + 1)}
                  >
                    <Text style={styles.mainBtnText}>Next Step</Text>
                    <ArrowRight size={16} color="#ffffff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.mainBtn, { backgroundColor: colors.primary }]}
                    onPress={compileWorkout}
                  >
                    <Sparkles size={16} color="#ffffff" />
                    <Text style={styles.mainBtnText}>Generate Workout</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* STEP 2: GENERATING SCREEN */}
          {coachState === 'generating' && (
            <View style={[styles.cardBox, styles.centerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Building Adaptive Workout Routine...</Text>
              <Text style={[styles.cardSub, { color: colors.textMuted }]}>
                Calibrating reps, rest intervals, and volume based on your recovery profile.
              </Text>
            </View>
          )}

          {/* STEP 3: PREVIEW ROUTINE */}
          {coachState === 'preview' && (
            <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.previewHeader}>
                <View>
                  <Text style={[styles.previewTitle, { color: colors.text }]}>{activeWorkoutName}</Text>
                  <Text style={[styles.previewSub, { color: colors.textMuted }]}>
                    Readiness Score: {readinessScore}% • {generatedWorkout.length} Exercises
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.regenBtn, { backgroundColor: colors.inputBg }]}
                  onPress={() => setCoachState('form')}
                >
                  <RotateCcw size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {!!recoveryWarning && (
                <View style={[styles.warnCard, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
                  <Text style={[styles.warnText, { color: colors.warning }]}>{recoveryWarning}</Text>
                </View>
              )}

              {/* Exercise List */}
              <View style={styles.exList}>
                {generatedWorkout.map((ex, idx) => (
                  <View key={ex.id || idx} style={[styles.exItem, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    <View style={styles.exIdxCircle}>
                      <Text style={styles.exIdxText}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.exName, { color: colors.text }]}>{ex.name}</Text>
                      <Text style={[styles.exDetails, { color: colors.textMuted }]}>
                        {ex.sets} sets • {ex.reps} • Rest: {ex.restSeconds}s
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                onPress={startWorkoutSession}
              >
                <Play size={18} color="#ffffff" />
                <Text style={styles.mainBtnText}>Start Active Session</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: ACTIVE WORKOUT TIMER */}
          {coachState === 'active' && currentExercise && (
            <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              {/* Header Status */}
              <View style={styles.activeHeader}>
                <Text style={[styles.activeStep, { color: colors.primary }]}>
                  Exercise {currentExerciseIdx + 1} of {generatedWorkout.length}
                </Text>
                <Text style={[styles.activeStatus, { color: colors.textMuted }]}>
                  {isResting ? '🧘 REST INTERVAL' : '🔥 ACTIVE SET'}
                </Text>
              </View>

              {/* Countdown Display */}
              <View style={[styles.timerCircle, { borderColor: isResting ? colors.warning : colors.primary }]}>
                <Text style={[styles.timerNum, { color: isResting ? colors.warning : colors.primary }]}>{timeLeft}</Text>
                <Text style={[styles.timerLabel, { color: colors.textMuted }]}>Seconds Left</Text>
              </View>

              {/* Current Exercise Title & Purpose */}
              <Text style={[styles.currentExName, { color: colors.text }]}>
                {isResting ? 'Rest & Hydrate' : currentExercise.name}
              </Text>
              <Text style={[styles.currentExDesc, { color: colors.textMuted }]}>
                {isResting ? 'Prepare for the next exercise set.' : currentExercise.description}
              </Text>

              {/* Controls */}
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={[styles.controlBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setTimerRunning(!timerRunning)}
                >
                  {timerRunning ? <Pause size={24} color="#ffffff" /> : <Play size={24} color="#ffffff" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.skipBtn, { backgroundColor: colors.inputBg }]}
                  onPress={handleTimeExpired}
                >
                  <Text style={[styles.skipBtnText, { color: colors.text }]}>Skip Set →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 5: WORKOUT SUMMARY */}
          {coachState === 'summary' && (
            <View style={[styles.cardBox, styles.centerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <CheckCircle2 size={48} color={colors.success} style={{ marginBottom: 12 }} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Session Completed! 🎉</Text>
              <Text style={[styles.cardSub, { color: colors.textMuted }]}>
                Great job completing {activeWorkoutName}.
              </Text>

              <View style={styles.summaryStatsRow}>
                <View style={[styles.summaryStatCard, { backgroundColor: colors.inputBg }]}>
                  <Clock size={20} color={colors.primary} />
                  <Text style={[styles.summaryStatVal, { color: colors.text }]}>{workoutDurationSpent} mins</Text>
                  <Text style={[styles.summaryStatLabel, { color: colors.textMuted }]}>Duration</Text>
                </View>

                <View style={[styles.summaryStatCard, { backgroundColor: colors.inputBg }]}>
                  <Flame size={20} color="#ef4444" />
                  <Text style={[styles.summaryStatVal, { color: colors.text }]}>{caloriesBurned} kcal</Text>
                  <Text style={[styles.summaryStatLabel, { color: colors.textMuted }]}>Energy Burned</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                onPress={() => setCoachState('form')}
              >
                <Text style={styles.mainBtnText}>Back to Workout Coach</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <View style={styles.historyContainer}>
          {fetchingHistory ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : workoutHistory.length > 0 ? (
            workoutHistory.map((item, idx) => (
              <View key={item.id || idx} style={[styles.historyCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.historyTop}>
                  <Text style={[styles.historyName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.historySub, { color: colors.textMuted }]}>
                  {item.duration_minutes} mins • {item.calories_burned} kcal burned
                </Text>
              </View>
            ))
          ) : (
            <View style={[styles.cardBox, styles.centerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>No Saved Workouts</Text>
              <Text style={[styles.cardSub, { color: colors.textMuted }]}>
                Complete a workout session in Workout Coach to log your progress history.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', borderRadius: 16, padding: 4, borderWidth: 1, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 13, fontWeight: '700' },
  coachContainer: { gap: 14 },
  historyContainer: { gap: 12 },
  cardBox: { borderRadius: 24, padding: 20, borderWidth: 1 },
  centerCard: { alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  cardSub: { fontSize: 13, lineHeight: 18 },
  stepGroup: { marginVertical: 10 },
  stepLabel: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  optionsGrid: { gap: 8 },
  optionCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  optionText: { fontSize: 14, fontWeight: '600' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  mainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, gap: 8 },
  mainBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  subBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, gap: 6 },
  subBtnText: { fontWeight: '700', fontSize: 13 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  previewTitle: { fontSize: 16, fontWeight: '800' },
  previewSub: { fontSize: 12, marginTop: 2 },
  regenBtn: { padding: 8, borderRadius: 12 },
  warnCard: { borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 14 },
  warnText: { fontSize: 12, lineHeight: 16 },
  exList: { gap: 8 },
  exItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, gap: 12 },
  exIdxCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(20, 184, 166, 0.15)', justifyContent: 'center', alignItems: 'center' },
  exIdxText: { fontSize: 12, fontWeight: '800', color: '#0d9488' },
  exName: { fontSize: 14, fontWeight: '700' },
  exDetails: { fontSize: 11, marginTop: 2 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  activeStep: { fontSize: 13, fontWeight: '800' },
  activeStatus: { fontSize: 12, fontWeight: '700' },
  timerCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginVertical: 16 },
  timerNum: { fontSize: 42, fontWeight: '900' },
  timerLabel: { fontSize: 11, marginTop: 2 },
  currentExName: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  currentExDesc: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  controlBtn: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14 },
  skipBtnText: { fontSize: 13, fontWeight: '700' },
  summaryStatsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  summaryStatCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  summaryStatVal: { fontSize: 18, fontWeight: '800', marginTop: 6 },
  summaryStatLabel: { fontSize: 11, marginTop: 2 },
  historyCard: { borderRadius: 20, padding: 16, borderWidth: 1 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyName: { fontSize: 15, fontWeight: '700' },
  historyDate: { fontSize: 11 },
  historySub: { fontSize: 12 },
});
