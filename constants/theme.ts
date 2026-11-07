import type { TextStyle } from 'react-native';

// Direção visual: showroom claro, painéis em grafite e um único acento verde-racing.
export const colors = {
  bg: '#F1F3F2',
  surface: '#FFFFFF',
  ink: '#14161A',
  inkMuted: '#5B626B',
  line: '#DADFDD',

  panel: '#14161A',
  panelRaised: '#1E2126',
  panelLine: '#2B2F35',
  onPanel: '#F1F3F2',
  onPanelMuted: '#9AA3AC',

  accent: '#0E6B57',
  accentDark: '#0A4F41',
  accentSoft: '#DCEBE6',
  accentOnPanel: '#4FD1AE',

  danger: '#C0392B',
  dangerSoft: '#F8E3E0',
  white: '#FFFFFF',
  scrim: 'rgba(10, 12, 14, 0.5)',
} as const;

export const fonts = {
  display: 'BarlowCondensed_700Bold',
  displaySemi: 'BarlowCondensed_600SemiBold',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  bodySemi: 'IBMPlexSans_600SemiBold',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 20, xl: 32, xxl: 48 } as const;

export const radius = { input: 10, button: 10, card: 18, image: 16, chip: 999 } as const;

export const fill = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as const;

export const text = {
  displayXL: { fontFamily: fonts.display, fontSize: 64, lineHeight: 64, letterSpacing: -0.5, color: colors.ink },
  displayL: { fontFamily: fonts.display, fontSize: 42, lineHeight: 44, letterSpacing: -0.3, color: colors.ink },
  displayM: { fontFamily: fonts.display, fontSize: 30, lineHeight: 32, color: colors.ink },
  heading: { fontFamily: fonts.bodySemi, fontSize: 18, lineHeight: 24, color: colors.ink },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.ink },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
} satisfies Record<string, TextStyle>;
