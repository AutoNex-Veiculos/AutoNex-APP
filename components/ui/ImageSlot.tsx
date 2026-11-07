import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { colors, fill, radius as radii } from '@/constants/theme';
import type { ImageInput } from '@/constants/images';

interface Props {
  source?: ImageInput;
  aspectRatio?: number;
  height?: number;
  radius?: number;
  /** Texto do espaço reservado, por exemplo "Foto do showroom". */
  hint?: string;
  /** Escurece a imagem para o texto por cima ficar legível. */
  overlay?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}

// Mostra a imagem quando existir; senão, um espaço reservado com a mesma proporção.
export function ImageSlot({ source, aspectRatio, height, radius = radii.image, hint, overlay = false, style, children }: Props) {
  return (
    <View
      style={[
        styles.box,
        { borderRadius: radius },
        aspectRatio ? { aspectRatio } : null,
        height ? { height } : null,
        style,
      ]}
    >
      {source ? (
        <Image source={source} contentFit="cover" transition={200} style={fill} />
      ) : (
        <View style={fill} pointerEvents="none">
          <View style={[styles.ring, styles.ringLarge]} />
          <View style={[styles.ring, styles.ringSmall]} />
          <View style={styles.center}>
            <Ionicons name="car-sport-outline" size={44} color={colors.onPanelMuted} style={styles.icon} />
          </View>
          {hint ? (
            <Txt variant="caption" color={colors.onPanelMuted} style={styles.hint}>
              {hint}
            </Txt>
          ) : null}
        </View>
      )}
      {overlay ? <View style={styles.scrim} pointerEvents="none" /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.panelRaised, overflow: 'hidden' },
  center: { ...fill, alignItems: 'center', justifyContent: 'center' },
  icon: { opacity: 0.45 },
  ring: { position: 'absolute', borderWidth: 1, borderColor: colors.panelLine, borderRadius: 999, aspectRatio: 1 },
  ringLarge: { width: '78%', right: '-24%', bottom: '-48%' },
  ringSmall: { width: '46%', right: '-8%', bottom: '-22%' },
  hint: { position: 'absolute', left: 16, bottom: 14 },
  scrim: { ...fill, backgroundColor: colors.scrim },
});
