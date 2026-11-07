import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Txt } from '@/components/ui/Txt';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { FormError } from '@/components/ui/FormError';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useCan } from '@/hooks/useCan';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  FUELS,
  FUEL_LABELS,
  TRANSMISSIONS,
  TRANSMISSION_LABELS,
} from '@/constants/vehicle';
import { getErrorMessage } from '@/services/api';
import { vehicleService } from '@/services/vehicle.service';
import { vehicleSchema, type VehicleFormInput } from '@/utils/schemas/vehicle';
import { toVehiclePayload } from '@/utils/vehicle';
import { spacing } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

function Row({ children, wide }: { children: ReactNode; wide: boolean }) {
  return <View style={[styles.row, wide ? null : styles.rowStacked]}>{children}</View>;
}

export default function NewVehicleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isWide } = useBreakpoint();
  const canWrite = useCan('vehicles:write');
  const canCosts = useCan('vehicles:costs');
  const [formError, setFormError] = useState<string | null>(null);

  const create = useMutation({ mutationFn: vehicleService.create });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      category: 'CAR',
      brand: '',
      model: '',
      version: '',
      plate: '',
      yearManufacture: '',
      yearModel: '',
      mileage: '',
      color: '',
      fuel: 'FLEX',
      transmission: 'AUTOMATIC',
      price: '',
      acquisitionCost: '',
      extraCosts: '',
      description: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const created = await create.mutateAsync(toVehiclePayload(values));
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      router.navigate({ pathname: '/vehicles/[id]', params: { id: created.id } });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  const text = (name: keyof VehicleFormInput, label: string, extra?: { placeholder?: string; numeric?: boolean; multiline?: boolean }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.col}>
          <TextField
            label={label}
            value={String(value ?? '')}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={extra?.placeholder}
            keyboardType={extra?.numeric ? 'numeric' : 'default'}
            multiline={extra?.multiline}
            style={extra?.multiline ? styles.multiline : undefined}
            error={errors[name]?.message}
          />
        </View>
      )}
    />
  );

  if (!canWrite) {
    return (
      <Screen>
        <Txt variant="displayL">Novo veículo</Txt>
        <Txt variant="body">Você não tem permissão para cadastrar veículos.</Txt>
        <Button label="Voltar ao estoque" variant="secondary" onPress={() => router.navigate('/vehicles')} />
      </Screen>
    );
  }

  return (
    <Screen maxWidth={860}>
      <View style={styles.header}>
        <Button label="Voltar ao estoque" icon="arrow-back" variant="ghost" size="sm" onPress={() => router.navigate('/vehicles')} style={styles.back} />
        <Txt variant="displayL" accessibilityRole="header">
          Novo veículo
        </Txt>
        <Txt variant="small">O veículo é cadastrado como "Em preparação". Depois você o marca como disponível.</Txt>
      </View>

      <FormError message={formError} />

      <Card>
        <Txt variant="heading">Identificação</Txt>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <ChipGroup label="Categoria" options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))} value={value} onChange={onChange} />
          )}
        />
        <Row wide={isWide}>
          {text('brand', 'Marca', { placeholder: 'Ex.: Toyota' })}
          {text('model', 'Modelo', { placeholder: 'Ex.: Corolla' })}
        </Row>
        <Row wide={isWide}>
          {text('version', 'Versão (opcional)', { placeholder: 'Ex.: XEi 2.0 Flex' })}
          {text('plate', 'Placa (opcional)', { placeholder: 'ABC1D23' })}
        </Row>
      </Card>

      <Card>
        <Txt variant="heading">Ano, quilometragem e características</Txt>
        <Row wide={isWide}>
          {text('yearManufacture', 'Ano de fabricação', { placeholder: '2021', numeric: true })}
          {text('yearModel', 'Ano do modelo', { placeholder: '2021', numeric: true })}
        </Row>
        <Row wide={isWide}>
          {text('mileage', 'Quilometragem', { placeholder: '48.200', numeric: true })}
          {text('color', 'Cor', { placeholder: 'Prata' })}
        </Row>
        <Controller
          control={control}
          name="fuel"
          render={({ field: { onChange, value } }) => (
            <ChipGroup label="Combustível" options={FUELS.map((f) => ({ value: f, label: FUEL_LABELS[f] }))} value={value} onChange={onChange} />
          )}
        />
        <Controller
          control={control}
          name="transmission"
          render={({ field: { onChange, value } }) => (
            <ChipGroup label="Câmbio" options={TRANSMISSIONS.map((t) => ({ value: t, label: TRANSMISSION_LABELS[t] }))} value={value} onChange={onChange} />
          )}
        />
      </Card>

      <Card>
        <Txt variant="heading">Preço{canCosts ? ' e custos' : ''}</Txt>
        <Row wide={isWide}>{text('price', 'Preço anunciado (R$)', { placeholder: '118.900', numeric: true })}</Row>
        {canCosts ? (
          <Row wide={isWide}>
            {text('acquisitionCost', 'Custo de aquisição (R$, opcional)', { placeholder: '101.000', numeric: true })}
            {text('extraCosts', 'Custos adicionais (R$, opcional)', { placeholder: '3.200', numeric: true })}
          </Row>
        ) : null}
      </Card>

      <Card>
        <Txt variant="heading">Descrição e fotos</Txt>
        {text('description', 'Descrição comercial (opcional)', { multiline: true })}
        <ImageSlot aspectRatio={16 / 6} hint="O envio de fotos entra quando a API de arquivos estiver pronta" />
      </Card>

      <Button label="Cadastrar veículo" icon="checkmark" onPress={onSubmit} loading={create.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  row: { flexDirection: 'row', gap: spacing.md },
  rowStacked: { flexDirection: 'column' },
  col: { flex: 1 },
  multiline: { minHeight: 110, paddingTop: 12, textAlignVertical: 'top' },
});
