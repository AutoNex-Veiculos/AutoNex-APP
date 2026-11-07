import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
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
import { DISCOUNT_LIMIT_PERCENT, PAYMENT_CONDITIONS } from '@/constants/sales';
import { crmService } from '@/services/crm.service';
import { vehicleService } from '@/services/vehicle.service';
import { salesService } from '@/services/sales.service';
import { getErrorMessage } from '@/services/api';
import { proposalSchema, type ProposalFormInput } from '@/utils/schemas/sales';
import { addDaysIso, formatCurrency, parseNumber } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';

export default function NewProposalScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ customerId?: string; vehicleId?: string }>();
  const [formError, setFormError] = useState<string | null>(null);

  const customers = useQuery({ queryKey: ['customers'], queryFn: crmService.listCustomers });
  const vehicles = useQuery({ queryKey: ['vehicles'], queryFn: vehicleService.list });
  const create = useMutation({ mutationFn: salesService.createProposal });

  const { control, handleSubmit } = useForm<ProposalFormInput>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      customerId: params.customerId ?? '',
      vehicleId: params.vehicleId ?? '',
      offeredValue: '',
      paymentCondition: PAYMENT_CONDITIONS[0],
      tradeIn: '',
      validUntil: addDaysIso(7),
      notes: '',
    },
  });

  const vehicleId = useWatch({ control, name: 'vehicleId' });
  const offeredRaw = useWatch({ control, name: 'offeredValue' });
  const selected = vehicles.data?.find((v) => v.id === vehicleId);
  const offered = parseNumber(offeredRaw);
  const discount = selected && offered ? ((selected.price - offered) / selected.price) * 100 : null;

  const customerOptions = (customers.data ?? []).map((c) => ({ value: c.id, label: c.name, description: c.phone }));
  const vehicleOptions = (vehicles.data ?? [])
    .filter((v) => v.status === 'AVAILABLE' || v.status === 'NEGOTIATING')
    .map((v) => ({ value: v.id, label: `${v.brand} ${v.model} ${v.yearModel}`, description: `${v.version ?? ''} ${formatCurrency(v.price)}`.trim() }));

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const created = await create.mutateAsync({
        customerId: values.customerId,
        vehicleId: values.vehicleId,
        offeredValue: parseNumber(values.offeredValue) ?? 0,
        paymentCondition: values.paymentCondition,
        tradeIn: values.tradeIn || undefined,
        validUntil: values.validUntil,
        notes: values.notes || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['proposals'] });
      router.navigate({ pathname: '/sales/[id]', params: { id: created.id } });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  return (
    <Screen maxWidth={820}>
      <View style={styles.header}>
        <BackLink href="/sales" label="Voltar às vendas" />
        <PageHeader title="Nova proposta" subtitle="Descontos acima do limite precisam de aprovação de um gerente." />
      </View>
      <FormError message={formError} />

      <Card>
        <Txt variant="heading">Cliente e veículo</Txt>
        <FormPicker control={control} name="customerId" label="Cliente" options={customerOptions} emptyText="Cadastre um cliente em Clientes e leads primeiro." />
        <FormPicker control={control} name="vehicleId" label="Veículo" options={vehicleOptions} emptyText="Nenhum veículo disponível no estoque." />
      </Card>

      <Card>
        <Txt variant="heading">Condições</Txt>
        {selected ? <Txt variant="small">Preço de tabela: {formatCurrency(selected.price)}</Txt> : null}
        <FormField control={control} name="offeredValue" label="Valor da proposta (R$)" keyboardType="numeric" placeholder="115.000" />
        {discount !== null && discount > 0 ? (
          <Txt variant="small" color={discount > DISCOUNT_LIMIT_PERCENT ? colors.danger : colors.accent}>
            Desconto de {discount.toFixed(1).replace('.', ',')}%.{discount > DISCOUNT_LIMIT_PERCENT ? ` Acima de ${DISCOUNT_LIMIT_PERCENT}%: a proposta ficará aguardando aprovação.` : ''}
          </Txt>
        ) : null}
        {discount !== null && discount < 0 ? <Txt variant="small">Valor acima da tabela.</Txt> : null}
        <FormChips control={control} name="paymentCondition" label="Forma de pagamento" options={PAYMENT_CONDITIONS.map((c) => ({ value: c, label: c }))} />
        <FormField control={control} name="tradeIn" label="Veículo na troca (opcional)" />
        <FormField control={control} name="validUntil" label="Válida até (AAAA-MM-DD)" placeholder="2026-12-31" />
        <FormField control={control} name="notes" label="Observações (opcional)" multiline style={styles.multiline} />
      </Card>

      <Button label="Criar proposta" icon="checkmark" onPress={onSubmit} loading={create.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  multiline: { minHeight: 80, paddingTop: 12, textAlignVertical: 'top' },
});
