import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Button, PageHeader, Screen, StateMessage} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {asArray} from '../lib/api/response';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {canAccessCommitteeFeatures, getCachedUser} from '../config/auth';

export default function StaffDirectoryScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    const res = await apiClient.get<any[]>(API.societyStaff.list);
    if (res.error) setError(res.error);
    else setError('');
    setItems(asArray<any>(res.data, 'staff'));
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
        <PageHeader title="Staff Directory" subtitle="Manage support and maintenance staff." />
        {!allowed ? <StateMessage kind="error" text="Committee access required." /> : null}
        {loading ? <StateMessage text="Loading staff directory..." /> : null}
        {error ? <StateMessage kind="error" text={error} /> : null}
        {!allowed || loading ? null : (
        <View style={styles.row}>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Staff name" placeholderTextColor={colors.muted} />
          <Button title="Add" onPress={async () => {
            if (!name.trim()) return;
            const r = await apiClient.post(API.societyStaff.create, {name: name.trim()});
            if (!r.error) {
              setName('');
              load();
            } else {
              setError(r.error);
            }
          }} />
        </View>
        )}
        {items.length === 0 && allowed && !loading ? <StateMessage text="No staff records found." /> : null}
        {items.map((s, i) => <StateMessage key={`${s.id || i}`} text={s.name || s.full_name || 'Staff'} />)}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, gap: 10},
  row: {flexDirection: 'row', gap: 8},
  input: {flex: 1, height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.card, color: colors.foreground, paddingHorizontal: 10},
});
