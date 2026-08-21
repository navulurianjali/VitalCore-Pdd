import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Calendar, Activity, Award, Clock, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import {
  getLocalDateString,
  formatDisplayDate,
  addDaysToDate,
  getLastNDaysDates,
} from '../../utils/dateUtils';
import {
  getOrCreateDailyRecord,
  fetchDailyHistory,
  computeHistoryAnalytics,
  calculateGoalBreakdown,
  DailyHealthRecord,
  HistoryAnalytics,
} from '../../services/dailyTracker';

export default function HistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<'day' | '7days' | '30days'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(undefined, profile?.timezone));
  const [dayRecord, setDayRecord] = useState<DailyHealthRecord | null>(null);

  const [historyRecords, setHistoryRecords] = useState<DailyHealthRecord[]>([]);
  const [analytics, setAnalytics] = useState<HistoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSingleDay = useCallback(async (dateStr: string) => {
    if (!user?.id || !supabase) return;
    try {
      setLoading(true);
      const rec = await getOrCreateDailyRecord(supabase, user.id, dateStr, profile);
      setDayRecord(rec);
    } catch (e) {
      console.error('Error loading single day history in Expo:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile]);

  const loadPeriodHistory = useCallback(async (daysCount: number) => {
    if (!user?.id || !supabase) return;
    try {
      setLoading(true);
      const dateList = getLastNDaysDates(daysCount, getLocalDateString(undefined, profile?.timezone), profile?.timezone);
      const records = await fetchDailyHistory(supabase, user.id, dateList, profile);
      setHistoryRecords(records);
      const stats = computeHistoryAnalytics(records);
      setAnalytics(stats);
    } catch (e) {
      console.error('Error loading period history in Expo:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile]);

  useEffect(() => {
    if (activeTab === 'day') {
      loadSingleDay(selectedDate);
    } else if (activeTab === '7days') {
      loadPeriodHistory(7);
    } else if (activeTab === '30days') {
      loadPeriodHistory(30);
    }
  }, [activeTab, selectedDate, loadSingleDay, loadPeriodHistory]);

  const handlePrevDay = () => {
    setSelectedDate(prev => addDaysToDate(prev, -1, profile?.timezone));
  };

  const handleNextDay = () => {
    const today = getLocalDateString(undefined, profile?.timezone);
    if (selectedDate < today) {
      setSelectedDate(prev => addDaysToDate(prev, 1, profile?.timezone));
    }
  };

  const isToday = selectedDate === getLocalDateString(undefined, profile?.timezone);
  const dayBreakdown = dayRecord ? calculateGoalBreakdown(dayRecord) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity testID="history_back_btn" accessibilityLabel="history_back_btn" onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Health History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          testID="history_tab_day"
          accessibilityLabel="history_tab_day"
          style={[styles.tabItem, activeTab === 'day' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('day')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'day' ? '#FFF' : colors.textMuted }]}>Day</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="history_tab_7days"
          accessibilityLabel="history_tab_7days"
          style={[styles.tabItem, activeTab === '7days' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('7days')}
        >
          <Text style={[styles.tabText, { color: activeTab === '7days' ? '#FFF' : colors.textMuted }]}>7 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="history_tab_30days"
          accessibilityLabel="history_tab_30days"
          style={[styles.tabItem, activeTab === '30days' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('30days')}
        >
          <Text style={[styles.tabText, { color: activeTab === '30days' ? '#FFF' : colors.textMuted }]}>30 Days</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'day' && (
          <View style={styles.section}>
            {/* Date Selector */}
            <View style={[styles.dateNav, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <TouchableOpacity testID="history_prev_date_btn" accessibilityLabel="history_prev_date_btn" onPress={handlePrevDay} style={styles.navBtn}>
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.dateLabelContainer}>
                <Calendar size={16} color={colors.primary} />
                <Text testID="history_current_date_text" accessibilityLabel="history_current_date_text" style={[styles.dateText, { color: colors.text }]}>
                  {formatDisplayDate(selectedDate, profile?.timezone)}
                </Text>
              </View>
              <TouchableOpacity testID="history_next_date_btn" accessibilityLabel="history_next_date_btn" onPress={handleNextDay} disabled={isToday} style={[styles.navBtn, isToday && { opacity: 0.3 }]}>
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textMuted, marginTop: 8 }}>Loading history telemetry...</Text>
              </View>
            ) : !dayRecord || !dayRecord.has_data ? (
              <View style={[styles.noDataCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Clock size={36} color={colors.textMuted} />
                <Text style={[styles.noDataTitle, { color: colors.text }]}>No data recorded</Text>
                <Text style={[styles.noDataDesc, { color: colors.textMuted }]}>
                  No health telemetry was logged for {formatDisplayDate(selectedDate, profile?.timezone)}. Historical records are preserved accurately without fabricated entries.
                </Text>
              </View>
            ) : (
              <>
                {/* Score Card */}
                <View style={[styles.scoreCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                  <Text style={styles.scoreLabel}>DAILY GOAL SCORE</Text>
                  <Text style={[styles.scoreValue, { color: colors.primary }]}>{dayBreakdown?.overallScore}%</Text>
                  <Text style={[styles.scoreMode, { color: colors.textMuted }]}>Mode: {profile?.active_mode || 'wellness'}</Text>
                </View>

                {/* Metrics Breakdown */}
                <View style={styles.metricsGrid}>
                  <View style={[styles.metricCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.metricName, { color: colors.textMuted }]}>Calories</Text>
                    <Text style={[styles.metricVal, { color: colors.text }]}>{dayRecord.calories_consumed} / {dayRecord.calorie_goal} kcal</Text>
                    <Text style={[styles.metricPct, { color: '#F59E0B' }]}>{dayBreakdown?.caloriesPct}%</Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.metricName, { color: colors.textMuted }]}>Hydration</Text>
                    <Text style={[styles.metricVal, { color: colors.text }]}>{dayRecord.water_ml} / {dayRecord.water_goal_ml} ml</Text>
                    <Text style={[styles.metricPct, { color: '#06B6D4' }]}>{dayBreakdown?.waterPct}%</Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.metricName, { color: colors.textMuted }]}>Protein</Text>
                    <Text style={[styles.metricVal, { color: colors.text }]}>{dayRecord.protein_g} / {dayRecord.protein_goal} g</Text>
                    <Text style={[styles.metricPct, { color: '#EF4444' }]}>{dayBreakdown?.proteinPct}%</Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.metricName, { color: colors.textMuted }]}>Workout</Text>
                    <Text style={[styles.metricVal, { color: colors.text }]}>{dayRecord.workout_minutes} / {dayRecord.workout_goal_minutes} min</Text>
                    <Text style={[styles.metricPct, { color: '#6366F1' }]}>{dayBreakdown?.workoutPct}%</Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.metricName, { color: colors.textMuted }]}>Sleep</Text>
                    <Text style={[styles.metricVal, { color: colors.text }]}>
                      {dayRecord.sleep_hours > 0 ? `${dayRecord.sleep_hours} / ${dayRecord.sleep_goal_hours} hrs` : 'Not logged'}
                    </Text>
                    <Text style={[styles.metricPct, { color: '#A855F7' }]}>{dayBreakdown?.sleepPct}%</Text>
                  </View>

                  <View style={[styles.metricCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.metricName, { color: colors.textMuted }]}>Healthy Habits</Text>
                    <Text style={[styles.metricVal, { color: colors.text }]}>{dayRecord.habit_completion}% Progress</Text>
                    <Text style={[styles.metricPct, { color: '#10B981' }]}>{dayBreakdown?.habitPct}%</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {(activeTab === '7days' || activeTab === '30days') && (
          <View style={styles.section}>
            {/* Analytics Stats Overview */}
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={styles.statLabel}>Avg Goal Score</Text>
                <Text style={[styles.statNum, { color: colors.primary }]}>{analytics?.goalCompletionRate || 0}%</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={styles.statLabel}>Avg Calories</Text>
                <Text style={[styles.statNum, { color: '#F59E0B' }]}>{analytics?.averageCalories || 0} kcal</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={styles.statLabel}>Avg Hydration</Text>
                <Text style={[styles.statNum, { color: '#06B6D4' }]}>{analytics?.averageWater || 0} ml</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={styles.statLabel}>Workouts</Text>
                <Text style={[styles.statNum, { color: '#6366F1' }]}>{analytics?.totalWorkouts || 0}</Text>
              </View>
            </View>

            {/* Daily History List */}
            <View style={[styles.listCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Text style={[styles.listTitle, { color: colors.text }]}>
                {activeTab === '7days' ? 'Last 7 Days Progress' : 'Last 30 Days Progress'}
              </Text>

              {historyRecords.slice().reverse().map(rec => {
                const b = calculateGoalBreakdown(rec);
                const isCurToday = rec.date === getLocalDateString(undefined, profile?.timezone);

                return (
                  <TouchableOpacity
                    key={rec.date}
                    style={styles.listItem}
                    onPress={() => {
                      setSelectedDate(rec.date);
                      setActiveTab('day');
                    }}
                  >
                    <View style={styles.listDateCol}>
                      <Text style={[styles.listDateText, { color: colors.text }]}>
                        {isCurToday ? 'Today' : formatDisplayDate(rec.date, profile?.timezone)}
                      </Text>
                      <Text style={styles.listDateSub}>{rec.date}</Text>
                    </View>

                    {rec.has_data ? (
                      <View style={styles.listProgressCol}>
                        <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: `${b.overallScore}%`, backgroundColor: colors.primary }]} />
                        </View>
                        <Text style={[styles.listPctText, { color: colors.primary }]}>{b.overallScore}%</Text>
                      </View>
                    ) : (
                      <Text style={styles.noDataListText}>No data recorded</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 16,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  navBtn: {
    padding: 4,
  },
  dateLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  noDataDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  scoreCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: '800',
  },
  scoreMode: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  metricName: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricPct: {
    fontSize: 14,
    fontWeight: '800',
    alignSelf: 'flex-end',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  listCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#33415533',
  },
  listDateCol: {
    width: 110,
  },
  listDateText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listDateSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  listProgressCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#33415544',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  listPctText: {
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  noDataListText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94A3B8',
  },
});
