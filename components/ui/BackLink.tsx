import { StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Button } from '@/components/ui/Button';

export function BackLink({ href, label }: { href: Href; label: string }) {
  const router = useRouter();
  return <Button label={label} icon="arrow-back" variant="ghost" size="sm" onPress={() => router.navigate(href)} style={styles.back} />;
}

const styles = StyleSheet.create({ back: { alignSelf: 'flex-start', paddingHorizontal: 0 } });
