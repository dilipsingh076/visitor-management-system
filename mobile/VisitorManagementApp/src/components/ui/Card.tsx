import React, {useMemo} from 'react';
import {View, StyleSheet, ViewProps} from 'react-native';
import {useTheme} from '../../theme';
import {theme} from '../../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({children, style, ...props}: CardProps) {
  const {colors} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          ...theme.shadow.sm,
        },
      }),
    [colors],
  );
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}
