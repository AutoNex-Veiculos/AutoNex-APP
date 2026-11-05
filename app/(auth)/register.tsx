import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { useAuthStore } from '@/features/auth/auth-store';
import { getErrorMessage } from '@/lib/api/client';
import { registerSchema, type RegisterInput } from '@/schemas/auth';
import { colors, font, spacing } from '@/theme/tokens';

export default function RegisterScreen() {
  const signUp = useAuthStore((s) => s.signUp);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', companyName: '', document: '', acceptTerms: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signUp(values);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  return (
    <Screen maxWidth={440}>
      <View style={styles.header}>
        <Text style={styles.brand}>AutoNex</Text>
        <Text style={font.title}>Cadastrar empresa</Text>
        <Text style={font.small}>Crie sua conta de proprietário e comece o teste gratuito.</Text>
      </View>

      <FormError message={formError} />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Seu nome completo"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoComplete="name"
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="E-mail"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Senha"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            autoComplete="new-password"
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="companyName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Nome da empresa"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.companyName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="document"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="CNPJ ou CPF"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="number-pad"
            error={errors.document?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="acceptTerms"
        render={({ field: { onChange, value } }) => (
          <Checkbox
            label="Li e aceito os termos de uso e a política de privacidade"
            checked={value}
            onChange={onChange}
            error={errors.acceptTerms?.message}
          />
        )}
      />

      <Button label="Criar conta" onPress={onSubmit} loading={isSubmitting} />

      <Link href="/login" style={styles.link}>
        Já tenho conta
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginTop: spacing.lg },
  brand: { color: colors.accent, fontSize: 18, fontWeight: '700' },
  link: { color: colors.accent, fontSize: 16, textAlign: 'center', paddingVertical: spacing.sm },
});
