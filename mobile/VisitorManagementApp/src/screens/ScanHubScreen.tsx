/**
 * Guard Scan tab — entry to QR / OTP check-in (full-screen camera).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, PageHeader, Screen, Text } from '../components/ui';
import { AppIcon } from '../components/icons/AppIcon';
import { theme } from '../theme';
import { useTheme } from '../theme';

export default function ScanHubScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={[styles.wrap, { backgroundColor: colors.background }]}>
        <PageHeader
          title="Gate check-in"
          subtitle="Scan visitor QR or capture consent for OTP entry."
        />
        <View style={[styles.hero, { borderColor: colors.border }]}>
          <AppIcon name="qrcode-scan" size={48} color={colors.primary} />
          <Text style={[styles.heroText, { color: colors.text }]}>
            Open the scanner when a visitor is at the gate.
          </Text>
          <Button
            title="Open QR / OTP scanner"
            onPress={() => navigation.navigate('QRScanner')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  hero: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  heroText: {
    textAlign: 'center',
    fontSize: theme.fontSize.sm,
  },
});
