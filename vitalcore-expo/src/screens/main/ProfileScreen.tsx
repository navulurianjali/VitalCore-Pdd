import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';

export default function ProfileScreen({ navigation }: any) {
  const { profile, refreshProfile, signOut } = useAuth();
  const { colors, isCareMode } = useTheme();
  const [saving, setSaving] = useState(false);

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

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [heightCm, setHeightCm] = useState(profile?.height_cm ? String(profile.height_cm) : '');
  const [weightKg, setWeightKg] = useState(profile?.weight_kg ? String(profile.weight_kg) : '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || '');
  const [emergencyName, setEmergencyName] = useState(profile?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergency_contact_phone || '');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setHeightCm(profile.height_cm ? String(profile.height_cm) : '');
      setWeightKg(profile.weight_kg ? String(profile.weight_kg) : '');
      setDateOfBirth(profile.date_of_birth || '');
      setBloodGroup(profile.blood_group || '');
      setEmergencyName(profile.emergency_contact_name || '');
      setEmergencyPhone(profile.emergency_contact_phone || '');
    }
  }, [profile]);

  const calculateAge = (dobString: string): string => {
    if (!dobString) return '--';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '--';
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
  };

  const ageDisplay = calculateAge(dateOfBirth);
  const hNum = Number(heightCm);
  const wNum = Number(weightKg);
  const bmiDisplay = hNum > 0 && wNum > 0 ? (wNum / Math.pow(hNum / 100, 2)).toFixed(1) : '--';

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          height_cm: Number(heightCm),
          weight_kg: Number(weightKg),
          bmi: Number(bmiDisplay) || 0,
          date_of_birth: dateOfBirth,
          blood_group: bloodGroup,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (!error) {
        await refreshProfile();
        Alert.alert('Profile Saved ✨', 'Centralized Health Profile updated live across all devices.');
      } else {
        Alert.alert('Error', error.message || 'Failed to update profile.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: isCareMode ? 24 : 20 }]}>
            👤 Health Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Central source of truth for VitalCore AI
          </Text>
        </View>

        {/* Quick Stat Cards */}
        <View style={styles.statGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: 'bold' }}>AGE</Text>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>{ageDisplay} {ageDisplay !== '--' ? 'yrs' : ''}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: 'bold' }}>BMI</Text>
            <Text style={{ color: colors.success, fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>{bmiDisplay}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: 'bold' }}>BLOOD</Text>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>{bloodGroup}</Text>
          </View>
        </View>

        {/* Edit Form */}
        <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal & Physical Data</Text>

          <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={fullName}
            onChangeText={setFullName}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Height (cm)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
                value={heightCm}
                keyboardType="numeric"
                onChangeText={setHeightCm}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Weight (kg)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
                value={weightKg}
                keyboardType="numeric"
                onChangeText={setWeightKg}
              />
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textMuted, marginTop: 10 }]}>Date of Birth (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />
        </View>

        {/* Emergency Contact */}
        <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contact Info</Text>

          <Text style={[styles.label, { color: colors.textMuted }]}>Contact Name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={emergencyName}
            onChangeText={setEmergencyName}
            placeholder="e.g. Jane Doe"
          />

          <Text style={[styles.label, { color: colors.textMuted, marginTop: 10 }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            placeholder="+91 98765 43210"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Save Health Profile</Text>
          )}
        </TouchableOpacity>

        {/* Sign Out Button */}
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
  container: { padding: 16 },
  header: { marginBottom: 14 },
  title: { fontWeight: 'bold' },
  subtitle: { fontSize: 12, marginTop: 2 },
  statGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  sectionBox: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, fontWeight: 'bold' },
  saveBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  signOutBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, marginTop: 12, marginBottom: 20 },
  signOutBtnText: { fontWeight: 'bold', fontSize: 15 },
});
