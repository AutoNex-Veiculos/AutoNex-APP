import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { BarRow } from '@/components/ui/BarRow';
import { FormError } from '@/components/ui/FormError';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { subscriptionService } from '@/services/subscription.service';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { formatDate } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';
import type { BadgeTone } from '@/types/ui';
import type { SubscriptionStatus } from '@/types/subscription';

const STATUS: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  TRIAL: { label: 'Período de teste', tone: 'accent' },
  ACTIVE: { label: 'Ativa', tone: 'accent' },
  PAST_DUE: { label: 'Pagamento pendente', tone: 'warning' },
  CANCELED: { label: 'Cancelada', tone: 'neutral' },
  SUSPENDED: { label: 'Suspensa', tone: 'dark' },
};

export default function SubscriptionScreen() {
  const query = useQuery({ queryKey: ['subscription'], queryFn: subscriptionService.get });
  const sub = query.data;

  return (
    <Screen maxWidth={1000}>
      <PageHeader title="Assinatura" subtitle="Seu plano, o período de teste e o uso dos limites." />
      {USE_MOCK ? <Txt variant="caption">Modo demonstração: limites e planos são de exemplo. Valores e condições serão definidos antes do lançamento.</Txt> : null}
      {query.isLoading ? <Txt variant="small">Carregando…</Txt> : null}
      {query.isError ? <FormError message={getErrorMessage(query.error)} /> : null}

      {sub ? (
        <>
          <Card>
            <View style={styles.top}>
              <View style={styles.topText}>
                <Txt variant="caption">Plano atual</Txt>
                <Txt variant="displayM">{sub.planName}</Txt>
              </View>
              <Badge label={STATUS[sub.status].label} tone={STATUS[sub.status].tone} />
            </View>
            {sub.status === 'TRIAL' && sub.trialEndsAt ? (
              <Txt variant="body">
                Seu teste gratuito termina em {formatDate(sub.trialEndsAt)}, em {sub.daysLeft} {sub.daysLeft === 1 ? 'dia' : 'dias'}. Seus dados não são apagados quando o teste acaba.
              </Txt>
            ) : null}
            {sub.status === 'SUSPENDED' ? <Txt variant="body" color={colors.danger}>Esta conta está suspensa. Entre em contato com o suporte do AutoNex.</Txt> : null}
            {sub.status === 'PAST_DUE' ? <Txt variant="body">Há um pagamento pendente. Regularize para manter o acesso.</Txt> : null}
          </Card>

          <Card>
            <Txt variant="heading">Uso dos limites</Txt>
            <BarRow label="Usuários" valueLabel={`${sub.usage.users} de ${sub.limits.users}`} ratio={sub.usage.users / sub.limits.users} tone={sub.usage.users >= sub.limits.users ? 'danger' : 'accent'} />
            <BarRow label="Veículos" valueLabel={`${sub.usage.vehicles} de ${sub.limits.vehicles}`} ratio={sub.usage.vehicles / sub.limits.vehicles} tone={sub.usage.vehicles >= sub.limits.vehicles ? 'danger' : 'accent'} />
            <BarRow label="Armazenamento" valueLabel={`${sub.usage.storageGb} GB de ${sub.limits.storageGb} GB`} ratio={sub.usage.storageGb / sub.limits.storageGb} />
            <Txt variant="caption">Os limites também são validados pela API. A medição de armazenamento entra com o envio de arquivos.</Txt>
          </Card>

          <View style={styles.plans}>
            <Txt variant="displayM">Planos</Txt>
            <ResponsiveGrid minItemWidth={260} maxColumns={3}>
              {sub.plans.map((plan) => (
                <Card key={plan.id} style={plan.id === sub.planId ? styles.current : undefined}>
                  <Txt variant="heading">{plan.name}</Txt>
                  <Txt variant="small">{plan.description}</Txt>
                  <Txt variant="body">{plan.limits.users} usuários</Txt>
                  <Txt variant="body">{plan.limits.vehicles} veículos</Txt>
                  <Txt variant="body">{plan.limits.storageGb} GB de arquivos</Txt>
                  <Txt variant="caption">Preço a definir</Txt>
                </Card>
              ))}
            </ResponsiveGrid>
          </View>

          <Card>
            <Txt variant="heading">Pagamento via Pix</Txt>
            <Txt variant="small">A contratação e a cobrança por Pix serão ativadas quando a integração com o provedor de pagamentos estiver pronta. A confirmação virá do provedor, nunca do app.</Txt>
            <Button label="Contratar plano" disabled onPress={() => undefined} style={styles.start} />
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  topText: { gap: 2 },
  plans: { gap: spacing.lg },
  current: { borderColor: colors.accent, borderWidth: 2 },
  start: { alignSelf: 'flex-start' },
});
