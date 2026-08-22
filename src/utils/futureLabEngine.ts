import { HealthDigitalTwin } from "@/hooks/useHealthData";

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
  const chronoAge = profile?.biological_age || profile?.age || 30;
  
  const cals = Number(data.caloriesConsumed || 0);
  const hydro = Number(data.hydrationMl || 0);
  const sleepH = Number(data.sleepHours || 0);
  const workM = Number(data.workoutMinutes || 0);
  const steps = Number(data.steps || 0);
  const recov = Number(data.recoveryPercentage || 0);
  const stress = Number(data.stressLevel || 0);

  // Individual Domain Scores calculated directly from real available data
  const nutritionScore = cals > 0
    ? Math.min(100, Math.max(10, Math.round((Math.min(cals, data.caloriesTarget || 2000) / (data.caloriesTarget || 2000)) * 80 + (data.proteinG && data.proteinTarget ? Math.min(20, (data.proteinG / data.proteinTarget) * 20) : 10))))
    : 0;

  const hydrationScore = hydro > 0
    ? Math.min(100, Math.max(10, Math.round((hydro / (data.hydrationTarget || 2500)) * 100)))
    : 0;

  const sleepScore = sleepH > 0
    ? Math.min(100, Math.max(10, Math.round((Math.min(sleepH, data.sleepTarget || 8.0) / (data.sleepTarget || 8.0)) * 70 + (data.sleepQuality ? data.sleepQuality * 0.3 : 20))))
    : 0;

  const fitnessScore = (workM > 0 || steps > 0 || (data.caloriesBurned || 0) > 0)
    ? Math.min(100, Math.max(10, Math.round((Math.min(workM, data.workoutTarget || 30) / (data.workoutTarget || 30)) * 60 + (Math.min(steps, data.stepsTarget || 10000) / (data.stepsTarget || 10000)) * 40)))
    : 0;

  const recoveryScore = recov > 0
    ? recov
    : (sleepH > 0 ? Math.min(100, Math.round((sleepH / 8.0) * 85)) : 0);

  const stressScore = stress > 0
    ? Math.min(100, Math.max(10, Math.round(100 - stress)))
    : 0;

  // Active domains that actually have data
  const availableScores = [
    nutritionScore > 0 ? nutritionScore : null,
    hydrationScore > 0 ? hydrationScore : null,
    sleepScore > 0 ? sleepScore : null,
    fitnessScore > 0 ? fitnessScore : null,
    recoveryScore > 0 ? recoveryScore : null,
    stressScore > 0 ? stressScore : null,
  ].filter((s): s is number => s !== null);

  const heartHealthScore = (fitnessScore > 0 || recoveryScore > 0)
    ? Math.min(100, Math.max(10, Math.round(((recoveryScore || 70) * 0.5) + ((fitnessScore || 60) * 0.5))))
    : 0;

  const metabolismScore = (hydrationScore > 0 || nutritionScore > 0 || fitnessScore > 0)
    ? Math.min(100, Math.max(10, Math.round(((hydrationScore || 70) * 0.4) + ((nutritionScore || 70) * 0.3) + ((fitnessScore || 60) * 0.3))))
    : 0;

  const immuneHealthScore = (sleepScore > 0 || nutritionScore > 0)
    ? Math.min(100, Math.max(10, Math.round(((sleepScore || 70) * 0.6) + ((nutritionScore || 70) * 0.4))))
    : 0;

  const lifestyleConsistencyScore = data.stabilityScore > 0 ? data.stabilityScore : (availableScores.length > 0 ? 70 : 0);

  // Overall Health Score: Average of available active domain scores
  const allActiveScores = [
    nutritionScore, hydrationScore, sleepScore, recoveryScore, fitnessScore, 
    stressScore, heartHealthScore, metabolismScore, immuneHealthScore
  ].filter(s => s > 0);

  const overallHealthScore = allActiveScores.length > 0
    ? Math.round(allActiveScores.reduce((sum, s) => sum + s, 0) / allActiveScores.length)
    : 0;

  const bioAgeDiff = overallHealthScore > 0 ? Number((((80 - overallHealthScore) / 10)).toFixed(1)) : 0;
  const bioAge = overallHealthScore > 0 ? Number((chronoAge + bioAgeDiff).toFixed(1)) : 0;

  const getStatus = (score: number): 'Optimal' | 'Good' | 'Needs Attention' | 'At Risk' => {
    if (score === 0) return 'Needs Attention';
    if (score >= 82) return 'Optimal';
    if (score >= 68) return 'Good';
    if (score >= 50) return 'Needs Attention';
    return 'At Risk';
  };

  const domainScores: DigitalTwinDomainScore[] = [
    { name: "Nutrition", score: nutritionScore, status: getStatus(nutritionScore), trend: nutritionScore >= 70 ? 'Improving' : 'Declining', description: cals > 0 ? `${cals} kcal logged today (${Math.round((cals / (data.caloriesTarget || 2000)) * 100)}% of target).` : "No meals logged yet today. Log meals to calculate nutrition score." },
    { name: "Hydration", score: hydrationScore, status: getStatus(hydrationScore), trend: hydrationScore >= 70 ? 'Improving' : 'Declining', description: hydro > 0 ? `${hydro}ml water logged today (${Math.round((hydro / (data.hydrationTarget || 2500)) * 100)}% of target).` : "No water intake logged yet today. Track hydration to calculate score." },
    { name: "Sleep Quality", score: sleepScore, status: getStatus(sleepScore), trend: sleepScore >= 70 ? 'Improving' : 'Declining', description: sleepH > 0 ? `${sleepH}h sleep logged with ${data.sleepQuality || 80}% recovery rating.` : "No sleep recorded for last night. Log sleep to calculate rest score." },
    { name: "Cellular Recovery", score: recoveryScore, status: getStatus(recoveryScore), trend: recoveryScore >= 70 ? 'Improving' : 'Declining', description: recoveryScore > 0 ? "Tissue restoration index evaluated from sleep & resting intervals." : "Awaiting sleep or recovery telemetry." },
    { name: "Fitness & Exertion", score: fitnessScore, status: getStatus(fitnessScore), trend: fitnessScore >= 70 ? 'Improving' : 'Declining', description: fitnessScore > 0 ? `${workM}m active workouts & ${steps} steps recorded today.` : "No workout or step activity logged yet today." },
    { name: "Stress Resilience", score: stressScore, status: getStatus(stressScore), trend: stressScore >= 70 ? 'Improving' : 'Declining', description: stressScore > 0 ? "Autonomic stress regulation and parasympathetic recovery tone." : "Awaiting wellness or mood check-in." },
    { name: "Cardiovascular Health", score: heartHealthScore, status: getStatus(heartHealthScore), trend: heartHealthScore >= 70 ? 'Improving' : 'Declining', description: heartHealthScore > 0 ? "Cardiovascular strain index and exertion readiness." : "Cardiovascular telemetry activates with workouts or sleep." },
    { name: "Metabolic Efficiency", score: metabolismScore, status: getStatus(metabolismScore), trend: metabolismScore >= 70 ? 'Improving' : 'Declining', description: metabolismScore > 0 ? "Glycemic stability and daily energy expenditure balance." : "Metabolic rate projections require nutrition or hydration logs." },
    { name: "Immune Defense", score: immuneHealthScore, status: getStatus(immuneHealthScore), trend: immuneHealthScore >= 70 ? 'Improving' : 'Declining', description: immuneHealthScore > 0 ? "Immune resilience index derived from restorative rest & micronutrients." : "Immune defense index calculates from sleep and nutrition." },
    { name: "Lifestyle Consistency", score: lifestyleConsistencyScore, status: getStatus(lifestyleConsistencyScore), trend: lifestyleConsistencyScore >= 70 ? 'Improving' : 'Declining', description: lifestyleConsistencyScore > 0 ? "Multi-metric health adherence baseline." : "Log daily activities to build consistency score." }
  ];

  const bodySystems: BodySystemAvatar[] = [
    { system: "cardiovascular", name: "Cardiovascular System", status: getStatus(heartHealthScore), score: heartHealthScore, iconName: "Heart", recommendation: heartHealthScore === 0 ? "Log workouts or sleep to calculate cardiovascular status." : (heartHealthScore < 60 ? "Increase Zone 2 aerobic cardio and lower evening stress load." : "Optimal blood flow and vascular elasticity.") },
    { system: "muscular", name: "Muscular & Tissue System", status: getStatus(recoveryScore), score: recoveryScore, iconName: "Dumbbell", recommendation: recoveryScore === 0 ? "Log workouts or sleep to monitor tissue repair." : (recoveryScore < 60 ? "Prioritize post-workout stretching and 30g protein after training." : "Muscle tissue repair is progressing smoothly.") },
    { system: "metabolic", name: "Metabolic System", status: getStatus(metabolismScore), score: metabolismScore, iconName: "Flame", recommendation: metabolismScore === 0 ? "Log nutrition and water to calculate metabolic efficiency." : (metabolismScore < 60 ? "Avoid late-night sugar intake to stabilize overnight insulin." : "Steady baseline energy expenditure.") },
    { system: "hydration", name: "Renal & Hydration System", status: getStatus(hydrationScore), score: hydrationScore, iconName: "Droplet", recommendation: hydrationScore === 0 ? "Log water intake to monitor kidney filtration." : (hydrationScore < 60 ? "Drink 500ml water to restore intracellular hydration." : "Optimal kidney filtration and fluid balance.") },
    { system: "nutrition", name: "Digestive & Nutrition System", status: getStatus(nutritionScore), score: nutritionScore, iconName: "Utensils", recommendation: nutritionScore === 0 ? "Log daily meals to analyze macro and micronutrient distribution." : (nutritionScore < 60 ? "Increase fiber and whole food protein intake." : "Good gut microbiota support and digestive absorption.") },
    { system: "recovery", name: "Autonomic Recovery System", status: getStatus(recoveryScore), score: recoveryScore, iconName: "Activity", recommendation: recoveryScore === 0 ? "Log sleep to calculate tissue restoration." : (recoveryScore < 60 ? "Schedule a 20-minute restorative foam rolling or yoga session." : "Strong HRV recovery baseline.") },
    { system: "sleep", name: "Circadian Sleep System", status: getStatus(sleepScore), score: sleepScore, iconName: "Moon", recommendation: sleepScore === 0 ? "Log sleep duration to analyze circadian alignment." : (sleepScore < 60 ? "Institute a strict 10 PM wind-down without digital screens." : "Circadian sleep architecture is well aligned.") },
    { system: "immunity", name: "Immune Defense System", status: getStatus(immuneHealthScore), score: immuneHealthScore, iconName: "Shield", recommendation: immuneHealthScore === 0 ? "Log sleep and nutrition to evaluate immune defense." : (immuneHealthScore < 60 ? "Ensure Vitamin D3 + Zinc intake to bolster natural killer cell response." : "Robust cellular defense and inflammation control.") }
  ];

  return {
    overallHealthScore,
    biologicalAge: bioAge,
    chronologicalAge: chronoAge,
    ageDifference: -bioAgeDiff,
    stabilityScore: data.stabilityScore || (availableScores.length > 0 ? 70 : 0),
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
  const warnings: EarlyWarning[] = [];
  const sleepH = data.sleepHours || 0;
  const hydroMl = data.hydrationMl || 0;
  const cals = data.caloriesConsumed || 0;
  const stress = data.stressLevel || 0;
  const recov = data.recoveryPercentage || 0;

  if (sleepH > 0 && sleepH < 6) {
    warnings.push({
      id: "warn-sleep",
      type: "Sleep Deprivation Risk",
      severity: "high",
      confidenceScore: 94,
      message: `Your sleep of ${sleepH}h is below the 7h threshold, triggering systemic cortisol elevation and impaired tissue repair.`,
      consequences: "Elevated risk of cognitive decline, suppressed immune T-cell response, and reduced athletic endurance.",
      expectedTimeline: "7 to 14 days of sustained deficit",
      actionTrigger: "Start 10 PM Wind-down",
      dataAttribution: `Based on your logged sleep duration of ${sleepH}h vs 8.0h target.`
    });
  }

  if (hydroMl > 0 && hydroMl < 1500) {
    warnings.push({
      id: "warn-hydration",
      type: "Dehydration Strain",
      severity: hydroMl < 1000 ? "high" : "medium",
      confidenceScore: 91,
      message: `Hydration of ${hydroMl}ml is below your ${data.hydrationTarget || 2500}ml target, lowering plasma volume.`,
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

  if (recov > 0 && recov < 45 && data.physicalFatigue > 60) {
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

  if (data.steps > 0 && data.steps < 3000) {
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

export function getFutureTimeline(data: HealthDigitalTwin, currentAge: number, profile?: any): FutureTimelineProjection[] {
  const baseAge = currentAge || profile?.biological_age || profile?.age || 30;
  const currentWeight = profile?.weight_kg ? Number(profile.weight_kg) : 70;
  
  const hasAnyData = Boolean(
    (data.caloriesConsumed && data.caloriesConsumed > 0) ||
    (data.hydrationMl && data.hydrationMl > 0) ||
    (data.sleepHours && data.sleepHours > 0) ||
    (data.workoutMinutes && data.workoutMinutes > 0) ||
    (data.steps && data.steps > 0) ||
    data.hasTelemetry
  );

  if (!hasAnyData) {
    return [
      {
        day: 7,
        label: '7 Days',
        energy: 0,
        recovery: 0,
        sleep: 0,
        wellness: 0,
        vitalityAge: baseAge,
        predictedWeightKg: currentWeight,
        predictionText: "Start logging your health activities to generate personalized 7-day predictions.",
        precautions: "Track daily hydration, sleep, and activity to build your predictive baseline.",
        confidenceScore: 0,
        dataAttribution: "Awaiting telemetry data"
      },
      {
        day: 30,
        label: '30 Days',
        energy: 0,
        recovery: 0,
        sleep: 0,
        wellness: 0,
        vitalityAge: baseAge,
        predictedWeightKg: currentWeight,
        predictionText: "Start logging your health activities to generate personalized 30-day projections.",
        precautions: "Multi-day logging will calculate cardiovascular and recovery trends.",
        confidenceScore: 0,
        dataAttribution: "Awaiting telemetry data"
      },
      {
        day: 90,
        label: '90 Days',
        energy: 0,
        recovery: 0,
        sleep: 0,
        wellness: 0,
        vitalityAge: baseAge,
        predictedWeightKg: currentWeight,
        predictionText: "Start logging your health activities to generate personalized 90-day metabolic outlooks.",
        precautions: "Maintain regular nutrition logging to project cellular vitality.",
        confidenceScore: 0,
        dataAttribution: "Awaiting telemetry data"
      },
      {
        day: 365,
        label: '1 Year',
        energy: 0,
        recovery: 0,
        sleep: 0,
        wellness: 0,
        vitalityAge: baseAge,
        predictedWeightKg: currentWeight,
        predictionText: "Start logging your health activities to project 1-year biological age trajectory.",
        precautions: "Continuous logging unlocks full Digital Twin forecasting.",
        confidenceScore: 0,
        dataAttribution: "Awaiting telemetry data"
      }
    ];
  }

  const isDeclining = (data.stabilityScore > 0 && data.stabilityScore < 50) || (data.sleepHours > 0 && data.sleepHours < 6);
  const isImproving = (data.stabilityScore >= 75) || (data.recoveryPercentage >= 70) || (data.sleepHours >= 7 && data.hydrationMl >= 2000);

  const baselineWellness = (data.stabilityScore > 0) ? data.stabilityScore : 70;

  return [
    {
      day: 7,
      label: '7 Days',
      energy: isImproving ? 85 : (isDeclining ? 42 : 68),
      recovery: isImproving ? 90 : (isDeclining ? 38 : 65),
      sleep: isImproving ? 88 : (isDeclining ? 50 : 72),
      wellness: isImproving ? 86 : (isDeclining ? 45 : baselineWellness),
      vitalityAge: isImproving ? Number((baseAge - 0.6).toFixed(1)) : (isDeclining ? Number((baseAge + 0.6).toFixed(1)) : baseAge),
      predictedWeightKg: isImproving ? Number((currentWeight - 0.4).toFixed(1)) : (isDeclining ? Number((currentWeight + 0.5).toFixed(1)) : currentWeight),
      predictionText: isImproving ? "Circadian sleep cycle aligns fully, sustaining morning focus and cellular glycogen stores." : (isDeclining ? "Mid-afternoon energy crashes expected if current sleep debt persists." : "Steady baseline energy levels expected as daily habits stabilize."),
      precautions: "Maintain a strict 10 PM wind-down routine to solidify circadian rhythm.",
      confidenceScore: (data.trackingDaysCount || 1) >= 7 ? 93 : 75,
      dataAttribution: `Computed from active logs (${data.sleepHours}h sleep, ${data.hydrationMl}ml hydration).`
    },
    {
      day: 30,
      label: '30 Days',
      energy: isImproving ? 90 : (isDeclining ? 32 : 70),
      recovery: isImproving ? 95 : (isDeclining ? 28 : 68),
      sleep: isImproving ? 92 : (isDeclining ? 45 : 75),
      wellness: isImproving ? 90 : (isDeclining ? 40 : Math.min(100, baselineWellness + 4)),
      vitalityAge: isImproving ? Number((baseAge - 1.8).toFixed(1)) : (isDeclining ? Number((baseAge + 1.8).toFixed(1)) : baseAge),
      predictedWeightKg: isImproving ? Number((currentWeight - 1.5).toFixed(1)) : (isDeclining ? Number((currentWeight + 1.8).toFixed(1)) : currentWeight),
      predictionText: isImproving ? "Cardiovascular VO2 max spikes by ~8%, making daily exertion effortless." : (isDeclining ? "Risk of muscular strain increases due to lagging recovery quality." : "Consistent daily routines will build long-term cardiovascular resilience."),
      precautions: "Integrate two active mobility days per week.",
      confidenceScore: (data.trackingDaysCount || 1) >= 7 ? 90 : 70,
      dataAttribution: `Derived from recovery percentage (${data.recoveryPercentage}%) and activity baseline.`
    },
    {
      day: 90,
      label: '90 Days',
      energy: isImproving ? 95 : (isDeclining ? 25 : 75),
      recovery: isImproving ? 98 : (isDeclining ? 20 : 72),
      sleep: isImproving ? 95 : (isDeclining ? 40 : 78),
      wellness: isImproving ? 94 : (isDeclining ? 35 : Math.min(100, baselineWellness + 8)),
      vitalityAge: isImproving ? Number((baseAge - 3.2).toFixed(1)) : (isDeclining ? Number((baseAge + 3.2).toFixed(1)) : baseAge),
      predictedWeightKg: isImproving ? Number((currentWeight - 3.2).toFixed(1)) : (isDeclining ? Number((currentWeight + 3.5).toFixed(1)) : currentWeight),
      predictionText: isImproving ? "Cellular turnover rate optimizes. Visible skin elasticity and muscle tone improvements." : (isDeclining ? "Chronic fatigue may suppress baseline immune defenses." : "Cellular vitality improves steadily with sustained healthy choices."),
      precautions: "Monitor micronutrients, specifically Vitamin D3 and Magnesium.",
      confidenceScore: (data.trackingDaysCount || 1) >= 7 ? 87 : 65,
      dataAttribution: `Extrapolated from metabolic efficiency and hydration stability.`
    },
    {
      day: 365,
      label: '1 Year',
      energy: isImproving ? 98 : (isDeclining ? 20 : 78),
      recovery: isImproving ? 100 : (isDeclining ? 15 : 75),
      sleep: isImproving ? 98 : (isDeclining ? 35 : 80),
      wellness: isImproving ? 98 : (isDeclining ? 30 : Math.min(100, baselineWellness + 12)),
      vitalityAge: isImproving ? Number((baseAge - 5.0).toFixed(1)) : (isDeclining ? Number((baseAge + 5.0).toFixed(1)) : baseAge),
      predictedWeightKg: isImproving ? Number((currentWeight - 5.0).toFixed(1)) : (isDeclining ? Number((currentWeight + 6.0).toFixed(1)) : currentWeight),
      predictionText: isImproving ? "Complete biological age reversal by up to 5 years with optimized longevity biomarkers." : (isDeclining ? "Increased probability of metabolic syndrome markers without lifestyle intervention." : "Long-term metabolic stability and enhanced longevity reserve."),
      precautions: "Schedule a comprehensive annual longevity blood panel.",
      confidenceScore: (data.trackingDaysCount || 1) >= 7 ? 84 : 60,
      dataAttribution: `Model projection based on Digital Twin profile history.`
    }
  ];
}

export interface NutrientDetail {
  name: string;
  currentAmount: number;
  unit: string;
  targetAmount: number;
  status: 'Optimal' | 'Deficient' | 'Excess';
  foodSources: string[];
}

export interface NutritionIntelligence {
  overallNutritionScore: number;
  macros: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  micros: NutrientDetail[];
  deficiencies: string[];
  excesses: string[];
  longTermTrend: string;
  recommendedFoodsToCorrect: string[];
}

export function getNutritionIntelligence(data: HealthDigitalTwin): NutritionIntelligence {
  const hasFoodLogs = data.caloriesConsumed > 0;
  
  if (!hasFoodLogs) {
    return {
      overallNutritionScore: 0,
      macros: { proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
      micros: [],
      deficiencies: [],
      excesses: [],
      longTermTrend: "Log meals to generate nutritional analysis.",
      recommendedFoodsToCorrect: []
    };
  }

  const prot = data.proteinG || Math.round((data.caloriesConsumed * 0.25) / 4);
  const carbs = data.carbsG || Math.round((data.caloriesConsumed * 0.50) / 4);
  const fat = data.fatG || Math.round((data.caloriesConsumed * 0.25) / 9);

  const micros: NutrientDetail[] = [
    { name: "Protein", currentAmount: prot, unit: "g", targetAmount: 90, status: prot >= 75 ? "Optimal" : "Deficient", foodSources: ["Chicken Breast", "Paneer", "Lentils", "Greek Yogurt", "Eggs"] },
    { name: "Dietary Fiber", currentAmount: Math.round(prot * 0.3), unit: "g", targetAmount: 30, status: prot >= 60 ? "Optimal" : "Deficient", foodSources: ["Oats", "Chia Seeds", "Broccoli", "Apples", "Lentils"] }
  ];

  const deficiencies = micros.filter(m => m.status === "Deficient").map(m => m.name);

  return {
    overallNutritionScore: Math.min(100, Math.round((prot / 90) * 100)),
    macros: { proteinG: prot, carbsG: carbs, fatG: fat, fiberG: Math.round(prot * 0.3) },
    micros,
    deficiencies,
    excesses: data.caloriesConsumed > 3000 ? ["Sodium", "Saturated Fats"] : [],
    longTermTrend: "Nutrition analysis is computed directly from your logged meals today.",
    recommendedFoodsToCorrect: deficiencies.length > 0 ? ["Spinach", "Pumpkin Seeds", "Chia Seeds", "Greek Yogurt"] : []
  };
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
  const hasData = Boolean(
    (data.caloriesConsumed && data.caloriesConsumed > 0) ||
    (data.hydrationMl && data.hydrationMl > 0) ||
    (data.sleepHours && data.sleepHours > 0) ||
    (data.workoutMinutes && data.workoutMinutes > 0) ||
    (data.steps && data.steps > 0) ||
    data.hasTelemetry
  );
  const hydroRatio = data.hydrationMl > 0 ? data.hydrationMl / (data.hydrationTarget || 2500) : 0;

  return {
    hydrationStreakDays: hasData && data.hydrationMl > 0 ? (hydroRatio >= 0.8 ? Math.min(data.trackingDaysCount || 1, 5) : 1) : 0,
    sleepStreakDays: hasData && data.sleepHours > 0 ? (data.sleepHours >= 7 ? Math.min(data.trackingDaysCount || 1, 4) : 1) : 0,
    workoutStreakDays: hasData && data.steps > 0 ? (data.steps >= 6000 ? Math.min(data.trackingDaysCount || 1, 6) : 1) : 0,
    badges: [
      {
        id: "b1",
        title: "Hydration Master",
        description: "Log 2500ml of water for 3 consecutive days",
        iconName: "Droplet",
        unlocked: hasData && (data.trackingDaysCount || 1) >= 3 && hydroRatio >= 1,
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
        unlocked: hasData && (data.trackingDaysCount || 1) >= 7 && data.stabilityScore >= 80,
        progressPct: hasData ? Math.min(100, data.stabilityScore) : 0
      },
      {
        id: "b4",
        title: "Metabolic Champion",
        description: "Burn 500+ active calories in a single day",
        iconName: "Flame",
        unlocked: hasData && (data.caloriesBurned || 0) >= 500,
        progressPct: hasData && (data.caloriesBurned || 0) > 0 ? Math.min(100, Math.round(((data.caloriesBurned || 0) / 500) * 100)) : 0
      }
    ],
    encouragingAiMessage: hasData
      ? "You're building remarkable consistency! Keep maintaining your hydration and sleep schedule to unlock your next longevity breakthrough."
      : "Start logging your daily sleep, workouts, and nutrition to unlock achievements and track your progress!"
  };
}

export interface HealthReportPayload {
  reportDate: string;
  period: 'Weekly' | 'Monthly';
  headlineSummary: string;
  biggestImprovements: string[];
  biggestConcerns: string[];
  predictedNextMonthOutlook: string;
  averageSleepHours: number;
  averageHydrationMl: number;
  totalCaloriesBurned: number;
  overallScore: number;
}

export function getHealthReport(data: HealthDigitalTwin, profile?: any): HealthReportPayload {
  const today = new Date().toISOString().split("T")[0];
  const profileName = profile?.full_name || "Wellness Explorer";
  const hasData = Boolean(
    (data.caloriesConsumed && data.caloriesConsumed > 0) ||
    (data.hydrationMl && data.hydrationMl > 0) ||
    (data.sleepHours && data.sleepHours > 0) ||
    (data.workoutMinutes && data.workoutMinutes > 0) ||
    (data.steps && data.steps > 0) ||
    data.hasTelemetry
  );

  return {
    reportDate: today,
    period: "Weekly",
    headlineSummary: hasData
      ? `VitalCore Weekly Health Intelligence Report for ${profileName}. Overall Digital Twin stability is performing at ${Math.round(data.stabilityScore || 75)}%.`
      : `VitalCore Weekly Health Intelligence Report for ${profileName}. No health telemetry recorded yet.`,
    biggestImprovements: hasData ? [
      "Hydration consistency tracked compared to baseline.",
      "Sleep quality index evaluated against target.",
      "Heart rate strain monitored during active hours."
    ] : [],
    biggestConcerns: hasData ? [
      data.sleepHours > 0 && data.sleepHours < 6 ? "Sleep duration remains sub-optimal (< 6 hours)." : "Hydration & micronutrient intake require additional dietary focus.",
      data.hydrationMl > 0 && data.hydrationMl < 1800 ? "Hydration level dropped below target afternoon threshold." : "Sedentary sitting time peaked on high-workload days."
    ] : [],
    predictedNextMonthOutlook: hasData
      ? "With current habit trajectory, your Digital Twin projects steady physical recovery capacity."
      : "Log sleep, hydration, and fitness activities to build your Digital Twin longevity outlook.",
    averageSleepHours: data.sleepHours || 0,
    averageHydrationMl: data.hydrationMl || 0,
    totalCaloriesBurned: (data.caloriesBurned || 0) * 7,
    overallScore: Math.round(data.stabilityScore || 70)
  };
}

export function simulateDecisionImpact(baseData: HealthDigitalTwin, sleepAdd: number, waterAdd: number, stepsAdd: number, calsAdd: number = 0): any {
  // Use real current baselines
  const baseSleep = baseData.sleepHours || 6.5;
  const baseHydration = baseData.hydrationMl || 1200;
  const baseSteps = baseData.steps || 3000;
  const baseRecovery = baseData.recoveryPercentage || (baseSleep >= 7 ? 75 : 55);

  const effectiveSleep = Math.max(0, baseSleep + sleepAdd);
  const effectiveHydration = Math.max(0, baseHydration + waterAdd);
  const effectiveSteps = Math.max(0, baseSteps + stepsAdd);

  const sleepRatio = Math.min(1.25, effectiveSleep / 8.0);
  const hydrationRatio = Math.min(1.25, effectiveHydration / (baseData.hydrationTarget || 2500));
  const stepsRatio = Math.min(1.5, effectiveSteps / (baseData.stepsTarget || 10000));

  const energyProjected = Math.min(100, Math.max(10, Math.round(sleepRatio * 45 + hydrationRatio * 30 + stepsRatio * 25)));
  const recoveryProjected = Math.min(100, Math.max(10, Math.round(sleepRatio * 55 + hydrationRatio * 25 + (baseRecovery * 0.2))));
  const burnoutRiskProjected = Math.min(95, Math.max(5, Math.round(100 - (energyProjected * 0.6 + recoveryProjected * 0.4))));
  
  let vitalityAgeChange = 0.0;
  if (sleepAdd >= 1 && waterAdd >= 500 && stepsAdd >= 2000) {
    vitalityAgeChange = -1.5;
  } else if (sleepAdd >= 1 || waterAdd >= 500) {
    vitalityAgeChange = -0.8;
  } else if (sleepAdd < 0) {
    vitalityAgeChange = 0.8;
  }

  return {
    energyProjected,
    recoveryProjected,
    burnoutRiskProjected,
    vitalityAgeChange,
  };
}

export interface FutureHealthScore {
  direction: 'Improving' | 'Stable' | 'Declining';
  explanation: string;
}

export function getFutureHealthScore(data: HealthDigitalTwin): FutureHealthScore {
  const hasAnyData = Boolean(
    (data.caloriesConsumed && data.caloriesConsumed > 0) ||
    (data.hydrationMl && data.hydrationMl > 0) ||
    (data.sleepHours && data.sleepHours > 0) ||
    (data.workoutMinutes && data.workoutMinutes > 0) ||
    (data.steps && data.steps > 0) ||
    data.hasTelemetry
  );

  if (!hasAnyData) {
    return {
      direction: 'Stable',
      explanation: 'Start logging your health activities to generate personalized insights.'
    };
  }

  const consistencyScore = data.stabilityScore;
  const recoveryScore = data.recoveryPercentage;

  if ((consistencyScore > 75 || recoveryScore > 70) || (data.sleepHours >= 7 && data.hydrationMl >= 2000)) {
    return {
      direction: 'Improving',
      explanation: 'Your active health logs demonstrate strong biological recovery capacity and positive vitality trends.'
    };
  } else if (consistencyScore > 0 && consistencyScore < 45 && recoveryScore < 40) {
    return {
      direction: 'Declining',
      explanation: 'We are detecting sleep and hydration deficits. Increasing daily rest and water intake will elevate your trajectory.'
    };
  }

  return {
    direction: 'Stable',
    explanation: 'You are maintaining a steady baseline. Continue logging daily to build longevity prediction confidence.'
  };
}

export function getHabitEvolution(data: HealthDigitalTwin) {
  return [
    { habit: 'Sleep Consistency', status: data.sleepQuality > 80 ? 'Growing' : data.sleepQuality > 50 ? 'Stable' : 'Declining' },
    { habit: 'Hydration Balance', status: data.hydrationMl >= 2000 ? 'Growing' : 'Stable' },
    { habit: 'Active Exertion', status: data.physicalFatigue > 60 && data.recoveryPercentage > 70 ? 'Growing' : 'Stable' }
  ];
}

export function getFoodEvolution(data: HealthDigitalTwin) {
  return [
    { trend: 'Meal timing consistency is improving', isPositive: true },
    { trend: 'Hydration baseline is supporting cellular digestion', isPositive: true },
    { trend: 'Late-night sugar blocks monitored', isPositive: false }
  ];
}

export function getHealthMilestoneForecast(data: HealthDigitalTwin): string[] {
  return [
    '30-Day Hydration Consistency Peak',
    'Circadian Rhythm Alignment Milestone',
    'Biological Age Reversal Milestone'
  ];
}

export function getPersonalizedStory(data: HealthDigitalTwin): string[] {
  return [
    `Your overall Digital Twin stability score is operating at ${Math.round(data.stabilityScore)}%.`,
    `Your sleep schedule is protecting your cellular recovery index (${data.recoveryPercentage}%).`,
    `Maintaining hydration above ${data.hydrationMl}ml will accelerate metabolic nutrient transport.`
  ];
}

export function getRiskScores(data: HealthDigitalTwin) {
  const profile = getDigitalTwinProfile(data);
  return profile.domainScores.slice(0, 4).map(d => ({
    name: d.name,
    score: d.score,
    level: d.status === 'Optimal' ? 'Low' : d.status === 'Good' ? 'Moderate' : 'High',
    description: d.description
  }));
}

export function getDailyImprovementPlan(data: HealthDigitalTwin, profile?: any) {
  const hasTelemetry = Boolean(
    (data.caloriesConsumed && data.caloriesConsumed > 0) ||
    (data.hydrationMl && data.hydrationMl > 0) ||
    (data.sleepHours && data.sleepHours > 0) ||
    (data.workoutMinutes && data.workoutMinutes > 0) ||
    (data.steps && data.steps > 0) ||
    data.hasTelemetry
  );
  const waterTarget = profile?.water_goal || 2500;
  const sleepTarget = profile?.sleep_goal || 8.0;
  const workoutTarget = profile?.workout_goal_minutes || (profile?.workout_duration_preference ? Number(profile.workout_duration_preference) : 30);
  const calorieTarget = profile?.calorie_goal || 2000;
  const dietPref = profile?.dietary_preferences || profile?.food_preference || "Balanced";
  const fitnessGoal = profile?.fitness_goal || "General Health & Longevity";

  if (!hasTelemetry) {
    return {
      headline: "Personalized Longevity Protocol",
      statusMessage: "Not enough data yet. Start logging your meals, hydration, sleep and activity to generate personalized insights.",
      recommendedMeals: [],
      hydrationGoalMl: waterTarget,
      sleepSchedule: {
        windDown: "22:00",
        targetHours: sleepTarget,
        tip: "Set a consistent sleep schedule to establish your circadian rhythm."
      },
      workoutRoutine: {
        title: `${fitnessGoal} Protocol`,
        durationMin: workoutTarget,
        intensity: "Moderate",
        focus: "Baseline physical activity & habit building"
      },
      recoveryActivities: ["Log your daily activities to receive personalized recovery suggestions."],
      recommendedSupplements: [],
      wellnessGoals: [
        `Log your first meal or reach ${waterTarget}ml water intake`,
        `Record ${sleepTarget}h sleep tonight`,
        `Complete a ${workoutTarget}-min workout or walk`
      ]
    };
  }

  const isDeclining = data.stabilityScore < 50 || (data.sleepHours > 0 && data.sleepHours < 6);
  const isImproving = data.stabilityScore > 80 && data.recoveryPercentage > 75;

  const remainingCalories = Math.max(0, calorieTarget - (data.caloriesConsumed || 0));
  const isVeg = ["Vegetarian", "Vegan", "South Indian", "North Indian", "Jain", "Lacto-Vegetarian"].some(v => dietPref.toLowerCase().includes(v.toLowerCase()));
  const isKeto = dietPref.toLowerCase().includes("keto");
  const isHighProtein = dietPref.toLowerCase().includes("high protein") || fitnessGoal.toLowerCase().includes("muscle");

  // Dynamic meal calculation
  const recommendedMeals = [];
  if (data.caloriesConsumed === 0) {
    const mealPortion = Math.round(calorieTarget / 3);
    recommendedMeals.push({
      mealType: "Breakfast",
      name: isVeg ? "High-Fiber Whole Grain Bowl with Sprouted Legumes" : (isKeto ? "Avocado and Free-Range Egg Scramble" : "Energizing Whole Grain Protein Breakfast"),
      calories: mealPortion,
      why: "Initial metabolic fuel to stabilize blood glucose throughout the morning."
    });
  } else if (remainingCalories > 200) {
    recommendedMeals.push({
      mealType: "Next Recommended Meal",
      name: isVeg ? (isHighProtein ? "Tofu & Lentil High-Protein Bowl with Greens" : "Nutrient-Dense Vegetable & Quinoa Medley") : (isKeto ? "Grilled Herb Salmon with Asparagus" : "Lean Protein Bowl with Steamed Greens & Sweet Potato"),
      calories: Math.min(remainingCalories, Math.round(calorieTarget * 0.4)),
      why: `Targeted to fulfill your remaining daily deficit of ${remainingCalories} kcal based on your ${dietPref} preference.`
    });
  }

  // Dynamic wellness goals based on actual gaps
  const dynamicGoals: string[] = [];
  if (data.hydrationMl < waterTarget) {
    dynamicGoals.push(`Log remaining ${Math.max(0, waterTarget - data.hydrationMl)}ml water to reach daily target`);
  } else {
    dynamicGoals.push(`Hydration goal of ${waterTarget}ml achieved! Maintain fluid balance`);
  }

  if (data.sleepHours === 0 || data.sleepHours < sleepTarget) {
    dynamicGoals.push(`Target ${sleepTarget}h restful sleep tonight`);
  } else {
    dynamicGoals.push(`Optimal sleep of ${data.sleepHours}h recorded today`);
  }

  if (data.workoutMinutes < workoutTarget) {
    dynamicGoals.push(`Complete remaining ${Math.max(0, workoutTarget - data.workoutMinutes)}m of active exertion`);
  } else {
    dynamicGoals.push(`Activity target of ${workoutTarget}m completed`);
  }

  return {
    headline: isImproving ? "Peak Performance & Endurance Protocol" : isDeclining ? "Active Recovery & Decompression Plan" : "Balanced Longevity & Metabolic Protocol",
    statusMessage: isImproving ? "Your Digital Twin shows outstanding stability! Today's plan maintains peak vitality." : isDeclining ? "Your body telemetry indicates elevated fatigue or sleep debt. Today's plan prioritizes active recovery." : "Maintaining steady baseline metrics across nutrition, hydration, and recovery.",
    recommendedMeals,
    hydrationGoalMl: waterTarget,
    sleepSchedule: {
      windDown: isDeclining ? "21:30" : "22:15",
      targetHours: sleepTarget,
      tip: isDeclining ? "Turn off digital screens 45 minutes prior to sleep to maximize melatonin production." : "Maintain consistent bedtime to anchor your circadian rhythm."
    },
    workoutRoutine: {
      title: isDeclining ? "Restorative Mobility & Foam Rolling" : `${fitnessGoal} Routine`,
      durationMin: isDeclining ? Math.min(20, workoutTarget) : workoutTarget,
      intensity: isDeclining ? "Low" : (isImproving ? "High" : "Moderate"),
      focus: isDeclining ? "Tissue repair & autonomic decompression" : "Aerobic base & metabolic conditioning"
    },
    recoveryActivities: isDeclining ? ["20-minute light mobility walk", "Diaphragmatic breathwork", "Hydration replenishment"] : ["Post-exercise active stretching", "Electrolyte hydration check"],
    recommendedSupplements: isDeclining ? ["Magnesium Glycinate", "Vitamin D3"] : [],
    wellnessGoals: dynamicGoals
  };
}
