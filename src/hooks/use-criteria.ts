// src/hooks/use-criteria.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type DbCriteria } from "@/lib/supabase";

const CRITERIA_KEY = ["criteria"];

export function useCriteria() {
  return useQuery({
    queryKey: CRITERIA_KEY,
    queryFn: async (): Promise<DbCriteria[]> => {
      const { data, error } = await supabase
        .from("criteria")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddCriterion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      criterion: Omit<DbCriteria, "id" | "created_at">
    ): Promise<DbCriteria> => {
      const { data, error } = await supabase
        .from("criteria")
        .insert(criterion)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRITERIA_KEY });
    },
  });
}

export function useUpdateCriterion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<DbCriteria> & { id: string }): Promise<DbCriteria> => {
      const { data, error } = await supabase
        .from("criteria")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRITERIA_KEY });
    },
  });
}

export function useDeleteCriterion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("criteria").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRITERIA_KEY });
    },
  });
}
