// src/hooks/use-analysis.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type DbAnalysisResult } from "@/lib/supabase";

const ANALYSIS_KEY = ["analysis_results"];

export function useAnalysisResults() {
  return useQuery({
    queryKey: ANALYSIS_KEY,
    queryFn: async (): Promise<DbAnalysisResult[]> => {
      // Get the latest batch
      const { data: latestBatch, error: batchError } = await supabase
        .from("analysis_results")
        .select("analysis_batch_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (batchError || !latestBatch) return [];

      const { data, error } = await supabase
        .from("analysis_results")
        .select("*, roads(*)")
        .eq("analysis_batch_id", latestBatch.analysis_batch_id)
        .order("rank", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAnalysisResultByRoadId(roadId: string | null) {
  return useQuery({
    queryKey: [...ANALYSIS_KEY, "road", roadId],
    queryFn: async (): Promise<DbAnalysisResult | null> => {
      if (!roadId) return null;

      // Get the latest batch
      const { data: latestBatch, error: batchError } = await supabase
        .from("analysis_results")
        .select("analysis_batch_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (batchError || !latestBatch) return null;

      const { data, error } = await supabase
        .from("analysis_results")
        .select("*, roads(*)")
        .eq("analysis_batch_id", latestBatch.analysis_batch_id)
        .eq("road_id", roadId)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!roadId,
  });
}

export function useSaveResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      results: Omit<DbAnalysisResult, "id" | "created_at" | "roads">[]
    ): Promise<void> => {
      // Truncate: hapus semua hasil lama sebelum insert yang baru
      const { error: deleteError } = await supabase
        .from("analysis_results")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) throw deleteError;

      const { error } = await supabase
        .from("analysis_results")
        .insert(results);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYSIS_KEY });
    },
  });
}
