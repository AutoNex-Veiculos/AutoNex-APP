import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { PageHeader } from '@/components/ui/PageHeader';
import { Kpi, KpiRow } from '@/components/ui/Kpi';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { FormError } from '@/components/ui/FormError';
import { EmptyState } from '@/components/ui/EmptyState';
import { CASE_STATUSES, CASE_STATUS_LABELS, CASE_STATUS_TONES, CASE_TYPE_LABELS } from '@/constants/aftersales';
import { aftersalesService } from '@/services/aftersales.service';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { formatDate, todayIso } from '@/utils/format';
import { colors, radius, spacing } from '@/constants/theme';
import type { CaseStatus } from '@/types/aftersales';

export default function AfterSalesScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<'ALL' | CaseStatus>('ALL');
  const query = useQuery({ queryKey: ['cases'], queryFn: aftersalesService.list });

  const all = useMemo(() => query.data ?? [], [query.data]);
  const today = todayIso();
  const unfinished = all.filter((c) => c.status !== 'DONE');
  const filtered = all.filter((c) => status === 'ALL' || c.status === status);

  return (
    <Screen>
      <PageHeader
        title="Pós-venda"
        subtitle="Entregas, acompanhamentos e reclamações dos clientes."
        action={<Button label="Novo atendimento" icon="add" onPress={() => router.navigate('/aftersales/new')} />}
      />
      <KpiRow>
        <Kpi label="Em aberto" value={String(unfinished.length)} />
        <Kpi label="Atrasados" value={String(unfinished.filter((c) => c.dueDate < today).length)} tone={unfinished.some((c) => c.dueDate < today) ? 'danger' : 'ink'} />
        <Kpi label="Concluídos" value={String(all.filter((c) => c.status === 'DONE').length)} tone="ink" />
      </KpiRow>
      <ChipGroup
        label="Situação"
        options={[{ value: 'ALL', label: 'Todos' }, ...CASE_STATUSES.map((s) => ({ value: s, label: CASE_STATUS_LABELS[s] }))]}
        value={status}
        onChange={(v) => setStatus(v as 'ALL' | CaseStatus)}
      />
      {USE_MOCK ? <Txt variant="caption">Modo demonstração: dados simulados em memória.</Txt> : null}
      {query.isLoading ? <Txt variant="small">Carregando atendimentos…</Txt> : null}
      {query.isError ? <FormError message={getErrorMessage(query.error)} /> : null}
      {query.isSuccess && filtered.length === 0 ? <EmptyState title="Nenhum atendimento" message="As entregas aparecem aqui quando uma venda é fechada." /> : null}

      <View style={styles.list}>
        {filtered.map((c) => {
          const done = c.checklist.filter((i) => i.done).length;
          const late = c.status !== 'DONE' && c.dueDate < today;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={c.title}
              onPress={() => router.navigate({ pathname: '/aftersales/[id]', params: { id: c.id } })}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.main}>
                <Txt variant="heading">{c.title}</Txt>
                <Txt variant="small">{c.customerName}, {c.vehicleLabel}</Txt>
                <Txt variant="caption">
                  Prazo {formatDate(c.dueDate)}
                  {c.checklist.length > 0 ? `, checklist ${done} de ${c.checklist.length}` : ''}
                </Txt>
              </View>
              <View style={styles.side}>
                <Badge label={CASE_TYPE_LABELS[c.type]} />
                <Badge label={late ? 'Atrasado' : CASE_STATUS_LABELS[c.status]} tone={late ? 'warning' : CASE_STATUS_TONES[c.status]} />
              </View>
            </Pressable>
          );
        })}
      </View>
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
  main: { flexGrow: 1, flexBasis: 240, gap: 3 },
  side: { gap: 6, alignItems: 'flex-start' },
});
