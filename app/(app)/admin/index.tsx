import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { PageHeader } from '@/components/ui/PageHeader';
import { Kpi, KpiRow } from '@/components/ui/Kpi';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { subscriptionService } from '@/services/subscription.service';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { spacing } from '@/constants/theme';
import type { BadgeTone } from '@/types/ui';
import type { SubscriptionStatus } from '@/types/subscription';

const STATUS: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  TRIAL: { label: 'Em teste', tone: 'accent' },
  ACTIVE: { label: 'Ativa', tone: 'accent' },
  PAST_DUE: { label: 'Pagamento pendente', tone: 'warning' },
  CANCELED: { label: 'Cancelada', tone: 'neutral' },
  SUSPENDED: { label: 'Suspensa', tone: 'dark' },
};

export default function AdminScreen() {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<{ id: string; status: 'SUSPENDED' | 'ACTIVE' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['admin-companies'], queryFn: subscriptionService.listCompanies });
  const change = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'SUSPENDED' | 'ACTIVE' }) => subscriptionService.setCompanyStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-companies'] }),
  });

  const companies = query.data ?? [];
  const count = (s: SubscriptionStatus) => companies.filter((c) => c.status === s).length;

  async function confirm() {
    if (!confirming) return;
    setError(null);
    try {
      await change.mutateAsync(confirming);
      setConfirming(null);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <Screen maxWidth={1000}>
      <PageHeader title="Plataforma" subtitle="Empresas clientes do AutoNex e o estado de cada assinatura." />
      <KpiRow>
        <Kpi label="Empresas" value={String(companies.length)} tone="ink" />
        <Kpi label="Assinaturas ativas" value={String(count('ACTIVE'))} />
        <Kpi label="Em teste" value={String(count('TRIAL'))} />
        <Kpi label="Com pendência" value={String(count('PAST_DUE'))} tone={count('PAST_DUE') > 0 ? 'danger' : 'ink'} />
      </KpiRow>
      {USE_MOCK ? <Txt variant="caption">Modo demonstração: empresas e assinaturas simuladas.</Txt> : null}
      <Card>
        <Txt variant="small">Esta área mostra só dados de contratação e uso. O conteúdo interno das empresas (clientes, financeiro, documentos) não é acessível aqui; qualquer exceção precisa de procedimento autorizado e auditado.</Txt>
      </Card>
      <FormError message={error} />
      {query.isLoading ? <Txt variant="small">Carregando empresas…</Txt> : null}
      {query.isError ? <FormError message={getErrorMessage(query.error)} /> : null}

      <View style={styles.list}>
        {companies.map((c) => (
          <Card key={c.id}>
            <View style={styles.top}>
              <View style={styles.main}>
                <Txt variant="heading">{c.tradeName}</Txt>
                <Txt variant="small">CNPJ {c.document}</Txt>
                <Txt variant="caption">Plano {c.planName}, {c.users} {c.users === 1 ? 'usuário' : 'usuários'}, {c.vehicles} {c.vehicles === 1 ? 'veículo' : 'veículos'}</Txt>
              </View>
              <Badge label={STATUS[c.status].label} tone={STATUS[c.status].tone} />
            </View>
            {confirming?.id === c.id ? (
              <View style={styles.confirm}>
                <Txt variant="body">{confirming.status === 'SUSPENDED' ? 'Suspender o acesso desta empresa?' : 'Reativar esta empresa?'}</Txt>
                <View style={styles.actions}>
                  <Button label="Confirmar" size="sm" loading={change.isPending} onPress={() => void confirm()} />
                  <Button label="Voltar" size="sm" variant="secondary" onPress={() => setConfirming(null)} />
                </View>
              </View>
            ) : (
              <View style={styles.actions}>
                {c.status === 'SUSPENDED' ? (
                  <Button label="Reativar" size="sm" onPress={() => setConfirming({ id: c.id, status: 'ACTIVE' })} />
                ) : (
                  <Button label="Suspender" size="sm" variant="danger" onPress={() => setConfirming({ id: c.id, status: 'SUSPENDED' })} />
                )}
              </View>
            )}
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  top: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  main: { flexGrow: 1, flexBasis: 240, gap: 3 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  confirm: { gap: spacing.md },
});
