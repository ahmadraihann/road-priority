// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

// Database types
export interface DbCriteria {
  id: string;
  code: string;
  name: string;
  key: string;
  type: "cost" | "benefit";
  weight: number;
  unit: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface DbRoad {
  id: string;
  road_id: string;
  nama_jalan: string;
  polyline: string | null;
  criteria_values: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface DbAnalysisResult {
  id: string;
  road_id: string;
  score: number;
  rank: number;
  category: string;
  distance_positive: number;
  distance_negative: number;
  criteria_snapshot: Record<string, string>;
  weights_snapshot: Record<string, number>;
  analysis_batch_id: string;
  created_at: string;
  // Joined fields
  roads?: DbRoad;
}
