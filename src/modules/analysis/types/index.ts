// src/modules/analysis/types/index.ts
import type z from "zod";
import type { RoadFormSchema } from "../schema";

export type RoadFormValues = z.infer<typeof RoadFormSchema>;

// Interface untuk data jalan yang tersimpan
export interface RoadData extends RoadFormValues {
  id: string;
  createdAt: string;
}

// Fungsi Jaringan Options
export const FungsiJaringanLabels: Record<string, string> = {
  "1": "Arteri Primer",
  "2": "Arteri Sekunder",
  "3": "Kolektor",
  "4": "Lokal",
};

// Criteria Info
export interface CriteriaInfo {
  code: string;
  name: string;
  type: "Cost" | "Benefit";
  weight: string;
  field: keyof RoadData;
}

export const CRITERIA: CriteriaInfo[] = [
  { code: "C1", name: "PCI", type: "Cost", weight: "30%", field: "pci" },
  {
    code: "C2",
    name: "Volume",
    type: "Benefit",
    weight: "25%",
    field: "volumeLaluLintas",
  },
  {
    code: "C3",
    name: "Keselamatan",
    type: "Cost",
    weight: "15%",
    field: "tingkatKeselamatan",
  },
  {
    code: "C4",
    name: "Biaya",
    type: "Cost",
    weight: "12%",
    field: "estimasiBiaya",
  },
  {
    code: "C5",
    name: "Fungsi",
    type: "Cost",
    weight: "10%",
    field: "fungsiJaringan",
  },
  {
    code: "C6",
    name: "Penduduk",
    type: "Benefit",
    weight: "8%",
    field: "dampakPenduduk",
  },
];
