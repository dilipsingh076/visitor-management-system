import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { PageHeader, Screen, Text } from '../components/ui';
import {
  User,
  canAccessCheckin,
  canAccessCommitteeFeatures,
  canAccessGuardPage,
  canAccessPlatform,
  getCachedUser,
  getPrimaryRole,
} from '../config/auth';
import { theme } from '../theme';
import { colors } from '../theme/colors';

type NavLink = { route: string; label: string; hint?: string };

/** Residents without gate permissions (matches web sidebar base). */
const BASE_RESIDENT_LINKS: NavLink[] = [
  { route: 'VisitorsList', label: 'Visitors' },
  { route: 'Notifications', label: 'Notifications' },
  { route: 'MyFlat', label: 'My Flat' },
  { route: 'FrequentVisitors', label: 'Frequent Visitors' },
  { route: 'ResidentComplaints', label: 'My complaints' },
  { route: 'MaintenanceBills', label: 'Maintenance bills' },
  { route: 'SosAlert', label: 'Emergency SOS', hint: 'Use only in real emergencies' },
  { route: 'NearbyPlaces', label: 'Nearby places' },
  { route: 'Profile', label: 'Profile' },
];

/** Web Society group (+ user management). */
const COMMITTEE_LINKS: NavLink[] = [
  { route: 'GuardOperations', label: 'Guard dashboard', hint: 'Web /guard' },
  { route: 'SocietyUsers', label: 'User management', hint: 'Web: Management' },
  { route: 'Amenities', label: 'Amenities' },
  { route: 'ComplaintsAdmin', label: 'Society complaints' },
  { route: 'StaffDirectory', label: 'Staff directory' },
  { route: 'Buildings', label: 'Buildings & flats' },
  { route: 'Meetings', label: 'Meetings' },
  { route: 'SocietySettings', label: 'Society settings' },
  { route: 'NoticeCreation', label: 'Create notice' },
];

const PLATFORM_LINKS: NavLink[] = [
  { route: 'PlatformHome', label: 'Platform overview' },
  { route: 'PlatformSocieties', label: 'All societies', hint: 'Tap a row for detail' },
  { route: 'PlatformAuditLogs', label: 'Audit log', hint: 'Web /platform/audit-logs' },
  { route: 'Notifications', label: 'Notifications' },
  { route: 'Profile', label: 'Profile' },
  { route: 'Settings', label: 'Settings' },
];

const GUARD_LINKS: NavLink[] = [
  { route: 'QRScanner', label: 'Scan QR code' },
  { route: 'WalkIn', label: 'Walk-in registration' },
  { route: 'ScanHistory', label: 'Scan history' },
  { route: 'GuardBlacklist', label: 'Blacklist' },
  { route: 'Notifications', label: 'Notifications' },
  { route: 'Settings', label: 'Settings' },
];

export default function MoreScreen({ navigation }: { navigation: any }) {
  const [user, setUser] = useState<User | null>(null);
  const [committee, setCommittee] = useState(false);
  const [isGuard, setIsGuard] = useState(false);
  const [platformAdmin, setPlatformAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u: User | null = await getCachedUser();
      if (cancelled) return;
      setUser(u);
      setCommittee(canAccessCommitteeFeatures(u));
      setIsGuard(getPrimaryRole(u) === 'guard');
      setPlatformAdmin(canAccessPlatform(u));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const links = useMemo(() => {
    if (platformAdmin) return PLATFORM_LINKS;
    if (isGuard) return GUARD_LINKS;

    const out: NavLink[] = [];
    for (const link of BASE_RESIDENT_LINKS) {
      if (
        link.route === 'NearbyPlaces' &&
        user &&
        canAccessGuardPage(user) &&
        !isGuard
      ) {
        out.push({
          route: 'GuardBlacklist',
          label: 'Blacklist',
          hint: 'GuardBlacklist',
        });
      }
      out.push(link);
      if (link.route === 'SosAlert' && user && canAccessCheckin(user)) {
        out.push(
          {
            route: 'CheckIn',
            label: 'Check-in (QR)',
            hint: 'Web: committee / guard',
          },
          { route: 'WalkIn', label: 'Walk-in registration' },
        );
      }
    }
    if (committee) {
      out.push(...COMMITTEE_LINKS);
    }
    return out;
  }, [user, isGuard, committee, platformAdmin]);

  const userLabel = user?.username || user?.email || '';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader
          title="All features"
          subtitle={
            userLabel
              ? `Signed in as ${userLabel}. Aligned with web app navigation.`
              : 'Quick access to mobile modules aligned with the web app.'
          }
        />
        {platformAdmin ? (
          <Text muted style={styles.badge}>
            Platform operator (web /platform).
          </Text>
        ) : null}
        {committee && !isGuard && !platformAdmin ? (
          <Text muted style={styles.badge}>
            Society admin tools are included below.
          </Text>
        ) : null}
        {isGuard ? (
          <Text muted style={styles.badge}>
            Security desk shortcuts (web Guard flows).
          </Text>
        ) : null}
        {links.map((link) => (
          <TouchableOpacity
            key={`${link.route}-${link.label}`}
            onPress={() => navigation.navigate(link.route)}
            style={styles.item}
            activeOpacity={0.85}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemText}>{link.label}</Text>
              <Text muted style={styles.routeHint}>
                {link.hint ?? link.route}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  badge: {
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
  },
  item: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: { color: colors.foreground, fontWeight: '700' },
  routeHint: { fontSize: 12, marginTop: 4 },
  arrow: { color: colors.primary, fontSize: 24, marginLeft: 8 },
});
