import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { CustomTextInput } from '../../components/CustomTextInput';
import ScreenWrapper from '../../components/ScreenWrapper';
import {
  Target,
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
  Clock,
  ChevronRight,
  Trophy,
  Flame,
  ShieldCheck,
  Check,
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

// Circular SVG Progress Ring
const ProgressRing = ({ percentage = 0, size = 44, strokeWidth = 3.5, color }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) => {
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
          stroke="rgba(150, 150, 150, 0.15)"
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
        <Text style={{ fontSize: 10, fontWeight: '800', color: activeColor }}>
          {Math.round(percentage)}%
        </Text>
      </View>
    </View>
  );
};

export default function ChallengesScreen({ navigation }: any) {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { colors } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [challenges, setChallenges] = useState<ChallengeItem[]>(PREDEFINED_CHALLENGES);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallengeModal, setSelectedChallengeModal] = useState<ChallengeItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
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
        successCount = 0;
      }

      return Math.min(100, Math.max(0, Math.round((successCount / duration) * 100)));
    } catch {
      return 0;
    }
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data: dbData } = await supabase.from('challenges').select('*').order('id', { ascending: false });

      let rawUserChalls: any[] = [];
      if (user?.id) {
        const { data: userChall } = await supabase
          .from('user_challenges')
          .select('*, challenge:challenges(*)')
          .eq('user_id', user.id);

        if (userChall) {
          rawUserChalls = userChall;
        }
      }
      setUserChallenges(rawUserChalls);

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
          };
          combinedMap.set(c.title.toLowerCase().trim(), item);
        });
      }

      PREDEFINED_CHALLENGES.forEach(c => {
        const key = c.title.toLowerCase().trim();
        if (!combinedMap.has(key)) {
          combinedMap.set(key, c);
        }
      });

      const uniqueList = Array.from(combinedMap.values());
      setChallenges(uniqueList);

      // Recalculate automatic progress in background for active uncompleted challenges
      if (user?.id && rawUserChalls.length > 0) {
        for (const uc of rawUserChalls) {
          if (!uc.completed && (uc.progress_percentage || 0) < 100) {
            const chObj = uc.challenge || uniqueList.find(c => c.id === uc.challenge_id);
            if (chObj) {
              const autoPct = await calculateAutomaticProgress(chObj, user.id);
              if (autoPct !== uc.progress_percentage) {
                await supabase
                  .from('user_challenges')
                  .update({ progress_percentage: autoPct })
                  .eq('id', uc.id);
              }
            }
          }
        }
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
      .channel('public:challenges_realtime_mobile_v4')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => fetchChallenges())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_challenges' }, () => fetchChallenges())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Joined check
  const getUserChallengeRecord = (challengeId: string) => {
    return userChallenges.find(uc => uc.challenge_id === challengeId || uc.challenge?.id === challengeId);
  };

  const isChallengeActive = (challengeId: string) => {
    const uc = getUserChallengeRecord(challengeId);
    return Boolean(uc && !uc.completed && (uc.progress_percentage || 0) < 100);
  };

  const isChallengeCompleted = (challengeId: string) => {
    const uc = getUserChallengeRecord(challengeId);
    return Boolean(uc && (uc.completed === true || (uc.progress_percentage || 0) >= 100));
  };

  // Active vs Completed user challenge lists
  const activeUserChallenges = useMemo(() => {
    return userChallenges
      .filter((uc: any) => !uc.completed && (uc.progress_percentage || 0) < 100)
      .map((uc: any) => {
        const fullCh = uc.challenge || challenges.find(c => c.id === uc.challenge_id) || {};
        return {
          ...fullCh,
          userChallengeId: uc.id,
          progress: uc.progress_percentage || 0,
        };
      });
  }, [userChallenges, challenges]);

  const completedUserChallenges = useMemo(() => {
    return userChallenges
      .filter((uc: any) => uc.completed === true || (uc.progress_percentage || 0) >= 100)
      .map((uc: any) => {
        const fullCh = uc.challenge || challenges.find(c => c.id === uc.challenge_id) || {};
        return {
          ...fullCh,
          userChallengeId: uc.id,
          completedAt: uc.completed_at || uc.created_at,
        };
      });
  }, [userChallenges, challenges]);

  // Handle Join Challenge
  const handleJoinChallenge = async (ch: ChallengeItem) => {
    if (!user?.id) {
      Alert.alert('Session Error', 'Please log in to join challenges.');
      return;
    }
    try {
      setActionLoadingId(ch.id);
      const initialProgress = await calculateAutomaticProgress(ch, user.id);

      const { error } = await supabase.from('user_challenges').insert({
        user_id: user.id,
        challenge_id: ch.id,
        progress_percentage: initialProgress,
        completed: false,
      });

      if (!error) {
        Alert.alert('Joined Challenge ✨', `You joined "${ch.title}"! Track your progress in Active Challenges.`);
      }
      await fetchChallenges();
    } catch (e: any) {
      Alert.alert('Notice', 'Challenge activated.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Complete Challenge
  const handleCompleteChallenge = async (ch: any) => {
    if (!user?.id) return;
    try {
      setActionLoadingId(ch.id || ch.userChallengeId);
      const xpReward = Number(ch.xp_reward || 200);

      const { error } = await supabase
        .from('user_challenges')
        .update({
          completed: true,
          progress_percentage: 100,
        })
        .eq('user_id', user.id)
        .eq('challenge_id', ch.id);

      if (error) {
        console.error('Update error on complete:', error);
      }

      // Update XP in profile
      if (updateProfile) {
        const currentXp = Number(profile?.xp || 0);
        await updateProfile({ xp: currentXp + xpReward });
      }
      if (refreshProfile) {
        await refreshProfile();
      }

      Alert.alert(
        '🏆 Challenge Completed!',
        `Congratulations! You completed "${ch.title}" and earned +${xpReward} Health XP!`
      );

      await fetchChallenges();
    } catch (e: any) {
      console.error('Complete error:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Leave Challenge
  const handleLeaveChallenge = async (challengeId: string) => {
    if (!user?.id) return;
    Alert.alert(
      'Leave Challenge',
      'Are you sure you want to remove this challenge from your active list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(challengeId);
              await supabase
                .from('user_challenges')
                .delete()
                .eq('user_id', user.id)
                .eq('challenge_id', challengeId);

              await fetchChallenges();
            } catch (e: any) {
              console.error('Leave error:', e);
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  // Handle Create Challenge
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
          progress_percentage: 0,
          completed: false,
        });

        Alert.alert('Challenge Created 🏆', 'Your challenge is published and added to your Active Challenges!');
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        await fetchChallenges();
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

  // Recommended personalized challenges based on profile goals
  const recommendedList = useMemo(() => {
    const goal = (profile?.fitness_goal || '').toLowerCase();
    const unjoined = challenges.filter(c => !getUserChallengeRecord(c.id));

    if (goal.includes('weight') || goal.includes('fat') || goal.includes('loss')) {
      return unjoined.filter(c => c.category === 'Nutrition' || c.category === 'Fitness' || c.category === 'Hydration').slice(0, 3);
    } else if (goal.includes('muscle') || goal.includes('strength') || goal.includes('gain')) {
      return unjoined.filter(c => c.category === 'Fitness' || c.category === 'Nutrition').slice(0, 3);
    } else if (goal.includes('sleep') || goal.includes('stress') || goal.includes('wellness')) {
      return unjoined.filter(c => c.category === 'Sleep' || c.category === 'Mental Wellness' || c.category === 'Healthy Habits').slice(0, 3);
    }
    return unjoined.slice(0, 3);
  }, [challenges, userChallenges, profile?.fitness_goal]);

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

  const activeCount = activeUserChallenges.length;
  const completedCount = completedUserChallenges.length;
  const streakCount = profile?.streak_days || 0;
  const healthXp = profile?.xp || 0;

  return (
    <ScreenWrapper
      title="Health Challenges"
      subtitle="Evidence-based health protocols & habit sprints"
      showBack
      onBack={() => navigation.goBack()}
      headerRight={
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.syncBtn, { borderColor: colors.cardBorder }]}
            onPress={fetchChallenges}
            disabled={loading}
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
      }
    >
      {/* 1. 2x2 RESPONSIVE STATS GRID */}
      <View style={styles.statsGrid}>
        {/* Active Box */}
        <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(13, 148, 136, 0.12)' }]}>
            <Target size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statLabel}>ACTIVE</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{activeCount}</Text>
          </View>
        </View>

        {/* Completed Box */}
        <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <ShieldCheck size={18} color="#10b981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statLabel}>COMPLETED</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{completedCount}</Text>
          </View>
        </View>

        {/* Streak Box */}
        <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
            <Flame size={18} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statLabel}>STREAK</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{streakCount}d</Text>
          </View>
        </View>

        {/* Health XP Box */}
        <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.statIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
            <Trophy size={18} color="#6366f1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statLabel}>HEALTH XP</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{healthXp}</Text>
          </View>
        </View>
      </View>

      {/* 2. ACTIVE CHALLENGES SECTION */}
      {activeUserChallenges.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              ACTIVE CHALLENGES ({activeUserChallenges.length})
            </Text>
          </View>

          {activeUserChallenges.map((ch: any) => {
            const IconComp = getCategoryIcon(ch.category);
            const isActing = actionLoadingId === ch.id;

            return (
              <View key={ch.id} style={[styles.activeCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight + '22' }]}>
                    <IconComp size={12} color={colors.primary} />
                    <Text style={[styles.categoryText, { color: colors.primary }]}>{ch.category}</Text>
                  </View>
                  <Text style={[styles.xpBadgeText, { color: colors.primary }]}>🏆 +{ch.xp_reward} XP</Text>
                </View>

                {/* Title & Description */}
                <Text style={[styles.cardTitle, { color: colors.text }]}>{ch.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{ch.description}</Text>

                {/* Progress Info */}
                <View style={styles.progressRow}>
                  <ProgressRing percentage={ch.progress} size={42} strokeWidth={3.5} color={colors.primary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.progressLabel, { color: colors.text }]}>
                      {ch.progress > 0 ? `${Math.round(ch.progress)}% Progress Tracked` : '0% Progress • Start Logging Activity'}
                    </Text>
                    <Text style={[styles.progressSub, { color: colors.textMuted }]}>
                      {ch.duration_days} Days Challenge Protocol
                    </Text>
                  </View>
                </View>

                {/* Action Buttons Row */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={[styles.completeBtn, { backgroundColor: '#10b981' }]}
                    onPress={() => handleCompleteChallenge(ch)}
                    disabled={isActing}
                  >
                    {isActing ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Check size={14} color="#ffffff" />
                        <Text style={styles.completeBtnText}>✓ Complete Challenge</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.leaveBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                    onPress={() => handleLeaveChallenge(ch.id)}
                    disabled={isActing}
                  >
                    <Text style={[styles.leaveBtnText, { color: colors.danger }]}>Leave</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 3. COMPLETED CHALLENGES SECTION */}
      {completedUserChallenges.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              COMPLETED CHALLENGES ({completedUserChallenges.length})
            </Text>
          </View>

          {completedUserChallenges.map((ch: any) => {
            const IconComp = getCategoryIcon(ch.category);
            return (
              <View key={ch.id} style={[styles.completedCard, { backgroundColor: colors.cardBg, borderColor: '#10b98144' }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                    <IconComp size={12} color="#10b981" />
                    <Text style={[styles.categoryText, { color: '#10b981' }]}>{ch.category}</Text>
                  </View>
                  <View style={styles.completedBadgePill}>
                    <CheckCircle size={12} color="#10b981" />
                    <Text style={styles.completedBadgePillText}>✓ Completed</Text>
                  </View>
                </View>

                <Text style={[styles.cardTitle, { color: colors.text, marginTop: 6 }]}>{ch.title}</Text>
                <Text style={[styles.completedXpText, { color: colors.primary }]}>
                  🏆 +{ch.xp_reward} Health XP Earned
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* 4. RECOMMENDED FOR YOU SECTION */}
      {recommendedList.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>⭐ RECOMMENDED FOR YOU</Text>
            <View style={[styles.tagPill, { backgroundColor: colors.primaryLight + '22' }]}>
              <Text style={[styles.tagPillText, { color: colors.primary }]}>Goal Match</Text>
            </View>
          </View>

          {recommendedList.map(ch => {
            const IconComp = getCategoryIcon(ch.category);
            const isActing = actionLoadingId === ch.id;

            return (
              <View key={ch.id} style={[styles.recommendedCard, { backgroundColor: colors.cardBg, borderColor: colors.primary + '33' }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight + '22' }]}>
                    <IconComp size={12} color={colors.primary} />
                    <Text style={[styles.categoryText, { color: colors.primary }]}>{ch.category}</Text>
                  </View>
                  <Text style={[styles.xpBadgeText, { color: colors.primary }]}>🏆 +{ch.xp_reward} XP</Text>
                </View>

                <Text style={[styles.cardTitle, { color: colors.text }]}>{ch.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{ch.description}</Text>

                <View style={[styles.cardFooterRow, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {ch.duration_days} Days • {ch.difficulty}
                  </Text>
                  <TouchableOpacity
                    style={[styles.joinBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleJoinChallenge(ch)}
                    disabled={isActing}
                  >
                    {isActing ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.joinBtnText}>+ Join Challenge</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 5. CHALLENGE LIBRARY */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 10 }]}>
          CHALLENGE LIBRARY ({filteredChallenges.length})
        </Text>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
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
                <Text style={[styles.categoryPillText, { color: isSelected ? '#ffffff' : colors.text }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Challenge Cards List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
        ) : (
          filteredChallenges.map((c, idx) => {
            const active = isChallengeActive(c.id);
            const completed = isChallengeCompleted(c.id);
            const IconComp = getCategoryIcon(c.category);
            const isActing = actionLoadingId === c.id;

            return (
              <View key={c.id} style={[styles.libraryCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight + '22' }]}>
                    <IconComp size={12} color={colors.primary} />
                    <Text style={[styles.categoryText, { color: colors.primary }]}>{c.category}</Text>
                  </View>
                  <Text style={[styles.xpBadgeText, { color: colors.textMuted }]}>🏆 +{c.xp_reward} XP</Text>
                </View>

                <Text style={[styles.cardTitle, { color: colors.text }]}>{c.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{c.description}</Text>

                <View style={[styles.cardFooterRow, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {c.duration_days} Days • {c.difficulty}
                  </Text>

                  {completed ? (
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                      <CheckCircle size={12} color="#10b981" />
                      <Text style={[styles.statusBadgeText, { color: "#10b981" }]}>Completed</Text>
                    </View>
                  ) : active ? (
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(13, 148, 136, 0.12)' }]}>
                      <Clock size={12} color={colors.primary} />
                      <Text style={[styles.statusBadgeText, { color: colors.primary }]}>In Progress</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.joinBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleJoinChallenge(c)}
                      disabled={isActing}
                    >
                      {isActing ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text style={styles.joinBtnText}>+ Join Challenge</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create Custom Challenge</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <X size={20} color={colors.textMuted} />
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

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: colors.background }]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleCreateChallenge}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>Publish</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* DETAILS MODAL */}
      {selectedChallengeModal && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeaderRow}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight + '22' }]}>
                  <Text style={[styles.categoryText, { color: colors.primary }]}>
                    {selectedChallengeModal.category}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedChallengeModal(null)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalTitle, { color: colors.text, marginTop: 10 }]}>
                {selectedChallengeModal.title}
              </Text>
              <Text style={[styles.modalDesc, { color: colors.textMuted, marginTop: 8 }]}>
                {selectedChallengeModal.description}
              </Text>

              <View style={[styles.cardFooterRow, { marginTop: 16, borderTopColor: colors.cardBorder }]}>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                  Duration: {selectedChallengeModal.duration_days} Days
                </Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>
                  🏆 +{selectedChallengeModal.xp_reward} XP
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary, marginTop: 18 }]}
                onPress={() => setSelectedChallengeModal(null)}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  syncBtn: { padding: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  createBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  
  // 2x2 Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statBox: { width: '48%', padding: 12, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#64748b', letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '800', marginTop: 2 },

  // Sections
  sectionContainer: { marginBottom: 22 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeading: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  tagPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagPillText: { fontSize: 10, fontWeight: '800' },

  // Cards
  activeCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12 },
  recommendedCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12 },
  completedCard: { padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  libraryCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12 },

  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  categoryText: { fontSize: 10, fontWeight: '800' },
  xpBadgeText: { fontSize: 11, fontWeight: '800' },

  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4, lineHeight: 20 },
  cardDesc: { fontSize: 12, lineHeight: 17, marginBottom: 10 },

  progressRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  progressLabel: { fontSize: 12, fontWeight: '700' },
  progressSub: { fontSize: 11, marginTop: 2 },

  cardActionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  completeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6 },
  completeBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  leaveBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  leaveBtnText: { fontWeight: '700', fontSize: 12 },

  completedBadgePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.12)' },
  completedBadgePillText: { fontSize: 10, fontWeight: '800', color: '#10b981' },
  completedXpText: { fontSize: 11, fontWeight: '700', marginTop: 4 },

  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  metaText: { fontSize: 11, fontWeight: '600' },
  joinBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  joinBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 11 },

  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },

  categoryPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, borderWidth: 1 },
  categoryPillText: { fontWeight: '700', fontSize: 12 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, borderWidth: 1, padding: 20 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalDesc: { fontSize: 13, lineHeight: 18 },
  modalActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  modalSubmitBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
});
