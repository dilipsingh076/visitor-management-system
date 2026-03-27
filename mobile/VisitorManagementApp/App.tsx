/**
 * Visitor Management System Mobile App
 * React Native CLI (no Expo)
 *
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider, useTheme} from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent(): React.JSX.Element {
  const {resolvedMode} = useTheme();
  const isDark = resolvedMode === 'dark';
  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
