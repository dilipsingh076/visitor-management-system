import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNotificationRealtimeRefresh} from '../hooks/useNotificationRealtimeRefresh';
import {PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import type {Visit} from '../types';
import {asArray} from '../lib/api/response';

const FILTERS = ['all', 'pending', 'approved', 'checked_in', 'rejected'] as const;

export default function VisitorsListScreen({navigation}: {navigation: any}) {
  const [items, setItems] = useState<Visit[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    const query = filter === 'all' ? '' : `?status=${filter}`;
    const res = await apiClient.get<Visit[] | {visits: Visit[]}>(`${API.visitors.list}${query}`);
    if (res.error) setError(res.error);
    else setError('');
    setItems(asArray<Visit>(res.data, 'visits'));
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  useNotificationRealtimeRefresh(() => {
    void fetchItems();
  });

  const title = useMemo(() => `Visitors (${items.length})`, [items.length]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.wrap}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchItems(); }} />}>
        <PageHeader title={title} subtitle="Filter and manage all visitor requests." />
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} style={[styles.pill, filter === f && styles.pillActive]} onPress={() => setFilter(f)}>
              <Text style={filter === f ? styles.pillTextActive : styles.pillText}>{f.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? <StateMessage text="Loading visitors..." /> : null}
        {error ? <StateMessage kind="error" text={error} /> : null}
        {!loading && items.length === 0 ? <StateMessage text="No visitors found for this filter." /> : null}

        {items.map((v) => (
          <TouchableOpacity key={v.id} style={styles.card} onPress={() => navigation.navigate('VisitorDetail', {visitId: v.id})}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{v.visitor_name}</Text>
              <Text style={styles.status}>{v.status}</Text>
            </View>
            <Text muted>{v.visitor_phone}</Text>
            <Text muted>{v.purpose || 'Visit'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, gap: theme.spacing.md},
  filterRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  pill: {paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border},
  pillActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  pillText: {color: colors.muted, textTransform: 'capitalize'},
  pillTextActive: {color: '#fff', textTransform: 'capitalize', fontWeight: '700'},
  card: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12},
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  name: {color: colors.foreground, fontWeight: '700', fontSize: theme.fontSize.md},
  status: {color: colors.primary, textTransform: 'capitalize', fontSize: theme.fontSize.sm},
});
