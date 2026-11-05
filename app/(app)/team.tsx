import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { useCan } from '@/features/auth/permissions';
import { INVITATION_STATUS_LABELS, ROLE_LABELS } from '@/features/auth/roles';
import { getErrorMessage, USE_MOCK } from '@/lib/api/client';
import { teamService } from '@/services/team.service';
import { INVITABLE_ROLES, inviteSchema, type InviteInput } from '@/schemas/team';
import { colors, font, radius, spacing } from '@/theme/tokens';

export default function TeamScreen() {
  const canManage = useCan('team');
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
      <Screen edges={['bottom']}>
        <Text style={font.body}>Você não tem permissão para acessar esta área.</Text>
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']} maxWidth={720}>
      <View style={styles.section}>
        <Text style={font.heading}>Convidar funcionário</Text>
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
                    <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                      {ROLE_LABELS[role]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
        <Button label="Enviar convite" onPress={onSubmit} loading={create.isPending} />
        {USE_MOCK ? <Text style={font.small}>Modo demonstração: nenhum e-mail é enviado.</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={font.heading}>Convites</Text>
        {invitations.isLoading ? <Text style={font.small}>Carregando convites…</Text> : null}
        {invitations.isError ? (
          <FormError message={getErrorMessage(invitations.error)} />
        ) : null}
        {invitations.data?.length === 0 ? (
          <Text style={font.small}>Nenhum convite enviado. Convide seu primeiro funcionário acima.</Text>
        ) : null}
        {invitations.data?.map((inv) => (
          <View key={inv.id} style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={font.body}>{inv.email}</Text>
              <Text style={font.small}>
                {ROLE_LABELS[inv.role]} — {INVITATION_STATUS_LABELS[inv.status]}
                {inv.status === 'PENDING'
                  ? `, expira em ${new Date(inv.expiresAt).toLocaleDateString('pt-BR')}`
                  : ''}
              </Text>
            </View>
            {inv.status === 'PENDING' ? (
              <Button
                label="Cancelar"
                variant="danger"
                loading={cancel.isPending && cancel.variables === inv.id}
                onPress={() => cancel.mutate(inv.id)}
              />
            ) : null}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipSelected: { borderColor: colors.accent, backgroundColor: colors.surfaceRaised },
  chipLabel: { color: colors.textMuted, fontSize: 14 },
  chipLabelSelected: { color: colors.text, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowInfo: { flex: 1, gap: 2 },
});
