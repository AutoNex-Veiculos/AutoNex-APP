import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Txt } from '@/components/ui/Txt';
import { colors, radius, spacing } from '@/constants/theme';
import type { ImageInput } from '@/constants/images';
import type { IconName } from '@/types/ui';

interface Props {
  title: string;
  description: string;
  icon: IconName;
  image?: ImageInput;
  available: boolean;
  onPress?: () => void;
}

export function ModuleCard({ title, description, icon, image, available, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole={available ? 'button' : 'text'}
      accessibilityLabel={available ? title : `${title}, em breve`}
      disabled={!available}
      onPress={onPress}
      style={({ pressed }) => [styles.card, available ? styles.cardActive : null, pressed && styles.pressed]}
    >
      <ImageSlot source={image} aspectRatio={16 / 9} radius={0} hint={`Foto: ${title.toLowerCase()}`} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={18} color={colors.accent} />
          </View>
          <Txt variant="heading">{title}</Txt>
        </View>
        <Txt variant="small">{description}</Txt>
        <View style={styles.footer}>
          {available ? (
            <>
              <Txt variant="label" color={colors.accent}>
                Abrir
              </Txt>
              <Ionicons name="arrow-forward" size={16} color={colors.accent} />
            </>
          ) : (
            <Txt variant="caption">Em breve</Txt>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  cardActive: { borderColor: colors.accent },
  pressed: { opacity: 0.9 },
  body: { padding: spacing.lg, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
});
