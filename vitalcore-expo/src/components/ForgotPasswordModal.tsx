import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Mail, X, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { validateEmail } from '../utils/validation';
import { CustomTextInput } from './CustomTextInput';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ visible, onClose }: ForgotPasswordModalProps) {
  const { resetPassword } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async () => {
    setErrorMsg('');
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setErrorMsg(emailVal.message || 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await resetPassword(email.trim());
      if (error) {
        setErrorMsg(error.message || 'Failed to send password reset email.');
      } else {
        setSent(true);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSent(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {sent ? (
            <View style={styles.contentCenter}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={36} color="#10b981" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Reset Link Sent!</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                We have sent instructions to {email}. Please check your inbox and follow the link to reset your password.
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={handleClose}
              >
                <Text style={styles.primaryBtnText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Enter the email address registered with your VitalCore AI account, and we will send you a password reset link.
              </Text>

              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <CustomTextInput
                label="Registered Email"
                placeholder="user@example.com"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setErrorMsg('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon={<Mail size={18} color={colors.textMuted} />}
                containerStyle={styles.inputGroup}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, loading && styles.disabledBtn]}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  contentCenter: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
