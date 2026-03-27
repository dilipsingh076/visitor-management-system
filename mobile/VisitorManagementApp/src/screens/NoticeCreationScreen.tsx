import React, {useState} from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Button, PageHeader, Screen, StateMessage} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {canAccessCommitteeFeatures, getCachedUser} from '../config/auth';

export default function NoticeCreationScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    getCachedUser().then((u) => {
      setAllowed(canAccessCommitteeFeatures(u));
      setLoading(false);
    });
  }, []);

  const generate = async () => {
    if (!title.trim()) {
      setError('Please enter a title before AI generation.');
      return;
    }
    setBusy(true);
    const res = await apiClient.post<{message?: string}>(
      API.notifications.generateNoticeMessage,
      {title},
      300000,
    );
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError('');
    setMessage(res.data?.message || '');
  };

  const publish = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }
    const res = await apiClient.post(API.notifications.createSocietyNotice, {title: title.trim(), body: message.trim()});
    if (res.error) {
      setError(res.error);
      return;
    }
    setError('');
    setTitle('');
    setMessage('');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="Create Notice" subtitle="Compose and generate AI-assisted notice messages." />
        {!allowed ? <StateMessage kind="error" text="Committee access required." /> : null}
        {loading ? <StateMessage text="Checking access..." /> : null}
        {error ? <StateMessage kind="error" text={error} /> : null}
        {!allowed || loading ? null : (
        <View style={styles.card}>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Notice title" placeholderTextColor={colors.muted} />
          <TextInput style={[styles.input, styles.area]} value={message} onChangeText={setMessage} placeholder="Notice message" placeholderTextColor={colors.muted} multiline />
          <View style={styles.row}>
            <Button title="Generate with AI" onPress={generate} loading={busy} />
            <Button title="Publish" onPress={publish} />
          </View>
        </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg},
  card: {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, gap: 10},
  input: {height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.background, color: colors.foreground, paddingHorizontal: 10},
  area: {height: 140, textAlignVertical: 'top', paddingTop: 10},
  row: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
});
