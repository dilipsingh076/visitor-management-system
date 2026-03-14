/**
 * Scan Details screen - shows full details for a single scanned check-in.
 */
import React from 'react';
import {View, Text, StyleSheet, ScrollView, SafeAreaView, Platform} from 'react-native';
import {theme} from '../theme';
import {colors} from '../theme/colors';

const {spacing, borderRadius, fontSize} = theme;

export default function ScanDetailsScreen(props: any) {
  const entry = props.route?.params?.entry ?? {};
  const d = entry.response || {};
  const ts = new Date(entry.at || Date.now());
  const dateLabel = ts.toLocaleDateString();
  const timeLabel = ts.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(d.visitor_name || 'V')[0]?.toUpperCase?.() || 'V'}
            </Text>
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.visitorName}>
              {d.visitor_name || 'Unknown visitor'}
            </Text>
            <Text style={styles.visitorMeta}>
              {d.visitor_phone || 'No phone on record'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>
              {String(d.status || 'unknown').replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Purpose</Text>
            <Text style={styles.value}>
              {d.purpose ? String(d.purpose) : 'Visit'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Checked in at</Text>
            <Text style={styles.value}>
              {dateLabel} • {timeLabel}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Scan type</Text>
            <Text style={styles.value}>
              {entry.kind === 'otp' ? 'OTP' : 'QR code'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              {entry.kind === 'otp' ? 'OTP value' : 'QR value'}
            </Text>
            <Text style={styles.valueMono}>{String(entry.value || '')}</Text>
          </View>
        </View>

        {(d.host_name || d.host_flat_number || d.building_name) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Host</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {d.host_name ? String(d.host_name) : 'Resident'}
              </Text>
            </View>
            {(d.building_name || d.host_flat_number) && (
              <View style={styles.row}>
                <Text style={styles.label}>Flat / Building</Text>
                <Text style={styles.value}>
                  {d.building_name ? String(d.building_name) : ''}
                  {d.host_flat_number ? ` ${String(d.host_flat_number)}` : ''}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.footerText}>
            This history is stored only on this device for quick reference at
            the gate.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  headerTextCol: {
    flex: 1,
  },
  visitorName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 2,
  },
  visitorMeta: {
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.foreground,
    maxWidth: '60%',
    textAlign: 'right',
  },
  valueMono: {
    fontSize: fontSize.sm,
    color: colors.foreground,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}) as string,
    maxWidth: '60%',
    textAlign: 'right',
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.muted,
  },
});

