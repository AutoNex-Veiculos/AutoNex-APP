import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormChips, FormField, FormPicker } from '@/components/ui/FormControls';
import { CATEGORIES } from '@/constants/finance';
import { financeService } from '@/services/finance.service';
import { vehicleService } from '@/services/vehicle.service';
import { getErrorMessage } from '@/services/api';
import { entrySchema, type EntryFormInput } from '@/utils/schemas/finance';
import { addDaysIso, parseNumber } from '@/utils/format';
import { spacing } from '@/constants/theme';
import type { EntryType } from '@/types/finance';

export default function NewEntryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const vehicles = useQuery({ queryKey: ['vehicles'], queryFn: vehicleService.list });
  const create = useMutation({ mutationFn: financeService.create });
  const { control, handleSubmit, setValue } = useForm<EntryFormInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: { type: 'PAYABLE', description: '', category: CATEGORIES.PAYABLE[0], amount: '', dueDate: addDaysIso(7), vehicleId: '' },
  });

  const type = useWatch({ control, name: 'type' }) as EntryType;
  // Ao trocar entre a pagar e a receber, a categoria volta para a primeira da nova lista.
  useEffect(() => {
    setValue('category', CATEGORIES[type][0]);
  }, [type, setValue]);

  const vehicleOptions = [
    { value: '', label: 'Sem veículo associado' },
    ...(vehicles.data ?? []).filter((v) => v.status !== 'ARCHIVED').map((v) => ({ value: v.id, label: `${v.brand} ${v.model} ${v.yearModel}`, description: v.version })),
  ];

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await create.mutateAsync({
        type: values.type as EntryType,
        description: values.description,
        category: values.category,
        amount: parseNumber(values.amount) ?? 0,
        dueDate: values.dueDate,
        vehicleId: values.vehicleId || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['entries'] });
      router.navigate('/finance');
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  return (
    <Screen maxWidth={820}>
      <View style={styles.header}>
        <BackLink href="/finance" label="Voltar ao financeiro" />
        <PageHeader title="Novo lançamento" subtitle="Associe despesas a um veículo para que entrem no resultado dele." />
      </View>
      <FormError message={formError} />
      <Card>
        <FormChips
          control={control}
          name="type"
          label="Tipo"
          options={[{ value: 'PAYABLE', label: 'A pagar' }, { value: 'RECEIVABLE', label: 'A receber' }]}
        />
        <FormChips control={control} name="category" label="Categoria" options={CATEGORIES[type].map((c) => ({ value: c, label: c }))} />
        <FormField control={control} name="description" label="Descrição" />
        <FormField control={control} name="amount" label="Valor (R$)" keyboardType="numeric" placeholder="1.500" />
        <FormField control={control} name="dueDate" label="Vencimento (AAAA-MM-DD)" placeholder="2026-12-31" />
        <FormPicker control={control} name="vehicleId" label="Veículo (opcional)" options={vehicleOptions} />
      </Card>
      <Button label="Lançar" icon="checkmark" onPress={onSubmit} loading={create.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
});
