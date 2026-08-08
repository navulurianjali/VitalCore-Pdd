/**
 * VitalCore Exercise Database Service (Web)
 * ==========================================
 * Priority:
 *   1. Supabase exercise_database table (primary source)
 *   2. ExerciseDB RapidAPI (fallback + cache results back)
 *
 * This service is the SINGLE point of truth for exercise fetching across Web & Expo.
 */

import { supabase } from '@/utils/supabase';
import { ExerciseDetail, EXERCISE_DATABASE_FLAT } from '@/utils/exerciseLibrary';

export interface ExerciseRecord {
  id: string;
  external_id?: string;
  title: string;
  description: string;
  exercise_type: string;
  body_part: string;
  equipment: string;
  level: string;          // Beginner | Intermediate | Advanced
  rating?: number;
  category: string;
  primary_muscle: string;
  secondary_muscles?: string[];
  sets_recommended: number;
  reps_recommended: string;
  rest_seconds: number;
  duration_seconds: number;
  calories_estimate: number;
  location: string;
  instructions?: string[];
  common_mistakes?: string[];
  benefits?: string[];
  gif_url?: string;
  source: string;
}

export interface ExerciseQuery {
  bodyPart?: string;       // e.g. "Chest", "Quadriceps", "Abdominals"
  equipment?: string;      // e.g. "Bodyweight", "Dumbbell"
  level?: string;          // e.g. "Beginner"
  category?: string;       // e.g. "chest", "legs", "core"
  location?: string;       // e.g. "Home", "Gym", "Both"
  limit?: number;
  excludeIds?: string[];
}

const RAPID_API_KEY = process.env.NEXT_PUBLIC_EXERCISEDB_API_KEY || '';
const RAPID_API_HOST = process.env.NEXT_PUBLIC_EXERCISEDB_API_HOST || 'exercisedb.p.rapidapi.com';


const CATEGORY_TO_BODY_PARTS: Record<string, string[]> = {
  chest:      ['Chest'],
  back:       ['Lats', 'Middle Back', 'Lower Back', 'Traps'],
  legs:       ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abductors'],
  core:       ['Abdominals'],
  shoulders:  ['Shoulders'],
  arms:       ['Biceps', 'Triceps', 'Forearms'],
  full_body:  ['Quadriceps', 'Chest', 'Lats', 'Shoulders', 'Abdominals'],
  cardio:     ['Quadriceps', 'Calves', 'Hamstrings'],
  mobility:   ['Lower Back', 'Abdominals', 'Hamstrings'],
};

const EQUIPMENT_FILTER: Record<string, string[]> = {
  none:           ['Bodyweight'],
  bodyweight:     ['Bodyweight'],
  dumbbells:      ['Bodyweight', 'Dumbbell'],
  bands:          ['Bodyweight', 'Resistance Bands'],
  commercial_gym: ['Bodyweight', 'Dumbbell', 'Barbell', 'Cable', 'Machine', 'EZ Bar', 'Kettlebell'],
  kettlebell:     ['Bodyweight', 'Kettlebell'],
};

/**
 * PRIMARY: Fetch exercises from Supabase exercise_database.
 */
export async function fetchExercisesFromSupabase(query: ExerciseQuery): Promise<ExerciseDetail[]> {
  try {
    if (!supabase) return [];

    let dbQuery = supabase
      .from('exercise_database')
      .select('*');

    if (query.category && CATEGORY_TO_BODY_PARTS[query.category]) {
      const bodyParts = CATEGORY_TO_BODY_PARTS[query.category];
      dbQuery = dbQuery.in('body_part', bodyParts);
    } else if (query.bodyPart) {
      dbQuery = dbQuery.eq('body_part', query.bodyPart);
    }

    if (query.level) {
      dbQuery = dbQuery.eq('level', query.level);
    }

    if (query.location && query.location !== 'Both') {
      dbQuery = dbQuery.in('location', [query.location, 'Both']);
    }

    if (query.equipment) {
      const equipList = EQUIPMENT_FILTER[query.equipment.toLowerCase()] || ['Bodyweight'];
      dbQuery = dbQuery.in('equipment', equipList);
    }

    if (query.excludeIds && query.excludeIds.length > 0) {
      dbQuery = dbQuery.not('id', 'in', `(${query.excludeIds.map(id => `'${id}'`).join(',')})`);
    }

    const fetchLimit = Math.max((query.limit || 10) * 5, 50);
    dbQuery = dbQuery.limit(fetchLimit);

    const { data, error } = await dbQuery;

    if (error) {
      console.warn('[ExerciseDB] Supabase query error:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const mapped: ExerciseDetail[] = (data as ExerciseRecord[]).map(mapRecordToDetail);
    const shuffled = shuffleArray(mapped);
    return shuffled.slice(0, query.limit || 10);
  } catch (err) {
    console.warn('[ExerciseDB] Supabase fetch exception:', err);
    return [];
  }
}

/**
 * SECONDARY: Fetch from ExerciseDB RapidAPI and cache results into Supabase.
 */
export async function fetchExercisesFromAPI(query: ExerciseQuery): Promise<ExerciseDetail[]> {
  try {
    const bodyPart = query.category && CATEGORY_TO_BODY_PARTS[query.category]
      ? CATEGORY_TO_BODY_PARTS[query.category][0].toLowerCase()
      : query.bodyPart?.toLowerCase();

    const limit = (query.limit || 10) * 3;
    let url = `https://${RAPID_API_HOST}/exercises?limit=${limit}&offset=0`;

    if (bodyPart) {
      const apiBodyPart = mapToApiBodyPart(bodyPart);
      url = `https://${RAPID_API_HOST}/exercises/bodyPart/${encodeURIComponent(apiBodyPart)}?limit=${limit}`;
    }

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST,
      },
    });

    if (!response.ok) {
      console.warn('[ExerciseDB] API response not ok:', response.status);
      return [];
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData) || rawData.length === 0) return [];

    const mapped = rawData.map(mapApiToRecord);

    // Cache new exercises back to Supabase (fire-and-forget)
    cacheExercisesToSupabase(mapped).catch(e =>
      console.warn('[ExerciseDB] Cache write failed (non-critical):', e)
    );

    const mappedDetails = mapped.map(mapRecordToDetail);
    const shuffled = shuffleArray(mappedDetails);
    return shuffled.slice(0, query.limit || 10);
  } catch (err) {
    console.warn('[ExerciseDB] API fetch exception:', err);
    return [];
  }
}

/**
 * MAIN ENTRY: Supabase-first -> ExerciseDB API -> Local Dataset fallback.
 */
export async function fetchExercisesForPlan(query: ExerciseQuery): Promise<ExerciseDetail[]> {
  const needed = query.limit || 4;

  // Step 1: Try Supabase exercise_database table
  const supabaseResults = await fetchExercisesFromSupabase(query);
  if (supabaseResults.length >= needed) {
    console.log(`[ExerciseDB] Supabase returned ${supabaseResults.length} exercises ✓`);
    return supabaseResults;
  }

  // Step 2: Try ExerciseDB API
  console.log(`[ExerciseDB] Supabase returned ${supabaseResults.length}/${needed} — calling API fallback...`);
  const apiResults = await fetchExercisesFromAPI(query);
  if (apiResults.length > 0) {
    const existing = new Set(supabaseResults.map(e => e.name.toLowerCase()));
    const newOnes = apiResults.filter(e => !existing.has(e.name.toLowerCase()));
    const merged = [...supabaseResults, ...newOnes].slice(0, needed);
    if (merged.length >= needed) {
      console.log(`[ExerciseDB] Merged: ${merged.length} exercises (${supabaseResults.length} DB + ${newOnes.length} API) ✓`);
      return merged;
    }
  }

  // Step 3: Local Dataset fallback (guaranteed offline availability)
  console.log(`[ExerciseDB] API/DB results (${supabaseResults.length}) under limit. Merging local dataset fallback...`);
  const localCandidates = filterLocalDataset(query);
  const existingTitles = new Set([...supabaseResults, ...apiResults].map(e => e.name.toLowerCase()));
  const newLocal = localCandidates.filter(e => !existingTitles.has(e.name.toLowerCase()));
  const finalMerged = [...supabaseResults, ...apiResults, ...newLocal].slice(0, needed);

  return finalMerged.length > 0 ? finalMerged : EXERCISE_DATABASE_FLAT.slice(0, needed);
}

function filterLocalDataset(query: ExerciseQuery): ExerciseDetail[] {
  let list = [...EXERCISE_DATABASE_FLAT];
  if (query.category) {
    list = list.filter(ex => ex.category === query.category || query.category === 'full_body');
  }
  if (query.equipment) {
    const eq = query.equipment.toLowerCase();
    if (eq === 'none' || eq === 'bodyweight') {
      list = list.filter(ex => ex.equipment === 'Bodyweight' || ex.equipment === 'Chair' || ex.equipment === 'None');
    } else if (eq === 'dumbbells') {
      list = list.filter(ex => ex.equipment === 'Bodyweight' || ex.equipment === 'Dumbbells' || ex.equipment === 'Chair');
    } else if (eq === 'bands') {
      list = list.filter(ex => ex.equipment === 'Bodyweight' || ex.equipment === 'Bands');
    }
  }
  return shuffleArray(list);
}

async function cacheExercisesToSupabase(records: ExerciseRecord[]): Promise<void> {
  if (!supabase) return;
  const toInsert = records.map(r => ({
    external_id: r.external_id,
    title: r.title,
    description: r.description,
    exercise_type: r.exercise_type,
    body_part: r.body_part,
    equipment: r.equipment,
    level: r.level,
    category: r.category,
    primary_muscle: r.primary_muscle,
    secondary_muscles: r.secondary_muscles || [],
    sets_recommended: r.sets_recommended,
    reps_recommended: r.reps_recommended,
    rest_seconds: r.rest_seconds,
    duration_seconds: r.duration_seconds,
    calories_estimate: r.calories_estimate,
    location: r.location,
    instructions: r.instructions || [],
    common_mistakes: r.common_mistakes || [],
    benefits: r.benefits || [],
    gif_url: r.gif_url || null,
    source: 'exercisedb',
  }));

  const { error } = await supabase
    .from('exercise_database')
    .upsert(toInsert, {
      onConflict: 'external_id',
      ignoreDuplicates: true,
    });

  if (error && !error.message.includes('duplicate')) {
    console.warn('[ExerciseDB] Cache upsert warning:', error.message);
  }
}

function mapApiToRecord(item: any): ExerciseRecord {
  const equipment = mapApiEquipment(item.equipment);
  const bodyPart = capitalizeWords(item.bodyPart || 'Full Body');
  return {
    id: `api-${item.id}`,
    external_id: item.id,
    title: item.name ? capitalizeWords(item.name) : 'Exercise',
    description: item.instructions?.join(' ') || `Targets ${item.target} using ${item.equipment}.`,
    exercise_type: 'Strength',
    body_part: bodyPart,
    equipment,
    level: 'Intermediate',
    category: mapBodyPartToCategory(item.bodyPart),
    primary_muscle: item.target ? capitalizeWords(item.target) : bodyPart,
    secondary_muscles: item.secondaryMuscles || [],
    sets_recommended: 3,
    reps_recommended: '10-12 reps',
    rest_seconds: 45,
    duration_seconds: 45,
    calories_estimate: 6,
    location: ['Barbell', 'Cable', 'Machine', 'EZ Bar'].includes(equipment) ? 'Gym' : 'Both',
    instructions: item.instructions || ['Maintain controlled form throughout.', 'Breathe out during exertion.'],
    common_mistakes: ['Rushing repetitions', 'Inadequate range of motion'],
    benefits: [`Builds ${item.target || 'muscle'} strength and definition.`],
    gif_url: item.gifUrl || undefined,
    source: 'exercisedb',
  };
}

function mapRecordToDetail(r: ExerciseRecord): ExerciseDetail {
  return {
    id: r.id || r.external_id || `ex-${Math.random().toString(36).substring(2, 7)}`,
    name: r.title,
    category: (r.category as any) || 'full_body',
    description: r.description || `Targets ${r.primary_muscle || r.body_part}.`,
    primaryMuscle: r.primary_muscle || r.body_part || 'Full Body',
    secondaryMuscle: r.secondary_muscles?.join(', ') || 'Core & Stabilizers',
    difficulty: (r.level as any) || 'Intermediate',
    purpose: r.benefits?.[0] || `Strengthens ${r.primary_muscle || r.body_part}.`,
    contraindications: r.common_mistakes || ['Avoid if experiencing acute joint pain.'],
    durationSeconds: r.duration_seconds || 45,
    repetitions: r.reps_recommended || '10 - 12 reps',
    reps: r.reps_recommended || '10-12 reps',
    sets: r.sets_recommended || 3,
    restSeconds: r.rest_seconds || 30,
    equipment: r.equipment || 'Bodyweight',
    location: (r.location as any) || 'Both',
    instructions: r.instructions || ['Maintain controlled form throughout.', 'Breathe out during exertion.'],
    commonMistakes: r.common_mistakes || ['Rushing repetitions'],
    safetyTips: r.benefits || ['Warm up prior to workout'],
    caloriesEstimate: r.calories_estimate || 6,
  };
}

function mapToApiBodyPart(bp: string): string {
  const map: Record<string, string> = {
    'abdominals': 'waist',
    'abs': 'waist',
    'quadriceps': 'upper legs',
    'hamstrings': 'upper legs',
    'glutes': 'upper legs',
    'calves': 'lower legs',
    'lats': 'back',
    'middle back': 'back',
    'lower back': 'back',
    'chest': 'chest',
    'shoulders': 'shoulders',
    'biceps': 'upper arms',
    'triceps': 'upper arms',
    'forearms': 'lower arms',
    'neck': 'neck',
  };
  return map[bp.toLowerCase()] || bp.toLowerCase();
}

function mapApiEquipment(eq?: string): string {
  if (!eq) return 'Bodyweight';
  const e = eq.toLowerCase();
  if (e.includes('body') || e === 'assisted') return 'Bodyweight';
  if (e.includes('dumbbell')) return 'Dumbbell';
  if (e.includes('barbell')) return 'Barbell';
  if (e.includes('cable')) return 'Cable';
  if (e.includes('band') || e.includes('resistance')) return 'Resistance Bands';
  if (e.includes('kettlebell')) return 'Kettlebell';
  if (e.includes('machine') || e.includes('leverage')) return 'Machine';
  if (e.includes('medicine')) return 'Medicine Ball';
  if (e.includes('ez') || e.includes('curl bar')) return 'EZ Bar';
  return 'Other';
}

function mapBodyPartToCategory(bp?: string): string {
  if (!bp) return 'full_body';
  const b = bp.toLowerCase();
  if (b.includes('waist') || b.includes('abs')) return 'core';
  if (b.includes('chest')) return 'chest';
  if (b.includes('back')) return 'back';
  if (b.includes('leg') || b.includes('glute') || b.includes('calf') || b.includes('calves')) return 'legs';
  if (b.includes('shoulder')) return 'shoulders';
  if (b.includes('arm') || b.includes('bicep') || b.includes('tricep')) return 'arms';
  if (b.includes('cardio')) return 'cardio';
  return 'full_body';
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
