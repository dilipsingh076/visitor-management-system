/**
 * Guard Dashboard Screen.
 * Optimized for quick check-in operations.
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {Button, Card} from '../components/ui';
import {apiClient} from '../config/api';
import {getCachedUser, User, logout} from '../config/auth';

interface GuardDashboardProps {
  navigation: any;
}

interface Stats {
  visitors_today: number;
  pending_approvals: number;
  checked_in: number;
}

interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone?: string;
  flat_number?: string;
  purpose?: string;
  otp?: string;
  status: string;
}

export default function GuardDashboard({navigation}: GuardDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [expectedVisitors, setExpectedVisitors] = useState<Visitor[]>([]);
  const [checkedInVisitors, setCheckedInVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const cachedUser = await getCachedUser();
      setUser(cachedUser);

      const [statsRes, expectedRes, checkedInRes] = await Promise.all([
        apiClient.get<Stats>('/dashboard/stats'),
        apiClient.get<{visits: Visitor[]}>('/visitors?status=approved&limit=20'),
        apiClient.get<{visits: Visitor[]}>('/visitors?status=checked_in&limit=20'),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (expectedRes.data) setExpectedVisitors(expectedRes.data.visits || []);
      if (checkedInRes.data) setCheckedInVisitors(checkedInRes.data.visits || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCheckIn = async (visitId: string) => {
    setCheckingIn(visitId);
    try {
      await apiClient.post(`/checkin/${visitId}`);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to check in visitor');
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCheckOut = async (visitId: string) => {
    setCheckingIn(visitId);
    try {
      await apiClient.post(`/checkin/${visitId}/checkout`);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to check out visitor');
    } finally {
      setCheckingIn(null);
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

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const filteredExpected = expectedVisitors.filter(
    (v) =>
      v.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitor_phone?.includes(searchQuery) ||
      v.flat_number?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        <View style={styles.headerLeft}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
          <Text style={styles.headerTitle}>Security Desk</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <Text style={styles.profileInitials}>
            {getInitials(user?.username)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, phone, or flat..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CheckIn')}
          activeOpacity={0.8}>
          <View style={[styles.actionIconBg, {backgroundColor: colors.primary}]}>
            <Text style={styles.actionIcon}>📷</Text>
          </View>
          <Text style={styles.actionLabel}>Scan QR / OTP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('WalkIn')}
          activeOpacity={0.8}>
          <View style={[styles.actionIconBg, {backgroundColor: colors.warning}]}>
            <Text style={styles.actionIcon}>➕</Text>
          </View>
          <Text style={styles.actionLabel}>Walk-in Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{expectedVisitors.length}</Text>
          <Text style={styles.statLabel}>Expected</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: colors.success}]}>
            {stats?.checked_in ?? 0}
          </Text>
          <Text style={styles.statLabel}>Inside</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: colors.warning}]}>
            {stats?.pending_approvals ?? 0}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.visitors_today ?? 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Expected Visitors */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Expected Today ({filteredExpected.length})
          </Text>
        </View>

        {filteredExpected.length > 0 ? (
          filteredExpected.map((visitor) => (
            <View key={visitor.id} style={styles.visitorCard}>
              <View style={styles.visitorInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(visitor.visitor_name)}
                  </Text>
                </View>
                <View style={styles.visitorDetails}>
                  <Text style={styles.visitorName}>{visitor.visitor_name}</Text>
                  <Text style={styles.visitorMeta}>
                    {visitor.flat_number && `Flat ${visitor.flat_number} • `}
                    {visitor.purpose || 'Visit'}
                  </Text>
                  {visitor.otp && (
                    <Text style={styles.otpText}>OTP: {visitor.otp}</Text>
                  )}
                </View>
              </View>
              <Button
                title={checkingIn === visitor.id ? '...' : 'Check In'}
                onPress={() => handleCheckIn(visitor.id)}
                disabled={checkingIn === visitor.id}
                style={styles.checkInButton}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching visitors' : 'No expected visitors'}
            </Text>
          </View>
        )}
      </View>

      {/* Currently Inside */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.insideDot} />
            <Text style={styles.sectionTitle}>
              Currently Inside ({checkedInVisitors.length})
            </Text>
          </View>
        </View>

        {checkedInVisitors.length > 0 ? (
          checkedInVisitors.map((visitor) => (
            <View key={visitor.id} style={styles.visitorCard}>
              <View style={styles.visitorInfo}>
                <View style={[styles.avatar, {backgroundColor: colors.success + '20'}]}>
                  <Text style={[styles.avatarText, {color: colors.success}]}>
                    {getInitials(visitor.visitor_name)}
                  </Text>
                </View>
                <View style={styles.visitorDetails}>
                  <Text style={styles.visitorName}>{visitor.visitor_name}</Text>
                  <Text style={styles.visitorMeta}>
                    {visitor.flat_number && `Flat ${visitor.flat_number}`}
                  </Text>
                </View>
              </View>
              <Button
                title={checkingIn === visitor.id ? '...' : 'Check Out'}
                onPress={() => handleCheckOut(visitor.id)}
                disabled={checkingIn === visitor.id}
                variant="secondary"
                style={styles.checkOutButton}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>No visitors inside</Text>
          </View>
        )}
      </View>
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
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: colors.success,
  },
  headerTitle: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: theme.fontSize.md,
    color: colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
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
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  insideDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  visitorCard: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  visitorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  visitorDetails: {
    flex: 1,
  },
  visitorName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  visitorMeta: {
    fontSize: theme.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  otpText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  checkInButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  checkOutButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: colors.textSecondary,
  },
});
