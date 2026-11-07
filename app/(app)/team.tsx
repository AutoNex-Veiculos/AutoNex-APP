import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { useCan } from '@/hooks/useCan';
import { INVITATION_STATUS_LABELS, ROLE_LABELS } from '@/constants/roles';
import { getErrorMessage, USE_MOCK } from '@/services/api';
import { teamService } from '@/services/team.service';
import { INVITABLE_ROLES, inviteSchema, type InviteInput } from '@/utils/schemas/team';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function TeamScreen() {
  const canManage = useCan('team');
  const { isWide } = useBreakpoint();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const invitations = useQuery({
    queryKey: ['invitations'],
    queryFn: teamService.listInvitations,
    enabled: canManage,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['invitations'] });
  const create = useMutation({ mutationFn: teamService.createInvitation, onSuccess: refresh });
  const cancel = useMutation({ mutationFn: teamService.cancelInvitation, onSuccess: refresh });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'SELLER' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await create.mutateAsync(values);
      reset({ email: '', role: values.role });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  if (!canManage) {
    return (
      <Screen>
        <Txt variant="displayL">Equipe</Txt>
        <Txt variant="body">Você não tem permissão para acessar esta área.</Txt>
      </Screen>
    );
  }

  return (
    <Screen maxWidth={1000}>
      <View style={styles.header}>
        <Txt variant="displayL" accessibilityRole="header">
          Equipe
        </Txt>
        <Txt variant="small">Convide funcionários e defina o que cada um pode acessar.</Txt>
      </View>

      <View style={[styles.columns, isWide ? styles.columnsWide : null]}>
        <Card style={isWide ? styles.formCard : undefined}>
          <Txt variant="heading">Convidar funcionário</Txt>
          <FormError message={formError} />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="E-mail do funcionário"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />
          <Txt variant="label">Função</Txt>
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chips} accessibilityRole="radiogroup">
                {INVITABLE_ROLES.map((role) => {
                  const selected = role === value;
                  return (
                    <Pressable
                      key={role}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => onChange(role)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Txt style={{ fontFamily: selected ? fonts.bodySemi : fonts.body, fontSize: 14, color: selected ? colors.white : colors.ink }}>
                        {ROLE_LABELS[role]}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
          <Button label="Enviar convite" icon="paper-plane-outline" onPress={onSubmit} loading={create.isPending} />
          {USE_MOCK ? <Txt variant="caption">Modo demonstração: nenhum e-mail é enviado.</Txt> : null}
        </Card>

        <View style={[styles.listColumn, isWide ? styles.listWide : null]}>
          <Txt variant="displayM">Convites</Txt>
          {invitations.isLoading ? <Txt variant="small">Carregando convites…</Txt> : null}
          {invitations.isError ? <FormError message={getErrorMessage(invitations.error)} /> : null}
          {invitations.data?.length === 0 ? (
            <Card>
              <Txt variant="small">Nenhum convite enviado. Convide seu primeiro funcionário ao lado.</Txt>
            </Card>
          ) : null}
          {invitations.data?.map((inv) => (
            <Card key={inv.id} style={styles.row}>
              <View style={styles.rowInfo}>
                <Txt variant="body">{inv.email}</Txt>
                <View style={styles.rowMeta}>
                  <Badge label={ROLE_LABELS[inv.role]} tone="accent" />
                  <Badge label={INVITATION_STATUS_LABELS[inv.status]} />
                </View>
                {inv.status === 'PENDING' ? (
                  <Txt variant="caption">Expira em {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}</Txt>
                ) : null}
              </View>
              {inv.status === 'PENDING' ? (
                <Button
                  label="Cancelar"
                  variant="danger"
                  size="sm"
                  loading={cancel.isPending && cancel.variables === inv.id}
                  onPress={() => cancel.mutate(inv.id)}
                />
              ) : null}
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  columns: { gap: spacing.xl },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  formCard: { width: 380 },
  listColumn: { gap: spacing.md },
  listWide: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowInfo: { flex: 1, gap: 6 },
  rowMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
