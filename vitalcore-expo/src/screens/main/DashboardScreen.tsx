import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHealthData } from '../../hooks/useHealthData';
import { supabase } from '../../services/supabase';
import { getLocalDateString } from '../../utils/dateUtils';
import { calculateFutureHealthPredictions } from '../../utils/predictiveEngine';
import {
  Flame,
  Droplet,
  Moon,
  Footprints,
  Brain,
  Activity,
  Zap,
  TrendingDown,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Award,
  ArrowRight,
  Dumbbell,
} from 'lucide-react-native';

export default function DashboardScreen({ navigation }: any) {
  const { profile } = useAuth();
  const { colors, activeMode, isCareMode } = useTheme();
  const { metrics, loading, refetch } = useHealthData();

  const [refreshing, setRefreshing] = useState(false);
  const [loggingInProgress, setLoggingInProgress] = useState(false);
  const [logStatus, setLogStatus] = useState<string | null>(null);

  // Simulation states
  const [simulating, setSimulating] = useState(false);
  const [simSleep, setSimSleep] = useState(8);
  const [simWater, setSimWater] = useState(2000);
  const [simStress, setSimStress] = useState(30);

  // Medication (elderly mode)
  const [meds, setMeds] = useState([
    { name: 'Blood Pressure Capsule', time: '8:00 AM', taken: true },
    { name: 'Joint Strength Vitamin D', time: '12:00 PM', taken: false },
    { name: 'Glucosamine Tablet', time: '6:00 PM', taken: false },
  ]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLogWater = async (amount: number) => {
    setLoggingInProgress(true);
    setLogStatus('Logging hydration...');
    try {
      if (supabase && profile?.id) {
        const todayDate = getLocalDateString(undefined, profile?.timezone);
        const { error } = await supabase.from('hydration_logs').insert({
          user_id: profile.id,
          date: todayDate,
          amount_ml: amount,
        });
        if (error) throw error;
        await refetch();
      }
      setLogStatus(`Logged ${amount}ml water! 💧`);
      setTimeout(() => setLogStatus(null), 3000);
    } catch (e: any) {
      console.error('Hydration logging error:', e);
      setLogStatus('Error logging hydration');
      setTimeout(() => setLogStatus(null), 3000);
    } finally {
      setLoggingInProgress(false);
    }
  };

  const handleToggleMed = (idx: number) => {
    setMeds((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, taken: !m.taken } : m))
    );
  };

  if (loading && !metrics) {
    return (
      <ScreenWrapper scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Syncing telemetry...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0].toUpperCase() : '';

  const totalCalories = metrics?.caloriesConsumed || 0;
  const waterLogged = metrics?.hydrationMl || 0;
  const sleepHrs = metrics?.sleepHours || 0;
  const stepsLogged = metrics?.steps || 0;

  const predictions = calculateFutureHealthPredictions({
    sleepHours: simulating ? simSleep : (sleepHrs || metrics?.sleepHours || 7),
    sleepQuality: simulating ? (simSleep >= 8 ? 90 : simSleep >= 6 ? 70 : 45) : (metrics?.sleepQuality || 80),
    hydrationMl: simulating ? simWater : (waterLogged || metrics?.hydrationMl || 2000),
    hydrationTarget: metrics?.hydrationTarget || 2500,
    stressLevel: simulating ? simStress : (metrics?.stressLevel || 30),
    fatigueScore: metrics?.fatigueScore || 30,
    physicalFatigue: metrics?.physicalFatigue || 25,
    mentalFatigue: metrics?.mentalFatigue || 35,
    sorenessLevel: profile?.soreness_level || 0,
    recoveryPercentage: metrics?.recoveryPercentage || 85,
    stabilityScore: metrics?.stabilityScore || 90,
    screenTimeHours: profile?.screen_time_hours || 6,
    caffeineIntake: profile?.caffeine_intake || 'moderate',
  });

  return (
    <ScreenWrapper
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* 1. Page Header Welcome */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greetingText, { color: colors.text, fontSize: isCareMode ? 26 : 22 }]}>
            {greeting}{firstName ? `, ${firstName}` : ''} 👋
          </Text>
          <Text style={[styles.greetingSub, { color: colors.textMuted }]}>
            TODAY — {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.streakBadge, { backgroundColor: colors.cardBg, borderColor: colors.primary }]}
          onPress={() => navigation.navigate('HistoryDetail')}
        >
          <Text style={{ fontSize: 14 }}>📅</Text>
          <Text style={[styles.streakText, { color: colors.primary }]}>
            HISTORY
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feedback banner */}
      {logStatus && (
        <View style={[styles.logBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <Text style={[styles.logBannerText, { color: colors.primary }]}>{logStatus}</Text>
        </View>
      )}

      {/* 2. TOP 4 FOCUS METRIC CARDS GRID (1:1 with Web) */}
      {activeMode !== 'elderly' && (
        <View style={styles.focusGrid}>
          {/* Calories Card */}
          <TouchableOpacity
            style={[styles.focusCard, { backgroundColor: colors.cardBg, borderColor: 'rgba(239, 68, 68, 0.3)' }]}
            onPress={() => navigation.navigate('CalorieTrackerDetail')}
          >
            <View style={styles.cardTopRow}>
              <Flame size={20} color="#ef4444" />
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#f87171' }}>Track Intake →</Text>
            </View>
            <View style={styles.cardValueRow}>
              <Text style={[styles.cardBigNum, { color: colors.text }]}>{totalCalories}</Text>
              <Text style={[styles.cardUnit, { color: colors.textMuted }]}>KCAL</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Daily Meals Logged</Text>
          </TouchableOpacity>

          {/* Hydration Card */}
          <View style={[styles.focusCard, { backgroundColor: colors.cardBg, borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
            <View style={styles.cardTopRow}>
              <Droplet size={20} color="#3b82f6" />
            </View>
            <View style={styles.cardValueRow}>
              <Text style={[styles.cardBigNum, { color: colors.text }]}>{waterLogged}</Text>
              <Text style={[styles.cardUnit, { color: colors.textMuted }]}>ML</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Hydration Intake</Text>
            <View style={styles.quickWaterRow}>
              <TouchableOpacity
                style={[styles.quickWaterBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={() => handleLogWater(250)}
                disabled={loggingInProgress}
              >
                <Text style={[styles.quickWaterText, { color: colors.primary }]}>+ 250ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickWaterBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={() => handleLogWater(500)}
                disabled={loggingInProgress}
              >
                <Text style={[styles.quickWaterText, { color: colors.primary }]}>+ 500ml</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sleep Card */}
          <View style={[styles.focusCard, { backgroundColor: colors.cardBg, borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
            <View style={styles.cardTopRow}>
              <Moon size={20} color="#8b5cf6" />
            </View>
            <View style={styles.cardValueRow}>
              <Text style={[styles.cardBigNum, { color: colors.text }]}>{sleepHrs > 0 ? sleepHrs : '0'}</Text>
              <Text style={[styles.cardUnit, { color: colors.textMuted }]}>HRS</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Sleep Duration</Text>
          </View>

          {/* Activity Steps Card */}
          <View style={[styles.focusCard, { backgroundColor: colors.cardBg, borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <View style={styles.cardTopRow}>
              <Footprints size={20} color="#f59e0b" />
            </View>
            <View style={styles.cardValueRow}>
              <Text style={[styles.cardBigNum, { color: colors.text }]}>{stepsLogged.toLocaleString()}</Text>
              <Text style={[styles.cardUnit, { color: colors.textMuted }]}>STEPS</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Activity Tracker</Text>
          </View>
        </View>
      )}

      {/* 3. ELDERLY / CARE MODE ACCESSIBLE LAYOUT */}
      {activeMode === 'elderly' && (
        <View style={styles.sectionSpacing}>
          <View style={[styles.elderlyAlertCard, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
            <AlertCircle size={24} color={colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.elderlyAlertTitle, { color: colors.danger }]}>Quick Family Alert</Text>
              <Text style={[styles.elderlyAlertSub, { color: colors.textMuted }]}>Instantly notify your care circle if you need help.</Text>
            </View>
            <TouchableOpacity
              style={[styles.elderlyAlertBtn, { backgroundColor: colors.danger }]}
              onPress={() => Alert.alert('Family Alert', 'Signal broadcasted to your care circle! Urgent assistance requested.')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Send Alert</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.medSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Reminders & Medications</Text>
            {meds.map((med, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.medItem,
                  { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                  med.taken && { opacity: 0.6, borderColor: colors.success },
                ]}
                onPress={() => handleToggleMed(idx)}
              >
                <View>
                  <Text style={[styles.medName, { color: colors.text }]}>{med.name}</Text>
                  <Text style={[styles.medTime, { color: colors.textMuted }]}>{med.time}</Text>
                </View>
                <Text style={[styles.medBadge, { color: med.taken ? colors.success : colors.warning }]}>
                  {med.taken ? '✓ Completed' : 'Pending'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 4. PERFORMANCE MODE ATHLETE WIDGETS */}
      {activeMode === 'performance' && (
        <View style={styles.sectionSpacing}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Athlete Performance Telemetry</Text>
          <View style={styles.perfGrid}>
            <View style={[styles.perfCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Text style={[styles.perfLabel, { color: colors.textMuted }]}>CNS Fatigue</Text>
              <Text style={[styles.perfVal, { color: colors.text }]}>42%</Text>
              <Text style={{ color: colors.success, fontSize: 10, marginTop: 2 }}>Optimal Threshold</Text>
            </View>
            <View style={[styles.perfCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Text style={[styles.perfLabel, { color: colors.textMuted }]}>HRV Status</Text>
              <Text style={[styles.perfVal, { color: colors.text }]}>84 ms</Text>
              <Text style={{ color: colors.success, fontSize: 10, marginTop: 2 }}>Stable Stance</Text>
            </View>
          </View>
        </View>
      )}

      {/* 5. HEALTH INSIGHTS & PREDICTIONS (1:1 with Web) */}
      <View style={styles.sectionSpacing}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Insights</Text>
        <View style={styles.insightsGrid}>
          {/* Energy Balance */}
          <View style={[styles.insightCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.insightHeader}>
              <Zap size={18} color={colors.success} />
              <Text style={[styles.insightScore, { color: colors.success }]}>
                {totalCalories > 0 || waterLogged > 0 || sleepHrs > 0 ? `${100 - predictions.burnoutRisk}%` : '--'}
              </Text>
            </View>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Energy Balance</Text>
            <Text style={[styles.insightSub, { color: colors.textMuted }]}>
              {totalCalories > 0 || waterLogged > 0 || sleepHrs > 0
                ? predictions.burnoutRisk > 60 ? 'Focus on restorative periods today.' : 'Optimal energy reservoir.'
                : 'Not enough telemetry data available yet.'}
            </Text>
          </View>

          {/* Rest Profile */}
          <View style={[styles.insightCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.insightHeader}>
              <Moon size={18} color="#8b5cf6" />
              <Text style={[styles.insightScore, { color: '#8b5cf6' }]}>
                {totalCalories > 0 || waterLogged > 0 || sleepHrs > 0 ? `${100 - predictions.fatigueBuildup}%` : '--'}
              </Text>
            </View>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Rest Profile</Text>
            <Text style={[styles.insightSub, { color: colors.textMuted }]}>
              {totalCalories > 0 || waterLogged > 0 || sleepHrs > 0
                ? predictions.fatigueBuildup > 65 ? 'Slight rest debt. Wind down early.' : 'Recovery battery fully charged.'
                : 'Log sleep or workouts to calculate rest profile.'}
            </Text>
          </View>

          {/* Recommendations */}
          <View style={[styles.insightCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.insightHeader}>
              <ShieldAlert size={18} color={colors.primary} />
            </View>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Recommendations</Text>
            <Text style={[styles.insightSub, { color: colors.textMuted }]}>
              {predictions.preventiveReminders.length > 0
                ? predictions.preventiveReminders[0]
                : 'Keep up the great work! No urgent alerts.'}
            </Text>
          </View>
        </View>
      </View>

      {/* 6. QUICK ACTIONS GRID (1:1 with Web) */}
      {activeMode !== 'elderly' && (
        <View style={styles.sectionSpacing}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate('CalorieTrackerDetail')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Flame size={20} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Calorie Tracker</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>Track daily meals and calories</Text>
              </View>
              <ArrowRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate('SleepDetail')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(20, 184, 166, 0.12)' }]}>
                <Moon size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Log Sleep</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>Note last night's rest</Text>
              </View>
              <ArrowRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate('AICoach')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
                <Brain size={20} color="#8b5cf6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Wellness Chat</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>Speak with your AI companion</Text>
              </View>
              <ArrowRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate('FitnessDetail')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Dumbbell size={20} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Fitness</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>Track and log your workouts</Text>
              </View>
              <ArrowRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate('FutureLabDetail')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(217, 70, 239, 0.12)' }]}>
                <Sparkles size={20} color="#d946ef" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Future Health Lab</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>Predict future health trends</Text>
              </View>
              <ArrowRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greetingText: { fontWeight: '800', letterSpacing: -0.5 },
  greetingSub: { fontSize: 13, marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, gap: 6 },
  streakText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  logBanner: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 14, alignItems: 'center' },
  logBannerText: { fontSize: 13, fontWeight: '700' },
  focusGrid: { gap: 12, marginBottom: 20 },
  focusCard: { borderRadius: 24, padding: 18, borderWidth: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  cardBigNum: { fontSize: 28, fontWeight: '800' },
  cardUnit: { fontSize: 11, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  quickWaterRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  quickWaterBtn: { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 8, alignItems: 'center' },
  quickWaterText: { fontSize: 11, fontWeight: '800' },
  sectionSpacing: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  elderlyAlertCard: { borderRadius: 24, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  elderlyAlertTitle: { fontSize: 15, fontWeight: '800' },
  elderlyAlertSub: { fontSize: 12, marginTop: 2 },
  elderlyAlertBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  medSection: { gap: 10 },
  medItem: { borderRadius: 16, padding: 14, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medName: { fontSize: 14, fontWeight: '700' },
  medTime: { fontSize: 11, marginTop: 2 },
  medBadge: { fontSize: 11, fontWeight: '700' },
  perfGrid: { flexDirection: 'row', gap: 12 },
  perfCard: { flex: 1, borderRadius: 20, padding: 16, borderWidth: 1 },
  perfLabel: { fontSize: 11, fontWeight: '700' },
  perfVal: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  insightsGrid: { gap: 12 },
  insightCard: { borderRadius: 24, padding: 16, borderWidth: 1 },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  insightScore: { fontSize: 20, fontWeight: '800' },
  insightTitle: { fontSize: 14, fontWeight: '700' },
  insightSub: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  quickActionsGrid: { gap: 10 },
  quickCard: { borderRadius: 20, padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  actionIconCircle: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 14, fontWeight: '700' },
  actionSub: { fontSize: 11, marginTop: 2 },
});
