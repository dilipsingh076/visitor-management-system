/**
 * App settings: theme (Light / Dark / System) and future options.
 */
import React from 'react';
import {View, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {Screen, Text, Card} from '../components/ui';
import {useTheme} from '../theme';
import type {ThemeMode} from '../theme';

const MODES: { value: ThemeMode; label: string }[] = [
  {value: 'light', label: 'Light'},
  {value: 'dark', label: 'Dark'},
  {value: 'system', label: 'System (device)'},
];

export default function SettingsScreen() {
  const {colors, themeMode, setThemeMode} = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        section: {
          marginBottom: 24,
        },
        sectionTitle: {
          fontSize: 13,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          color: colors.textSecondary,
          marginBottom: 12,
          paddingHorizontal: 4,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        optionLabel: {
          fontSize: 16,
          color: colors.text,
          fontWeight: '500',
        },
        optionValue: {
          fontSize: 14,
          color: colors.textSecondary,
        },
        pickerRow: {
          flexDirection: 'row',
          gap: 10,
          marginTop: 12,
          flexWrap: 'wrap',
        },
        pickerBtn: {
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 12,
          borderWidth: 1,
        },
        pickerBtnActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        pickerBtnInactive: {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pickerBtnText: {
          fontSize: 14,
          fontWeight: '600',
        },
        pickerBtnTextActive: {
          color: '#fff',
        },
        pickerBtnTextInactive: {
          color: colors.text,
        },
      }),
    [colors],
  );

  return (
    <Screen scroll>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card>
          <Text style={styles.optionLabel}>Theme</Text>
          <Text style={styles.optionValue}>
            {themeMode === 'system' ? 'Follows device' : themeMode === 'dark' ? 'Dark' : 'Light'}
          </Text>
          <View style={styles.pickerRow}>
            {MODES.map((m) => {
              const isActive = themeMode === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.pickerBtn, isActive ? styles.pickerBtnActive : styles.pickerBtnInactive]}
                  onPress={() => setThemeMode(m.value)}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.pickerBtnText,
                      isActive ? styles.pickerBtnTextActive : styles.pickerBtnTextInactive,
                    ]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
