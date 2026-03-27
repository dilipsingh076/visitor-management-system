import React, {useMemo} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ViewProps,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../theme';
import {theme} from '../../theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  header?: React.ReactNode;
}

export function Screen({children, scroll, header, style, ...rest}: ScreenProps) {
  const {colors} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
        },
        body: {
          flex: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        },
        scrollContent: {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        },
      }),
    [colors],
  );
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, style]} {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {header ? <View style={styles.header}>{header}</View> : null}
      {content}
    </SafeAreaView>
  );
}
