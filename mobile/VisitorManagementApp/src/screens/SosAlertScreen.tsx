/**
 * Emergency SOS — notifies society (API POST /sos/).
 */
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Input, PageHeader, Screen, Text } from '../components/ui';
import { apiClient } from '../config/api';
import { theme, useTheme } from '../theme';

const TYPES: { key: string; label: string; emoji: string }[] = [
  { key: 'medical', label: 'Medical', emoji: '🏥' },
  { key: 'fire', label: 'Fire', emoji: '🔥' },
  { key: 'security', label: 'Security', emoji: '🛡️' },
  { key: 'other', label: 'Other', emoji: '📣' },
];

export default function SosAlertScreen() {
  const { colors } = useTheme();
  const [type, setType] = useState('security');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { paddingBottom: theme.spacing.lg },
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
        typeCard: {
          width: '47%',
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
          borderWidth: 2,
          borderColor: colors.border,
          backgroundColor: colors.card,
          alignItems: 'center',
        },
        typeCardOn: {
          borderColor: colors.error,
          backgroundColor: colors.error + '12',
        },
        emoji: { fontSize: 28, marginBottom: 8 },
        warn: {
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          backgroundColor: colors.error + '15',
          borderWidth: 1,
          borderColor: colors.error + '40',
          marginBottom: theme.spacing.lg,
        },
        warnText: { color: colors.error, fontWeight: '600', lineHeight: 20 },
      }),
    [colors],
  );

  const send = async () => {
    Alert.alert(
      'Send SOS alert?',
      'This notifies everyone in your society immediately. Only use for real emergencies.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send alert',
          style: 'destructive',
          onPress: async () => {
            setSending(true);
            const res = await apiClient.post<{ id?: string }>('/sos/', {
              type,
              note: note.trim() || undefined,
            });
            setSending(false);
            if (res.error) {
              Alert.alert('Failed', res.error);
              return;
            }
            setNote('');
            Alert.alert('Sent', 'Your society has been notified.');
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PageHeader
          title="Emergency SOS"
          subtitle="Broadcast an alert to your society Security Desk and admins."
        />
        <View style={styles.warn}>
          <Text style={styles.warnText}>
            Use only for genuine emergencies. Misuse may be logged and reviewed by your society.
          </Text>
        </View>
        <Text variant="label" style={{ marginBottom: theme.spacing.sm }}>
          Alert type
        </Text>
        <View style={styles.grid}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeCard, type === t.key && styles.typeCardOn]}
              onPress={() => setType(t.key)}
              activeOpacity={0.85}>
              <Text style={styles.emoji}>{t.emoji}</Text>
              <Text style={{ fontWeight: '700', color: colors.text }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input
          label="Optional note"
          placeholder="Location, flat number, what you need…"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          style={{ minHeight: 88, textAlignVertical: 'top' }}
        />
        <Button
          title="Send SOS now"
          onPress={send}
          loading={sending}
          style={{ backgroundColor: colors.error }}
        />
      </ScrollView>
    </Screen>
  );
}
