// src/hooks/use-road-storage.ts
import { useState, useEffect } from "react";

import type { RoadData } from "@/modules/analysis/types";
import initialRoadData from "@/assets/data-initial.json";

const STORAGE_KEY = "road_priority_data";
const INITIAL_DATA_FLAG = "road_initial_data_generated";

export const useRoadStorage = () => {
  const [roads, setRoads] = useState<RoadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount and load initial data if needed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const initialDataFlag = localStorage.getItem(INITIAL_DATA_FLAG);

      if (stored) {
        const parsed = JSON.parse(stored);

        // Only load initial data if localStorage is completely empty (0 data)
        // AND initial data JSON is not empty
        // If there's 1-19 data, don't load - leave it as is
        // If there's 20+ data, don't load - already complete
        if (
          parsed.length === 0 &&
          !initialDataFlag &&
          initialRoadData.length > 0
        ) {
          console.log(
            `📦 Loading ${initialRoadData.length} initial data from JSON...`
          );
          setRoads(initialRoadData as RoadData[]);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRoadData));
          localStorage.setItem(INITIAL_DATA_FLAG, "true");
        } else {
          // Load existing data (whether 0, 1, 5, 15, or 20+)
          setRoads(parsed);
        }
      } else {
        // No stored data at all
        if (initialRoadData.length > 0) {
          console.log(
            `📦 No data found. Loading ${initialRoadData.length} initial data from JSON...`
          );
          setRoads(initialRoadData as RoadData[]);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRoadData));
          localStorage.setItem(INITIAL_DATA_FLAG, "true");
        } else {
          console.log("📦 No initial data configured (JSON is empty).");
          setRoads([]);
          localStorage.setItem(INITIAL_DATA_FLAG, "true");
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever roads change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(roads));
      } catch (error) {
        console.error("Error saving data to localStorage:", error);
      }
    }
  }, [roads, isLoading]);

  const addRoad = (roadData: Omit<RoadData, "id" | "createdAt">) => {
    const newRoad: RoadData = {
      ...roadData,
      id: `road_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setRoads((prev) => [...prev, newRoad]);
    return newRoad;
  };

  const updateRoad = (
    id: string,
    roadData: Omit<RoadData, "id" | "createdAt">
  ) => {
    setRoads((prev) =>
      prev.map((road) => (road.id === id ? { ...road, ...roadData } : road))
    );
  };

  const deleteRoad = (id: string) => {
    setRoads((prev) => prev.filter((road) => road.id !== id));
  };

  const getRoad = (id: string) => {
    return roads.find((road) => road.id === id);
  };

  const clearAllRoads = () => {
    setRoads([]);
    localStorage.removeItem(STORAGE_KEY);
    // Note: We keep INITIAL_DATA_FLAG so it doesn't reload automatically
    // If user wants to reload initial data, they need to also clear this flag manually:
    // localStorage.removeItem('road_initial_data_generated');
  };

  return {
    roads,
    isLoading,
    addRoad,
    updateRoad,
    deleteRoad,
    getRoad,
    clearAllRoads,
  };
};
