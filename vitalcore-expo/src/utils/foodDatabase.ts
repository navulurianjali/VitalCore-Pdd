/**
 * VitalCore Food Database Service
 *
 * Search order:
 *   1. Supabase food_database table (1014 Indian foods, per 100g values)
 *   2. Open Food Facts API fallback (free, unlimited)
 *
 * All per-100g values: dynamic calculation = (per100g / 100) * grams
 */
import { supabase } from '../services/supabase';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface FoodItem {
  id: string;
  name: string;
  // Legacy compat fields
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'all';
  servingUnit: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  // Per-100g nutrition fields
  per100gCalories: number;
  per100gProtein: number;
  per100gCarbs: number;
  per100gFat: number;
  per100gFiber: number;
  per100gSugar: number;
  per100gSodium: number;
  source: 'supabase' | 'api' | 'local';
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

export type SearchStatus = 'idle' | 'searching-db' | 'searching-api' | 'done' | 'not-found';

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

// ─────────────────────────────────────────────────────────────
// Convert Supabase row → FoodItem
// ─────────────────────────────────────────────────────────────

function rowToFoodItem(row: any): FoodItem {
  const cal = Number(row.calories) || 0;
  const prot = Number(row.protein) || 0;
  const carbs = Number(row.carbohydrates) || 0;
  const fat = Number(row.fat) || 0;
  const fiber = Number(row.fiber) || 0;
  const sugar = Number(row.sugar) || 0;
  const sodium = Number(row.sodium) || 0;
  return {
    id: row.id || `db-${Math.random()}`,
    name: row.food_name,
    category: 'all',
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
    source: 'supabase',
  };
}

// ─────────────────────────────────────────────────────────────
// Step 1: Search Supabase food_database table
// ─────────────────────────────────────────────────────────────

export async function searchSupabaseFoodDatabase(query: string): Promise<FoodItem[]> {
  try {
    if (!query || query.trim().length < 1) {
      const { data } = await supabase
        .from('food_database')
        .select('*')
        .limit(15)
        .order('food_name', { ascending: true });
      return (data || []).map(rowToFoodItem);
    }

    const q = query.trim();
    const { data, error } = await supabase
      .from('food_database')
      .select('*')
      .ilike('food_name', `%${q}%`)
      .limit(20)
      .order('food_name', { ascending: true });

    if (error) return [];

    // Sort: exact > starts-with > contains
    const qLower = q.toLowerCase();
    const sorted = (data || []).sort((a: any, b: any) => {
      const aName = a.food_name.toLowerCase();
      const bName = b.food_name.toLowerCase();
      if (aName === qLower) return -1;
      if (bName === qLower) return 1;
      if (aName.startsWith(qLower) && !bName.startsWith(qLower)) return -1;
      if (bName.startsWith(qLower) && !aName.startsWith(qLower)) return 1;
      return aName.localeCompare(bName);
    });

    return sorted.map(rowToFoodItem);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Step 2: API Fallback — Open Food Facts (free, no key)
// ─────────────────────────────────────────────────────────────

export async function searchNutritionAPIFallback(query: string): Promise<FoodItem[]> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,nutriments,serving_size`;
    const res = await fetch(url, { signal: AbortSignal.timeout(7000) });

    if (!res.ok) return [];

    const data = await res.json();
    const products = data.products || [];
    const results: FoodItem[] = [];

    for (const product of products) {
      const name = product.product_name?.trim();
      const n = product.nutriments || {};
      const cal = Number(n['energy-kcal_100g'] || n['energy_100g'] || 0);
      if (!name || cal === 0) continue;

      results.push({
        id: `api-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        category: 'all',
        servingUnit: 'g',
        baseCalories: Math.round(cal),
        baseProtein: Number(n['proteins_100g'] || 0),
        baseCarbs: Number(n['carbohydrates_100g'] || 0),
        baseFat: Number(n['fat_100g'] || 0),
        per100gCalories: Math.round(cal),
        per100gProtein: Number(n['proteins_100g'] || 0),
        per100gCarbs: Number(n['carbohydrates_100g'] || 0),
        per100gFat: Number(n['fat_100g'] || 0),
        per100gFiber: Number(n['fiber_100g'] || 0),
        per100gSugar: Number(n['sugars_100g'] || 0),
        per100gSodium: Number(n['sodium_100g'] ? Number(n['sodium_100g']) * 1000 : 0),
        source: 'api',
      });
    }
    return results.slice(0, 10);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Smart Search Orchestrator
// ─────────────────────────────────────────────────────────────

export async function smartFoodSearch(
  query: string,
  onStatus?: (status: SearchStatus) => void
): Promise<{ results: FoodItem[]; source: 'database' | 'api' | 'none' }> {
  if (!query || query.trim().length < 1) {
    onStatus?.('done');
    return { results: [], source: 'none' };
  }

  onStatus?.('searching-db');
  const dbResults = await searchSupabaseFoodDatabase(query);
  if (dbResults.length > 0) {
    onStatus?.('done');
    return { results: dbResults, source: 'database' };
  }

  onStatus?.('searching-api');
  const apiResults = await searchNutritionAPIFallback(query);
  if (apiResults.length > 0) {
    // Cache for future use (fire-and-forget)
    supabase.from('food_database').insert(
      apiResults.map(f => ({
        food_name: f.name,
        serving_size: 100,
        calories: f.per100gCalories,
        protein: f.per100gProtein,
        carbohydrates: f.per100gCarbs,
        fat: f.per100gFat,
        fiber: f.per100gFiber,
        sugar: f.per100gSugar,
        sodium: f.per100gSodium,
        source: 'api_cache',
      }))
    ).then(() => {}).catch(() => {});

    onStatus?.('done');
    return { results: apiResults, source: 'api' };
  }

  onStatus?.('not-found');
  return { results: [], source: 'none' };
}

// ─────────────────────────────────────────────────────────────
// Backward Compat — legacy FOOD_DATABASE (30 items)
// ─────────────────────────────────────────────────────────────

const makeLegacy = (
  id: string, name: string, cat: FoodItem['category'], unit: string,
  cal: number, prot: number, carbs: number, fat: number,
  fiber = 0, sugar = 0, sodium = 0
): FoodItem => ({
  id, name, category: cat, servingUnit: unit,
  baseCalories: cal, baseProtein: prot, baseCarbs: carbs, baseFat: fat,
  per100gCalories: cal, per100gProtein: prot, per100gCarbs: carbs, per100gFat: fat,
  per100gFiber: fiber, per100gSugar: sugar, per100gSodium: sodium,
  source: 'local',
});

export const FOOD_DATABASE: FoodItem[] = [
  makeLegacy('f1', 'Idli', 'breakfast', 'g', 39, 1.8, 7.8, 0.2, 0.5, 0.1, 5),
  makeLegacy('f2', 'Plain Dosa', 'breakfast', 'g', 133, 3, 23, 3.5, 1, 0.5, 100),
  makeLegacy('f3', 'Masala Dosa', 'breakfast', 'g', 211, 4.8, 28, 8.5, 1.5, 0.8, 200),
  makeLegacy('f4', 'Sambar', 'all', 'g', 60, 3.2, 9, 1.5, 2, 1, 250),
  makeLegacy('f5', 'Poha', 'breakfast', 'g', 180, 3.5, 32, 4.5, 1.2, 0.5, 150),
  makeLegacy('f6', 'Upma', 'breakfast', 'g', 145, 3.5, 22, 5, 1, 0.5, 200),
  makeLegacy('f7', 'Chapati / Roti', 'all', 'g', 297, 9, 55, 4, 2, 0.5, 10),
  makeLegacy('f8', 'Steamed Rice', 'lunch', 'g', 130, 2.7, 28, 0.3, 0.4, 0, 1),
  makeLegacy('f9', 'Yellow Dal Tadka', 'lunch', 'g', 90, 5.5, 12, 3, 2.5, 0.5, 300),
  makeLegacy('f10', 'Paneer Butter Masala', 'dinner', 'g', 200, 9, 8, 16, 1, 3, 400),
  makeLegacy('f11', 'Chicken Curry', 'dinner', 'g', 150, 14, 5, 9, 0.5, 0.5, 350),
  makeLegacy('f12', 'Egg Curry', 'dinner', 'g', 140, 10, 4, 10, 0.3, 0.5, 300),
  makeLegacy('f13', 'Boiled Egg', 'breakfast', 'g', 155, 13, 1.1, 11, 0, 1.1, 124),
  makeLegacy('f14', 'Oatmeal with Milk', 'breakfast', 'g', 71, 3.5, 12, 1.5, 1.5, 1, 50),
  makeLegacy('f15', 'Curd / Yoghurt', 'all', 'g', 61, 3.5, 4.7, 3.3, 0, 4, 46),
  makeLegacy('f16', 'Chole', 'lunch', 'g', 164, 8.9, 27, 2.6, 7.6, 0.5, 24),
  makeLegacy('f17', 'Rajma Masala', 'lunch', 'g', 127, 7, 20, 2, 6, 0.5, 200),
  makeLegacy('f18', 'Vegetable Biryani', 'lunch', 'g', 151, 3, 25, 4.5, 1, 1, 300),
  makeLegacy('f19', 'Chicken Biryani', 'dinner', 'g', 182, 13, 22, 5, 0.5, 1, 350),
  makeLegacy('f20', 'Fish Curry', 'dinner', 'g', 118, 13, 3, 6, 0.3, 0.5, 400),
  makeLegacy('f21', 'Apple', 'snack', 'g', 52, 0.3, 14, 0.2, 2.4, 10, 1),
  makeLegacy('f22', 'Banana', 'snack', 'g', 89, 1.1, 23, 0.3, 2.6, 12, 1),
  makeLegacy('f23', 'Almonds', 'snack', 'g', 579, 21, 22, 50, 12.5, 4.4, 1),
  makeLegacy('f24', 'Green Tea', 'snack', 'g', 1, 0.2, 0.2, 0, 0, 0, 3),
  makeLegacy('f25', 'Milk Tea', 'breakfast', 'g', 35, 1.5, 4, 1.5, 0, 3, 20),
  makeLegacy('f26', 'Whey Protein Shake', 'snack', 'g', 358, 80, 8, 3, 0, 3, 200),
  makeLegacy('f27', 'Green Salad', 'snack', 'g', 17, 1.2, 3.3, 0.2, 2.2, 1.5, 28),
  makeLegacy('f28', 'Peanut Butter Sandwich', 'snack', 'g', 333, 12, 35, 17, 2.5, 5, 400),
  makeLegacy('f29', 'Sprouted Moong Salad', 'snack', 'g', 105, 8, 19, 0.5, 4.5, 2, 15),
  makeLegacy('f30', 'Mixed Fruit Bowl', 'snack', 'g', 65, 1, 16, 0.3, 2, 12, 5),
];

export function searchFoodDatabase(query: string): FoodItem[] {
  if (!query || query.trim() === '') return FOOD_DATABASE.slice(0, 12);
  const q = query.toLowerCase().trim();
  return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(q));
}
