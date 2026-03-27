/**
 * Theme context: light / dark / system, persisted to AsyncStorage.
 * Aligned with web (same palette tokens); system follows device Appearance.
 */
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Appearance} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {darkPalette, lightPalette, type ColorPalette} from './colors';

const THEME_STORAGE_KEY = '@vms_theme_mode';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  themeMode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  colors: ColorPalette;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() =>
    resolveMode('system'),
  );

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeModeState(stored);
          setResolvedMode(resolveMode(stored));
        }
      } catch {
        // keep default system
      }
    })();
  }, []);

  useEffect(() => {
    setResolvedMode(resolveMode(themeMode));
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== 'system') return;
    const sub = Appearance.addChangeListener(({colorScheme}) => {
      setResolvedMode(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, [themeMode]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    setResolvedMode(resolveMode(mode));
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const colors = useMemo(
    () => (resolvedMode === 'dark' ? darkPalette : lightPalette),
    [resolvedMode],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({themeMode, resolvedMode, colors, setThemeMode}),
    [themeMode, resolvedMode, colors, setThemeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
