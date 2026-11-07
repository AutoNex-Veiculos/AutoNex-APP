import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

// Rota "/": envia para o painel ou para o login, conforme a sessão.
export default function Index() {
  const { session } = useAuth();
  return <Redirect href={session ? '/home' : '/login'} />;
}
