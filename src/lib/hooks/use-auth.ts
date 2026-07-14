import { useQuery } from '@tanstack/react-query';
import { getAuthUser } from '@/lib/supabase/auth';
import type { AuthUser } from '@/lib/supabase/types';

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

export function useAuthUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => getAuthUser(),
    staleTime: Infinity, // User doesn't change unless they log out
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
