import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormChips, FormField, FormPicker } from '@/components/ui/FormControls';
import { LEAD_SOURCES } from '@/constants/crm';
import { useCan } from '@/hooks/useCan';
import { crmService } from '@/services/crm.service';
import { vehicleService } from '@/services/vehicle.service';
import { getErrorMessage } from '@/services/api';
import { leadSchema, type LeadFormInput } from '@/utils/schemas/crm';
import { spacing } from '@/constants/theme';

export default function NewLeadScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canSeeVehicles = useCan('vehicles');
  const [formError, setFormError] = useState<string | null>(null);

  const vehicles = useQuery({ queryKey: ['vehicles'], queryFn: vehicleService.list, enabled: canSeeVehicles });
  const create = useMutation({ mutationFn: crmService.createLead });
  const { control, handleSubmit } = useForm<LeadFormInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: '', type: 'PERSON', document: '', phone: '', email: '', source: LEAD_SOURCES[0], vehicleId: '', note: '' },
  });

  const vehicleOptions = [
    { value: '', label: 'Sem veículo definido' },
    ...(vehicles.data ?? [])
      .filter((v) => v.status === 'AVAILABLE' || v.status === 'NEGOTIATING' || v.status === 'RESERVED')
      .map((v) => ({ value: v.id, label: `${v.brand} ${v.model} ${v.yearModel}`, description: v.version })),
  ];

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const lead = await create.mutateAsync({
        name: values.name,
        type: values.type as 'PERSON' | 'COMPANY',
        document: values.document || undefined,
        phone: values.phone,
        email: values.email || undefined,
        source: values.source,
        vehicleId: values.vehicleId || undefined,
        note: values.note || undefined,
      });
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['leads'] }), queryClient.invalidateQueries({ queryKey: ['customers'] })]);
      router.navigate({ pathname: '/crm/[id]', params: { id: lead.id } });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  return (
    <Screen maxWidth={820}>
      <View style={styles.header}>
        <BackLink href="/crm" label="Voltar ao funil" />
        <PageHeader title="Novo lead" subtitle="Se o telefone já existir, o cliente cadastrado é reaproveitado." />
      </View>
      <FormError message={formError} />

      <Card>
        <Txt variant="heading">Cliente</Txt>
        <FormField control={control} name="name" label="Nome completo ou razão social" />
        <FormChips control={control} name="type" label="Tipo" options={[{ value: 'PERSON', label: 'Pessoa física' }, { value: 'COMPANY', label: 'Empresa' }]} />
        <FormField control={control} name="phone" label="Telefone com DDD" placeholder="(11) 90000-0000" keyboardType="phone-pad" />
        <FormField control={control} name="email" label="E-mail (opcional)" autoCapitalize="none" keyboardType="email-address" />
        <FormField control={control} name="document" label="CPF ou CNPJ (opcional)" keyboardType="number-pad" />
      </Card>

      <Card>
        <Txt variant="heading">Oportunidade</Txt>
        <FormChips control={control} name="source" label="Origem" options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))} />
        {canSeeVehicles ? <FormPicker control={control} name="vehicleId" label="Veículo de interesse" options={vehicleOptions} /> : null}
        <FormField control={control} name="note" label="Anotação inicial (opcional)" multiline style={styles.multiline} />
      </Card>

      <Button label="Cadastrar lead" icon="checkmark" onPress={onSubmit} loading={create.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  multiline: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' },
});
