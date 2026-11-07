import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { TextField } from '@/components/ui/TextField';
import { FormError } from '@/components/ui/FormError';
import { EmptyState } from '@/components/ui/EmptyState';
import { STAGES, STAGE_LABELS, STAGE_TONES } from '@/constants/crm';
import { crmService } from '@/services/crm.service';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { colors, radius, spacing } from '@/constants/theme';
import { formatDate } from '@/utils/format';
import type { Lead, LeadStage } from '@/types/crm';

type View_ = 'funnel' | 'customers';

const FLOW: LeadStage[] = ['NEW', 'CONTACTED', 'VISIT', 'PROPOSAL', 'NEGOTIATION'];

export default function CrmScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View_>('funnel');
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const leadsQuery = useQuery({ queryKey: ['leads'], queryFn: crmService.listLeads });
  const customersQuery = useQuery({ queryKey: ['customers'], queryFn: crmService.listCustomers });
  const move = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) => crmService.updateStage(id, stage),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const leads = useMemo(() => leadsQuery.data ?? [], [leadsQuery.data]);
  const open = leads.filter((l) => l.stage !== 'WON' && l.stage !== 'LOST').length;
  const won = leads.filter((l) => l.stage === 'WON').length;
  const conversion = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0;

  const customers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (customersQuery.data ?? []).filter((c) => !term || c.name.toLowerCase().includes(term) || c.phone.includes(term));
  }, [customersQuery.data, search]);

  async function advance(lead: Lead) {
    const next = FLOW[FLOW.indexOf(lead.stage) + 1];
    if (!next) return;
    setActionError(null);
    try {
      await move.mutateAsync({ id: lead.id, stage: next });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  return (
    <Screen>
      <PageHeader
        title="Clientes e leads"
        subtitle="Acompanhe cada oportunidade, do primeiro contato à venda."
        action={<Button label="Novo lead" icon="add" onPress={() => router.navigate('/crm/new')} />}
      />

      <KpiRow>
        <Kpi label="Leads em aberto" value={String(open)} />
        <Kpi label="Ganhos" value={String(won)} />
        <Kpi label="Conversão" value={`${conversion}%`} note="Ganhos divididos pelo total de leads." tone="ink" />
      </KpiRow>

      <ChipGroup
        options={[
          { value: 'funnel', label: 'Funil de vendas' },
          { value: 'customers', label: `Clientes (${customersQuery.data?.length ?? 0})` },
        ]}
        value={view}
        onChange={(v) => setView(v as View_)}
      />

      {USE_MOCK ? <Txt variant="caption">Modo demonstração: dados simulados em memória.</Txt> : null}
      <FormError message={actionError} />
      {leadsQuery.isLoading ? <Txt variant="small">Carregando…</Txt> : null}
      {leadsQuery.isError ? <FormError message={getErrorMessage(leadsQuery.error)} /> : null}

      {view === 'funnel' && leadsQuery.isSuccess ? (
        leads.length === 0 ? (
          <EmptyState title="Nenhum lead ainda" message="Cadastre o primeiro lead para montar o funil." actionLabel="Novo lead" onAction={() => router.navigate('/crm/new')} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.board}>
            {STAGES.map((stage) => {
              const items = leads.filter((l) => l.stage === stage);
              return (
                <View key={stage} style={styles.column}>
                  <View style={styles.columnHead}>
                    <Txt variant="heading">{STAGE_LABELS[stage]}</Txt>
                    <Badge label={String(items.length)} tone={STAGE_TONES[stage]} />
                  </View>
                  {items.length === 0 ? <Txt variant="caption">Nenhum lead.</Txt> : null}
                  {items.map((lead) => (
                    <View key={lead.id} style={styles.leadCard}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Abrir lead de ${lead.customer.name}`}
                        onPress={() => router.navigate({ pathname: '/crm/[id]', params: { id: lead.id } })}
                        style={styles.leadBody}
                      >
                        <Txt variant="label">{lead.customer.name}</Txt>
                        {lead.vehicleLabel ? <Txt variant="small">{lead.vehicleLabel}</Txt> : null}
                        <Txt variant="caption">
                          {lead.source}, {formatDate(lead.createdAt)}
                        </Txt>
                        <Txt variant="caption">Responsável: {lead.responsibleName}</Txt>
                      </Pressable>
                      {FLOW.includes(lead.stage) && lead.stage !== 'NEGOTIATION' ? (
                        <Button
                          label={`Mover para ${STAGE_LABELS[FLOW[FLOW.indexOf(lead.stage) + 1]].toLowerCase()}`}
                          variant="secondary"
                          size="sm"
                          loading={move.isPending && move.variables?.id === lead.id}
                          onPress={() => void advance(lead)}
                        />
                      ) : null}
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        )
      ) : null}

      {view === 'customers' ? (
        <View style={styles.list}>
          <TextField label="Buscar cliente" placeholder="Nome ou telefone" value={search} onChangeText={setSearch} autoCapitalize="none" />
          {customersQuery.isLoading ? <Txt variant="small">Carregando clientes…</Txt> : null}
          {customersQuery.isSuccess && customers.length === 0 ? <EmptyState title="Nenhum cliente encontrado" /> : null}
          {customers.map((c) => (
            <Card key={c.id}>
              <View style={styles.customerTop}>
                <Txt variant="heading">{c.name}</Txt>
                <Badge label={c.type === 'COMPANY' ? 'Empresa' : 'Pessoa física'} />
              </View>
              <Txt variant="small">{c.phone}</Txt>
              {c.email ? <Txt variant="small">{c.email}</Txt> : null}
              <Txt variant="caption">Cliente desde {formatDate(c.createdAt)}</Txt>
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  board: { gap: spacing.md, paddingBottom: spacing.sm },
  column: {
    width: 270,
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    alignSelf: 'flex-start',
  },
  columnHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leadCard: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.input, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  leadBody: { gap: 3 },
  list: { gap: spacing.md },
  customerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
});
