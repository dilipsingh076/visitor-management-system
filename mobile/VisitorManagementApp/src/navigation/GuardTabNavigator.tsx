/**
 * Bottom tabs (guard): Desk, Scan, Gate tools, Alerts, Account.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { AppIcon } from '../components/icons/AppIcon';
import AccountHubScreen from '../screens/AccountHubScreen';
import GuardDashboard from '../screens/GuardDashboard';
import NotificationsScreen from '../screens/NotificationsScreen';
import ScanHubScreen from '../screens/ScanHubScreen';
import ServicesHubScreen from '../screens/ServicesHubScreen';
import { useTheme } from '../theme';
import { stackScreenOptions } from './stackScreenOptions';

const Tab = createBottomTabNavigator();
const DeskStack = createNativeStackNavigator();
const ScanStack = createNativeStackNavigator();
const GateStack = createNativeStackNavigator();
const AlertsStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

function GuardDeskStack() {
  return (
    <DeskStack.Navigator screenOptions={{ headerShown: false }}>
      <DeskStack.Screen name="DeskMain" component={GuardDashboard} />
    </DeskStack.Navigator>
  );
}

function GuardScanStack() {
  const { colors } = useTheme();
  const opts = useMemo(() => stackScreenOptions(colors), [colors]);
  return (
    <ScanStack.Navigator screenOptions={opts}>
      <ScanStack.Screen
        name="ScanMain"
        component={ScanHubScreen}
        options={{ title: 'Scan' }}
      />
    </ScanStack.Navigator>
  );
}

function GuardGateStack() {
  const { colors } = useTheme();
  const opts = useMemo(() => stackScreenOptions(colors), [colors]);
  return (
    <GateStack.Navigator screenOptions={opts}>
      <GateStack.Screen
        name="GateMain"
        component={ServicesHubScreen}
        initialParams={{ variant: 'guard' }}
        options={{ title: 'Gate' }}
      />
    </GateStack.Navigator>
  );
}

function GuardAlertsStack() {
  const { colors } = useTheme();
  const opts = useMemo(() => stackScreenOptions(colors), [colors]);
  return (
    <AlertsStack.Navigator screenOptions={opts}>
      <AlertsStack.Screen
        name="AlertsMain"
        component={NotificationsScreen}
        options={{ title: 'Alerts' }}
      />
    </AlertsStack.Navigator>
  );
}

function GuardAccountStack() {
  const { colors } = useTheme();
  const opts = useMemo(() => stackScreenOptions(colors), [colors]);
  return (
    <AccountStack.Navigator screenOptions={opts}>
      <AccountStack.Screen
        name="AccountMain"
        component={AccountHubScreen}
        options={{ title: 'Account' }}
      />
    </AccountStack.Navigator>
  );
}

export default function GuardTabNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="DeskTab"
        component={GuardDeskStack}
        options={{
          title: 'Desk',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={GuardScanStack}
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="GateTab"
        component={GuardGateStack}
        options={{
          title: 'Gate',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="shield-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={GuardAlertsStack}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="bell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={GuardAccountStack}
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
