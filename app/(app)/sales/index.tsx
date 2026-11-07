import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
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
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_TONES } from '@/constants/sales';
import { useCan } from '@/hooks/useCan';
import { salesService } from '@/services/sales.service';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { colors, radius, spacing } from '@/constants/theme';

type Tab = 'proposals' | 'sales';
const OPEN = ['DRAFT', 'PENDING_APPROVAL', 'SENT', 'ACCEPTED'];

export default function SalesScreen() {
  const router = useRouter();
  const canSeeCommission = useCan('sales:approve');
  const [tab, setTab] = useState<Tab>('proposals');
  const proposals = useQuery({ queryKey: ['proposals'], queryFn: salesService.listProposals });
  const sales = useQuery({ queryKey: ['sales'], queryFn: salesService.listSales });

  const stats = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    const monthSales = (sales.data ?? []).filter((s) => s.closedAt.slice(0, 7) === month);
    return {
      open: (proposals.data ?? []).filter((p) => OPEN.includes(p.status)).length,
      count: monthSales.length,
      total: monthSales.reduce((sum, s) => sum + s.saleValue, 0),
    };
  }, [proposals.data, sales.data]);

  return (
    <Screen>
      <PageHeader
        title="Vendas"
        subtitle="Propostas, aprovação de descontos e fechamento."
        action={<Button label="Nova proposta" icon="add" onPress={() => router.navigate('/sales/new')} />}
      />
      <KpiRow>
        <Kpi label="Propostas em aberto" value={String(stats.open)} />
        <Kpi label="Vendas no mês" value={String(stats.count)} />
        <Kpi label="Valor vendido no mês" value={formatCurrency(stats.total)} tone="ink" />
      </KpiRow>

      <ChipGroup
        options={[
          { value: 'proposals', label: `Propostas (${proposals.data?.length ?? 0})` },
          { value: 'sales', label: `Vendas fechadas (${sales.data?.length ?? 0})` },
        ]}
        value={tab}
        onChange={(v) => setTab(v as Tab)}
      />
      {USE_MOCK ? <Txt variant="caption">Modo demonstração: dados simulados em memória.</Txt> : null}
      {proposals.isError ? <FormError message={getErrorMessage(proposals.error)} /> : null}

      {tab === 'proposals' ? (
        <View style={styles.list}>
          {proposals.isLoading ? <Txt variant="small">Carregando propostas…</Txt> : null}
          {proposals.isSuccess && proposals.data.length === 0 ? (
            <EmptyState title="Nenhuma proposta" message="Crie a primeira proposta a partir de um cliente e de um veículo." actionLabel="Nova proposta" onAction={() => router.navigate('/sales/new')} />
          ) : null}
          {proposals.data?.map((p) => {
            const discount = ((p.listedPrice - p.offeredValue) / p.listedPrice) * 100;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`Proposta de ${p.customerName}`}
                onPress={() => router.navigate({ pathname: '/sales/[id]', params: { id: p.id } })}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={styles.rowMain}>
                  <Txt variant="heading">{p.customerName}</Txt>
                  <Txt variant="small">{p.vehicleLabel}</Txt>
                  <Txt variant="caption">
                    {p.sellerName}, válida até {formatDate(p.validUntil)}
                  </Txt>
                </View>
                <View style={styles.rowSide}>
                  <Txt variant="displayM" color={colors.accent}>{formatCurrency(p.offeredValue)}</Txt>
                  <Txt variant="caption">Tabela {formatCurrency(p.listedPrice)}{discount > 0 ? `, desconto de ${discount.toFixed(1).replace('.', ',')}%` : ''}</Txt>
                  <Badge label={PROPOSAL_STATUS_LABELS[p.status]} tone={PROPOSAL_STATUS_TONES[p.status]} />
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.list}>
          {sales.isLoading ? <Txt variant="small">Carregando vendas…</Txt> : null}
          {sales.isSuccess && sales.data.length === 0 ? <EmptyState title="Nenhuma venda fechada" message="As vendas aparecem aqui quando uma proposta aceita é fechada." /> : null}
          {sales.data?.map((s) => (
            <Card key={s.id}>
              <View style={styles.saleTop}>
                <Txt variant="heading">{s.customerName}</Txt>
                <Txt variant="heading" color={colors.accent}>{formatCurrency(s.saleValue)}</Txt>
              </View>
              <Txt variant="small">{s.vehicleLabel}</Txt>
              <Txt variant="caption">
                {s.sellerName}, fechada em {formatDate(s.closedAt)}
                {canSeeCommission ? `. Comissão de ${(s.commissionRate * 100).toFixed(0)}%: ${formatCurrency(s.commission)}` : ''}
              </Txt>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.9 },
  rowMain: { flexGrow: 1, flexBasis: 240, gap: 3 },
  rowSide: { gap: 4, alignItems: 'flex-start' },
  saleTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
});
