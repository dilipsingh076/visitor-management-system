import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {theme} from '../theme';
import {colors} from '../theme/colors';

export default function MeetingDetailScreen({route}: {route: any}) {
  const meetingId = route.params?.meetingId as string;
  const [meeting, setMeeting] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get<any>(API.meetings.get(meetingId)).then((r) => {
      if (r.error) {
        setError(r.error);
        return;
      }
      setError('');
      setMeeting(r.data || null);
    });
  }, [meetingId]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="Meeting Detail" subtitle="View agenda and generate AI summary." />
        {error ? <StateMessage kind="error" text={error} /> : null}
        {!meeting ? <StateMessage text="Loading meeting details..." /> : (
          <View style={styles.card}>
            <Text>{meeting.title || 'Meeting'}</Text>
            <Text muted>{meeting.agenda || '-'}</Text>
            <Button title="Generate Summary" onPress={async () => {
              const r = await apiClient.post<any>(API.meetings.summarize(meetingId));
              setSummary(r.data || null);
            }} />
            {summary ? <Text muted>{summary.summary || JSON.stringify(summary)}</Text> : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg},
  card: {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, gap: 10},
});
