import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { TextField } from '@/components/ui/TextField';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { Txt } from '@/components/ui/Txt';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/services/api';
import { images } from '@/constants/images';
import { colors, fonts } from '@/constants/theme';
import { registerSchema, type RegisterInput } from '@/utils/schemas/auth';

export default function RegisterScreen() {
  const { signUp } = useAuth();
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
    <AuthShell
      headline="Sua loja organizada em poucos minutos."
      subline="Cadastre sua empresa e comece o teste gratuito. Seus dados ficam separados dos de outras lojas."
      heroSource={images.registerHero}
      heroHint="Imagem de capa do cadastro"
    >
      <View style={styles.header}>
        <Txt variant="displayL" accessibilityRole="header">
          Cadastrar empresa
        </Txt>
        <Txt variant="small">Crie sua conta de proprietário.</Txt>
      </View>

      <FormError message={formError} />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField label="Seu nome completo" value={value} onChangeText={onChange} onBlur={onBlur} autoComplete="name" error={errors.name?.message} />
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
          <TextField label="Nome da empresa" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.companyName?.message} />
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
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  link: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.accent, textAlign: 'center', paddingVertical: 8 },
});
