import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {Screen, Text} from '../components/ui';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import type {Visit} from '../types';

export default function FrequentVisitorsScreen({navigation}: {navigation: any}) {
  const [items, setItems] = useState<Visit[]>([]);
  const [query, setQuery] = useState('');

  React.useEffect(() => {
    apiClient.get<Visit[] | {visits: Visit[]}>(`${API.visitors.list}?scope=me`).then((res) => {
      const raw = Array.isArray(res.data) ? res.data : res.data?.visits;
      setItems(raw ?? []);
    });
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, {name: string; phone: string; count: number}>();
    for (const v of items) {
      const key = `${v.visitor_name}|${v.visitor_phone}`;
      const prev = map.get(key);
      map.set(key, {name: v.visitor_name, phone: v.visitor_phone, count: (prev?.count || 0) + 1});
    }
    return Array.from(map.values()).filter((x) => x.name.toLowerCase().includes(query.toLowerCase()) || x.phone.includes(query));
  }, [items, query]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text variant="title">Frequent Visitors</Text>
        <TextInput style={styles.input} placeholder="Search name or phone" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} />
        {grouped.map((v) => (
          <View key={`${v.name}-${v.phone}`} style={styles.card}>
            <View>
              <Text style={styles.name}>{v.name}</Text>
              <Text muted>{v.phone} - {v.count} visits</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('VisitorInvite', {name: v.name, phone: v.phone})}>
              <Text style={styles.link}>Quick Invite</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, gap: 10},
  input: {height: 46, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, color: colors.foreground, backgroundColor: colors.card},
  card: {backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  name: {color: colors.foreground, fontWeight: '700'},
  link: {color: colors.primary, fontWeight: '700'},
});
