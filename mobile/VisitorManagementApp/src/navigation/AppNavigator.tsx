/**
 * Navigation setup with authentication flow.
 */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  User,
  canAccessCommitteeFeatures,
  getCachedUser,
  getPrimaryRole,
  isAuthenticated,
} from '../config/auth';
import { useTheme } from '../theme';

// Screens
import AmenitiesScreen from '../screens/AmenitiesScreen';
import BuildingsScreen from '../screens/BuildingsScreen';
import CheckInScreen from '../screens/CheckInScreen';
import ComplaintsAdminScreen from '../screens/ComplaintsAdminScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import FrequentVisitorsScreen from '../screens/FrequentVisitorsScreen';
import GuardBlacklistScreen from '../screens/GuardBlacklistScreen';
import GuardDashboard from '../screens/GuardDashboard';
import LoginScreen from '../screens/LoginScreen';
import MeetingDetailScreen from '../screens/MeetingDetailScreen';
import MeetingsScreen from '../screens/MeetingsScreen';
import MoreScreen from '../screens/MoreScreen';
import MyFlatScreen from '../screens/MyFlatScreen';
import NearbyPlacesScreen from '../screens/NearbyPlacesScreen';
import NoticeCreationScreen from '../screens/NoticeCreationScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import ResidentDashboard from '../screens/ResidentDashboard';
import ScanDetailsScreen from '../screens/ScanDetailsScreen';
import ScanHistoryScreen from '../screens/ScanHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SocietySettingsScreen from '../screens/SocietySettingsScreen';
import StaffDirectoryScreen from '../screens/StaffDirectoryScreen';
import VisitPassScreen from '../screens/VisitPassScreen';
import VisitorDetailScreen from '../screens/VisitorDetailScreen';
import VisitorInviteScreen from '../screens/VisitorInviteScreen';
import VisitorsListScreen from '../screens/VisitorsListScreen';
import WalkInScreen from '../screens/WalkInScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        },
        loadingText: {
          color: colors.muted,
          fontSize: 16,
        },
      }),
    [colors],
  );
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function MainNavigator() {
  const { colors } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
    }),
    [colors],
  );

  useEffect(() => {
    const loadUser = async () => {
      const cachedUser = await getCachedUser();
      setUser(cachedUser);
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const role = getPrimaryRole(user);
  const isGuard = role === 'guard';
  // If role is missing/unknown, default to resident flow (matches home screen).
  const isResident = role === 'resident' || (!role && !isGuard);
  const isResident = role === 'resident';
  const isCommittee = canAccessCommitteeFeatures(user);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {/* Role-based home screen */}
      {isGuard ? (
        <Stack.Screen
          name="GuardDashboard"
          component={GuardDashboard}
          options={{ title: 'Security Desk', headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="ResidentDashboard"
          component={ResidentDashboard}
          options={{ title: 'Dashboard', headerShown: false }}
        />
      )}

      {/* Guard-specific screens */}
      {isGuard && (
        <>
          <Stack.Screen
            name="QRScanner"
            component={QRScannerScreen}
            options={{
              title: 'Scan QR Code',
              headerShown: false,
              presentation: 'fullScreenModal',
            }}
          />
          <Stack.Screen
            name="WalkIn"
            component={WalkInScreen}
            options={{ title: 'Walk-in Registration' }}
          />
          <Stack.Screen
            name="GuardBlacklist"
            component={GuardBlacklistScreen}
            options={{ title: 'Blacklist' }}
          />
          <Stack.Screen
            name="ScanHistory"
            component={ScanHistoryScreen}
            options={{ title: 'Scan history' }}
          />
          <Stack.Screen
            name="ScanDetails"
            component={ScanDetailsScreen}
            options={{ title: 'Scan details' }}
          />
        </>
      )}

      {/* Resident-specific screens */}
      {isResident && (
        <>
          <Stack.Screen
            name="VisitorInvite"
            component={VisitorInviteScreen}
            options={{ title: 'Invite Visitor' }}
          />
          <Stack.Screen
            name="MyVisitors"
            component={DashboardScreen}
            options={{ title: 'My Visitors' }}
          />
        </>
      )}

      {/* Common screens */}
      <Stack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ title: 'Check In' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="VisitorsList"
        component={VisitorsListScreen}
        options={{ title: 'Visitors' }}
      />
      <Stack.Screen
        name="VisitorDetail"
        component={VisitorDetailScreen}
        options={{ title: 'Visitor Detail' }}
      />
      <Stack.Screen
        name="FrequentVisitors"
        component={FrequentVisitorsScreen}
        options={{ title: 'Frequent Visitors' }}
      />
      <Stack.Screen
        name="VisitPass"
        component={VisitPassScreen}
        options={{ title: 'Visit Pass' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="MyFlat"
        component={MyFlatScreen}
        options={{ title: 'My Flat' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      {isCommittee && (
        <>
          <Stack.Screen
            name="Amenities"
            component={AmenitiesScreen}
            options={{ title: 'Amenities' }}
          />
          <Stack.Screen
            name="ComplaintsAdmin"
            component={ComplaintsAdminScreen}
            options={{ title: 'Complaints' }}
          />
          <Stack.Screen
            name="StaffDirectory"
            component={StaffDirectoryScreen}
            options={{ title: 'Staff' }}
          />
          <Stack.Screen
            name="Buildings"
            component={BuildingsScreen}
            options={{ title: 'Buildings' }}
          />
          <Stack.Screen
            name="NearbyPlaces"
            component={NearbyPlacesScreen}
            options={{ title: 'Nearby Places' }}
          />
          <Stack.Screen
            name="Meetings"
            component={MeetingsScreen}
            options={{ title: 'Meetings' }}
          />
          <Stack.Screen
            name="MeetingDetail"
            component={MeetingDetailScreen}
            options={{ title: 'Meeting Detail' }}
          />
          <Stack.Screen
            name="SocietySettings"
            component={SocietySettingsScreen}
            options={{ title: 'Settings' }}
          />
          <Stack.Screen
            name="NoticeCreation"
            component={NoticeCreationScreen}
            options={{ title: 'Create Notice' }}
          />
        </>
      )}
      <Stack.Screen
        name="More"
        component={MoreScreen}
        options={{ title: 'All Features' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();
  const [initializing, setInitializing] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const initialStyles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        },
        logoContainer: {
          width: 80,
          height: 80,
          borderRadius: 20,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        },
        logoText: {
          fontSize: 28,
          fontWeight: '800',
          color: '#FFFFFF',
        },
        loadingText: {
          color: colors.muted,
          fontSize: 16,
        },
      }),
    [colors],
  );

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await isAuthenticated();
      setAuthenticated(authed);
      setInitializing(false);
    };
    checkAuth();
  }, []);

  if (initializing) {
    return (
      <View style={initialStyles.loadingContainer}>
        <View style={initialStyles.logoContainer}>
          <Text style={initialStyles.logoText}>VMS</Text>
        </View>
        <Text style={initialStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={authenticated ? 'Main' : 'Login'}
      >
        {/* Always register routes so reset() can target them */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
