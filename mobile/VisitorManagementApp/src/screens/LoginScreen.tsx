/**
 * Login Screen for VMS Mobile App.
 * Supports signup, login, and demo login.
 */
import React, {useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity} from 'react-native';
import {Input, Button, Screen, Text} from '../components/ui';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {login, signup, demoLogin, authConfig} from '../config/auth';

interface LoginScreenProps {
  navigation: any;
}

const ROLES = [
  {id: 'resident', label: 'Resident', icon: '🏠'},
  {id: 'guard', label: 'Guard', icon: '👮'},
];

export default function LoginScreen({navigation}: LoginScreenProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [societyCode, setSocietyCode] = useState('');
  const [selectedRole, setSelectedRole] = useState('resident');
  const [loading, setLoading] = useState(false);
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

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (isSignup) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!fullName.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!societyCode.trim()) {
        setError('Please enter your society code');
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      let result;

      if (isSignup) {
        result = await signup({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          society_slug: societyCode.trim(),
          role: selectedRole as 'guard' | 'resident',
          phone: phone.trim() || undefined,
          flat_number: flatNumber.trim() || undefined,
        });
      } else {
        result = await login(email.trim(), password);
      }

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      }
    } catch {
      setError(isSignup ? 'Signup failed. Please try again.' : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await demoLogin();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      }
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
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
          {/* Header with friendly visual */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>🛡️</Text>
                <Text style={styles.logoText}>VMS</Text>
              </View>
            </View>
            <Text variant="title" style={styles.title}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text variant="subtitle" style={styles.subtitle}>
              {isSignup ? 'Join your society and manage visitors' : 'Sign in to your society account'}
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, !isSignup && styles.tabActive]}
              onPress={() => {
                setIsSignup(false);
                setError('');
              }}>
              <Text style={[styles.tabText, !isSignup && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, isSignup && styles.tabActive]}
              onPress={() => {
                setIsSignup(true);
                setError('');
              }}>
              <Text style={[styles.tabText, isSignup && styles.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
          {isSignup && (
            <>
              <Text variant="label" style={styles.label}>
                Full Name *
              </Text>
              <Input
                placeholder="John Doe"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setError('');
                }}
                autoCapitalize="words"
              />

              <Text variant="label" style={[styles.label, {marginTop: theme.spacing.md}]}>
                I am a *
              </Text>
              <View style={styles.roleRow}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleChip,
                      selectedRole === role.id && styles.roleChipSelected,
                    ]}
                    onPress={() => setSelectedRole(role.id)}>
                    <Text style={styles.roleIcon}>{role.icon}</Text>
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === role.id && styles.roleChipTextSelected,
                      ]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text variant="label" style={[styles.label, isSignup && {marginTop: theme.spacing.md}]}>
            Email *
          </Text>
          <Input
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text variant="label" style={[styles.label, {marginTop: theme.spacing.md}]}>
            Password *
          </Text>
          <Input
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
          />
          {!isSignup && (
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text variant="caption" style={styles.forgotPasswordText}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          )}
          {isSignup && (
            <Text variant="caption" muted style={styles.hint}>
              Minimum 6 characters
            </Text>
          )}

          {isSignup && (
            <>
              <Text variant="label" style={[styles.label, {marginTop: theme.spacing.md}]}>
                Confirm Password *
              </Text>
              <Input
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry
              />

              <View style={styles.twoColumn}>
                <View style={styles.column}>
                  <Text variant="label" style={[styles.label, {marginTop: theme.spacing.md}]}>
                    Phone
                  </Text>
                  <Input
                    placeholder="1234567890"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.column}>
                  <Text variant="label" style={[styles.label, {marginTop: theme.spacing.md}]}>
                    Flat/Unit
                  </Text>
                  <Input
                    placeholder="A-101"
                    value={flatNumber}
                    onChangeText={setFlatNumber}
                  />
                </View>
              </View>

              <Text variant="label" style={[styles.label, {marginTop: theme.spacing.md}]}>
                Society Code *
              </Text>
              <Input
                placeholder="society-code provided by admin"
                value={societyCode}
                onChangeText={text => {
                  setSocietyCode(text);
                  setError('');
                }}
                autoCapitalize="none"
              />
            </>
          )}

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text variant="body" style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <Button
            title={loading 
              ? (isSignup ? 'Creating account...' : 'Signing in...') 
              : (isSignup ? 'Create Account' : 'Sign In')
            }
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          />

          {/* Demo Login Section */}
          {authConfig.useDemoAuth && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text variant="caption" muted style={styles.dividerText}>
                  Or try demo
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.demoButtons}>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleDemoLogin}
                  disabled={loading}>
                  <Text style={styles.demoButtonText}>🏠 Resident</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleDemoLogin}
                  disabled={loading}>
                  <Text style={styles.demoButtonText}>👮 Guard</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="caption" muted style={styles.footerText}>
              By signing in, you agree to our Terms of Service
            </Text>
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
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoWrapper: {
    marginBottom: theme.spacing.md,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.lg,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  logoEmoji: {
    fontSize: 32,
    marginBottom: 2,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: colors.muted,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.mutedBg,
    borderRadius: theme.borderRadius.lg,
    padding: 5,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: colors.muted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  hint: {
    fontSize: theme.fontSize.xs,
    color: colors.muted,
    marginTop: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: theme.spacing.xs,
  },
  roleChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  roleIcon: {
    fontSize: 18,
  },
  roleChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: colors.foreground,
  },
  roleChipTextSelected: {
    color: colors.primary,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  column: {
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
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: colors.muted,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  demoButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: colors.foreground,
  },
  footer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.xs,
    color: colors.muted,
    textAlign: 'center',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  forgotPasswordText: {
    fontSize: theme.fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
});
