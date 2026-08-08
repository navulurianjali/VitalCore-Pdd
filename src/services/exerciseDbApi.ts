import { ExerciseDetail, EXERCISE_DATABASE_FLAT } from '../utils/exerciseLibrary';

const RAPID_API_KEY = process.env.NEXT_PUBLIC_EXERCISEDB_API_KEY || '';
const RAPID_API_HOST = process.env.NEXT_PUBLIC_EXERCISEDB_API_HOST || 'exercisedb.p.rapidapi.com';


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
 * Fetch exercises live from RapidAPI ExerciseDB
 */
export async function fetchLiveExercisesFromDB(params?: {
  bodyPart?: string;
  target?: string;
  equipment?: string;
  limit?: number;
}): Promise<ExerciseDetail[]> {
  try {
    let url = `https://${RAPID_API_HOST}/exercises?limit=${params?.limit || 20}&offset=0`;
    if (params?.bodyPart) {
      url = `https://${RAPID_API_HOST}/exercises/bodyPart/${encodeURIComponent(params.bodyPart)}?limit=${params?.limit || 20}`;
    } else if (params?.target) {
      url = `https://${RAPID_API_HOST}/exercises/target/${encodeURIComponent(params.target)}?limit=${params?.limit || 20}`;
    } else if (params?.equipment) {
      url = `https://${RAPID_API_HOST}/exercises/equipment/${encodeURIComponent(params.equipment)}?limit=${params?.limit || 20}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST,
      },
    });

    if (response.ok) {
      const data: RapidExerciseItem[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item, idx) => ({
          id: item.id || `rapid-ex-${idx}`,
          name: item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : 'Exercise',
          category: mapBodyPartToCategory(item.bodyPart),
          description: item.instructions?.join(' ') || `Targeting ${item.target} using ${item.equipment}.`,
          primaryMuscle: item.target ? item.target.toUpperCase() : 'Full Body',
          secondaryMuscle: item.secondaryMuscles?.join(', ') || 'Core & Stabilizers',
          difficulty: 'Intermediate',
          purpose: `Builds ${item.target} strength and muscle control.`,
          contraindications: ['Avoid if experiencing acute joint pain.'],
          durationSeconds: 45,
          repetitions: '12 - 15 reps',
          reps: '12-15 reps',
          sets: 3,
          restSeconds: 30,
          equipment: mapEquipmentName(item.equipment),
          instructions: item.instructions || ['Maintain controlled form', 'Exhale during exertion'],
          commonMistakes: ['Rushing reps', 'Rounding back'],
          safetyTips: ['Warm up prior to set execution'],
        }));
      }
    }
  } catch (err) {
    console.warn('ExerciseDB RapidAPI request failed, using local offline fallback:', err);
  }

  // Fallback to offline exercise database
  return EXERCISE_DATABASE_FLAT;
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
