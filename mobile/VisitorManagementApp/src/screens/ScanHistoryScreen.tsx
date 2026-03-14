/**
 * Scan History screen - shows recent QR/OTP check-ins (cached locally).
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {getCached} from '../lib/offlineStorage';

const {spacing, borderRadius, fontSize} = theme;

type ScanHistoryEntry = {
  kind: 'qr' | 'otp';
  value: string;
  at: number;
  response: any;
};

interface ScanHistoryScreenProps {
  navigation: any;
}

export default function ScanHistoryScreen({navigation}: ScanHistoryScreenProps) {
  const [items, setItems] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const cached = (await getCached<ScanHistoryEntry[]>('visits')) || [];
      setItems(cached);
    };
    const unsubscribe = navigation.addListener('focus', load);
    load();
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({item}: {item: ScanHistoryEntry}) => {
    const d = item.response || {};
    const ts = new Date(item.at || Date.now());
    const timeLabel = ts.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateLabel = ts.toLocaleDateString();
    const status = (d.status || '').toString();
    const isSuccess = status === 'checked_in';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ScanDetails', {entry: item})}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(d.visitor_name || 'V')[0]?.toUpperCase?.() || 'V'}
            </Text>
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.titleText}>
              {d.visitor_name || 'Unknown visitor'}
            </Text>
            <Text style={styles.subtitleText}>
              {d.visitor_phone || '—'} •{' '}
              {d.purpose ? String(d.purpose) : 'Visit'}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={[styles.statusText, isSuccess && styles.statusTextSuccess]}>
              {isSuccess ? 'Checked in' : 'Failed'}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.metaText}>
            {item.kind === 'qr' ? 'QR' : 'OTP'} • {item.value}
          </Text>
          <Text style={styles.metaText}>
            {dateLabel} • {timeLabel}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan history</Text>
        <Text style={styles.headerSubtitle}>
          Last {items.length} scans on this device
        </Text>
      </View>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🕒</Text>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptyText}>
            Once you scan visitor QR codes, they will appear here for quick
            reference.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, idx) => `${item.at}-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  titleCol: {
    flex: 1,
  },
  titleText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.foreground,
  },
  subtitleText: {
    marginTop: 2,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.mutedBg,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.muted,
  },
  statusTextSuccess: {
    color: colors.success,
  },
  cardFooter: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
  },
});

