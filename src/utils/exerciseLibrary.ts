export interface ExerciseDetail {
  id: string;
  name: string;
  category: 'full_body' | 'chest' | 'back' | 'legs' | 'core' | 'shoulders' | 'arms' | 'mobility' | 'cardio' | 'yoga' | 'pilates' | 'senior' | 'low_impact' | 'office' | 'hiit';
  description: string;
  primaryMuscle: string;
  secondaryMuscle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  purpose: string;
  contraindications: string[];
  durationSeconds: number;
  repetitions: string;
  reps: string;
  sets: number;
  restSeconds: number;
  equipment: string;
  location?: 'Home' | 'Gym' | 'Both';
  instructions?: string[];
  commonMistakes?: string[];
  safetyTips?: string[];
  caloriesEstimate?: number;
}

export const EXERCISE_DATABASE_FLAT: ExerciseDetail[] = [
  // --- CARDIO & ENDURANCE ---
  {
    id: "cardio-1", name: "Brisk Outdoor Walking", category: "cardio",
    description: "Steady-state low-impact aerobic exercise to boost cardiovascular health and metabolism.",
    primaryMuscle: "Legs & Heart", secondaryMuscle: "Calves & Core", difficulty: "Beginner",
    purpose: "Increases daily caloric burn and improves circulatory function.", contraindications: ["Severe acute knee sprain"],
    durationSeconds: 120, repetitions: "2 mins continuous", reps: "2 mins", sets: 3, restSeconds: 30, equipment: "Bodyweight", location: "Both",
    instructions: ["Maintain upright posture", "Swing arms naturally", "Keep steady heel-to-toe stride"],
    commonMistakes: ["Slouching shoulders", "Over-striding"], safetyTips: ["Wear supportive footwear"]
  },
  {
    id: "cardio-2", name: "Light Jogging", category: "cardio",
    description: "Moderate cardiovascular exercise to build stamina and aerobic capacity.",
    primaryMuscle: "Quadriceps & Calves", secondaryMuscle: "Hamstrings & Glutes", difficulty: "Intermediate",
    purpose: "Elevates VO2 max and burns calories efficiently.", contraindications: ["Severe arthritis", "Recent foot fracture"],
    durationSeconds: 90, repetitions: "90 sec continuous", reps: "90 sec", sets: 3, restSeconds: 45, equipment: "Bodyweight", location: "Both",
    instructions: ["Land softly on mid-foot", "Keep elbows at 90 degrees", "Breathe rhythmically"],
    commonMistakes: ["Landing hard on heels", "Hunching back"], safetyTips: ["Pace yourself according to stamina"]
  },
  {
    id: "cardio-3", name: "Stationary Cycling", category: "cardio",
    description: "Low-impact indoor cycling ideal for cardiovascular conditioning without joint stress.",
    primaryMuscle: "Quadriceps", secondaryMuscle: "Glutes & Calves", difficulty: "Beginner",
    purpose: "Protects knee joints while increasing heart rate.", contraindications: ["Acute lower back strain"],
    durationSeconds: 120, repetitions: "2 mins steady pedaling", reps: "2 mins", sets: 3, restSeconds: 30, equipment: "Gym Machines", location: "Gym",
    instructions: ["Adjust seat height to hip level", "Keep knees aligned with feet"],
    commonMistakes: ["Seat height too low", "Rounding lower back"], safetyTips: ["Keep smooth cadence"]
  },
  {
    id: "cardio-4", name: "Jump Rope Skips", category: "cardio",
    description: "High-energy plyometric cardio conditioning exercise for agility and coordination.",
    primaryMuscle: "Calves & Shoulders", secondaryMuscle: "Core & Forearms", difficulty: "Intermediate",
    purpose: "Develops footwork, calf endurance, and rapid calorie burn.", contraindications: ["Plantarm fasciitis", "Severe joint pain"],
    durationSeconds: 45, repetitions: "45 sec continuous", reps: "45 sec", sets: 4, restSeconds: 30, equipment: "Bodyweight", location: "Both",
    instructions: ["Stay light on balls of feet", "Rotate rope using wrists, not shoulders"],
    commonMistakes: ["Jumping too high", "Using full arm motion"], safetyTips: ["Jump on shock-absorbing surface"]
  },
  {
    id: "cardio-5", name: "Stair Climbing", category: "cardio",
    description: "Targeted lower body cardio exercise building leg strength and endurance.",
    primaryMuscle: "Glutes & Quads", secondaryMuscle: "Calves & Hamstrings", difficulty: "Intermediate",
    purpose: "Builds functional leg power and elevates heart rate rapidly.", contraindications: ["Acute knee ligament tears"],
    durationSeconds: 60, repetitions: "60 sec climbing", reps: "60 sec", sets: 3, restSeconds: 45, equipment: "Bodyweight", location: "Both"
  },
  {
    id: "cardio-6", name: "Shadow Boxing", category: "cardio",
    description: "Rhythmic full-body cardiorespiratory routine using jab, cross, and hook combinations.",
    primaryMuscle: "Shoulders & Core", secondaryMuscle: "Lats & Arms", difficulty: "Beginner",
    purpose: "Engages upper body endurance and core rotation.", contraindications: ["Acute wrist sprain"],
    durationSeconds: 60, repetitions: "60 sec active punches", reps: "60 sec", sets: 3, restSeconds: 30, equipment: "Bodyweight", location: "Home"
  },

  // --- CHEST & PUSH ---
  {
    id: "chest-1", name: "Bodyweight Push-ups", category: "chest",
    description: "Classic compound push exercise building chest, shoulder, and triceps strength.",
    primaryMuscle: "Pectoralis Major", secondaryMuscle: "Anterior Deltoids & Triceps", difficulty: "Intermediate",
    purpose: "Develops upper body pressing strength and core endurance.", contraindications: ["Acute wrist tendinitis", "Rotator cuff tears"],
    durationSeconds: 45, repetitions: "12 - 15 reps", reps: "12-15 reps", sets: 3, restSeconds: 30, equipment: "Bodyweight", location: "Both",
    instructions: ["Hands slightly wider than shoulders", "Keep body in straight plank line", "Lower chest to 2 inches from floor"],
    commonMistakes: ["Sagging hips", "Flaring elbows to 90 degrees"], safetyTips: ["Engage glutes to stabilize lower back"]
  },
  {
    id: "chest-2", name: "Knee Push-ups", category: "chest",
    description: "Modified push-up variation reducing load for beginners or low-impact sessions.",
    primaryMuscle: "Pectoralis Major", secondaryMuscle: "Triceps & Shoulders", difficulty: "Beginner",
    purpose: "Builds foundational chest strength with reduced joint stress.", contraindications: ["Acute knee bursitis"],
    durationSeconds: 40, repetitions: "10 - 12 reps", reps: "10-12 reps", sets: 3, restSeconds: 25, equipment: "Bodyweight", location: "Home"
  },
  {
    id: "chest-3", name: "Incline Push-ups (Hands Elevated)", category: "chest",
    description: "Push-up variation placing hands on bench or chair to lower resistance and emphasize lower chest.",
    primaryMuscle: "Lower Pectorals", secondaryMuscle: "Triceps", difficulty: "Beginner",
    purpose: "Gentle entry point for chest pressing.", contraindications: ["Severe shoulder impingement"],
    durationSeconds: 40, repetitions: "12 reps", reps: "12 reps", sets: 3, restSeconds: 20, equipment: "Chair", location: "Home"
  },
  {
    id: "chest-4", name: "Dumbbell Bench Press", category: "chest",
    description: "Freeweight pressing exercise for maximum chest hypertrophy and unilateral balance.",
    primaryMuscle: "Pectoralis Major", secondaryMuscle: "Triceps & Anterior Deltoids", difficulty: "Intermediate",
    purpose: "Builds upper body mass and pressing force.", contraindications: ["Torn glenoid labrum"],
    durationSeconds: 50, repetitions: "10 - 12 reps", reps: "10-12 reps", sets: 3, restSeconds: 45, equipment: "Dumbbells", location: "Gym"
  },
  {
    id: "chest-5", name: "Dumbbell Chest Flyes", category: "chest",
    description: "Isolation exercise providing deep pectoral stretch and horizontal adduction.",
    primaryMuscle: "Pectoralis Major", secondaryMuscle: "Anterior Deltoids", difficulty: "Intermediate",
    purpose: "Stretches chest fascia and isolates pectoral contraction.", contraindications: ["Shoulder dislocation history"],
    durationSeconds: 45, repetitions: "12 reps", reps: "12 reps", sets: 3, restSeconds: 30, equipment: "Dumbbells", location: "Both"
  },

  // --- BACK & PULL ---
  {
    id: "back-1", name: "Prone Cobra Lifts", category: "back",
    description: "Bodyweight posterior extension strengthening upper back and correcting posture.",
    primaryMuscle: "Rhomboids & Trapezius", secondaryMuscle: "Erector Spinae", difficulty: "Beginner",
    purpose: "Counteracts sitting posture by opening chest and pulling shoulders back.", contraindications: ["Acute lumbar herniation"],
    durationSeconds: 45, repetitions: "12 reps", reps: "12 reps", sets: 3, restSeconds: 20, equipment: "Bodyweight", location: "Home"
  },
  {
    id: "back-2", name: "Bent-Over Dumbbell Rows", category: "back",
    description: "Compound pulling movement strengthening lats, mid-back, and biceps.",
    primaryMuscle: "Latissimus Dorsi", secondaryMuscle: "Rhomboids & Biceps", difficulty: "Intermediate",
    purpose: "Builds back thickness and spinal stabilization.", contraindications: ["Acute lower back strain"],
    durationSeconds: 45, repetitions: "10 - 12 reps per arm", reps: "10-12 reps", sets: 3, restSeconds: 30, equipment: "Dumbbells", location: "Both"
  },
  {
    id: "back-3", name: "Seated Cable Rows", category: "back",
    description: "Machine-assisted row providing constant tension across mid-back muscles.",
    primaryMuscle: "Rhomboids & Lats", secondaryMuscle: "Rear Deltoids & Biceps", difficulty: "Beginner",
    purpose: "Promotes scapular retraction and posture balance.", contraindications: ["Acute lumbar flexion pain"],
    durationSeconds: 50, repetitions: "12 reps", reps: "12 reps", sets: 3, restSeconds: 40, equipment: "Gym Machines", location: "Gym"
  },
  {
    id: "back-4", name: "Resistance Band Pull-Aparts", category: "back",
    description: "Targeted posture exercise strengthening upper back and shoulder external rotators.",
    primaryMuscle: "Rear Deltoids & Rhomboids", secondaryMuscle: "Trapezius", difficulty: "Beginner",
    purpose: "Realigns rounded shoulders and builds upper back endurance.", contraindications: ["None"],
    durationSeconds: 40, repetitions: "15 reps", reps: "15 reps", sets: 3, restSeconds: 20, equipment: "Bands", location: "Home"
  },

  // --- LEGS & LOWER BODY ---
  {
    id: "legs-1", name: "Bodyweight Air Squats", category: "legs",
    description: "Fundamental compound lower body exercise loading quads, glutes, and hamstrings.",
    primaryMuscle: "Quadriceps & Glutes", secondaryMuscle: "Hamstrings & Core", difficulty: "Beginner",
    purpose: "Develops functional leg strength and hip mobility.", contraindications: ["Acute meniscus tear"],
    durationSeconds: 45, repetitions: "15 reps", reps: "15 reps", sets: 3, restSeconds: 25, equipment: "Bodyweight", location: "Both"
  },
  {
    id: "legs-2", name: "Forward Walking Lunges", category: "legs",
    description: "Unilateral leg exercise strengthening quads and glutes while improving balance.",
    primaryMuscle: "Quadriceps & Glutes", secondaryMuscle: "Calves & Core", difficulty: "Intermediate",
    purpose: "Enhances unilateral hip stability and single-leg strength.", contraindications: ["Severe patellar tendinitis"],
    durationSeconds: 45, repetitions: "10 reps per leg", reps: "10 per leg", sets: 3, restSeconds: 30, equipment: "Bodyweight", location: "Both"
  },
  {
    id: "legs-3", name: "Dumbbell Goblet Squats", category: "legs",
    description: "Front-loaded squat holding weight against chest to reinforce upright torso posture.",
    primaryMuscle: "Quadriceps & Glutes", secondaryMuscle: "Upper Back & Core", difficulty: "Intermediate",
    purpose: "Builds deep squat strength and core rigidity.", contraindications: ["Severe knee pain"],
    durationSeconds: 50, repetitions: "10 - 12 reps", reps: "10-12 reps", sets: 3, restSeconds: 45, equipment: "Dumbbells", location: "Both"
  },
  {
    id: "legs-4", name: "Glute Bridges", category: "legs",
    description: "Supine hip extension exercise isolating glutes without spinal loading.",
    primaryMuscle: "Gluteus Maximus", secondaryMuscle: "Hamstrings & Lower Back", difficulty: "Beginner",
    purpose: "Activates dormant glute muscles and relieves lower back tension.", contraindications: ["None"],
    durationSeconds: 40, repetitions: "15 reps", reps: "15 reps", sets: 3, restSeconds: 20, equipment: "Bodyweight", location: "Home"
  },
  {
    id: "legs-5", name: "Standing Calf Raises", category: "legs",
    description: "Isolation exercise for lower leg plantarflexion and ankle stability.",
    primaryMuscle: "Gastrocnemius & Soleus", secondaryMuscle: "Ankle Stabilizers", difficulty: "Beginner",
    purpose: "Strengthens lower leg muscles and aids stride push-off.", contraindications: ["Achilles tendon strain"],
    durationSeconds: 35, repetitions: "20 reps", reps: "20 reps", sets: 3, restSeconds: 15, equipment: "Bodyweight", location: "Both"
  },

  // --- CORE & ABS ---
  {
    id: "core-1", name: "Standard Forearm Plank", category: "core",
    description: "Isometric core hold stabilizing spine against gravity.",
    primaryMuscle: "Transverse Abdominis", secondaryMuscle: "Rectus Abdominis & Glutes", difficulty: "Beginner",
    purpose: "Protects lower back and builds anti-extension endurance.", contraindications: ["Abdominal hernia"],
    durationSeconds: 30, repetitions: "30 sec hold", reps: "30 sec", sets: 3, restSeconds: 20, equipment: "Bodyweight", location: "Both"
  },
  {
    id: "core-2", name: "Dead Bug Core Tap", category: "core",
    description: "Contralateral arm and leg extension exercise reinforcing lumbo-pelvic stability.",
    primaryMuscle: "Deep Core & Obliques", secondaryMuscle: "Hip Flexors", difficulty: "Beginner",
    purpose: "Teaches core engagement while moving limbs safely.", contraindications: ["None"],
    durationSeconds: 40, repetitions: "12 reps total", reps: "12 reps", sets: 3, restSeconds: 20, equipment: "Bodyweight", location: "Home"
  },
  {
    id: "core-3", name: "Mountain Climbers", category: "core",
    description: "Dynamic plank variation bringing knees to chest rapidly.",
    primaryMuscle: "Abs & Hip Flexors", secondaryMuscle: "Shoulders & Heart", difficulty: "Intermediate",
    purpose: "Combines core conditioning with cardio pulse.", contraindications: ["Acute wrist sprain"],
    durationSeconds: 35, repetitions: "35 sec continuous", reps: "35 sec", sets: 3, restSeconds: 25, equipment: "Bodyweight", location: "Both"
  },
  {
    id: "core-4", name: "Russian Twists", category: "core",
    description: "Seated rotational core exercise engaging internal and external obliques.",
    primaryMuscle: "Obliques", secondaryMuscle: "Rectus Abdominis", difficulty: "Intermediate",
    purpose: "Improves rotational core power.", contraindications: ["Acute spinal disc bulge"],
    durationSeconds: 40, repetitions: "16 twists total", reps: "16 twists", sets: 3, restSeconds: 25, equipment: "Bodyweight", location: "Both"
  },

  // --- SHOULDERS & ARMS ---
  {
    id: "sh-1", name: "Dumbbell Overhead Shoulder Press", category: "shoulders",
    description: "Vertical pressing exercise building shoulder cap mass and arm overhead mobility.",
    primaryMuscle: "Anterior & Lateral Deltoids", secondaryMuscle: "Triceps", difficulty: "Intermediate",
    purpose: "Strengthens shoulder girdle for overhead lifting.", contraindications: ["Subacromial shoulder impingement"],
    durationSeconds: 45, repetitions: "10 - 12 reps", reps: "10-12 reps", sets: 3, restSeconds: 35, equipment: "Dumbbells", location: "Both"
  },
  {
    id: "sh-2", name: "Side Lateral Raises", category: "shoulders",
    description: "Isolation movement targeting middle deltoid for shoulder width.",
    primaryMuscle: "Lateral Deltoids", secondaryMuscle: "Upper Trapezius", difficulty: "Beginner",
    purpose: "Isolates shoulder width and side deltoid definition.", contraindications: ["Shoulder rotator tear"],
    durationSeconds: 40, repetitions: "12 - 15 reps", reps: "12-15 reps", sets: 3, restSeconds: 25, equipment: "Dumbbells", location: "Both"
  },
  {
    id: "arm-1", name: "Standing Dumbbell Bicep Curls", category: "arms",
    description: "Classic arm flexion exercise strengthening bicep brachii.",
    primaryMuscle: "Biceps Brachii", secondaryMuscle: "Brachialis & Forearms", difficulty: "Beginner",
    purpose: "Builds arm flexor strength.", contraindications: ["Biceps tendonitis"],
    durationSeconds: 40, repetitions: "12 reps", reps: "12 reps", sets: 3, restSeconds: 25, equipment: "Dumbbells", location: "Both"
  },
  {
    id: "arm-2", name: "Tricep Chair Dips", category: "arms",
    description: "Bodyweight extension exercise targeting arm triceps using a sturdy chair or bench.",
    primaryMuscle: "Triceps Brachii", secondaryMuscle: "Anterior Deltoid", difficulty: "Beginner",
    purpose: "Builds arm extension power at home.", contraindications: ["Severe anterior shoulder pain"],
    durationSeconds: 35, repetitions: "10 - 12 reps", reps: "10-12 reps", sets: 3, restSeconds: 25, equipment: "Chair", location: "Home"
  },

  // --- YOGA, PILATES & FLEXIBILITY ---
  {
    id: "yoga-1", name: "Cat-Cow Spine Flow", category: "yoga",
    description: "Gentle spinal flexion and extension stretch mobilising back vertebrae.",
    primaryMuscle: "Spinal Erector Muscles", secondaryMuscle: "Abs & Neck", difficulty: "Beginner",
    purpose: "Relieves spinal stiffness and improves back fluid mobility.", contraindications: ["None"],
    durationSeconds: 45, repetitions: "45 sec slow flow", reps: "45 sec", sets: 2, restSeconds: 15, equipment: "Bodyweight", location: "Home"
  },
  {
    id: "yoga-2", name: "Child's Pose Rest Stretch", category: "yoga",
    description: "Restorative stretch lengthening lower back, hips, and shoulders softly.",
    primaryMuscle: "Lower Back & Lats", secondaryMuscle: "Hips & Glutes", difficulty: "Beginner",
    purpose: "Calms nervous system and relieves lower back tightness.", contraindications: ["Acute knee hyper-flexion pain"],
    durationSeconds: 45, repetitions: "45 sec deep hold", reps: "45 sec", sets: 2, restSeconds: 15, equipment: "Bodyweight", location: "Home"
  },
  {
    id: "yoga-3", name: "Downward Facing Dog", category: "yoga",
    description: "Inverted V pose stretching hamstrings, calves, and shoulders while strengthening arms.",
    primaryMuscle: "Hamstrings & Calves", secondaryMuscle: "Shoulders & Upper Back", difficulty: "Beginner",
    purpose: "Full posterior chain stretch and inverted circulation.", contraindications: ["Uncontrolled high blood pressure"],
    durationSeconds: 45, repetitions: "45 sec hold", reps: "45 sec", sets: 2, restSeconds: 20, equipment: "Bodyweight", location: "Both"
  },
  {
    id: "yoga-4", name: "Warrior II Pose", category: "yoga",
    description: "Standing yoga pose building leg endurance, hip openness, and focus.",
    primaryMuscle: "Quadriceps & Hips", secondaryMuscle: "Shoulders & Core", difficulty: "Beginner",
    purpose: "Strengthens legs and expands groin flexibility.", contraindications: ["Severe hip joint arthritis"],
    durationSeconds: 40, repetitions: "40 sec per side", reps: "40 sec/side", sets: 2, restSeconds: 20, equipment: "Bodyweight", location: "Both"
  },

  // --- SENIOR & LOW-IMPACT / CHAIR EXERCISES ---
  {
    id: "snr-1", name: "Seated Chair Marching", category: "senior",
    description: "Gentle seated leg lifts promoting hip flexor activation and blood circulation safely.",
    primaryMuscle: "Hip Flexors & Quads", secondaryMuscle: "Lower Abs", difficulty: "Beginner",
    purpose: "Safe cardio and mobility for seniors or low-mobility individuals.", contraindications: ["None"],
    durationSeconds: 45, repetitions: "45 sec steady march", reps: "45 sec", sets: 2, restSeconds: 20, equipment: "Chair", location: "Home"
  },
  {
    id: "snr-2", name: "Chair Stand (Seated Squat)", category: "senior",
    description: "Functional squat movement using chair seat for assistance and safety.",
    primaryMuscle: "Quadriceps & Glutes", secondaryMuscle: "Core", difficulty: "Beginner",
    purpose: "Preserves independence in standing up from chairs and beds.", contraindications: ["Severe acute knee swelling"],
    durationSeconds: 40, repetitions: "8 - 10 stands", reps: "8-10 reps", sets: 3, restSeconds: 30, equipment: "Chair", location: "Home"
  },
  {
    id: "snr-3", name: "Seated Arm Overhead Reaches", category: "senior",
    description: "Gentle seated shoulder mobility exercise opening chest and ribcage.",
    primaryMuscle: "Shoulders & Lats", secondaryMuscle: "Upper Spine", difficulty: "Beginner",
    purpose: "Maintains overhead arm reach for daily tasks.", contraindications: ["None"],
    durationSeconds: 40, repetitions: "10 reaches", reps: "10 reps", sets: 2, restSeconds: 15, equipment: "Chair", location: "Home"
  },

  // --- OFFICE & DESK QUICK WORKOUTS ---
  {
    id: "off-1", name: "Desk Neck & Shoulder Rolls", category: "office",
    description: "Quick 2-minute seated desk stretch relieving tension from computer typing.",
    primaryMuscle: "Upper Trapezius & Neck", secondaryMuscle: "Chest", difficulty: "Beginner",
    purpose: "Decreases neck stiffness and headaches from screen sitting.", contraindications: ["None"],
    durationSeconds: 30, repetitions: "30 sec gentle rolls", reps: "30 sec", sets: 2, restSeconds: 10, equipment: "None", location: "Home"
  },
  {
    id: "off-2", name: "Seated Spinal Twist Stretch", category: "office",
    description: "Gentle seated rotation releasing lower back compression while working.",
    primaryMuscle: "Obliques & Lumbar Spine", secondaryMuscle: "Thoracic Spine", difficulty: "Beginner",
    purpose: "Decompresses spine during long desk sessions.", contraindications: ["Recent spinal surgery"],
    durationSeconds: 35, repetitions: "35 sec hold per side", reps: "35 sec", sets: 2, restSeconds: 15, equipment: "Chair", location: "Home"
  }
];

export const EXERCISE_LIBRARY: Record<string, ExerciseDetail[]> = {
  full_body: EXERCISE_DATABASE_FLAT.filter(ex => ex.category === 'full_body' || ex.category === 'cardio'),
  chest: EXERCISE_DATABASE_FLAT.filter(ex => ex.category === 'chest'),
  back: EXERCISE_DATABASE_FLAT.filter(ex => ex.category === 'back'),
  legs: EXERCISE_DATABASE_FLAT.filter(ex => ex.category === 'legs'),
  core: EXERCISE_DATABASE_FLAT.filter(ex => ex.category === 'core'),
  shoulders: EXERCISE_DATABASE_FLAT.filter(ex => ex.category === 'shoulders' || ex.category === 'arms'),
  mobility: EXERCISE_DATABASE_FLAT.filter(ex => ex.category === 'yoga' || ex.category === 'mobility' || ex.category === 'office'),
  senior: EXERCISE_DATABASE_FLAT.filter(ex => ex.category === 'senior' || ex.category === 'office'),
};

/**
 * Advanced Dynamic Recommendation Engine
 * Generates dynamic, non-duplicate, profile-driven workout routines based on real user attributes.
 */
export function generatePersonalizedWorkoutPlan(params: {
  profile?: any;
  metrics?: any;
  focus: string;
  duration: number;
  equipment: string;
  location: string;
  intensity: string;
  feeling: string;
}): { exercises: ExerciseDetail[]; readinessScore: number; recommendationReason: string } {
  const { profile, metrics, focus, duration, equipment, location, intensity, feeling } = params;

  // 1. Analyze User Attributes
  const age = Number(profile?.biological_age) || 30;
  const isSenior = age >= 60 || profile?.active_mode === 'elderly';
  const fitnessGoal = profile?.fitness_goal || 'General Wellness';
  const soreness = profile?.soreness_level || 0;
  const sleepHours = metrics?.sleepHours || 7;

  // Calculate Base Readiness
  let readiness = 88;
  if (feeling === 'tired' || feeling === 'sore' || sleepHours < 6) readiness -= 20;
  if (soreness > 5) readiness -= 15;
  if (isSenior) readiness = Math.min(readiness, 75);
  readiness = Math.max(35, Math.min(98, readiness));

  // 2. Filter Pool based on Safety & Profile
  let candidatePool = [...EXERCISE_DATABASE_FLAT];

  // If senior or low-impact mode requested
  if (isSenior) {
    candidatePool = candidatePool.filter(ex => 
      ex.difficulty === 'Beginner' || ex.category === 'senior' || ex.category === 'yoga' || ex.category === 'office'
    );
  }

  // Target Focus Filtering
  if (focus === 'full_body') {
    // Keep diverse mix
  } else if (focus === 'chest') {
    candidatePool = candidatePool.filter(ex => ex.category === 'chest' || ex.category === 'full_body');
  } else if (focus === 'back') {
    candidatePool = candidatePool.filter(ex => ex.category === 'back' || ex.category === 'mobility');
  } else if (focus === 'legs') {
    candidatePool = candidatePool.filter(ex => ex.category === 'legs' || ex.category === 'cardio');
  } else if (focus === 'core') {
    candidatePool = candidatePool.filter(ex => ex.category === 'core' || ex.category === 'full_body');
  } else if (focus === 'mobility' || focus === 'yoga') {
    candidatePool = candidatePool.filter(ex => ex.category === 'yoga' || ex.category === 'office' || ex.category === 'senior');
  }

  // Equipment Filtering
  if (equipment === 'none' || equipment === 'bodyweight') {
    candidatePool = candidatePool.filter(ex => ex.equipment === 'Bodyweight' || ex.equipment === 'Chair' || ex.equipment === 'None');
  } else if (equipment === 'dumbbells') {
    candidatePool = candidatePool.filter(ex => ex.equipment === 'Bodyweight' || ex.equipment === 'Dumbbells' || ex.equipment === 'Chair');
  } else if (equipment === 'bands') {
    candidatePool = candidatePool.filter(ex => ex.equipment === 'Bodyweight' || ex.equipment === 'Bands');
  }

  // Location Filtering
  if (location === 'home') {
    candidatePool = candidatePool.filter(ex => ex.location === 'Home' || ex.location === 'Both' || !ex.location);
  } else if (location === 'gym') {
    candidatePool = candidatePool.filter(ex => ex.location === 'Gym' || ex.location === 'Both' || !ex.location);
  }

  // Fallback if pool is too tight
  if (candidatePool.length < 4) {
    candidatePool = [...EXERCISE_DATABASE_FLAT];
  }

  // 3. Goal-based Adjustments & Randomization
  // Shuffle randomly every time so no two generated sessions are identical
  candidatePool = candidatePool.sort(() => 0.5 - Math.random());

  // Determine concise exercise count (~3-4 exercises based on prompt requirement #4)
  let targetCount = duration <= 15 ? 3 : duration <= 30 ? 4 : 5;
  if (readiness < 65 || soreness > 5 || isSenior) {
    targetCount = Math.max(3, targetCount - 1);
  }
  const selectedExercises = candidatePool.slice(0, targetCount);

  // Tailor Reps & Rest based on Intensity & Goal
  let restBuffer = readiness < 60 ? 15 : 0;
  const formatted = selectedExercises.map(ex => {
    let dur = ex.durationSeconds;
    if (fitnessGoal.toLowerCase().includes('weight') || fitnessGoal.toLowerCase().includes('fat')) {
      dur = Math.round(dur * 1.1); // Slightly higher volume for fat loss
    }
    if (readiness < 65) {
      dur = Math.round(dur * 0.8); // Reduce volume if fatigued
    }

    return {
      ...ex,
      durationSeconds: dur,
      restSeconds: ex.restSeconds + restBuffer,
    };
  });

  // Recommendation Reason
  let reason = `Generated personalized ${fitnessGoal} routine based on your age (${age}), recovery readiness (${readiness}%), and selected equipment (${equipment}). Recommended ${targetCount} tailored exercises.`;
  if (readiness < 65) {
    reason = `💡 Higher fatigue/soreness detected. Your routine has been calibrated to ${targetCount} supportive low-impact movements with extra rest intervals.`;
  }

  return {
    exercises: formatted,
    readinessScore: readiness,
    recommendationReason: reason,
  };
}
