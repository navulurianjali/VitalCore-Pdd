// Centralized Future Health Prediction Engine for VitalCore Mobile & Web
// Warm, simple, human language only. No complex wellness jargon.

export interface TelemetryData {
  sleepHours: number;
  sleepQuality: number;
  hydrationMl: number;
  hydrationTarget: number;
  stressLevel: number;
  fatigueScore: number;
  physicalFatigue: number;
  mentalFatigue: number;
  sorenessLevel: number;
  recoveryPercentage: number;
  stabilityScore: number;
  caffeineIntake?: string; // e.g., 'high', 'moderate', 'none'
  screenTimeHours?: number;
}

export interface PredictionResult {
  burnoutRisk: number; // 0-100
  fatigueBuildup: number; // 0-100
  stressOverloadRisk: number; // 0-100
  sleepDeteriorationRisk: number; // 0-100
  recoveryDeclineRisk: number; // 0-100
  biologicalAgeShift: number; // e.g., -1.2 means feeling 1.2 years younger
  futureEnergyTrends: number[]; // 7-day forecast
  preventiveReminders: string[];
  aiInsights: string[];
}

/**
 * Calculates a complete suite of future health predictions and alerts
 * based on user habits and daily lifestyle inputs.
 */
export function calculateFutureHealthPredictions(data: TelemetryData): PredictionResult {
  // 1. Compute Burnout Risk
  let burnout = Math.round(
    data.stressLevel * 0.45 + 
    (100 - data.sleepQuality) * 0.35 + 
    data.fatigueScore * 0.2
  );
  burnout = Math.min(100, Math.max(0, burnout));

  // 2. Compute Fatigue Buildup
  const sleepDebtHrs = Math.max(0, 8.0 - data.sleepHours);
  let fatigue = Math.round(
    data.physicalFatigue * 0.35 + 
    data.mentalFatigue * 0.35 + 
    (sleepDebtHrs > 0 ? sleepDebtHrs * 12.5 : 0)
  );
  fatigue = Math.min(100, Math.max(0, fatigue));

  // 3. Compute Stress Overload Risk
  let stressOverload = Math.round(
    data.stressLevel * 0.65 + 
    data.mentalFatigue * 0.35
  );
  stressOverload = Math.min(100, Math.max(0, stressOverload));

  // 4. Compute Sleep Deterioration Risk
  const screenTimeImpact = data.screenTimeHours && data.screenTimeHours > 8 ? 15 : 0;
  const caffeineImpact = data.caffeineIntake === "high" ? 20 : data.caffeineIntake === "moderate" ? 8 : 0;
  let sleepDecline = Math.round(
    (100 - data.sleepQuality) * 0.4 + 
    data.stressLevel * 0.3 + 
    screenTimeImpact + 
    caffeineImpact
  );
  sleepDecline = Math.min(100, Math.max(0, sleepDecline));

  // 5. Compute Recovery Decline Risk
  const hydrationRatio = data.hydrationMl / data.hydrationTarget;
  const hydrationDebtImpact = hydrationRatio < 0.8 ? (1.0 - hydrationRatio) * 40 : 0;
  let recoveryDecline = Math.round(
    (100 - data.recoveryPercentage) * 0.5 + 
    data.sorenessLevel * 4 + 
    hydrationDebtImpact
  );
  recoveryDecline = Math.min(100, Math.max(0, recoveryDecline));

  // 6. Biological Age Shift
  let ageShift = 0.0;
  if (data.stabilityScore >= 85) {
    ageShift = -1.5 - ((data.stabilityScore - 85) * 0.1);
  } else if (data.stabilityScore < 60) {
    ageShift = 1.0 + ((60 - data.stabilityScore) * 0.15);
  } else {
    ageShift = -0.5;
  }
  ageShift = Math.round(ageShift * 10) / 10;

  // 7. Future 7-day energy trends simulation
  const futureEnergyTrends: number[] = [];
  const baseEnergy = 100 - (fatigue * 0.5 + data.stressLevel * 0.2);
  for (let i = 0; i < 7; i++) {
    const growthFactor = data.stabilityScore >= 75 ? (i * (data.stabilityScore - 75) * 0.4) : (i * (data.stabilityScore - 75) * 0.5);
    const dayNoise = Math.sin(i * 1.2) * 5;
    const estVal = Math.round(baseEnergy + growthFactor + dayNoise);
    futureEnergyTrends.push(Math.min(95, Math.max(15, estVal)));
  }

  // 8. Generate preventive alerts / reminders
  const preventiveReminders: string[] = [];
  const hasTelemetry = Boolean(data.sleepHours > 0 || data.hydrationMl > 0 || data.recoveryPercentage > 0 || data.stressLevel > 0);

  if (hasTelemetry) {
    if (data.sleepHours > 0 && data.sleepHours < 6.0) {
      preventiveReminders.push("Rest Reminder: Your recent sleep pattern indicates a recovery deficit. Focus on getting restful sleep tonight.");
    }
    if (data.hydrationMl > 0 && hydrationRatio < 0.7) {
      preventiveReminders.push("Hydration Check: Your water intake is below your daily goal. Drink extra water to maintain cellular hydration.");
    }
    if (data.stressLevel > 65) {
      preventiveReminders.push("Take a Breath: High stress detected. Take a 2-minute relaxation break to recalibrate.");
    }
    if (data.sorenessLevel > 6) {
      preventiveReminders.push("Muscle Care: Your body is feeling tight. A gentle stretch or warm walk will accelerate recovery.");
    }
    if (data.physicalFatigue > 60 && data.recoveryPercentage < 50 && data.recoveryPercentage > 0) {
      preventiveReminders.push("Recharge Mode: Your energy is running low today. Focus on light rest to bounce back stronger.");
    }

    if (preventiveReminders.length === 0) {
      preventiveReminders.push("Your recorded habits support stable energy levels. Keep up this healthy daily rhythm!");
    }
  } else {
    preventiveReminders.push("Start logging your daily activity, hydration, and sleep to generate personalized health recommendations.");
  }

  // 9. Generate AI future health insights
  const aiInsights: string[] = [];
  if (hydrationRatio < 0.85) {
    aiInsights.push("Drinking a little less water recently might slow down your muscle repair. Keeping your cup full helps you feel fresh and less sore.");
  } else {
    aiInsights.push("Your consistent water drinking is doing wonders! It is actively keeping your muscles hydrated and speeding up your workout recovery.");
  }

  if (data.sleepQuality < 70) {
    aiInsights.push("A few restless nights can start building up fatigue. Winding down without screens 30 minutes before bed will help you get deeper rest.");
  } else {
    aiInsights.push("Your sleep has been wonderfully regular! This consistent rest is the reason you are feeling so focused and energetic in the mornings.");
  }

  if (burnout > 55) {
    aiInsights.push("Your body is carrying a bit of stress lately. Slowing down your evening routine will help prevent you from feeling burnt out next week.");
  } else {
    aiInsights.push("Your stress and work levels are in perfect balance. You're doing a fantastic job managing your daily pace.");
  }

  if (data.stabilityScore >= 80) {
    aiInsights.push("Your current lifestyle decisions are supporting great long-term health! You will likely notice even better stamina if you keep this up.");
  } else {
    aiInsights.push("It looks like you've been a little less active this week. Just a quick 10-minute walk today can significantly boost your energy tomorrow.");
  }

  return {
    burnoutRisk: burnout,
    fatigueBuildup: fatigue,
    stressOverloadRisk: stressOverload,
    sleepDeteriorationRisk: sleepDecline,
    recoveryDeclineRisk: recoveryDecline,
    biologicalAgeShift: ageShift,
    futureEnergyTrends,
    preventiveReminders,
    aiInsights
  };
}

export interface TwinForecastPoint {
  month: string;
  constructiveScore: number;
  destructiveScore: number;
}

export const getDigitalTwinForecast = (
  baseStability: number,
  months: number = 6
): TwinForecastPoint[] => {
  const points: TwinForecastPoint[] = [];
  let currentCon = baseStability;
  let currentDes = baseStability;

  for (let i = 0; i <= months; i++) {
    points.push({
      month: `Month ${i}`,
      constructiveScore: Math.round(Math.min(100, currentCon)),
      destructiveScore: Math.round(Math.max(10, currentDes))
    });
    
    currentCon += (100 - currentCon) * 0.18 + Math.random() * 2;
    currentDes -= (currentDes * 0.12) + Math.random() * 3;
  }
  return points;
};
