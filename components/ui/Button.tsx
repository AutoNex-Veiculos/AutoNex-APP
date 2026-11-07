import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { colors, fonts, radius } from '@/constants/theme';
import type { IconName } from '@/types/ui';

type Variant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger' | 'onPanel';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const palette: Record<Variant, { bg: string; border: string; fg: string }> = {
  primary: { bg: colors.accent, border: colors.accent, fg: colors.white },
  dark: { bg: colors.ink, border: colors.ink, fg: colors.white },
  secondary: { bg: colors.surface, border: colors.line, fg: colors.ink },
  ghost: { bg: 'transparent', border: 'transparent', fg: colors.accent },
  danger: { bg: 'transparent', border: colors.danger, fg: colors.danger },
  onPanel: { bg: 'transparent', border: colors.panelLine, fg: colors.onPanel },
};

export function Button({ label, onPress, variant = 'primary', size = 'md', icon, loading = false, disabled = false, style }: Props) {
  const isDisabled = disabled || loading;
  const p = palette[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: p.bg, borderColor: p.border },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={p.fg} /> : null}
          <Txt style={{ fontFamily: fonts.bodySemi, fontSize: size === 'sm' ? 14 : 16, color: p.fg }}>{label}</Txt>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.button, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  md: { minHeight: 50, paddingHorizontal: 20 },
  sm: { minHeight: 38, paddingHorizontal: 14 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
