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
import { validateEmail } from '../../utils/validation';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';
import { Mail, Lock, AlertCircle, ArrowLeft, Sun, Moon, Eye, EyeOff } from 'lucide-react-native';
import { CustomTextInput } from '../../components/CustomTextInput';

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalVisible, setForgotModalVisible] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.message || 'Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(email.trim(), password);

      if (error) {
        console.error('Login error:', error);
        if (error.message?.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message?.includes('Network request failed')) {
          setErrorMessage('Network Request Failed: Unable to connect to Supabase backend.');
        } else {
          setErrorMessage(error.message || 'Failed to sign in.');
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'An unexpected error occurred during sign in.');
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
            <Text style={styles.brandTitle}>VitaCore AI</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Your AI-Powered Precision Health Twin
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Sign In</Text>

            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color="#ef4444" style={styles.errorIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorTitle}>Authentication Error</Text>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              </View>
            )}

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
              label="Password"
              labelRight={
                <TouchableOpacity onPress={() => setForgotModalVisible(true)}>
                  <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot?</Text>
                </TouchableOpacity>
              }
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
              containerStyle={styles.inputGroup}
            />

            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.rememberText, { color: colors.textMuted }]}>Remember me on this device</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.linkText, { color: colors.primary }]}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ForgotPasswordModal
        visible={forgotModalVisible}
        onClose={() => setForgotModalVisible(false)}
      />
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
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3b82f6',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
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
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 13,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
