/**
 * Dashboard - activity overview with stat cards
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { apiClient } from '../config/api';
import { API } from '../lib/api/endpoints';
import type { DashboardStats } from '../types';
import { theme } from '../theme';

const { colors, spacing, borderRadius, shadow, fontSize } = theme;

const STAT_ITEMS = [
  {
    key: 'visitors_today',
    label: 'Today',
    icon: '👥',
    color: colors.primary,
    bg: colors.primaryMuted,
  },
  {
    key: 'pending_approvals',
    label: 'Pending',
    icon: '⏳',
    color: colors.warning,
    bg: colors.warningLight,
  },
  {
    key: 'checked_in',
    label: 'Checked In',
    icon: '✓',
    color: colors.success,
    bg: colors.successLight,
  },
];

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<DashboardStats>(API.dashboard.stats)
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Activity overview</Text>
        </View>

        <View style={styles.statGrid}>
          {STAT_ITEMS.map((item) => (
            <View key={item.key} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: item.bg }]}>
                <Text style={styles.statIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.statValue}>
                {stats?.[item.key as keyof DashboardStats] ?? 0}
              </Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipText}>
            Use the web dashboard for detailed visitor lists and approvals.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.muted,
  },
  header: { marginBottom: spacing.xl },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.muted,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statIcon: { fontSize: 24 },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: '500',
  },
  tip: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.md,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: 22,
  },
});
