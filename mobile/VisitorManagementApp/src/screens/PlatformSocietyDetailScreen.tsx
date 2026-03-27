/**
 * Platform society detail — GET /admin/societies/:id.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, PageHeader, Screen, StateMessage, Text } from '../components/ui';
import { apiClient } from '../config/api';
import { API } from '../lib/api/endpoints';
import { theme, useTheme } from '../theme';

type SocietyDetail = {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  contact_email: string;
  contact_phone?: string | null;
  registration_number?: string | null;
  society_type?: string | null;
  plan?: string | null;
  status?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_buildings: number;
  total_residents: number;
  total_visitors_today: number;
  total_visitors_month: number;
};

function Row({ label, value }: { label: string; value?: string | number | null }) {
  const { colors } = useTheme();
  if (value === undefined || value === null || value === '') return null;
  return (
    <Text style={{ marginTop: 6, color: colors.text, fontSize: 14 }}>
      <Text style={{ fontWeight: '600' }}>{label}: </Text>
      {String(value)}
    </Text>
  );
}

export default function PlatformSocietyDetailScreen(props: {
  route?: { params?: { societyId?: string } };
}) {
  const { colors } = useTheme();
  const societyId = props.route?.params?.societyId;
  const [detail, setDetail] = useState<SocietyDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!societyId) {
      setError('Missing society id');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setError('');
    const res = await apiClient.get<SocietyDetail>(
      API.platform.society(societyId),
    );
    if (res.error) setError(res.error);
    else setDetail(res.data ?? null);
    setLoading(false);
    setRefreshing(false);
  }, [societyId]);

  useEffect(() => {
    load();
  }, [load]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { paddingBottom: theme.spacing.lg },
        stats: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
          marginTop: theme.spacing.md,
        },
        stat: {
          minWidth: '45%',
          padding: theme.spacing.sm,
          borderRadius: theme.borderRadius.md,
          backgroundColor: colors.mutedBg,
        },
      }),
    [colors],
  );

  if (!societyId) {
    return (
      <Screen>
        <PageHeader title="Society" />
        <StateMessage kind="error" text="Invalid link." />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <PageHeader title="Society" subtitle="Loading…" />
        <StateMessage kind="info" text="Loading…" />
      </Screen>
    );
  }

  if (error || !detail) {
    return (
      <Screen>
        <PageHeader title="Society" />
        <StateMessage kind="error" text={error || 'Not found.'} />
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
        <PageHeader title={detail.name} subtitle={detail.slug} />

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={{ fontWeight: '800', fontSize: 18, color: colors.text }}>
              {detail.total_buildings}
            </Text>
            <Text muted style={{ fontSize: 12 }}>
              Buildings
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={{ fontWeight: '800', fontSize: 18, color: colors.text }}>
              {detail.total_residents}
            </Text>
            <Text muted style={{ fontSize: 12 }}>
              People
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={{ fontWeight: '800', fontSize: 18, color: colors.text }}>
              {detail.total_visitors_today}
            </Text>
            <Text muted style={{ fontSize: 12 }}>
              Visitors today
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={{ fontWeight: '800', fontSize: 18, color: colors.text }}>
              {detail.total_visitors_month}
            </Text>
            <Text muted style={{ fontSize: 12 }}>
              Visitors (month)
            </Text>
          </View>
        </View>

        <Card style={{ marginTop: theme.spacing.lg }}>
          <Text variant="label" style={{ marginBottom: theme.spacing.sm }}>
            Registration & contact
          </Text>
          <Row label="Status" value={detail.status ?? undefined} />
          <Row label="Active" value={detail.is_active ? 'Yes' : 'No'} />
          <Row label="Plan" value={detail.plan ?? undefined} />
          <Row label="Type" value={detail.society_type ?? undefined} />
          <Row label="Reg. no." value={detail.registration_number ?? undefined} />
          <Row label="Email" value={detail.contact_email} />
          <Row label="Phone" value={detail.contact_phone ?? undefined} />
        </Card>

        <Card style={{ marginTop: theme.spacing.md }}>
          <Text variant="label" style={{ marginBottom: theme.spacing.sm }}>
            Address
          </Text>
          <Row label="Line" value={detail.address ?? undefined} />
          <Row label="City" value={detail.city ?? undefined} />
          <Row label="State" value={detail.state ?? undefined} />
          <Row label="PIN" value={detail.pincode ?? undefined} />
          <Row label="Country" value={detail.country ?? undefined} />
        </Card>

        <Card style={{ marginTop: theme.spacing.md }}>
          <Text variant="label" style={{ marginBottom: theme.spacing.sm }}>
            Timestamps
          </Text>
          <Row label="Created" value={detail.created_at} />
          <Row label="Updated" value={detail.updated_at} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
