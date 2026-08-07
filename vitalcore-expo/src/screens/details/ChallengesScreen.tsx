import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { CustomTextInput } from '../../components/CustomTextInput';
import {
  Target,
  Users,
  CheckCircle,
  Activity,
  Plus,
  RefreshCw,
  X,
  Droplets,
  Moon,
  Utensils,
  Smile,
  Sparkles,
  Award,
  Star,
  Clock,
  ArrowRight,
  ChevronRight,
  Trophy,
  Flame,
  Zap,
  ShieldCheck,
} from 'lucide-react-native';

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  duration_days: number;
  participants_count?: number;
  joined?: boolean;
}

export const PREDEFINED_CHALLENGES: ChallengeItem[] = [
  // 1. FITNESS
  { id: "c-fit-1", title: "Walk 10,000 Steps Daily", description: "Achieve 10,000 steps every day for 30 days to build foundational cardiovascular endurance.", category: "Fitness", difficulty: "Medium", xp_reward: 350, duration_days: 30, participants_count: 142 },
  { id: "c-fit-2", title: "50 Squats Daily Challenge", description: "Perform 50 bodyweight squats daily to strengthen lower body and improve mobility.", category: "Fitness", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 89 },
  { id: "c-fit-3", title: "Core Strength Sprint", description: "Complete daily plank and core exercises to build trunk stability.", category: "Fitness", difficulty: "Hard", xp_reward: 500, duration_days: 30, participants_count: 215 },
  { id: "c-fit-4", title: "Yoga & Mobility Flow", description: "Practice 20 minutes of daily yoga and hip mobility routines.", category: "Fitness", difficulty: "Easy", xp_reward: 250, duration_days: 21, participants_count: 110 },
  { id: "c-fit-5", title: "7-Day 10k Step Streak", description: "Maintain a continuous 7-day streak of reaching 10,000 steps daily.", category: "Fitness", difficulty: "Medium", xp_reward: 250, duration_days: 7, participants_count: 310 },

  // 2. NUTRITION
  { id: "c-nut-1", title: "High Protein Week", description: "Hit your daily protein target (at least 80g-120g) every day for 7 days.", category: "Nutrition", difficulty: "Medium", xp_reward: 250, duration_days: 7, participants_count: 184 },
  { id: "c-nut-2", title: "Zero Sugary Drinks", description: "Eliminate all sodas, packaged juices, and sweetened beverages for 14 days.", category: "Nutrition", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 275 },
  { id: "c-nut-3", title: "Healthy Protein Breakfast", description: "Eat an evidence-based high-protein, high-fiber breakfast daily.", category: "Nutrition", difficulty: "Easy", xp_reward: 150, duration_days: 7, participants_count: 95 },
  { id: "c-nut-4", title: "No Junk Food Week", description: "Avoid fried foods, processed snacks, and fast food for 7 consecutive days.", category: "Nutrition", difficulty: "Medium", xp_reward: 300, duration_days: 7, participants_count: 420 },

  // 3. HYDRATION
  { id: "c-hyd-1", title: "Drink 2.5L Water Daily", description: "Drink 2,500ml of fresh water every day to maintain optimal cellular hydration.", category: "Hydration", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 512 },
  { id: "c-hyd-2", title: "7-Day Hydration Hero", description: "Log at least 2,000ml of water daily for 7 consecutive days.", category: "Hydration", difficulty: "Easy", xp_reward: 150, duration_days: 7, participants_count: 380 },

  // 4. SLEEP
  { id: "c-slp-1", title: "Sleep Before 11 PM", description: "Go to bed before 11:00 PM every night for 14 nights to align circadian rhythm.", category: "Sleep", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 290 },
  { id: "c-slp-2", title: "Digital Detox Before Bed", description: "Turn off all smartphone, laptop, and TV screens 45 minutes before sleep.", category: "Sleep", difficulty: "Easy", xp_reward: 200, duration_days: 7, participants_count: 340 },

  // 5. MENTAL WELLNESS
  { id: "c-men-1", title: "15-Min Daily Meditation", description: "Practice 15 minutes of mindfulness or guided meditation daily for 14 days.", category: "Mental Wellness", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 210 },
  { id: "c-men-2", title: "Daily Gratitude Journal", description: "Write down 3 things you are grateful for every evening for 21 days.", category: "Mental Wellness", difficulty: "Easy", xp_reward: 250, duration_days: 21, participants_count: 185 },

  // 6. HEALTHY HABITS
  { id: "c-hab-1", title: "No Alcohol Month", description: "Abstain from all alcoholic beverages for 30 consecutive days.", category: "Healthy Habits", difficulty: "Hard", xp_reward: 500, duration_days: 30, participants_count: 160 },
  { id: "c-hab-2", title: "Cold Shower Energy Boost", description: "Take a 60-second cold shower ending every morning for 14 days.", category: "Healthy Habits", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 225 }
];

// SVG Circular Progress Ring
const ProgressRing = ({ percentage = 0, size = 42, strokeWidth = 3.5, color }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) => {
  const activeColor = color || '#0d9488';
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </Svg>
      <View style={{ position: 'absolute' }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', color: activeColor }}>
          {Math.round(percentage)}%
        </Text>
      </View>
    </View>
  );
};

export default function ChallengesScreen({ navigation }: any) {
  const { user, profile } = useAuth();
  const { colors, isCareMode } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [challenges, setChallenges] = useState<ChallengeItem[]>(PREDEFINED_CHALLENGES);
  const [userJoinedMap, setUserJoinedMap] = useState<Record<string, number>>({});
  const [userChallengesRaw, setUserChallengesRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallengeModal, setSelectedChallengeModal] = useState<ChallengeItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Fitness');
  const [newDuration, setNewDuration] = useState('7');
  const [newXp, setNewXp] = useState('200');

  const CATEGORIES = ['All', 'Fitness', 'Nutrition', 'Hydration', 'Sleep', 'Mental Wellness', 'Healthy Habits'];

  // Calculate real progress percentage automatically from health logs in Supabase
  const calculateAutomaticProgress = async (ch: ChallengeItem, userId: string): Promise<number> => {
    try {
      const cat = (ch.category || '').toLowerCase();
      const duration = ch.duration_days || 7;
      let successCount = 0;

      if (cat.includes('hydration')) {
        const { data } = await supabase
          .from('hydration_logs')
          .select('amount_ml')
          .eq('user_id', userId);
        const totalMl = (data || []).reduce((acc: number, item: any) => acc + (Number(item.amount_ml) || 0), 0);
        successCount = Math.min(duration, Math.floor(totalMl / 2000));
      } else if (cat.includes('sleep')) {
        const { data } = await supabase
          .from('sleep_logs')
          .select('id')
          .eq('user_id', userId);
        successCount = (data || []).length;
      } else if (cat.includes('fitness') || cat.includes('workout')) {
        const { data } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', userId);
        successCount = (data || []).length;
      } else if (cat.includes('nutrition')) {
        const { data } = await supabase
          .from('nutrition_logs')
          .select('id')
          .eq('user_id', userId);
        successCount = Math.min(duration, Math.floor((data || []).length / 3));
      } else {
        successCount = 2;
      }

      return Math.min(100, Math.max(15, Math.round((successCount / duration) * 100)));
    } catch {
      return 15;
    }
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data: dbData } = await supabase.from('challenges').select('*').order('id', { ascending: false });

      const joinedProgressMap: Record<string, number> = {};
      let rawUserChalls: any[] = [];

      if (user?.id) {
        const { data: userChall } = await supabase
          .from('user_challenges')
          .select('*, challenge:challenges(*)')
          .eq('user_id', user.id);

        if (userChall) {
          rawUserChalls = userChall;
          userChall.forEach((uc: any) => {
            const chId = uc.challenge_id || uc.challenge?.id;
            if (chId) {
              joinedProgressMap[chId] = uc.progress_percentage || 15;
            }
          });
        }
      }
      setUserJoinedMap(joinedProgressMap);
      setUserChallengesRaw(rawUserChalls);

      const combinedMap = new Map<string, ChallengeItem>();

      if (dbData && dbData.length > 0) {
        dbData.forEach((c: any) => {
          const item: ChallengeItem = {
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category || 'Fitness',
            difficulty: c.difficulty || 'Medium',
            xp_reward: Number(c.xp_reward || 200),
            duration_days: Number(c.duration_days || 7),
            participants_count: Number(c.participants_count || 120),
            joined: Boolean(joinedProgressMap[c.id]),
          };
          combinedMap.set(c.title.toLowerCase().trim(), item);
        });
      }

      PREDEFINED_CHALLENGES.forEach(c => {
        const key = c.title.toLowerCase().trim();
        if (!combinedMap.has(key)) {
          combinedMap.set(key, {
            ...c,
            joined: Boolean(joinedProgressMap[c.id]),
          });
        }
      });

      const uniqueList = Array.from(combinedMap.values());
      setChallenges(uniqueList);

      // Recalculate automatic progress in background for active challenges
      if (user?.id && rawUserChalls.length > 0) {
        for (const uc of rawUserChalls) {
          const chObj = uc.challenge || uniqueList.find(c => c.id === uc.challenge_id);
          if (chObj) {
            const autoPct = await calculateAutomaticProgress(chObj, user.id);
            if (autoPct !== uc.progress_percentage) {
              await supabase
                .from('user_challenges')
                .update({ progress_percentage: autoPct })
                .eq('id', uc.id);
              joinedProgressMap[chObj.id] = autoPct;
            }
          }
        }
        setUserJoinedMap({ ...joinedProgressMap });
      }
    } catch (e) {
      console.error('Fetch challenges error:', e);
      setChallenges(PREDEFINED_CHALLENGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();

    const channel = supabase
      .channel('public:challenges_realtime_mobile_v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => fetchChallenges())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_challenges' }, () => fetchChallenges())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleJoinChallenge = async (ch: ChallengeItem) => {
    if (!user?.id) {
      Alert.alert('Session Error', 'Please log in to join challenges.');
      return;
    }
    try {
      const initialProgress = await calculateAutomaticProgress(ch, user.id);
      setUserJoinedMap(prev => ({ ...prev, [ch.id]: initialProgress }));

      const { error } = await supabase.from('user_challenges').insert({
        user_id: user.id,
        challenge_id: ch.id,
        progress_percentage: initialProgress,
      });

      if (!error) {
        Alert.alert('Joined Challenge ✨', `Successfully joined ${ch.title}!`);
      }
      fetchChallenges();
    } catch (e: any) {
      Alert.alert('Notice', 'Challenge activated.');
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    if (!user?.id) return;
    try {
      setUserJoinedMap(prev => {
        const copy = { ...prev };
        delete copy[challengeId];
        return copy;
      });

      await supabase
        .from('user_challenges')
        .delete()
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId);

      Alert.alert('Left Challenge', 'Removed challenge from your active list.');
      fetchChallenges();
    } catch (e: any) {
      console.error('Leave error:', e);
    }
  };

  const handleCreateChallenge = async () => {
    if (!newTitle.trim() || !newDesc.trim() || !user?.id) {
      Alert.alert('Validation Error', 'Please enter a title and description.');
      return;
    }
    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          title: newTitle.trim(),
          description: newDesc.trim(),
          category: newCategory,
          difficulty: 'Medium',
          duration_days: parseInt(newDuration, 10) || 7,
          xp_reward: parseInt(newXp, 10) || 200,
        })
        .select();

      if (!error && data && data.length > 0) {
        await supabase.from('user_challenges').insert({
          user_id: user.id,
          challenge_id: data[0].id,
          progress_percentage: 15,
        });

        Alert.alert('Challenge Created 🏆', 'Your challenge is published and synced live across Web & Mobile!');
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchChallenges();
      } else {
        Alert.alert('Notice', error?.message || 'Failed to create challenge.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered by selected category
  const filteredChallenges = useMemo(() => {
    if (selectedCategory === 'All') return challenges;
    return challenges.filter(c => c.category === selectedCategory);
  }, [selectedCategory, challenges]);

  // Active joined challenges list
  const activeJoinedList = useMemo(() => {
    return challenges.filter(c => Boolean(userJoinedMap[c.id]));
  }, [challenges, userJoinedMap]);

  // Recommended 3 personalized challenges based on profile goals
  const recommendedList = useMemo(() => {
    const goal = (profile?.fitness_goal || '').toLowerCase();
    const unjoined = challenges.filter(c => !userJoinedMap[c.id]);

    if (goal.includes('weight') || goal.includes('fat') || goal.includes('loss')) {
      return unjoined.filter(c => c.category === 'Nutrition' || c.category === 'Fitness' || c.category === 'Hydration').slice(0, 3);
    } else if (goal.includes('muscle') || goal.includes('strength') || goal.includes('gain')) {
      return unjoined.filter(c => c.category === 'Fitness' || c.category === 'Nutrition').slice(0, 3);
    } else if (goal.includes('sleep') || goal.includes('stress') || goal.includes('wellness')) {
      return unjoined.filter(c => c.category === 'Sleep' || c.category === 'Mental Wellness' || c.category === 'Healthy Habits').slice(0, 3);
    }
    return unjoined.slice(0, 3);
  }, [challenges, userJoinedMap, profile?.fitness_goal]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Fitness': return Activity;
      case 'Nutrition': return Utensils;
      case 'Hydration': return Droplets;
      case 'Sleep': return Moon;
      case 'Mental Wellness': return Smile;
      default: return Sparkles;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* TOP HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 }}>← Back</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.syncBtn, { borderColor: colors.cardBorder }]}
              onPress={fetchChallenges}
            >
              <RefreshCw size={14} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={14} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 12, marginLeft: 4 }}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.pageTitle, { color: colors.text, fontSize: isCareMode ? 24 : 20 }]}>
          Health Challenges
        </Text>
        <Text style={[styles.pageSubTitle, { color: colors.textMuted }]}>
          Evidence-based health protocols & habit sprints
        </Text>

        {/* METRICS STATS ROW */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.statIconBox}>
              <Target size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Active</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{activeJoinedList.length}</Text>
            </View>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.statIconBox}>
              <ShieldCheck size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {Object.values(userJoinedMap).filter(pct => pct >= 100).length}
              </Text>
            </View>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.statIconBox}>
              <Flame size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Streak</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile?.streak_days || 7}d</Text>
            </View>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.statIconBox}>
              <Trophy size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Health XP</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile?.xp || 450}</Text>
            </View>
          </View>
        </View>

        {/* SECTION 1: ACTIVE CHALLENGES */}
        {activeJoinedList.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
              ACTIVE CHALLENGES ({activeJoinedList.length})
            </Text>

            {activeJoinedList.map(ch => {
              const pct = userJoinedMap[ch.id] || 15;
              const IconComp = getCategoryIcon(ch.category);

              return (
                <View key={ch.id} style={[styles.activeWidgetCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                  <ProgressRing percentage={pct} size={44} strokeWidth={3.5} color={colors.primary} />

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <View style={[styles.miniCategoryTag, { backgroundColor: colors.primaryLight + '22' }]}>
                        <IconComp size={10} color={colors.primary} />
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary }}>{ch.category}</Text>
                      </View>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>{ch.duration_days}d remaining</Text>
                    </View>
                    <Text style={[styles.activeTitle, { color: colors.text }]} numberOfLines={1}>{ch.title}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 1 }}>🏆 +{ch.xp_reward} XP</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                    <TouchableOpacity
                      style={[styles.smallIconBtn, { backgroundColor: colors.background }]}
                      onPress={() => setSelectedChallengeModal(ch)}
                    >
                      <ChevronRight size={16} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallIconBtn, { backgroundColor: colors.background }]}
                      onPress={() => handleLeaveChallenge(ch.id)}
                    >
                      <X size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* SECTION 2: RECOMMENDED FOR YOU */}
        {recommendedList.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={styles.rowBetween}>
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>⭐ RECOMMENDED FOR YOU</Text>
              <Text style={[styles.recommendedBadge, { color: colors.primary, backgroundColor: colors.primaryLight + '22' }]}>
                Goal Match
              </Text>
            </View>

            {recommendedList.map(ch => {
              const IconComp = getCategoryIcon(ch.category);
              return (
                <View key={ch.id} style={[styles.recommendedCard, { backgroundColor: colors.cardBg, borderColor: colors.primary + '33' }]}>
                  <View style={styles.rowBetween}>
                    <View style={[styles.miniCategoryTag, { backgroundColor: colors.primaryLight + '22' }]}>
                      <IconComp size={10} color={colors.primary} />
                      <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary }}>{ch.category}</Text>
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primary }}>🏆 +{ch.xp_reward} XP</Text>
                  </View>

                  <Text style={[styles.recTitle, { color: colors.text }]}>{ch.title}</Text>
                  <Text style={[styles.recDesc, { color: colors.textMuted }]} numberOfLines={2}>{ch.description}</Text>

                  <View style={[styles.rowBetween, { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.cardBorder }]}>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>{ch.duration_days} Days • {ch.difficulty}</Text>
                    <TouchableOpacity
                      style={[styles.joinBtnRec, { backgroundColor: colors.primary }]}
                      onPress={() => handleJoinChallenge(ch)}
                    >
                      <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 11 }}>Join Challenge</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* SECTION 3: CATEGORY FILTER TABS */}
        <View style={{ marginBottom: 14 }}>
          <Text style={[styles.sectionHeading, { color: colors.textMuted, marginBottom: 8 }]}>
            CHALLENGE LIBRARY ({filteredChallenges.length})
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.cardBg,
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={{ color: isSelected ? '#ffffff' : colors.text, fontWeight: 'bold', fontSize: 11 }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SECTION 4: CHALLENGE LIBRARY CARDS */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
        ) : (
          filteredChallenges.map(c => {
            const isJoined = Boolean(userJoinedMap[c.id]);
            const IconComp = getCategoryIcon(c.category);

            return (
              <View key={c.id} style={[styles.libraryCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.rowBetween}>
                  <View style={[styles.miniCategoryTag, { backgroundColor: colors.primaryLight + '22' }]}>
                    <IconComp size={10} color={colors.primary} />
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary }}>{c.category}</Text>
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textMuted }}>🏆 +{c.xp_reward} XP</Text>
                </View>

                <Text style={[styles.libTitle, { color: colors.text }]}>{c.title}</Text>
                <Text style={[styles.libDesc, { color: colors.textMuted }]} numberOfLines={2}>{c.description}</Text>

                <View style={[styles.rowBetween, { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.cardBorder }]}>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>{c.duration_days} Days • {c.difficulty}</Text>

                  {isJoined ? (
                    <View style={[styles.joinedBadge, { backgroundColor: 'rgba(13, 148, 136, 0.1)' }]}>
                      <CheckCircle size={12} color={colors.primary} />
                      <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 11, marginLeft: 4 }}>Joined</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.joinBtnLib, { backgroundColor: colors.primary }]}
                      onPress={() => handleJoinChallenge(c)}
                    >
                      <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 11 }}>Join Challenge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}

      </ScrollView>

      {/* MODAL: CREATE CUSTOM CHALLENGE */}
      {showCreateModal && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.rowBetween}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create Custom Challenge</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <X size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <CustomTextInput
                label="Challenge Title"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. 7-Day Morning Hydration Sprint"
                containerStyle={{ marginTop: 12 }}
              />

              <CustomTextInput
                label="Description"
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="e.g. Drink 500ml water immediately upon waking."
                containerStyle={{ marginTop: 10 }}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <CustomTextInput
                    label="Duration (Days)"
                    value={newDuration}
                    onChangeText={setNewDuration}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <CustomTextInput
                    label="XP Reward"
                    value={newXp}
                    onChangeText={setNewXp}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: colors.background }]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleCreateChallenge}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 12 }}>Publish</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: CHALLENGE DETAILS */}
      {selectedChallengeModal && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.rowBetween}>
                <View style={[styles.miniCategoryTag, { backgroundColor: colors.primaryLight + '22' }]}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary }}>
                    {selectedChallengeModal.category}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedChallengeModal(null)}>
                  <X size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalTitle, { color: colors.text, marginTop: 10 }]}>
                {selectedChallengeModal.title}
              </Text>
              <Text style={[styles.modalDesc, { color: colors.textMuted, marginTop: 6 }]}>
                {selectedChallengeModal.description}
              </Text>

              <View style={[styles.rowBetween, { marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.cardBorder }]}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  Duration: {selectedChallengeModal.duration_days} Days
                </Text>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary }}>
                  🏆 +{selectedChallengeModal.xp_reward} XP
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                onPress={() => setSelectedChallengeModal(null)}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 12 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  backBtn: { paddingVertical: 4 },
  syncBtn: { padding: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  createBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  pageTitle: { fontWeight: 'bold' },
  pageSubTitle: { fontSize: 12, marginTop: 2, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  statBox: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statIconBox: { padding: 4 },
  statLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  statValue: { fontSize: 13, fontWeight: 'bold', marginTop: 1 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  activeWidgetCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  miniCategoryTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  activeTitle: { fontSize: 12, fontWeight: 'bold' },
  smallIconBtn: { padding: 6, borderRadius: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recommendedBadge: { fontSize: 9, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  recommendedCard: { padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  recTitle: { fontSize: 13, fontWeight: 'bold', marginTop: 6 },
  recDesc: { fontSize: 11, marginTop: 2, lineHeight: 15 },
  joinBtnRec: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  categoryPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, marginRight: 6 },
  libraryCard: { padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  libTitle: { fontSize: 13, fontWeight: 'bold', marginTop: 6 },
  libDesc: { fontSize: 11, marginTop: 2, lineHeight: 15 },
  joinedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  joinBtnLib: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, borderWidth: 1, padding: 18 },
  modalTitle: { fontSize: 14, fontWeight: 'bold' },
  modalDesc: { fontSize: 12, lineHeight: 17 },
  modalCancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  modalSubmitBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
});
