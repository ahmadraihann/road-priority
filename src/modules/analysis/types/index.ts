// src/modules/analysis/types/index.ts
import type { DbCriteria } from "@/lib/supabase";

// Re-export for convenience
export type CriteriaInfo = DbCriteria;

// Fungsi Jaringan Options
export const FungsiJaringanLabels: Record<string, string> = {
  "1": "Arteri Primer",
  "2": "Arteri Sekunder",
  "3": "Kolektor",
  "4": "Lokal",
};
