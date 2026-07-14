import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as queries from '@/lib/supabase/queries';
import { getAuthUser } from '@/lib/supabase/auth';
import type { Meeting, MeetingDetail } from '@/lib/supabase/types';

// Query keys
export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (userId: string) => [...meetingKeys.lists(), userId] as const,
  details: () => [...meetingKeys.all, 'detail'] as const,
  detail: (id: string) => [...meetingKeys.details(), id] as const,
};

// Hooks for fetching
export function useMeetings() {
  return useQuery({
    queryKey: meetingKeys.lists(),
    queryFn: async () => {
      const user = await getAuthUser();
      if (!user) throw new Error('Not authenticated');
      return queries.getMeetings(user.id);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

export function useMeeting(meetingId: string) {
  return useQuery({
    queryKey: meetingKeys.detail(meetingId),
    queryFn: () => queries.getMeetingById(meetingId),
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useMeetingDetail(meetingId: string) {
  return useQuery({
    queryKey: meetingKeys.detail(meetingId),
    queryFn: () => queries.getMeetingDetail(meetingId),
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hooks for mutations
export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const user = await getAuthUser();
      if (!user) throw new Error('Not authenticated');
      return queries.createMeeting(user.id, meeting);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      updates,
    }: {
      meetingId: string;
      updates: Partial<Omit<Meeting, 'id' | 'user_id' | 'created_at'>>;
    }) => queries.updateMeeting(meetingId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: string) => queries.deleteMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}
