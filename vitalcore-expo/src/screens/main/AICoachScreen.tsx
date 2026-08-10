import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
  AppState,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHealthData } from '../../hooks/useHealthData';
import { supabase } from '../../services/supabase';
import { generateAICoachResponse } from '../../services/aiCoachService';
import { Send, Bot, History, X, Clock, Calendar } from 'lucide-react-native';
import { CustomTextInput } from '../../components/CustomTextInput';
import { getLocalDateString, formatDisplayDate } from '../../utils/dateUtils';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  conversation_date?: string;
}

interface PastDaySummary {
  dateStr: string;
  count: number;
  lastMessageSnippet: string;
}

export default function AICoachScreen() {
  const { profile, user } = useAuth();
  const { colors, isCareMode } = useTheme();
  const { metrics } = useHealthData();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentDateStr, setCurrentDateStr] = useState<string>(
    getLocalDateString(undefined, profile?.timezone)
  );

  // Chat History Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pastDays, setPastDays] = useState<PastDaySummary[]>([]);
  const [selectedPastDate, setSelectedPastDate] = useState<string | null>(null);
  const [pastMessages, setPastMessages] = useState<Message[]>([]);
  const [loadingPastChat, setLoadingPastChat] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const getTodayStr = useCallback(() => {
    return getLocalDateString(undefined, profile?.timezone);
  }, [profile?.timezone]);

  // Load Today's Conversation Only
  const loadTodayHistory = useCallback(async (targetDate?: string) => {
    if (!user?.id) {
      setInitialLoading(false);
      return;
    }

    const dateToQuery = targetDate || getTodayStr();
    setCurrentDateStr(dateToQuery);

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_date', dateToQuery)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const loaded: Message[] = data.map((item: any) => ({
          id: item.id,
          sender: item.sender === 'user' ? 'user' : 'ai',
          text: item.message,
          timestamp: new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          conversation_date: item.conversation_date,
        }));
        setMessages(loaded);
      } else {
        const isBrandNew = !metrics || !metrics.hasTelemetry || metrics.trackingDaysCount === 0;
        const welcomeText = isBrandNew
          ? "Welcome! Start logging your daily health activities. I'll learn your habits over time and provide personalized recommendations once enough data is available."
          : `Hello ${profile?.full_name?.split(' ')[0] || 'there'}! Today you have logged ${metrics?.hydrationMl || 0}ml water, ${metrics?.caloriesConsumed || 0} kcal, and ${metrics?.sleepHours || 0}h sleep. How can I assist your health goals today?`;

        const welcomeMsg: Message = {
          id: 'welcome',
          sender: 'ai',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          conversation_date: dateToQuery,
        };
        setMessages([welcomeMsg]);
      }
    } catch (err) {
      console.error('Error loading AI history for today:', err);
    } finally {
      setInitialLoading(false);
    }
  }, [user?.id, profile?.full_name, profile?.timezone, metrics, getTodayStr]);

  useEffect(() => {
    setMessages([]);
    setInitialLoading(true);
    loadTodayHistory();
  }, [user?.id, loadTodayHistory]);

  // AppState / Background Resume listener for Midnight Transition
  useEffect(() => {
    const handleAppStateChange = (nextState: string) => {
      if (nextState === 'active') {
        const todayStr = getTodayStr();
        if (todayStr !== currentDateStr) {
          setCurrentDateStr(todayStr);
          loadTodayHistory(todayStr);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [currentDateStr, getTodayStr, loadTodayHistory]);

  // Load Past Chat Dates
  const loadPastChatDates = async () => {
    if (!user?.id) return;
    try {
      const todayStr = getTodayStr();
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('conversation_date, message, created_at')
        .eq('user_id', user.id)
        .lt('conversation_date', todayStr)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const map = new Map<string, { count: number; lastMsg: string }>();
        data.forEach((row: any) => {
          const dStr = row.conversation_date || row.created_at?.split('T')[0];
          if (dStr && dStr < todayStr) {
            if (!map.has(dStr)) {
              map.set(dStr, { count: 1, lastMsg: row.message });
            } else {
              map.get(dStr)!.count += 1;
            }
          }
        });

        const summaries: PastDaySummary[] = Array.from(map.entries())
          .map(([dateStr, info]) => ({
            dateStr,
            count: info.count,
            lastMessageSnippet: info.lastMsg,
          }))
          .sort((a, b) => b.dateStr.localeCompare(a.dateStr));

        setPastDays(summaries);
      }
    } catch (e) {
      console.warn('Failed to load past chat dates:', e);
    }
  };

  const handleOpenHistoryModal = () => {
    setShowHistoryModal(true);
    setSelectedPastDate(null);
    setPastMessages([]);
    loadPastChatDates();
  };

  const handleSelectPastDate = async (dateStr: string) => {
    if (!user?.id) return;
    setSelectedPastDate(dateStr);
    setLoadingPastChat(true);

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_date', dateStr)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const loaded: Message[] = data.map((item: any) => ({
          id: item.id,
          sender: item.sender === 'user' ? 'user' : 'ai',
          text: item.message,
          timestamp: new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          conversation_date: item.conversation_date,
        }));
        setPastMessages(loaded);
      } else {
        setPastMessages([]);
      }
    } catch (err) {
      console.warn('Failed to load past conversation:', err);
      setPastMessages([]);
    } finally {
      setLoadingPastChat(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id) return;

    const userPrompt = inputText.trim();
    const todayDate = getTodayStr();
    setInputText('');

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conversation_date: todayDate,
    };

    const currentTodayHistory = [...messages.filter((m) => m.id !== 'welcome'), userMsg];
    setMessages(currentTodayHistory);
    setLoading(true);

    // Save user message to DB with conversation_date
    try {
      await supabase.from('ai_conversations').insert({
        user_id: user.id,
        sender: 'user',
        message: userPrompt,
        conversation_date: todayDate,
      });
    } catch (e) {
      console.warn('Failed to save user prompt to Supabase:', e);
    }

    try {
      const historyForService = currentTodayHistory.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const aiReplyText = await generateAICoachResponse(
        userPrompt,
        historyForService,
        {
          full_name: profile?.full_name,
          age: profile?.age || (profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 28),
          gender: profile?.gender,
          weight_kg: profile?.weight_kg,
          height_cm: profile?.height_cm,
          bmi: profile?.bmi,
          fitness_level: profile?.fitness_level,
          fitness_goal: profile?.fitness_goal,
          dietary_preferences: profile?.dietary_preferences,
          allergies: profile?.allergies,
          chronic_conditions: profile?.chronic_conditions,
          previous_injuries: profile?.previous_injuries,
          sleep_problems: profile?.sleep_problems,
        },
        metrics
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conversation_date: todayDate,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Save AI reply to DB with conversation_date
      try {
        await supabase.from('ai_conversations').insert({
          user_id: user.id,
          sender: 'ai',
          message: aiReplyText,
          conversation_date: todayDate,
        });
      } catch (e) {
        console.warn('Failed to save AI reply to Supabase:', e);
      }
    } catch (err: any) {
      console.error('AI Coach Error:', err);
      const errorMsgText = `⚠️ ${err?.message || 'Failed to generate AI response. Please try again.'}`;
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: errorMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conversation_date: todayDate,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [styles.aiBubble, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }],
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : { color: colors.text }]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, { color: isUser ? '#e2e8f0' : colors.textMuted }]}>{item.timestamp}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.cardBorder }]}>
          <View style={styles.headerTopRow}>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: isCareMode ? 20 : 17 }]}>
              🤖 AI Coach ({formatDisplayDate(currentDateStr, profile?.timezone)})
            </Text>
            <TouchableOpacity
              style={[styles.historyButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={handleOpenHistoryModal}
            >
              <History size={16} color={colors.primary} />
              <Text style={[styles.historyButtonText, { color: colors.primary }]}>History</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Telemetry: {metrics?.sleepHours || 0}h Sleep • {metrics?.hydrationMl || 0}ml Water • {metrics?.caloriesConsumed || 0} kcal
          </Text>
        </View>

        {/* Quick Suggestion Chips */}
        <View style={[styles.chipsContainer, { borderBottomColor: colors.cardBorder }]}>
          {['Analyze my sleep recovery', 'Suggest high-protein dinner', 'How to reduce burnout?'].map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => setInputText(chip)}
            >
              <Text style={[styles.chipText, { color: colors.primary }]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message History */}
        {initialLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Syncing Digital Twin conversation...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {loading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.typingText, { color: colors.textMuted }]}>AI Coach analyzing telemetry...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.cardBorder }]}>
          <CustomTextInput
            placeholder="Ask your AI Coach..."
            value={inputText}
            onChangeText={setInputText}
            containerStyle={{ flex: 1 }}
            inputContainerStyle={{ borderRadius: 24, paddingHorizontal: 16 }}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              (!inputText.trim() || loading) && styles.disabledSend,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Send size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Chat History Modal */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.modalHeaderTitleRow}>
                <History size={20} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>AI Chat History</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)} style={styles.closeButton}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody}>
              {!selectedPastDate ? (
                /* List of past dates */
                pastDays.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Clock size={36} color={colors.textMuted} />
                    <Text style={[styles.emptyHistoryText, { color: colors.textMuted }]}>
                      No previous conversations recorded yet.
                    </Text>
                  </View>
                ) : (
                  pastDays.map((pd) => (
                    <TouchableOpacity
                      key={pd.dateStr}
                      style={[styles.historyDayCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                      onPress={() => handleSelectPastDate(pd.dateStr)}
                    >
                      <View style={styles.historyDayHeader}>
                        <Calendar size={16} color={colors.primary} />
                        <Text style={[styles.historyDateText, { color: colors.text }]}>
                          {formatDisplayDate(pd.dateStr, profile?.timezone)}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.badgeText, { color: colors.primary }]}>{pd.count} msgs</Text>
                        </View>
                      </View>
                      <Text style={[styles.historySnippet, { color: colors.textMuted }]} numberOfLines={1}>
                        "{pd.lastMessageSnippet}"
                      </Text>
                    </TouchableOpacity>
                  ))
                )
              ) : (
                /* Past conversation viewer */
                <View>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedPastDate(null)}
                  >
                    <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back to all dates</Text>
                  </TouchableOpacity>

                  <Text style={[styles.selectedDateTitle, { color: colors.text }]}>
                    {formatDisplayDate(selectedPastDate, profile?.timezone)}
                  </Text>

                  {loadingPastChat ? (
                    <ActivityIndicator size="medium" color={colors.primary} style={{ marginVertical: 20 }} />
                  ) : pastMessages.length === 0 ? (
                    <Text style={[styles.emptyHistoryText, { color: colors.textMuted, marginVertical: 20 }]}>
                      No messages found.
                    </Text>
                  ) : (
                    pastMessages.map((m) => renderMessage({ item: m }))
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontWeight: 'bold', flex: 1 },
  historyButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginLeft: 8 },
  historyButtonText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  headerSubtitle: { fontSize: 11, marginTop: 4 },
  chipsContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1 },
  chipText: { fontSize: 12 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  messageList: { padding: 16 },
  messageBubble: { maxWidth: '82%', borderRadius: 16, padding: 14, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end' },
  aiBubble: { alignSelf: 'start', borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#ffffff' },
  timestamp: { fontSize: 10, marginTop: 6, alignSelf: 'flex-end' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  typingText: { fontSize: 12, marginLeft: 8 },
  inputBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  disabledSend: { opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1 },
  modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  closeButton: { padding: 4 },
  modalBody: { flex: 1, marginTop: 12 },
  emptyHistory: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyHistoryText: { marginTop: 12, fontSize: 13, textAlign: 'center' },
  historyDayCard: { padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  historyDayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  historyDateText: { fontSize: 14, fontWeight: 'bold', marginLeft: 6, flex: 1 },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  historySnippet: { fontSize: 12, fontStyle: 'italic' },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 13, fontWeight: 'bold' },
  selectedDateTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 14 },
});
