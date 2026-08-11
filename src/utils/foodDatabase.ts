/**
 * VitalCore Food Search Engine & Unified Dataset Architecture
 *
 * SEARCH PRIORITY PIPELINE:
 *   STEP 1: Search ALL local datasets (merged dataset containing Indian_Food_Nutrition_Processed, food_coded, etc.)
 *   STEP 2: If not found in local datasets, search external nutrition API (Open Food Facts fallback)
 *   STEP 3: If API finds the food: save to Supabase food_database AND cache locally for instant future lookups
 *   STEP 4: Only if ALL datasets AND API fail, show "Food not found."
 */

import { supabase } from './supabase';
import mergedJson from './mergedFoodDatabase.json';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingUnit: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  per100gCalories: number;
  per100gProtein: number;
  per100gCarbs: number;
  per100gFat: number;
  per100gFiber: number;
  per100gSugar: number;
  per100gSodium: number;
  source: 'dataset' | 'api' | 'supabase' | 'local';
}

export interface NutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  grams: number;
}

export type SearchStatus = 'idle' | 'searching-local' | 'searching-api' | 'done' | 'not-found';

// Runtime memory cache for API imported items & merged datasets
let RUNTIME_LOCAL_DATASET: any[] = [...(mergedJson as any[])];

// ─────────────────────────────────────────────────────────────
// Dynamic Nutrition Calculation (gram-based)
// ─────────────────────────────────────────────────────────────

export function calculateNutrition(food: FoodItem, grams: number): NutritionResult {
  const g = Math.max(1, grams || 100);
  const factor = g / 100;
  return {
    calories: Math.round(food.per100gCalories * factor),
    protein: Number((food.per100gProtein * factor).toFixed(1)),
    carbs: Number((food.per100gCarbs * factor).toFixed(1)),
    fat: Number((food.per100gFat * factor).toFixed(1)),
    fiber: Number((food.per100gFiber * factor).toFixed(1)),
    sugar: Number((food.per100gSugar * factor).toFixed(1)),
    sodium: Number((food.per100gSodium * factor).toFixed(1)),
    grams: g,
  };
}

// Convert row/JSON object → FoodItem
export function rowToFoodItem(row: any): FoodItem {
  const cal = Number(row.calories) || 0;
  const prot = Number(row.protein_g ?? row.protein) || 0;
  const carbs = Number(row.carbs_g ?? row.carbohydrates) || 0;
  const fat = Number(row.fat_g ?? row.fat) || 0;
  const fiber = Number(row.fiber_g ?? row.fiber) || 0;
  const sugar = Number(row.sugar_g ?? row.sugar) || 0;
  const sodium = Number(row.sodium_mg ?? row.sodium) || 0;
  return {
    id: row.id || `food-${Math.random().toString(36).slice(2, 8)}`,
    name: row.food_name || row.name || 'Unknown Food',
    category: row.category || 'General',
    servingUnit: 'g',
    baseCalories: cal,
    baseProtein: prot,
    baseCarbs: carbs,
    baseFat: fat,
    per100gCalories: cal,
    per100gProtein: prot,
    per100gCarbs: carbs,
    per100gFat: fat,
    per100gFiber: fiber,
    per100gSugar: sugar,
    per100gSodium: sodium,
    source: row.source === 'api' ? 'api' : 'dataset',
  };
}

// ─────────────────────────────────────────────────────────────
// STEP 1: Search ALL Local Datasets (Fuzzy + Token Matching)
// ─────────────────────────────────────────────────────────────

export function searchLocalMergedDatabase(query: string): FoodItem[] {
  if (!query || !query.trim()) {
    return RUNTIME_LOCAL_DATASET.slice(0, 15).map(rowToFoodItem);
  }

  const cleanQuery = query.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 0);

  if (tokens.length === 0) return [];

  const matched = RUNTIME_LOCAL_DATASET.filter((item) => {
    const fname = (item.food_name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const keywords: string[] = item.search_keywords || [];

    if (fname === cleanQuery || fname.includes(cleanQuery)) return true;

    const allTokensMatch = tokens.every(
      (token) => fname.includes(token) || keywords.some((k) => k.includes(token))
    );
    if (allTokensMatch) return true;

    const anyTokenMatch = tokens.some((token) => token.length >= 3 && fname.includes(token));
    return anyTokenMatch;
  });

  matched.sort((a, b) => {
    const aName = (a.food_name || '').toLowerCase();
    const bName = (b.food_name || '').toLowerCase();

    if (aName === cleanQuery) return -1;
    if (bName === cleanQuery) return 1;

    const aStarts = aName.startsWith(cleanQuery);
    const bStarts = bName.startsWith(cleanQuery);
    if (aStarts && !bStarts) return -1;
    if (bStarts && !aStarts) return 1;

    const aTokenCount = tokens.filter((t) => aName.includes(t)).length;
    const bTokenCount = tokens.filter((t) => bName.includes(t)).length;
    if (aTokenCount !== bTokenCount) return bTokenCount - aTokenCount;

    return aName.localeCompare(bName);
  });

  return matched.slice(0, 25).map(rowToFoodItem);
}

// ─────────────────────────────────────────────────────────────
// DATASET-ONLY FOOD SEARCH (ZERO EXTERNAL API DEPENDENCY)
// ─────────────────────────────────────────────────────────────

export async function searchNutritionAPIFallback(_query: string): Promise<FoodItem[]> {
  // External API calls prohibited by system design policy.
  return [];
}

export async function smartFoodSearch(
  query: string,
  onStatus?: (status: SearchStatus) => void
): Promise<{ results: FoodItem[]; source: 'dataset' | 'api' | 'none' }> {
  const q = query ? query.trim() : '';

  if (!q) {
    onStatus?.('done');
    return { results: RUNTIME_LOCAL_DATASET.slice(0, 15).map(rowToFoodItem), source: 'dataset' };
  }

  // Search local merged dataset
  onStatus?.('searching-local');
  const localResults = searchLocalMergedDatabase(q);
  if (localResults.length > 0) {
    onStatus?.('done');
    return { results: localResults, source: 'dataset' };
  }

  // If no matching food found in the local nutrition dataset
  onStatus?.('not-found');
  return { results: [], source: 'none' };
}

export function searchFoodDatabase(query: string): FoodItem[] {
  return searchLocalMergedDatabase(query);
}

export async function searchSupabaseFoodDatabase(query: string): Promise<FoodItem[]> {
  try {
    const q = query.trim();
    if (!q) return [];
    const { data } = await supabase
      .from('food_database')
      .select('*')
      .ilike('food_name', `%${q}%`)
      .limit(20);
    return (data || []).map(rowToFoodItem);
  } catch {
    return [];
  }
}

export const FOOD_DATABASE: FoodItem[] = RUNTIME_LOCAL_DATASET.map(rowToFoodItem);
