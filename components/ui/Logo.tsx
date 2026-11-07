import { StyleSheet, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { colors, fonts } from '@/constants/theme';

interface Props {
  tone?: 'dark' | 'light';
  size?: number;
}

export function Logo({ tone = 'dark', size = 26 }: Props) {
  const mark = size * 1.45;
  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="AutoNex">
      <View
        style={{
          width: mark,
          height: mark,
          borderRadius: mark * 0.28,
          backgroundColor: tone === 'light' ? colors.accentOnPanel : colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Txt style={{ fontFamily: fonts.display, fontSize: size, lineHeight: size + 2, color: tone === 'light' ? colors.panel : colors.white }}>
          A
        </Txt>
      </View>
      <Txt
        style={{
          fontFamily: fonts.display,
          fontSize: size + 2,
          lineHeight: size + 4,
          letterSpacing: 0.2,
          color: tone === 'light' ? colors.onPanel : colors.ink,
        }}
      >
        AutoNex
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
