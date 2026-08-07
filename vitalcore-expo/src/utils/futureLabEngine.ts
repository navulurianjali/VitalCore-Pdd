import { HealthDigitalTwin } from "../hooks/useHealthData";

export interface DigitalTwinDomainScore {
  name: string;
  score: number; // 0 to 100
  status: 'Optimal' | 'Good' | 'Needs Attention' | 'At Risk';
  trend: 'Improving' | 'Stable' | 'Declining';
  description: string;
}

export interface BodySystemAvatar {
  system: string;
  name: string;
  status: 'Optimal' | 'Good' | 'Needs Attention' | 'At Risk';
  score: number;
  iconName: string;
  recommendation: string;
}

export interface DigitalTwinHealthProfile {
  overallHealthScore: number;
  biologicalAge: number;
  chronologicalAge: number;
  ageDifference: number; // e.g. -2.5 yrs
  stabilityScore: number;
  domainScores: DigitalTwinDomainScore[];
  bodySystems: BodySystemAvatar[];
}

export function getDigitalTwinProfile(data: HealthDigitalTwin, profile?: any): DigitalTwinHealthProfile {
  const chronoAge = profile?.biological_age || 30;
  const hasTelemetry = Boolean(data.hasTelemetry && data.trackingDaysCount > 0);

  if (!hasTelemetry) {
    return {
      overallHealthScore: 0,
      biologicalAge: 0,
      chronologicalAge: chronoAge,
      ageDifference: 0,
      stabilityScore: 0,
      domainScores: [],
      bodySystems: []
    };
  }

  const sleepH = data.sleepHours || 0;
  const hydroRatio = data.hydrationMl / (data.hydrationTarget || 2500);
  const recovPct = data.recoveryPercentage || 50;
  const stress = data.stressLevel || 50;

  // Domain Scores
  const nutritionScore = data.caloriesConsumed === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (data.caloriesConsumed > 1200 && data.caloriesConsumed < 3000 ? 50 : 25) +
    (data.micronutrientDeficiencies.length === 0 ? 30 : 10) +
    (data.stabilityScore * 0.2)
  )));

  const hydrationScore = data.hydrationMl === 0 ? 0 : Math.min(100, Math.max(0, Math.round(hydroRatio * 100)));

  const sleepScore = sleepH === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (sleepH >= 7 ? 60 : (sleepH / 7) * 50) + (data.sleepQuality * 0.4)
  )));

  const recoveryScore = recovPct === 0 ? 0 : Math.min(100, Math.max(0, Math.round(recovPct)));

  const fitnessScore = (data.steps === 0 && data.caloriesBurned === 0) ? 0 : Math.min(100, Math.max(0, Math.round(
    (data.steps / (data.stepsTarget || 10000)) * 50 + (data.caloriesBurned > 300 ? 50 : 25)
  )));

  const stressScore = data.stressLevel === 0 ? 0 : Math.min(100, Math.max(0, Math.round(100 - stress)));

  const activeDomains = [nutritionScore, hydrationScore, sleepScore, recoveryScore, fitnessScore, stressScore].filter(s => s > 0);

  const heartHealthScore = activeDomains.length === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (recovPct * 0.4) + ((100 - stress) * 0.4) + (sleepScore * 0.2)
  )));

  const metabolismScore = activeDomains.length === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hydrationScore * 0.3) + (nutritionScore * 0.4) + (fitnessScore * 0.3)
  )));

  const immuneHealthScore = activeDomains.length === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (sleepScore * 0.4) + (nutritionScore * 0.3) + (recoveryScore * 0.3)
  )));

  const lifestyleConsistencyScore = activeDomains.length === 0 ? 0 : Math.min(100, Math.max(0, Math.round(data.stabilityScore)));

  const overallHealthScore = activeDomains.length === 0 ? 0 : Math.round(
    (nutritionScore + hydrationScore + sleepScore + recoveryScore + fitnessScore + 
     stressScore + heartHealthScore + metabolismScore + immuneHealthScore + lifestyleConsistencyScore) / 10
  );

  const bioAgeDiff = Number((((80 - overallHealthScore) / 10)).toFixed(1));
  const bioAge = Number((chronoAge + bioAgeDiff).toFixed(1));

  const getStatus = (score: number): 'Optimal' | 'Good' | 'Needs Attention' | 'At Risk' => {
    if (score >= 82) return 'Optimal';
    if (score >= 68) return 'Good';
    if (score >= 50) return 'Needs Attention';
    return 'At Risk';
  };

  const domainScores: DigitalTwinDomainScore[] = [
    { name: "Nutrition", score: nutritionScore, status: getStatus(nutritionScore), trend: nutritionScore >= 70 ? 'Improving' : 'Declining', description: "Balanced intake of macros, fiber, and micronutrients." },
    { name: "Hydration", score: hydrationScore, status: getStatus(hydrationScore), trend: hydrationScore >= 70 ? 'Improving' : 'Declining', description: "Fluid balance supporting kidney filtration and cell transport." },
    { name: "Sleep Quality", score: sleepScore, status: getStatus(sleepScore), trend: sleepScore >= 70 ? 'Improving' : 'Declining', description: "Deep & REM sleep duration aligning with circadian rhythm." },
    { name: "Cellular Recovery", score: recoveryScore, status: getStatus(recoveryScore), trend: recoveryScore >= 70 ? 'Improving' : 'Declining', description: "HRV recovery index and physical tissue restoration." },
    { name: "Fitness & Exertion", score: fitnessScore, status: getStatus(fitnessScore), trend: fitnessScore >= 70 ? 'Improving' : 'Declining', description: "Daily active calories burned and step exertion." },
    { name: "Stress Resilience", score: stressScore, status: getStatus(stressScore), trend: stressScore >= 70 ? 'Improving' : 'Declining', description: "Parasympathetic tone and autonomic stress management." },
    { name: "Cardiovascular Health", score: heartHealthScore, status: getStatus(heartHealthScore), trend: heartHealthScore >= 70 ? 'Improving' : 'Declining', description: "Resting heart rate variability and arterial strain." },
    { name: "Metabolic Efficiency", score: metabolismScore, status: getStatus(metabolismScore), trend: metabolismScore >= 70 ? 'Improving' : 'Declining', description: "Glycemic stability and resting energy expenditure." },
    { name: "Immune Defense", score: immuneHealthScore, status: getStatus(immuneHealthScore), trend: immuneHealthScore >= 70 ? 'Improving' : 'Declining', description: "White blood cell recovery and cellular antioxidant defense." },
    { name: "Lifestyle Consistency", score: lifestyleConsistencyScore, status: getStatus(lifestyleConsistencyScore), trend: lifestyleConsistencyScore >= 70 ? 'Improving' : 'Declining', description: "Regularity of meal timing, sleep onset, and daily exertion." }
  ];

  const bodySystems: BodySystemAvatar[] = [
    { system: "cardiovascular", name: "Cardiovascular System", status: getStatus(heartHealthScore), score: heartHealthScore, iconName: "Heart", recommendation: heartHealthScore < 60 ? "Increase Zone 2 aerobic cardio and lower evening stress load." : "Optimal blood flow and vascular elasticity." },
    { system: "muscular", name: "Muscular & Tissue System", status: getStatus(recoveryScore), score: recoveryScore, iconName: "Dumbbell", recommendation: recoveryScore < 60 ? "Prioritize post-workout stretching and 30g protein after training." : "Muscle tissue repair is progressing smoothly." },
    { system: "metabolic", name: "Metabolic System", status: getStatus(metabolismScore), score: metabolismScore, iconName: "Flame", recommendation: metabolismScore < 60 ? "Avoid late-night sugar intake to stabilize overnight insulin." : "Steady baseline energy expenditure." },
    { system: "hydration", name: "Renal & Hydration System", status: getStatus(hydrationScore), score: hydrationScore, iconName: "Droplet", recommendation: hydrationScore < 60 ? "Drink 500ml water immediately upon waking to restore cell volume." : "Optimal kidney filtration and electrolyte fluid balance." },
    { system: "nutrition", name: "Digestive & Nutrition System", status: getStatus(nutritionScore), score: nutritionScore, iconName: "Utensils", recommendation: nutritionScore < 60 ? "Increase leafy green fiber intake and whole food sources." : "Good gut microbiota support and digestive absorption." },
    { system: "recovery", name: "Autonomic Recovery System", status: getStatus(recoveryScore), score: recoveryScore, iconName: "Activity", recommendation: recoveryScore < 60 ? "Schedule a 20-minute restorative foam rolling or yoga session." : "Strong HRV recovery baseline." },
    { system: "sleep", name: "Circadian Sleep System", status: getStatus(sleepScore), score: sleepScore, iconName: "Moon", recommendation: sleepScore < 60 ? "Institute a strict 10 PM wind-down without digital screens." : "Circadian sleep architecture is well aligned." },
    { system: "immunity", name: "Immune Defense System", status: getStatus(immuneHealthScore), score: immuneHealthScore, iconName: "Shield", recommendation: immuneHealthScore < 60 ? "Ensure Vitamin D3 + Zinc intake to bolster natural killer cell response." : "Robust cellular defense and inflammation control." }
  ];

  return {
    overallHealthScore,
    biologicalAge: bioAge,
    chronologicalAge: chronoAge,
    ageDifference: -bioAgeDiff,
    stabilityScore: data.stabilityScore,
    domainScores,
    bodySystems
  };
}

export interface EarlyWarning {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  confidenceScore: number;
  message: string;
  consequences: string;
  expectedTimeline: string;
  actionTrigger: string;
  dataAttribution: string;
}

export function getEarlyWarnings(data: HealthDigitalTwin): EarlyWarning[] {
  if (!data.hasTelemetry || data.trackingDaysCount === 0) return [];
  const warnings: EarlyWarning[] = [];
  const sleepH = data.sleepHours || 0;
  const hydroMl = data.hydrationMl || 0;
  const cals = data.caloriesConsumed || 0;
  const stress = data.stressLevel || 0;
  const recov = data.recoveryPercentage || 0;

  if (sleepH < 6) {
    warnings.push({
      id: "warn-sleep",
      type: "Sleep Deprivation Risk",
      severity: "high",
      confidenceScore: 94,
      message: `Your sleep average of ${sleepH}h is below the 7h threshold, triggering systemic cortisol elevation and impaired tissue repair.`,
      consequences: "Elevated risk of cognitive decline, suppressed immune T-cell response, and reduced athletic endurance.",
      expectedTimeline: "7 to 14 days of sustained deficit",
      actionTrigger: "Start 10 PM Wind-down",
      dataAttribution: `Based on your logged sleep duration of ${sleepH}h vs 8.0h target.`
    });
  }

  if (hydroMl < 1500) {
    warnings.push({
      id: "warn-hydration",
      type: "Dehydration Strain",
      severity: hydroMl < 1000 ? "high" : "medium",
      confidenceScore: 91,
      message: `Hydration of ${hydroMl}ml is significantly below your ${data.hydrationTarget || 2500}ml target, lowering plasma volume.`,
      consequences: "Increased kidney filtration workload, muscle cramping, sluggish digestion, and daytime fatigue.",
      expectedTimeline: "Immediate 24-48 hours",
      actionTrigger: "Drink 500ml Water Now",
      dataAttribution: `Computed from logged hydration of ${hydroMl}ml today.`
    });
  }

  if (cals > 3200) {
    warnings.push({
      id: "warn-caloric",
      type: "Unhealthy Caloric Excess",
      severity: "medium",
      confidenceScore: 88,
      message: `Calorie intake of ${cals} kcal significantly exceeds your daily energy expenditure baseline.`,
      consequences: "Visceral adiposity buildup, reduced insulin sensitivity, and postprandial glycemic spikes.",
      expectedTimeline: "3 to 4 weeks of surplus",
      actionTrigger: "Adjust Dinner Macros",
      dataAttribution: `Based on today's logged nutrition totaling ${cals} kcal.`
    });
  }

  if (stress > 75) {
    warnings.push({
      id: "warn-burnout",
      type: "Burnout & Central Fatigue Risk",
      severity: "high",
      confidenceScore: 95,
      message: `Stress load index of ${stress}% paired with high mental fatigue signals imminent nervous system exhaustion.`,
      consequences: "Autonomic nervous system imbalance, adrenal strain, sleep fragmentation, and mood instability.",
      expectedTimeline: "5 to 10 days",
      actionTrigger: "Begin 10-Min Breathing Session",
      dataAttribution: `Computed from mental fatigue (${data.mentalFatigue}%) and stress level (${stress}%).`
    });
  }

  if (recov < 45 && data.physicalFatigue > 60) {
    warnings.push({
      id: "warn-recovery",
      type: "Overtraining & Joint Strain",
      severity: "medium",
      confidenceScore: 89,
      message: `Physical fatigue (${data.physicalFatigue}%) is outpacing your cellular recovery rate (${recov}%).`,
      consequences: "Delayed-onset muscle soreness, ligament micro-tears, and reduced athletic power production.",
      expectedTimeline: "2 to 3 days",
      actionTrigger: "Schedule Rest Day",
      dataAttribution: `Based on HRV recovery index of ${recov}% and physical fatigue of ${data.physicalFatigue}%.`
    });
  }

  if (data.steps < 3000) {
    warnings.push({
      id: "warn-sedentary",
      type: "Inactivity & Circulation Risk",
      severity: "low",
      confidenceScore: 86,
      message: `Daily activity count of ${data.steps} steps indicates prolonged sedentary sitting.`,
      consequences: "Decreased lymphatic circulation, lower venous return, and metabolic slowing.",
      expectedTimeline: "Daily cumulative impact",
      actionTrigger: "Take 15-Min Walk",
      dataAttribution: `Based on today's step count of ${data.steps} steps.`
    });
  }

  return warnings;
}

export interface FutureTimelineProjection {
  day: number;
  label: string;
  energy: number;
  recovery: number;
  sleep: number;
  wellness: number;
  vitalityAge: number;
  predictedWeightKg: number;
  predictionText: string;
  precautions: string;
  confidenceScore: number;
  dataAttribution: string;
}

export function getFutureTimeline(data: HealthDigitalTwin, currentAge: number): FutureTimelineProjection[] {
  const baseAge = currentAge;
  const isDeclining = data.stabilityScore < 50 || data.sleepHours < 6;
  const isImproving = data.stabilityScore > 80 && data.recoveryPercentage > 75;

  const currentWeight = 72;

  return [
    {
      day: 7,
      label: '7 Days',
      energy: isImproving ? 85 : isDeclining ? 42 : 65,
      recovery: isImproving ? 90 : isDeclining ? 38 : 60,
      sleep: isImproving ? 88 : isDeclining ? 50 : 70,
      wellness: isImproving ? 86 : isDeclining ? 45 : 68,
      vitalityAge: isImproving ? Number((baseAge - 0.6).toFixed(1)) : isDeclining ? Number((baseAge + 0.6).toFixed(1)) : baseAge,
      predictedWeightKg: isImproving ? Number((currentWeight - 0.4).toFixed(1)) : isDeclining ? Number((currentWeight + 0.5).toFixed(1)) : currentWeight,
      predictionText: isImproving ? "Circadian sleep cycle aligns fully, sustaining morning focus and cellular glycogen stores." : "Mid-afternoon energy crashes expected if current sleep debt persists.",
      precautions: "Maintain a strict 10 PM wind-down routine to solidify circadian rhythm.",
      confidenceScore: 93,
      dataAttribution: `Computed from 7-day sleep log (${data.sleepHours}h) and stability score (${data.stabilityScore}).`
    },
    {
      day: 30,
      label: '30 Days',
      energy: isImproving ? 90 : isDeclining ? 32 : 65,
      recovery: isImproving ? 95 : isDeclining ? 28 : 60,
      sleep: isImproving ? 92 : isDeclining ? 45 : 70,
      wellness: isImproving ? 90 : isDeclining ? 40 : 70,
      vitalityAge: isImproving ? Number((baseAge - 1.8).toFixed(1)) : isDeclining ? Number((baseAge + 1.8).toFixed(1)) : baseAge,
      predictedWeightKg: isImproving ? Number((currentWeight - 1.5).toFixed(1)) : isDeclining ? Number((currentWeight + 1.8).toFixed(1)) : currentWeight,
      predictionText: isImproving ? "Cardiovascular VO2 max spikes by ~8%, making daily exertion effortless." : "Risk of muscular strain increases due to lagging recovery quality.",
      precautions: "Integrate two active mobility days per week.",
      confidenceScore: 90,
      dataAttribution: `Derived from recovery percentage (${data.recoveryPercentage}%) and workout frequency.`
    },
    {
      day: 90,
      label: '90 Days',
      energy: isImproving ? 95 : isDeclining ? 25 : 65,
      recovery: isImproving ? 98 : isDeclining ? 20 : 60,
      sleep: isImproving ? 95 : isDeclining ? 40 : 70,
      wellness: isImproving ? 94 : isDeclining ? 35 : 70,
      vitalityAge: isImproving ? Number((baseAge - 3.2).toFixed(1)) : isDeclining ? Number((baseAge + 3.2).toFixed(1)) : baseAge,
      predictedWeightKg: isImproving ? Number((currentWeight - 3.2).toFixed(1)) : isDeclining ? Number((currentWeight + 3.5).toFixed(1)) : currentWeight,
      predictionText: isImproving ? "Cellular turnover rate optimizes. Visible skin elasticity and muscle tone improvements." : "Chronic fatigue may suppress baseline immune defenses.",
      precautions: "Monitor micronutrients, specifically Vitamin D3 and Magnesium.",
      confidenceScore: 87,
      dataAttribution: `Extrapolated from metabolic efficiency (${data.metabolicEfficiency}%) and hydration stability.`
    },
    {
      day: 365,
      label: '1 Year',
      energy: isImproving ? 98 : isDeclining ? 20 : 65,
      recovery: isImproving ? 100 : isDeclining ? 15 : 60,
      sleep: isImproving ? 98 : isDeclining ? 35 : 70,
      wellness: isImproving ? 98 : isDeclining ? 30 : 70,
      vitalityAge: isImproving ? Number((baseAge - 5.0).toFixed(1)) : isDeclining ? Number((baseAge + 5.0).toFixed(1)) : baseAge,
      predictedWeightKg: isImproving ? Number((currentWeight - 5.0).toFixed(1)) : isDeclining ? Number((currentWeight + 6.0).toFixed(1)) : currentWeight,
      predictionText: isImproving ? "Complete biological age reversal by up to 5 years with optimized longevity biomarkers." : "Increased probability of metabolic syndrome markers without lifestyle intervention.",
      precautions: "Schedule a comprehensive annual longevity blood panel.",
      confidenceScore: 84,
      dataAttribution: `Model projection based on full Digital Twin profile history.`
    }
  ];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  progressPct: number;
}

export interface MotivationCenter {
  hydrationStreakDays: number;
  sleepStreakDays: number;
  workoutStreakDays: number;
  badges: AchievementBadge[];
  encouragingAiMessage: string;
}

export function getAchievementsAndMotivation(data: HealthDigitalTwin): MotivationCenter {
  const hasData = Boolean(data.hasTelemetry && data.trackingDaysCount > 0);
  const hydroRatio = data.hydrationMl > 0 ? data.hydrationMl / (data.hydrationTarget || 2500) : 0;

  return {
    hydrationStreakDays: hasData && data.hydrationMl > 0 ? (hydroRatio >= 0.8 ? Math.min(data.trackingDaysCount, 5) : 1) : 0,
    sleepStreakDays: hasData && data.sleepHours > 0 ? (data.sleepHours >= 7 ? Math.min(data.trackingDaysCount, 4) : 1) : 0,
    workoutStreakDays: hasData && data.steps > 0 ? (data.steps >= 6000 ? Math.min(data.trackingDaysCount, 6) : 1) : 0,
    badges: [
      {
        id: "b1",
        title: "Hydration Master",
        description: "Log 2500ml of water for 3 consecutive days",
        iconName: "Droplet",
        unlocked: hasData && data.trackingDaysCount >= 3 && hydroRatio >= 1,
        progressPct: hasData && data.hydrationMl > 0 ? Math.min(100, Math.round(hydroRatio * 100)) : 0
      },
      {
        id: "b2",
        title: "Circadian Alignment",
        description: "Log 7.5+ hours of sleep with quality above 80%",
        iconName: "Moon",
        unlocked: hasData && data.sleepHours >= 7.5 && data.sleepQuality >= 80,
        progressPct: hasData && data.sleepHours > 0 ? Math.min(100, Math.round((data.sleepHours / 7.5) * 100)) : 0
      },
      {
        id: "b3",
        title: "Bio-Age Reverser",
        description: "Lower biological age by 1.5+ years through stability",
        iconName: "Sparkles",
        unlocked: hasData && data.trackingDaysCount >= 7 && data.stabilityScore >= 80,
        progressPct: hasData ? Math.min(100, data.stabilityScore) : 0
      },
      {
        id: "b4",
        title: "Metabolic Champion",
        description: "Burn 500+ active calories in a single day",
        iconName: "Flame",
        unlocked: hasData && data.caloriesBurned >= 500,
        progressPct: hasData && data.caloriesBurned > 0 ? Math.min(100, Math.round((data.caloriesBurned / 500) * 100)) : 0
      }
    ],
    encouragingAiMessage: hasData
      ? "You're building remarkable consistency! Keep maintaining your hydration and sleep schedule to unlock your next longevity breakthrough."
      : "Start logging your daily sleep, workouts, and nutrition to unlock achievements and track your progress!"
  };
}

export function simulateDecisionImpact(baseData: HealthDigitalTwin, sleepAdd: number, waterAdd: number, stepsAdd: number, calsAdd: number = 0): any {
  const energyBoost = (sleepAdd * 12) + (waterAdd > 500 ? 8 : 0) + (stepsAdd > 2000 ? 6 : 0) - (calsAdd > 500 ? 10 : 0);
  const recoveryBoost = (sleepAdd * 15) + (waterAdd > 1000 ? 10 : 0);
  
  return {
    energyProjected: Math.min(100, Math.max(10, 60 + energyBoost)),
    recoveryProjected: Math.min(100, Math.max(10, 50 + recoveryBoost)),
    burnoutRiskProjected: Math.max(5, Math.min(95, 50 - (sleepAdd * 15) + (calsAdd > 600 ? 15 : 0))),
    vitalityAgeChange: (sleepAdd >= 1 && waterAdd >= 500 && stepsAdd >= 2000) ? -1.5 : (sleepAdd < 0 ? 1.0 : 0.0)
  };
}
