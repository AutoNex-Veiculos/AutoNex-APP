import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { colors } from '@/constants/theme';

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
          {checked ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
        </View>
        <Txt variant="small" color={colors.ink} style={styles.label}>
          {label}
        </Txt>
      </Pressable>
      {error ? (
        <Txt variant="small" color={colors.danger} accessibilityRole="alert">
          {error}
        </Txt>
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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { flex: 1 },
});
