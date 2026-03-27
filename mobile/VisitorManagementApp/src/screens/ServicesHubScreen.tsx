/**
 * Services tab — grouped society & gate tools (Hood-style). Replaces flat More for primary IA.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PageHeader, Screen, SectionHeader, ServiceTile } from '../components/ui';
import {
  User,
  canAccessCheckin,
  canAccessCommitteeFeatures,
  canAccessGuardPage,
  getCachedUser,
  getPrimaryRole,
} from '../config/auth';
import { theme } from '../theme';
import { useTheme } from '../theme';

type Link = { route: string; label: string; hint?: string; icon: string };

const RESIDENT_HOME: Link[] = [
  {
    route: 'MyFlat',
    label: 'My flat',
    hint: 'Flat & building',
    icon: 'home-outline',
  },
  {
    route: 'FrequentVisitors',
    label: 'Frequent visitors',
    hint: 'Quick re-invite',
    icon: 'account-multiple-outline',
  },
  {
    route: 'ResidentComplaints',
    label: 'My complaints',
    icon: 'clipboard-text-outline',
  },
  {
    route: 'MaintenanceBills',
    label: 'Maintenance bills',
    icon: 'receipt-text-outline',
  },
  {
    route: 'SosAlert',
    label: 'Emergency SOS',
    hint: 'Real emergencies only',
    icon: 'alert-octagon-outline',
  },
  {
    route: 'NearbyPlaces',
    label: 'Nearby places',
    icon: 'map-marker-radius-outline',
  },
];

const COMMITTEE_LINKS: Link[] = [
  {
    route: 'GuardOperations',
    label: 'Guard dashboard',
    hint: 'Gate queue & muster',
    icon: 'shield-account-outline',
  },
  {
    route: 'SocietyUsers',
    label: 'User management',
    icon: 'account-supervisor-outline',
  },
  { route: 'Amenities', label: 'Amenities', icon: 'dumbbell' },
  {
    route: 'ComplaintsAdmin',
    label: 'Society complaints',
    icon: 'clipboard-check-outline',
  },
  {
    route: 'StaffDirectory',
    label: 'Staff directory',
    icon: 'badge-account-outline',
  },
  {
    route: 'Buildings',
    label: 'Buildings & flats',
    icon: 'office-building-outline',
  },
  { route: 'Meetings', label: 'Meetings', icon: 'calendar-account-outline' },
  {
    route: 'SocietySettings',
    label: 'Society settings',
    icon: 'tune-vertical',
  },
  {
    route: 'NoticeCreation',
    label: 'Create notice',
    icon: 'bullhorn-outline',
  },
];

const GUARD_LINKS: Link[] = [
  {
    route: 'VisitorsList',
    label: 'All visitors',
    icon: 'format-list-bulleted',
  },
  {
    route: 'WalkIn',
    label: 'Walk-in at gate',
    icon: 'walk',
  },
  {
    route: 'ScanHistory',
    label: 'Scan history',
    icon: 'history',
  },
  {
    route: 'GuardBlacklist',
    label: 'Blacklist',
    icon: 'block-helper',
  },
  {
    route: 'CheckIn',
    label: 'Gate check-in (OTP)',
    icon: 'cellphone-key',
  },
  { route: 'Settings', label: 'Settings', icon: 'cog-outline' },
];

type Props = { navigation: any; route?: { params?: { variant?: 'resident' | 'guard' } } };

export default function ServicesHubScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [committee, setCommittee] = useState(false);
  const [isGuard, setIsGuard] = useState(false);
  const variant = route?.params?.variant === 'guard' ? 'guard' : 'resident';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getCachedUser();
      if (cancelled) return;
      setUser(u);
      setCommittee(canAccessCommitteeFeatures(u));
      setIsGuard(getPrimaryRole(u) === 'guard');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const residentLinks = useMemo(() => {
    const out: Link[] = [];
    for (const link of RESIDENT_HOME) {
      if (
        link.route === 'NearbyPlaces' &&
        user &&
        canAccessGuardPage(user) &&
        !isGuard
      ) {
        out.push({
          route: 'GuardBlacklist',
          label: 'Blacklist',
          icon: 'block-helper',
        });
      }
      out.push(link);
      if (link.route === 'SosAlert' && user && canAccessCheckin(user)) {
        out.push({
          route: 'CheckIn',
          label: 'Gate check-in (QR)',
          icon: 'qrcode-scan',
        });
        out.push({
          route: 'WalkIn',
          label: 'Walk-in at gate',
          icon: 'walk',
        });
      }
    }
    return out;
  }, [user, isGuard]);

  if (variant === 'guard' || isGuard) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.wrap}>
          <PageHeader
            title="Gate tools"
            subtitle="Walk-in, blacklist, and visitor records."
          />
          <SectionHeader title="Operations" />
          <View style={styles.grid}>
            {GUARD_LINKS.map((link) => (
              <ServiceTile
                key={link.route + link.label}
                title={link.label}
                hint={link.hint}
                icon={link.icon}
                onPress={() => navigation.navigate(link.route)}
              />
            ))}
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { backgroundColor: colors.background },
        ]}
      >
        <PageHeader
          title="My society"
          subtitle="Maintenance, complaints, and committee tools."
        />
        <SectionHeader title="Resident services" />
        <View style={styles.grid}>
          {residentLinks.map((link) => (
            <ServiceTile
              key={link.route + link.label}
              title={link.label}
              hint={link.hint}
              icon={link.icon}
              onPress={() => navigation.navigate(link.route)}
            />
          ))}
        </View>
        {committee ? (
          <>
            <SectionHeader title="Committee" subtitle="Society administration" />
            <View style={styles.grid}>
              {COMMITTEE_LINKS.map((link) => (
                <ServiceTile
                  key={link.route + link.label}
                  title={link.label}
                  hint={link.hint}
                  icon={link.icon}
                  onPress={() => navigation.navigate(link.route)}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  grid: { gap: theme.hub.tileGap },
});
