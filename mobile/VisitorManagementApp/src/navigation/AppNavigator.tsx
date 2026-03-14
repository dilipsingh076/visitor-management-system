/**
 * Navigation setup with authentication flow.
 */
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text, StyleSheet} from 'react-native';

import {colors} from '../theme/colors';
import {isAuthenticated, getCachedUser, getPrimaryRole, User} from '../config/auth';

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
