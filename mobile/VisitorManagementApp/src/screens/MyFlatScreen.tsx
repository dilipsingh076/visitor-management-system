import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Button, PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';

export default function MyFlatScreen() {
  const [tab, setTab] = useState<'members' | 'dues' | 'complaints'>('members');
  const [members, setMembers] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    apiClient.get<any[]>(API.maintenance.myBills).then((r) => setBills(r.data || []));
    apiClient.get<any[]>(API.residentComplaints.my).then((r) => setComplaints(r.data || []));
    apiClient.get<any[]>(API.flats.list).then((r) => setMembers(r.data || []));
  }, []);

  const submitComplaint = async () => {
    await apiClient.post(API.residentComplaints.create, {title, description, category: 'other'});
    setTitle('');
    setDescription('');
    const r = await apiClient.get<any[]>(API.residentComplaints.my);
    setComplaints(r.data || []);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="My Flat" subtitle="Members, dues, and complaints in one place." />
        <View style={styles.tabs}>
          <Button title="Members" onPress={() => setTab('members')} variant={tab === 'members' ? 'primary' : 'secondary'} />
          <Button title="Dues" onPress={() => setTab('dues')} variant={tab === 'dues' ? 'primary' : 'secondary'} />
          <Button title="Complaints" onPress={() => setTab('complaints')} variant={tab === 'complaints' ? 'primary' : 'secondary'} />
        </View>

        {tab === 'members' && members.length === 0 ? <StateMessage text="No members found." /> : null}
        {tab === 'dues' && bills.length === 0 ? <StateMessage text="No maintenance bills yet." /> : null}
        {tab === 'members' ? members.map((m, i) => <StateMessage key={`${m.id || i}`} text={m.full_name || m.name || 'Member'} />) : null}
        {tab === 'dues' ? bills.map((b, i) => <StateMessage key={`${b.id || i}`} text={`${b.bill_month || b.month || 'Bill'} - ${b.amount ?? 0}`} />) : null}
        {tab === 'complaints' ? (
          <View style={styles.section}>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Complaint title" placeholderTextColor={colors.muted} />
            <TextInput style={[styles.input, styles.area]} value={description} onChangeText={setDescription} placeholder="Complaint description" placeholderTextColor={colors.muted} multiline />
            <Button title="Create Complaint" onPress={submitComplaint} />
            {complaints.map((c, i) => <Text key={`${c.id || i}`} muted>{c.title || c.subject} - {c.status || 'open'}</Text>)}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, gap: 10},
  tabs: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  section: {gap: 8},
  input: {height: 46, borderColor: colors.border, borderWidth: 1, borderRadius: 10, backgroundColor: colors.card, color: colors.foreground, paddingHorizontal: 12},
  area: {height: 100, textAlignVertical: 'top', paddingTop: 10},
});
