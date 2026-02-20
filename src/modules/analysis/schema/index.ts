// src/modules/analysis/schema/index.ts
import z from "zod";

// Zod Schema untuk validasi
export const RoadFormSchema = z.object({
  namaJalan: z
    .string()
    .min(3, { message: "Nama jalan minimal 3 karakter" })
    .max(100, { message: "Nama jalan maksimal 100 karakter" }),
  polyline: z
    .string()
    .optional()
    .refine((val) => !val || val.length > 0, {
      message: "Polyline tidak boleh kosong jika diisi",
    }),
  // C1: Kondisi Fisik Jalan (PCI) - Cost
  pci: z
    .string()
    .min(1, { message: "PCI wajib diisi" })
    .regex(/^\d+(\.\d+)?$/, { message: "PCI harus berupa angka" })
    .refine((val) => parseFloat(val) >= 0 && parseFloat(val) <= 100, {
      message: "Nilai PCI harus antara 0-100",
    }),
  // C2: Volume Lalu Lintas - Benefit
  volumeLaluLintas: z
    .string()
    .min(1, { message: "Volume lalu lintas wajib diisi" })
    .regex(/^\d+$/, { message: "Volume lalu lintas harus berupa angka bulat" }),
  // C3: Tingkat Keselamatan - Benefit
  tingkatKeselamatan: z
    .string()
    .min(1, { message: "Tingkat keselamatan wajib diisi" })
    .regex(/^\d+$/, {
      message: "Tingkat keselamatan harus berupa angka bulat",
    }),
  // C4: Estimasi Biaya Perbaikan - Cost
  estimasiBiaya: z
    .string()
    .min(1, { message: "Estimasi biaya wajib diisi" })
    .regex(/^\d+(\.\d+)?$/, { message: "Estimasi biaya harus berupa angka" }),
  // C5: Fungsi Jaringan Jalan - Cost
  fungsiJaringan: z.string().min(1, { message: "Pilih fungsi jaringan jalan" }),
  // C6: Dampak Penduduk Terlayani - Benefit
  dampakPenduduk: z
    .string()
    .min(1, { message: "Dampak penduduk wajib diisi" })
    .regex(/^\d+$/, { message: "Dampak penduduk harus berupa angka bulat" }),
});
