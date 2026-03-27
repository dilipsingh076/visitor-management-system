import React, { useMemo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { AppIcon } from '../icons/AppIcon';
import { useTheme } from '../../theme';
import { theme } from '../../theme';
import { Text } from './Text';

type Props = TouchableOpacityProps & {
  title: string;
  hint?: string;
  icon: string;
  iconColor?: string;
};

export function ServiceTile({
  title,
  hint,
  icon,
  iconColor,
  style,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: theme.hub.tileMinHeight,
          backgroundColor: colors.card,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          gap: theme.spacing.md,
          ...theme.shadow.sm,
        },
        iconWrap: {
          width: 40,
          height: 40,
          borderRadius: theme.borderRadius.md,
          backgroundColor: colors.primary + '14',
          alignItems: 'center',
          justifyContent: 'center',
        },
        body: { flex: 1, minWidth: 0 },
        title: { fontWeight: '700', color: colors.text, fontSize: theme.fontSize.sm },
        hint: { fontSize: 12, color: colors.muted, marginTop: 2 },
        chev: { color: colors.muted, fontSize: 18, fontWeight: '700' },
      }),
    [colors],
  );

  return (
    <TouchableOpacity style={[styles.row, style]} activeOpacity={0.85} {...rest}>
      <View style={styles.iconWrap}>
        <AppIcon name={icon} size={22} color={iconColor ?? colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Text style={styles.chev}>›</Text>
    </TouchableOpacity>
  );
}
