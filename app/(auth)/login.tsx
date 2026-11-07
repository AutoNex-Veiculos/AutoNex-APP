import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { DevQuickLogin } from '@/components/ui/DevQuickLogin';
import { Txt } from '@/components/ui/Txt';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/services/api';
import { images } from '@/constants/images';
import { colors, fonts } from '@/constants/theme';
import { loginSchema, type LoginInput } from '@/utils/schemas/auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
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
    <AuthShell
      headline="Do estoque à entrega, tudo sob controle."
      subline="Estoque, clientes, vendas e financeiro da sua concessionária em um só lugar."
      heroSource={images.loginHero}
      heroHint="Imagem de capa do login"
    >
      <View style={styles.header}>
        <Txt variant="displayL" accessibilityRole="header">
          Entrar
        </Txt>
        <Txt variant="small">Acesse o ambiente da sua concessionária.</Txt>
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

      <DevQuickLogin onError={setFormError} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  link: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.accent, textAlign: 'center', paddingVertical: 8 },
});
