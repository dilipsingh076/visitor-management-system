/**
 * Home screen - mobile-first, touch-friendly, distinct from web
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { theme } from '../theme';

const { colors, spacing, borderRadius, shadow, fontSize } = theme;

interface HomeScreenProps {
  navigation: { navigate: (screen: string) => void };
}

const MENU_ITEMS = [
  {
    id: '1',
    title: 'Check In',
    subtitle: 'Scan QR or enter OTP to register arrival',
    screen: 'CheckIn',
    icon: '📱',
    gradient: colors.primary,
    bgTint: colors.primaryMuted,
  },
  {
    id: '2',
    title: 'Invite Visitor',
    subtitle: 'Pre-approve visitors with OTP',
    screen: 'VisitorInvite',
    icon: '✉️',
    gradient: colors.accent,
    bgTint: colors.accentLight,
  },
  {
    id: '3',
    title: 'Dashboard',
    subtitle: 'View activity and statistics',
    screen: 'Dashboard',
    icon: '📊',
    gradient: colors.success,
    bgTint: colors.successLight,
  },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoEmoji}>🛡️</Text>
            </View>
          </View>
          <Text style={styles.title}>Visitor Management</Text>
          <Text style={styles.subtitle}>
            Secure, contactless check-in for societies & offices
          </Text>
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}>
              <View style={[styles.iconWrap, { backgroundColor: item.bgTint }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  heroBadge: {
    marginBottom: spacing.lg,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
    ...theme.shadow.md,
  },
  logoEmoji: { fontSize: 40 },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  menu: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...theme.shadow.md,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  icon: { fontSize: 28 },
  cardContent: { flex: 1, minWidth: 0 },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: 20,
  },
  arrow: {
    fontSize: 20,
    color: colors.mutedForeground,
    fontWeight: '300',
    marginLeft: spacing.sm,
  },
});
