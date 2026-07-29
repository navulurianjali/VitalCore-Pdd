export interface ExerciseDetail {
  id: string;
  name: string;
  category: 'full_body' | 'chest' | 'back' | 'legs' | 'core' | 'shoulders' | 'mobility';
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
}

export const EXERCISE_LIBRARY: Record<string, ExerciseDetail[]> = {
  full_body: [
    {
      id: "ex-fb-1",
      name: "Jumping Jacks",
      category: "full_body",
      description: "Standard cardio warmup. Activates full body coordination and increases core body temperature.",
      primaryMuscle: "Cardiovascular System",
      secondaryMuscle: "Calves & Shoulders",
      difficulty: "Beginner",
      purpose: "Elevates heart rate and mobilizes major joint complexes prior to exertion.",
      contraindications: ["Acute ankle instability", "Severe knee osteoarthritis"],
      durationSeconds: 30,
      repetitions: "30 sec continuous",
      reps: "30 sec",
      sets: 3,
      restSeconds: 15,
      equipment: "Bodyweight"
    },
    {
      id: "ex-fb-2",
      name: "Bodyweight Squats",
      category: "full_body",
      description: "Lower body fundamental movement. Distributes load across posterior chain while maintaining neutral spine.",
      primaryMuscle: "Quadriceps & Glutes",
      secondaryMuscle: "Hamstrings & Core",
      difficulty: "Beginner",
      purpose: "Builds functional knee extension and hip extension strength for daily locomotion.",
      contraindications: ["Acute meniscus tears", "Advanced patellar tendonitis"],
      durationSeconds: 45,
      repetitions: "15 repetitions",
      reps: "15 reps",
      sets: 3,
      restSeconds: 20,
      equipment: "Bodyweight"
    },
    {
      id: "ex-fb-3",
      name: "Push-ups",
      category: "full_body",
      description: "Upper body push exercise. Engages pectoral muscles, anterior deltoids, and core stabilizers.",
      primaryMuscle: "Pectoralis Major",
      secondaryMuscle: "Triceps & Anterior Deltoids",
      difficulty: "Intermediate",
      purpose: "Develops upper body pushing power and scapular stability.",
      contraindications: ["Rotator cuff impingement", "Wrist carpal tunnel flare-ups"],
      durationSeconds: 40,
      repetitions: "10 - 12 repetitions",
      reps: "10-12 reps",
      sets: 3,
      restSeconds: 25,
      equipment: "Bodyweight"
    },
    {
      id: "ex-fb-4",
      name: "Plank Hold",
      category: "full_body",
      description: "Core isometric stability exercise. Maintains level pelvis and neutral cervical spine.",
      primaryMuscle: "Transverse Abdominis",
      secondaryMuscle: "Rectus Abdominis & Glutes",
      difficulty: "Beginner",
      purpose: "Enhances spinal column protection and anti-extension core endurance.",
      contraindications: ["Active abdominal hernia", "Uncontrolled hypertension"],
      durationSeconds: 30,
      repetitions: "30 sec hold",
      reps: "30 sec",
      sets: 3,
      restSeconds: 20,
      equipment: "Bodyweight"
    }
  ],
  chest: [
    {
      id: "ex-ch-1",
      name: "Push-ups (Standard)",
      category: "chest",
      description: "Bodyweight chest press. Targets pectoral fibers while reinforcing core tightness.",
      primaryMuscle: "Pectoralis Major",
      secondaryMuscle: "Triceps Brachii",
      difficulty: "Beginner",
      purpose: "Strengthens anterior kinetic chain and pectoral hypertrophy.",
      contraindications: ["Acute shoulder acromioclavicular strain"],
      durationSeconds: 45,
      repetitions: "12 repetitions",
      reps: "12 reps",
      sets: 3,
      restSeconds: 20,
      equipment: "Bodyweight"
    },
    {
      id: "ex-ch-2",
      name: "Dumbbell Floor Press",
      category: "chest",
      description: "Safe bench press alternative. Floor contact limits shoulder extension to protect rotator cuff.",
      primaryMuscle: "Mid Pectorals",
      secondaryMuscle: "Anterior Deltoid & Triceps",
      difficulty: "Intermediate",
      purpose: "Builds pressing strength with constrained Glenohumeral extension.",
      contraindications: ["Severe elbow olecranon bursitis"],
      durationSeconds: 45,
      repetitions: "10 repetitions",
      reps: "10 reps",
      sets: 3,
      restSeconds: 25,
      equipment: "Dumbbells"
    },
    {
      id: "ex-ch-3",
      name: "Dumbbell Chest Fly",
      category: "chest",
      description: "Isolates chest muscles through horizontal adduction while stretching pectoral fascia.",
      primaryMuscle: "Outer Pectoralis Major",
      secondaryMuscle: "Anterior Deltoids",
      difficulty: "Intermediate",
      purpose: "Improves chest hypertrophy and pectoral muscle flexibility.",
      contraindications: ["Anterior shoulder instability", "Labrum tears"],
      durationSeconds: 40,
      repetitions: "12 repetitions",
      reps: "12 reps",
      sets: 3,
      restSeconds: 30,
      equipment: "Dumbbells"
    }
  ],
  back: [
    {
      id: "ex-bk-1",
      name: "Prone Cobra Lift",
      category: "back",
      description: "Posterior chain movement. Extends thoracic spine and retracts scapulae against gravity.",
      primaryMuscle: "Rhomboids & Trapezius",
      secondaryMuscle: "Erector Spinae & Posterior Deltoids",
      difficulty: "Beginner",
      purpose: "Corrects forward-head posture and strengthens upper back musculature.",
      contraindications: ["Lumbar spondylolisthesis in acute pain"],
      durationSeconds: 35,
      repetitions: "12 repetitions",
      reps: "12 reps",
      sets: 3,
      restSeconds: 15,
      equipment: "Bodyweight"
    },
    {
      id: "ex-bk-2",
      name: "Single-Arm Dumbbell Row",
      category: "back",
      description: "Unilateral pulling movement. Corrects left-right strength imbalances and builds lats.",
      primaryMuscle: "Latissimus Dorsi",
      secondaryMuscle: "Biceps Brachii & Rear Deltoids",
      difficulty: "Intermediate",
      purpose: "Develops lat thickness and unilateral scapular retraction control.",
      contraindications: ["Acute lumbar herniation without hip hinge support"],
      durationSeconds: 50,
      repetitions: "10 reps each arm",
      reps: "10 reps",
      sets: 3,
      restSeconds: 20,
      equipment: "Dumbbells"
    },
    {
      id: "ex-bk-3",
      name: "Bird-Dog Extensions",
      category: "back",
      description: "Contralateral limb extension. Decompresses lumbar spine while strengthening cross-body stability.",
      primaryMuscle: "Erector Spinae & Gluteus Maximus",
      secondaryMuscle: "Deep Abdominal Core",
      difficulty: "Beginner",
      purpose: "Rehabilitates lower back strain and stabilizes lumbar spine.",
      contraindications: ["Acute wrist fracture or severe carpal inflammation"],
      durationSeconds: 45,
      repetitions: "12 reps each side",
      reps: "12 reps",
      sets: 3,
      restSeconds: 15,
      equipment: "Bodyweight"
    }
  ],
  legs: [
    {
      id: "ex-lg-1",
      name: "Dumbbell Romanian Deadlifts",
      category: "legs",
      description: "Hip hinge pattern focusing on hamstring loading and hamstring-glute contraction.",
      primaryMuscle: "Hamstrings & Gluteus Maximus",
      secondaryMuscle: "Erector Spinae & Forearms",
      difficulty: "Intermediate",
      purpose: "Develops posterior leg strength and hamstring flexibility under load.",
      contraindications: ["Acute disc herniation during active sciatica"],
      durationSeconds: 40,
      repetitions: "10 repetitions",
      reps: "10 reps",
      sets: 3,
      restSeconds: 25,
      equipment: "Dumbbells"
    },
    {
      id: "ex-lg-2",
      name: "Reverse Lunges",
      category: "legs",
      description: "Unilateral leg movement. Stepping backward places less sheer stress on patellar tendon than forward lunges.",
      primaryMuscle: "Quadriceps & Glutes",
      secondaryMuscle: "Adductors & Hamstrings",
      difficulty: "Beginner",
      purpose: "Builds single-leg balance and knee joint alignment.",
      contraindications: ["Severe balance impairment without wall support"],
      durationSeconds: 50,
      repetitions: "10 reps each leg",
      reps: "10 reps",
      sets: 3,
      restSeconds: 20,
      equipment: "Bodyweight"
    }
  ],
  core: [
    {
      id: "ex-cr-1",
      name: "Bicycle Crunches",
      category: "core",
      description: "Rotational oblique exercise. Combines flexion and torso rotation for deep core engagement.",
      primaryMuscle: "Obliques",
      secondaryMuscle: "Rectus Abdominis & Hip Flexors",
      difficulty: "Intermediate",
      purpose: "Strengthens rotational core strength and lateral abdominal endurance.",
      contraindications: ["Acute cervical neck strain"],
      durationSeconds: 45,
      repetitions: "15 reps each side",
      reps: "15 reps",
      sets: 3,
      restSeconds: 20,
      equipment: "Bodyweight"
    },
    {
      id: "ex-cr-2",
      name: "Russian Twists",
      category: "core",
      description: "Seated core rotation. Trains transverse abdominis and oblique rotators.",
      primaryMuscle: "Transverse Abdominis & Obliques",
      secondaryMuscle: "Lower Back",
      difficulty: "Intermediate",
      purpose: "Enhances torso rotational stability for athletics and dynamic movement.",
      contraindications: ["Unstable spinal fusion or acute lower back spasm"],
      durationSeconds: 40,
      repetitions: "20 total reps",
      reps: "20 reps",
      sets: 3,
      restSeconds: 20,
      equipment: "Bodyweight"
    }
  ],
  shoulders: [
    {
      id: "ex-sh-1",
      name: "Dumbbell Shoulder Press",
      category: "shoulders",
      description: "Vertical overhead press. Strengthens deltoids and scapular upward rotators.",
      primaryMuscle: "Anterior & Lateral Deltoids",
      secondaryMuscle: "Triceps & Upper Trapezius",
      difficulty: "Intermediate",
      purpose: "Builds shoulder overhead pressing power and shoulder girdle strength.",
      contraindications: ["Subacromial shoulder impingement"],
      durationSeconds: 45,
      repetitions: "10 repetitions",
      reps: "10 reps",
      sets: 3,
      restSeconds: 25,
      equipment: "Dumbbells"
    },
    {
      id: "ex-sh-2",
      name: "Dumbbell Lateral Raise",
      category: "shoulders",
      description: "Abduction movement isolating lateral head of deltoid.",
      primaryMuscle: "Lateral Deltoid",
      secondaryMuscle: "Supraspinatus & Trapezius",
      difficulty: "Beginner",
      purpose: "Improves shoulder width and lateral deltoid isolation.",
      contraindications: ["Active supraspinatus tendonitis"],
      durationSeconds: 40,
      repetitions: "12 repetitions",
      reps: "12 reps",
      sets: 3,
      restSeconds: 20,
      equipment: "Dumbbells"
    }
  ],
  mobility: [
    {
      id: "ex-mb-1",
      name: "Cat-Cow Stretch",
      category: "mobility",
      description: "Rhythmic spinal flexion and extension. Relieves tension along vertebral column.",
      primaryMuscle: "Thoracic & Lumbar Spine",
      secondaryMuscle: "Neck & Abdominals",
      difficulty: "Beginner",
      purpose: "Restores spinal segment mobility and decreases axial stiffness.",
      contraindications: ["Severe acute vertebral fracture"],
      durationSeconds: 45,
      repetitions: "45 sec continuous",
      reps: "45 sec",
      sets: 3,
      restSeconds: 10,
      equipment: "Bodyweight"
    },
    {
      id: "ex-mb-2",
      name: "Child's Pose Decompression",
      category: "mobility",
      description: "Restorative stretch. Lengthens lats, paraspinal muscles, and opens hips.",
      primaryMuscle: "Latissimus Dorsi & Lower Back",
      secondaryMuscle: "Glutes & Shoulders",
      difficulty: "Beginner",
      purpose: "Decompresses spinal joints and down-regulates nervous system stress.",
      contraindications: ["Recent knee replacement surgery"],
      durationSeconds: 60,
      repetitions: "60 sec hold",
      reps: "60 sec",
      sets: 2,
      restSeconds: 10,
      equipment: "Bodyweight"
    }
  ]
};
