import React, {useMemo} from 'react';
import {Text as RNText, StyleSheet, TextProps as RNTextProps} from 'react-native';
import {useTheme} from '../../theme';
import {theme} from '../../theme';

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  muted?: boolean;
}

export function Text({variant = 'body', muted, style, ...rest}: TextProps) {
  const {colors} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          color: colors.text,
          fontSize: theme.fontSize.md,
        },
        title: {
          fontSize: theme.fontSize.xl,
          fontWeight: '700',
        },
        subtitle: {
          fontSize: theme.fontSize.md,
          fontWeight: '500',
          color: colors.textSecondary,
        },
        body: {},
        caption: {
          fontSize: theme.fontSize.xs,
          color: colors.textSecondary,
        },
        label: {
          fontSize: theme.fontSize.sm,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          color: colors.textSecondary,
        },
        muted: {
          color: colors.textSecondary,
        },
      }),
    [colors],
  );
  return (
    <RNText
      style={[
        styles.base,
        variant === 'title' && styles.title,
        variant === 'subtitle' && styles.subtitle,
        variant === 'caption' && styles.caption,
        variant === 'label' && styles.label,
        muted && styles.muted,
        style,
      ]}
      {...rest}
    />
  );
}
