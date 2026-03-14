import React, {useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {Input, Button, Screen, Text} from '../components/ui';
import {theme} from '../theme';
import {colors} from '../theme/colors';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      // Backend currently does not expose a dedicated forgot-password endpoint.
      // We show a friendly message so users know what to expect.
      setMessage(
        'If password reset is enabled for your account, you will receive further instructions on your registered email address.',
      );
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
            <Text variant="title">Forgot Password</Text>
            <Text variant="body" muted>
              Enter the email you use to sign in. We&apos;ll let you know how to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Text variant="label">Email *</Text>
          <Input
            placeholder="you@example.com"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setError('');
              setMessage('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

            {error ? (
              <View style={styles.errorContainer}>
                <Text variant="caption" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            {message ? (
              <View style={styles.infoContainer}>
                <Text variant="caption" style={styles.infoText}>
                  {message}
                </Text>
              </View>
            ) : null}

            <Button
              title={submitting ? 'Sending...' : 'Send reset instructions'}
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.submitButton}
            />

            <Button
              title="Back to Sign In"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.secondaryButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: colors.error + '15',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  infoText: {
    color: colors.foreground,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  secondaryButton: {
    marginTop: theme.spacing.md,
  },
});

