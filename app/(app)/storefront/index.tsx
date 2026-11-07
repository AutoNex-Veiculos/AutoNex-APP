import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { FormCheck, FormField } from '@/components/ui/FormControls';
import { STATUS_LABELS } from '@/constants/vehicle';
import { storefrontService } from '@/services/storefront.service';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { settingsSchema, type SettingsFormInput } from '@/utils/schemas/storefront';
import { formatCurrency } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function StorefrontScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isWide } = useBreakpoint();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const settings = useQuery({ queryKey: ['storefront-settings'], queryFn: storefrontService.getSettings });
  const listings = useQuery({ queryKey: ['listings'], queryFn: storefrontService.listListings });
  const save = useMutation({ mutationFn: storefrontService.saveSettings });
  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => storefrontService.setPublished(id, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  });

  const { control, handleSubmit, reset, watch } = useForm<SettingsFormInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { storeName: '', slug: '', whatsapp: '', about: '', published: false },
  });
  useEffect(() => {
    if (settings.data) reset({ ...settings.data, whatsapp: settings.data.whatsapp ?? '', about: settings.data.about ?? '' });
  }, [settings.data, reset]);

  const slug = watch('slug');
  const publishedCount = listings.data?.filter((l) => l.published && l.vehicle.status === 'AVAILABLE').length ?? 0;

  const onSave = handleSubmit(async (values) => {
    setError(null);
    setSaved(false);
    try {
      await save.mutateAsync({ ...values, whatsapp: values.whatsapp || undefined, about: values.about || undefined });
      await queryClient.invalidateQueries({ queryKey: ['storefront-settings'] });
      setSaved(true);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  async function togglePublish(id: string, value: boolean) {
    setError(null);
    try {
      await toggle.mutateAsync({ id, value });
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <Screen maxWidth={1000}>
      <PageHeader
        title="Vitrine"
        subtitle="A página pública da sua loja. Só aparecem veículos disponíveis e publicados, sem custos nem placa."
        action={
          settings.data?.published ? (
            <Button label="Abrir vitrine" icon="open-outline" variant="secondary" onPress={() => router.navigate({ pathname: '/loja/[slug]', params: { slug: settings.data!.slug } })} />
          ) : undefined
        }
      />
      {USE_MOCK ? <Txt variant="caption">Modo demonstração: dados simulados em memória.</Txt> : null}
      <FormError message={error} />
      {settings.isError ? <FormError message={getErrorMessage(settings.error)} /> : null}

      <View style={[styles.columns, isWide ? styles.columnsWide : null]}>
        <Card style={isWide ? styles.formCard : undefined}>
          <Txt variant="heading">Dados da loja</Txt>
          <FormField control={control} name="storeName" label="Nome da loja" />
          <FormField control={control} name="slug" label="Endereço da vitrine" autoCapitalize="none" placeholder="minha-loja" />
          <Txt variant="caption">Endereço no app: /loja/{slug || 'minha-loja'}</Txt>
          <FormField control={control} name="whatsapp" label="WhatsApp (opcional)" keyboardType="phone-pad" placeholder="(11) 90000-0000" />
          <FormField control={control} name="about" label="Sobre a loja (opcional)" multiline style={styles.multiline} />
          <FormCheck control={control} name="published" label="Vitrine publicada (visível para qualquer pessoa)" />
          <Button label="Salvar" onPress={onSave} loading={save.isPending} />
          {saved ? <Txt variant="small" color={colors.accent}>Configurações salvas.</Txt> : null}
        </Card>

        <View style={[styles.listColumn, isWide ? styles.listWide : null]}>
          <Txt variant="displayM">Veículos na vitrine</Txt>
          <Txt variant="small">{publishedCount} {publishedCount === 1 ? 'veículo publicado' : 'veículos publicados'}.</Txt>
          {listings.isLoading ? <Txt variant="small">Carregando…</Txt> : null}
          {listings.data?.length === 0 ? <Card><Txt variant="small">Nenhum veículo elegível. Cadastre veículos no estoque.</Txt></Card> : null}
          {listings.data?.map(({ vehicle, published }) => {
            const eligible = vehicle.status === 'AVAILABLE';
            return (
              <Card key={vehicle.id}>
                <View style={styles.row}>
                  <View style={styles.rowMain}>
                    <Txt variant="heading">{vehicle.brand} {vehicle.model}</Txt>
                    <Txt variant="small">{vehicle.version ?? ''} {formatCurrency(vehicle.price)}</Txt>
                    <Badge label={STATUS_LABELS[vehicle.status]} tone={eligible ? 'accent' : 'neutral'} />
                  </View>
                  <Button
                    label={published ? 'Remover da vitrine' : 'Publicar'}
                    size="sm"
                    variant={published ? 'secondary' : 'primary'}
                    disabled={!eligible && !published}
                    loading={toggle.isPending && toggle.variables?.id === vehicle.id}
                    onPress={() => void togglePublish(vehicle.id, !published)}
                  />
                </View>
                {!eligible ? <Txt variant="caption">Só veículos disponíveis podem ser publicados.</Txt> : null}
              </Card>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  columns: { gap: spacing.xl },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  formCard: { width: 380 },
  listColumn: { gap: spacing.md },
  listWide: { flex: 1 },
  multiline: { minHeight: 80, paddingTop: 12, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowMain: { flexGrow: 1, flexBasis: 200, gap: 4 },
});
