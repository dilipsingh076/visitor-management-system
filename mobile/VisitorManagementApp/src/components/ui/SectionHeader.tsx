import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme';
import { Text } from './Text';

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text variant="label" style={styles.title}>
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
    marginTop: theme.hub.sectionGap,
    marginBottom: theme.spacing.xs,
  },
  title: { fontWeight: '800' },
  subtitle: { marginTop: 2, fontSize: theme.fontSize.sm },
});
