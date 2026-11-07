import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormChips, FormField } from '@/components/ui/FormControls';
import { CASE_TYPES, CASE_TYPE_LABELS } from '@/constants/aftersales';
import { aftersalesService } from '@/services/aftersales.service';
import { getErrorMessage } from '@/services/api';
import { caseSchema, type CaseFormInput } from '@/utils/schemas/aftersales';
import { addDaysIso } from '@/utils/format';
import { spacing } from '@/constants/theme';
import type { CaseType } from '@/types/aftersales';

export default function NewCaseScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const create = useMutation({ mutationFn: aftersalesService.create });
  const { control, handleSubmit } = useForm<CaseFormInput>({
    resolver: zodResolver(caseSchema),
    defaultValues: { type: 'FOLLOW_UP', title: '', description: '', customerName: '', vehicleLabel: '', dueDate: addDaysIso(3) },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const created = await create.mutateAsync({
        type: values.type as CaseType,
        title: values.title,
        description: values.description || undefined,
        customerName: values.customerName,
        vehicleLabel: values.vehicleLabel,
        dueDate: values.dueDate,
      });
      await queryClient.invalidateQueries({ queryKey: ['cases'] });
      router.navigate({ pathname: '/aftersales/[id]', params: { id: created.id } });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  return (
    <Screen maxWidth={820}>
      <View style={styles.header}>
        <BackLink href="/aftersales" label="Voltar ao pós-venda" />
        <PageHeader title="Novo atendimento" subtitle="Entregas de vendas fechadas são abertas automaticamente." />
      </View>
      <FormError message={formError} />
      <Card>
        <FormChips control={control} name="type" label="Tipo" options={CASE_TYPES.map((t) => ({ value: t, label: CASE_TYPE_LABELS[t] }))} />
        <FormField control={control} name="title" label="Assunto" />
        <FormField control={control} name="customerName" label="Cliente" />
        <FormField control={control} name="vehicleLabel" label="Veículo" placeholder="Ex.: Honda Civic 2019" />
        <FormField control={control} name="dueDate" label="Prazo (AAAA-MM-DD)" placeholder="2026-12-31" />
        <FormField control={control} name="description" label="Detalhes (opcional)" multiline style={styles.multiline} />
      </Card>
      <Button label="Abrir atendimento" icon="checkmark" onPress={onSubmit} loading={create.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  multiline: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' },
});
