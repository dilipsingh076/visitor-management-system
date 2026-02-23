/**
 * Walk-in Registration Screen for guards.
 * Quick form to register unexpected visitors.
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {Input, Button, Card} from '../components/ui';
import {apiClient} from '../config/api';

interface WalkInScreenProps {
  navigation: any;
}

export default function WalkInScreen({navigation}: WalkInScreenProps) {
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    flat_number: '',
    purpose: '',
    id_type: 'aadhar',
    id_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<{otp: string; id: string} | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.visitor_name.trim()) {
      newErrors.visitor_name = 'Name is required';
    }

    if (!formData.visitor_phone.trim()) {
      newErrors.visitor_phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.visitor_phone)) {
      newErrors.visitor_phone = 'Enter a valid 10-digit phone number';
    }

    if (!formData.flat_number.trim()) {
      newErrors.flat_number = 'Flat number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient.post<{visit_id: string; otp: string}>(
        '/visitors/walkin',
        formData,
      );

      if (response.data) {
        setSuccess({
          otp: response.data.otp,
          id: response.data.visit_id,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register walk-in');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      visitor_name: '',
      visitor_phone: '',
      flat_number: '',
      purpose: '',
      id_type: 'aadhar',
      id_number: '',
    });
    setSuccess(null);
    setErrors({});
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Walk-in Registered!</Text>
        <Text style={styles.successSubtitle}>
          Waiting for resident approval
        </Text>

        <Card style={styles.otpCard}>
          <Text style={styles.otpLabel}>Entry OTP</Text>
          <Text style={styles.otpValue}>{success.otp}</Text>
          <Text style={styles.otpHint}>
            Use this OTP to check in after approval
          </Text>
        </Card>

        <View style={styles.successActions}>
          <Button
            title="Register Another"
            onPress={handleReset}
            style={styles.actionButton}
          />
          <Button
            title="Back to Dashboard"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🚶</Text>
          <Text style={styles.title}>Walk-in Registration</Text>
          <Text style={styles.subtitle}>
            Register unexpected visitors for resident approval
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Visitor Name *</Text>
            <Input
              placeholder="Enter full name"
              value={formData.visitor_name}
              onChangeText={(text) =>
                setFormData({...formData, visitor_name: text})
              }
              error={errors.visitor_name}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <Input
              placeholder="10-digit phone number"
              value={formData.visitor_phone}
              onChangeText={(text) =>
                setFormData({...formData, visitor_phone: text.replace(/\D/g, '').slice(0, 10)})
              }
              keyboardType="phone-pad"
              error={errors.visitor_phone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Visiting Flat Number *</Text>
            <Input
              placeholder="e.g., 101, A-201"
              value={formData.flat_number}
              onChangeText={(text) =>
                setFormData({...formData, flat_number: text})
              }
              error={errors.flat_number}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Purpose of Visit</Text>
            <Input
              placeholder="e.g., Delivery, Plumber, Guest"
              value={formData.purpose}
              onChangeText={(text) =>
                setFormData({...formData, purpose: text})
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Number (Optional)</Text>
            <Input
              placeholder="Aadhar / DL / Other ID"
              value={formData.id_number}
              onChangeText={(text) =>
                setFormData({...formData, id_number: text})
              }
            />
          </View>

          {/* DPDP Consent */}
          <View style={styles.consentContainer}>
            <Text style={styles.consentText}>
              ⚖️ By registering, the visitor consents to data collection as per
              DPDP Act 2023. Data will be used only for visitor management.
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            title={loading ? 'Registering...' : 'Register Walk-in'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  consentContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  consentText: {
    fontSize: theme.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  successEmoji: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  successTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  successSubtitle: {
    fontSize: theme.fontSize.md,
    color: colors.warning,
    marginBottom: theme.spacing.xl,
  },
  otpCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  otpLabel: {
    fontSize: theme.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  otpValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 8,
    marginBottom: theme.spacing.sm,
  },
  otpHint: {
    fontSize: theme.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  successActions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});
