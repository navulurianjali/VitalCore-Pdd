import React, { useState, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { CustomTextInput } from '../../components/CustomTextInput';

interface ChallengeItem {
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
  { id: "c-fit-1", title: "Walk 10,000 Steps for 30 Days", description: "Achieve 10,000 steps every day for 30 days to build foundational cardiovascular endurance.", category: "Fitness", difficulty: "Medium", xp_reward: 350, duration_days: 30, participants_count: 142 },
  { id: "c-fit-2", title: "50 Squats Daily Challenge", description: "Perform 50 bodyweight squats daily to strengthen lower body and improve mobility.", category: "Fitness", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 89 },
  { id: "c-fit-3", title: "30-Day Core Strength Sprint", description: "Complete daily plank and core exercises to build trunk stability.", category: "Fitness", difficulty: "Hard", xp_reward: 500, duration_days: 30, participants_count: 215 },
  { id: "c-fit-4", title: "Yoga & Mobility for 21 Days", description: "Practice 20 minutes of daily yoga and hip mobility routines.", category: "Fitness", difficulty: "Easy", xp_reward: 250, duration_days: 21, participants_count: 110 },

  { id: "c-nut-1", title: "High Protein Week", description: "Hit your daily protein target (at least 80g-120g) every day for 7 days.", category: "Nutrition", difficulty: "Medium", xp_reward: 250, duration_days: 7, participants_count: 184 },
  { id: "c-nut-2", title: "No Sugary Drinks Challenge", description: "Eliminate all sodas, packaged juices, and sweetened beverages for 14 days.", category: "Nutrition", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 275 },
  { id: "c-nut-3", title: "Healthy Breakfast Challenge", description: "Eat an evidence-based high-protein, high-fiber breakfast daily.", category: "Nutrition", difficulty: "Easy", xp_reward: 150, duration_days: 7, participants_count: 95 },
  { id: "c-nut-4", title: "No Junk Food Week", description: "Avoid fried foods, processed snacks, and fast food for 7 consecutive days.", category: "Nutrition", difficulty: "Medium", xp_reward: 300, duration_days: 7, participants_count: 420 },

  { id: "c-hyd-1", title: "Drink 2.5L Water Daily", description: "Drink 2,500ml of fresh water every day to maintain optimal cellular hydration.", category: "Hydration", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 512 },
  { id: "c-hyd-2", title: "7-Day Hydration Hero", description: "Log at least 2,000ml of water daily for 7 consecutive days.", category: "Hydration", difficulty: "Easy", xp_reward: 150, duration_days: 7, participants_count: 380 },

  { id: "c-slp-1", title: "Sleep Before 11 PM", description: "Go to bed before 11:00 PM every night for 14 nights to align circadian rhythm.", category: "Sleep", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 290 },
  { id: "c-slp-2", title: "Digital Detox Before Bed", description: "Turn off all smartphone, laptop, and TV screens 45 minutes before sleep.", category: "Sleep", difficulty: "Easy", xp_reward: 200, duration_days: 7, participants_count: 340 },

  { id: "c-men-1", title: "15-Min Daily Meditation", description: "Practice 15 minutes of mindfulness or guided meditation daily for 14 days.", category: "Mental Wellness", difficulty: "Easy", xp_reward: 200, duration_days: 14, participants_count: 210 },
  { id: "c-men-2", title: "Daily Gratitude Journal", description: "Write down 3 things you are grateful for every evening for 21 days.", category: "Mental Wellness", difficulty: "Easy", xp_reward: 250, duration_days: 21, participants_count: 185 },

  { id: "c-hab-1", title: "No Alcohol Month", description: "Abstain from all alcoholic beverages for 30 consecutive days.", category: "Healthy Habits", difficulty: "Hard", xp_reward: 500, duration_days: 30, participants_count: 160 },
  { id: "c-hab-2", title: "Cold Shower Energy Boost", description: "Take a 60-second cold shower ending every morning for 14 days.", category: "Healthy Habits", difficulty: "Medium", xp_reward: 300, duration_days: 14, participants_count: 225 }
];

export default function ChallengesScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, isCareMode } = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [challenges, setChallenges] = useState<ChallengeItem[]>(PREDEFINED_CHALLENGES);
  const [userJoinedIds, setUserJoinedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Fitness');
  const [newDuration, setNewDuration] = useState('7');
  const [newXp, setNewXp] = useState('200');

  const CATEGORIES = ['All', 'Fitness', 'Nutrition', 'Hydration', 'Sleep', 'Mental Wellness', 'Healthy Habits'];

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data: dbData } = await supabase.from('challenges').select('*').order('id', { ascending: false });

      let joinedIds: string[] = [];
      if (user?.id) {
        const { data: userChall } = await supabase
          .from('user_challenges')
          .select('challenge_id')
          .eq('user_id', user.id);

        if (userChall) {
          joinedIds = userChall.map((uc: any) => uc.challenge_id);
        }
      }
      setUserJoinedIds(joinedIds);

      if (dbData && dbData.length > 0) {
        const list: ChallengeItem[] = [
          ...dbData.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category || 'Fitness',
            difficulty: c.difficulty || 'Medium',
            xp_reward: Number(c.xp_reward || 200),
            duration_days: Number(c.duration_days || 7),
            participants_count: 95,
            joined: joinedIds.includes(c.id),
          })),
          ...PREDEFINED_CHALLENGES.map(c => ({
            ...c,
            joined: joinedIds.includes(c.id),
          }))
        ];
        setChallenges(list);
      } else {
        setChallenges(PREDEFINED_CHALLENGES.map(c => ({ ...c, joined: joinedIds.includes(c.id) })));
      }
    } catch (e) {
      console.error(e);
      setChallenges(PREDEFINED_CHALLENGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();

    const channel = supabase
      .channel('public:challenges_realtime_mobile_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => {
        fetchChallenges();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_challenges' }, () => {
        fetchChallenges();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleJoinChallenge = async (ch: ChallengeItem) => {
    if (!user?.id) return;
    try {
      setUserJoinedIds([...userJoinedIds, ch.id]);
      await supabase.from('user_challenges').insert({
        user_id: user.id,
        challenge_id: ch.id,
        progress_percentage: 15,
      });
      Alert.alert('Joined Challenge ✨', `${ch.title} moved to your Active Challenges.`);
      fetchChallenges();
    } catch (e: any) {
      Alert.alert('Notice', 'Challenge activated.');
    }
  };

  const handleCreateChallenge = async () => {
    if (!newTitle.trim() || !newDesc.trim() || !user?.id) return;
    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          difficulty: 'Medium',
          duration_days: parseInt(newDuration) || 7,
          xp_reward: parseInt(newXp) || 200,
        })
        .select();

      if (!error && data && data.length > 0) {
        await supabase.from('user_challenges').insert({
          user_id: user.id,
          challenge_id: data[0].id,
          progress_percentage: 15,
        });

        Alert.alert('Challenge Published! 🏆', 'Your challenge is live and synced across Web & Mobile.');
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

  const filtered = selectedCategory === 'All'
    ? challenges
    : challenges.filter(c => c.category === selectedCategory);

  const joinedList = challenges.filter(c => userJoinedIds.includes(c.id));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, fontSize: isCareMode ? 24 : 20 }]}>
            🏆 Health Challenge Library
          </Text>
        </View>

        {/* DUAL HEADER BUTTONS */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          <TouchableOpacity
            style={[styles.actionBtnHeader, { backgroundColor: colors.primary }]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>🎯 Join Challenges</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnHeader, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 11 }}>+ Create Your Own</Text>
          </TouchableOpacity>
        </View>

        {/* MY ACTIVE CHALLENGES */}
        {joinedList.length > 0 && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🔥 My Active Challenges ({joinedList.length})</Text>
            {joinedList.map((ch) => (
              <View key={ch.id} style={[styles.joinedCard, { borderColor: colors.cardBorder }]}>
                <View style={styles.rowBetween}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>{ch.title}</Text>
                  <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 11 }}>Active 15%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* CATEGORY FILTER PILLS */}
        <View style={{ marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    { backgroundColor: isSelected ? colors.primary : colors.cardBg, borderColor: colors.cardBorder }
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={{ color: isSelected ? '#fff' : colors.text, fontWeight: 'bold', fontSize: 11 }}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* CHALLENGE LIBRARY GRID */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
        ) : (
          filtered.map((c) => {
            const isJoined = userJoinedIds.includes(c.id);

            return (
              <View key={c.id} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.rowBetween}>
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>{c.category}</Text>
                  </View>
                  <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 11 }}>🏆 +{c.xp_reward} XP</Text>
                </View>

                <Text style={[styles.cardTitle, { color: colors.text }]}>{c.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{c.description}</Text>

                <View style={[styles.rowBetween, { marginTop: 8 }]}>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>⏱️ {c.duration_days} Days</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>⚡ {c.difficulty}</Text>
                </View>

                {isJoined ? (
                  <View style={[styles.actionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 12 }}>✓ Joined & Active</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleJoinChallenge(c)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Join Challenge</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.rowBetween}>
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 15 }}>Create Custom Challenge</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Text style={{ color: colors.textMuted, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <CustomTextInput
                label="Challenge Name"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. 7-Day Morning Electrolyte Sprint"
                containerStyle={{ marginTop: 12 }}
              />

              <CustomTextInput
                label="Description"
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="e.g. Drink warm water with lemon daily."
                containerStyle={{ marginTop: 10 }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.background }}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.primary }}
                  onPress={handleCreateChallenge}
                  disabled={submitting}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Publish</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16 },
  header: { marginBottom: 12 },
  backBtn: { marginBottom: 6 },
  title: { fontWeight: 'bold' },
  actionBtnHeader: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  sectionBox: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  joinedCard: { padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 6 },
  card: { borderRadius: 18, borderWidth: 1, marginBottom: 12, padding: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  cardDesc: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  actionBtn: { paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, fontWeight: 'bold' },
});
