import { StyleSheet, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { colors } from '@/constants/theme';

interface Props {
  label: string;
  valueLabel: string;
  /** Proporção de 0 a 1. */
  ratio: number;
  tone?: 'accent' | 'ink' | 'danger';
}

export function BarRow({ label, valueLabel, ratio, tone = 'accent' }: Props) {
  const color = tone === 'danger' ? colors.danger : tone === 'ink' ? colors.ink : colors.accent;
  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${label}: ${valueLabel}`}>
      <View style={styles.top}>
        <Txt variant="label">{label}</Txt>
        <Txt variant="small">{valueLabel}</Txt>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, ratio)) * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.bg, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
});
