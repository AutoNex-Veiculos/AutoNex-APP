import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme/tokens';

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View accessibilityRole="alert" style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 12,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  text: { color: colors.danger, fontSize: 14 },
});
