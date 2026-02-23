/**
 * Resident Dashboard Screen.
 * Shows pending approvals, quick actions, and visitor stats.
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {Button, Card} from '../components/ui';
import {apiClient} from '../config/api';
import {getCachedUser, User, logout} from '../config/auth';

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

export default function ResidentDashboard({navigation}: ResidentDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const cachedUser = await getCachedUser();
      setUser(cachedUser);

      const [statsRes, pendingRes] = await Promise.all([
        apiClient.get<Stats>('/dashboard/stats'),
        apiClient.get<{count: number; visits: PendingVisitor[]}>('/dashboard/my-requests'),
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApprove = async (visitId: string) => {
    setApproving(visitId);
    try {
      await apiClient.post(`/visitors/${visitId}/approve`);
      setPendingApprovals((prev) => prev.filter((v) => v.id !== visitId));
      if (stats) {
        setStats({...stats, pending_approvals: stats.pending_approvals - 1});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve visitor');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (visitId: string) => {
    setApproving(visitId);
    try {
      await apiClient.post(`/visitors/${visitId}/reject`);
      setPendingApprovals((prev) => prev.filter((v) => v.id !== visitId));
      if (stats) {
        setStats({...stats, pending_approvals: stats.pending_approvals - 1});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reject visitor');
    } finally {
      setApproving(null);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
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
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.userName}>{user?.username || 'Resident'}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <Text style={styles.profileInitials}>
            {getInitials(user?.username)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardPrimary]}
          onPress={() => navigation.navigate('VisitorInvite')}
          activeOpacity={0.8}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabel}>Invite Visitor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('MyVisitors')}
          activeOpacity={0.8}>
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={[styles.actionLabel, {color: colors.text}]}>My Visitors</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Approvals or friendly empty state */}
      {pendingApprovals.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertIcon}>🔔</Text>
            <Text style={styles.alertTitle}>
              {pendingApprovals.length} Pending Approval{pendingApprovals.length > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.alertSubtitle}>
            Walk-in visitors waiting for your approval
          </Text>

          {pendingApprovals.slice(0, 3).map((visitor) => (
            <View key={visitor.id} style={styles.approvalCard}>
              <View style={styles.approvalInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(visitor.visitor_name)}
                  </Text>
                </View>
                <View style={styles.approvalDetails}>
                  <Text style={styles.visitorName}>{visitor.visitor_name}</Text>
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
                  disabled={approving === visitor.id}>
                  <Text style={styles.rejectText}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApprove(visitor.id)}
                  disabled={approving === visitor.id}>
                  <Text style={styles.approveText}>✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>✅</Text>
          <Text style={styles.emptyStateTitle}>All clear</Text>
          <Text style={styles.emptyStateText}>No pending approvals. When someone visits, they’ll show up here.</Text>
        </View>
      )}

      {/* Stats */}
      <Text style={styles.sectionTitle}>Today&apos;s Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.visitors_today ?? 0}</Text>
          <Text style={styles.statLabel}>Visitors Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, {color: colors.warning}]}>
            {stats?.pending_approvals ?? 0}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, {color: colors.success}]}>
            {stats?.checked_in ?? 0}
          </Text>
          <Text style={styles.statLabel}>Checked In</Text>
        </View>
      </View>

      {/* Recent Activity Placeholder */}
      <Text style={styles.sectionTitle}>Quick Tips</Text>
      <Card style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>
          Add frequent visitors like your maid or driver to quickly invite them
          next time.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
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
    marginBottom: theme.spacing.xl,
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
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionCardPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  actionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: colors.warning + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: colors.successLight + '40',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.success + '25',
  },
  emptyStateIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.sm,
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
  alertIcon: {
    fontSize: 20,
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
    marginBottom: theme.spacing.xl,
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
});
