/**
 * Maintenance bills for the signed-in resident’s flat (API /maintenance/my-*).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, PageHeader, Screen, StateMessage, Text } from '../components/ui';
import { apiClient } from '../config/api';
import { theme, useTheme } from '../theme';

interface Bill {
  id: string;
  flat_number?: string | null;
  amount: number;
  due_date?: string | null;
  period?: string | null;
  description?: string | null;
  status: string;
  paid_date?: string | null;
}

interface Summary {
  total_due: number;
  total_paid: number;
  pending_count: number;
  overdue_count: number;
}

export default function MaintenanceBillsScreen() {
  const { colors } = useTheme();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const [sumRes, billsRes] = await Promise.all([
      apiClient.get<Summary>('/maintenance/my-summary'),
      apiClient.get<Bill[]>('/maintenance/my-bills'),
    ]);
    if (sumRes.error) setError(sumRes.error);
    else if (billsRes.error) setError(billsRes.error);
    else {
      setSummary(sumRes.data ?? null);
      setBills(Array.isArray(billsRes.data) ? billsRes.data : []);
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
        summaryRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        summaryCard: {
          flex: 1,
          minWidth: '42%',
          backgroundColor: colors.card,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
        },
        summaryVal: {
          fontSize: theme.fontSize.xl,
          fontWeight: '800',
          color: colors.primary,
        },
        statusLine: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
      }),
    [colors],
  );

  if (loading) {
    return (
      <Screen>
        <PageHeader title="Maintenance" subtitle="Bills issued for your flat." />
        <StateMessage kind="info" text="Loading…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }>
        <PageHeader
          title="Maintenance"
          subtitle="Balances and line items published by your society."
        />
        {error ? <StateMessage kind="error" text={error} /> : null}

        {summary ? (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text variant="caption" muted>
                Due (pending + overdue)
              </Text>
              <Text style={styles.summaryVal}>₹{summary.total_due.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text variant="caption" muted>
                Paid (total)
              </Text>
              <Text style={[styles.summaryVal, { color: colors.success }]}>
                ₹{summary.total_paid.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text variant="caption" muted>
                Pending
              </Text>
              <Text style={styles.summaryVal}>{summary.pending_count}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text variant="caption" muted>
                Overdue
              </Text>
              <Text style={[styles.summaryVal, { color: colors.error }]}>
                {summary.overdue_count}
              </Text>
            </View>
          </View>
        ) : null}

        <Text variant="label" style={{ marginBottom: theme.spacing.sm }}>
          Bills ({bills.length})
        </Text>
        {bills.length === 0 ? (
          <StateMessage
            kind="info"
            text="No bills on file yet, or your account isn’t linked to a flat."
          />
        ) : (
          bills.map((b) => (
            <Card key={b.id} style={{ marginBottom: theme.spacing.md }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>
                ₹{Number(b.amount).toFixed(2)}
                {b.period ? ` · ${b.period}` : ''}
              </Text>
              {b.description ? (
                <Text muted style={{ marginTop: 6 }}>
                  {b.description}
                </Text>
              ) : null}
              <View style={styles.statusLine}>
                <Text variant="caption" muted>
                  {b.due_date ? `Due ${b.due_date}` : 'Due date TBD'}
                </Text>
                <Text
                  variant="caption"
                  style={{
                    fontWeight: '700',
                    color:
                      b.status === 'paid'
                        ? colors.success
                        : b.status === 'overdue'
                          ? colors.error
                          : colors.warning,
                  }}>
                  {b.status}
                </Text>
              </View>
              {b.flat_number ? (
                <Text variant="caption" muted style={{ marginTop: 4 }}>
                  Flat {b.flat_number}
                </Text>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
