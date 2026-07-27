import { HealthDigitalTwin } from "@/hooks/useHealthData";

export interface FutureHealthScore {
  direction: 'Improving' | 'Stable' | 'Declining';
  explanation: string;
}

export function getFutureHealthScore(data: HealthDigitalTwin): FutureHealthScore {
  const consistencyScore = data.stabilityScore;
  const recoveryScore = data.recoveryPercentage;

  if (consistencyScore > 80 && recoveryScore > 75) {
    return {
      direction: 'Improving',
      explanation: 'Your sleep consistency and daily habits have noticeably strengthened over the past week.'
    };
  } else if (consistencyScore < 50 || recoveryScore < 40) {
    return {
      direction: 'Declining',
      explanation: 'We are detecting inconsistent sleep schedules and dropping recovery rates, which is affecting your trajectory.'
    };
  }

  return {
    direction: 'Stable',
    explanation: 'You are maintaining a steady baseline without major improvements or regressions.'
  };
}

export interface HabitEvolution {
  habit: string;
  status: 'Growing' | 'Stable' | 'Declining';
}

export function getHabitEvolution(data: HealthDigitalTwin): HabitEvolution[] {
  const habits: HabitEvolution[] = [];

  habits.push({
    habit: 'Sleep Consistency',
    status: data.sleepQuality > 80 ? 'Growing' : data.sleepQuality > 50 ? 'Stable' : 'Declining'
  });

  const hydroRatio = data.hydrationMl / (data.hydrationTarget || 2500);
  habits.push({
    habit: 'Hydration',
    status: hydroRatio >= 1 ? 'Growing' : hydroRatio > 0.6 ? 'Stable' : 'Declining'
  });

  habits.push({
    habit: 'Active Exertion',
    status: data.physicalFatigue > 60 && data.recoveryPercentage > 70 ? 'Growing' : 'Stable'
  });

  return habits;
}

export interface FoodEvolution {
  trend: string;
  isPositive: boolean;
}

export function getFoodEvolution(data: HealthDigitalTwin): FoodEvolution[] {
  const trends: FoodEvolution[] = [];
  
  if (data.stabilityScore > 75) {
    trends.push({ trend: 'Meal timing consistency is improving', isPositive: true });
    trends.push({ trend: 'Hydration baseline is strongly supporting digestion', isPositive: true });
  } else if (data.fatigueScore > 70) {
    trends.push({ trend: 'Late-night eating may be increasing', isPositive: false });
    trends.push({ trend: 'Potential sugar spikes causing afternoon crashes', isPositive: false });
  } else {
    trends.push({ trend: 'Protein intake holding steady', isPositive: true });
    trends.push({ trend: 'Occasional skipped meals', isPositive: false });
  }

  return trends;
}

export interface EarlyWarning {
  message: string;
  severity: 'low' | 'medium' | 'high';
  type: string;
  actionTrigger: string;
  consequences: string;
}

export function getEarlyWarnings(data: HealthDigitalTwin): EarlyWarning[] {
  const warnings: EarlyWarning[] = [];
  
  if (data.sleepHours < 6) {
    warnings.push({
      type: 'Sleep Deficit',
      severity: 'high',
      message: 'Consistent sleep under 6 hours raises cortisol levels, impairs muscle repair, and suppresses natural immunity.',
      consequences: 'Potential 18% decline in athletic recovery, reduced mental focus, and increased systemic stress load.',
      actionTrigger: 'Start Wind-down Routine'
    });
  }

  if (data.caloriesConsumed > 3200) {
    warnings.push({
      type: 'Caloric Excess',
      severity: 'medium',
      message: 'Consistently high calorie intake without matching energy expenditure increases visceral fat accumulation.',
      consequences: 'Elevated risk of insulin resistance, cardiovascular strain, and lethargy.',
      actionTrigger: 'Adjust Meal Plan'
    });
  }

  if (data.stressLevel > 75) {
    warnings.push({
      type: 'Burnout Overload',
      severity: 'high',
      message: 'Your mental load and physical fatigue metrics indicate high vulnerability to acute burnout.',
      consequences: 'Risk of central fatigue, disrupted sleep cycles, and impaired cognitive sharpness.',
      actionTrigger: 'Begin Breathing Session'
    });
  }

  if (data.recoveryPercentage < 50 && data.physicalFatigue > 60) {
    warnings.push({
      type: 'Recovery Deficit',
      severity: 'medium',
      message: 'High workout intensity paired with low recovery quality threatens joint stability and muscle repair.',
      consequences: 'Higher chance of delayed-onset muscle soreness (DOMS) and ligament strains.',
      actionTrigger: 'Schedule Rest Day'
    });
  }

  if (data.hydrationMl < 1500) {
    warnings.push({
      type: 'Dehydration Alert',
      severity: 'low',
      message: 'Sub-optimal hydration drops extracellular volume, impairing kidney filtration and workout stamina.',
      consequences: 'Muscle cramping, sluggish digestion, and reduced endurance capacity.',
      actionTrigger: 'Log 500ml Water'
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
  predictionText: string;
  precautions: string;
}

export function getFutureTimeline(data: HealthDigitalTwin, currentAge: number): FutureTimelineProjection[] {
  const baseAge = currentAge;
  const isDeclining = data.stabilityScore < 50;
  const isImproving = data.stabilityScore > 80;

  return [
    {
      day: 7,
      label: '7 Days',
      energy: isImproving ? 85 : isDeclining ? 40 : 65,
      recovery: isImproving ? 90 : isDeclining ? 35 : 60,
      sleep: isImproving ? 88 : isDeclining ? 50 : 70,
      wellness: isImproving ? 85 : isDeclining ? 45 : 70,
      vitalityAge: isImproving ? Number((baseAge - 0.5).toFixed(1)) : isDeclining ? Number((baseAge + 0.5).toFixed(1)) : baseAge,
      predictionText: isImproving ? "Your sleep cycle aligns fully, giving you sustained morning energy." : "You may start feeling mid-afternoon energy crashes if current sleep debt persists.",
      precautions: "Maintain a strict 10 PM wind-down routine to solidify circadian rhythm."
    },
    {
      day: 30,
      label: '30 Days',
      energy: isImproving ? 90 : isDeclining ? 30 : 65,
      recovery: isImproving ? 95 : isDeclining ? 25 : 60,
      sleep: isImproving ? 92 : isDeclining ? 45 : 70,
      wellness: isImproving ? 90 : isDeclining ? 40 : 70,
      vitalityAge: isImproving ? Number((baseAge - 1.5).toFixed(1)) : isDeclining ? Number((baseAge + 1.5).toFixed(1)) : baseAge,
      predictionText: isImproving ? "Your cardiovascular endurance spikes, making daily tasks feel effortless." : "Risk of minor muscular strains increases due to declining recovery scores.",
      precautions: "Integrate two active recovery days per week focusing on mobility."
    },
    {
      day: 90,
      label: '90 Days',
      energy: isImproving ? 95 : isDeclining ? 25 : 65,
      recovery: isImproving ? 98 : isDeclining ? 20 : 60,
      sleep: isImproving ? 95 : isDeclining ? 40 : 70,
      wellness: isImproving ? 95 : isDeclining ? 35 : 70,
      vitalityAge: isImproving ? Number((baseAge - 3.0).toFixed(1)) : isDeclining ? Number((baseAge + 3.0).toFixed(1)) : baseAge,
      predictionText: isImproving ? "Cellular turnover rate optimizes. You'll likely see visible changes in skin and muscle tone." : "Chronic fatigue may set in, lowering your immune system's baseline defenses.",
      precautions: "Monitor micro-nutrient intake, particularly Vitamin D and Magnesium."
    },
    {
      day: 365,
      label: '1 Year',
      energy: isImproving ? 98 : isDeclining ? 20 : 65,
      recovery: isImproving ? 100 : isDeclining ? 15 : 60,
      sleep: isImproving ? 98 : isDeclining ? 35 : 70,
      wellness: isImproving ? 98 : isDeclining ? 30 : 70,
      vitalityAge: isImproving ? Number((baseAge - 5.0).toFixed(1)) : isDeclining ? Number((baseAge + 5.0).toFixed(1)) : baseAge,
      predictionText: isImproving ? "Complete metabolic shift. Your biological age is effectively reversed by up to 5 years." : "High risk of metabolic syndrome components forming without intervention.",
      precautions: "Schedule a comprehensive blood panel to establish your new healthy baseline."
    }
  ];
}

export function getHealthMilestoneForecast(data: HealthDigitalTwin): string[] {
  const milestones: string[] = [];
  
  if (data.hydrationMl >= 2000) milestones.push('Potential 30-day hydration streak');
  if (data.sleepQuality > 70) milestones.push('Potential sleep consistency milestone');
  if (data.stabilityScore > 80) milestones.push('Potential overall wellness peak record');
  if (data.physicalFatigue > 50 && data.recoveryPercentage > 70) milestones.push('Potential fitness breakthrough milestone');

  if (milestones.length === 0) milestones.push('Maintain consistency to unlock upcoming milestones');
  
  return milestones;
}

export function getPersonalizedStory(data: HealthDigitalTwin): string[] {
  const story: string[] = [];
  
  if (data.stabilityScore > 75) {
    story.push(`Your overall stability improved this month.`);
    story.push(`Your sleep schedule is protecting your recovery rate.`);
    story.push(`If this trend continues, your energy levels may improve noticeably over the next few weeks.`);
  } else if (data.stabilityScore < 50) {
    story.push(`Your consistency has dipped recently.`);
    story.push(`Your current habits are putting strain on your daily energy.`);
    story.push(`Consider a rest day to reset your baseline.`);
  } else {
    story.push(`You are maintaining a strong, steady rhythm.`);
    story.push(`Your hydration and sleep balance is working well.`);
  }

  return story;
}

export interface RiskCategory {
  name: string;
  score: number; // 0 to 100
  level: 'Low' | 'Moderate' | 'High';
  description: string;
}

export function getRiskScores(data: HealthDigitalTwin): RiskCategory[] {
  // 1. Cardiovascular Risk
  const cardioScore = Math.min(100, Math.max(10, 
    (data.stressLevel * 0.4) + ((24 - data.sleepHours) * 2.5) + (data.physicalFatigue * 0.3)
  ));
  
  // 2. Metabolic Risk
  const metabolicScore = Math.min(100, Math.max(10,
    (data.caloriesConsumed > 2800 ? 60 : 20) + (data.hydrationMl < 1800 ? 25 : 5) + (data.steps < 4000 ? 25 : 5)
  ));

  // 3. Burnout / Mental Load Risk
  const burnoutScore = Math.min(100, Math.max(10,
    (data.stressLevel * 0.5) + (data.mentalFatigue * 0.4) + (data.sleepHours < 6 ? 20 : 0)
  ));

  // 4. Recovery Deficit
  const recoveryDeficitScore = Math.min(100, Math.max(10,
    100 - data.recoveryPercentage
  ));

  return [
    {
      name: "Cardiovascular Load",
      score: Math.round(cardioScore),
      level: cardioScore > 65 ? "High" : cardioScore > 40 ? "Moderate" : "Low",
      description: cardioScore > 65 ? "Elevated strain due to high stress and sleep deficiency." : "Heart rate variability & baseline stress are within normal parameters."
    },
    {
      name: "Metabolic Risk",
      score: Math.round(metabolicScore),
      level: metabolicScore > 65 ? "High" : metabolicScore > 40 ? "Moderate" : "Low",
      description: metabolicScore > 65 ? "Inadequate hydration and movement ratio relative to calorie intake." : "Metabolic rate and daily energy balance are well matched."
    },
    {
      name: "Burnout Index",
      score: Math.round(burnoutScore),
      level: burnoutScore > 65 ? "High" : burnoutScore > 40 ? "Moderate" : "Low",
      description: burnoutScore > 65 ? "Cognitive and mental load requires immediate decompression." : "Mental sharpness and stress tolerance are well balanced."
    },
    {
      name: "Recovery Deficit",
      score: Math.round(recoveryDeficitScore),
      level: recoveryDeficitScore > 65 ? "High" : recoveryDeficitScore > 40 ? "Moderate" : "Low",
      description: recoveryDeficitScore > 65 ? "Muscular cellular repair is lagging behind daily exertion." : "Cellular recovery and HRV indices are strong."
    }
  ];
}

export interface DailyImprovementPlan {
  headline: string;
  statusMessage: string;
  recommendedMeals: { mealType: string; name: string; calories: number; why: string }[];
  hydrationGoalMl: number;
  sleepSchedule: { windDown: string; targetHours: number; tip: string };
  workoutRoutine: { title: string; durationMin: number; intensity: string; focus: string };
  recoveryActivities: string[];
  recommendedSupplements: string[];
  wellnessGoals: string[];
}

export function getDailyImprovementPlan(data: HealthDigitalTwin, profile?: any): DailyImprovementPlan {
  const isDeclining = data.stabilityScore < 50 || data.sleepHours < 6;
  const isImproving = data.stabilityScore > 80 && data.recoveryPercentage > 75;

  const dietPref = profile?.dietary_preferences || "Standard";
  const isIndian = ["South Indian", "North Indian", "Indian", "Vegetarian"].includes(dietPref);

  let breakfast = isIndian ? "Spiced Besan Chilla with Mint Chutney" : "Oatmeal with Almonds and Chia Seeds";
  let lunch = isIndian ? "Dal Tadka with Multigrain Roti & Cucumber Salad" : "Grilled Chicken Quinoa Bowl";
  let dinner = isIndian ? "Palak Paneer with Brown Rice" : "Baked Salmon with Broccoli";

  let headline = isImproving 
    ? "Peak Performance & Endurance Optimization"
    : isDeclining 
    ? "Active Recovery & Decompression Plan" 
    : "Balanced Longevity & Metabolic Protocol";

  let statusMessage = isImproving
    ? "Your digital twin shows outstanding stability! Today's plan pushes your cardiovascular and muscle endurance thresholds."
    : isDeclining
    ? "Your body is showing signs of high stress and sleep debt. Today's plan scales back intensity to focus on restorative recovery."
    : "Your biometric baseline is steady. Follow today's balanced nutrition and movement targets to build long-term stamina.";

  return {
    headline,
    statusMessage,
    recommendedMeals: [
      { mealType: "Breakfast", name: breakfast, calories: 380, why: "Provides steady complex carbs to restock glycogen without spiking morning insulin." },
      { mealType: "Lunch", name: lunch, calories: 520, why: "Lean amino acid profile supports muscle tissue repair." },
      { mealType: "Dinner", name: dinner, calories: 480, why: "Magnesium-rich foods soothe active muscle fibers before sleep." }
    ],
    hydrationGoalMl: isDeclining ? 3000 : 2500,
    sleepSchedule: {
      windDown: isDeclining ? "21:30" : "22:15",
      targetHours: isDeclining ? 8.5 : 8.0,
      tip: "Turn off screens 45 minutes prior to sleep to maximize blue-light avoidance and natural melatonin surge."
    },
    workoutRoutine: {
      title: isDeclining ? "Restorative Yoga & Light Mobility" : isImproving ? "HIIT & Resistance Training" : "Moderate Zone 2 Cardio & Core",
      durationMin: isDeclining ? 20 : isImproving ? 45 : 30,
      intensity: isDeclining ? "Low" : isImproving ? "High" : "Moderate",
      focus: isDeclining ? "Parasympathetic nervous system activation" : "Hypertrophy & VO2 Max elevation"
    },
    recoveryActivities: isDeclining
      ? ["10-min Diaphragmatic Breathing", "Foam rolling hamstrings & back", "Epsom salt warm bath"]
      : ["Post-workout active stretching", "5-min cold rinse", "Hydration check at 4 PM"],
    recommendedSupplements: ["Magnesium Glycinate (300mg)", "Omega-3 Fatty Acids (1000mg)", "Vitamin D3 + K2"],
    wellnessGoals: [
      `Hit ${isDeclining ? 3000 : 2500}ml hydration target`,
      `Log at least ${isDeclining ? 7.5 : 8.0} hours of quality sleep`,
      "Complete 10 minutes of evening stress reduction"
    ]
  };
}

export function simulateDecisionImpact(baseData: HealthDigitalTwin, sleepAdd: number, waterAdd: number, stepsAdd: number): any {
  const newSleep = (baseData.sleepHours || 7) + sleepAdd;
  const newWater = (baseData.hydrationMl || 2000) + waterAdd;
  const newSteps = (baseData.steps || 5000) + stepsAdd;

  const energyBoost = (sleepAdd * 10) + (waterAdd > 500 ? 5 : 0) + (stepsAdd > 2000 ? 5 : 0);
  const recoveryBoost = (sleepAdd * 15) + (waterAdd > 1000 ? 10 : 0);
  
  return {
    energyProjected: Math.min(100, Math.max(10, 60 + energyBoost)),
    recoveryProjected: Math.min(100, Math.max(10, 50 + recoveryBoost)),
    burnoutRiskProjected: Math.max(5, 50 - (sleepAdd * 15)),
    vitalityAgeChange: (sleepAdd >= 1 && waterAdd >= 500 && stepsAdd >= 2000) ? -1.5 : (sleepAdd < 0 ? 1 : 0)
  };
}
