import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';

interface PassData {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  otp?: string;
  qr_code?: string;
  status?: string;
}

export default function VisitPassScreen({route}: {route: any}) {
  const visitId = route.params?.visitId as string;
  const [data, setData] = useState<PassData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get<PassData>(API.public.visitPass(visitId)).then((res) => {
      if (res.error) {
        setError(res.error);
        return;
      }
      setError('');
      if (res.data) setData(res.data);
    });
  }, [visitId]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="Visit Pass" subtitle="Use this pass at security check-in." />
        {error ? <StateMessage kind="error" text={error} /> : null}
        {!data ? <StateMessage text="Loading pass details..." /> : (
          <View style={styles.card}>
            <Text style={styles.name}>{data.visitor_name}</Text>
            <Text muted>Phone: {data.visitor_phone}</Text>
            <Text muted>Status: {data.status || '-'}</Text>
            <Text style={styles.otp}>OTP: {data.otp || 'N/A'}</Text>
            <Text muted>QR code exists: {data.qr_code ? 'Yes' : 'No'}</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg},
  card: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 8},
  name: {fontSize: theme.fontSize.lg, color: colors.foreground, fontWeight: '800'},
  otp: {fontSize: theme.fontSize.xl, color: colors.primary, fontWeight: '800'},
});
