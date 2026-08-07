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
import { getDigitalTwinProfile } from '../../utils/futureLabEngine';
import {
  generateEarlyWarnings,
  generateTimelineProjections,
  simulateDecisionImpact,
} from '../../utils/digitalTwinEngine';
import { Sparkles, AlertCircle, TrendingUp, Activity, Cpu } from 'lucide-react-native';

export default function FutureLabScreen({ navigation }: any) {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const { metrics, loading } = useHealthData();

  // Simulator State
  const [simSleep, setSimSleep] = useState(0); // hrs
  const [simWater, setSimWater] = useState(0); // ml
  const [simSteps, setSimSteps] = useState(0); // steps

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
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

  const warnings = generateEarlyWarnings(metrics);
  const timeline = generateTimelineProjections(metrics, profile?.biological_age || 30.0);
  const simulation = simulateDecisionImpact(metrics, simSleep, simWater, simSteps);

  return (
    <ScreenWrapper
      showBack
      onBack={() => navigation.goBack()}
      title="🔮 Future Health Lab"
      subtitle="Digital Twin Predictive Analytics"
    >
      {/* Biological Age & Digital Twin Core Banner */}
      <View style={[styles.shiftCard, { backgroundColor: colors.cardBg, borderColor: colors.primary }]}>
        <Text style={[styles.cardHeaderTitle, { color: colors.textMuted }]}>Digital Twin Biological Age Shift</Text>
        <Text style={[styles.shiftVal, { color: metrics.biologicalAgeShift <= 0 ? colors.success : colors.danger }]}>
          {metrics.biologicalAgeShift > 0 ? `+${metrics.biologicalAgeShift}` : metrics.biologicalAgeShift} yrs
        </Text>
        <Text style={[styles.shiftDesc, { color: colors.text }]}>
          {metrics.biologicalAgeShift <= 0
            ? '✨ Your hydration, active steps, and sleep stability are actively reversing biological aging.'
            : '⚠️ Increasing sleep debt and stress are accelerating physical fatigue buildup.'}
        </Text>
        <View style={[styles.twinMetaRow, { borderColor: colors.cardBorder }]}>
          <Text style={[styles.twinMetaTag, { color: colors.primary }]}>
            Stability Score: {metrics.stabilityScore}/100
          </Text>
          <Text style={[styles.twinMetaTag, { color: colors.secondary }]}>
            Recovery: {metrics.recoveryPercentage}%
          </Text>
        </View>
      </View>

      {/* Decision Impact Simulator */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Decision Impact Simulator</Text>
      <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
        Simulate positive habit changes and observe real-time health trajectory shifts:
      </Text>

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

        <Text style={[styles.simLabel, { color: colors.text, marginTop: 10 }]}>Extra Hydration (+{simWater} ml)</Text>
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

        <Text style={[styles.simLabel, { color: colors.text, marginTop: 10 }]}>Extra Walking (+{simSteps} steps)</Text>
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
                +{val} steps
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Simulation Output */}
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

      {/* Early Warning Alerts */}
      {warnings.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚠️ Proactive Early Warnings</Text>
          {warnings.map((warn, i) => (
            <View
              key={i}
              style={[
                styles.warningCard,
                { backgroundColor: warn.severity === 'high' ? colors.dangerLight : colors.warningLight, borderColor: warn.severity === 'high' ? colors.danger : colors.warning },
              ]}
            >
              <Text style={[styles.warningTitle, { color: warn.severity === 'high' ? colors.danger : colors.warning }]}>
                {warn.type}
              </Text>
              <Text style={[styles.warningMsg, { color: colors.text }]}>{warn.message}</Text>
              <TouchableOpacity style={[styles.warnActionBtn, { backgroundColor: colors.cardBg }]}>
                <Text style={[styles.warnActionText, { color: colors.primary }]}>➔ Action: {warn.actionTrigger}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* Dynamic Risk Scores */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Real-Time Preventive Risk Analytics</Text>

      <View style={styles.riskGrid}>
        <View style={[styles.riskBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.riskVal, { color: colors.danger }]}>{metrics.burnoutRisk}%</Text>
          <Text style={[styles.riskLbl, { color: colors.textMuted }]}>Burnout Risk</Text>
        </View>

        <View style={[styles.riskBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.riskVal, { color: colors.warning }]}>{metrics.fatigueBuildup}%</Text>
          <Text style={[styles.riskLbl, { color: colors.textMuted }]}>Fatigue Buildup</Text>
        </View>
      </View>

      {/* Future Health Timeline Forecast */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Long-Term Health Trajectory Forecasts</Text>

      {timeline.map((point) => (
        <View key={point.day} style={[styles.timelineCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.timeLabel, { color: colors.primary }]}>{point.label}</Text>
            <Text style={[styles.ageLabel, { color: colors.success }]}>Estimated Vitality Age: {point.vitalityAge} yrs</Text>
          </View>
          <Text style={[styles.predText, { color: colors.text }]}>{point.predictionText}</Text>
          <Text style={[styles.precautionText, { color: colors.textMuted }]}>💡 Recommendation: {point.precautions}</Text>
        </View>
      ))}
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
  shiftCard: { borderRadius: 18, padding: 20, alignItems: 'center', borderWidth: 1, marginBottom: 20 },
  cardHeaderTitle: { fontSize: 13 },
  shiftVal: { fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  shiftDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  twinMetaRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 12, paddingTop: 10, borderTopWidth: 0.5 },
  twinMetaTag: { fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, marginTop: 12 },
  sectionDesc: { fontSize: 12, marginBottom: 10 },
  simCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  simLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
  simBtnRow: { flexDirection: 'row', marginBottom: 6 },
  simChip: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginRight: 6, borderWidth: 1 },
  simChipText: { fontSize: 12, fontWeight: 'bold' },
  simOutputBox: { borderRadius: 12, padding: 14, marginTop: 10 },
  simOutputTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  simOutputText: { fontSize: 13, lineHeight: 18 },
  warningCard: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10 },
  warningTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  warningMsg: { fontSize: 13, lineHeight: 18 },
  warnActionBtn: { borderRadius: 8, padding: 8, marginTop: 8, alignItems: 'flex-start' },
  warnActionText: { fontWeight: 'bold', fontSize: 12 },
  riskGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  riskBox: { flex: 1, borderRadius: 14, padding: 16, marginHorizontal: 4, borderWidth: 1, alignItems: 'center' },
  riskVal: { fontSize: 22, fontWeight: 'bold' },
  riskLbl: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  timelineCard: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  timeLabel: { fontWeight: 'bold', fontSize: 15 },
  ageLabel: { fontWeight: 'bold', fontSize: 13 },
  predText: { fontSize: 14, lineHeight: 20 },
  precautionText: { fontSize: 12, marginTop: 8 },
});
