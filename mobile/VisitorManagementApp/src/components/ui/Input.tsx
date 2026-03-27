import React, {useMemo} from 'react';
import {View, Text, TextInput, TextInputProps, StyleSheet} from 'react-native';
import {useTheme} from '../../theme';
import {theme} from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({label, error, style, ...props}: InputProps) {
  const {colors} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {marginBottom: theme.spacing.md},
        label: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: theme.spacing.xs,
        },
        input: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.md,
          fontSize: 16,
          color: colors.foreground,
        },
        inputError: {borderColor: colors.error},
        errorText: {
          fontSize: 13,
          color: colors.error,
          marginTop: 6,
        },
      }),
    [colors],
  );
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
