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
import { CustomTextInput } from '../../components/CustomTextInput';

export default function ProfileScreen({ navigation }: any) {
  const { profile, updateProfile, refreshProfile, signOut } = useAuth();
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

  const calculateAge = (dobString?: string): string => {
    if (!dobString || dobString.trim() === '' || dobString === 'Not Set') return 'Not Set';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 'Not Set';
    const age = new Date().getFullYear() - dob.getFullYear();
    return age > 0 ? `${age} yrs` : 'Not Set';
  };

  const ageDisplay = calculateAge(dateOfBirth);
  const hNum = Number(heightCm);
  const wNum = Number(weightKg);
  const bmiDisplay = hNum > 0 && wNum > 0 ? (wNum / Math.pow(hNum / 100, 2)).toFixed(1) : '--';
  const bloodGroupDisplay = bloodGroup ? bloodGroup : 'Select Blood Group';

  const handleSelectBloodGroup = async (bg: string) => {
    setBloodGroup(bg);
    if (profile?.id) {
      const { error } = await updateProfile({ blood_group: bg });
      if (!error) {
        Alert.alert('Blood Group Updated ✨', `Blood Group updated to ${bg}.`);
      } else {
        Alert.alert('Error', error.message || 'Failed to update blood group.');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    try {
      setSaving(true);
      const { error } = await updateProfile({
        full_name: fullName,
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        bmi: Number(bmiDisplay) || 0,
        date_of_birth: dateOfBirth ? dateOfBirth : null as any,
        blood_group: bloodGroup ? bloodGroup : null as any,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
      });

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
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold', marginTop: 2 }}>{ageDisplay}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: 'bold' }}>BMI</Text>
            <Text style={{ color: colors.success, fontSize: 16, fontWeight: 'bold', marginTop: 2 }}>{bmiDisplay}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: 'bold' }}>BLOOD GROUP</Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>{bloodGroupDisplay}</Text>
          </View>
        </View>

        {/* Edit Form */}
        <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal & Physical Data</Text>

          <CustomTextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            containerStyle={{ marginBottom: 10 }}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <CustomTextInput
                label="Height (cm)"
                value={heightCm}
                keyboardType="numeric"
                onChangeText={setHeightCm}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomTextInput
                label="Weight (kg)"
                value={weightKg}
                keyboardType="numeric"
                onChangeText={setWeightKg}
              />
            </View>
          </View>

          <CustomTextInput
            label="Date of Birth (YYYY-MM-DD)"
            placeholder="Not Set (e.g. 1998-05-24)"
            value={dateOfBirth ? dateOfBirth : ''}
            onChangeText={setDateOfBirth}
            containerStyle={{ marginTop: 10 }}
          />

          {/* Blood Group Selectable Dropdown Pills */}
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.label, { color: colors.text }]}>Blood Group</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.bloodChip,
                    {
                      backgroundColor: bloodGroup === bg ? colors.primary : colors.surface,
                      borderColor: bloodGroup === bg ? colors.primary : colors.cardBorder,
                    },
                  ]}
                  onPress={() => handleSelectBloodGroup(bg)}
                >
                  <Text style={{ color: bloodGroup === bg ? '#ffffff' : colors.text, fontWeight: 'bold', fontSize: 13 }}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {!bloodGroup && (
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>
                Select Blood Group
              </Text>
            )}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contact Info</Text>

          <CustomTextInput
            label="Contact Name"
            value={emergencyName}
            onChangeText={setEmergencyName}
            placeholder="e.g. Jane Doe"
            containerStyle={{ marginBottom: 10 }}
          />

          <CustomTextInput
            label="Phone Number"
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
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
});
