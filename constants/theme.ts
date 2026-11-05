export const colors = {
  bg: '#17191D',
  surface: '#1F2227',
  surfaceRaised: '#282C33',
  border: '#343942',
  text: '#F4F5F6',
  textMuted: '#9CA3AD',
  accent: '#F2B03D',
  accentText: '#1A1405',
  danger: '#F26D6D',
  success: '#4CC38A',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 20, xl: 32 } as const;

export const radius = { input: 8, button: 8, card: 14, chip: 999 } as const;

export const font = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, color: colors.text },
  small: { fontSize: 14, color: colors.textMuted },
};
