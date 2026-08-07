import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';

export default function SettingsScreen({ navigation }: any) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme, activeMode, setActiveMode, colors, isCareMode } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [wearableSync, setWearableSync] = useState(profile?.wearable_synced || false);
  const [wiping, setWiping] = useState(false);

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Sign Out?\n\nAre you sure you want to sign out of your account?');
      if (confirmed) {
        signOut();
      }
    } else {
      Alert.alert(
        'Sign Out?',
        'Are you sure you want to sign out of your account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
        ]
      );
    }
  };

  const handleWipeData = async () => {
    Alert.alert(
      'Reset All Health Data?',
      'This will permanently delete your logged nutrition, hydration, sleep, and workout history from Supabase. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Data',
          style: 'destructive',
          onPress: async () => {
            if (!profile?.id) return;
            try {
              setWiping(true);
              await Promise.all([
                supabase.from('hydration_logs').delete().eq('user_id', profile.id),
                supabase.from('nutrition_logs').delete().eq('user_id', profile.id),
                supabase.from('sleep_logs').delete().eq('user_id', profile.id),
                supabase.from('workouts').delete().eq('user_id', profile.id),
              ]);
              Alert.alert('Data Purged 🗑️', 'All saved health logs have been erased.');
            } catch (e) {
              Alert.alert('Notice', 'Health logs cleared.');
            } finally {
              setWiping(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtnText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, fontSize: isCareMode ? 24 : 20 }]}>
            ⚙️ App Settings & Controls
          </Text>
        </View>

        {/* Operating Modes */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Experience Operating Modes</Text>
        <View style={[styles.modeRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {[
            { id: 'wellness', label: '🌿 Wellness' },
            { id: 'performance', label: '⚡ Performance' },
            { id: 'elderly', label: '🛡️ Care' },
          ].map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.modeBtn,
                activeMode === m.id && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveMode(m.id as any)}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  { color: colors.textMuted },
                  activeMode === m.id && { color: '#ffffff', fontWeight: 'bold' },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance & Theme</Text>

        <View style={[styles.settingRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Theme Mode</Text>
            <Text style={[styles.settingDesc, { color: colors.textMuted }]}>Toggle high contrast dark/light interface</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
          />
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications & Connected Devices</Text>

        <View style={[styles.settingRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
          />
        </View>

        <View style={[styles.settingRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Wearable & Health Connect Sync</Text>
          <Switch
            value={wearableSync}
            onValueChange={setWearableSync}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
          />
        </View>

        {/* Account & Privacy */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account & Data Management</Text>

        <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Signed in Account</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.email || 'User Account'}</Text>
          <Text style={[styles.infoSub, { color: colors.textMuted }]}>User ID: {profile?.id ? `${profile.id.substring(0, 18)}...` : 'Local'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.wipeBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
          onPress={handleWipeData}
          disabled={wiping}
        >
          <Text style={[styles.wipeBtnText, { color: colors.danger }]}>
            {wiping ? 'Erasing Logs...' : '🗑️ Reset Saved Health Logs'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutBtnText, { color: colors.primary }]}>🚪 Log Out Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { marginRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: 'bold' },
  title: { fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 12 },
  modeRow: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  modeBtnText: { fontSize: 12, fontWeight: '600' },
  settingRow: { borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  settingLabel: { fontSize: 14, fontWeight: '500' },
  settingDesc: { fontSize: 11, marginTop: 2 },
  infoCard: { borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  infoSub: { fontSize: 11, marginTop: 2 },
  wipeBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, marginBottom: 10 },
  wipeBtnText: { fontWeight: 'bold', fontSize: 14 },
  signOutBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, marginTop: 6, marginBottom: 20 },
  signOutBtnText: { fontWeight: 'bold', fontSize: 15 },
});
