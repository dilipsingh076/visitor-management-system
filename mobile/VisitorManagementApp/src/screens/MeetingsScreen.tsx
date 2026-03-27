import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {Button, PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {asArray} from '../lib/api/response';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {canAccessCommitteeFeatures, getCachedUser} from '../config/auth';

export default function MeetingsScreen({navigation}: {navigation: any}) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await apiClient.get<any[]>(API.meetings.list);
    if (res.error) setError(res.error);
    else setError('');
    setItems(asArray<any>(res.data, 'meetings'));
    setLoading(false);
  };
  useEffect(() => {
    getCachedUser().then((u) => {
      const ok = canAccessCommitteeFeatures(u);
      setAllowed(ok);
      if (ok) load();
      else setLoading(false);
    });
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="Meetings" subtitle="Create meetings, ask AI, and review records." />
        {!allowed ? <StateMessage kind="error" text="Committee access required." /> : null}
        {loading ? <StateMessage text="Loading meetings..." /> : null}
        {error ? <StateMessage kind="error" text={error} /> : null}
        {!allowed || loading ? null : (
        <View style={styles.card}>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Meeting title" placeholderTextColor={colors.muted} />
          <TextInput style={[styles.input, styles.area]} value={agenda} onChangeText={setAgenda} placeholder="Agenda" placeholderTextColor={colors.muted} multiline />
          <Button title="Create Meeting" onPress={async () => { await apiClient.post(API.meetings.create, {title, agenda}); setTitle(''); setAgenda(''); load(); }} />
        </View>
        )}
        {!allowed || loading ? null : (
        <View style={styles.card}>
          <TextInput style={styles.input} value={question} onChangeText={setQuestion} placeholder="Ask meetings AI..." placeholderTextColor={colors.muted} />
          <Button title="Ask AI" onPress={async () => { const r = await apiClient.post<{answer?: string}>(API.meetings.query, {question}); setAnswer(r.data?.answer || 'No answer'); }} />
          {answer ? <Text muted>{answer}</Text> : null}
        </View>
        )}
        {items.map((m, i) => (
          <TouchableOpacity key={`${m.id || i}`} style={styles.card} onPress={() => navigation.navigate('MeetingDetail', {meetingId: m.id})}>
            <Text>{m.title || 'Meeting'}</Text>
            <Text muted>{m.scheduled_at || m.created_at || '-'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, gap: 10},
  card: {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, gap: 8},
  input: {height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.background, color: colors.foreground, paddingHorizontal: 10},
  area: {height: 90, textAlignVertical: 'top', paddingTop: 10},
});
