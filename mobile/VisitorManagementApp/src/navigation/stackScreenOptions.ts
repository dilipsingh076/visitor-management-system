import type { ColorPalette } from '../theme/colors';

export function stackScreenOptions(colors: ColorPalette) {
  return {
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: '#ffffff',
    headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
    /** Avoid showing internal route names (e.g. "MainTabs") beside the back chevron on iOS. */
    headerBackTitleVisible: false,
    headerBackTitle: '',
    /** iOS: keep a standard inline header; large titles add extra vertical padding in the bar. */
    headerLargeTitle: false,
  };
}
