import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';

interface Props {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}

export function Checkbox({ label, checked, onChange, error }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={() => onChange(!checked)}
        style={styles.row}
      >
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked ? <Text style={styles.tick}>✓</Text> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  tick: { color: colors.accentText, fontWeight: '700', fontSize: 14 },
  label: { color: colors.text, fontSize: 15, flex: 1 },
  error: { color: colors.danger, fontSize: 14 },
});
