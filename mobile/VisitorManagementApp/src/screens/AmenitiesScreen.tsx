import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Button, PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {asArray} from '../lib/api/response';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {canAccessCommitteeFeatures, getCachedUser} from '../config/auth';

export default function AmenitiesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allowed, setAllowed] = useState(false);
  const load = async () => {
    const res = await apiClient.get<any[]>(API.societyAmenities.list);
    if (res.error) {
      setError(res.error);
      setItems([]);
    } else {
      setError('');
      setItems(asArray<any>(res.data, 'amenities'));
    }
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
        <PageHeader title="Amenities" subtitle="Manage society amenities and availability." />
        {!allowed ? <StateMessage kind="error" text="Committee access required." /> : null}
        {error ? <StateMessage kind="error" text={error} /> : null}
        {loading ? <StateMessage text="Loading amenities..." /> : null}
        {!allowed || loading ? null : (
        <View style={styles.row}>
          <TextInput value={name} onChangeText={setName} placeholder="New amenity" placeholderTextColor={colors.muted} style={styles.input} />
          <Button title="Add" onPress={async () => {
            if (!name.trim()) return;
            const r = await apiClient.post(API.societyAmenities.create, {name: name.trim()});
            if (!r.error) {
              setName('');
              load();
            } else {
              setError(r.error);
            }
          }} />
        </View>
        )}
        {items.map((a, i) => <Text key={`${a.id || i}`} muted>{a.name || a.title || 'Amenity'}</Text>)}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl, gap: 10},
  row: {flexDirection: 'row', gap: 8},
  input: {flex: 1, height: 44, borderColor: colors.border, borderWidth: 1, borderRadius: 10, backgroundColor: colors.card, color: colors.foreground, paddingHorizontal: 10},
});
