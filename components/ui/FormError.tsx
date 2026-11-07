import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { colors, radius } from '@/constants/theme';

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View accessibilityRole="alert" style={styles.box}>
      <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
      <Txt variant="small" color={colors.danger} style={styles.text}>
        {message}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.input,
    backgroundColor: colors.dangerSoft,
  },
  text: { flex: 1 },
});
