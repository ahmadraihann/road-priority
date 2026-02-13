// src/hooks/use-road-stoarge.ts
import { useState, useEffect } from "react";
import type { RoadData } from "@/modules/analysis/types";

const STORAGE_KEY = "road_priority_data";

export const useRoadStorage = () => {
  const [roads, setRoads] = useState<RoadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRoads(parsed);
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
