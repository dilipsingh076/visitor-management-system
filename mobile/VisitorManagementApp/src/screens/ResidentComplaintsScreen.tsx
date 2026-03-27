/**
 * Resident complaints: list mine + file new (matches web / API /complaints).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { theme, useTheme } from '../theme';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at?: string | null;
}

const CATEGORIES = ['plumbing', 'electrical', 'security', 'noise', 'parking', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function ResidentComplaintsScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError('');
    const res = await apiClient.get<Complaint[]>('/complaints/my');
    if (res.error) setError(res.error);
    else setItems(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing fields', 'Please enter a title and description.');
      return;
    }
    setSubmitting(true);
    const res = await apiClient.post<Complaint>('/complaints/', {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
    });
    setSubmitting(false);
    if (res.error) {
      Alert.alert('Could not submit', res.error);
      return;
    }
    setTitle('');
    setDescription('');
    setCategory('other');
    setPriority('medium');
    await load();
    Alert.alert('Submitted', 'Your complaint has been sent to the society office.');
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { paddingBottom: theme.spacing.lg },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md },
        chip: {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        chipActive: {
          borderColor: colors.primary,
          backgroundColor: colors.primary + '18',
        },
        chipText: { fontSize: 13, color: colors.text },
        cardMeta: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        pill: {
          alignSelf: 'flex-start',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: colors.muted,
        },
        pillText: { fontSize: 11, fontWeight: '600', color: colors.text },
      }),
    [colors],
  );

  if (loading) {
    return (
      <Screen>
        <PageHeader
          title="My complaints"
          subtitle="Track requests you’ve raised with the society."
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
        }>
        <PageHeader
          title="My complaints"
          subtitle="Same flow as the web app: list yours and file new issues."
        />
        {error ? <StateMessage kind="error" text={error} /> : null}

        <Text variant="label" style={{ marginBottom: theme.spacing.sm }}>
          New complaint
        </Text>
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Input
            label="Title"
            placeholder="Short summary"
            value={title}
            onChangeText={setTitle}
          />
          <Input
            label="Description"
            placeholder="What happened? Where? When?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
          <Text variant="caption" muted style={{ marginBottom: 8 }}>
            Category
          </Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, category === c && styles.chipActive]}
                onPress={() => setCategory(c)}>
                <Text style={styles.chipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text variant="caption" muted style={{ marginBottom: 8 }}>
            Priority
          </Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, priority === p && styles.chipActive]}
                onPress={() => setPriority(p)}>
                <Text style={styles.chipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Submit complaint" onPress={submit} loading={submitting} />
        </Card>

        <Text variant="label" style={{ marginBottom: theme.spacing.sm }}>
          Your history ({items.length})
        </Text>
        {items.length === 0 ? (
          <StateMessage
            kind="info"
            text="No complaints yet. Use the form above if something needs attention."
          />
        ) : (
          items.map((c) => (
            <Card key={c.id} style={{ marginBottom: theme.spacing.md }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{c.title}</Text>
              <Text muted style={{ marginTop: 6, lineHeight: 20 }}>
                {c.description}
              </Text>
              <View style={styles.cardMeta}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{c.status}</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{c.category}</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{c.priority}</Text>
                </View>
              </View>
              {c.created_at ? (
                <Text variant="caption" muted style={{ marginTop: 8 }}>
                  {c.created_at}
                </Text>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
