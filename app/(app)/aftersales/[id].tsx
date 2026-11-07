import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { CASE_STATUS_LABELS, CASE_STATUS_TONES, CASE_TYPE_LABELS } from '@/constants/aftersales';
import { aftersalesService } from '@/services/aftersales.service';
import { getErrorMessage } from '@/services/api';
import { formatDate } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';
import type { CaseStatus } from '@/types/aftersales';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['case', id], queryFn: () => aftersalesService.get(id), enabled: !!id });
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ['case', id] }), queryClient.invalidateQueries({ queryKey: ['cases'] })]);
  const toggle = useMutation({ mutationFn: (itemId: string) => aftersalesService.toggleItem(id, itemId), onSuccess: refresh });
  const setStatus = useMutation({ mutationFn: (status: CaseStatus) => aftersalesService.updateStatus(id, status), onSuccess: refresh });

  const back = <BackLink href="/aftersales" label="Voltar ao pós-venda" />;
  if (query.isLoading) return <Screen>{back}<Txt variant="small">Carregando…</Txt></Screen>;
  if (query.isError || !query.data) return <Screen>{back}<FormError message={query.error ? getErrorMessage(query.error) : 'Atendimento não encontrado.'} /></Screen>;

  const c = query.data;

  async function run(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <Screen maxWidth={820}>
      <View style={styles.header}>
        {back}
        <View style={styles.titleRow}>
          <Txt variant="displayL" accessibilityRole="header" style={styles.title}>{c.title}</Txt>
          <Badge label={CASE_STATUS_LABELS[c.status]} tone={CASE_STATUS_TONES[c.status]} />
        </View>
        <Txt variant="small">{CASE_TYPE_LABELS[c.type]}, prazo {formatDate(c.dueDate)}.</Txt>
      </View>
      <FormError message={error} />

      <Card>
        <Txt variant="heading">Dados</Txt>
        <Txt variant="body">{c.customerName}</Txt>
        <Txt variant="small">{c.vehicleLabel}</Txt>
        {c.description ? <Txt variant="body">{c.description}</Txt> : null}
      </Card>

      {c.checklist.length > 0 ? (
        <Card>
          <Txt variant="heading">Checklist de entrega</Txt>
          {c.checklist.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done, disabled: c.status === 'DONE' }}
              disabled={c.status === 'DONE' || toggle.isPending}
              onPress={() => void run(() => toggle.mutateAsync(item.id))}
              style={styles.item}
            >
              <Ionicons name={item.done ? 'checkbox' : 'square-outline'} size={24} color={item.done ? colors.accent : colors.inkMuted} />
              <Txt variant="body" style={styles.itemText}>{item.label}</Txt>
            </Pressable>
          ))}
        </Card>
      ) : null}

      {c.status !== 'DONE' ? (
        <Card>
          <Txt variant="heading">Andamento</Txt>
          <View style={styles.actions}>
            {c.status === 'OPEN' ? <Button label="Iniciar atendimento" size="sm" variant="secondary" loading={setStatus.isPending} onPress={() => void run(() => setStatus.mutateAsync('IN_PROGRESS'))} /> : null}
            <Button label="Concluir" size="sm" loading={setStatus.isPending} onPress={() => void run(() => setStatus.mutateAsync('DONE'))} />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  title: { flexShrink: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  itemText: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
