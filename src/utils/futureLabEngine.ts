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

  // Sleep
  habits.push({
    habit: 'Sleep Consistency',
    status: data.sleepQuality > 80 ? 'Growing' : data.sleepQuality > 50 ? 'Stable' : 'Declining'
  });

  // Hydration
  const hydroRatio = data.hydrationMl / (data.hydrationTarget || 2500);
  habits.push({
    habit: 'Hydration',
    status: hydroRatio >= 1 ? 'Growing' : hydroRatio > 0.6 ? 'Stable' : 'Declining'
  });

  // Exercise
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
}

export function getEarlyWarnings(data: HealthDigitalTwin): EarlyWarning[] {
  const warnings: EarlyWarning[] = [];
  
  if (data.sleepHours < 6) {
    warnings.push({
      type: 'Sleep',
      severity: 'high',
      message: 'We noticed your sleep schedule has become less consistent this week, increasing your sleep debt.',
      actionTrigger: 'Start Wind-down Routine'
    });
  }

  if (data.stressLevel > 75) {
    warnings.push({
      type: 'Burnout',
      severity: 'high',
      message: 'Your stress and mental load are creating a rising burnout trend. Taking a step back today is recommended.',
      actionTrigger: 'Begin Breathing Exercise'
    });
  }

  if (data.recoveryPercentage < 50 && data.physicalFatigue > 60) {
    warnings.push({
      type: 'Recovery',
      severity: 'medium',
      message: 'Your physical recovery is declining. Make sure you are stretching and hydrating properly.',
      actionTrigger: 'Log Rest Day'
    });
  }

  if (data.hydrationMl < 1500) {
    warnings.push({
      type: 'Hydration',
      severity: 'low',
      message: 'A poor hydration trend is forming. This will eventually impact your energy levels.',
      actionTrigger: 'Log Water Intake'
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
      vitalityAge: isImproving ? baseAge - 0.5 : isDeclining ? baseAge + 0.5 : baseAge,
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
      vitalityAge: isImproving ? baseAge - 1.5 : isDeclining ? baseAge + 1.5 : baseAge,
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
      vitalityAge: isImproving ? baseAge - 3 : isDeclining ? baseAge + 3 : baseAge,
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
      vitalityAge: isImproving ? baseAge - 5 : isDeclining ? baseAge + 5 : baseAge,
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

// Decision Impact Tool (Simulator)
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
