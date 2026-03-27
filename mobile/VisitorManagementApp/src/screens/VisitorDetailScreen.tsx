import React, {useCallback, useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import type {Visit} from '../types';

export default function VisitorDetailScreen({route, navigation}: {route: any; navigation: any}) {
  const visitId = route.params?.visitId as string;
  const [visit, setVisit] = useState<Visit | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchVisit = useCallback(async () => {
    const res = await apiClient.get<Visit>(API.visitors.get(visitId));
    if (res.error) {
      setError(res.error);
      return;
    }
    setError('');
    if (res.data) setVisit(res.data);
  }, [visitId]);

  useEffect(() => {
    fetchVisit();
  }, [fetchVisit]);

  const handleAction = async (kind: 'approve' | 'reject') => {
    setBusy(true);
    const endpoint = kind === 'approve' ? API.visitors.approve(visitId) : API.visitors.reject(visitId);
    const res = await apiClient.patch(endpoint);
    setBusy(false);
    if (res.error) return Alert.alert('Failed', res.error);
    fetchVisit();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="Visitor Detail" subtitle="Review visit details and take action." />
        {error ? <StateMessage kind="error" text={error} /> : null}
        {!visit ? <StateMessage text="Loading visit details..." /> : (
          <View style={styles.card}>
            <Text variant="title">{visit.visitor_name}</Text>
            <Text muted>{visit.visitor_phone}</Text>
            <Text muted>Status: {visit.status}</Text>
            <Text muted>Purpose: {visit.purpose || 'Visit'}</Text>
            <Text muted>OTP: {visit.otp || 'N/A'}</Text>
            <Text muted>QR: {visit.qr_code ? 'Available' : 'N/A'}</Text>
            <Text muted>Expected: {visit.expected_arrival || '-'}</Text>
            <View style={styles.btnRow}>
              <Button title="Approve" onPress={() => handleAction('approve')} loading={busy} />
              <Button title="Reject" onPress={() => handleAction('reject')} variant="secondary" loading={busy} />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('VisitPass', {visitId})}>
              <Text style={styles.link}>Open Pass Screen</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg},
  card: {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 16, gap: 8},
  btnRow: {flexDirection: 'row', gap: 10, marginTop: 10},
  link: {color: colors.primary, marginTop: 10, fontWeight: '700'},
});
