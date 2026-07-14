import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as queries from '@/lib/supabase/queries';
import type { ActionItem } from '@/lib/supabase/types';

// Query keys
export const actionItemKeys = {
  all: ['actionItems'] as const,
  lists: () => [...actionItemKeys.all, 'list'] as const,
  list: (meetingId: string) => [...actionItemKeys.lists(), meetingId] as const,
};

// Hooks for fetching
export function useActionItems(meetingId: string) {
  return useQuery({
    queryKey: actionItemKeys.list(meetingId),
    queryFn: () => queries.getActionItems(meetingId),
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hooks for mutations
export function useUpdateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: Partial<Omit<ActionItem, 'id' | 'meeting_id' | 'created_at'>>;
    }) => queries.updateActionItem(itemId, updates),
    onSuccess: () => {
      // Invalidate all action items queries
      queryClient.invalidateQueries({ queryKey: actionItemKeys.all });
    },
  });
}
