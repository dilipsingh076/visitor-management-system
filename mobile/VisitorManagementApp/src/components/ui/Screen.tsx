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

export type SafeAreaEdges = ('top' | 'right' | 'bottom' | 'left')[];

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  header?: React.ReactNode;
  /** Omit `bottom` when the screen sits above a bottom tab bar to avoid extra inset / a “cut” gap. */
  edges?: SafeAreaEdges;
}

export function Screen({children, scroll, header, style, edges, ...rest}: ScreenProps) {
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
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        },
        body: {
          flex: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
        },
        scrollContent: {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
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
    <SafeAreaView style={styles.safe} {...(edges ? {edges} : {})}>
      {header ? <View style={styles.header}>{header}</View> : null}
      {content}
    </SafeAreaView>
  );
}
