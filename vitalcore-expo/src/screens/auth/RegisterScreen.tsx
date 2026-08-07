import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { validateEmail, validatePassword, evaluatePassword } from '../../utils/validation';
import { User, Mail, Lock, AlertCircle, ArrowLeft, Sun, Moon, Check, X, Eye, EyeOff, Calendar } from 'lucide-react-native';
import { CustomTextInput } from '../../components/CustomTextInput';

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const pStrength = evaluatePassword(password);

  const handleRegister = async () => {
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Username is required.');
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.message || 'Please enter a valid email address.');
      return;
    }

    if (!dateOfBirth.trim()) {
      setErrorMessage('Date of Birth is required.');
      return;
    }

    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dateOfBirth.trim())) {
      setErrorMessage('Date of Birth must be in YYYY-MM-DD format (e.g. 1998-05-24).');
      return;
    }

    const dobDate = new Date(dateOfBirth.trim());
    if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
      setErrorMessage('Please enter a valid Date of Birth in the past.');
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      setErrorMessage(passCheck.message || 'Password does not meet security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter confirm password.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signUp(
        email.trim(),
        password,
        fullName.trim(),
        username.trim(),
        dateOfBirth.trim()
      );

      if (error) {
        console.error('Registration error:', error);
        if (error.message?.includes('User already registered')) {
          setErrorMessage('An account with this email address already exists.');
        } else if (error.message?.includes('Network request failed')) {
          setErrorMessage('Network Request Failed: Unable to connect to Supabase backend.');
        } else {
          setErrorMessage(error.message || 'Registration failed. Please try again.');
        }
      }
    } catch (e: any) {
      console.error('Register catch exception:', e);
      setErrorMessage(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Intro')}
        >
          <ArrowLeft size={16} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}> Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: colors.surface }]}
          onPress={toggleTheme}
        >
          {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.brandTitle}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Join VitalCore AI & initialize your digital twin
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color="#ef4444" style={styles.errorIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorTitle}>Validation / Registration Error</Text>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              </View>
            )}

            <CustomTextInput
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChangeText={(val) => {
                setFullName(val);
                setErrorMessage('');
              }}
              leftIcon={<User size={18} color={colors.textMuted} />}
              containerStyle={styles.inputGroup}
            />

            <CustomTextInput
              label="Username"
              placeholder="johndoe"
              value={username}
              onChangeText={(val) => {
                setUsername(val.toLowerCase());
                setErrorMessage('');
              }}
              autoCapitalize="none"
              leftIcon={<User size={18} color={colors.textMuted} />}
              containerStyle={styles.inputGroup}
            />

            <CustomTextInput
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                setErrorMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.textMuted} />}
              containerStyle={styles.inputGroup}
            />

            <CustomTextInput
              label="Date of Birth *"
              placeholder="YYYY-MM-DD (e.g. 1998-05-24)"
              value={dateOfBirth}
              onChangeText={(val) => {
                setDateOfBirth(val);
                setErrorMessage('');
              }}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              leftIcon={<Calendar size={18} color={colors.textMuted} />}
              containerStyle={styles.inputGroup}
            />

            <View style={styles.inputGroup}>
              <CustomTextInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                leftIcon={<Lock size={18} color={colors.textMuted} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                    {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                  </TouchableOpacity>
                }
              />

              {/* Password Strength Gauge */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthHeader}>
                    <Text style={styles.strengthTextLabel}>Strength: </Text>
                    <Text style={[styles.strengthTextValue, { color: pStrength.color }]}>
                      {pStrength.label}
                    </Text>
                  </View>
                  <View style={styles.strengthBarBg}>
                    <View
                      style={[
                        styles.strengthBarFill,
                        {
                          width: `${(pStrength.score / 5) * 100}%`,
                          backgroundColor: pStrength.color,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.criteriaGrid}>
                    <View style={styles.criteriaItem}>
                      {pStrength.hasMinLength ? <Check size={12} color="#10b981" /> : <X size={12} color="#64748b" />}
                      <Text style={[styles.criteriaText, pStrength.hasMinLength && styles.criteriaMet]}>8+ chars</Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      {pStrength.hasUppercase ? <Check size={12} color="#10b981" /> : <X size={12} color="#64748b" />}
                      <Text style={[styles.criteriaText, pStrength.hasUppercase && styles.criteriaMet]}>ABC</Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      {pStrength.hasLowercase ? <Check size={12} color="#10b981" /> : <X size={12} color="#64748b" />}
                      <Text style={[styles.criteriaText, pStrength.hasLowercase && styles.criteriaMet]}>abc</Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      {pStrength.hasNumber ? <Check size={12} color="#10b981" /> : <X size={12} color="#64748b" />}
                      <Text style={[styles.criteriaText, pStrength.hasNumber && styles.criteriaMet]}>123</Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      {pStrength.hasSpecialChar ? <Check size={12} color="#10b981" /> : <X size={12} color="#64748b" />}
                      <Text style={[styles.criteriaText, pStrength.hasSpecialChar && styles.criteriaMet]}>!@#</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <CustomTextInput
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                setErrorMessage('');
              }}
              secureTextEntry={!showConfirmPassword}
              leftIcon={<Lock size={18} color={colors.textMuted} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                  {showConfirmPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                </TouchableOpacity>
              }
              containerStyle={styles.inputGroup}
            />

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.linkText, { color: colors.primary }]}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeBtn: {
    padding: 8,
    borderRadius: 20,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  errorIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  errorTitle: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  strengthTextLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  strengthTextValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  strengthBarBg: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthBarFill: {
    height: '100%',
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criteriaText: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 4,
  },
  criteriaMet: {
    color: '#10b981',
    fontWeight: '600',
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
