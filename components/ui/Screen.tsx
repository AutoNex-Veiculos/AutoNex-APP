import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface Props {
  children: ReactNode;
  maxWidth?: number;
}

// Área rolável das telas internas. Os recuos de topo e rodapé ficam com o AppShell.
export function Screen({ children, maxWidth = 1120 }: Props) {
  const { isWide } = useBreakpoint();
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={[styles.inner, { maxWidth, padding: isWide ? spacing.xxl : spacing.lg }]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, alignItems: 'center' },
  inner: { width: '100%', gap: spacing.xl },
});
