export interface BaseHealthMetrics {
  caloriesBurned: number;
  caloriesTarget: number;
  caloriesConsumed: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  hydrationMl: number;
  hydrationTarget: number;
  steps: number;
  stepsTarget: number;
  sleepHours: number;
  sleepTarget: number;
  sleepQuality: number;
  stressLevel: number;
  mood: string;
  recoveryPercentage: number;
  fatigueScore: number;
  physicalFatigue: number;
  mentalFatigue: number;
  energyLevel: number;
  biologicalAge: number;
  stabilityScore: number;
  metabolicEfficiency: number;
  lifestyleSustainability: number;
  glycemicIndexLoad: 'low' | 'medium' | 'high';
  sedentaryPostureRisk: 'low' | 'medium' | 'critical';
  micronutrientDeficiencies: string[];
  trackingDaysCount?: number;
  hasTelemetry?: boolean;
  hasEnergyTelemetry?: boolean;
}

export interface HealthDigitalTwin extends BaseHealthMetrics {
  biologicalAgeShift: number;
  stabilityScore: number;
  recoveryPercentage: number;
  burnoutRisk: number;
  fatigueBuildup: number;
  sleepDeteriorationRisk: number;
  recoveryDeclineRisk: number;
  trackingDaysCount: number;
  hasTelemetry: boolean;
  hasEnergyTelemetry?: boolean;
  aiSummary?: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
}


export interface EarlyWarning {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  actionTrigger: string;
}

export interface TimelineProjection {
  day: number;
  label: string;
  energy: number;
  recovery: number;
  sleep: number;
  wellness: number;
  vitalityAge: number;
  predictionText: string;
  precautions: string;
}

export interface DecisionSimulation {
  energyProjected: number;
  recoveryProjected: number;
  burnoutRiskProjected: number;
  vitalityAgeChange: number;
}

export function computeDigitalTwin(metrics: BaseHealthMetrics, chronologicalAge: number = 30): HealthDigitalTwin {
  const sleepHrs = metrics.sleepHours || 0;
  const sleepQual = metrics.sleepQuality || 0;
  const hydroMl = metrics.hydrationMl || 0;
  const hydroTarget = metrics.hydrationTarget || 2500;
  const stepsVal = metrics.steps || 0;
  const stressVal = metrics.stressLevel || 30;

  // 1. Stability score (0-100)
  const hydroRatio = Math.min(1.2, hydroMl / hydroTarget);
  const sleepRatio = Math.min(1.2, sleepHrs / 8.0);
  const stability = Math.round(
    sleepQual * 0.35 + hydroRatio * 30 + (stepsVal >= 8000 ? 25 : (stepsVal / 8000) * 25) + (100 - stressVal) * 0.1
  );
  const finalStability = Math.max(0, Math.min(99, stability));

  // 2. Biological Age Shift
  let ageShift = 0.0;
  if (finalStability > 80) ageShift = -2.5;
  else if (finalStability > 65) ageShift = -1.0;
  else if (finalStability < 45) ageShift = 1.5;
  else ageShift = 0.0;

  // 3. Risk factors
  const burnout = Math.min(95, Math.max(5, Math.round(stressVal * 0.7 + (8 - sleepHrs) * 6)));
  const fatigue = Math.min(95, Math.max(5, Math.round((8 - sleepHrs) * 8 + (2500 - hydroMl) * 0.01)));
  const sleepRisk = Math.min(95, Math.max(5, Math.round((8 - sleepHrs) * 10 + (100 - sleepQual) * 0.3)));
  const recoveryRisk = Math.min(95, Math.max(5, Math.round((100 - (metrics.recoveryPercentage || 50)) * 0.8)));

  return {
    ...metrics,
    biologicalAgeShift: ageShift,
    stabilityScore: finalStability,
    recoveryPercentage: metrics.recoveryPercentage || 78,
    burnoutRisk: burnout,
    fatigueBuildup: fatigue,
    sleepDeteriorationRisk: sleepRisk,
    recoveryDeclineRisk: recoveryRisk,
    trackingDaysCount: metrics.trackingDaysCount ?? 1,
    hasTelemetry: metrics.hasTelemetry ?? true,
    hasEnergyTelemetry: metrics.hasEnergyTelemetry ?? true,
    proteinG: metrics.proteinG || 0,
    carbsG: metrics.carbsG || 0,
    fatG: metrics.fatG || 0,
    fiberG: metrics.fiberG || 0,
    sugarG: metrics.sugarG || 0,
    sodiumMg: metrics.sodiumMg || 0,
  };

}

export function generateEarlyWarnings(twin: HealthDigitalTwin): EarlyWarning[] {
  const warnings: EarlyWarning[] = [];

  if (twin.sleepHours < 6.5) {
    warnings.push({
      type: 'Sleep Debt Alert',
      severity: 'high',
      message: `Your sleep average (${twin.sleepHours}h) is accumulating a recovery deficit. High risk of afternoon cognitive fatigue.`,
      actionTrigger: 'Start Wind-down Routine',
    });
  }

  if (twin.burnoutRisk > 60) {
    warnings.push({
      type: 'Burnout Warning',
      severity: 'high',
      message: 'Elevated stress levels paired with fatigue buildup detected. Take a 10-minute relaxation break.',
      actionTrigger: 'Begin Breathing Exercise',
    });
  }

  if (twin.hydrationMl < 1500) {
    warnings.push({
      type: 'Dehydration Risk',
      severity: 'medium',
      message: 'Hydration volume is below critical metabolic threshold. Drink 500ml water to restore joint fluid kinetics.',
      actionTrigger: 'Log Water Intake',
    });
  }

  if (twin.recoveryPercentage < 60) {
    warnings.push({
      type: 'Low Physical Recovery',
      severity: 'medium',
      message: 'Muscle recovery is suppressed. High-intensity workouts today may increase injury risk.',
      actionTrigger: 'Log Active Rest',
    });
  }

  return warnings;
}

export function generateTimelineProjections(twin: HealthDigitalTwin, baseAge: number = 30): TimelineProjection[] {
  const isImproving = twin.stabilityScore >= 75;
  const isDeclining = twin.stabilityScore < 50;

  return [
    {
      day: 7,
      label: '7 Days',
      energy: isImproving ? 85 : isDeclining ? 45 : 68,
      recovery: isImproving ? 90 : isDeclining ? 40 : 65,
      sleep: isImproving ? 88 : isDeclining ? 50 : 72,
      wellness: isImproving ? 86 : isDeclining ? 48 : 70,
      vitalityAge: Math.round((baseAge + (isImproving ? -0.5 : isDeclining ? 0.5 : 0)) * 10) / 10,
      predictionText: isImproving
        ? 'Circadian rhythm aligns fully, granting sustained morning cognitive energy.'
        : 'Potential mid-afternoon energy slumps if current sleep debt persists.',
      precautions: 'Maintain a 10:00 PM wind-down routine to lock in sleep consistency.',
    },
    {
      day: 30,
      label: '30 Days',
      energy: isImproving ? 90 : isDeclining ? 35 : 70,
      recovery: isImproving ? 94 : isDeclining ? 30 : 64,
      sleep: isImproving ? 92 : isDeclining ? 45 : 72,
      wellness: isImproving ? 91 : isDeclining ? 40 : 70,
      vitalityAge: Math.round((baseAge + (isImproving ? -1.5 : isDeclining ? 1.5 : 0)) * 10) / 10,
      predictionText: isImproving
        ? 'Cardiovascular endurance spikes by ~12%, making daily physical exertions effortless.'
        : 'Muscular strain risk increases due to unmanaged physical recovery debt.',
      precautions: 'Schedule two active recovery days weekly focusing on light mobility.',
    },
    {
      day: 90,
      label: '90 Days',
      energy: isImproving ? 95 : isDeclining ? 28 : 72,
      recovery: isImproving ? 98 : isDeclining ? 22 : 66,
      sleep: isImproving ? 95 : isDeclining ? 40 : 72,
      wellness: isImproving ? 96 : isDeclining ? 35 : 70,
      vitalityAge: Math.round((baseAge + (isImproving ? -3.0 : isDeclining ? 3.0 : 0)) * 10) / 10,
      predictionText: isImproving
        ? 'Cellular turnover optimizes. Noticeable improvements in skin clarity and muscle tone.'
        : 'Risk of chronic fatigue setting in, lowering baseline immune defenses.',
      precautions: 'Ensure adequate Vitamin D and Magnesium micronutrient intake.',
    },
    {
      day: 365,
      label: '1 Year',
      energy: isImproving ? 98 : isDeclining ? 20 : 75,
      recovery: isImproving ? 100 : isDeclining ? 18 : 68,
      sleep: isImproving ? 98 : isDeclining ? 35 : 72,
      wellness: isImproving ? 98 : isDeclining ? 30 : 72,
      vitalityAge: Math.round((baseAge + (isImproving ? -5.0 : isDeclining ? 5.0 : 0)) * 10) / 10,
      predictionText: isImproving
        ? 'Complete metabolic shift. Biological age effectively reversed by up to 5 years.'
        : 'Metabolic slump risk forms without targeted diet & sleep interventions.',
      precautions: 'Schedule annual blood panel to verify new optimal baseline.',
    },
  ];
}

export function simulateDecisionImpact(
  baseTwin: HealthDigitalTwin,
  sleepAdd: number,
  waterAdd: number,
  stepsAdd: number
): DecisionSimulation {
  const energyBoost = sleepAdd * 10 + (waterAdd >= 500 ? 6 : 0) + (stepsAdd >= 2000 ? 6 : 0);
  const recoveryBoost = sleepAdd * 14 + (waterAdd >= 500 ? 8 : 0);
  const burnoutDrop = sleepAdd * 12 + (waterAdd >= 500 ? 5 : 0);

  return {
    energyProjected: Math.min(100, Math.max(10, 65 + energyBoost)),
    recoveryProjected: Math.min(100, Math.max(10, baseTwin.recoveryPercentage + recoveryBoost)),
    burnoutRiskProjected: Math.max(5, Math.min(95, baseTwin.burnoutRisk - burnoutDrop)),
    vitalityAgeChange: sleepAdd >= 1 && waterAdd >= 500 && stepsAdd >= 2000 ? -1.5 : sleepAdd < 0 ? 1.0 : 0.0,
  };
}
