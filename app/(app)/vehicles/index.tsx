import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Txt } from '@/components/ui/Txt';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { FormError } from '@/components/ui/FormError';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { VehicleCard } from '@/components/ui/VehicleCard';
import { useCan } from '@/hooks/useCan';
import { STATUSES, STATUS_LABELS, STOCK_VALUE_STATUSES } from '@/constants/vehicle';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { vehicleService } from '@/services/vehicle.service';
import { colors, spacing } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatCurrency } from '@/utils/format';
import type { VehicleStatus } from '@/types/vehicle';

type StatusFilter = 'ALL' | VehicleStatus;

export default function VehiclesScreen() {
  const router = useRouter();
  const { isWide } = useBreakpoint();
  const canWrite = useCan('vehicles:write');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const query = useQuery({ queryKey: ['vehicles'], queryFn: vehicleService.list });
  const all = useMemo(() => query.data ?? [], [query.data]);

  const stats = useMemo(
    () => ({
      available: all.filter((v) => v.status === 'AVAILABLE').length,
      inProgress: all.filter((v) => v.status === 'RESERVED' || v.status === 'NEGOTIATING').length,
      stockValue: all.filter((v) => STOCK_VALUE_STATUSES.includes(v.status)).reduce((sum, v) => sum + v.price, 0),
    }),
    [all],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: all.filter((v) => v.status !== 'ARCHIVED').length };
    for (const s of STATUSES) result[s] = all.filter((v) => v.status === s).length;
    return result;
  }, [all]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter((v) => {
      if (status === 'ALL' ? v.status === 'ARCHIVED' : v.status !== status) return false;
      if (!term) return true;
      return [v.brand, v.model, v.version, v.plate].some((field) => field?.toLowerCase().includes(term));
    });
  }, [all, search, status]);

  const options = [
    { value: 'ALL' as StatusFilter, label: `Todos (${counts.ALL})` },
    ...STATUSES.map((s) => ({ value: s as StatusFilter, label: `${STATUS_LABELS[s]} (${counts[s]})` })),
  ];

  return (
    <Screen>
      <View style={[styles.header, isWide ? styles.headerWide : null]}>
        <View style={styles.headerText}>
          <Txt variant="displayL" accessibilityRole="header">
            Estoque
          </Txt>
          <Txt variant="small">Acompanhe os veículos da loja, do preparo à venda.</Txt>
        </View>
        {canWrite ? <Button label="Novo veículo" icon="add" onPress={() => router.navigate('/vehicles/new')} /> : null}
      </View>

      <View style={styles.kpis}>
        <Kpi label="Disponíveis" value={String(stats.available)} />
        <Kpi label="Reservados ou em negociação" value={String(stats.inProgress)} />
        <Kpi label="Valor do estoque" value={formatCurrency(stats.stockValue)} note="Soma dos preços em preparação, disponíveis, reservados e em negociação." />
      </View>

      <View style={styles.filters}>
        <TextField label="Buscar" placeholder="Marca, modelo, versão ou placa" value={search} onChangeText={setSearch} autoCapitalize="none" />
        <ChipGroup label="Status" options={options} value={status} onChange={setStatus} />
      </View>

      {USE_MOCK ? <Txt variant="caption">Modo demonstração: dados simulados em memória.</Txt> : null}
      {query.isLoading ? <Txt variant="small">Carregando estoque…</Txt> : null}
      {query.isError ? (
        <View style={styles.errorBox}>
          <FormError message={getErrorMessage(query.error)} />
          <Button label="Tentar de novo" variant="secondary" size="sm" onPress={() => void query.refetch()} />
        </View>
      ) : null}

      {query.isSuccess && all.length === 0 ? (
        <Card>
          <Txt variant="heading">Nenhum veículo cadastrado</Txt>
          <Txt variant="small">{canWrite ? 'Cadastre o primeiro veículo para começar.' : 'Peça a um gerente para cadastrar os veículos.'}</Txt>
          {canWrite ? <Button label="Cadastrar veículo" icon="add" onPress={() => router.navigate('/vehicles/new')} /> : null}
        </Card>
      ) : null}

      {query.isSuccess && all.length > 0 && filtered.length === 0 ? (
        <Card>
          <Txt variant="small">Nenhum veículo encontrado com esses filtros.</Txt>
        </Card>
      ) : null}

      {filtered.length > 0 ? (
        <ResponsiveGrid minItemWidth={260}>
          {filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => router.navigate({ pathname: '/vehicles/[id]', params: { id: vehicle.id } })}
            />
          ))}
        </ResponsiveGrid>
      ) : null}
    </Screen>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.kpi} accessible accessibilityLabel={`${label}: ${value}`}>
      <Txt variant="caption">{label}</Txt>
      <Txt variant="displayM" color={colors.accent}>
        {value}
      </Txt>
      {note ? <Txt variant="caption">{note}</Txt> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md },
  headerWide: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerText: { gap: 6 },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: {
    flexGrow: 1,
    flexBasis: 220,
    gap: 4,
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  filters: { gap: spacing.md },
  errorBox: { gap: spacing.sm, alignItems: 'flex-start' },
});
