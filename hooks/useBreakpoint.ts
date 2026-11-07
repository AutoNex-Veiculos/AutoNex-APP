import { useWindowDimensions } from 'react-native';

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return { width, isWide: width >= 1024, isMedium: width >= 680 };
}
