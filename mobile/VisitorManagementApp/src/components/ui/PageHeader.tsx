import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {theme, useTheme} from '../../theme';
import {Text} from './Text';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({title, subtitle}: PageHeaderProps) {
  const {colors} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginBottom: theme.spacing.xs,
        },
        title: {
          color: colors.foreground,
        },
        subtitle: {
          marginTop: 2,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <Text variant="title" style={styles.title}>
        {title}
      </Text>
      {subtitle ? (
        <Text muted style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
