import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { PageHeader } from '@/components/ui/PageHeader';
import { Kpi, KpiRow } from '@/components/ui/Kpi';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { FormError } from '@/components/ui/FormError';
import { EmptyState } from '@/components/ui/EmptyState';
import { STATUS_LABELS, STATUS_TONES } from '@/constants/finance';
import { financeService } from '@/services/finance.service';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { formatCurrency, formatDate, todayIso } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';
import type { EntryStatus, EntryType } from '@/types/finance';

export default function FinanceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [type, setType] = useState<'ALL' | EntryType>('ALL');
  const [status, setStatus] = useState<'ALL' | EntryStatus>('PENDING');
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['entries'], queryFn: financeService.list });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['entries'] });
  const pay = useMutation({ mutationFn: financeService.markPaid, onSuccess: refresh });
  const cancel = useMutation({ mutationFn: financeService.cancel, onSuccess: refresh });

  const all = useMemo(() => query.data ?? [], [query.data]);
  const today = todayIso();
  const stats = useMemo(() => {
    const pending = all.filter((e) => e.status === 'PENDING');
    const sum = (list: typeof all) => list.reduce((s, e) => s + e.amount, 0);
    const receivable = sum(pending.filter((e) => e.type === 'RECEIVABLE'));
    const payable = sum(pending.filter((e) => e.type === 'PAYABLE'));
    return { receivable, payable, balance: receivable - payable, overdue: sum(pending.filter((e) => e.dueDate < today)) };
  }, [all, today]);

  const filtered = all.filter((e) => (type === 'ALL' || e.type === type) && (status === 'ALL' || e.status === status));

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <Screen>
      <PageHeader
        title="Financeiro"
        subtitle="Valores previstos e realizados. Correções são feitas por cancelamento, nunca por exclusão."
        action={<Button label="Novo lançamento" icon="add" onPress={() => router.navigate('/finance/new')} />}
      />
      <KpiRow>
        <Kpi label="A receber (pendente)" value={formatCurrency(stats.receivable)} />
        <Kpi label="A pagar (pendente)" value={formatCurrency(stats.payable)} tone="ink" />
        <Kpi label="Saldo previsto" value={formatCurrency(stats.balance)} note="A receber menos a pagar, só pendentes." tone={stats.balance < 0 ? 'danger' : 'accent'} />
        <Kpi label="Vencidos" value={formatCurrency(stats.overdue)} tone={stats.overdue > 0 ? 'danger' : 'ink'} />
      </KpiRow>

      <View style={styles.filters}>
        <ChipGroup
          label="Tipo"
          options={[{ value: 'ALL', label: 'Todos' }, { value: 'RECEIVABLE', label: 'A receber' }, { value: 'PAYABLE', label: 'A pagar' }]}
          value={type}
          onChange={(v) => setType(v as 'ALL' | EntryType)}
        />
        <ChipGroup
          label="Situação"
          options={[{ value: 'ALL', label: 'Todas' }, { value: 'PENDING', label: 'Pendentes' }, { value: 'PAID', label: 'Pagos' }, { value: 'CANCELED', label: 'Cancelados' }]}
          value={status}
          onChange={(v) => setStatus(v as 'ALL' | EntryStatus)}
        />
      </View>

      {USE_MOCK ? <Txt variant="caption">Modo demonstração: dados simulados em memória.</Txt> : null}
      <FormError message={error} />
      {query.isLoading ? <Txt variant="small">Carregando lançamentos…</Txt> : null}
      {query.isError ? <FormError message={getErrorMessage(query.error)} /> : null}
      {query.isSuccess && filtered.length === 0 ? <EmptyState title="Nenhum lançamento nesses filtros" /> : null}

      <View style={styles.list}>
        {filtered.map((e) => {
          const overdue = e.status === 'PENDING' && e.dueDate < today;
          return (
            <Card key={e.id}>
              <View style={styles.top}>
                <View style={styles.main}>
                  <Txt variant="heading">{e.description}</Txt>
                  <Txt variant="small">{e.category}{e.vehicleLabel ? `, ${e.vehicleLabel}` : ''}</Txt>
                  <Txt variant="caption">
                    {e.status === 'PAID' && e.paidAt ? `Pago em ${formatDate(e.paidAt)}` : `Vence em ${formatDate(e.dueDate)}`}
                    {e.saleId ? ', gerado por venda' : ''}
                  </Txt>
                </View>
                <View style={styles.side}>
                  <Txt variant="heading" color={e.type === 'RECEIVABLE' ? colors.accent : colors.ink}>
                    {e.type === 'PAYABLE' ? '- ' : '+ '}
                    {formatCurrency(e.amount)}
                  </Txt>
                  <View style={styles.badges}>
                    <Badge label={e.type === 'RECEIVABLE' ? 'A receber' : 'A pagar'} />
                    <Badge label={overdue ? 'Vencido' : STATUS_LABELS[e.status]} tone={overdue ? 'warning' : STATUS_TONES[e.status]} />
                  </View>
                </View>
              </View>
              {e.status === 'PENDING' ? (
                <View style={styles.actions}>
                  <Button label={e.type === 'RECEIVABLE' ? 'Dar baixa (recebido)' : 'Dar baixa (pago)'} size="sm" loading={pay.isPending && pay.variables === e.id} onPress={() => void act(() => pay.mutateAsync(e.id))} />
                  <Button label="Cancelar" size="sm" variant="danger" loading={cancel.isPending && cancel.variables === e.id} onPress={() => void act(() => cancel.mutateAsync(e.id))} />
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: spacing.md },
  list: { gap: spacing.md },
  top: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  main: { flexGrow: 1, flexBasis: 240, gap: 3 },
  side: { gap: 6, alignItems: 'flex-start' },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
