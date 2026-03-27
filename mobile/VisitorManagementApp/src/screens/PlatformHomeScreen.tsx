/**
 * Web `/platform` landing parity — stats from GET /admin/dashboard.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, PageHeader, Screen, StateMessage, Text } from '../components/ui';
import { apiClient } from '../config/api';
import { API } from '../lib/api/endpoints';
import { theme, useTheme } from '../theme';

type Stats = {
  total_societies: number;
  active_societies: number;
  total_residents: number;
  total_visitors_today: number;
  total_visitors_month: number;
  total_complaints: number;
  open_complaints: number;
  total_support_tickets: number;
  open_support_tickets: number;
};

type DashboardPayload = {
  stats: Stats;
};

export default function PlatformHomeScreen({
  navigation,
}: {
  navigation: { navigate: (name: string) => void };
}) {
  const { colors } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    const res = await apiClient.get<DashboardPayload>(API.platform.dashboard);
    if (res.error) setError(res.error);
    else setStats(res.data?.stats ?? null);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { paddingBottom: theme.spacing.lg },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
          marginTop: theme.spacing.md,
        },
        statCard: {
          width: '47%',
          minWidth: 140,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        statVal: {
          fontSize: 22,
          fontWeight: '800',
          color: colors.text,
        },
        statLabel: { marginTop: 4, fontSize: 12, color: colors.muted },
        link: {
          marginTop: theme.spacing.lg,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: colors.primary + '22',
          borderWidth: 1,
          borderColor: colors.primary,
        },
        linkText: { fontWeight: '700', color: colors.primary },
      }),
    [colors],
  );

  if (loading) {
    return (
      <Screen>
        <PageHeader title="Platform" subtitle="Operator overview (web /platform)." />
        <StateMessage kind="info" text="Loading…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <PageHeader
          title="Platform"
          subtitle="Cross-society metrics. Full management stays on the web console for deep workflows."
        />
        {error ? <StateMessage kind="error" text={error} /> : null}

        {stats ? (
          <View style={styles.grid}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{stats.total_societies}</Text>
              <Text style={styles.statLabel}>Societies</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{stats.active_societies}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{stats.total_residents}</Text>
              <Text style={styles.statLabel}>Residents (role)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{stats.total_visitors_today}</Text>
              <Text style={styles.statLabel}>Visitors today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{stats.total_visitors_month}</Text>
              <Text style={styles.statLabel}>Visitors (month)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{stats.open_complaints}</Text>
              <Text style={styles.statLabel}>Open complaints</Text>
            </View>
          </View>
        ) : (
          <StateMessage kind="info" text="No stats returned." />
        )}

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('PlatformSocieties')}
          activeOpacity={0.85}
        >
          <Text style={styles.linkText}>All societies →</Text>
          <Text muted style={{ marginTop: 4, fontSize: 13 }}>
            Tap a society in the list for full detail.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.link, { marginTop: theme.spacing.md }]}
          onPress={() => navigation.navigate('PlatformAuditLogs')}
          activeOpacity={0.85}
        >
          <Text style={styles.linkText}>Audit log →</Text>
          <Text muted style={{ marginTop: 4, fontSize: 13 }}>
            Platform RBAC audit trail (web /platform/audit-logs).
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.link, { marginTop: theme.spacing.md }]}
          onPress={() => navigation.navigate('More')}
          activeOpacity={0.85}
        >
          <Text style={styles.linkText}>More menu →</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
