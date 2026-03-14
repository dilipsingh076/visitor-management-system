import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert} from 'react-native';
import {Input, Button, Card, Screen, Text} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import type {BlacklistEntry} from '../types';

interface GuardBlacklistScreenProps {
  navigation: any;
}

export default function GuardBlacklistScreen({
  navigation,
}: GuardBlacklistScreenProps) {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const loadBlacklist = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<BlacklistEntry[]>(API.blacklist.list);
      if (res.data) {
        setEntries(res.data);
      } else if (res.error) {
        setError(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlacklist();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) {
      setError('Visitor name is required');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        visitor_name: name.trim(),
        visitor_phone: digits.slice(0, 10),
        reason: reason.trim(),
      };
      const res = await apiClient.post<BlacklistEntry>(API.blacklist.addByPhone, payload);
      if (res.error) {
        setError(res.error);
      } else {
        await loadBlacklist();
        setName('');
        setPhone('');
        setReason('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = (visitorId: string) => {
    Alert.alert(
      'Remove from blacklist',
      'Are you sure you want to remove this visitor from the blacklist?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingId(visitorId);
            try {
              const res = await apiClient.delete<void>(API.blacklist.remove(visitorId));
              if (res.error) {
                setError(res.error);
              } else {
                setEntries(prev =>
                  prev.filter(entry => entry.visitor_id !== visitorId),
                );
              }
            } finally {
              setRemovingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text variant="title" style={styles.title}>
                Blacklist
              </Text>
              <Text variant="subtitle" style={styles.subtitle}>
                Block visitors from being invited or checked in.
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.formCard}>
            <Text style={styles.sectionLabel}>Add to blacklist</Text>
            <Input
              placeholder="Visitor name"
              value={name}
              onChangeText={text => {
                setName(text);
                setError('');
              }}
            />
            <Input
              placeholder="Phone (10 digits)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={text => {
                setPhone(text.replace(/\D/g, '').slice(0, 10));
                setError('');
              }}
              maxLength={10}
            />
            <Input
              placeholder="Reason"
              value={reason}
              onChangeText={text => {
                setReason(text);
                setError('');
              }}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button
              title={submitting ? 'Adding...' : 'Add to blacklist'}
              onPress={handleAdd}
              loading={submitting}
              disabled={submitting}
              style={styles.submitButton}
            />
          </Card>

          <Text variant="label" style={styles.sectionLabel}>
            Blacklisted visitors
          </Text>
          {loading ? (
            <Text variant="body" muted style={styles.loadingText}>
              Loading...
            </Text>
          ) : entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>No blacklisted visitors</Text>
              <Text style={styles.emptyText}>
                Add a visitor above to prevent them from entering the society.
              </Text>
            </View>
          ) : (
            entries.map(entry => (
              <Card key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryName}>{entry.visitor_name}</Text>
                    <Text style={styles.entryPhone}>{entry.visitor_phone}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(entry.visitor_id)}
                    disabled={removingId === entry.visitor_id}>
                    <Text style={styles.removeText}>
                      {removingId === entry.visitor_id ? 'Removing...' : 'Remove'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.entryReason}>{entry.reason}</Text>
              </Card>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: colors.foreground,
  },
  subtitle: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: colors.muted,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    fontSize: 16,
    color: colors.muted,
  },
  formCard: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: colors.error,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: colors.muted,
  },
  emptyState: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
  },
  entryCard: {
    marginTop: theme.spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  entryName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: colors.foreground,
  },
  entryPhone: {
    fontSize: theme.fontSize.sm,
    color: colors.muted,
  },
  entryReason: {
    fontSize: theme.fontSize.sm,
    color: colors.muted,
  },
  removeText: {
    fontSize: theme.fontSize.sm,
    color: colors.success,
    fontWeight: '600',
  },
});

