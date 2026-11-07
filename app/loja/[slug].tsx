import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/ui/Logo';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Card } from '@/components/ui/Card';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { FormError } from '@/components/ui/FormError';
import { FormField, FormPicker } from '@/components/ui/FormControls';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { FUEL_LABELS, TRANSMISSION_LABELS } from '@/constants/vehicle';
import { storefrontService } from '@/services/storefront.service';
import { getErrorMessage } from '@/services/api';
import { interestSchema, type InterestFormInput } from '@/utils/schemas/storefront';
import { formatCurrency, formatKm } from '@/utils/format';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { PublicVehicle } from '@/types/storefront';

// Página pública: não exige login e só mostra dados que podem ser públicos.
export default function PublicStoreScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { isWide } = useBreakpoint();
  const [search, setSearch] = useState('');
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const store = useQuery({ queryKey: ['public-store', slug], queryFn: () => storefrontService.getPublicStore(slug), enabled: !!slug });
  const send = useMutation({ mutationFn: (v: InterestFormInput) => storefrontService.submitInterest(slug, { name: v.name, phone: v.phone, message: v.message || undefined, vehicleId: v.vehicleId || undefined }) });
  const { control, handleSubmit, reset, setValue } = useForm<InterestFormInput>({
    resolver: zodResolver(interestSchema),
    defaultValues: { name: '', phone: '', message: '', vehicleId: '' },
  });

  const vehicles = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (store.data?.vehicles ?? []).filter((v) => !term || `${v.brand} ${v.model} ${v.version ?? ''}`.toLowerCase().includes(term));
  }, [store.data, search]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await send.mutateAsync(values);
      setSent(true);
      reset();
    } catch (e) {
      setFormError(getErrorMessage(e));
    }
  });

  function wantThis(vehicle: PublicVehicle) {
    setSent(false);
    setValue('vehicleId', vehicle.id);
    setValue('message', `Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.yearModel}.`);
  }

  const whatsappDigits = store.data?.whatsapp?.replace(/\D/g, '');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={[styles.top, { paddingTop: insets.top + 16 }]}>
        <Logo tone="light" size={20} />
      </View>

      <View style={[styles.inner, { padding: isWide ? 48 : 20 }]}>
        {store.isLoading ? <Txt variant="small">Carregando vitrine…</Txt> : null}
        {store.isError ? (
          <Card>
            <Txt variant="heading">Vitrine não encontrada</Txt>
            <Txt variant="small">Confira o endereço ou volte mais tarde.</Txt>
          </Card>
        ) : null}

        {store.data ? (
          <>
            <ImageSlot aspectRatio={isWide ? 3.2 : 1.6} hint="Banner da loja" overlay={false}>
              <View style={styles.bannerText}>
                <Txt style={[styles.storeName, isWide ? styles.storeNameWide : null]}>{store.data.storeName}</Txt>
                {store.data.about ? <Txt style={styles.about}>{store.data.about}</Txt> : null}
              </View>
            </ImageSlot>

            <View style={styles.header}>
              <Txt variant="displayM" accessibilityRole="header">Veículos disponíveis</Txt>
              <TextField label="Buscar" placeholder="Marca, modelo ou versão" value={search} onChangeText={setSearch} autoCapitalize="none" />
            </View>

            {vehicles.length === 0 ? (
              <Card><Txt variant="small">Nenhum veículo encontrado no momento.</Txt></Card>
            ) : (
              <ResponsiveGrid minItemWidth={270}>
                {vehicles.map((v) => (
                  <View key={v.id} style={styles.card}>
                    <ImageSlot source={v.imageUrl} aspectRatio={4 / 3} radius={0} hint="Foto do veículo" />
                    <View style={styles.cardBody}>
                      <Txt variant="heading">{v.brand} {v.model}</Txt>
                      {v.version ? <Txt variant="small">{v.version}</Txt> : null}
                      <Txt variant="small">{v.yearManufacture}/{v.yearModel}, {formatKm(v.mileage)}</Txt>
                      <Txt variant="small">{FUEL_LABELS[v.fuel]}, {TRANSMISSION_LABELS[v.transmission]}, {v.color}</Txt>
                      <Txt variant="displayM" color={colors.accent} style={styles.price}>{formatCurrency(v.price)}</Txt>
                      <Button label="Tenho interesse" size="sm" onPress={() => wantThis(v)} />
                    </View>
                  </View>
                ))}
              </ResponsiveGrid>
            )}

            <Card style={styles.contact}>
              <Txt variant="displayM">Fale com a loja</Txt>
              {sent ? <Txt variant="body" color={colors.accent}>Recebemos seu contato. A loja vai falar com você em breve.</Txt> : null}
              <FormError message={formError} />
              <FormField control={control} name="name" label="Seu nome" autoComplete="name" />
              <FormField control={control} name="phone" label="Telefone com DDD" keyboardType="phone-pad" />
              <FormPicker
                control={control}
                name="vehicleId"
                label="Veículo de interesse (opcional)"
                options={[{ value: '', label: 'Ainda não escolhi' }, ...store.data.vehicles.map((v) => ({ value: v.id, label: `${v.brand} ${v.model} ${v.yearModel}`, description: formatCurrency(v.price) }))]}
              />
              <FormField control={control} name="message" label="Mensagem (opcional)" multiline style={styles.multiline} />
              <View style={styles.actions}>
                <Button label="Enviar contato" onPress={onSubmit} loading={send.isPending} />
                {whatsappDigits ? (
                  <Button
                    label="Chamar no WhatsApp"
                    icon="logo-whatsapp"
                    variant="secondary"
                    onPress={() => void Linking.openURL(`https://wa.me/55${whatsappDigits}?text=${encodeURIComponent(`Olá! Vi a vitrine da ${store.data!.storeName} e gostaria de mais informações.`)}`)}
                  />
                ) : null}
              </View>
            </Card>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, alignItems: 'center' },
  top: { width: '100%', backgroundColor: colors.panel, paddingHorizontal: 24, paddingBottom: 16 },
  inner: { width: '100%', maxWidth: 1120, gap: spacing.xl },
  bannerText: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 24, gap: 6 },
  storeName: { fontFamily: fonts.display, fontSize: 36, lineHeight: 38, color: colors.onPanel },
  storeNameWide: { fontSize: 56, lineHeight: 56 },
  about: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.onPanelMuted },
  header: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  cardBody: { padding: spacing.lg, gap: 4 },
  price: { marginVertical: 6 },
  contact: { maxWidth: 640, width: '100%', alignSelf: 'center' },
  multiline: { minHeight: 80, paddingTop: 12, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
