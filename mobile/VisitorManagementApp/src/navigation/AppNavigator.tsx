/**
 * Navigation setup with authentication flow.
 */
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text, StyleSheet} from 'react-native';

import {colors} from '../theme/colors';
import {isAuthenticated, getCachedUser, getPrimaryRole, canAccessCommitteeFeatures, User} from '../config/auth';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResidentDashboard from '../screens/ResidentDashboard';
import GuardDashboard from '../screens/GuardDashboard';
import GuardBlacklistScreen from '../screens/GuardBlacklistScreen';
import CheckInScreen from '../screens/CheckInScreen';
import VisitorInviteScreen from '../screens/VisitorInviteScreen';
import DashboardScreen from '../screens/DashboardScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import WalkInScreen from '../screens/WalkInScreen';
import ScanHistoryScreen from '../screens/ScanHistoryScreen';
import ScanDetailsScreen from '../screens/ScanDetailsScreen';
import VisitorsListScreen from '../screens/VisitorsListScreen';
import VisitorDetailScreen from '../screens/VisitorDetailScreen';
import FrequentVisitorsScreen from '../screens/FrequentVisitorsScreen';
import VisitPassScreen from '../screens/VisitPassScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MyFlatScreen from '../screens/MyFlatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AmenitiesScreen from '../screens/AmenitiesScreen';
import ComplaintsAdminScreen from '../screens/ComplaintsAdminScreen';
import StaffDirectoryScreen from '../screens/StaffDirectoryScreen';
import BuildingsScreen from '../screens/BuildingsScreen';
import NearbyPlacesScreen from '../screens/NearbyPlacesScreen';
import MeetingsScreen from '../screens/MeetingsScreen';
import MeetingDetailScreen from '../screens/MeetingDetailScreen';
import SocietySettingsScreen from '../screens/SocietySettingsScreen';
import NoticeCreationScreen from '../screens/NoticeCreationScreen';
import MoreScreen from '../screens/MoreScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.primary,
  },
  headerTintColor: '#ffffff',
  headerTitleStyle: {fontWeight: '700' as const, fontSize: 18},
  headerShadowVisible: false,
  contentStyle: {backgroundColor: colors.background},
};

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function MainNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
  const isResident = role === 'resident';
  const isCommittee = canAccessCommitteeFeatures(user);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {/* Role-based home screen */}
      {isGuard ? (
        <Stack.Screen
          name="GuardDashboard"
          component={GuardDashboard}
          options={{title: 'Security Desk', headerShown: false}}
        />
      ) : (
        <Stack.Screen
          name="ResidentDashboard"
          component={ResidentDashboard}
          options={{title: 'Dashboard', headerShown: false}}
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
            options={{title: 'Walk-in Registration'}}
          />
          <Stack.Screen
            name="GuardBlacklist"
            component={GuardBlacklistScreen}
            options={{title: 'Blacklist'}}
          />
          <Stack.Screen
            name="ScanHistory"
            component={ScanHistoryScreen}
            options={{title: 'Scan history'}}
          />
          <Stack.Screen
            name="ScanDetails"
            component={ScanDetailsScreen}
            options={{title: 'Scan details'}}
          />
        </>
      )}

      {/* Resident-specific screens */}
      {isResident && (
        <>
          <Stack.Screen
            name="VisitorInvite"
            component={VisitorInviteScreen}
            options={{title: 'Invite Visitor'}}
          />
          <Stack.Screen
            name="MyVisitors"
            component={DashboardScreen}
            options={{title: 'My Visitors'}}
          />
        </>
      )}

      {/* Common screens */}
      <Stack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{title: 'Check In'}}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{title: 'Dashboard'}}
      />
      <Stack.Screen name="VisitorsList" component={VisitorsListScreen} options={{title: 'Visitors'}} />
      <Stack.Screen name="VisitorDetail" component={VisitorDetailScreen} options={{title: 'Visitor Detail'}} />
      <Stack.Screen name="FrequentVisitors" component={FrequentVisitorsScreen} options={{title: 'Frequent Visitors'}} />
      <Stack.Screen name="VisitPass" component={VisitPassScreen} options={{title: 'Visit Pass'}} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{title: 'Notifications'}} />
      <Stack.Screen name="MyFlat" component={MyFlatScreen} options={{title: 'My Flat'}} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{title: 'Profile'}} />
      {isCommittee && (
        <>
          <Stack.Screen name="Amenities" component={AmenitiesScreen} options={{title: 'Amenities'}} />
          <Stack.Screen name="ComplaintsAdmin" component={ComplaintsAdminScreen} options={{title: 'Complaints'}} />
          <Stack.Screen name="StaffDirectory" component={StaffDirectoryScreen} options={{title: 'Staff'}} />
          <Stack.Screen name="Buildings" component={BuildingsScreen} options={{title: 'Buildings'}} />
          <Stack.Screen name="NearbyPlaces" component={NearbyPlacesScreen} options={{title: 'Nearby Places'}} />
          <Stack.Screen name="Meetings" component={MeetingsScreen} options={{title: 'Meetings'}} />
          <Stack.Screen name="MeetingDetail" component={MeetingDetailScreen} options={{title: 'Meeting Detail'}} />
          <Stack.Screen name="SocietySettings" component={SocietySettingsScreen} options={{title: 'Settings'}} />
          <Stack.Screen name="NoticeCreation" component={NoticeCreationScreen} options={{title: 'Create Notice'}} />
        </>
      )}
      <Stack.Screen name="More" component={MoreScreen} options={{title: 'All Features'}} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

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
      <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>VMS</Text>
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={authenticated ? 'Main' : 'Login'}>
        {/* Always register routes so reset() can target them */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
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
});
