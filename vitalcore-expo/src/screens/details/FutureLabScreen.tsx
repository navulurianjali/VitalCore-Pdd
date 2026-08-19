import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHealthData } from '../../hooks/useHealthData';
import {
  getDigitalTwinProfile,
  getFutureHealthScore,
  getEarlyWarnings,
  getFutureTimeline,
  getDailyImprovementPlan,
  getNutritionIntelligence,
  getAchievementsAndMotivation,
  simulateDecisionImpact,
} from '../../utils/futureLabEngine';
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  Activity,
  Cpu,
  Heart,
  Dumbbell,
  Flame,
  Droplet,
  Utensils,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ChevronRight,
  Award,
  Clock,
  Layers,
} from 'lucide-react-native';

export default function FutureLabScreen({ navigation }: any) {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const { metrics, loading } = useHealthData();

  // Simulator State
  const [simSleep, setSimSleep] = useState(0); // hrs
  const [simWater, setSimWater] = useState(0); // ml
  const [simSteps, setSimSteps] = useState(0); // steps

  // Detailed Insights Toggle
  const [showDetailedInsights, setShowDetailedInsights] = useState(false);

  if (loading || !metrics) {
    return (
      <ScreenWrapper showBack onBack={() => navigation.goBack()} title="🔮 Future Health Lab">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Compiling Digital Twin Telemetry...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const digitalTwin = getDigitalTwinProfile(metrics, profile);
  const hasEnoughData = metrics.hasTelemetry && metrics.trackingDaysCount > 0;

  if (!hasEnoughData) {
    return (
      <ScreenWrapper
        showBack
        onBack={() => navigation.goBack()}
        title="🔮 Future Health Lab"
        subtitle="Digital Twin Predictive Analytics"
      >
        <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.emptyIconCircle}>
            <Cpu size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Not enough data yet</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            The Digital Twin predictive engine requires real daily telemetry logs (meals, water, sleep, activity) to build your biological baseline and project future health trajectories.
          </Text>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CalorieTrackerDetail')}
          >
            <Sparkles size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Log Today's Telemetry</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const healthScore = getFutureHealthScore(metrics);
  const earlyWarnings = getEarlyWarnings(metrics).slice(0, 3);
  const timeline = getFutureTimeline(metrics, profile?.biological_age || 30);
  const dailyPlan = getDailyImprovementPlan(metrics, profile);
  const nutritionIntel = getNutritionIntelligence(metrics);
  const motivation = getAchievementsAndMotivation(metrics);
  const simulation = simulateDecisionImpact(metrics, simSleep, simWater, simSteps);

  const projection30Days = timeline.find((t) => t.day === 30) || timeline[1];
  const projection1Year = timeline.find((t) => t.day === 365) || timeline[3];

  return (
    <ScreenWrapper
      showBack
      onBack={() => navigation.goBack()}
      title="🔮 Future Health Lab"
      subtitle="Digital Twin Predictive Analytics"
    >
      {/* 1. HERO SCORE & BIO AGE BANNER */}
      <View style={[styles.heroCard, { backgroundColor: colors.cardBg, borderColor: colors.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreVal, { color: colors.primary }]}>{digitalTwin.overallHealthScore}</Text>
            <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>SCORE</Text>
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.badgeRow}>
              <Text
                style={[
                  styles.statusBadge,
                  {
                    color: healthScore.direction === 'Improving' ? colors.success : colors.warning,
                    backgroundColor: healthScore.direction === 'Improving' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  },
                ]}
              >
                {healthScore.direction === 'Improving' ? '↗ Improving' : '→ Stable'}
              </Text>
            </View>
            <Text style={[styles.bioAgeText, { color: colors.text }]}>
              Bio Age: <Text style={{ color: colors.primary }}>{digitalTwin.biologicalAge} yrs</Text>
            </Text>
            <Text style={[styles.bioAgeSub, { color: colors.textMuted }]}>
              {digitalTwin.ageDifference > 0 ? `${digitalTwin.ageDifference} yrs younger than actual age` : 'Aligned with actual age'}
            </Text>
          </View>
        </View>

        <View style={[styles.aiSummaryBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Text style={[styles.aiSummaryHeader, { color: colors.primary }]}>AI HEALTH SUMMARY</Text>
          <Text style={[styles.aiSummaryText, { color: colors.text }]}>{healthScore.explanation}</Text>
        </View>
      </View>

      {/* 2. TOP PRIORITY INSIGHTS */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Priority Insights</Text>
      <View style={styles.insightsList}>
        {earlyWarnings.length > 0 ? (
          earlyWarnings.map((warn) => (
            <View key={warn.id} style={[styles.insightCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.insightHeader}>
                <Text style={[styles.insightTag, { color: colors.warning }]}>⚠️ {warn.type}</Text>
                <Text style={[styles.confText, { color: colors.textMuted }]}>{warn.confidenceScore}% Conf</Text>
              </View>
              <Text style={[styles.insightMsg, { color: colors.text }]}>{warn.message}</Text>
              <TouchableOpacity
                style={[styles.insightBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => alert(`Action: ${warn.actionTrigger}`)}
              >
                <Text style={[styles.insightBtnText, { color: colors.primary }]}>{warn.actionTrigger} →</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={[styles.clearBox, { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: colors.success }]}>
            <ShieldCheck size={18} color={colors.success} />
            <Text style={[styles.clearText, { color: colors.success }]}>All primary health systems clear and optimal today!</Text>
          </View>
        )}
      </View>

      {/* 3. TODAY'S AI ACTION PLAN */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's AI Action Plan</Text>
      <View style={[styles.actionPlanCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.actionPlanGrid}>
          {/* Meal */}
          <View style={[styles.actionItem, { backgroundColor: colors.inputBg }]}>
            <View style={styles.actionLabelRow}>
              <Utensils size={14} color="#f59e0b" />
              <Text style={[styles.actionLabel, { color: '#f59e0b' }]}>Meal</Text>
            </View>
            <Text style={[styles.actionVal, { color: colors.text }]} numberOfLines={1}>{dailyPlan.recommendedMeals[0]?.name || 'Healthy Meal'}</Text>
            <Text style={[styles.actionSub, { color: colors.textMuted }]}>{dailyPlan.recommendedMeals[0]?.calories || 380} kcal</Text>
          </View>

          {/* Workout */}
          <View style={[styles.actionItem, { backgroundColor: colors.inputBg }]}>
            <View style={styles.actionLabelRow}>
              <Dumbbell size={14} color="#10b981" />
              <Text style={[styles.actionLabel, { color: '#10b981' }]}>Workout</Text>
            </View>
            <Text style={[styles.actionVal, { color: colors.text }]} numberOfLines={1}>{dailyPlan.workoutRoutine.title}</Text>
            <Text style={[styles.actionSub, { color: colors.textMuted }]}>{dailyPlan.workoutRoutine.durationMin} mins • {dailyPlan.workoutRoutine.intensity}</Text>
          </View>

          {/* Hydration */}
          <View style={[styles.actionItem, { backgroundColor: colors.inputBg }]}>
            <View style={styles.actionLabelRow}>
              <Droplet size={14} color="#06b6d4" />
              <Text style={[styles.actionLabel, { color: '#06b6d4' }]}>Hydration</Text>
            </View>
            <Text style={[styles.actionVal, { color: colors.text }]}>{dailyPlan.hydrationGoalMl} ml Target</Text>
            <Text style={[styles.actionSub, { color: colors.textMuted }]}>{metrics.hydrationMl} ml logged</Text>
          </View>

          {/* Sleep */}
          <View style={[styles.actionItem, { backgroundColor: colors.inputBg }]}>
            <View style={styles.actionLabelRow}>
              <Moon size={14} color="#8b5cf6" />
              <Text style={[styles.actionLabel, { color: '#8b5cf6' }]}>Sleep Target</Text>
            </View>
            <Text style={[styles.actionVal, { color: colors.text }]}>{dailyPlan.sleepSchedule.targetHours} Hours</Text>
            <Text style={[styles.actionSub, { color: colors.textMuted }]}>Wind down: {dailyPlan.sleepSchedule.windDown}</Text>
          </View>
        </View>
      </View>

      {/* 4. DECISION IMPACT SIMULATOR */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Decision Impact Simulator</Text>
      <View style={[styles.simCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.simLabel, { color: colors.text }]}>Extra Sleep (+{simSleep} hrs)</Text>
        <View style={styles.simBtnRow}>
          {[0, 1, 2].map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.simChip,
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                simSleep === val && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setSimSleep(val)}
            >
              <Text style={[styles.simChipText, { color: colors.textMuted }, simSleep === val && { color: '#ffffff' }]}>
                +{val}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.simLabel, { color: colors.text, marginTop: 8 }]}>Extra Hydration (+{simWater} ml)</Text>
        <View style={styles.simBtnRow}>
          {[0, 500, 1000].map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.simChip,
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                simWater === val && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setSimWater(val)}
            >
              <Text style={[styles.simChipText, { color: colors.textMuted }, simWater === val && { color: '#ffffff' }]}>
                +{val}ml
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.simLabel, { color: colors.text, marginTop: 8 }]}>Extra Walking (+{simSteps} steps)</Text>
        <View style={styles.simBtnRow}>
          {[0, 2000, 5000].map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.simChip,
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                simSteps === val && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setSimSteps(val)}
            >
              <Text style={[styles.simChipText, { color: colors.textMuted }, simSteps === val && { color: '#ffffff' }]}>
                +{val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.simOutputBox, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.simOutputTitle, { color: colors.primary }]}>📊 Projected Simulation Impact:</Text>
          <Text style={[styles.simOutputText, { color: colors.text }]}>
            • Energy Level: <Text style={{ fontWeight: 'bold' }}>{simulation.energyProjected}%</Text>
          </Text>
          <Text style={[styles.simOutputText, { color: colors.text }]}>
            • Recovery Rate: <Text style={{ fontWeight: 'bold' }}>{simulation.recoveryProjected}%</Text>
          </Text>
          <Text style={[styles.simOutputText, { color: colors.text }]}>
            • Burnout Risk: <Text style={{ fontWeight: 'bold' }}>{simulation.burnoutRiskProjected}%</Text>
          </Text>
        </View>
      </View>

      {/* 5. FUTURE LONGEVITY PROJECTIONS */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Future Longevity Projection</Text>
      <View style={[styles.projRow]}>
        <View style={[styles.projCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.projHeader, { color: colors.textMuted }]}>TODAY</Text>
          <Text style={[styles.projVal, { color: colors.text }]}>{digitalTwin.overallHealthScore}</Text>
          <Text style={[styles.projSub, { color: colors.textMuted }]}>Baseline</Text>
        </View>

        <View style={[styles.projCard, { backgroundColor: colors.cardBg, borderColor: colors.primary }]}>
          <Text style={[styles.projHeader, { color: colors.primary }]}>30 DAYS</Text>
          <Text style={[styles.projVal, { color: colors.success }]}>{projection30Days.wellness}</Text>
          <Text style={[styles.projSub, { color: colors.success }]}>Bio: {projection30Days.vitalityAge} yrs</Text>
        </View>

        <View style={[styles.projCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.projHeader, { color: colors.textMuted }]}>1 YEAR</Text>
          <Text style={[styles.projVal, { color: colors.success }]}>{projection1Year.wellness}</Text>
          <Text style={[styles.projSub, { color: colors.success }]}>Bio: {projection1Year.vitalityAge} yrs</Text>
        </View>
      </View>

      {/* 6. DIGITAL TWIN STATUS & NUTRITION BALANCE */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Digital Twin Status & Nutrition</Text>
      <View style={[styles.domainCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.domainCardTitle, { color: colors.text }]}>Domain Health Scores</Text>
        {digitalTwin.domainScores.slice(0, 5).map((domain, i) => (
          <View key={i} style={styles.domainRow}>
            <Text style={[styles.domainName, { color: colors.text }]}>{domain.name}</Text>
            <View style={styles.domainRight}>
              <View style={[styles.domainBarBg, { backgroundColor: colors.inputBg }]}>
                <View
                  style={[
                    styles.domainBarFill,
                    { width: `${domain.score}%`, backgroundColor: domain.score >= 70 ? colors.success : colors.warning },
                  ]}
                />
              </View>
              <Text style={[styles.domainScoreVal, { color: colors.text }]}>{domain.score}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          onPress={() => setShowDetailedInsights(!showDetailedInsights)}
        >
          <Layers size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.toggleBtnText, { color: colors.primary }]}>
            {showDetailedInsights ? 'Hide 8 Living Body Systems' : 'View 8 Living Body Systems'}
          </Text>
        </TouchableOpacity>

        {showDetailedInsights && (
          <View style={styles.bodySystemsBox}>
            {digitalTwin.bodySystems.map((sys, idx) => (
              <View key={idx} style={[styles.sysCard, { backgroundColor: colors.inputBg }]}>
                <View style={styles.sysHeader}>
                  <Text style={[styles.sysName, { color: colors.text }]}>{sys.name}</Text>
                  <Text style={[styles.sysScore, { color: colors.primary }]}>{sys.score}%</Text>
                </View>
                <Text style={[styles.sysRec, { color: colors.textMuted }]}>{sys.recommendation}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: { paddingVertical: 40, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyCard: { borderRadius: 20, padding: 24, borderWidth: 1, alignItems: 'center', marginVertical: 20 },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(59, 130, 246, 0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  primaryBtn: { height: 48, borderRadius: 12, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  heroCard: { borderRadius: 20, padding: 18, borderWidth: 1, marginBottom: 16 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scoreCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  scoreVal: { fontSize: 24, fontWeight: '900' },
  scoreLabel: { fontSize: 8, fontWeight: '700', marginTop: -2 },
  heroInfo: { flex: 1 },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  statusBadge: { fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, overflow: 'hidden' },
  bioAgeText: { fontSize: 18, fontWeight: '800' },
  bioAgeSub: { fontSize: 11, marginTop: 2 },
  aiSummaryBox: { borderRadius: 14, padding: 12, marginTop: 14, borderWidth: 1 },
  aiSummaryHeader: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  aiSummaryText: { fontSize: 12, lineHeight: 17 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8, marginTop: 14 },
  insightsList: { gap: 10, marginBottom: 10 },
  insightCard: { borderRadius: 16, padding: 14, borderWidth: 1, gap: 6 },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightTag: { fontSize: 11, fontWeight: '800' },
  confText: { fontSize: 10 },
  insightMsg: { fontSize: 12, lineHeight: 17, fontWeight: '600' },
  insightBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  insightBtnText: { fontSize: 11, fontWeight: '700' },
  clearBox: { padding: 14, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  clearText: { fontSize: 12, fontWeight: '700' },
  actionPlanCard: { borderRadius: 18, padding: 14, borderWidth: 1, marginBottom: 10 },
  actionPlanGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionItem: { width: '48%', borderRadius: 14, padding: 12, gap: 4 },
  actionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionLabel: { fontSize: 10, fontWeight: '800' },
  actionVal: { fontSize: 12, fontWeight: '700' },
  actionSub: { fontSize: 10 },
  simCard: { borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 10 },
  simLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  simBtnRow: { flexDirection: 'row', marginBottom: 4 },
  simChip: { flex: 1, borderRadius: 8, paddingVertical: 6, alignItems: 'center', marginRight: 6, borderWidth: 1 },
  simChipText: { fontSize: 11, fontWeight: '700' },
  simOutputBox: { borderRadius: 12, padding: 12, marginTop: 8 },
  simOutputTitle: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  simOutputText: { fontSize: 12, lineHeight: 17 },
  projRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  projCard: { flex: 1, borderRadius: 14, padding: 12, borderWidth: 1, alignItems: 'center' },
  projHeader: { fontSize: 9, fontWeight: '800', marginBottom: 2 },
  projVal: { fontSize: 20, fontWeight: '900' },
  projSub: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  domainCard: { borderRadius: 18, padding: 16, borderWidth: 1, gap: 10, marginBottom: 10 },
  domainCardTitle: { fontSize: 14, fontWeight: '800' },
  domainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  domainName: { fontSize: 12, fontWeight: '600' },
  domainRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  domainBarBg: { width: 90, height: 6, borderRadius: 3, overflow: 'hidden' },
  domainBarFill: { height: '100%', borderRadius: 3 },
  domainScoreVal: { fontSize: 12, fontWeight: '800', width: 24, textAlign: 'right' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  toggleBtnText: { fontSize: 12, fontWeight: '700' },
  bodySystemsBox: { gap: 8, marginTop: 8 },
  sysCard: { padding: 12, borderRadius: 12 },
  sysHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sysName: { fontSize: 12, fontWeight: '700' },
  sysScore: { fontSize: 12, fontWeight: '800' },
  sysRec: { fontSize: 11, lineHeight: 15 },
});
