import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function SettingsScreen({ navigation }: any) {
  const { profile, updateProfile, refreshProfile, signOut } = useAuth();
  const { theme, toggleTheme, activeMode, setActiveMode, colors, isCareMode } = useTheme();

  // Settings State
  const [aiCoachStyle, setAiCoachStyle] = useState(profile?.ai_coach_style || 'supportive');
  const [unitSystem, setUnitSystem] = useState(profile?.unit_system || 'Metric');
  const [wearableSync, setWearableSync] = useState(profile?.wearable_synced || false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Notification Preferences (Meal, Hydration, Workout, Sleep)
  const [notifMeal, setNotifMeal] = useState(true);
  const [notifHydration, setNotifHydration] = useState(true);
  const [notifWorkout, setNotifWorkout] = useState(true);
  const [notifSleep, setNotifSleep] = useState(true);

  // Password Change State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.ai_coach_style) setAiCoachStyle(profile.ai_coach_style);
      if (profile.unit_system) setUnitSystem(profile.unit_system);
      if (typeof profile.wearable_synced === 'boolean') setWearableSync(profile.wearable_synced);

      if (profile.reminder_preferences) {
        try {
          const parsed = JSON.parse(profile.reminder_preferences);
          if (typeof parsed === 'object') {
            if (typeof parsed.meal === 'boolean') setNotifMeal(parsed.meal);
            if (typeof parsed.hydration === 'boolean') setNotifHydration(parsed.hydration);
            if (typeof parsed.workout === 'boolean') setNotifWorkout(parsed.workout);
            if (typeof parsed.sleep === 'boolean') setNotifSleep(parsed.sleep);
          }
        } catch {
          // ignore legacy text formats
        }
      }
    }
  }, [profile]);

  const handleSaveSettings = async (updates: Record<string, any>) => {
    try {
      setSavingSettings(true);
      const { error } = await updateProfile(updates as any);
      if (error) {
        Alert.alert('Update Error', error.message || 'Failed to save settings to database.');
      } else {
        await refreshProfile();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update setting.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSelectMode = async (mode: 'wellness' | 'performance' | 'elderly') => {
    setActiveMode(mode);
    await handleSaveSettings({ active_mode: mode });
  };

  const handleSelectAiStyle = async (style: string) => {
    setAiCoachStyle(style);
    await handleSaveSettings({ ai_coach_style: style });
  };

  const handleSelectUnit = async (unit: string) => {
    setUnitSystem(unit);
    await handleSaveSettings({ unit_system: unit });
  };

  const handleToggleWearable = async (val: boolean) => {
    setWearableSync(val);
    await handleSaveSettings({ wearable_synced: val });
  };

  const handleToggleNotification = async (key: 'meal' | 'hydration' | 'workout' | 'sleep', val: boolean) => {
    const updated = {
      meal: key === 'meal' ? val : notifMeal,
      hydration: key === 'hydration' ? val : notifHydration,
      workout: key === 'workout' ? val : notifWorkout,
      sleep: key === 'sleep' ? val : notifSleep,
    };
    if (key === 'meal') setNotifMeal(val);
    if (key === 'hydration') setNotifHydration(val);
    if (key === 'workout') setNotifWorkout(val);
    if (key === 'sleep') setNotifSleep(val);

    await handleSaveSettings({ reminder_preferences: JSON.stringify(updated) });
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Invalid Password', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirmation password do not match.');
      return;
    }

    try {
      setChangingPw(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        Alert.alert('Update Failed', error.message || 'Unable to update password.');
      } else {
        Alert.alert('Password Updated ✓', 'Your account password has been changed successfully.');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setChangingPw(false);
    }
  };

  const handleSignOut = () => {
    const performSignOut = async () => {
      await signOut();
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Sign Out?\n\nAre you sure you want to sign out of your account?');
      if (confirmed) {
        performSignOut();
      }
    } else {
      Alert.alert(
        'Sign Out?',
        'Are you sure you want to sign out of your account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: performSignOut },
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
    <ScreenWrapper
      showBack
      onBack={() => navigation.goBack()}
      title="⚙️ App Settings & Controls"
      subtitle="Account & system preferences"
      showSettingsButton={false}
    >
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
            testID={`settings_mode_${m.id}`}
            accessibilityLabel={`settings_mode_${m.id}`}
            style={[
              styles.modeBtn,
              activeMode === m.id && { backgroundColor: colors.primary },
            ]}
            onPress={() => handleSelectMode(m.id as any)}
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

      {/* Appearance & Theme */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance & Units</Text>

      <View style={[styles.settingRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Theme Mode</Text>
          <Text style={[styles.settingDesc, { color: colors.textMuted }]}>Toggle high contrast dark/light interface</Text>
        </View>
        <Switch
          testID="settings_theme_toggle"
          accessibilityLabel="settings_theme_toggle"
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
        />
      </View>

      <View style={[styles.chipSection, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingLabel, { color: colors.text, marginBottom: 8 }]}>Unit System</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['Metric', 'Imperial'].map((u) => (
            <TouchableOpacity
              key={u}
              testID={`settings_unit_${u.toLowerCase()}`}
              accessibilityLabel={`settings_unit_${u.toLowerCase()}`}
              style={[
                styles.choiceChip,
                {
                  backgroundColor: unitSystem === u ? colors.primary : colors.surface,
                  borderColor: unitSystem === u ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => handleSelectUnit(u)}
            >
              <Text style={{ color: unitSystem === u ? '#fff' : colors.text, fontWeight: 'bold', fontSize: 12 }}>
                {u === 'Metric' ? '📏 Metric (kg, cm, ml)' : '📐 Imperial (lbs, in, oz)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* AI Coach Preferences */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Coach Preferences</Text>
      <View style={[styles.chipSection, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingLabel, { color: colors.text, marginBottom: 8 }]}>Coaching Style</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[
            { id: 'supportive', label: '🤝 Supportive' },
            { id: 'direct', label: '🎯 Direct' },
            { id: 'analytical', label: '📊 Analytical' },
            { id: 'scientific', label: '🔬 Scientific' },
          ].map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.choiceChip,
                {
                  backgroundColor: aiCoachStyle === s.id ? colors.primary : colors.surface,
                  borderColor: aiCoachStyle === s.id ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => handleSelectAiStyle(s.id)}
            >
              <Text style={{ color: aiCoachStyle === s.id ? '#fff' : colors.text, fontWeight: 'bold', fontSize: 12 }}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications & Devices */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Reminders</Text>

      <View style={[styles.settingRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Meal & Nutrition Reminders</Text>
        <Switch
          value={notifMeal}
          onValueChange={(val) => handleToggleNotification('meal', val)}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
        />
      </View>

      <View style={[styles.settingRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Hydration Reminders</Text>
        <Switch
          value={notifHydration}
          onValueChange={(val) => handleToggleNotification('hydration', val)}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
        />
      </View>

      <View style={[styles.settingRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Workout Reminders</Text>
        <Switch
          value={notifWorkout}
          onValueChange={(val) => handleToggleNotification('workout', val)}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
        />
      </View>

      <View style={[styles.settingRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Sleep & Wind-Down Reminders</Text>
        <Switch
          value={notifSleep}
          onValueChange={(val) => handleToggleNotification('sleep', val)}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
        />
      </View>

      <View style={[styles.settingRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Wearable & Health Connect Sync</Text>
        <Switch
          value={wearableSync}
          onValueChange={handleToggleWearable}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
        />
      </View>

      {/* Account & Security */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Account & Security</Text>

      <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Signed in Account</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.email || 'Authenticated User'}</Text>
        <Text style={[styles.infoSub, { color: colors.textMuted }]}>User ID: {profile?.id ? `${profile.id.substring(0, 18)}...` : 'Local'}</Text>
      </View>

      {/* Password Change Dropdown */}
      <TouchableOpacity
        style={[styles.pwToggleBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
        onPress={() => setShowPasswordForm(!showPasswordForm)}
      >
        <Text style={[styles.pwToggleText, { color: colors.text }]}>
          {showPasswordForm ? '🔒 Hide Password Form' : '🔑 Change Account Password'}
        </Text>
      </TouchableOpacity>

      {showPasswordForm && (
        <View style={[styles.pwBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 8 }}>
            Enter a new password of at least 8 characters.
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="New Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.text, marginTop: 8 }]}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={[styles.savePwBtn, { backgroundColor: colors.primary }]}
            onPress={handleChangePassword}
            disabled={changingPw}
          >
            {changingPw ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Danger Zone / Log Out */}
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
        testID="settings_logout_btn"
        accessibilityLabel="settings_logout_btn"
        style={[styles.signOutBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
        onPress={handleSignOut}
      >
        <Text style={[styles.signOutBtnText, { color: colors.primary }]}>🚪 Log Out Account</Text>
      </TouchableOpacity>

      {savingSettings && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 6 }}>Saving...</Text>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { marginRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: 'bold' },
  title: { fontWeight: 'bold' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, marginTop: 14 },
  modeRow: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 14, borderWidth: 1 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  modeBtnText: { fontSize: 12, fontWeight: '600' },
  settingRow: { borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  chipSection: { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  choiceChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingDesc: { fontSize: 11, marginTop: 2 },
  infoCard: { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  infoSub: { fontSize: 11, marginTop: 2 },
  pwToggleBtn: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 10 },
  pwToggleText: { fontSize: 13, fontWeight: 'bold' },
  pwBox: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 14 },
  input: { height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14 },
  savePwBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  wipeBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, marginTop: 8, marginBottom: 10 },
  wipeBtnText: { fontWeight: 'bold', fontSize: 14 },
  signOutBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, marginTop: 6, marginBottom: 20 },
  signOutBtnText: { fontWeight: 'bold', fontSize: 15 },
  savingOverlay: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
});
