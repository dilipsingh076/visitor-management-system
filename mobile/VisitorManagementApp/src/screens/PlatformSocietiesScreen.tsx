/**
 * Web platform societies list — GET /admin/societies.
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

type SocietyRow = {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  is_active: boolean;
  total_buildings?: number;
  total_residents?: number;
};

type ListResponse = {
  items: SocietyRow[];
  total: number;
  page: number;
  page_size: number;
};

export default function PlatformSocietiesScreen({
  navigation,
}: {
  navigation: { navigate: (name: string, params?: { societyId: string }) => void };
}) {
  const { colors } = useTheme();
  const [items, setItems] = useState<SocietyRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    const res = await apiClient.get<ListResponse>(
      `${API.platform.societies}?page=1&page_size=50`,
    );
    if (res.error) setError(res.error);
    else {
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    }
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
        meta: { marginTop: 6, color: colors.muted, fontSize: 13 },
      }),
    [colors],
  );

  if (loading) {
    return (
      <Screen>
        <PageHeader title="Societies" subtitle="Platform-wide directory." />
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
          title="Societies"
          subtitle={`${total} total · showing ${items.length}`}
        />
        {error ? <StateMessage kind="error" text={error} /> : null}
        {items.length === 0 ? (
          <StateMessage kind="info" text="No societies found." />
        ) : (
          items.map((s) => (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('PlatformSocietyDetail', { societyId: s.id })
              }
            >
              <Card style={{ marginBottom: theme.spacing.md }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>{s.name}</Text>
                <Text style={styles.meta}>{s.slug}</Text>
                {s.city ? <Text style={styles.meta}>{s.city}</Text> : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.text }}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </Text>
                  {s.total_buildings != null ? (
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      Buildings: {s.total_buildings}
                    </Text>
                  ) : null}
                  {s.total_residents != null ? (
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      People: {s.total_residents}
                    </Text>
                  ) : null}
                </View>
                <Text muted style={{ marginTop: 8, fontSize: 12 }}>
                  Tap for full detail →
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
