/** Material Design Icons — RNVI 13 native package (works with New Architecture). */
import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useTheme } from '../../theme';

export type AppIconName = string;

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
};

export function AppIcon({ name, size = 22, color }: Props) {
  const { colors } = useTheme();
  return (
    <MaterialDesignIcons
      name={name}
      size={size}
      color={color ?? colors.primary}
      allowFontScaling={false}
      style={styles.icon}
    />
  );
}

const styles = StyleSheet.create({
  icon: { textAlign: 'center' },
});
