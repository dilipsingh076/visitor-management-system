import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Screen, Text} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {theme} from '../theme';

export default function BuildingsScreen() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    apiClient.get<any[]>(API.flats.list).then((res) => setItems(res.data || []));
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text variant="title">Buildings & Flats</Text>
        {items.map((b, i) => (
          <Text key={`${b.id || i}`} muted>
            {b.building_name || b.building || 'Building'} - Flat {b.flat_number || b.flat_no || '-'}
          </Text>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl, gap: 8},
});
