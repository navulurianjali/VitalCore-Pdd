// Centralized Future Health Prediction Engine for VitalCore
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
  hasTelemetry?: boolean;
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
 * based strictly on real user habits and daily lifestyle inputs.
 * Returns empty recommendations and insights for new users with no data.
 */
export function calculateFutureHealthPredictions(data: TelemetryData): PredictionResult {
  const hasActualTelemetry = Boolean(
    data.hasTelemetry ||
    data.sleepHours > 0 ||
    data.hydrationMl > 0 ||
    data.physicalFatigue > 0 ||
    data.mentalFatigue > 0 ||
    data.fatigueScore > 0 ||
    data.stressLevel > 0 ||
    data.sorenessLevel > 0 ||
    data.recoveryPercentage > 0
  );

  // New user with no telemetry data: completely empty recommendations & insights
  if (!hasActualTelemetry) {
    return {
      burnoutRisk: 0,
      fatigueBuildup: 0,
      stressOverloadRisk: 0,
      sleepDeteriorationRisk: 0,
      recoveryDeclineRisk: 0,
      biologicalAgeShift: 0,
      futureEnergyTrends: [],
      preventiveReminders: [],
      aiInsights: []
    };
  }

  // 1. Compute Burnout Risk
  let burnout = Math.round(
    data.stressLevel * 0.45 + 
    (100 - data.sleepQuality) * 0.35 + 
    data.fatigueScore * 0.2
  );
  burnout = Math.min(100, Math.max(0, burnout));

  // 2. Compute Fatigue Buildup
  const sleepDebtHrs = data.sleepHours > 0 ? Math.max(0, 8.0 - data.sleepHours) : 0;
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
    (100 - (data.sleepQuality || 100)) * 0.4 + 
    data.stressLevel * 0.3 + 
    screenTimeImpact + 
    caffeineImpact
  );
  sleepDecline = Math.min(100, Math.max(0, sleepDecline));

  // 5. Compute Recovery Decline Risk
  const hydrationTarget = data.hydrationTarget || 2500;
  const hydrationRatio = hydrationTarget > 0 ? data.hydrationMl / hydrationTarget : 1;
  const hydrationDebtImpact = (data.hydrationMl > 0 && hydrationRatio < 0.8) ? (1.0 - hydrationRatio) * 40 : 0;
  let recoveryDecline = Math.round(
    (100 - (data.recoveryPercentage || 100)) * 0.5 + 
    data.sorenessLevel * 4 + 
    hydrationDebtImpact
  );
  recoveryDecline = Math.min(100, Math.max(0, recoveryDecline));

  // 6. Biological Age Shift
  let ageShift = 0.0;
  if (data.stabilityScore >= 85) {
    ageShift = -1.5 - ((data.stabilityScore - 85) * 0.1);
  } else if (data.stabilityScore > 0 && data.stabilityScore < 60) {
    ageShift = 1.0 + ((60 - data.stabilityScore) * 0.15);
  } else if (data.stabilityScore > 0) {
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

  // 8. Generate preventive alerts / reminders (strictly derived from user's actual saved data)
  const preventiveReminders: string[] = [];
  if (data.sleepHours > 0 && data.sleepHours < 6.0) {
    preventiveReminders.push("Rest Reminder: Your recent late-night sleep pattern may reduce recovery quality over the next week.");
  }
  if (data.hydrationMl > 0 && hydrationRatio < 0.7) {
    preventiveReminders.push("Hydration Check: Consistent hydration is essential to improve your workout recovery.");
  }
  if (data.stressLevel > 65) {
    preventiveReminders.push("Take a Breath: High stress and low sleep together may increase fatigue. Let's take a 2-minute relaxation break.");
  }
  if (data.sorenessLevel > 6) {
    preventiveReminders.push("Muscle Care: Your body is feeling quite tight. A light stretch or warm walk today will help you recover faster.");
  }
  if (data.physicalFatigue > 60 && data.recoveryPercentage > 0 && data.recoveryPercentage < 50) {
    preventiveReminders.push("Recharge Mode: Your energy is running a bit low. Let's focus on simple rest today to bounce back stronger.");
  }

  // 9. Generate AI future health insights (strictly from actual data)
  const aiInsights: string[] = [];
  if (data.hydrationMl > 0) {
    if (hydrationRatio < 0.85) {
      aiInsights.push("Drinking a little less water recently might slow down your muscle repair. Keeping your cup full helps you feel fresh and less sore.");
    } else {
      aiInsights.push("Your consistent water drinking is doing wonders! It is actively keeping your muscles hydrated and speeding up your workout recovery.");
    }
  }

  if (data.sleepHours > 0) {
    if (data.sleepQuality < 70) {
      aiInsights.push("A few restless nights can start building up fatigue. Winding down without screens 30 minutes before bed will help you get deeper rest.");
    } else {
      aiInsights.push("Your sleep has been wonderfully regular! This consistent rest is the reason you are feeling so focused and energetic in the mornings.");
    }
  }

  if (data.stressLevel > 0) {
    if (burnout > 55) {
      aiInsights.push("Your body is carrying a bit of stress lately. Slowing down your evening routine will help prevent you from feeling burnt out next week.");
    } else {
      aiInsights.push("Your stress and work levels are in perfect balance. You're doing a fantastic job managing your daily pace.");
    }
  }

  if (data.stabilityScore > 0) {
    if (data.stabilityScore >= 80) {
      aiInsights.push("Your current lifestyle decisions are supporting great long-term health! You will likely notice even better stamina if you keep this up.");
    } else {
      aiInsights.push("It looks like you've been a little less active this week. Just a quick 10-minute walk today can significantly boost your energy tomorrow.");
    }
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

export interface EnvironmentInfo {
  weather: string;
  temperatureCelsius: number;
  pollutionIndexAqi: number;
  workloadHours: number;
  travelStatus: boolean;
}

export const getEnvironmentAdjustedRoutine = (
  env: EnvironmentInfo,
  baseMetrics: any,
  mode: string = "standard"
) => {
  let hydrationModifier = 0;
  let workoutIntensity = "Medium";
  let workoutRecommendation = "Dynamic functional aerobic training";
  let alerts: string[] = [];

  // Weather and Temp check
  if (env.temperatureCelsius >= 32) {
    hydrationModifier += 600;
    workoutIntensity = mode === "elderly" ? "Very Low" : "Low";
    workoutRecommendation = "Indoor light stretching or yoga in a cool, air-conditioned room";
    alerts.push(`It's quite warm today (${env.temperatureCelsius}°C). Let's take it easy and drink a bit more water.`);
  } else if (env.temperatureCelsius < 5) {
    hydrationModifier -= 200;
    workoutRecommendation = "Warm up indoors for about 15 minutes before any light outdoor walk or jog";
    alerts.push(`It's freezing outside (${env.temperatureCelsius}°C). Make sure to warm up thoroughly indoors before your exercise.`);
  }

  // Air Pollution Check
  if (env.pollutionIndexAqi > 150) {
    workoutRecommendation = "A cozy, strength-focused indoor workout";
    alerts.push(`Air quality is a bit poor today (AQI ${env.pollutionIndexAqi}). Let's stay indoors for our exercise.`);
  } else if (env.pollutionIndexAqi > 100) {
    alerts.push(`Air quality is slightly off today (AQI ${env.pollutionIndexAqi}). It's recommended to train indoors if you have sensitive lungs.`);
  }

  // Workload Check
  if (env.workloadHours > 9) {
    workoutIntensity = "Low";
    workoutRecommendation = "A relaxing walk and some gentle stretching to unwind";
    alerts.push(`You've worked a long day (${env.workloadHours} hours). Let's do a lighter workout to help you unwind and rest.`);
  }

  return {
    hydrationTarget: baseMetrics.hydrationTarget + hydrationModifier,
    workoutIntensity,
    workoutRecommendation,
    alerts
  };
};

export interface LongTermProjection {
  day: number;
  label: string;
  energy: number;
  recovery: number;
  vitalityAge: number;
  burnoutRisk: number;
  consistencyScore: number;
  wellnessScore: number;
  insight: string;
}

export function getLongTermProjections(data: TelemetryData, baseAge: number = 30): LongTermProjection[] {
  let currentEnergy = 100 - (data.fatigueScore * 0.5 + data.stressLevel * 0.2);
  let currentRecovery = data.recoveryPercentage;
  let currentStability = data.stabilityScore;
  let currentBurnout = data.stressLevel * 0.45 + (100 - data.sleepQuality) * 0.35 + data.fatigueScore * 0.2;
  
  const periods = [
    { day: 0, label: "Today" },
    { day: 30, label: "30 Days" },
    { day: 90, label: "90 Days" },
    { day: 365, label: "1 Year" }
  ];

  return periods.map(p => {
    const multiplier = p.day / 30; // Monthly unit
    const growth = (currentStability - 60) * 0.1;
    
    let simEnergy = currentEnergy + (growth * multiplier * 5);
    let simRecovery = currentRecovery + (growth * multiplier * 4);
    let simBurnout = currentBurnout - (growth * multiplier * 8);
    let simStability = currentStability + (growth > 0 ? 2 : -2) * multiplier;
    
    simEnergy = Math.min(98, Math.max(20, simEnergy));
    simRecovery = Math.min(99, Math.max(15, simRecovery));
    simBurnout = Math.min(95, Math.max(5, simBurnout));
    simStability = Math.min(99, Math.max(20, simStability));
    
    let simAge = baseAge;
    if (simStability >= 85) {
      simAge -= 1.5 * Math.min(3, multiplier);
    } else if (simStability < 50) {
      simAge += 1.0 * Math.min(3, multiplier);
    }

    let insight = "";
    if (p.day === 0) insight = "Your baseline today.";
    else if (p.day === 30) insight = growth > 0 ? "Initial adaptations show increased recovery." : "Slight decline if habits aren't adjusted.";
    else if (p.day === 90) insight = growth > 0 ? "Habits solidifying. Vitality age dropping." : "Risk of burnout increasing. Intervention needed.";
    else insight = growth > 0 ? "Transformation achieved! Biological age significantly improved." : "Long-term health risks compounded.";

    return {
      day: p.day,
      label: p.label,
      energy: Math.round(simEnergy),
      recovery: Math.round(simRecovery),
      vitalityAge: Math.round(simAge * 10) / 10,
      burnoutRisk: Math.round(simBurnout),
      consistencyScore: Math.round(simStability),
      wellnessScore: Math.round((simEnergy + simRecovery + simStability) / 3),
      insight
    };
  });
}
