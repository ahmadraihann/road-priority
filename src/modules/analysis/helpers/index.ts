// src/modules/analysis/helpers/index.ts
import type { DbCriteria, DbRoad } from "@/lib/supabase";

export interface TopsisResult {
  id: string; // road UUID (from roads table)
  roadId: string; // legacy road_id
  namaJalan: string;
  score: number;
  rank: number;
  distanceToIdealPositive: number;
  distanceToIdealNegative: number;
  category: "Prioritas Tinggi" | "Prioritas Sedang" | "Prioritas Rendah";
  criteriaValues: Record<string, string>;
  polyline?: string;
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

/**
 * Create decision matrix from roads and dynamic criteria
 */
export function createDecisionMatrix(
  roads: DbRoad[],
  criteria: DbCriteria[]
): number[][] {
  return roads.map((road) =>
    criteria.map((c) => parseFloat(road.criteria_values[c.key] || "0"))
  );
}

/**
 * Normalize matrix using vector normalization
 */
export function normalizeMatrix(matrix: number[][]): number[][] {
  if (matrix.length === 0) return [];
  const numCriteria = matrix[0].length;
  const sumOfSquares = new Array(numCriteria).fill(0);

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < numCriteria; j++) {
      sumOfSquares[j] += Math.pow(matrix[i][j], 2);
    }
  }

  const sqrtSumOfSquares = sumOfSquares.map((sum) => Math.sqrt(sum));

  return matrix.map((row) =>
    row.map((value, j) =>
      sqrtSumOfSquares[j] === 0 ? 0 : value / sqrtSumOfSquares[j]
    )
  );
}

/**
 * Apply weights from dynamic criteria
 */
export function createWeightedMatrix(
  normalizedMatrix: number[][],
  criteria: DbCriteria[]
): number[][] {
  const weights = criteria.map((c) => Number(c.weight));
  return normalizedMatrix.map((row) =>
    row.map((value, index) => value * weights[index])
  );
}

/**
 * Find ideal positive and negative solutions
 */
export function findIdealSolutions(
  weightedMatrix: number[][],
  criteria: DbCriteria[]
) {
  if (weightedMatrix.length === 0) return { idealPositive: [], idealNegative: [] };
  const numCriteria = weightedMatrix[0].length;
  const idealPositive: number[] = [];
  const idealNegative: number[] = [];

  for (let j = 0; j < numCriteria; j++) {
    const column = weightedMatrix.map((row) => row[j]);
    const type = criteria[j].type;

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

/**
 * Calculate distances to ideal solutions
 */
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

/**
 * Calculate preference scores (V values)
 */
export function calculatePreferenceScores(
  distancesPositive: number[],
  distancesNegative: number[]
): number[] {
  return distancesPositive.map((dPos, index) => {
    const dNeg = distancesNegative[index];
    const total = dPos + dNeg;
    return total === 0 ? 0 : dNeg / total;
  });
}

/**
 * Main TOPSIS calculation - now accepts dynamic criteria
 */
export function calculateTopsis(
  roads: DbRoad[],
  criteria: DbCriteria[]
): TopsisResult[] {
  if (roads.length === 0 || criteria.length === 0) return [];

  const decisionMatrix = createDecisionMatrix(roads, criteria);
  const normalizedMatrix = normalizeMatrix(decisionMatrix);
  const weightedMatrix = createWeightedMatrix(normalizedMatrix, criteria);
  const { idealPositive, idealNegative } = findIdealSolutions(
    weightedMatrix,
    criteria
  );
  const { distancesPositive, distancesNegative } = calculateDistances(
    weightedMatrix,
    idealPositive,
    idealNegative
  );
  const scores = calculatePreferenceScores(distancesPositive, distancesNegative);

  const results: TopsisResult[] = roads.map((road, index) => ({
    id: road.id,
    roadId: road.road_id,
    namaJalan: road.nama_jalan,
    score: scores[index],
    distanceToIdealPositive: distancesPositive[index],
    distanceToIdealNegative: distancesNegative[index],
    rank: 0,
    category: "Prioritas Sedang",
    criteriaValues: road.criteria_values,
    polyline: road.polyline || undefined,
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

/**
 * TOPSIS with full calculation details - for detail page
 */
export function calculateTopsisWithDetails(
  roads: DbRoad[],
  criteria: DbCriteria[]
): {
  results: TopsisResult[];
  details: CalculationDetails;
} {
  if (roads.length === 0 || criteria.length === 0) {
    return {
      results: [],
      details: {
        decisionMatrix: [],
        normalizedMatrix: [],
        weightedMatrix: [],
        idealPositive: [],
        idealNegative: [],
        distancesPositive: [],
        distancesNegative: [],
        scores: [],
      },
    };
  }

  const decisionMatrix = createDecisionMatrix(roads, criteria);
  const normalizedMatrix = normalizeMatrix(decisionMatrix);
  const weightedMatrix = createWeightedMatrix(normalizedMatrix, criteria);
  const { idealPositive, idealNegative } = findIdealSolutions(
    weightedMatrix,
    criteria
  );
  const { distancesPositive, distancesNegative } = calculateDistances(
    weightedMatrix,
    idealPositive,
    idealNegative
  );
  const scores = calculatePreferenceScores(distancesPositive, distancesNegative);

  const results: TopsisResult[] = roads.map((road, index) => ({
    id: road.id,
    roadId: road.road_id,
    namaJalan: road.nama_jalan,
    score: scores[index],
    distanceToIdealPositive: distancesPositive[index],
    distanceToIdealNegative: distancesNegative[index],
    rank: 0,
    category: "Prioritas Sedang",
    criteriaValues: road.criteria_values,
    polyline: road.polyline || undefined,
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

// Helper utilities
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
