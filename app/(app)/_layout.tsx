import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCan } from '@/features/auth/permissions';
import { colors } from '@/theme/tokens';

export default function AppLayout() {
  const canManageTeam = useCan('team');

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: 'Equipe',
          href: canManageTeam ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
