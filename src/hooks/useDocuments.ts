import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import type { Document } from '../types/document';

export function useDocuments(userId: string) {
  return useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return (data as Document[]) || [];
    },
    enabled: !!userId,
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase.from('documents').delete().eq('id', documentId);
      if (error) throw error;
      return documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
