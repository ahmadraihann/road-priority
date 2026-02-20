// src/modules/analysis/views/calculate.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, CheckCircle2, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useRoads } from "@/hooks/use-roads";
import { useCriteria } from "@/hooks/use-criteria";
import { useSaveResults } from "@/hooks/use-analysis";
import { calculateTopsis } from "../helpers";

const steps = [
  { label: "Memuat data jalan", duration: 800 },
  { label: "Membuat matriks keputusan", duration: 1000 },
  { label: "Normalisasi matriks", duration: 1200 },
  { label: "Pembobotan kriteria", duration: 1000 },
  { label: "Menghitung jarak ideal positif & negatif", duration: 1500 },
  { label: "Menghitung nilai preferensi (V)", duration: 1000 },
  { label: "Menentukan ranking prioritas", duration: 800 },
];

const CalculatePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: roads = [], isLoading: roadsLoading } = useRoads();
  const { data: criteria = [], isLoading: criteriaLoading } = useCriteria();
  const saveResultsMutation = useSaveResults();

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(true);

  const isLoading = roadsLoading || criteriaLoading;

  useEffect(() => {
    if (isLoading) return;

    if (roads.length === 0 || criteria.length === 0) {
      navigate("/review");
      return;
    }

    let totalDuration = 0;
    const stepDurations = steps.map((step) => {
      const start = totalDuration;
      totalDuration += step.duration;
      return { ...step, start, end: totalDuration };
    });

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        const currentTime = (newProgress / 100) * totalDuration;
        const activeStep = stepDurations.findIndex(
          (step) => currentTime >= step.start && currentTime < step.end
        );
        if (activeStep !== -1) setCurrentStep(activeStep);

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            try {
              const results = calculateTopsis(roads, criteria);
              const batchId = crypto.randomUUID();

              // Build weights snapshot
              const weightsSnapshot: Record<string, number> = {};
              criteria.forEach((c) => {
                weightsSnapshot[c.key] = Number(c.weight);
              });

              // Save to Supabase
              const dbResults = results.map((r) => ({
                road_id: r.id,
                score: r.score,
                rank: r.rank,
                category: r.category,
                distance_positive: r.distanceToIdealPositive,
                distance_negative: r.distanceToIdealNegative,
                criteria_snapshot: r.criteriaValues,
                weights_snapshot: weightsSnapshot,
                analysis_batch_id: batchId,
              }));

              await saveResultsMutation.mutateAsync(dbResults);
              setIsCalculating(false);
              setTimeout(() => navigate("/results"), 3000);
            } catch (error) {
              console.error("Error calculating TOPSIS:", error);
              setIsCalculating(false);
              setTimeout(() => navigate("/results"), 3000);
            }
          }, 3000);
        }

        return Math.min(newProgress, 100);
      });
    }, totalDuration / 100);

    return () => clearInterval(interval);
  }, [roads, criteria, navigate, isLoading]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-6 sm:mb-8 md:mb-12 animate-fade-in">
          <div className="relative inline-block mb-4 sm:mb-6 md:mb-8 mt-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-linear-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              {isCalculating ? (
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white animate-spin" />
              ) : (
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full border-2 sm:border-4 border-indigo-200 animate-ping opacity-20"></div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 sm:mb-3 md:mb-4 px-2">
            {isCalculating ? "Menghitung Prioritas..." : "Perhitungan Selesai!"}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-md mx-auto mb-4 sm:mb-6 md:mb-8 px-4">
            {isCalculating
              ? `Sistem sedang melakukan perhitungan TOPSIS dengan ${criteria.length} kriteria`
              : "Hasil analisis prioritas siap ditampilkan"}
          </p>

          <div className="mb-4 sm:mb-6 md:mb-8 px-2">
            <Progress value={progress} className="h-2 sm:h-3 mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm font-semibold text-indigo-600">
              {progress}% selesai
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-left">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6 text-center">
              Proses Perhitungan TOPSIS
            </h3>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${
                    index < currentStep
                      ? "bg-green-50 border-2 border-green-200"
                      : index === currentStep
                      ? "bg-indigo-50 border-2 border-indigo-300 shadow-md scale-[1.02] sm:scale-105"
                      : "bg-slate-50 border-2 border-slate-200 opacity-60"
                  }`}
                >
                  <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                    index < currentStep ? "bg-green-500" : index === currentStep ? "bg-indigo-600" : "bg-slate-300"
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : index === currentStep ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
                    ) : (
                      <span className="text-xs sm:text-sm font-bold text-white">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm md:text-base font-semibold leading-tight ${
                      index <= currentStep ? "text-slate-900" : "text-slate-500"
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < currentStep && (
                    <div className="hidden xs:block text-[10px] sm:text-xs font-semibold text-green-600 bg-green-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                      Selesai
                    </div>
                  )}
                  {index === currentStep && (
                    <div className="hidden xs:block text-[10px] sm:text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full animate-pulse whitespace-nowrap">
                      Proses...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 md:p-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg sm:rounded-xl">
            <div className="flex items-start gap-2 sm:gap-3">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-xs sm:text-sm font-semibold text-indigo-900 mb-1">
                  Tentang Metode TOPSIS
                </p>
                <p className="text-[10px] sm:text-xs text-indigo-700 leading-relaxed">
                  TOPSIS (Technique for Order of Preference by Similarity to
                  Ideal Solution) menentukan alternatif terbaik berdasarkan
                  jarak terdekat dari solusi ideal positif dan terjauh dari
                  solusi ideal negatif. Menggunakan {criteria.length} kriteria dinamis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatePage;
