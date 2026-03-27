import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {asArray} from '../lib/api/response';
import {theme} from '../theme';
import {colors} from '../theme/colors';

export default function NearbyPlacesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError('');
    setItems([]);

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    let status = await check(permission);
    if (status === RESULTS.DENIED) {
      status = await request(permission);
    }

    if (
      status !== RESULTS.GRANTED &&
      status !== RESULTS.LIMITED
    ) {
      setError(
        'Location permission is required to find nearby places. Enable it in Settings.',
      );
      setLoading(false);
      return;
    }

    const coords = await new Promise<{lat: number; lng: number}>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        pos =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        err => reject(err),
        {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 60000,
        },
      );
    }).catch(() => null);

    if (!coords) {
      setError(
        'Could not read your location. Check that GPS / location services are on and try again.',
      );
      setLoading(false);
      return;
    }

    const qs = new URLSearchParams({
      lat: String(coords.lat),
      lng: String(coords.lng),
      radius: '3000',
    });
    const res = await apiClient.get<any[]>(
      `${API.nearbyPlaces.list}?${qs.toString()}`,
    );

    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    setItems(asArray<any>(res.data, 'places'));
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const showEmpty =
    !loading && !error && items.length === 0;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader
          title="Nearby Places"
          subtitle="Explore essential services around your society."
        />
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text muted style={styles.loadingHint}>
              Getting your location…
            </Text>
          </View>
        ) : null}
        {error ? <StateMessage kind="error" text={error} /> : null}
        {showEmpty ? (
          <StateMessage text="No nearby places found for this area." />
        ) : null}
        {items.map((p, i) => (
          <View key={`${p.place_id || p.id || i}`} style={styles.card}>
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
  wrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: 10,
  },
  centered: {alignItems: 'center', paddingVertical: 16},
  loadingHint: {marginTop: 8},
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
});
