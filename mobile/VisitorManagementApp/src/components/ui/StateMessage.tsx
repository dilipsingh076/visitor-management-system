import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors} from '../../theme/colors';
import {Text} from './Text';

interface StateMessageProps {
  kind?: 'info' | 'error' | 'success';
  text: string;
}

export function StateMessage({kind = 'info', text}: StateMessageProps) {
  return (
    <View style={[styles.base, kind === 'error' && styles.error, kind === 'success' && styles.success]}>
      <Text muted={kind === 'info'} style={kind === 'error' ? styles.errorText : kind === 'success' ? styles.successText : undefined}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
  },
  error: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  success: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  errorText: {
    color: colors.error,
  },
  successText: {
    color: colors.success,
  },
});
