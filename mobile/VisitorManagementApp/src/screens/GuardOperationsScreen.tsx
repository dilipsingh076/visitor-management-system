/**
 * Web `/guard` parity for society committee (guards use Security Desk instead).
 * Pending / approved / checked-in visits, checkout, blacklist actions, muster CSV.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Card,
  PageHeader,
  Screen,
  StateMessage,
  Text,
} from '../components/ui';
import { API_BASE_URL, apiClient } from '../config/api';
import { API } from '../lib/api/endpoints';
import { normalizeApiPath } from '../lib/api/normalizePath';
import { useNotificationRealtimeRefresh } from '../hooks/useNotificationRealtimeRefresh';
import { getSecureToken } from '../lib/secureStorage';
import { theme, useTheme } from '../theme';

type GuardVisit = {
  id: string;
  visitor_id: string;
  visitor_name: string;
  visitor_phone?: string;
  host_name?: string;
  purpose?: string;
  building_name?: string | null;
  host_flat_number?: string | null;
};

type BlacklistEntry = {
  visitor_id: string;
  visitor_name: string;
  visitor_phone: string;
  reason?: string;
};

function parseVisitList(data: unknown): GuardVisit[] {
  if (Array.isArray(data)) return data as GuardVisit[];
  if (data && typeof data === 'object' && 'visits' in data) {
    const v = (data as { visits?: unknown }).visits;
    return Array.isArray(v) ? (v as GuardVisit[]) : [];
  }
  return [];
}

export default function GuardOperationsScreen() {
  const { colors } = useTheme();
  const [pending, setPending] = useState<GuardVisit[]>([]);
  const [approved, setApproved] = useState<GuardVisit[]>([]);
  const [checkedIn, setCheckedIn] = useState<GuardVisit[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    const [p, a, c, b] = await Promise.all([
      apiClient.get<unknown>(`${API.visitors.list}?status=pending&limit=100`),
      apiClient.get<unknown>(`${API.visitors.list}?status=approved&limit=100`),
      apiClient.get<unknown>(`${API.visitors.list}?status=checked_in&limit=100`),
      apiClient.get<unknown>(API.blacklist.list),
    ]);
    setPending(parseVisitList(p.data));
    setApproved(parseVisitList(a.data));
    setCheckedIn(parseVisitList(c.data));
    setBlacklist(Array.isArray(b.data) ? (b.data as BlacklistEntry[]) : []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  React.useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  useNotificationRealtimeRefresh(() => {
    void load();
  });

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const checkout = async (visitId: string) => {
    setBusyId(visitId);
    const res = await apiClient.post(API.checkin.checkout, { visit_id: visitId });
    setBusyId(null);
    if (res.error) {
      Alert.alert('Check-out failed', res.error);
      return;
    }
    load();
  };

  const blacklistByVisitor = (visitorId: string) => {
    Alert.alert(
      'Blacklist visitor',
      'They will not be able to check in until removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Blacklist',
          style: 'destructive',
          onPress: async () => {
            setBusyId(visitorId);
            const res = await apiClient.post(API.blacklist.add, {
              visitor_id: visitorId,
              reason: 'Blacklisted from guard dashboard (mobile)',
            });
            setBusyId(null);
            if (res.error) {
              Alert.alert('Failed', res.error);
              return;
            }
            load();
          },
        },
      ],
    );
  };

  const removeBlacklist = (visitorId: string) => {
    Alert.alert('Remove from blacklist?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        onPress: async () => {
          setBusyId(visitorId);
          const res = await apiClient.delete(API.blacklist.remove(visitorId));
          setBusyId(null);
          if (res.error) {
            Alert.alert('Failed', res.error);
            return;
          }
          load();
        },
      },
    ]);
  };

  const exportMuster = async () => {
    setExporting(true);
    try {
      const token = await getSecureToken();
      const url = `${API_BASE_URL}${normalizeApiPath(API.dashboard.muster)}?format=csv`;
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.text();
        Alert.alert('Export failed', err.slice(0, 200) || `HTTP ${res.status}`);
        return;
      }
      const text = await res.text();
      await Share.share({
        title: 'Muster CSV',
        message: text.length > 950000 ? `${text.slice(0, 950000)}\n…(truncated)` : text,
      });
    } catch (e) {
      Alert.alert('Export failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setExporting(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { paddingBottom: theme.spacing.lg },
        sectionTitle: {
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
          fontWeight: '700',
          color: colors.text,
        },
        row: { marginBottom: theme.spacing.sm },
        meta: { marginTop: 4, color: colors.muted, fontSize: 13 },
        actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
      }),
    [colors],
  );

  const VisitCard = ({
    v,
    showCheckout,
  }: {
    v: GuardVisit;
    showCheckout?: boolean;
  }) => (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <Text style={{ fontWeight: '700', color: colors.text }}>{v.visitor_name}</Text>
      {v.host_name ? (
        <Text style={styles.meta}>Host: {v.host_name}</Text>
      ) : null}
      {v.building_name || v.host_flat_number ? (
        <Text style={styles.meta}>
          {[v.building_name, v.host_flat_number ? `Flat ${v.host_flat_number}` : null]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      ) : null}
      {v.purpose ? <Text style={styles.meta}>{v.purpose}</Text> : null}
      {v.visitor_phone ? <Text style={styles.meta}>{v.visitor_phone}</Text> : null}
      <View style={styles.actions}>
        <Button
          title="Blacklist"
          variant="secondary"
          onPress={() => blacklistByVisitor(v.visitor_id)}
          loading={busyId === v.visitor_id}
          disabled={Boolean(busyId && busyId !== v.visitor_id)}
        />
        {showCheckout ? (
          <Button
            title="Check-out"
            onPress={() => checkout(v.id)}
            loading={busyId === v.id}
            disabled={Boolean(busyId && busyId !== v.id)}
          />
        ) : null}
      </View>
    </Card>
  );

  if (loading) {
    return (
      <Screen>
        <PageHeader
          title="Guard dashboard"
          subtitle="Walk-ins and visit status at the gate (web /guard parity)."
        />
        <StateMessage kind="info" text="Loading…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <PageHeader
          title="Guard dashboard"
          subtitle="Same sections as the web guard page. Use Security Desk app flow for dedicated guard devices."
        />
        <Button
          title={exporting ? 'Exporting…' : 'Export muster (CSV)'}
          variant="secondary"
          onPress={exportMuster}
          loading={exporting}
        />

        <Text style={styles.sectionTitle}>Waiting for resident approval</Text>
        {pending.length === 0 ? (
          <StateMessage kind="info" text="No pending walk-ins" />
        ) : (
          pending.map((v) => <VisitCard key={v.id} v={v} />)
        )}

        <Text style={styles.sectionTitle}>Approved by resident</Text>
        {approved.length === 0 ? (
          <StateMessage kind="info" text="No approved visits waiting" />
        ) : (
          approved.map((v) => <VisitCard key={v.id} v={v} />)
        )}

        <Text style={styles.sectionTitle}>Currently inside</Text>
        {checkedIn.length === 0 ? (
          <StateMessage kind="info" text="No visitors currently inside" />
        ) : (
          checkedIn.map((v) => (
            <VisitCard key={v.id} v={v} showCheckout />
          ))
        )}

        <Text style={styles.sectionTitle}>Blacklist ({blacklist.length})</Text>
        {blacklist.length === 0 ? (
          <StateMessage kind="info" text="No blacklisted visitors" />
        ) : (
          blacklist.map((b) => (
            <Card key={b.visitor_id} style={{ marginBottom: theme.spacing.md }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>
                {b.visitor_name}
              </Text>
              <Text style={styles.meta}>{b.visitor_phone}</Text>
              {b.reason ? <Text style={styles.meta}>{b.reason}</Text> : null}
              <View style={styles.actions}>
                <Button
                  title="Remove"
                  variant="secondary"
                  onPress={() => removeBlacklist(b.visitor_id)}
                  loading={busyId === b.visitor_id}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
