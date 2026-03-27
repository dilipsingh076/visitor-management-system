/**
 * Account tab — profile, settings, full feature list (More).
 */
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PageHeader, Screen, ServiceTile } from '../components/ui';
import { theme } from '../theme';
import { useTheme } from '../theme';

export default function AccountHubScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { backgroundColor: colors.background },
        ]}
      >
        <PageHeader title="Account" subtitle="Profile and preferences." />
        <ServiceTile
          icon="account-circle-outline"
          title="Profile"
          hint="Your details"
          onPress={() => navigation.navigate('Profile')}
        />
        <ServiceTile
          icon="cog-outline"
          title="Settings"
          hint="App preferences"
          onPress={() => navigation.navigate('Settings')}
          style={styles.tile}
        />
        <ServiceTile
          icon="format-list-bulleted"
          title="All features"
          hint="Legacy list — every route"
          onPress={() => navigation.navigate('More')}
          style={styles.tile}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.hub.tileGap,
  },
  tile: { marginTop: 0 },
});
