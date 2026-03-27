import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {asArray} from '../lib/api/response';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {canAccessCommitteeFeatures, getCachedUser} from '../config/auth';

export default function ComplaintsAdminScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [listRes, statsRes] = await Promise.all([
      apiClient.get<any[]>(API.societyComplaints.list),
      apiClient.get<any>(API.societyComplaints.stats),
    ]);
    if (listRes.error || statsRes.error) {
      setError(listRes.error || statsRes.error || 'Failed to load complaints');
    } else {
      setError('');
    }
    setItems(asArray<any>(listRes.data, 'complaints'));
    setStats(statsRes.data || null);
    setLoading(false);
  };
  useEffect(() => {
    getCachedUser().then((u) => {
      const ok = canAccessCommitteeFeatures(u);
      setAllowed(ok);
      if (ok) load();
      else setLoading(false);
    });
  }, []);

  const setStatus = async (id: string, status: string) => {
    await apiClient.patch(API.societyComplaints.update(id), {status});
    load();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="Admin Complaints" subtitle="Monitor and resolve society complaints." />
        {!allowed ? <StateMessage kind="error" text="Committee access required." /> : null}
        {loading ? <StateMessage text="Loading complaints..." /> : null}
        {error ? <StateMessage kind="error" text={error} /> : null}
        {!allowed || loading ? null : (
        <View style={styles.stats}>
          <Text muted>Open: {stats?.open ?? 0}</Text>
          <Text muted>In Progress: {stats?.in_progress ?? 0}</Text>
          <Text muted>Resolved: {stats?.resolved ?? 0}</Text>
        </View>
        )}
        {items.map((c, i) => (
          <View key={`${c.id || i}`} style={styles.card}>
            <Text>{c.title || c.subject || 'Complaint'}</Text>
            <Text muted>{c.status || 'open'}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setStatus(c.id, 'in_progress')}><Text style={styles.link}>In Progress</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setStatus(c.id, 'resolved')}><Text style={styles.link}>Resolve</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        {items.length === 0 && allowed && !loading ? <StateMessage text="No complaints found." /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, gap: 10},
  stats: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, gap: 4},
  card: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, gap: 4},
  actions: {flexDirection: 'row', gap: 12},
  link: {color: colors.primary, fontWeight: '700'},
});
