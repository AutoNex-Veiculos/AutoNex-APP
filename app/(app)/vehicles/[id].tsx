import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useCan } from '@/hooks/useCan';
import {
  CATEGORY_LABELS,
  FUEL_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
  STATUS_TRANSITIONS,
  TRANSMISSION_LABELS,
} from '@/constants/vehicle';
import { getErrorMessage } from '@/services/api';
import { vehicleService } from '@/services/vehicle.service';
import { colors, spacing } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatCurrency, formatKm } from '@/utils/format';
import { vehicleResult } from '@/utils/vehicle';
import type { VehicleStatus } from '@/types/vehicle';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isWide } = useBreakpoint();
  const canWrite = useCan('vehicles:write');
  const [confirming, setConfirming] = useState<VehicleStatus | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['vehicle', id], queryFn: () => vehicleService.get(id), enabled: !!id });
  const changeStatus = useMutation({
    mutationFn: (status: VehicleStatus) => vehicleService.updateStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vehicle', id] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
      ]);
    },
  });

  const back = (
    <Button label="Voltar ao estoque" icon="arrow-back" variant="ghost" size="sm" onPress={() => router.navigate('/vehicles')} style={styles.back} />
  );

  if (query.isLoading) {
    return (
      <Screen>
        {back}
        <Txt variant="small">Carregando veículo…</Txt>
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen>
        {back}
        <FormError message={query.error ? getErrorMessage(query.error) : 'Veículo não encontrado.'} />
      </Screen>
    );
  }

  const vehicle = query.data;
  const result = vehicleResult(vehicle);
  const transitions = STATUS_TRANSITIONS[vehicle.status];

  async function confirmChange() {
    if (!confirming) return;
    setActionError(null);
    try {
      await changeStatus.mutateAsync(confirming);
      setConfirming(null);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  const specs: [string, string][] = [
    ['Categoria', CATEGORY_LABELS[vehicle.category]],
    ['Ano', `${vehicle.yearManufacture}/${vehicle.yearModel}`],
    ['Quilometragem', formatKm(vehicle.mileage)],
    ['Cor', vehicle.color],
    ['Combustível', FUEL_LABELS[vehicle.fuel]],
    ['Câmbio', TRANSMISSION_LABELS[vehicle.transmission]],
    ...(vehicle.plate && canWrite ? ([['Placa', vehicle.plate]] as [string, string][]) : []),
  ];

  return (
    <Screen maxWidth={1000}>
      <View style={styles.header}>
        {back}
        <View style={styles.titleRow}>
          <Txt variant="displayL" accessibilityRole="header" style={styles.title}>
            {vehicle.brand} {vehicle.model}
          </Txt>
          <Badge label={STATUS_LABELS[vehicle.status]} tone={STATUS_TONES[vehicle.status]} />
        </View>
        {vehicle.version ? <Txt variant="small">{vehicle.version}</Txt> : null}
      </View>

      <View style={[styles.columns, isWide ? styles.columnsWide : null]}>
        <View style={[styles.main, isWide ? styles.mainWide : null]}>
          <ImageSlot source={vehicle.imageUrl} aspectRatio={16 / 10} hint="Fotos do veículo" />
          <Card>
            <Txt variant="displayM" color={colors.accent}>
              {formatCurrency(vehicle.price)}
            </Txt>
            <Txt variant="caption">Preço anunciado</Txt>
          </Card>
          {vehicle.description ? (
            <Card>
              <Txt variant="heading">Descrição</Txt>
              <Txt variant="body">{vehicle.description}</Txt>
            </Card>
          ) : null}
        </View>

        <View style={[styles.side, isWide ? styles.sideWide : null]}>
          <Card>
            <Txt variant="heading">Ficha técnica</Txt>
            {specs.map(([label, value]) => (
              <View key={label} style={styles.specRow}>
                <Txt variant="small">{label}</Txt>
                <Txt variant="label">{value}</Txt>
              </View>
            ))}
          </Card>

          {result ? (
            <Card>
              <Txt variant="heading">Custos e resultado</Txt>
              <View style={styles.specRow}>
                <Txt variant="small">Aquisição</Txt>
                <Txt variant="label">{formatCurrency(vehicle.acquisitionCost ?? 0)}</Txt>
              </View>
              <View style={styles.specRow}>
                <Txt variant="small">Custos adicionais</Txt>
                <Txt variant="label">{formatCurrency(vehicle.extraCosts ?? 0)}</Txt>
              </View>
              <View style={styles.specRow}>
                <Txt variant="small">Custo total</Txt>
                <Txt variant="label">{formatCurrency(result.totalCost)}</Txt>
              </View>
              <View style={styles.specRow}>
                <Txt variant="small">Resultado {result.kind === 'realized' ? 'realizado' : 'estimado'}</Txt>
                <Txt variant="heading" color={result.result >= 0 ? colors.accent : colors.danger}>
                  {formatCurrency(result.result)}
                </Txt>
              </View>
              <Txt variant="caption">Resultado = preço anunciado menos custo total. Descontos e comissões entram com o módulo de vendas.</Txt>
            </Card>
          ) : null}

          {canWrite && transitions.length > 0 ? (
            <Card>
              <Txt variant="heading">Alterar status</Txt>
              <FormError message={actionError} />
              {confirming ? (
                <View style={styles.confirm}>
                  <Txt variant="body">
                    Mudar para <Txt variant="label">{STATUS_LABELS[confirming]}</Txt>?
                  </Txt>
                  <View style={styles.actions}>
                    <Button label="Confirmar" size="sm" loading={changeStatus.isPending} onPress={() => void confirmChange()} />
                    <Button label="Cancelar" variant="secondary" size="sm" onPress={() => setConfirming(null)} />
                  </View>
                </View>
              ) : (
                <View style={styles.actions}>
                  {transitions.map((status) => (
                    <Button
                      key={status}
                      label={STATUS_LABELS[status]}
                      variant={status === 'ARCHIVED' ? 'danger' : 'secondary'}
                      size="sm"
                      onPress={() => {
                        setActionError(null);
                        setConfirming(status);
                      }}
                    />
                  ))}
                </View>
              )}
            </Card>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  title: { flexShrink: 1 },
  columns: { gap: spacing.lg },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { gap: spacing.lg },
  mainWide: { flex: 1.3 },
  side: { gap: spacing.lg },
  sideWide: { flex: 1 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  confirm: { gap: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
