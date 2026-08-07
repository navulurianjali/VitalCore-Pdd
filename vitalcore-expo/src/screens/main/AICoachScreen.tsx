import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHealthData } from '../../hooks/useHealthData';
import { supabase, BASE_API_URL, getAuthHeaders } from '../../services/supabase';
import { Send, Bot, Sparkles, AlertCircle } from 'lucide-react-native';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AICoachScreen() {
  const { profile, user } = useAuth();
  const { colors, isCareMode } = useTheme();
  const { metrics } = useHealthData();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Zero out messages when switching user context
    setMessages([]);
    setInitialLoading(true);

    async function loadHistory() {
      if (!user?.id) {
        setInitialLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          const loaded: Message[] = data.map((item: any) => ({
            id: item.id,
            sender: item.sender === 'user' ? 'user' : 'ai',
            text: item.message,
            timestamp: new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }));
          setMessages(loaded);
        } else {
          const welcomeMsg: Message = {
            id: 'welcome',
            sender: 'ai',
            text: `Hello ${profile?.full_name?.split(' ')[0] || 'there'}! I am your AI Health Companion. Today you have logged ${metrics?.hydrationMl || 0}ml water, ${metrics?.caloriesConsumed || 0} kcal, and ${metrics?.sleepHours || 0}h sleep. How can I assist your health goals today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages([welcomeMsg]);
        }
      } catch (err) {
        console.error('Error loading AI history:', err);
      } finally {
        setInitialLoading(false);
      }
    }

    loadHistory();
  }, [user?.id]);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id) return;

    const userPrompt = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      await supabase.from('ai_conversations').insert({
        user_id: user.id,
        sender: 'user',
        message: userPrompt,
      });
    } catch (e) {
      console.warn('Failed to save user prompt to Supabase:', e);
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_API_URL}/api/ai-coach`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userPrompt,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          digitalTwin: metrics,
        }),
      });

      let aiReplyText = '';
      if (response.ok) {
        const data = await response.json();
        aiReplyText = data.reply;
      } else {
        const errData = await response.json().catch(() => ({}));
        aiReplyText = errData.error || 'The AI Coach server encountered an issue. Please try again.';
      }

      if (!aiReplyText) {
        aiReplyText = `Based on your health data (Hydration: ${metrics?.hydrationMl || 0}ml, Sleep: ${metrics?.sleepHours || 0}h), maintaining your logged targets will support your body energy today.`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      try {
        await supabase.from('ai_conversations').insert({
          user_id: user.id,
          sender: 'ai',
          message: aiReplyText,
        });
      } catch (e) {
        console.warn('Failed to save AI reply to Supabase:', e);
      }
    } catch (err: any) {
      console.error('AI Coach network error:', err);
      const fallbackReplyText = `Based on your health data (${metrics?.hydrationMl || 0}ml water, ${metrics?.sleepHours || 0}h sleep), maintaining consistent hydration and physical activity will optimize your health progress today.`;
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
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
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: isCareMode ? 22 : 18 }]}>
            🤖 Digital Twin AI Health Coach
          </Text>
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
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="Ask your AI Coach..."
            placeholderTextColor="#64748b"
            value={inputText}
            onChangeText={setInputText}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  chipsContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1 },
  chipText: { fontSize: 12 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  messageList: { padding: 16 },
  messageBubble: { maxWidth: '82%', borderRadius: 16, padding: 14, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end' },
  aiBubble: { alignSelf: 'flex-start', borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#ffffff' },
  timestamp: { fontSize: 10, marginTop: 6, alignSelf: 'flex-end' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  typingText: { fontSize: 12, marginLeft: 8 },
  inputBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1 },
  textInput: { flex: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, borderWidth: 1 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  disabledSend: { opacity: 0.5 },
});
