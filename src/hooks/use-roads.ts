// src/hooks/use-roads.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type DbRoad } from "@/lib/supabase";

const ROADS_KEY = ["roads"];

export function useRoads() {
  return useQuery({
    queryKey: ROADS_KEY,
    queryFn: async (): Promise<DbRoad[]> => {
      const { data, error } = await supabase
        .from("roads")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRoad(id: string | null) {
  return useQuery({
    queryKey: [...ROADS_KEY, id],
    queryFn: async (): Promise<DbRoad | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("roads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useAddRoad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      road: Omit<DbRoad, "id" | "created_at" | "updated_at">
    ): Promise<DbRoad> => {
      const { data, error } = await supabase
        .from("roads")
        .insert(road)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROADS_KEY });
    },
  });
}

export function useUpdateRoad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<DbRoad> & { id: string }): Promise<DbRoad> => {
      const { data, error } = await supabase
        .from("roads")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROADS_KEY });
    },
  });
}

export function useDeleteRoad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("roads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROADS_KEY });
    },
  });
}

export function useClearAllRoads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const { error } = await supabase
        .from("roads")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROADS_KEY });
    },
  });
}
