import React, {useMemo} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import {useTheme} from '../../theme';
import {theme} from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const {colors} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          paddingVertical: 11,
          paddingHorizontal: 18,
          borderRadius: theme.borderRadius.xl,
          alignItems: 'center',
          justifyContent: 'center',
        },
        primary: {backgroundColor: colors.primary},
        secondary: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        fullWidth: {width: '100%'},
        disabled: {opacity: 0.6},
        text: {fontSize: 16, fontWeight: '600'},
        primaryText: {color: '#fff'},
        secondaryText: {color: colors.foreground},
      }),
    [colors],
  );
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text style={[styles.text, variant === 'primary' ? styles.primaryText : styles.secondaryText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
