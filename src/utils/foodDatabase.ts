export interface FoodItem {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'all';
  servingUnit: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
}

export const FOOD_DATABASE: FoodItem[] = [
  // Indian Staples & Breakfast
  { id: 'f1', name: 'Idli', category: 'breakfast', servingUnit: 'piece', baseCalories: 58, baseProtein: 2, baseCarbs: 12, baseFat: 0.2 },
  { id: 'f2', name: 'Plain Dosa', category: 'breakfast', servingUnit: 'piece', baseCalories: 133, baseProtein: 3, baseCarbs: 23, baseFat: 3.5 },
  { id: 'f3', name: 'Masala Dosa', category: 'breakfast', servingUnit: 'piece', baseCalories: 250, baseProtein: 5, baseCarbs: 38, baseFat: 9 },
  { id: 'f4', name: 'Sambar', category: 'all', servingUnit: 'bowl', baseCalories: 110, baseProtein: 4.5, baseCarbs: 18, baseFat: 2.5 },
  { id: 'f5', name: 'Poha', category: 'breakfast', servingUnit: 'plate', baseCalories: 240, baseProtein: 4.5, baseCarbs: 42, baseFat: 6 },
  { id: 'f6', name: 'Upma', category: 'breakfast', servingUnit: 'bowl', baseCalories: 210, baseProtein: 4, baseCarbs: 34, baseFat: 6.5 },
  { id: 'f7', name: 'Chapati / Roti', category: 'all', servingUnit: 'roti', baseCalories: 104, baseProtein: 3.1, baseCarbs: 18, baseFat: 2.2 },
  { id: 'f8', name: 'Steamed Rice', category: 'lunch', servingUnit: 'bowl', baseCalories: 205, baseProtein: 4.2, baseCarbs: 45, baseFat: 0.4 },
  { id: 'f9', name: 'Yellow Dal Tadka', category: 'lunch', servingUnit: 'bowl', baseCalories: 170, baseProtein: 9, baseCarbs: 22, baseFat: 5 },
  { id: 'f10', name: 'Paneer Butter Masala', category: 'dinner', servingUnit: 'bowl', baseCalories: 340, baseProtein: 14, baseCarbs: 12, baseFat: 26 },
  { id: 'f11', name: 'Chicken Curry', category: 'dinner', servingUnit: 'bowl', baseCalories: 280, baseProtein: 26, baseCarbs: 8, baseFat: 16 },
  { id: 'f12', name: 'Egg Curry', category: 'dinner', servingUnit: 'bowl', baseCalories: 220, baseProtein: 14, baseCarbs: 6, baseFat: 15 },
  { id: 'f13', name: 'Boiled Egg', category: 'breakfast', servingUnit: 'egg', baseCalories: 78, baseProtein: 6.3, baseCarbs: 0.6, baseFat: 5.3 },
  { id: 'f14', name: 'Oatmeal with Milk', category: 'breakfast', servingUnit: 'bowl', baseCalories: 220, baseProtein: 9, baseCarbs: 35, baseFat: 4.5 },
  { id: 'f15', name: 'Curd / Yoghurt', category: 'all', servingUnit: 'cup', baseCalories: 98, baseProtein: 5.5, baseCarbs: 7, baseFat: 5 },
  { id: 'f16', name: 'Chole (Chickpea Curry)', category: 'lunch', servingUnit: 'bowl', baseCalories: 240, baseProtein: 11, baseCarbs: 36, baseFat: 6 },
  { id: 'f17', name: 'Rajma Masala', category: 'lunch', servingUnit: 'bowl', baseCalories: 225, baseProtein: 10.5, baseCarbs: 34, baseFat: 5.5 },
  { id: 'f18', name: 'Vegetable Biryani', category: 'lunch', servingUnit: 'plate', baseCalories: 380, baseProtein: 7, baseCarbs: 62, baseFat: 12 },
  { id: 'f19', name: 'Chicken Biryani', category: 'dinner', servingUnit: 'plate', baseCalories: 480, baseProtein: 28, baseCarbs: 58, baseFat: 16 },
  { id: 'f20', name: 'Fish Curry', category: 'dinner', servingUnit: 'bowl', baseCalories: 240, baseProtein: 22, baseCarbs: 6, baseFat: 14 },
  
  // Healthy Snacks & Beverages
  { id: 'f21', name: 'Apple', category: 'snack', servingUnit: 'piece', baseCalories: 95, baseProtein: 0.5, baseCarbs: 25, baseFat: 0.3 },
  { id: 'f22', name: 'Banana', category: 'snack', servingUnit: 'piece', baseCalories: 105, baseProtein: 1.3, baseCarbs: 27, baseFat: 0.3 },
  { id: 'f23', name: 'Mixed Almonds (10-12)', category: 'snack', servingUnit: 'serving', baseCalories: 160, baseProtein: 6, baseCarbs: 6, baseFat: 14 },
  { id: 'f24', name: 'Green Tea', category: 'snack', servingUnit: 'cup', baseCalories: 2, baseProtein: 0.1, baseCarbs: 0.4, baseFat: 0 },
  { id: 'f25', name: 'Milk Coffee / Tea', category: 'breakfast', servingUnit: 'cup', baseCalories: 75, baseProtein: 2.5, baseCarbs: 9, baseFat: 3 },
  { id: 'f26', name: 'Whey Protein Shake', category: 'snack', servingUnit: 'scoop', baseCalories: 120, baseProtein: 24, baseCarbs: 3, baseFat: 1.5 },
  { id: 'f27', name: 'Fresh Green Salad', category: 'snack', servingUnit: 'bowl', baseCalories: 45, baseProtein: 2, baseCarbs: 8, baseFat: 0.5 },
  { id: 'f28', name: 'Peanut Butter Sandwich', category: 'snack', servingUnit: 'sandwich', baseCalories: 290, baseProtein: 10, baseCarbs: 32, baseFat: 14 },
  { id: 'f29', name: 'Sprouted Moong Salad', category: 'snack', servingUnit: 'bowl', baseCalories: 140, baseProtein: 9, baseCarbs: 22, baseFat: 1.2 },
  { id: 'f30', name: 'Mixed Fruit Bowl', category: 'snack', servingUnit: 'bowl', baseCalories: 120, baseProtein: 1.5, baseCarbs: 29, baseFat: 0.4 },
];

export function searchFoodDatabase(query: string): FoodItem[] {
  if (!query || query.trim() === '') return FOOD_DATABASE.slice(0, 12);
  const q = query.toLowerCase().trim();
  return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(q));
}

export function calculateNutrition(food: FoodItem, quantity: number) {
  const q = Math.max(0.1, quantity || 1);
  return {
    calories: Math.round(food.baseCalories * q),
    protein: Number((food.baseProtein * q).toFixed(1)),
    carbs: Number((food.baseCarbs * q).toFixed(1)),
    fat: Number((food.baseFat * q).toFixed(1)),
  };
}
