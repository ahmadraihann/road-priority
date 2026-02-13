// src/modules/analysis/helpers/index.ts
import type { RoadData } from "@/modules/analysis/types";

// Bobot kriteria (sudah dinormalisasi, total = 1.0)
export const WEIGHTS = {
  pci: 0.3, // C1: Kondisi Fisik (Cost)
  volumeLaluLintas: 0.25, // C2: Volume Lalu Lintas (Benefit)
  tingkatKeselamatan: 0.15, // C3: Tingkat Keselamatan (Cost)
  estimasiBiaya: 0.12, // C4: Estimasi Biaya (Cost)
  fungsiJaringan: 0.1, // C5: Fungsi Jaringan (Cost)
  dampakPenduduk: 0.08, // C6: Dampak Penduduk (Benefit)
};

// Tipe kriteria: Cost atau Benefit
export const CRITERIA_TYPES = {
  pci: "cost",
  volumeLaluLintas: "benefit",
  tingkatKeselamatan: "cost",
  estimasiBiaya: "cost",
  fungsiJaringan: "cost",
  dampakPenduduk: "benefit",
};

export interface TopsisResult {
  id: string;
  namaJalan: string;
  score: number;
  rank: number;
  distanceToIdealPositive: number;
  distanceToIdealNegative: number;
  category: "Prioritas Tinggi" | "Prioritas Sedang" | "Prioritas Rendah";
  criteria: {
    pci: string;
    volumeLaluLintas: string;
    tingkatKeselamatan: string;
    estimasiBiaya: string;
    fungsiJaringan: string;
    dampakPenduduk: string;
    polyline?: string; // Added for GIS map visualization
  };
}

export function createDecisionMatrix(roads: RoadData[]): number[][] {
  return roads.map((road) => [
    parseFloat(road.pci),
    parseFloat(road.volumeLaluLintas),
    parseFloat(road.tingkatKeselamatan),
    parseFloat(road.estimasiBiaya),
    parseFloat(road.fungsiJaringan),
    parseFloat(road.dampakPenduduk),
  ]);
}

export function normalizeMatrix(matrix: number[][]): number[][] {
  const numCriteria = matrix[0].length;
  const normalized: number[][] = [];
  const sumOfSquares = new Array(numCriteria).fill(0);

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < numCriteria; j++) {
      sumOfSquares[j] += Math.pow(matrix[i][j], 2);
    }
  }

  const sqrtSumOfSquares = sumOfSquares.map((sum) => Math.sqrt(sum));

  for (let i = 0; i < matrix.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < numCriteria; j++) {
      row.push(matrix[i][j] / sqrtSumOfSquares[j]);
    }
    normalized.push(row);
  }

  return normalized;
}

export function createWeightedMatrix(normalizedMatrix: number[][]): number[][] {
  const weights = [
    WEIGHTS.pci,
    WEIGHTS.volumeLaluLintas,
    WEIGHTS.tingkatKeselamatan,
    WEIGHTS.estimasiBiaya,
    WEIGHTS.fungsiJaringan,
    WEIGHTS.dampakPenduduk,
  ];

  return normalizedMatrix.map((row) =>
    row.map((value, index) => value * weights[index])
  );
}

export function findIdealSolutions(weightedMatrix: number[][]) {
  const numCriteria = weightedMatrix[0].length;
  const idealPositive: number[] = [];
  const idealNegative: number[] = [];

  const criteriaTypesArray = [
    CRITERIA_TYPES.pci,
    CRITERIA_TYPES.volumeLaluLintas,
    CRITERIA_TYPES.tingkatKeselamatan,
    CRITERIA_TYPES.estimasiBiaya,
    CRITERIA_TYPES.fungsiJaringan,
    CRITERIA_TYPES.dampakPenduduk,
  ];

  for (let j = 0; j < numCriteria; j++) {
    const column = weightedMatrix.map((row) => row[j]);
    const type = criteriaTypesArray[j];

    if (type === "benefit") {
      idealPositive.push(Math.max(...column));
      idealNegative.push(Math.min(...column));
    } else {
      idealPositive.push(Math.min(...column));
      idealNegative.push(Math.max(...column));
    }
  }

  return { idealPositive, idealNegative };
}

export function calculateDistances(
  weightedMatrix: number[][],
  idealPositive: number[],
  idealNegative: number[]
) {
  const distancesPositive: number[] = [];
  const distancesNegative: number[] = [];

  for (let i = 0; i < weightedMatrix.length; i++) {
    let sumPositive = 0;
    let sumNegative = 0;

    for (let j = 0; j < weightedMatrix[i].length; j++) {
      sumPositive += Math.pow(weightedMatrix[i][j] - idealPositive[j], 2);
      sumNegative += Math.pow(weightedMatrix[i][j] - idealNegative[j], 2);
    }

    distancesPositive.push(Math.sqrt(sumPositive));
    distancesNegative.push(Math.sqrt(sumNegative));
  }

  return { distancesPositive, distancesNegative };
}

export function calculatePreferenceScores(
  distancesPositive: number[],
  distancesNegative: number[]
): number[] {
  return distancesPositive.map((dPos, index) => {
    const dNeg = distancesNegative[index];
    return dNeg / (dPos + dNeg);
  });
}

export function calculateTopsis(roads: RoadData[]): TopsisResult[] {
  const decisionMatrix = createDecisionMatrix(roads);
  const normalizedMatrix = normalizeMatrix(decisionMatrix);
  const weightedMatrix = createWeightedMatrix(normalizedMatrix);
  const { idealPositive, idealNegative } = findIdealSolutions(weightedMatrix);
  const { distancesPositive, distancesNegative } = calculateDistances(
    weightedMatrix,
    idealPositive,
    idealNegative
  );
  const scores = calculatePreferenceScores(
    distancesPositive,
    distancesNegative
  );

  const results: TopsisResult[] = roads.map((road, index) => ({
    id: road.id,
    namaJalan: road.namaJalan,
    score: scores[index],
    distanceToIdealPositive: distancesPositive[index],
    distanceToIdealNegative: distancesNegative[index],
    rank: 0,
    category: "Prioritas Sedang",
    criteria: {
      pci: road.pci,
      volumeLaluLintas: road.volumeLaluLintas,
      tingkatKeselamatan: road.tingkatKeselamatan,
      estimasiBiaya: road.estimasiBiaya,
      fungsiJaringan: road.fungsiJaringan,
      dampakPenduduk: road.dampakPenduduk,
      polyline: road.polyline, // Include polyline for map
    },
  }));

  results.sort((a, b) => b.score - a.score);
  results.forEach((result, index) => {
    result.rank = index + 1;

    if (result.score >= 0.7) {
      result.category = "Prioritas Tinggi";
    } else if (result.score >= 0.5) {
      result.category = "Prioritas Sedang";
    } else {
      result.category = "Prioritas Rendah";
    }
  });

  return results;
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case "Prioritas Tinggi":
      return "bg-red-100 text-red-800 border-red-200";
    case "Prioritas Sedang":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Prioritas Rendah":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getRankMedal(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `${rank}`;
  }
}

export function formatScore(score: number): string {
  return (score * 100).toFixed(2) + "%";
}

export interface CalculationDetails {
  decisionMatrix: number[][];
  normalizedMatrix: number[][];
  weightedMatrix: number[][];
  idealPositive: number[];
  idealNegative: number[];
  distancesPositive: number[];
  distancesNegative: number[];
  scores: number[];
}

export function calculateTopsisWithDetails(roads: RoadData[]): {
  results: TopsisResult[];
  details: CalculationDetails;
} {
  const decisionMatrix = createDecisionMatrix(roads);
  const normalizedMatrix = normalizeMatrix(decisionMatrix);
  const weightedMatrix = createWeightedMatrix(normalizedMatrix);
  const { idealPositive, idealNegative } = findIdealSolutions(weightedMatrix);
  const { distancesPositive, distancesNegative } = calculateDistances(
    weightedMatrix,
    idealPositive,
    idealNegative
  );
  const scores = calculatePreferenceScores(
    distancesPositive,
    distancesNegative
  );

  const results: TopsisResult[] = roads.map((road, index) => ({
    id: road.id,
    namaJalan: road.namaJalan,
    score: scores[index],
    distanceToIdealPositive: distancesPositive[index],
    distanceToIdealNegative: distancesNegative[index],
    rank: 0,
    category: "Prioritas Sedang",
    criteria: {
      pci: road.pci,
      volumeLaluLintas: road.volumeLaluLintas,
      tingkatKeselamatan: road.tingkatKeselamatan,
      estimasiBiaya: road.estimasiBiaya,
      fungsiJaringan: road.fungsiJaringan,
      dampakPenduduk: road.dampakPenduduk,
      polyline: road.polyline, // Include polyline for map
    },
  }));

  results.sort((a, b) => b.score - a.score);
  results.forEach((result, index) => {
    result.rank = index + 1;
    if (result.score >= 0.7) {
      result.category = "Prioritas Tinggi";
    } else if (result.score >= 0.5) {
      result.category = "Prioritas Sedang";
    } else {
      result.category = "Prioritas Rendah";
    }
  });

  const details: CalculationDetails = {
    decisionMatrix,
    normalizedMatrix,
    weightedMatrix,
    idealPositive,
    idealNegative,
    distancesPositive,
    distancesNegative,
    scores,
  };

  return { results, details };
}
