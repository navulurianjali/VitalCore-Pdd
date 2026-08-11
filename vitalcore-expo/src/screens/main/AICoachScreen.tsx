import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
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
import { Send, History, X, Clock, Calendar } from 'lucide-react-native';
import { CustomTextInput } from '../../components/CustomTextInput';
import ScreenWrapper from '../../components/ScreenWrapper';
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

const INITIAL_SUGGESTIONS = [
  'How can I improve my fitness?',
  'Why am I feeling tired?',
  'How much water should I drink?',
  'What should I eat today?',
  'How many calories do I need?',
  'How can I sleep better?',
  'What workout should I do?',
  'How can I improve my recovery?',
];

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

  // Available Suggested Questions State
  const [availableSuggestions, setAvailableSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);

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

  const sendUserPromptMessage = async (promptText: string) => {
    if (!promptText.trim() || !user?.id || loading) return;

    const userPrompt = promptText.trim();
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
          active_mode: profile?.active_mode,
          ai_coach_style: profile?.ai_coach_style,
          unit_system: profile?.unit_system,
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

  const handleSend = () => {
    sendUserPromptMessage(inputText);
  };

  const handleSelectSuggestion = (question: string) => {
    setAvailableSuggestions((prev) => prev.filter((q) => q !== question));
    sendUserPromptMessage(question);
  };

  const FormattedMarkdownText = ({ text, style }: { text: string; style: any }) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <View style={{ flexDirection: 'column', gap: 4 }}>
        {lines.map((line, lineIdx) => {
          let trimmed = line.trim();
          if (!trimmed) {
            return <View key={lineIdx} style={{ height: 4 }} />;
          }

          let isHeader = false;
          if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
            isHeader = true;
            trimmed = trimmed.replace(/^#+\s*/, '');
          }

          let isBullet = false;
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            isBullet = true;
            trimmed = trimmed.replace(/^[*•-]\s*/, '');
          }

          const parts = trimmed.split(/(\*\*.*?\*\*|__.*?__)/g);

          const renderedLine = parts.map((part, partIdx) => {
            if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
              const boldText = part.slice(2, -2);
              return (
                <Text key={partIdx} style={[style, { fontWeight: '700' }, isHeader && { fontSize: 15, fontWeight: '800' }]}>
                  {boldText}
                </Text>
              );
            }
            return (
              <Text key={partIdx} style={[style, isHeader && { fontSize: 15, fontWeight: '800' }]}>
                {part}
              </Text>
            );
          });

          if (isBullet) {
            return (
              <View key={lineIdx} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 4 }}>
                <Text style={[style, { marginRight: 6, fontWeight: '700' }]}>•</Text>
                <Text style={{ flex: 1 }}>{renderedLine}</Text>
              </View>
            );
          }

          return (
            <Text key={lineIdx} style={style}>
              {renderedLine}
            </Text>
          );
        })}
      </View>
    );
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
        {isUser ? (
          <Text style={[styles.messageText, styles.userText]}>{item.text}</Text>
        ) : (
          <FormattedMarkdownText text={item.text} style={[styles.messageText, { color: colors.text }]} />
        )}
        <Text style={[styles.timestamp, { color: isUser ? '#e2e8f0' : colors.textMuted }]}>{item.timestamp}</Text>
      </View>
    );
  };

  return (
    <ScreenWrapper
      title="AI Coach"
      subtitle={`Telemetry: ${metrics?.sleepHours || 0}h Sleep • ${metrics?.hydrationMl || 0}ml Water • ${metrics?.caloriesConsumed || 0} kcal`}
      scrollable={false}
      headerRight={
        <TouchableOpacity
          style={[styles.historyButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={handleOpenHistoryModal}
        >
          <History size={16} color={colors.primary} />
          <Text style={[styles.historyButtonText, { color: colors.primary }]}>History</Text>
        </TouchableOpacity>
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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

        {/* Horizontally Scrollable Suggested Questions (Placed Below Chat, Above Input) */}
        {availableSuggestions.length > 0 && (
          <View style={[styles.suggestionsBarWrapper, { borderTopColor: colors.cardBorder }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScrollContent}
            >
              {availableSuggestions.map((question) => (
                <TouchableOpacity
                  key={question}
                  style={[
                    styles.suggestionPill,
                    { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                  ]}
                  onPress={() => handleSelectSuggestion(question)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestionPillText, { color: colors.text }]}>
                    {question}
                  </Text>
                  <Text style={[styles.suggestionArrow, { color: colors.primary }]}>→</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
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
    </ScreenWrapper>
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
  suggestionsBarWrapper: { borderTopWidth: 1, paddingVertical: 8 },
  suggestionsScrollContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  suggestionPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  suggestionPillText: { fontSize: 12, fontWeight: '600', marginRight: 6 },
  suggestionArrow: { fontSize: 13, fontWeight: '700' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  messageList: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#ffffff' },
  timestamp: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  typingText: { marginLeft: 8, fontSize: 12, fontStyle: 'italic' },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  disabledSend: { opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1 },
  modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeButton: { padding: 4 },
  modalBody: { flex: 1, paddingTop: 16 },
  emptyHistory: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyHistoryText: { marginTop: 12, fontSize: 14 },
  historyDayCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  historyDayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  historyDateText: { fontSize: 15, fontWeight: 'bold', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  historySnippet: { fontSize: 12, fontStyle: 'italic' },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 14, fontWeight: 'bold' },
  selectedDateTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
});
