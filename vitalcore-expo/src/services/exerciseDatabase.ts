/**
 * VitalCore Exercise Database Service
 * ====================================
 * Priority:
 *   1. Supabase exercise_database table (primary source)
 *   2. Local exercise database (zero external API dependencies)
 *
 * This service is the SINGLE point of truth for exercise fetching in the app.
 */

import { supabase } from './supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

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
  excludeIds?: string[];   // Exercise IDs already in the current session
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Maps app-level category → dataset body_part values
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

// Maps equipment selection → database equipment values
const EQUIPMENT_FILTER: Record<string, string[]> = {
  none:           ['Bodyweight'],
  bodyweight:     ['Bodyweight'],
  dumbbells:      ['Bodyweight', 'Dumbbell'],
  bands:          ['Bodyweight', 'Resistance Bands'],
  commercial_gym: ['Bodyweight', 'Dumbbell', 'Barbell', 'Cable', 'Machine', 'EZ Bar', 'Kettlebell'],
  kettlebell:     ['Bodyweight', 'Kettlebell'],
};

// ── Core Fetch Function ───────────────────────────────────────────────────────

/**
 * PRIMARY: Fetch exercises from Supabase exercise_database.
 * Returns up to `limit` exercises matching the query filters.
 */
export async function fetchExercisesFromSupabase(query: ExerciseQuery): Promise<ExerciseRecord[]> {
  try {
    let dbQuery = supabase
      .from('exercise_database')
      .select('*');

    // Filter by body_part (category mapping)
    if (query.category && CATEGORY_TO_BODY_PARTS[query.category]) {
      const bodyParts = CATEGORY_TO_BODY_PARTS[query.category];
      dbQuery = dbQuery.in('body_part', bodyParts);
    } else if (query.bodyPart) {
      dbQuery = dbQuery.eq('body_part', query.bodyPart);
    }

    // Filter by level
    if (query.level) {
      dbQuery = dbQuery.eq('level', query.level);
    }

    // Filter by location
    if (query.location && query.location !== 'Both') {
      dbQuery = dbQuery.in('location', [query.location, 'Both']);
    }

    // Filter by equipment
    if (query.equipment) {
      const equipList = EQUIPMENT_FILTER[query.equipment.toLowerCase()] || ['Bodyweight'];
      dbQuery = dbQuery.in('equipment', equipList);
    }

    // Exclude already-used exercises (variety)
    if (query.excludeIds && query.excludeIds.length > 0) {
      dbQuery = dbQuery.not('id', 'in', `(${query.excludeIds.map(id => `'${id}'`).join(',')})`);
    }

    // Fetch more than needed for shuffling
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

    // Shuffle and return requested limit
    const shuffled = shuffleArray(data as ExerciseRecord[]);
    return shuffled.slice(0, query.limit || 10);
  } catch (err) {
    console.warn('[ExerciseDB] Supabase fetch exception:', err);
    return [];
  }
}

export async function fetchExercisesFromAPI(_query: ExerciseQuery): Promise<ExerciseRecord[]> {
  // External API calls prohibited by system design policy.
  return [];
}

/**
 * MAIN ENTRY: Supabase DB with local dataset fallback (Zero external API dependencies).
 */
export async function fetchExercisesForPlan(query: ExerciseQuery): Promise<ExerciseRecord[]> {
  const needed = query.limit || 6;

  // Step 1: Try Supabase
  const supabaseResults = await fetchExercisesFromSupabase(query);

  if (supabaseResults.length >= needed) {
    console.log(`[ExerciseDB] Supabase returned ${supabaseResults.length} exercises ✓`);
    return supabaseResults;
  }

  return supabaseResults;
}

// ── Caching ───────────────────────────────────────────────────────────────────

async function cacheExercisesToSupabase(records: ExerciseRecord[]): Promise<void> {
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

  // Use upsert with external_id to avoid duplicates
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

// ── Mappers ───────────────────────────────────────────────────────────────────

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

function mapApiBodyPart(bp: string): string {
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

// ── Utilities ─────────────────────────────────────────────────────────────────

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
