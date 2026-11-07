import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { spacing } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: Props) {
  const { isWide } = useBreakpoint();
  return (
    <View style={[styles.wrap, isWide ? styles.wide : null]}>
      <View style={styles.text}>
        <Txt variant="displayL" accessibilityRole="header">
          {title}
        </Txt>
        {subtitle ? <Txt variant="small">{subtitle}</Txt> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  wide: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  text: { gap: 6, flexShrink: 1 },
});
