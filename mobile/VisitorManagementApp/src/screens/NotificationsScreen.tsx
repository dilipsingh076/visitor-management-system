import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import type {Notification} from '../types';
import {asArray} from '../lib/api/response';
import {canAccessCommitteeFeatures, getCachedUser, User} from '../config/auth';
import {useNotificationRealtimeRefresh} from '../hooks/useNotificationRealtimeRefresh';

export default function NotificationsScreen({navigation}: {navigation: any}) {
  const [items, setItems] = useState<Notification[]>([]);
  const [tab, setTab] = useState<'all' | 'unread'>('unread');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canCreateNotice, setCanCreateNotice] = useState(false);

  const load = useCallback(() => {
    const q = tab === 'unread' ? '?unread_only=true' : '';
    setLoading(true);
    apiClient.get<Notification[] | {notifications: Notification[]}>(`${API.notifications.list}${q}`).then((res) => {
      if (res.error) setError(res.error);
      else setError('');
      setItems(asArray<Notification>(res.data, 'notifications'));
      setLoading(false);
    });
  }, [tab]);
  useEffect(() => { load(); }, [load]);

  useNotificationRealtimeRefresh(load);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u: User | null = await getCachedUser();
      if (!cancelled) setCanCreateNotice(canAccessCommitteeFeatures(u));
    })();
    return () => { cancelled = true; };
  }, []);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title={`Notifications (${unread} unread)`} subtitle="Stay updated with visitor and society alerts." />
        <View style={styles.row}>
          <Button title="Unread" onPress={() => setTab('unread')} variant={tab === 'unread' ? 'primary' : 'secondary'} />
          <Button title="All" onPress={() => setTab('all')} variant={tab === 'all' ? 'primary' : 'secondary'} />
          {canCreateNotice ? (
            <Button title="Create Notice" onPress={() => navigation.navigate('NoticeCreation')} variant="secondary" />
          ) : null}
        </View>
        {loading ? <StateMessage text="Loading notifications..." /> : null}
        {error ? <StateMessage kind="error" text={error} /> : null}
        {items.map((n) => (
          <View key={n.id} style={styles.card}>
            <Text style={styles.title}>{n.title}</Text>
            <Text muted>{n.body}</Text>
            <View style={styles.actions}>
              {!n.read ? <TouchableOpacity onPress={async () => { await apiClient.patch(API.notifications.markRead(n.id)); load(); }}><Text style={styles.link}>Mark Read</Text></TouchableOpacity> : null}
              {(n.type === 'walkin_pending' || n.type === 'visitor_arrived') ? (
                <TouchableOpacity onPress={() => navigation.navigate('VisitorsList')}><Text style={styles.link}>Open Visitor</Text></TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, gap: 10},
  row: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  card: {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, gap: 6},
  title: {fontWeight: '700', color: colors.foreground},
  actions: {flexDirection: 'row', gap: 14},
  link: {color: colors.primary, fontWeight: '700'},
});
