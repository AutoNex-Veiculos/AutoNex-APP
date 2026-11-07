import { StyleSheet, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { colors, fonts, radius } from '@/constants/theme';
import type { BadgeTone } from '@/types/ui';

const tones: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: colors.bg, fg: colors.inkMuted },
  accent: { bg: colors.accentSoft, fg: colors.accentDark },
  glass: { bg: 'rgba(255,255,255,0.16)', fg: colors.white },
  warning: { bg: '#F6EBD0', fg: '#7A5A12' },
  dark: { bg: colors.ink, fg: colors.white },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Txt style={{ fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: t.fg }}>{label}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.chip },
});
