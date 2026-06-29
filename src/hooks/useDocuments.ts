import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import type { Document } from '../types/document';
import { DocumentUploadService } from '../services/documents/upload.service';

export function useDocuments(userId: string) {
  return useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

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
    onMutate: async (documentId) => {
      await queryClient.cancelQueries({ queryKey: ['documents'] });
      const previousDocuments = queryClient.getQueryData<Document[]>(['documents']);
      queryClient.setQueryData<Document[]>(['documents'], (old = []) => old.filter(d => d.id !== documentId));
      return { previousDocuments };
    },
    onError: (_err, _documentId, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(['documents'], context.previousDocuments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
      const { data, error } = await DocumentUploadService.uploadDocument(null, file, userId);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
