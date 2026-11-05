import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/auth-store';
import { can } from '@/features/auth/permissions';
import { ROLE_LABELS } from '@/features/auth/roles';
import { MODULES } from '@/features/dashboard/modules';
import { colors, font, radius, spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);

  if (!session) return null;
  const { user, company } = session;
  const firstName = user.name.split(' ')[0];
  const modules = MODULES.filter((m) => can(user.role, m.key));

  return (
    <Screen edges={['bottom']}>
      <View style={styles.header}>
        <Text style={font.title}>Olá, {firstName}</Text>
        <Text style={font.small}>
          {company?.tradeName ?? 'Sem empresa'} — {ROLE_LABELS[user.role]}
        </Text>
      </View>

      <Text style={font.small}>
        Os módulos sem destaque ainda não têm tela e serão liberados conforme forem integrados à API.
      </Text>

      <View style={styles.grid}>
        {modules.map((m) => {
          const available = !!m.route;
          return (
            <Pressable
              key={m.key}
              accessibilityRole={available ? 'button' : 'text'}
              disabled={!available}
              onPress={() => m.route && router.push(m.route)}
              style={[styles.card, available ? styles.cardActive : styles.cardMuted]}
            >
              <Text style={font.heading}>{m.title}</Text>
              <Text style={font.small}>{m.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button label="Sair" variant="secondary" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  grid: { gap: spacing.md },
  card: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  cardActive: { borderColor: colors.accent },
  cardMuted: { borderColor: colors.border, opacity: 0.6 },
});
