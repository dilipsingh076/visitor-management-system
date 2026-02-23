/**
 * Check-in screen - clean, touch-friendly OTP flow
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { apiClient } from '../config/api';
import { API } from '../lib/api/endpoints';
import { theme } from '../theme';

const { colors, spacing, borderRadius, shadow, fontSize } = theme;

export default function CheckInScreen() {
  const [otp, setOtp] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }
    if (!consent) {
      Alert.alert('Consent Required', 'Please agree to data collection (DPDP Act 2023) to check in.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post(API.checkin.otp, { otp, consent_given: consent });
      if (res.data) {
        Alert.alert('Success', 'Check-in completed successfully!');
        setOtp('');
      } else {
        Alert.alert('Error', res.error || 'Check-in failed');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQR = () => {
    Alert.alert('Coming Soon', 'QR scanner will be available in the next update.');
  };

  const isValid = otp.length === 6 && consent;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scan QR Code</Text>
            <TouchableOpacity
              style={styles.qrBox}
              onPress={handleQR}
              activeOpacity={0.8}>
              <View style={styles.qrIconWrap}>
                <Text style={styles.qrIcon}>📷</Text>
              </View>
              <Text style={styles.qrTitle}>Tap to scan</Text>
              <Text style={styles.qrHint}>QR scanner coming soon</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enter OTP</Text>
            <Text style={styles.sectionHint}>6-digit code shared by your host</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor={colors.mutedForeground}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
              selectTextOnFocus
            />
            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => setConsent(!consent)}
              activeOpacity={0.7}>
              <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
                {consent && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.consentText}>
                I consent to data collection for this visit (DPDP Act 2023)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                loading && styles.btnDisabled,
                isValid && styles.btnActive,
              ]}
              onPress={handleCheckIn}
              disabled={loading || !isValid}
              activeOpacity={0.85}>
              <Text style={[styles.btnText, isValid && styles.btnTextActive]}>
                {loading ? 'Processing...' : 'Check In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  qrBox: {
    height: 200,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  qrIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  qrIcon: { fontSize: 32 },
  qrTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  qrHint: { fontSize: fontSize.sm, color: colors.mutedForeground },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
    color: colors.foreground,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: colors.border,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: colors.primary },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: colors.muted,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  btnTextActive: { color: '#FFFFFF' },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  consentText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: 20,
  },
});
