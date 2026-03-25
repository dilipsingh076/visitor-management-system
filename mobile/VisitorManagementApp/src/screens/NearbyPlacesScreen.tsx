import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {asArray} from '../lib/api/response';
import {theme} from '../theme';
import {colors} from '../theme/colors';

export default function NearbyPlacesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    apiClient.get<any[]>(API.nearbyPlaces.list).then((res) => {
      if (res.error) setError(res.error);
      else setError('');
      setItems(asArray<any>(res.data, 'places'));
    });
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="Nearby Places" subtitle="Explore essential services around your society." />
        {error ? <StateMessage kind="error" text={error} /> : null}
        {items.length === 0 ? <StateMessage text="No nearby places found." /> : null}
        {items.map((p, i) => (
          <View key={`${p.id || i}`} style={styles.card}>
            <Text>{p.name || 'Place'}</Text>
            <Text muted>{p.category || 'General'}</Text>
            <Text muted>{p.address || '-'}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl, gap: 10},
  card: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12},
});
