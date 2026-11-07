import { useAuth } from '@/context/AuthContext';
import { can, type Permission } from '@/utils/permissions';

export function useCan(permission: Permission): boolean {
  const { session } = useAuth();
  return can(session?.user.role, permission);
}
