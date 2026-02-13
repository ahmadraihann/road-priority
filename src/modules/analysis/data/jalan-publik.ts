// modules/analysis/data/jalan-publik.ts
import dataJalanJson from "@/assets/data-jalan.json";

export interface JalanPublik {
  id: string;
  namaJalan: string;
  polyline: [number, number][]; // Array of [lat, lng] directly
  panjang_meter?: number;
}

// Import data dari JSON
export const DATA_JALAN_PUBLIK: JalanPublik[] = (
  dataJalanJson as JalanPublik[]
).map((jalan) => ({
  id: jalan.id,
  namaJalan: jalan.namaJalan,
  polyline: jalan.polyline, // Sudah dalam format array
  panjang_meter: jalan.panjang_meter,
}));

// Helper function untuk mendapatkan jalan berdasarkan nama
export function getJalanByNama(namaJalan: string): JalanPublik | undefined {
  return DATA_JALAN_PUBLIK.find((jalan) => jalan.namaJalan === namaJalan);
}

// Helper function untuk mendapatkan jalan berdasarkan ID
export function getJalanById(id: string): JalanPublik | undefined {
  return DATA_JALAN_PUBLIK.find((jalan) => jalan.id === id);
}

// Helper function untuk search jalan
export function searchJalan(query: string, limit: number = 10): JalanPublik[] {
  if (!query.trim()) {
    return DATA_JALAN_PUBLIK.slice(0, limit);
  }

  const normalizedQuery = query.toLowerCase().trim();

  return DATA_JALAN_PUBLIK.filter(
    (jalan) =>
      jalan.namaJalan.toLowerCase().includes(normalizedQuery) ||
      jalan.id.toLowerCase().includes(normalizedQuery)
  ).slice(0, limit);
}

// Helper function untuk pagination
export function getJalanPaginated(
  page: number = 0,
  pageSize: number = 10,
  searchQuery: string = ""
): {
  data: JalanPublik[];
  hasMore: boolean;
  total: number;
} {
  let filtered = DATA_JALAN_PUBLIK;

  // Apply search filter
  if (searchQuery.trim()) {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    filtered = DATA_JALAN_PUBLIK.filter(
      (jalan) =>
        jalan.namaJalan.toLowerCase().includes(normalizedQuery) ||
        jalan.id.toLowerCase().includes(normalizedQuery)
    );
  }

  const start = page * pageSize;
  const end = start + pageSize;
  const data = filtered.slice(start, end);
  const hasMore = end < filtered.length;

  return {
    data,
    hasMore,
    total: filtered.length,
  };
}

// Helper function untuk mendapatkan semua nama jalan unique
export function getUniqueNamaJalan(): string[] {
  const uniqueNames = new Set(
    DATA_JALAN_PUBLIK.map((jalan) => jalan.namaJalan)
  );
  return Array.from(uniqueNames).sort();
}

// Helper function untuk count berdasarkan nama jalan
export function countByNamaJalan(): Record<string, number> {
  const counts: Record<string, number> = {};

  DATA_JALAN_PUBLIK.forEach((jalan) => {
    counts[jalan.namaJalan] = (counts[jalan.namaJalan] || 0) + 1;
  });

  return counts;
}
