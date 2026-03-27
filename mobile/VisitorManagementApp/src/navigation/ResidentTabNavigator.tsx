/**
 * Bottom tabs (resident / committee): Home, Visitors, Services, Account.
 * Notifications are accessed via the bell icon on the Home screen header.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { AppIcon } from '../components/icons/AppIcon';
import AccountHubScreen from '../screens/AccountHubScreen';
import ResidentDashboard from '../screens/ResidentDashboard';
import ServicesHubScreen from '../screens/ServicesHubScreen';
import VisitorsListScreen from '../screens/VisitorsListScreen';
import { useTheme } from '../theme';
import { stackScreenOptions } from './stackScreenOptions';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const VisitorsStack = createNativeStackNavigator();
const ServicesStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

function ResidentHomeStack() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={ResidentDashboard} />
    </HomeStack.Navigator>
  );
}

function ResidentVisitorsStack() {
  const { colors } = useTheme();
  const opts = useMemo(() => stackScreenOptions(colors), [colors]);
  return (
    <VisitorsStack.Navigator screenOptions={opts}>
      <VisitorsStack.Screen
        name="VisitorsMain"
        component={VisitorsListScreen}
        options={{ title: 'Visitors' }}
      />
    </VisitorsStack.Navigator>
  );
}

function ResidentServicesStack() {
  const { colors } = useTheme();
  const opts = useMemo(() => stackScreenOptions(colors), [colors]);
  return (
    <ServicesStack.Navigator screenOptions={opts}>
      <ServicesStack.Screen
        name="ServicesMain"
        component={ServicesHubScreen}
        options={{ title: 'Services' }}
      />
    </ServicesStack.Navigator>
  );
}

function ResidentAccountStack() {
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

export default function ResidentTabNavigator() {
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
        name="HomeTab"
        component={ResidentHomeStack}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="VisitorsTab"
        component={ResidentVisitorsStack}
        options={{
          title: 'Visitors',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="account-multiple-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ResidentServicesStack}
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="apps" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={ResidentAccountStack}
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
