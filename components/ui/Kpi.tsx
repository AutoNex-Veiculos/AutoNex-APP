import { StyleSheet, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  label: string;
  value: string;
  note?: string;
  tone?: 'accent' | 'danger' | 'ink';
}

export function Kpi({ label, value, note, tone = 'accent' }: Props) {
  const color = tone === 'danger' ? colors.danger : tone === 'ink' ? colors.ink : colors.accent;
  return (
    <View style={styles.kpi} accessible accessibilityLabel={`${label}: ${value}`}>
      <Txt variant="caption">{label}</Txt>
      <Txt variant="displayM" color={color}>
        {value}
      </Txt>
      {note ? <Txt variant="caption">{note}</Txt> : null}
    </View>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: {
    flexGrow: 1,
    flexBasis: 200,
    gap: 4,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
});
