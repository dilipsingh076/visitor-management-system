/**
 * Platform audit trail — GET /admin/audit-logs (web /platform/audit-logs parity).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import {
  Button,
  Card,
  Input,
  PageHeader,
  Screen,
  StateMessage,
  Text,
} from '../components/ui';
import { apiClient } from '../config/api';
import { API } from '../lib/api/endpoints';
import { theme, useTheme } from '../theme';

type AuditRow = {
  id: string;
  user_id: string;
  action: string;
  endpoint: string;
  request_method?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
};

type ListResponse = {
  items: AuditRow[];
  total: number;
  page: number;
  page_size: number;
};

function formatDetails(d: Record<string, unknown> | null | undefined): string {
  if (!d || typeof d !== 'object') return '';
  try {
    return JSON.stringify(d).slice(0, 400);
  } catch {
    return '';
  }
}

export default function PlatformAuditLogsScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [appliedAction, setAppliedAction] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchList = useCallback(async (pageNum: number, append: boolean) => {
    setError('');
    const q = new URLSearchParams({
      page: String(pageNum),
      page_size: '30',
    });
    if (appliedAction.trim()) {
      q.set('action', appliedAction.trim());
    }
    const res = await apiClient.get<ListResponse>(
      `${API.platform.auditLogs}?${q.toString()}`,
    );
    if (res.error) {
      setError(res.error);
      return false;
    }
    const data = res.data;
    if (!data) return false;
    setTotal(data.total ?? 0);
    setPage(pageNum);
    if (append) {
      setItems((prev) => [...prev, ...(data.items ?? [])]);
    } else {
      setItems(data.items ?? []);
    }
    return true;
  }, [appliedAction]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchList(1, false);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchList]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchList(1, false);
    setRefreshing(false);
  }, [fetchList]);

  const applyFilter = () => {
    setAppliedAction(actionFilter.trim());
  };

  const loadMore = async () => {
    if (loadingMore || items.length >= total) return;
    setLoadingMore(true);
    await fetchList(page + 1, true);
    setLoadingMore(false);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { paddingBottom: theme.spacing.lg },
        meta: { marginTop: 4, color: colors.muted, fontSize: 12 },
        detail: {
          marginTop: 6,
          fontSize: 11,
          color: colors.muted,
        },
      }),
    [colors],
  );

  if (loading && items.length === 0) {
    return (
      <Screen>
        <PageHeader title="Audit log" subtitle="Platform admin actions (RBAC)." />
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
          title="Audit log"
          subtitle={`${total} events · filter matches action substring`}
        />
        <Input
          label="Filter by action (optional)"
          value={actionFilter}
          onChangeText={setActionFilter}
          autoCapitalize="none"
          placeholder="e.g. checkout, login"
        />
        <Button title="Apply filter" variant="secondary" onPress={applyFilter} />

        {error ? <StateMessage kind="error" text={error} /> : null}

        {items.length === 0 ? (
          <StateMessage kind="info" text="No audit entries for this filter." />
        ) : (
          items.map((row) => {
            const detailStr = formatDetails(row.details ?? undefined);
            return (
            <Card key={row.id} style={{ marginBottom: theme.spacing.md }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>
                {row.action}
              </Text>
              <Text style={styles.meta}>
                {row.request_method ?? '—'} {row.endpoint}
              </Text>
              <Text style={styles.meta}>
                {row.user_name || row.user_email || row.user_id || 'Unknown'}
              </Text>
              <Text style={styles.meta}>{row.created_at}</Text>
              {detailStr ? (
                <Text style={styles.detail} numberOfLines={4}>
                  {detailStr}
                </Text>
              ) : null}
            </Card>
            );
          })
        )}

        {items.length > 0 && items.length < total ? (
          <Button
            title={loadingMore ? 'Loading…' : 'Load more'}
            variant="secondary"
            onPress={loadMore}
            loading={loadingMore}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
