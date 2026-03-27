/**
 * Resident Dashboard Screen.
 * Shows pending approvals, quick actions, and visitor stats.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../components/icons/AppIcon';
import { Card, Screen, Text } from '../components/ui';
import { apiClient } from '../config/api';
import {
  User,
  canAccessCheckin,
  canAccessGuardPage,
  getCachedUser,
  getCurrentUser,
  getPrimaryRole,
} from '../config/auth';
import { API } from '../lib/api/endpoints';
import { useNotificationRealtimeRefresh } from '../hooks/useNotificationRealtimeRefresh';
import { theme, useTheme } from '../theme';

interface ResidentDashboardProps {
  navigation: any;
}

interface Stats {
  visitors_today: number;
  pending_approvals: number;
  checked_in: number;
}

interface PendingVisitor {
  id: string;
  visitor_name: string;
  purpose?: string;
  is_walkin?: boolean;
}

export default function ResidentDashboard({
  navigation,
}: ResidentDashboardProps) {
  const { colors } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingVisitor[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const freshUser = await getCurrentUser(true);
      setUser(freshUser ?? (await getCachedUser()));

      const [statsRes, pendingRes] = await Promise.all([
        apiClient.get<Stats>('/dashboard/stats'),
        apiClient.get<{ count: number; visits: PendingVisitor[] }>(
          '/dashboard/my-requests',
        ),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (pendingRes.data) setPendingApprovals(pendingRes.data.visits || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const openServicesTab = () => {
    navigation.getParent()?.navigate('ServicesTab' as never);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useNotificationRealtimeRefresh(() => {
    void fetchData();
  });

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApprove = async (visitId: string) => {
    setApproving(visitId);
    try {
      const res = await apiClient.patch(API.visitors.approve(visitId));
      if (res.error) {
        Alert.alert('Error', res.error);
        return;
      }
      setPendingApprovals(prev => prev.filter(v => v.id !== visitId));
      if (stats) {
        setStats({ ...stats, pending_approvals: stats.pending_approvals - 1 });
      }
    } catch {
      Alert.alert('Error', 'Failed to approve visitor');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (visitId: string) => {
    setApproving(visitId);
    try {
      const res = await apiClient.patch(API.visitors.reject(visitId));
      if (res.error) {
        Alert.alert('Error', res.error);
        return;
      }
      setPendingApprovals(prev => prev.filter(v => v.id !== visitId));
      if (stats) {
        setStats({ ...stats, pending_approvals: stats.pending_approvals - 1 });
      }
    } catch {
      Alert.alert('Error', 'Failed to reject visitor');
    } finally {
      setApproving(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        contentContainer: {
          paddingHorizontal: 20,
          paddingTop: theme.spacing.md,
          paddingBottom: 20,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        },
        loadingText: {
          color: colors.textSecondary,
          fontSize: theme.fontSize.md,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        headerLeft: {
          flex: 1,
          minWidth: 0,
          paddingRight: theme.spacing.sm,
        },
        headerActions: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flexShrink: 0,
        },
        iconButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.mutedBg,
          justifyContent: 'center',
          alignItems: 'center',
        },
        greeting: {
          fontSize: theme.fontSize.md,
          color: colors.textSecondary,
        },
        userName: {
          fontSize: theme.fontSize.xl,
          fontWeight: '700',
          color: colors.text,
        },
        profileButton: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        profileInitials: {
          color: '#FFFFFF',
          fontSize: theme.fontSize.md,
          fontWeight: '700',
        },
        quickActions: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
        actionCard: {
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        },
        actionCardPrimary: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        actionLabel: {
          fontSize: theme.fontSize.sm,
          fontWeight: '600',
          color: '#FFFFFF',
        },
        secondaryGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          rowGap: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
        miniCard: {
          width: '48%',
          backgroundColor: colors.card,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        },
        miniIcon: {
          fontSize: 26,
          marginBottom: theme.spacing.xs,
        },
        miniLabel: {
          fontSize: theme.fontSize.sm,
          fontWeight: '600',
          color: colors.text,
          textAlign: 'center',
        },
        section: {
          backgroundColor: colors.warning + '15',
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: colors.warning + '30',
        },
        emptyState: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
          backgroundColor: colors.successLight + '40',
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.success + '25',
        },
        emptyStateIconBadge: {
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: colors.success,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
          elevation: 0,
        },
        emptyStateTitle: {
          fontSize: theme.fontSize.lg,
          fontWeight: '700',
          color: colors.text,
          marginBottom: theme.spacing.xs,
        },
        emptyStateText: {
          fontSize: theme.fontSize.sm,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 20,
        },
        alertHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xs,
        },
        alertTitle: {
          fontSize: theme.fontSize.md,
          fontWeight: '700',
          color: colors.warning,
        },
        alertSubtitle: {
          fontSize: theme.fontSize.sm,
          color: colors.textSecondary,
          marginBottom: theme.spacing.md,
        },
        approvalCard: {
          backgroundColor: colors.card,
          borderRadius: theme.borderRadius.sm,
          padding: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: theme.spacing.sm,
        },
        approvalInfo: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        },
        avatar: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: theme.spacing.sm,
        },
        avatarText: {
          color: colors.primary,
          fontWeight: '700',
          fontSize: theme.fontSize.sm,
        },
        approvalDetails: {
          flex: 1,
        },
        visitorName: {
          fontSize: theme.fontSize.sm,
          fontWeight: '600',
          color: colors.text,
        },
        visitorPurpose: {
          fontSize: theme.fontSize.xs,
          color: colors.textSecondary,
        },
        approvalActions: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
        },
        rejectButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.error + '15',
          justifyContent: 'center',
          alignItems: 'center',
        },
        rejectText: {
          color: colors.error,
          fontSize: 16,
          fontWeight: '700',
        },
        approveButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.success,
          justifyContent: 'center',
          alignItems: 'center',
        },
        approveText: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '700',
        },
        sectionTitle: {
          fontSize: theme.fontSize.lg,
          fontWeight: '700',
          color: colors.text,
          marginBottom: theme.spacing.md,
        },
        statsGrid: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
        statCard: {
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        },
        statValue: {
          fontSize: theme.fontSize.xxl,
          fontWeight: '700',
          color: colors.primary,
        },
        statLabel: {
          fontSize: theme.fontSize.xs,
          color: colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
        tipCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
        },
        tipIcon: {
          fontSize: 24,
        },
        tipText: {
          flex: 1,
          fontSize: theme.fontSize.sm,
          color: colors.textSecondary,
          lineHeight: 20,
        },
        societyPill: {
          alignSelf: 'flex-start',
          marginTop: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 4,
          borderRadius: theme.borderRadius.full,
          backgroundColor: colors.primaryMuted,
          borderWidth: 1,
          borderColor: colors.primary + '33',
        },
        societyPillText: {
          fontSize: theme.fontSize.xs,
          fontWeight: '700',
          color: colors.primaryDark,
        },
        miniIconWrap: {
          marginBottom: theme.spacing.xs,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [colors],
  );

  if (loading) {
    return (
      <Screen
        style={{ paddingHorizontal: 0, paddingBottom: 0 }}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.loadingContainer}>
          <Text variant="body" muted>
            Loading...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      style={{ paddingHorizontal: 0, paddingBottom: 0 }}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text muted style={styles.greeting}>
              {getGreeting()}
            </Text>
            <Text
              variant="title"
              style={styles.userName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user?.username || 'Resident'}
            </Text>
            {user?.society ? (
              <View style={styles.societyPill}>
                <Text style={styles.societyPillText}>
                  {user.society.name || user.society.slug}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <AppIcon name="bell-outline" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <AppIcon name="cog-outline" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
              accessibilityRole="button"
              accessibilityLabel="Profile"
            >
              <Text style={styles.profileInitials}>
                {getInitials(user?.username)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardPrimary]}
            onPress={() => navigation.navigate('VisitorInvite')}
            activeOpacity={0.8}
          >
            <View style={{ marginBottom: theme.spacing.sm }}>
              <AppIcon name="account-plus-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Pre-approve visitor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyVisitors')}
            activeOpacity={0.8}
          >
            <View style={[styles.miniIconWrap, { marginBottom: theme.spacing.sm , marginTop: 0 }]}>
              <AppIcon name="account-multiple-outline" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>
              My visitors
            </Text>
          </TouchableOpacity>
        </View>

        <Text variant="label" style={styles.sectionTitle}>
          Society &amp; services
        </Text>
        <View style={styles.secondaryGrid}>
          <TouchableOpacity
            style={styles.miniCard}
            onPress={() => navigation.navigate('ResidentComplaints')}
            activeOpacity={0.85}
          >
            <View style={styles.miniIconWrap}>
              <AppIcon name="clipboard-text-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.miniLabel}>Complaints</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.miniCard}
            onPress={() => navigation.navigate('MaintenanceBills')}
            activeOpacity={0.85}
          >
            <View style={styles.miniIconWrap}>
              <AppIcon name="receipt-text-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.miniLabel}>Maintenance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.miniCard}
            onPress={() => navigation.navigate('SosAlert')}
            activeOpacity={0.85}
          >
            <View style={styles.miniIconWrap}>
              <AppIcon name="alert-octagon-outline" size={24} color={colors.error} />
            </View>
            <Text style={[styles.miniLabel, { color: colors.error }]}>SOS</Text>
          </TouchableOpacity>
          {user && canAccessCheckin(user) ? (
            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate('CheckIn')}
              activeOpacity={0.85}
            >
              <View style={styles.miniIconWrap}>
                <AppIcon name="qrcode-scan" size={24} color={colors.primary} />
              </View>
              <Text style={styles.miniLabel}>Gate check-in</Text>
            </TouchableOpacity>
          ) : null}
          {user && canAccessCheckin(user) ? (
            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate('WalkIn')}
              activeOpacity={0.85}
            >
              <View style={styles.miniIconWrap}>
                <AppIcon name="walk" size={24} color={colors.primary} />
              </View>
              <Text style={styles.miniLabel}>Walk-in</Text>
            </TouchableOpacity>
          ) : null}
          {user && canAccessGuardPage(user) ? (
            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate('GuardBlacklist')}
              activeOpacity={0.85}
            >
              <View style={styles.miniIconWrap}>
                <AppIcon name="block-helper" size={24} color={colors.primary} />
              </View>
              <Text style={styles.miniLabel}>Blacklist</Text>
            </TouchableOpacity>
          ) : null}
          {user &&
          canAccessGuardPage(user) &&
          getPrimaryRole(user) !== 'guard' ? (
            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate('GuardOperations')}
              activeOpacity={0.85}
            >
              <View style={styles.miniIconWrap}>
                <AppIcon name="shield-account-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.miniLabel}>Guard dashboard</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.miniCard}
            onPress={() => navigation.navigate('NearbyPlaces')}
            activeOpacity={0.85}
          >
            <View style={styles.miniIconWrap}>
              <AppIcon name="map-marker-radius-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.miniLabel}>Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.miniCard}
            onPress={openServicesTab}
            activeOpacity={0.85}
          >
            <View style={styles.miniIconWrap}>
              <AppIcon name="apps" size={24} color={colors.primary} />
            </View>
            <Text style={styles.miniLabel}>All services</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Approvals or friendly empty state */}
        {pendingApprovals.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.alertHeader}>
              <AppIcon name="bell-ring-outline" size={20} color={colors.warning} />
              <Text style={styles.alertTitle}>
                {pendingApprovals.length} Pending Approval
                {pendingApprovals.length > 1 ? 's' : ''}
              </Text>
            </View>
            <Text style={styles.alertSubtitle}>
              Walk-in visitors waiting for your approval
            </Text>

            {pendingApprovals.slice(0, 3).map(visitor => (
              <View key={visitor.id} style={styles.approvalCard}>
                <View style={styles.approvalInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(visitor.visitor_name)}
                    </Text>
                  </View>
                  <View style={styles.approvalDetails}>
                    <Text style={styles.visitorName}>
                      {visitor.visitor_name}
                    </Text>
                    <Text style={styles.visitorPurpose}>
                      {visitor.purpose || 'Visit'}
                      {visitor.is_walkin && ' • Walk-in'}
                    </Text>
                  </View>
                </View>
                <View style={styles.approvalActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(visitor.id)}
                    disabled={approving === visitor.id}
                  >
                    <Text style={styles.rejectText}>✕</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(visitor.id)}
                    disabled={approving === visitor.id}
                  >
                    <Text style={styles.approveText}>✓</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIconBadge}>
              <AppIcon name="check" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.emptyStateTitle}>All clear</Text>
            <Text style={styles.emptyStateText}>
              No pending approvals. When someone visits, they’ll show up here.
            </Text>
          </View>
        )}

        {/* Stats */}
        <Text variant="label" style={styles.sectionTitle}>
          Today&apos;s Overview
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text variant="title" style={styles.statValue}>
              {stats?.visitors_today ?? 0}
            </Text>
            <Text variant="caption" muted style={styles.statLabel}>
              Visitors Today
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text
              variant="title"
              style={[styles.statValue, { color: colors.warning }]}
            >
              {stats?.pending_approvals ?? 0}
            </Text>
            <Text variant="caption" muted style={styles.statLabel}>
              Pending
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text
              variant="title"
              style={[styles.statValue, { color: colors.success }]}
            >
              {stats?.checked_in ?? 0}
            </Text>
            <Text variant="caption" muted style={styles.statLabel}>
              Checked In
            </Text>
          </View>
        </View>

        {/* Quick Tips */}
        <Text variant="label" style={styles.sectionTitle}>
          Quick Tips
        </Text>
        <Card style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Add frequent visitors like your maid or driver to quickly invite
            them next time.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
