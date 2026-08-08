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
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomTextInput } from '../../components/CustomTextInput';

type SectionId = 'personal' | 'body' | 'medical' | 'lifestyle' | 'nutrition' | 'fitness' | 'emergency';

const SECTIONS: { id: SectionId; label: string; emoji: string }[] = [
  { id: 'personal',  label: 'Personal',       emoji: '👤' },
  { id: 'body',      label: 'Body',            emoji: '⚖️' },
  { id: 'medical',   label: 'Medical',         emoji: '🩺' },
  { id: 'lifestyle', label: 'Lifestyle',       emoji: '🌿' },
  { id: 'nutrition', label: 'Nutrition',       emoji: '🥗' },
  { id: 'fitness',   label: 'Fitness',         emoji: '💪' },
  { id: 'emergency', label: 'Emergency',       emoji: '🆘' },
];

export default function ProfileScreen({ navigation }: any) {
  const { profile, updateProfile, refreshProfile } = useAuth();
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
    if (!dob || dob.trim() === '') return '—';
    const d = new Date(dob);
    if (isNaN(d.getTime())) return '—';
    const age = new Date().getFullYear() - d.getFullYear();
    return age > 0 ? `${age} yrs` : '—';
  };

  const hNum = Number(heightCm);
  const wNum = Number(weightKg);
  const bmiValue = hNum > 0 && wNum > 0 ? (wNum / Math.pow(hNum / 100, 2)).toFixed(1) : '—';

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    try {
      setSaving(true);
      const { error } = await updateProfile({
        full_name: fullName,
        date_of_birth: dateOfBirth || null as any,
        gender: gender || null as any,
        occupation: occupation || null as any,
        height_cm: Number(heightCm) || null as any,
        weight_kg: Number(weightKg) || null as any,
        bmi: bmiValue !== '—' ? Number(bmiValue) : null as any,
        blood_group: bloodGroup || null as any,
        medical_conditions: medicalConditions || null as any,
        allergies: allergies || null as any,
        medications: medications || null as any,
        chronic_conditions: chronicConditions || null as any,
        smoking_status: smokingStatus || null as any,
        alcohol_status: alcoholStatus || null as any,
        working_hours: workingHours || null as any,
        food_preference: foodPreference || null as any,
        calorie_goal: Number(calorieGoal) || null as any,
        fitness_goal: fitnessGoal || null as any,
        activity_level: activityLevel || null as any,
        step_goal: Number(stepGoal) || null as any,
        water_goal: Number(waterGoal) || null as any,
        emergency_contact_name: emergencyName || null as any,
        emergency_contact_phone: emergencyPhone || null as any,
        emergency_contact_relation: emergencyRelation || null as any,
      });

      if (!error) {
        await refreshProfile();
        Alert.alert('Profile Saved ✓', 'Your health profile has been updated.');
      } else {
        Alert.alert('Error', error.message || 'Failed to save profile.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectBloodGroup = async (bg: string) => {
    setBloodGroup(bg);
    if (profile?.id) {
      await updateProfile({ blood_group: bg });
    }
  };

  const sectionLabelSize = isCareMode ? 14 : 12;
  const inputFontSize = isCareMode ? 15 : 13;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: isCareMode ? 24 : 20 }]}>
            My Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: isCareMode ? 13 : 11 }]}>
            Your personal information and health data
          </Text>
        </View>

        {/* Quick stat cards */}
        <View style={styles.statGrid}>
          {[
            { label: 'AGE', value: calculateAge(dateOfBirth), color: colors.primary },
            { label: 'BMI', value: bmiValue, color: colors.success },
            { label: 'BLOOD', value: bloodGroup || '—', color: colors.text },
          ].map(({ label, value, color }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Text style={{ color: colors.textMuted, fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 }}>{label}</Text>
              <Text style={{ color, fontSize: 15, fontWeight: 'bold', marginTop: 3 }}>{value}</Text>
            </View>
          ))}
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
              onPress={() => setActiveSection(sec.id)}
              style={[
                styles.sectionPill,
                {
                  backgroundColor: activeSection === sec.id ? colors.primary : colors.cardBg,
                  borderColor: activeSection === sec.id ? colors.primary : colors.cardBorder,
                },
              ]}
            >
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: activeSection === sec.id ? '#fff' : colors.textMuted }}>
                {sec.emoji} {sec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Personal */}
        {activeSection === 'personal' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Personal Information</Text>
            <CustomTextInput label="Full Name" value={fullName} onChangeText={setFullName} containerStyle={styles.field} />
            <CustomTextInput label="Date of Birth (YYYY-MM-DD)" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="e.g. 1998-05-24" containerStyle={styles.field} />
            <CustomTextInput label="Gender" value={gender} onChangeText={setGender} placeholder="e.g. Male / Female / Non-binary" containerStyle={styles.field} />
            <CustomTextInput label="Occupation" value={occupation} onChangeText={setOccupation} placeholder="e.g. Software Engineer" containerStyle={styles.field} />
          </View>
        )}

        {/* Body */}
        {activeSection === 'body' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Body Measurements</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <CustomTextInput label="Height (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" placeholder="e.g. 175" />
              </View>
              <View style={{ flex: 1 }}>
                <CustomTextInput label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" placeholder="e.g. 70" />
              </View>
            </View>
            {bmiValue !== '—' && (
              <View style={[styles.bmiBox, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: 'bold' }}>CALCULATED BMI</Text>
                <Text style={{ color: colors.primary, fontSize: 22, fontWeight: 'bold', marginTop: 2 }}>{bmiValue}</Text>
              </View>
            )}
            {/* Blood Group pills */}
            <Text style={[styles.label, { color: colors.text, marginTop: 14, fontSize: sectionLabelSize }]}>Blood Group</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.bloodChip,
                    { backgroundColor: bloodGroup === bg ? colors.primary : colors.surface, borderColor: bloodGroup === bg ? colors.primary : colors.cardBorder },
                  ]}
                  onPress={() => handleSelectBloodGroup(bg)}
                >
                  <Text style={{ color: bloodGroup === bg ? '#fff' : colors.text, fontWeight: 'bold', fontSize: 13 }}>{bg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Medical */}
        {activeSection === 'medical' && (
          <View style={[styles.sectionBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: sectionLabelSize }]}>Medical & Health</Text>
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
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Save Profile</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 14 },
  title: { fontWeight: 'bold' },
  subtitle: { marginTop: 2 },
  statGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  sectionPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  sectionBox: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 10 },
  field: { marginBottom: 10 },
  label: { fontWeight: 'bold' },
  bmiBox: { marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  bloodChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', minWidth: 44 },
  saveBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 6, marginBottom: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
