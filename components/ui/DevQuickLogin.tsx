import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { useAuth } from '@/context/AuthContext';
import { DEV_PASSWORD, DEV_PROFILES, type DevProfile } from '@/constants/devProfiles';
import { getErrorMessage } from '@/services/api';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  onError: (message: string | null) => void;
}

// SOMENTE DESENVOLVIMENTO: entra direto no perfil escolhido.
// Remova este componente (e constants/devProfiles.ts) antes de publicar.
export function DevQuickLogin({ onError }: Props) {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);

  if (!__DEV__) return null;

  async function enter(profile: DevProfile) {
    onError(null);
    setBusy(profile.role);
    try {
      await signIn({ email: profile.email, password: DEV_PASSWORD });
    } catch (error) {
      onError(getErrorMessage(error));
      setBusy(null);
    }
  }

  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Ionicons name="flash-outline" size={18} color={colors.accent} />
        <Txt variant="heading">Acesso rápido para desenvolvimento</Txt>
      </View>
      <Txt variant="small">Entra direto no perfil escolhido. Este bloco só aparece em desenvolvimento.</Txt>
      <View style={styles.grid}>
        {DEV_PROFILES.map((profile) => {
          const loading = busy === profile.role;
          return (
            <Pressable
              key={profile.role}
              accessibilityRole="button"
              accessibilityLabel={`Entrar como ${profile.label}`}
              accessibilityState={{ busy: loading, disabled: busy !== null }}
              disabled={busy !== null}
              onPress={() => void enter(profile)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed, busy !== null && !loading && styles.dimmed]}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={loading ? 'hourglass-outline' : profile.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.itemText}>
                <Txt variant="label">{profile.label}</Txt>
                <Txt variant="caption">{profile.description}</Txt>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: {
    flexGrow: 1,
    flexBasis: 170,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  pressed: { opacity: 0.85 },
  dimmed: { opacity: 0.5 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1 },
});
