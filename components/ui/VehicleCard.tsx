import { Pressable, StyleSheet, View } from 'react-native';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { STATUS_LABELS, STATUS_TONES } from '@/constants/vehicle';
import { colors, radius, spacing } from '@/constants/theme';
import { formatCurrency, formatKm } from '@/utils/format';
import type { Vehicle } from '@/types/vehicle';

interface Props {
  vehicle?: Vehicle;
  onPress?: () => void;
}

// Sem `vehicle`, mostra o cartão vazio (linhas cinzas no lugar dos dados).
export function VehicleCard({ vehicle, onPress }: Props) {
  if (!vehicle) {
    return (
      <View style={styles.card} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <ImageSlot aspectRatio={4 / 3} radius={0} hint="Foto do veículo" />
        <View style={styles.body}>
          <View style={[styles.line, { width: '70%', height: 16 }]} />
          <View style={[styles.line, { width: '45%' }]} />
          <View style={[styles.line, { width: '30%', height: 18, marginTop: 6, backgroundColor: colors.accentSoft }]} />
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${vehicle.brand} ${vehicle.model}, ${STATUS_LABELS[vehicle.status]}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ImageSlot source={vehicle.imageUrl} aspectRatio={4 / 3} radius={0} hint="Foto do veículo">
        <View style={styles.badge}>
          <Badge label={STATUS_LABELS[vehicle.status]} tone={STATUS_TONES[vehicle.status]} />
        </View>
      </ImageSlot>
      <View style={styles.body}>
        <Txt variant="heading" numberOfLines={1}>
          {vehicle.brand} {vehicle.model}
        </Txt>
        {vehicle.version ? (
          <Txt variant="small" numberOfLines={1}>
            {vehicle.version}
          </Txt>
        ) : null}
        <Txt variant="small">
          {vehicle.yearManufacture}/{vehicle.yearModel} — {formatKm(vehicle.mileage)}
        </Txt>
        <Txt variant="displayM" color={colors.accent} style={styles.price}>
          {formatCurrency(vehicle.price)}
        </Txt>
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
  pressed: { opacity: 0.9 },
  badge: { position: 'absolute', top: 12, left: 12 },
  body: { padding: spacing.lg, gap: 4 },
  price: { marginTop: 6 },
  line: { height: 12, borderRadius: 6, backgroundColor: colors.bg },
});
