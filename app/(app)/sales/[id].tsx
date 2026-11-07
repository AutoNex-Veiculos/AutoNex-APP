import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { ACTION_LABELS, ACTION_PERMISSION, DISCOUNT_LIMIT_PERCENT, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_TONES, STATUS_ACTIONS } from '@/constants/sales';
import { useAuth } from '@/context/AuthContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { salesService } from '@/services/sales.service';
import { getErrorMessage } from '@/services/api';
import { can } from '@/utils/permissions';
import { formatCurrency, formatDate } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';
import type { ProposalAction } from '@/types/sales';

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isWide } = useBreakpoint();
  const { session } = useAuth();
  const [confirming, setConfirming] = useState<ProposalAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['proposal', id], queryFn: () => salesService.getProposal(id), enabled: !!id });
  const run = useMutation({
    mutationFn: (action: ProposalAction) => salesService.runAction(id, action),
    onSuccess: () =>
      Promise.all(['proposal', 'proposals', 'sales', 'vehicles', 'entries', 'cases'].map((key) => queryClient.invalidateQueries({ queryKey: [key] }))),
  });

  const back = <BackLink href="/sales" label="Voltar às vendas" />;
  if (query.isLoading) return <Screen>{back}<Txt variant="small">Carregando…</Txt></Screen>;
  if (query.isError || !query.data) return <Screen>{back}<FormError message={query.error ? getErrorMessage(query.error) : 'Proposta não encontrada.'} /></Screen>;

  const p = query.data;
  const role = session?.user.role;
  const actions = STATUS_ACTIONS[p.status].filter((a) => {
    const permission = ACTION_PERMISSION[a];
    return !permission || can(role, permission);
  });
  const discount = ((p.listedPrice - p.offeredValue) / p.listedPrice) * 100;

  async function confirm() {
    if (!confirming) return;
    setError(null);
    try {
      await run.mutateAsync(confirming);
      setConfirming(null);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  const rows: [string, string][] = [
    ['Cliente', p.customerName],
    ['Veículo', p.vehicleLabel],
    ['Vendedor', p.sellerName],
    ['Preço de tabela', formatCurrency(p.listedPrice)],
    ['Valor da proposta', formatCurrency(p.offeredValue)],
    ['Desconto', `${discount.toFixed(1).replace('.', ',')}%`],
    ['Pagamento', p.paymentCondition],
    ...(p.tradeIn ? ([['Na troca', p.tradeIn]] as [string, string][]) : []),
    ['Válida até', formatDate(p.validUntil)],
  ];

  return (
    <Screen maxWidth={1000}>
      <View style={styles.header}>
        {back}
        <View style={styles.titleRow}>
          <Txt variant="displayL" accessibilityRole="header" style={styles.title}>Proposta de {p.customerName}</Txt>
          <Badge label={PROPOSAL_STATUS_LABELS[p.status]} tone={PROPOSAL_STATUS_TONES[p.status]} />
        </View>
      </View>

      <View style={[styles.columns, isWide ? styles.columnsWide : null]}>
        <View style={[styles.col, isWide ? styles.colWide : null]}>
          <Card>
            <Txt variant="heading">Condições</Txt>
            {rows.map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Txt variant="small">{label}</Txt>
                <Txt variant="label" style={styles.value}>{value}</Txt>
              </View>
            ))}
            {p.notes ? <Txt variant="small">Observações: {p.notes}</Txt> : null}
            {p.requiresApproval ? <Txt variant="caption">Desconto acima de {DISCOUNT_LIMIT_PERCENT}%: exige aprovação de gerente ou proprietário.</Txt> : null}
          </Card>

          {actions.length > 0 ? (
            <Card>
              <Txt variant="heading">Próximos passos</Txt>
              <FormError message={error} />
              {confirming ? (
                <View style={styles.confirm}>
                  <Txt variant="body">Confirmar: {ACTION_LABELS[confirming].toLowerCase()}?</Txt>
                  {confirming === 'close' ? <Txt variant="caption">O veículo será marcado como vendido, será criado um lançamento a receber e um atendimento de entrega.</Txt> : null}
                  <View style={styles.actions}>
                    <Button label="Confirmar" size="sm" loading={run.isPending} onPress={() => void confirm()} />
                    <Button label="Voltar" variant="secondary" size="sm" onPress={() => setConfirming(null)} />
                  </View>
                </View>
              ) : (
                <View style={styles.actions}>
                  {actions.map((a) => (
                    <Button
                      key={a}
                      label={ACTION_LABELS[a]}
                      size="sm"
                      variant={a === 'close' ? 'primary' : a === 'cancel' || a === 'reject' ? 'danger' : 'secondary'}
                      onPress={() => { setError(null); setConfirming(a); }}
                    />
                  ))}
                </View>
              )}
            </Card>
          ) : null}

          {p.status === 'CONVERTED' ? (
            <Card>
              <Txt variant="heading">Venda fechada</Txt>
              <Txt variant="small">O veículo foi baixado do estoque, o recebimento está no financeiro e a entrega foi aberta no pós-venda.</Txt>
              <View style={styles.actions}>
                <Button label="Ver financeiro" size="sm" variant="secondary" onPress={() => router.navigate('/finance')} />
                <Button label="Ver pós-venda" size="sm" variant="secondary" onPress={() => router.navigate('/aftersales')} />
              </View>
            </Card>
          ) : null}
        </View>

        <View style={[styles.col, isWide ? styles.colWide : null]}>
          <Card>
            <Txt variant="heading">Histórico</Txt>
            {[...p.history].reverse().map((e, i) => (
              <View key={`${e.at}-${i}`} style={styles.event}>
                <Txt variant="body">{e.text}</Txt>
                <Txt variant="caption">{formatDate(e.at)}</Txt>
              </View>
            ))}
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  title: { flexShrink: 1 },
  columns: { gap: spacing.lg },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { gap: spacing.lg },
  colWide: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  value: { flexShrink: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  confirm: { gap: spacing.md },
  event: { gap: 2, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.line },
});
