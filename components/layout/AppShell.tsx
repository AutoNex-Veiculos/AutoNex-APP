import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Txt } from '@/components/ui/Txt';
import { useAuth } from '@/context/AuthContext';
import { MODULES, type AppRoute } from '@/constants/modules';
import { ROLE_LABELS } from '@/constants/roles';
import { colors, fonts, radius } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { USE_MOCK } from '@/services/api';
import { can } from '@/utils/permissions';
import type { IconName } from '@/types/ui';

interface NavItem {
  label: string;
  href: '/home' | AppRoute;
  icon: IconName;
  iconActive: IconName;
}

const filled = (name: IconName) => name.replace(/-outline$/, '') as IconName;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

// Barra lateral no computador e barra inferior rolável no celular.
export function AppShell({ children }: { children: ReactNode }) {
  const { isWide } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { session, signOut } = useAuth();

  if (!session) return null;
  const { user, company } = session;

  const items: NavItem[] = [
    { label: 'Início', href: '/home', icon: 'home-outline', iconActive: 'home' },
    ...MODULES.filter((m) => can(user.role, m.key)).map((m) => ({ label: m.title, href: m.route, icon: m.icon, iconActive: filled(m.icon) })),
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  if (isWide) {
    return (
      <View style={styles.wideRoot}>
        <View style={styles.sidebar}>
          <View style={styles.sidebarTop}>
            <Logo tone="light" />
          </View>
          <ScrollView style={styles.navScroll} contentContainerStyle={styles.nav}>
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Pressable
                  key={item.href}
                  accessibilityRole="link"
                  accessibilityState={{ selected: active }}
                  onPress={() => router.navigate(item.href)}
                  style={({ pressed }) => [styles.navItem, active && styles.navItemActive, pressed && styles.pressed]}
                >
                  <Ionicons name={active ? item.iconActive : item.icon} size={20} color={active ? colors.accentOnPanel : colors.onPanelMuted} />
                  <Txt style={{ fontFamily: active ? fonts.bodySemi : fonts.body, fontSize: 15, color: active ? colors.onPanel : colors.onPanelMuted }}>{item.label}</Txt>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.userBlock}>
            {USE_MOCK ? <Badge label="Modo demonstração" tone="glass" /> : null}
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Txt style={styles.avatarText}>{initials(user.name)}</Txt>
              </View>
              <View style={styles.userInfo}>
                <Txt style={styles.userName} numberOfLines={1}>{user.name}</Txt>
                <Txt style={styles.userRole} numberOfLines={1}>
                  {ROLE_LABELS[user.role]}
                  {company ? `, ${company.tradeName}` : ''}
                </Txt>
              </View>
            </View>
            <Button label="Sair" icon="log-out-outline" variant="onPanel" size="sm" onPress={() => void signOut()} />
          </View>
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.narrowRoot}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Logo tone="light" size={20} />
        <View style={styles.topRight}>
          {USE_MOCK ? <Badge label="Demonstração" tone="glass" /> : null}
          <Pressable accessibilityRole="button" accessibilityLabel={`Sair de ${user.name}`} onPress={() => void signOut()} style={styles.topAction}>
            <View style={styles.avatarSmall}>
              <Txt style={styles.avatarTextSmall}>{initials(user.name)}</Txt>
            </View>
            <Ionicons name="log-out-outline" size={20} color={colors.onPanelMuted} />
          </Pressable>
        </View>
      </View>
      <View style={styles.content}>{children}</View>
      {items.length > 1 ? (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bottomScroll}>
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Pressable
                  key={item.href}
                  accessibilityRole="link"
                  accessibilityState={{ selected: active }}
                  onPress={() => router.navigate(item.href)}
                  style={styles.bottomItem}
                >
                  <Ionicons name={active ? item.iconActive : item.icon} size={22} color={active ? colors.accent : colors.inkMuted} />
                  <Txt style={{ fontFamily: active ? fonts.bodySemi : fonts.body, fontSize: 12, color: active ? colors.accent : colors.inkMuted }} numberOfLines={1}>
                    {item.label}
                  </Txt>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wideRoot: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },
  sidebar: { width: 264, backgroundColor: colors.panel, padding: 20 },
  sidebarTop: { paddingVertical: 8, paddingHorizontal: 6 },
  navScroll: { flex: 1, marginTop: 20 },
  nav: { gap: 4, paddingBottom: 12 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14, borderRadius: radius.input },
  navItemActive: { backgroundColor: colors.panelRaised },
  pressed: { opacity: 0.85 },
  userBlock: { gap: 14, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.panelLine },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.white },
  userInfo: { flex: 1 },
  userName: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 20, color: colors.onPanel },
  userRole: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: colors.onPanelMuted },
  content: { flex: 1, backgroundColor: colors.bg },

  narrowRoot: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.panel },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topAction: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarTextSmall: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.white },
  bottomBar: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 },
  bottomScroll: { paddingHorizontal: 8 },
  bottomItem: { minWidth: 84, paddingHorizontal: 10, alignItems: 'center', gap: 2, minHeight: 48, justifyContent: 'center' },
});
