import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { spacing } from '@/constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Section({ title, subtitle, children }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Txt variant="displayM" accessibilityRole="header">
          {title}
        </Txt>
        {subtitle ? <Txt variant="small">{subtitle}</Txt> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.lg },
  header: { gap: 4 },
});
