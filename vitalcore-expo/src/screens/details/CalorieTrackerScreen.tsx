import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import {
  FoodItem,
  SearchStatus,
  smartFoodSearch,
  calculateNutrition,
  FOOD_DATABASE,
} from '../../utils/foodDatabase';

interface LoggedFood {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'snacks';
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  serving_size?: string;
  created_at?: string;
}

export default function CalorieTrackerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { colors, isCareMode } = useTheme();

  const [logs, setLogs] = useState<LoggedFood[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile goals
  const goalCalories = profile?.calorie_goal || 2000;
  const goalProtein = profile?.protein_goal || 110;
  const goalCarbs = profile?.carb_goal || 250;
  const goalFat = profile?.fat_goal || 70;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [searchSource, setSearchSource] = useState<'database' | 'api' | 'none'>('none');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selected food + quantity in grams
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [gramsInput, setGramsInput] = useState('100');
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const grams = Math.max(1, parseInt(gramsInput, 10) || 100);

  // ─────────────────────────────────────────────────────────────
  // Fetch today's logs
  // ─────────────────────────────────────────────────────────────
  const fetchLogs = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .order('created_at', { ascending: true });
      if (data && !error) setLogs(data as LoggedFood[]);
    } catch (e) {
      console.error('Error fetching logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (!user?.id) return;
    const channel = supabase
      .channel(`expo_nutrition_logs_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nutrition_logs', filter: `user_id=eq.${user.id}` }, () => fetchLogs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // ─────────────────────────────────────────────────────────────
  // Debounced food search
  // ─────────────────────────────────────────────────────────────
  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(FOOD_DATABASE.slice(0, 10));
      setSearchStatus('idle');
      setSearchSource('none');
      return;
    }

    const { results, source } = await smartFoodSearch(query, setSearchStatus);
    setSearchResults(results);
    setSearchSource(source);

    // Auto-select top result if nothing selected yet
    if (results.length > 0 && !selectedFood) {
      setSelectedFood(results[0]);
    }
  }, [selectedFood]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery]);

  // ─────────────────────────────────────────────────────────────
  // Open modal
  // ─────────────────────────────────────────────────────────────
  const handleOpenAddModal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setActiveMealType(mealType);
    setEditingLogId(null);
    setSearchQuery('');
    setSearchResults(FOOD_DATABASE.slice(0, 10));
    setSelectedFood(FOOD_DATABASE[0]);
    setGramsInput('100');
    setSearchStatus('idle');
    setModalOpen(true);
  };

  const handleOpenEditModal = (log: LoggedFood) => {
    setActiveMealType(log.meal_type === 'snacks' ? 'snack' : log.meal_type);
    setEditingLogId(log.id);
    setSearchQuery('');
    setSearchResults(FOOD_DATABASE.slice(0, 10));
    setSelectedFood(FOOD_DATABASE[0]);
    setGramsInput('100');
    setSearchStatus('idle');
    setModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────
  // Save food log
  // ─────────────────────────────────────────────────────────────
  const handleSaveFood = async () => {
    if (!user?.id || !selectedFood) return;
    try {
      setSaving(true);
      const nutrition = calculateNutrition(selectedFood, grams);
      const formattedName = `${selectedFood.name} (${grams}g)`;

      const logData = {
        meal_type: activeMealType,
        food_name: formattedName,
        calories: nutrition.calories,
        protein_g: nutrition.protein,
        carbs_g: nutrition.carbs,
        fat_g: nutrition.fat,
        fiber_g: nutrition.fiber,
        sugar_g: nutrition.sugar,
        sodium_mg: nutrition.sodium,
        serving_size: `${grams}g`,
      };

      const tempId = editingLogId || `temp-${Date.now()}`;
      const newLogEntry: LoggedFood = { id: tempId, ...logData };

      // Optimistic UI update
      if (editingLogId) {
        setLogs(prev => prev.map(item => item.id === editingLogId ? { ...item, ...newLogEntry } : item));
      } else {
        setLogs(prev => [...prev, newLogEntry]);
      }
      setModalOpen(false);

      if (editingLogId) {
        const { error } = await supabase.from('nutrition_logs').update(logData).eq('id', editingLogId);
        if (error) console.error('Update error:', error);
      } else {
        const { error } = await supabase.from('nutrition_logs').insert({
          user_id: user.id,
          date: todayStr,
          ...logData,
        });
        if (error) console.error('Insert error:', error);
      }
      fetchLogs();
    } catch (e: any) {
      console.error('Save error:', e);
      fetchLogs();
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Delete log
  // ─────────────────────────────────────────────────────────────
  const handleDeleteLog = async (id: string) => {
    setLogs(prev => prev.filter(item => item.id !== id));
    try {
      const { error } = await supabase.from('nutrition_logs').delete().eq('id', id);
      if (error) { console.error('Delete error:', error); fetchLogs(); }
    } catch (e) {
      console.error('Delete error:', e); fetchLogs();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Totals
  // ─────────────────────────────────────────────────────────────
  const totalCalories = logs.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = Number(logs.reduce((sum, item) => sum + (item.protein_g || 0), 0).toFixed(1));
  const totalCarbs = Number(logs.reduce((sum, item) => sum + (item.carbs_g || 0), 0).toFixed(1));
  const totalFat = Number(logs.reduce((sum, item) => sum + (item.fat_g || 0), 0).toFixed(1));
  const remainingCalories = Math.max(0, goalCalories - totalCalories);

  const breakfastLogs = logs.filter(l => l.meal_type === 'breakfast');
  const lunchLogs = logs.filter(l => l.meal_type === 'lunch');
  const dinnerLogs = logs.filter(l => l.meal_type === 'dinner');
  const snackLogs = logs.filter(l => l.meal_type === 'snack' || l.meal_type === 'snacks');

  const nutritionPreview = selectedFood ? calculateNutrition(selectedFood, grams) : null;

  // Search status badge
  const getStatusLabel = () => {
    if (searchStatus === 'searching-db') return '🔍 Searching database...';
    if (searchStatus === 'searching-api') return '🌐 Searching online...';
    if (searchStatus === 'not-found') return '❌ Not found in database or API';
    if (searchSource === 'api' && searchResults.length > 0) return '🌐 Results from online search';
    if (searchSource === 'database' && searchResults.length > 0) return '📦 Results from food database';
    return '';
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtnText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, fontSize: isCareMode ? 24 : 20 }]}>
            🥗 Calorie Tracker
          </Text>
        </View>

        {/* SECTION 1: TODAY'S MEALS */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today&apos;s Meals</Text>
        <View style={styles.mealsGrid}>
          {[
            { type: 'breakfast' as const, label: 'Breakfast', icon: '🍳', cal: breakfastLogs.reduce((s, i) => s + i.calories, 0) },
            { type: 'lunch' as const, label: 'Lunch', icon: '🥗', cal: lunchLogs.reduce((s, i) => s + i.calories, 0) },
            { type: 'dinner' as const, label: 'Dinner', icon: '🍲', cal: dinnerLogs.reduce((s, i) => s + i.calories, 0) },
            { type: 'snack' as const, label: 'Snacks', icon: '🍎', cal: snackLogs.reduce((s, i) => s + i.calories, 0) },
          ].map(meal => (
            <View key={meal.type} style={[styles.mealCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.mealCardHeader}>
                <Text style={styles.mealIcon}>{meal.icon}</Text>
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealLabel, { color: colors.text }]}>{meal.label}</Text>
                  <Text style={[styles.mealCal, { color: colors.primary }]}>{meal.cal} kcal</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.addFoodBtn, { backgroundColor: colors.primary }]} onPress={() => handleOpenAddModal(meal.type)}>
                <Text style={styles.addFoodBtnText}>+ Add Food</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* SECTION 2: NUTRITION SUMMARY */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today&apos;s Nutrition Summary</Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {[
            { label: 'Calories', val: totalCalories, goal: goalCalories, unit: 'kcal', color: '#f59e0b' },
            { label: 'Protein', val: totalProtein, goal: goalProtein, unit: 'g', color: colors.success },
            { label: 'Carbohydrates', val: totalCarbs, goal: goalCarbs, unit: 'g', color: colors.primary },
            { label: 'Fat', val: totalFat, goal: goalFat, unit: 'g', color: '#f43f5e' },
          ].map(bar => (
            <View key={bar.label} style={styles.progressGroup}>
              <View style={styles.progressRow}>
                <Text style={[styles.progressLabel, { color: colors.text }]}>{bar.label}</Text>
                <Text style={[styles.progressVal, { color: bar.color }]}>{bar.val} / {bar.goal} {bar.unit}</Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: colors.navBorder }]}>
                <View style={[styles.barFill, { backgroundColor: bar.color, width: `${Math.min(100, (bar.val / bar.goal) * 100)}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* SECTION 3: REMAINING CALORIES */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Remaining Calories</Text>
        <View style={[styles.remainingCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.remRow}>
            <Text style={[styles.remLbl, { color: colors.textMuted }]}>Daily Goal</Text>
            <Text style={[styles.remVal, { color: colors.text }]}>{goalCalories} kcal</Text>
          </View>
          <View style={styles.remRow}>
            <Text style={[styles.remLbl, { color: colors.textMuted }]}>Consumed</Text>
            <Text style={[styles.remVal, { color: '#f59e0b' }]}>{totalCalories} kcal</Text>
          </View>
          <View style={[styles.remDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.remRow}>
            <Text style={[styles.remTitle, { color: colors.primary }]}>Remaining</Text>
            <Text style={[styles.remBigVal, { color: colors.primary }]}>{remainingCalories} kcal</Text>
          </View>
        </View>

        {/* SECTION 4: TODAY'S FOOD LOG */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today&apos;s Food Log</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : logs.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No food logged today. Tap &quot;+ Add Food&quot; on any meal to start!
            </Text>
          </View>
        ) : (
          [
            { title: 'Breakfast', icon: '🍳', items: breakfastLogs },
            { title: 'Lunch', icon: '🥗', items: lunchLogs },
            { title: 'Dinner', icon: '🍲', items: dinnerLogs },
            { title: 'Snacks', icon: '🍎', items: snackLogs },
          ].map(group => (
            <View key={group.title} style={styles.logGroup}>
              <Text style={[styles.logGroupTitle, { color: colors.text }]}>{group.icon} {group.title}</Text>
              {group.items.length === 0 ? (
                <Text style={[styles.logGroupEmpty, { color: colors.textMuted }]}>No items logged</Text>
              ) : (
                group.items.map(item => (
                  <View key={item.id} style={[styles.logItemCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.logItemName, { color: colors.text }]}>{item.food_name}</Text>
                      <Text style={[styles.logItemMeta, { color: colors.textMuted }]}>
                        {item.calories} kcal • P: {item.protein_g}g • C: {item.carbs_g}g • F: {item.fat_g}g
                        {item.fiber_g ? ` • Fiber: ${item.fiber_g}g` : ''}
                      </Text>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity onPress={() => handleOpenEditModal(item)} style={styles.actionBtn}>
                        <Text style={{ fontSize: 16 }}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteLog(item.id)} style={styles.actionBtn}>
                        <Text style={{ fontSize: 16 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          ))
        )}

      </ScrollView>

      {/* ADD / EDIT FOOD MODAL */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingLogId ? 'Edit Food Entry' : `Add Food — ${activeMealType.charAt(0).toUpperCase() + activeMealType.slice(1)}`}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Text style={[styles.closeBtn, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchInputContainer, { borderColor: colors.navBorder, backgroundColor: colors.background }]}>
              <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search food (e.g. Rice, Idli, Chicken...)"
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {(searchStatus === 'searching-db' || searchStatus === 'searching-api') && (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
              )}
            </View>

            {/* Status badge */}
            {getStatusLabel() !== '' && (
              <Text style={[styles.statusBadge, { color: colors.textMuted }]}>{getStatusLabel()}</Text>
            )}

            {/* Search Results */}
            <View style={styles.resultList}>
              <FlatList
                data={searchResults}
                keyExtractor={item => item.id}
                style={{ maxHeight: 140 }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.resultItem,
                      selectedFood?.id === item.id && { backgroundColor: colors.primary + '22', borderColor: colors.primary },
                    ]}
                    onPress={() => setSelectedFood(item)}
                  >
                    <Text style={[styles.resultItemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.resultItemSub, { color: colors.textMuted }]}>
                      {item.per100gCalories} kcal / 100g
                      {item.source === 'api' ? ' 🌐' : item.source === 'supabase' ? ' 📦' : ''}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  searchStatus === 'not-found' ? (
                    <Text style={[styles.logGroupEmpty, { color: colors.textMuted, padding: 8 }]}>
                      No results found. Try a different name.
                    </Text>
                  ) : null
                }
              />
            </View>

            {/* Gram Input + Auto Calculation */}
            {selectedFood && (
              <View style={styles.quantitySection}>
                <Text style={[styles.qLabel, { color: colors.text }]}>
                  Amount (grams) — all values are per 100g
                </Text>
                <View style={styles.qControls}>
                  <TouchableOpacity
                    style={[styles.qBtn, { backgroundColor: colors.navBorder }]}
                    onPress={() => setGramsInput(prev => String(Math.max(1, (parseInt(prev, 10) || 100) - 25)))}
                  >
                    <Text style={[styles.qBtnText, { color: colors.text }]}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.qValInput, { color: colors.text, borderColor: colors.navBorder }]}
                    value={gramsInput}
                    onChangeText={v => setGramsInput(v.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                  <Text style={[styles.qUnit, { color: colors.textMuted }]}>g</Text>
                  <TouchableOpacity
                    style={[styles.qBtn, { backgroundColor: colors.navBorder }]}
                    onPress={() => setGramsInput(prev => String((parseInt(prev, 10) || 100) + 25))}
                  >
                    <Text style={[styles.qBtnText, { color: colors.text }]}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick preset buttons */}
                <View style={styles.presetRow}>
                  {[50, 100, 150, 200, 250].map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.presetBtn, grams === g && { backgroundColor: colors.primary }, { borderColor: colors.navBorder }]}
                      onPress={() => setGramsInput(String(g))}
                    >
                      <Text style={[styles.presetBtnText, { color: grams === g ? '#fff' : colors.textMuted }]}>{g}g</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {nutritionPreview && (
                  <View style={[styles.previewBox, { backgroundColor: colors.background }]}>
                    <Text style={[styles.prevTitle, { color: colors.primary }]}>
                      ⚡ Auto Calculated — {grams}g of {selectedFood.name}
                    </Text>
                    <View style={styles.prevGrid}>
                      <View style={styles.prevCell}>
                        <Text style={[styles.prevBigVal, { color: '#f59e0b' }]}>{nutritionPreview.calories}</Text>
                        <Text style={[styles.prevCellLabel, { color: colors.textMuted }]}>kcal</Text>
                      </View>
                      <View style={styles.prevCell}>
                        <Text style={[styles.prevBigVal, { color: colors.success }]}>{nutritionPreview.protein}g</Text>
                        <Text style={[styles.prevCellLabel, { color: colors.textMuted }]}>Protein</Text>
                      </View>
                      <View style={styles.prevCell}>
                        <Text style={[styles.prevBigVal, { color: colors.primary }]}>{nutritionPreview.carbs}g</Text>
                        <Text style={[styles.prevCellLabel, { color: colors.textMuted }]}>Carbs</Text>
                      </View>
                      <View style={styles.prevCell}>
                        <Text style={[styles.prevBigVal, { color: '#f43f5e' }]}>{nutritionPreview.fat}g</Text>
                        <Text style={[styles.prevCellLabel, { color: colors.textMuted }]}>Fat</Text>
                      </View>
                    </View>
                    {(nutritionPreview.fiber > 0 || nutritionPreview.sugar > 0) && (
                      <Text style={[styles.prevExtra, { color: colors.textMuted }]}>
                        {nutritionPreview.fiber > 0 ? `Fiber: ${nutritionPreview.fiber}g  ` : ''}
                        {nutritionPreview.sugar > 0 ? `Sugar: ${nutritionPreview.sugar}g  ` : ''}
                        {nutritionPreview.sodium > 0 ? `Sodium: ${nutritionPreview.sodium}mg` : ''}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Save Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: (!selectedFood || saving) ? 0.6 : 1 }]}
                onPress={handleSaveFood}
                disabled={saving || !selectedFood}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Log Food</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, height: 48 },
  backBtn: { marginRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: 'bold' },
  title: { fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 10 },
  mealsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  mealCard: { width: '48%', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, justifyContent: 'space-between' },
  mealCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  mealIcon: { fontSize: 24, marginRight: 8 },
  mealInfo: { flex: 1 },
  mealLabel: { fontSize: 14, fontWeight: 'bold' },
  mealCal: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  addFoodBtn: { borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  addFoodBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  summaryCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  progressGroup: { marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 13, fontWeight: '600' },
  progressVal: { fontSize: 13, fontWeight: 'bold' },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  remainingCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  remRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  remLbl: { fontSize: 13 },
  remVal: { fontSize: 14, fontWeight: 'bold' },
  remDivider: { height: 1, marginVertical: 8 },
  remTitle: { fontSize: 15, fontWeight: 'bold' },
  remBigVal: { fontSize: 22, fontWeight: 'bold' },
  emptyBox: { padding: 20, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  emptyText: { fontSize: 13 },
  logGroup: { marginBottom: 14 },
  logGroupTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  logGroupEmpty: { fontSize: 12, fontStyle: 'italic', paddingLeft: 8 },
  logItemCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  logItemName: { fontSize: 14, fontWeight: 'bold' },
  logItemMeta: { fontSize: 12, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 16 },
  modalContent: { borderRadius: 20, padding: 18, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 15, fontWeight: 'bold', flex: 1 },
  closeBtn: { fontSize: 18, fontWeight: 'bold' },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    borderWidth: 1, paddingHorizontal: 12, height: 44, marginBottom: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: '100%', fontSize: 13, paddingVertical: 0 },
  statusBadge: { fontSize: 11, marginBottom: 6, marginLeft: 4 },
  resultList: { marginBottom: 10 },
  resultItem: { padding: 9, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', marginBottom: 3 },
  resultItemName: { fontSize: 13, fontWeight: 'bold' },
  resultItemSub: { fontSize: 11, marginTop: 1 },
  quantitySection: { marginBottom: 12 },
  qLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  qControls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  qBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qBtnText: { fontSize: 20, fontWeight: 'bold' },
  qValInput: {
    fontSize: 16, fontWeight: 'bold', textAlign: 'center',
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    minWidth: 64,
  },
  qUnit: { fontSize: 14, fontWeight: '600' },
  presetRow: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  presetBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  presetBtnText: { fontSize: 11, fontWeight: '600' },
  previewBox: { padding: 12, borderRadius: 12, marginTop: 4 },
  prevTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  prevGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  prevCell: { alignItems: 'center', flex: 1 },
  prevBigVal: { fontSize: 15, fontWeight: 'bold' },
  prevCellLabel: { fontSize: 10, marginTop: 2 },
  prevExtra: { fontSize: 11, marginTop: 2 },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { fontWeight: 'bold', fontSize: 14 },
  saveBtn: { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
});
