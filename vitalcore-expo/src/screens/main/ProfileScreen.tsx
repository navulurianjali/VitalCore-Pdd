import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomTextInput } from '../../components/CustomTextInput';
import ScreenWrapper from '../../components/ScreenWrapper';
import { ChevronDown, Check, X } from 'lucide-react-native';

type SectionId = 'personal' | 'body' | 'medical' | 'lifestyle' | 'nutrition' | 'fitness' | 'emergency' | 'settings';

const SECTIONS: { id: SectionId; label: string; emoji: string }[] = [
  { id: 'personal',  label: 'Personal',       emoji: '👤' },
  { id: 'body',      label: 'Body',            emoji: '⚖️' },
  { id: 'medical',   label: 'Medical',         emoji: '🩺' },
  { id: 'lifestyle', label: 'Lifestyle',       emoji: '🌿' },
  { id: 'nutrition', label: 'Nutrition',       emoji: '🥗' },
  { id: 'fitness',   label: 'Fitness',         emoji: '💪' },
  { id: 'emergency', label: 'Emergency',       emoji: '🆘' },
  { id: 'settings',  label: 'Settings',        emoji: '⚙️' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ProfileScreen({ navigation }: any) {
  const { profile, updateProfile, refreshProfile, signOut } = useAuth();
  const { colors, isCareMode } = useTheme();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('personal');

  // Form fields — Personal
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');

  // Body
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [showBloodDropdown, setShowBloodDropdown] = useState(false);

  // Medical
  const [medicalConditions, setMedicalConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');

  // Lifestyle
  const [smokingStatus, setSmokingStatus] = useState('');
  const [alcoholStatus, setAlcoholStatus] = useState('');
  const [workingHours, setWorkingHours] = useState('');

  // Nutrition
  const [foodPreference, setFoodPreference] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');

  // Fitness
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [stepGoal, setStepGoal] = useState('');
  const [waterGoal, setWaterGoal] = useState('');

  // Emergency
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDateOfBirth(profile.date_of_birth || '');
      setGender(profile.gender || '');
      setOccupation(profile.occupation || '');
      setHeightCm(profile.height_cm ? String(profile.height_cm) : '');
      setWeightKg(profile.weight_kg ? String(profile.weight_kg) : '');
      setBloodGroup(profile.blood_group || '');
      setMedicalConditions(profile.medical_conditions || '');
      setAllergies(profile.allergies || '');
      setMedications(profile.medications || '');
      setChronicConditions(profile.chronic_conditions || '');
      setSmokingStatus(profile.smoking_status || '');
      setAlcoholStatus(profile.alcohol_status || '');
      setWorkingHours(profile.working_hours || '');
      setFoodPreference(profile.food_preference || '');
      setCalorieGoal(profile.calorie_goal ? String(profile.calorie_goal) : '');
      setFitnessGoal(profile.fitness_goal || '');
      setActivityLevel(profile.activity_level || '');
      setStepGoal(profile.step_goal ? String(profile.step_goal) : '');
      setWaterGoal(profile.water_goal ? String(profile.water_goal) : '');
      setEmergencyName(profile.emergency_contact_name || '');
      setEmergencyPhone(profile.emergency_contact_phone || '');
      setEmergencyRelation(profile.emergency_contact_relation || '');
    }
  }, [profile]);

  // Calculated values
  const calculateAge = (dob?: string): string => {
    if (dob && dob.trim() !== '') {
      const d = new Date(dob);
      if (!isNaN(d.getTime())) {
        const calculated = new Date().getFullYear() - d.getFullYear();
        if (calculated > 0) return `${calculated} yrs`;
      }
    }
    if (profile?.age && profile.age > 0) {
      return `${profile.age} yrs`;
    }
    return '—';
  };

  const hNum = Number(heightCm);
  const wNum = Number(weightKg);
  const bmiValue = hNum > 0 && wNum > 0 ? (wNum / Math.pow(hNum / 100, 2)).toFixed(1) : '—';

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    try {
      setSaving(true);
      const calcAgeNum = dateOfBirth.trim() 
        ? new Date().getFullYear() - new Date(dateOfBirth.trim()).getFullYear() 
        : (profile?.age || null);

      const updates = {
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth.trim() || (null as any),
        age: calcAgeNum && !isNaN(calcAgeNum) && calcAgeNum > 0 ? calcAgeNum : (null as any),
        gender: gender.trim() || (null as any),
        occupation: occupation.trim() || (null as any),
        height_cm: heightCm ? Number(heightCm) : (null as any),
        weight_kg: weightKg ? Number(weightKg) : (null as any),
        bmi: bmiValue !== '—' ? Number(bmiValue) : (null as any),
        blood_group: bloodGroup || (null as any),
        medical_conditions: medicalConditions.trim() || (null as any),
        allergies: allergies.trim() || (null as any),
        medications: medications.trim() || (null as any),
        chronic_conditions: chronicConditions.trim() || (null as any),
        smoking_status: smokingStatus.trim() || (null as any),
        alcohol_status: alcoholStatus.trim() || (null as any),
        working_hours: workingHours.trim() || (null as any),
        food_preference: foodPreference.trim() || (null as any),
        dietary_preferences: foodPreference.trim() || (null as any),
        calorie_goal: calorieGoal ? Number(calorieGoal) : (null as any),
        fitness_goal: fitnessGoal.trim() || (null as any),
        activity_level: activityLevel.trim() || (null as any),
        step_goal: stepGoal ? Number(stepGoal) : (null as any),
        water_goal: waterGoal ? Number(waterGoal) : (null as any),
        emergency_contact_name: emergencyName.trim() || (null as any),
        emergency_contact_phone: emergencyPhone.trim() || (null as any),
        emergency_contact_relation: emergencyRelation.trim() || (null as any),
      };

      const { error } = await updateProfile(updates);

      if (!error) {
        await refreshProfile();
        Alert.alert('Profile Saved ✓', 'Your health profile has been saved to database.');
      } else {
        Alert.alert('Save Failed', error.message || 'Failed to save profile to database.');
      }
    } catch (e: any) {
      Alert.alert('Save Error', e.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectBloodGroup = async (bg: string) => {
    setBloodGroup(bg);
    setShowBloodDropdown(false);
    if (profile?.id) {
      setSaving(true);
      const { error } = await updateProfile({ blood_group: bg });
      if (!error) {
        await refreshProfile();
      } else {
        Alert.alert('Save Error', error.message || 'Failed to save blood group.');
      }
      setSaving(false);
    }
  };

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

  const sectionLabelSize = isCareMode ? 14 : 12;

  const renderBloodGroupSelectField = () => (
    <View style={{ marginBottom: 12 }}>
      <Text style={[{ fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 }, isCareMode && { fontSize: 14 }]}>
        Blood Group
      </Text>
      <TouchableOpacity
        testID="profile_blood_group_dropdown"
        accessibilityLabel="profile_blood_group_dropdown"
        style={[
          styles.dropdownInput,
          {
            backgroundColor: colors.inputBg || colors.cardBg,
            borderColor: colors.inputBorder || colors.cardBorder,
          }
        ]}
        onPress={() => setShowBloodDropdown(true)}
        activeOpacity={0.7}
      >
        <Text testID="profile_blood_group_value" accessibilityLabel="profile_blood_group_value" style={[styles.dropdownValueText, { color: bloodGroup ? colors.text : colors.textMuted }]}>
          {bloodGroup ? bloodGroup : 'Select Blood Group'}
        </Text>
        <ChevronDown size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper title="My Profile" subtitle="Personal health profile & biometrics">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text, fontSize: isCareMode ? 24 : 20 }]}>
              My Profile
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: isCareMode ? 13 : 11 }]}>
              Your personal information and health data
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.headerSettingsBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('SettingsDetail')}
          >
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Quick stat cards - 3rd Card (BLOOD) is now interactive dropdown trigger! */}
        <View style={styles.statGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ color: colors.textMuted, fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 }}>AGE</Text>
            <Text style={{ color: colors.primary, fontSize: 15, fontWeight: 'bold', marginTop: 3 }}>{calculateAge(dateOfBirth)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ color: colors.textMuted, fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 }}>BMI</Text>
            <Text style={{ color: colors.success, fontSize: 15, fontWeight: 'bold', marginTop: 3 }}>{bmiValue}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: colors.cardBg, borderColor: bloodGroup ? colors.primary : colors.cardBorder }
            ]}
            onPress={() => setShowBloodDropdown(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.textMuted, fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 }}>BLOOD</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 }}>
              <Text style={{ color: bloodGroup ? colors.primary : colors.text, fontSize: 15, fontWeight: 'bold' }}>
                {bloodGroup || 'Select'}
              </Text>
              <ChevronDown size={14} color={bloodGroup ? colors.primary : colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section tab pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 14 }}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 0 }}
        >
          {SECTIONS.map(sec => (
            <TouchableOpacity
              key={sec.id}
              onPress={() => {
                if (sec.id === 'settings') {
                  navigation.navigate('SettingsDetail');
                } else {
                  setActiveSection(sec.id);
                }
              }}
              style={[
                styles.sectionPill,
                {
                  backgroundColor: activeSection === sec.id && sec.id !== 'settings' ? colors.primary : colors.cardBg,
                  borderColor: activeSection === sec.id && sec.id !== 'settings' ? colors.primary : colors.cardBorder,
                },
              ]}
            >
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: activeSection === sec.id && sec.id !== 'settings' ? '#fff' : colors.textMuted }}>
                {sec.emoji} {sec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Personal */}
        {activeSection === 'personal' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Personal Information</Text>
            <CustomTextInput testID="profile_name_input" accessibilityLabel="profile_name_input" label="Full Name" value={fullName} onChangeText={setFullName} containerStyle={styles.field} />
            <CustomTextInput testID="profile_dob_input" accessibilityLabel="profile_dob_input" label="Date of Birth (YYYY-MM-DD)" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="e.g. 1998-05-24" containerStyle={styles.field} />
            <CustomTextInput testID="profile_gender_input" accessibilityLabel="profile_gender_input" label="Gender" value={gender} onChangeText={setGender} placeholder="e.g. Male / Female / Non-binary" containerStyle={styles.field} />
            
            {/* Blood Group Select Field */}
            {renderBloodGroupSelectField()}

            <CustomTextInput testID="profile_occupation_input" accessibilityLabel="profile_occupation_input" label="Occupation" value={occupation} onChangeText={setOccupation} placeholder="e.g. Software Engineer" containerStyle={styles.field} />
          </View>
        )}

        {/* Body */}
        {activeSection === 'body' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Body Measurements</Text>
            
            {/* Blood Group Select Field */}
            {renderBloodGroupSelectField()}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <CustomTextInput testID="profile_height_input" accessibilityLabel="profile_height_input" label="Height (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" placeholder="e.g. 175" />
              </View>
              <View style={{ flex: 1 }}>
                <CustomTextInput testID="profile_weight_input" accessibilityLabel="profile_weight_input" label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" placeholder="e.g. 70" />
              </View>
            </View>
            {bmiValue !== '—' && (
              <View style={[styles.bmiBox, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: 'bold' }}>CALCULATED BMI</Text>
                <Text style={{ color: colors.primary, fontSize: 22, fontWeight: 'bold', marginTop: 2 }}>{bmiValue}</Text>
              </View>
            )}
          </View>
        )}

        {/* Medical */}
        {activeSection === 'medical' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Medical & Health</Text>
            
            {/* Blood Group Select Field */}
            {renderBloodGroupSelectField()}

            <CustomTextInput label="Medical Conditions" value={medicalConditions} onChangeText={setMedicalConditions} placeholder="e.g. Diabetes, Hypertension" containerStyle={styles.field} />
            <CustomTextInput label="Current Medications" value={medications} onChangeText={setMedications} placeholder="e.g. Metformin 500mg" containerStyle={styles.field} />
            <CustomTextInput label="Allergies" value={allergies} onChangeText={setAllergies} placeholder="e.g. Dust, Pollen, Shellfish" containerStyle={styles.field} />
            <CustomTextInput label="Chronic Conditions" value={chronicConditions} onChangeText={setChronicConditions} placeholder="e.g. Asthma, Arthritis" containerStyle={styles.field} />
          </View>
        )}

        {/* Lifestyle */}
        {activeSection === 'lifestyle' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Lifestyle</Text>
            <CustomTextInput label="Smoking Status" value={smokingStatus} onChangeText={setSmokingStatus} placeholder="e.g. Never / Former / Occasional" containerStyle={styles.field} />
            <CustomTextInput label="Alcohol Consumption" value={alcoholStatus} onChangeText={setAlcoholStatus} placeholder="e.g. Never / Rarely / Moderate" containerStyle={styles.field} />
            <CustomTextInput label="Daily Working Hours" value={workingHours} onChangeText={setWorkingHours} placeholder="e.g. 8 hours / 9am–6pm" containerStyle={styles.field} />
          </View>
        )}

        {/* Nutrition */}
        {activeSection === 'nutrition' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Nutrition</Text>
            <CustomTextInput label="Diet Preference" value={foodPreference} onChangeText={setFoodPreference} placeholder="e.g. Vegetarian, Vegan, Omnivore" containerStyle={styles.field} />
            <CustomTextInput label="Daily Calorie Target (kcal)" value={calorieGoal} onChangeText={setCalorieGoal} keyboardType="numeric" placeholder="e.g. 2000" containerStyle={styles.field} />
          </View>
        )}

        {/* Fitness */}
        {activeSection === 'fitness' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Fitness</Text>
            <CustomTextInput label="Fitness Goal" value={fitnessGoal} onChangeText={setFitnessGoal} placeholder="e.g. Weight Loss, Muscle Gain" containerStyle={styles.field} />
            <CustomTextInput label="Activity Level" value={activityLevel} onChangeText={setActivityLevel} placeholder="e.g. Sedentary, Moderately Active" containerStyle={styles.field} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <CustomTextInput label="Daily Step Goal" value={stepGoal} onChangeText={setStepGoal} keyboardType="numeric" placeholder="10000" />
              </View>
              <View style={{ flex: 1 }}>
                <CustomTextInput label="Water Goal (ml)" value={waterGoal} onChangeText={setWaterGoal} keyboardType="numeric" placeholder="2500" />
              </View>
            </View>
          </View>
        )}

        {/* Emergency */}
        {activeSection === 'emergency' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Emergency Contact</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 10 }}>
              This information may be used in critical health situations.
            </Text>
            <CustomTextInput label="Contact Name" value={emergencyName} onChangeText={setEmergencyName} placeholder="e.g. Jane Doe" containerStyle={styles.field} />
            <CustomTextInput label="Phone Number" value={emergencyPhone} onChangeText={setEmergencyPhone} placeholder="+91 98765 43210" containerStyle={styles.field} />
            <CustomTextInput label="Relationship" value={emergencyRelation} onChangeText={setEmergencyRelation} placeholder="e.g. Spouse, Parent, Friend" containerStyle={styles.field} />
          </View>
        )}

        {/* Save button */}
        <TouchableOpacity
          testID="profile_save_btn"
          accessibilityLabel="profile_save_btn"
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Save Profile</Text>
          }
        </TouchableOpacity>

        {/* Settings & Logout Quick Actions */}
        <View style={{ marginTop: 10, gap: 10 }}>
          <TouchableOpacity
            testID="profile_settings_btn"
            accessibilityLabel="profile_settings_btn"
            style={[styles.settingsBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('SettingsDetail')}
          >
            <Text style={[styles.settingsBtnText, { color: colors.text }]}>⚙️ App Settings & Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="profile_logout_btn"
            accessibilityLabel="profile_logout_btn"
            style={[styles.signOutBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
            onPress={handleSignOut}
          >
            <Text style={[styles.signOutBtnText, { color: colors.primary }]}>🚪 Log Out Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Blood Group Selection Dropdown Modal */}
      <Modal
        visible={showBloodDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBloodDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBloodDropdown(false)}
        >
          <View
            style={[
              styles.dropdownMenu,
              { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }
            ]}
          >
            <View style={[styles.dropdownHeader, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.dropdownTitle, { color: colors.text }]}>Select Blood Group</Text>
              <TouchableOpacity testID="profile_blood_modal_close" accessibilityLabel="profile_blood_modal_close" onPress={() => setShowBloodDropdown(false)} style={{ padding: 4 }}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  testID={`profile_blood_item_${bg.replace('+', 'pos').replace('-', 'neg')}`}
                  accessibilityLabel={`profile_blood_item_${bg.replace('+', 'pos').replace('-', 'neg')}`}
                  style={[
                    styles.dropdownOption,
                    { borderBottomColor: colors.cardBorder },
                    bloodGroup === bg && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => handleSelectBloodGroup(bg)}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    { color: colors.text },
                    bloodGroup === bg && { color: colors.primary, fontWeight: 'bold' }
                  ]}>
                    {bg}
                  </Text>
                  {bloodGroup === bg && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerSettingsBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  title: { fontWeight: 'bold' },
  subtitle: { marginTop: 2 },
  statGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  sectionPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  sectionBox: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 10 },
  field: { marginBottom: 10 },
  label: { fontWeight: 'bold' },
  bmiBox: { marginTop: 12, marginBottom: 12, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  dropdownInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  dropdownValueText: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownMenu: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 15,
  },
  saveBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 6, marginBottom: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  settingsBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  settingsBtnText: { fontWeight: 'bold', fontSize: 14 },
  signOutBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, marginBottom: 14 },
  signOutBtnText: { fontWeight: 'bold', fontSize: 15 },
});
