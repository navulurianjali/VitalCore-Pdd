import { ExerciseDetail, EXERCISE_DATABASE_FLAT } from '../utils/exerciseLibrary';

interface RapidExerciseItem {
  id: string;
  name: string;
  target: string;
  bodyPart: string;
  equipment: string;
  gifUrl?: string;
  secondaryMuscles?: string[];
  instructions?: string[];
}

/**
 * Fetch exercises from local offline exercise database (Zero external API dependency)
 */
export async function fetchLiveExercisesFromDB(params?: {
  bodyPart?: string;
  target?: string;
  equipment?: string;
  limit?: number;
}): Promise<ExerciseDetail[]> {
  let list = [...EXERCISE_DATABASE_FLAT];

  if (params?.bodyPart) {
    const bp = params.bodyPart.toLowerCase();
    list = list.filter((ex) =>
      ex.primaryMuscle.toLowerCase().includes(bp) ||
      ex.category.toLowerCase().includes(bp)
    );
  }

  if (params?.target) {
    const target = params.target.toLowerCase();
    list = list.filter((ex) =>
      ex.primaryMuscle.toLowerCase().includes(target) ||
      ex.description.toLowerCase().includes(target)
    );
  }

  if (params?.equipment) {
    const eq = params.equipment.toLowerCase();
    list = list.filter((ex) => ex.equipment.toLowerCase().includes(eq));
  }

  const limit = params?.limit || 20;
  return list.length > 0 ? list.slice(0, limit) : EXERCISE_DATABASE_FLAT.slice(0, limit);
}

function mapBodyPartToCategory(bodyPart?: string): ExerciseDetail['category'] {
  if (!bodyPart) return 'full_body';
  const bp = bodyPart.toLowerCase();
  if (bp.includes('chest')) return 'chest';
  if (bp.includes('back')) return 'back';
  if (bp.includes('leg')) return 'legs';
  if (bp.includes('waist') || bp.includes('abs')) return 'core';
  if (bp.includes('shoulder')) return 'shoulders';
  if (bp.includes('arm')) return 'arms';
  if (bp.includes('cardio')) return 'cardio';
  return 'full_body';
}

function mapEquipmentName(equipment?: string): string {
  if (!equipment) return 'Bodyweight';
  const eq = equipment.toLowerCase();
  if (eq.includes('body')) return 'Bodyweight';
  if (eq.includes('dumbbell')) return 'Dumbbells';
  if (eq.includes('barbell')) return 'Barbell';
  if (eq.includes('band')) return 'Bands';
  if (eq.includes('cable') || eq.includes('machine') || eq.includes('leverage')) return 'Gym Machines';
  return 'Bodyweight';
}
