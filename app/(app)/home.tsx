import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Section } from '@/components/ui/Section';
import { Kpi, KpiRow } from '@/components/ui/Kpi';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { ModuleCard } from '@/components/ui/ModuleCard';
import { VehicleCard } from '@/components/ui/VehicleCard';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/constants/roles';
import { MODULES } from '@/constants/modules';
import { STOCK_VALUE_STATUSES } from '@/constants/vehicle';
import { images } from '@/constants/images';
import { colors, fill, fonts, spacing } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { vehicleService } from '@/services/vehicle.service';
import { crmService } from '@/services/crm.service';
import { salesService } from '@/services/sales.service';
import { financeService } from '@/services/finance.service';
import { aftersalesService } from '@/services/aftersales.service';
import { formatCurrency, todayIso } from '@/utils/format';
import { can } from '@/utils/permissions';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { isWide } = useBreakpoint();
  const role = session?.user.role;

  const vehiclesQ = useQuery({ queryKey: ['vehicles'], queryFn: vehicleService.list, enabled: can(role, 'vehicles') });
  const leadsQ = useQuery({ queryKey: ['leads'], queryFn: crmService.listLeads, enabled: can(role, 'customers') });
  const proposalsQ = useQuery({ queryKey: ['proposals'], queryFn: salesService.listProposals, enabled: can(role, 'sales') });
  const entriesQ = useQuery({ queryKey: ['entries'], queryFn: financeService.list, enabled: can(role, 'finance') });
  const casesQ = useQuery({ queryKey: ['cases'], queryFn: aftersalesService.list, enabled: can(role, 'aftersales') });

  if (!session) return null;
  const { user, company } = session;
  const firstName = user.name.split(' ')[0];
  const modules = MODULES.filter((m) => can(user.role, m.key));
  const vehicles = vehiclesQ.data ?? [];
  const featured = vehicles.filter((v) => v.status === 'AVAILABLE').slice(0, 3);
  const today = todayIso();

  const kpis: { key: string; label: string; value: string; tone?: 'accent' | 'danger' | 'ink' }[] = [];
  if (vehiclesQ.data) {
    kpis.push({ key: 'avail', label: 'Veículos disponíveis', value: String(vehicles.filter((v) => v.status === 'AVAILABLE').length) });
    kpis.push({ key: 'stock', label: 'Valor do estoque', value: formatCurrency(vehicles.filter((v) => STOCK_VALUE_STATUSES.includes(v.status)).reduce((s, v) => s + v.price, 0)), tone: 'ink' });
  }
  if (leadsQ.data) kpis.push({ key: 'leads', label: 'Leads em aberto', value: String(leadsQ.data.filter((l) => l.stage !== 'WON' && l.stage !== 'LOST').length) });
  if (proposalsQ.data) kpis.push({ key: 'props', label: 'Propostas em aberto', value: String(proposalsQ.data.filter((p) => ['DRAFT', 'PENDING_APPROVAL', 'SENT', 'ACCEPTED'].includes(p.status)).length) });
  if (entriesQ.data) {
    const pending = entriesQ.data.filter((e) => e.status === 'PENDING');
    kpis.push({ key: 'rec', label: 'A receber (pendente)', value: formatCurrency(pending.filter((e) => e.type === 'RECEIVABLE').reduce((s, e) => s + e.amount, 0)) });
    kpis.push({ key: 'pay', label: 'A pagar (pendente)', value: formatCurrency(pending.filter((e) => e.type === 'PAYABLE').reduce((s, e) => s + e.amount, 0)), tone: 'ink' });
  }
  if (casesQ.data) {
    const open = casesQ.data.filter((c) => c.status !== 'DONE');
    kpis.push({ key: 'cases', label: 'Atendimentos em aberto', value: String(open.length), tone: open.some((c) => c.dueDate < today) ? 'danger' : 'accent' });
  }

  return (
    <Screen>
      <ImageSlot source={images.homeBanner} aspectRatio={isWide ? 3.4 : 1.7} hint="Banner da loja" overlay={!!images.homeBanner}>
        <View style={[styles.bannerContent, isWide ? styles.bannerWide : null]}>
          <View style={styles.badges}>
            <Badge label={company?.tradeName ?? 'Sem empresa'} tone="glass" />
            <Badge label={ROLE_LABELS[user.role]} tone="glass" />
          </View>
          <Txt style={[styles.bannerTitle, isWide ? styles.bannerTitleWide : null]}>
            {greeting()}, {firstName}
          </Txt>
        </View>
      </ImageSlot>

      {kpis.length > 0 ? (
        <KpiRow>
          {kpis.slice(0, 4).map((k) => (
            <Kpi key={k.key} label={k.label} value={k.value} tone={k.tone} />
          ))}
        </KpiRow>
      ) : null}

      <Section title="Módulos" subtitle="Tudo o que o seu perfil pode acessar.">
        <ResponsiveGrid>
          {modules.map((m) => (
            <ModuleCard
              key={m.key}
              title={m.title}
              description={m.description}
              icon={m.icon}
              image={images.modules[m.key]}
              available
              onPress={() => router.navigate(m.route)}
            />
          ))}
        </ResponsiveGrid>
      </Section>

      {can(user.role, 'vehicles') ? (
        <Section title="Estoque em destaque" subtitle={featured.length > 0 ? 'Últimos veículos disponíveis.' : 'Os veículos disponíveis aparecerão aqui.'}>
          <ResponsiveGrid minItemWidth={240}>
            {featured.length > 0
              ? featured.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} onPress={() => router.navigate({ pathname: '/vehicles/[id]', params: { id: vehicle.id } })} />
                ))
              : [0, 1, 2].map((i) => <VehicleCard key={i} />)}
          </ResponsiveGrid>
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerContent: { ...fill, padding: spacing.lg, justifyContent: 'space-between' },
  bannerWide: { padding: 36 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bannerTitle: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, color: colors.onPanel },
  bannerTitleWide: { fontSize: 64, lineHeight: 64 },
});
