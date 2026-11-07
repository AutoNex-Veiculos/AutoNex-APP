import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Logo } from '@/components/ui/Logo';
import { Txt } from '@/components/ui/Txt';
import { colors, fill, fonts, spacing } from '@/constants/theme';
import type { ImageInput } from '@/constants/images';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface Props {
  children: ReactNode;
  headline: string;
  subline: string;
  heroSource?: ImageInput;
  heroHint?: string;
}

// Telas de entrada: imagem grande de um lado e formulário do outro (empilhado no celular).
export function AuthShell({ children, headline, subline, heroSource, heroHint }: Props) {
  const { isWide } = useBreakpoint();
  const insets = useSafeAreaInsets();

  if (isWide) {
    return (
      <View style={styles.row}>
        <View style={styles.heroPane}>
          <ImageSlot source={heroSource} hint={heroHint} radius={0} overlay={!!heroSource} style={fill} />
          <View style={styles.heroContent}>
            <Logo tone="light" />
            <View style={styles.heroCopy}>
              <Txt style={styles.headline}>{headline}</Txt>
              <Txt style={styles.subline}>{subline}</Txt>
            </View>
          </View>
        </View>
        <ScrollView style={styles.formPane} contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.formInner}>{children}</View>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.mobileRoot} contentContainerStyle={styles.mobileScroll} keyboardShouldPersistTaps="handled">
      <View style={styles.mobileHero}>
        <ImageSlot source={heroSource} hint={heroHint} radius={0} overlay={!!heroSource} style={fill} />
        <View style={[styles.mobileHeroContent, { paddingTop: insets.top + spacing.lg }]}>
          <Logo tone="light" size={22} />
          <Txt style={styles.mobileHeadline}>{headline}</Txt>
        </View>
      </View>
      <View style={styles.sheet}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },
  heroPane: { flex: 1.15, backgroundColor: colors.panel, overflow: 'hidden' },
  heroContent: { ...fill, padding: 56, justifyContent: 'space-between' },
  heroCopy: { gap: 16, maxWidth: 560 },
  headline: { fontFamily: fonts.display, fontSize: 68, lineHeight: 68, letterSpacing: -0.5, color: colors.onPanel },
  subline: { fontFamily: fonts.body, fontSize: 18, lineHeight: 28, color: colors.onPanelMuted },
  formPane: { flex: 1, backgroundColor: colors.bg },
  formScroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  formInner: { width: '100%', maxWidth: 460, gap: 20 },

  mobileRoot: { flex: 1, backgroundColor: colors.panel },
  mobileScroll: { flexGrow: 1 },
  mobileHero: { height: 280, backgroundColor: colors.panel, overflow: 'hidden' },
  mobileHeroContent: { ...fill, paddingHorizontal: 24, paddingBottom: 48, justifyContent: 'space-between' },
  mobileHeadline: { fontFamily: fonts.display, fontSize: 38, lineHeight: 40, color: colors.onPanel },
  sheet: {
    flex: 1,
    marginTop: -24,
    padding: 24,
    gap: 20,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
