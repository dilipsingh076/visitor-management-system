/**
 * Invite Visitor - pre-approve visitors with OTP
 */
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {Screen, Text} from '../components/ui';

const {spacing, borderRadius, fontSize} = theme;

export default function VisitorInviteScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ otp: string; qr_code?: string } | null>(null);

  const handleInvite = async () => {
    if (!name.trim()) {
      setError('Please enter visitor name');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post<{ otp: string; qr_code?: string }>(
        API.visitors.invite,
        {
          visitor_name: name.trim(),
          visitor_phone: phone.replace(/\D/g, '').slice(0, 10),
          purpose: purpose.trim() || undefined,
        }
      );
      if (res.data) {
        setResult(res.data);
      } else {
        setError(res.error || 'Failed to create invitation');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setName('');
    setPhone('');
    setPurpose('');
    setError('');
  };

  const handleOpenQrInBrowser = () => {
    if (!result?.qr_code) {
      return;
    }
    // Use web QR widget we added at /qr/[code]
    const encoded = encodeURIComponent(result.qr_code);
    const url = `http://localhost:3000/qr/${encoded}`;
    Linking.openURL(url).catch(() => {
      setError('Could not open QR in browser. Please open the web app at /qr manually.');
    });
  };

  if (result) {
    return (
      <Screen scroll>
        <View style={styles.successCard}>
          <View style={styles.successIconWrap}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text variant="title" style={styles.successTitle}>
            Invitation created!
          </Text>
          <Text muted style={styles.successDesc}>
            Share this OTP with your visitor:
          </Text>
          <View style={styles.otpBox}>
            <Text style={styles.otpText}>{result.otp}</Text>
          </View>
          {result.qr_code && (
            <>
              <Text muted style={styles.successDesc}>
                Or share/open this QR link in your browser:
              </Text>
              <TouchableOpacity
                style={styles.qrLinkButton}
                onPress={handleOpenQrInBrowser}
                activeOpacity={0.85}>
                <Text variant="label" style={styles.qrLinkText}>
                  Open QR Code in Browser
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.btn} onPress={handleReset} activeOpacity={0.85}>
            <Text variant="label" style={styles.btnText}>
              Invite another
            </Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text variant="title">Invite Visitor</Text>
            <Text variant="body" muted>
              Pre-approve visitors. They'll receive an OTP for check-in.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text variant="caption" style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text variant="label" style={styles.label}>
              Visitor name *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
            />

            <Text variant="label" style={styles.label}>
              Phone (10 digits) *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor={colors.mutedForeground}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Text variant="label" style={styles.label}>
              Purpose (optional)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Meeting, delivery, etc."
              placeholderTextColor={colors.mutedForeground}
              value={purpose}
              onChangeText={setPurpose}
            />

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleInvite}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text variant="label" style={styles.btnText}>
                  Create Invitation
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'transparent'},
  scrollContent: {padding: spacing.lg, paddingBottom: spacing.xxl},
  header: { marginBottom: spacing.xl },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.muted,
    lineHeight: 24,
  },
  errorBox: {
    padding: spacing.md,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    fontWeight: '500',
  },
  form: { gap: 0 },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.foreground,
  },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: { fontSize: 32, color: '#fff', fontWeight: '700' },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  successDesc: {
    fontSize: fontSize.md,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  otpBox: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    minWidth: 160,
    alignItems: 'center',
  },
  otpText: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 6,
    color: colors.success,
  },
  qrLinkButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrLinkText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
});
