import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { useAuthStore } from '@/features/auth/auth-store';
import { getErrorMessage, USE_MOCK } from '@/lib/api/client';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { colors, font, spacing } from '@/theme/tokens';

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signIn(values);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  return (
    <Screen maxWidth={440}>
      <View style={styles.header}>
        <Text style={styles.brand}>AutoNex</Text>
        <Text style={font.title}>Entrar</Text>
        <Text style={font.small}>Acesse o ambiente da sua concessionária.</Text>
      </View>

      <FormError message={formError} />

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
            autoComplete="password"
            error={errors.password?.message}
          />
        )}
      />

      <Button label="Entrar" onPress={onSubmit} loading={isSubmitting} />

      <Link href="/register" style={styles.link}>
        Cadastrar minha empresa
      </Link>

      {USE_MOCK ? (
        <Text style={font.small}>
          Modo demonstração, sem API. Use demo@autonex.com com a senha AutoNex@123.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginTop: spacing.xl },
  brand: { color: colors.accent, fontSize: 18, fontWeight: '700' },
  link: { color: colors.accent, fontSize: 16, textAlign: 'center', paddingVertical: spacing.sm },
});
