import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';

interface Props {
  children: ReactNode;
  edges?: Edge[];
  maxWidth?: number;
}

export function Screen({ children, edges = ['top', 'bottom'], maxWidth = 960 }: Props) {
  return (
    <SafeAreaView edges={edges} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.inner, { maxWidth }]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, alignItems: 'center' },
  inner: { width: '100%', padding: spacing.lg, gap: spacing.lg },
});
