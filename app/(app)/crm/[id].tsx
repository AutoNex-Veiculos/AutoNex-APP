import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormField } from '@/components/ui/FormControls';
import { STAGE_LABELS, STAGE_TONES, stageTargets } from '@/constants/crm';
import { useCan } from '@/hooks/useCan';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { crmService } from '@/services/crm.service';
import { getErrorMessage } from '@/services/api';
import { noteSchema, type NoteFormInput } from '@/utils/schemas/crm';
import { formatDate } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isWide } = useBreakpoint();
  const canSell = useCan('sales');
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['lead', id], queryFn: () => crmService.getLead(id), enabled: !!id });
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ['lead', id] }), queryClient.invalidateQueries({ queryKey: ['leads'] })]);
  const changeStage = useMutation({ mutationFn: (stage: Parameters<typeof crmService.updateStage>[1]) => crmService.updateStage(id, stage), onSuccess: refresh });
  const addNote = useMutation({ mutationFn: (text: string) => crmService.addNote(id, text), onSuccess: refresh });
  const { control, handleSubmit, reset } = useForm<NoteFormInput>({ resolver: zodResolver(noteSchema), defaultValues: { text: '' } });

  if (query.isLoading) return <Screen><BackLink href="/crm" label="Voltar ao funil" /><Txt variant="small">Carregando…</Txt></Screen>;
  if (query.isError || !query.data) {
    return (
      <Screen>
        <BackLink href="/crm" label="Voltar ao funil" />
        <FormError message={query.error ? getErrorMessage(query.error) : 'Lead não encontrado.'} />
      </Screen>
    );
  }

  const lead = query.data;
  const targets = stageTargets(lead.stage);
  const phoneDigits = lead.customer.phone.replace(/\D/g, '');

  const submitNote = handleSubmit(async ({ text }) => {
    setError(null);
    try {
      await addNote.mutateAsync(text);
      reset({ text: '' });
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  return (
    <Screen maxWidth={1000}>
      <View style={styles.header}>
        <BackLink href="/crm" label="Voltar ao funil" />
        <View style={styles.titleRow}>
          <Txt variant="displayL" accessibilityRole="header" style={styles.title}>{lead.customer.name}</Txt>
          <Badge label={STAGE_LABELS[lead.stage]} tone={STAGE_TONES[lead.stage]} />
        </View>
        <Txt variant="small">{lead.source}, aberto em {formatDate(lead.createdAt)}. Responsável: {lead.responsibleName}.</Txt>
      </View>

      <FormError message={error} />

      <View style={[styles.columns, isWide ? styles.columnsWide : null]}>
        <View style={[styles.col, isWide ? styles.colWide : null]}>
          <Card>
            <Txt variant="heading">Contato</Txt>
            <Txt variant="body">{lead.customer.phone}</Txt>
            {lead.customer.email ? <Txt variant="body">{lead.customer.email}</Txt> : null}
            {lead.customer.document ? <Txt variant="small">Documento: {lead.customer.document}</Txt> : null}
            <Button
              label="Chamar no WhatsApp"
              icon="logo-whatsapp"
              variant="secondary"
              size="sm"
              onPress={() => void Linking.openURL(`https://wa.me/55${phoneDigits}`)}
              style={styles.start}
            />
          </Card>

          <Card>
            <Txt variant="heading">Interesse</Txt>
            <Txt variant="body">{lead.vehicleLabel ?? 'Nenhum veículo definido.'}</Txt>
            {canSell && lead.stage !== 'LOST' ? (
              <Button
                label="Criar proposta"
                icon="pricetag-outline"
                size="sm"
                onPress={() => router.navigate({ pathname: '/sales/new', params: { customerId: lead.customer.id, vehicleId: lead.vehicleId ?? '' } })}
                style={styles.start}
              />
            ) : null}
          </Card>

          {targets.length > 0 ? (
            <Card>
              <Txt variant="heading">Mudar de etapa</Txt>
              <View style={styles.actions}>
                {targets.map((stage) => (
                  <Button
                    key={stage}
                    label={STAGE_LABELS[stage]}
                    size="sm"
                    variant={stage === 'LOST' ? 'danger' : stage === 'WON' ? 'primary' : 'secondary'}
                    loading={changeStage.isPending && changeStage.variables === stage}
                    onPress={async () => {
                      setError(null);
                      try {
                        await changeStage.mutateAsync(stage);
                      } catch (e) {
                        setError(getErrorMessage(e));
                      }
                    }}
                  />
                ))}
              </View>
            </Card>
          ) : null}
        </View>

        <View style={[styles.col, isWide ? styles.colWide : null]}>
          <Card>
            <Txt variant="heading">Histórico e anotações</Txt>
            <FormField control={control} name="text" label="Nova anotação" multiline style={styles.multiline} />
            <Button label="Salvar anotação" size="sm" onPress={submitNote} loading={addNote.isPending} style={styles.start} />
            {lead.notes.length === 0 ? <Txt variant="small">Nenhuma anotação ainda.</Txt> : null}
            {[...lead.notes].reverse().map((n) => (
              <View key={n.id} style={styles.note}>
                <Txt variant="body">{n.text}</Txt>
                <Txt variant="caption">{n.authorName}, {formatDate(n.createdAt)}</Txt>
              </View>
            ))}
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  title: { flexShrink: 1 },
  columns: { gap: spacing.lg },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { gap: spacing.lg },
  colWide: { flex: 1 },
  start: { alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  multiline: { minHeight: 80, paddingTop: 12, textAlignVertical: 'top' },
  note: { gap: 2, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.line },
});
