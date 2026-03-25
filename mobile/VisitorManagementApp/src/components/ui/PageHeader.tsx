import React from 'react';
import {StyleSheet, View} from 'react-native';
import {theme} from '../../theme';
import {colors} from '../../theme/colors';
import {Text} from './Text';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({title, subtitle}: PageHeaderProps) {
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

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: colors.foreground,
  },
  subtitle: {
    marginTop: 4,
  },
});
