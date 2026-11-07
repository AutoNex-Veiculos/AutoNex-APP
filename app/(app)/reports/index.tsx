import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Txt } from '@/components/ui/Txt';
import { BarRow } from '@/components/ui/BarRow';
import { FormError } from '@/components/ui/FormError';
import { useCan } from '@/hooks/useCan';
import { salesService } from '@/services/sales.service';
import { vehicleService } from '@/services/vehicle.service';
import { financeService } from '@/services/finance.service';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { formatCurrency } from '@/utils/format';
import { STOCK_VALUE_STATUSES } from '@/constants/vehicle';
import { spacing } from '@/constants/theme';

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function lastMonths(n: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

export default function ReportsScreen() {
  const canSales = useCan('sales');
  const canVehicles = useCan('vehicles');
  const canFinance = useCan('finance');

  const sales = useQuery({ queryKey: ['sales'], queryFn: salesService.listSales, enabled: canSales });
  const vehicles = useQuery({ queryKey: ['vehicles'], queryFn: vehicleService.list, enabled: canVehicles });
  const entries = useQuery({ queryKey: ['entries'], queryFn: financeService.list, enabled: canFinance });

  const bySeller = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const s of sales.data ?? []) {
      const cur = map.get(s.sellerName) ?? { count: 0, total: 0 };
      map.set(s.sellerName, { count: cur.count + 1, total: cur.total + s.saleValue });
    }
    return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total);
  }, [sales.data]);

  const aging = useMemo(() => {
    const buckets = [
      { label: 'Até 30 dias', min: 0, max: 30, count: 0, value: 0 },
      { label: '31 a 60 dias', min: 31, max: 60, count: 0, value: 0 },
      { label: 'Mais de 60 dias', min: 61, max: Infinity, count: 0, value: 0 },
    ];
    for (const v of vehicles.data ?? []) {
      if (!STOCK_VALUE_STATUSES.includes(v.status)) continue;
      const days = Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 86_400_000);
      const bucket = buckets.find((b) => days >= b.min && days <= b.max);
      if (bucket) {
        bucket.count += 1;
        bucket.value += v.price;
      }
    }
    return buckets;
  }, [vehicles.data]);

  const monthly = useMemo(() => {
    return lastMonths(6).map((key) => {
      const sum = (type: 'RECEIVABLE' | 'PAYABLE', paid: boolean) =>
        (entries.data ?? [])
          .filter((e) => e.type === type && e.status !== 'CANCELED' && (paid ? e.status === 'PAID' && e.paidAt?.slice(0, 7) === key : e.status === 'PENDING' && e.dueDate.slice(0, 7) === key))
          .reduce((s, e) => s + e.amount, 0);
      return { key, label: MONTHS[Number(key.slice(5)) - 1], received: sum('RECEIVABLE', true), paid: sum('PAYABLE', true), toReceive: sum('RECEIVABLE', false), toPay: sum('PAYABLE', false) };
    });
  }, [entries.data]);

  const maxSeller = Math.max(1, ...bySeller.map((s) => s.total));
  const maxAging = Math.max(1, ...aging.map((b) => b.value));
  const maxMonth = Math.max(1, ...monthly.flatMap((m) => [m.received, m.paid, m.toReceive, m.toPay]));
  const error = sales.error ?? vehicles.error ?? entries.error;

  return (
    <Screen maxWidth={1000}>
      <PageHeader title="Relatórios" subtitle="Indicadores calculados a partir dos dados que você pode ver." />
      {USE_MOCK ? <Txt variant="caption">Modo demonstração: dados simulados em memória.</Txt> : null}
      {error ? <FormError message={getErrorMessage(error)} /> : null}

      {canSales ? (
        <Card>
          <Txt variant="heading">Vendas por vendedor</Txt>
          <Txt variant="caption">Soma do valor das vendas fechadas.</Txt>
          {bySeller.length === 0 ? <Txt variant="small">Nenhuma venda fechada ainda.</Txt> : null}
          <View style={styles.bars}>
            {bySeller.map((s) => (
              <BarRow key={s.name} label={s.name} valueLabel={`${s.count} ${s.count === 1 ? 'venda' : 'vendas'}, ${formatCurrency(s.total)}`} ratio={s.total / maxSeller} />
            ))}
          </View>
        </Card>
      ) : null}

      {canVehicles ? (
        <Card>
          <Txt variant="heading">Estoque por tempo na loja</Txt>
          <Txt variant="caption">Veículos em preparação, disponíveis, reservados ou em negociação, contados desde o cadastro.</Txt>
          <View style={styles.bars}>
            {aging.map((b, i) => (
              <BarRow key={b.label} label={b.label} valueLabel={`${b.count} ${b.count === 1 ? 'veículo' : 'veículos'}, ${formatCurrency(b.value)}`} ratio={b.value / maxAging} tone={i === 2 ? 'danger' : 'accent'} />
            ))}
          </View>
        </Card>
      ) : null}

      {canFinance ? (
        <Card>
          <Txt variant="heading">Financeiro por mês</Txt>
          <Txt variant="caption">Realizado pelo mês da baixa; previsto pelo mês do vencimento dos lançamentos pendentes.</Txt>
          {monthly.map((m) => (
            <View key={m.key} style={styles.month}>
              <Txt variant="label">{m.label}/{m.key.slice(2, 4)}</Txt>
              <BarRow label="Recebido" valueLabel={formatCurrency(m.received)} ratio={m.received / maxMonth} />
              <BarRow label="Pago" valueLabel={formatCurrency(m.paid)} ratio={m.paid / maxMonth} tone="ink" />
              <BarRow label="A receber (previsto)" valueLabel={formatCurrency(m.toReceive)} ratio={m.toReceive / maxMonth} />
              <BarRow label="A pagar (previsto)" valueLabel={formatCurrency(m.toPay)} ratio={m.toPay / maxMonth} tone="ink" />
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bars: { gap: spacing.md },
  month: { gap: spacing.sm, paddingTop: spacing.md },
});
