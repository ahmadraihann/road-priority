// src/modules/analysis/views/calculate.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, CheckCircle2, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useRoadStorage } from "@/hooks/use-road-storage";
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
  const { roads, isLoading } = useRoadStorage();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    // Check if there's data to calculate
    if (isLoading) return;

    if (roads.length === 0) {
      navigate("/review");
      return;
    }

    let totalDuration = 0;
    const stepDurations = steps.map((step) => {
      const start = totalDuration;
      totalDuration += step.duration;
      return { ...step, start, end: totalDuration };
    });

    // Simulate calculation process
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;

        // Update current step based on progress
        const currentTime = (newProgress / 100) * totalDuration;
        const activeStep = stepDurations.findIndex(
          (step) => currentTime >= step.start && currentTime < step.end
        );
        if (activeStep !== -1) {
          setCurrentStep(activeStep);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          // Perform actual TOPSIS calculation
          setTimeout(() => {
            const results = calculateTopsis(roads);
            // Save results to localStorage
            localStorage.setItem("topsis_results", JSON.stringify(results));
            setIsCalculating(false);
            // Navigate to results page
            setTimeout(() => navigate("/results"), 5000);
          }, 5000);
        }

        return Math.min(newProgress, 100);
      });
    }, totalDuration / 100);

    return () => clearInterval(interval);
  }, [roads, navigate, isLoading]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          {/* Icon */}
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 bg-linear-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              {isCalculating ? (
                <Loader2 className="w-16 h-16 text-white animate-spin" />
              ) : (
                <CheckCircle2 className="w-16 h-16 text-white" />
              )}
            </div>
            {/* Decorative rings */}
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-20"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-purple-200 animate-ping opacity-20"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {isCalculating ? "Menghitung Prioritas..." : "Perhitungan Selesai!"}
          </h1>

          <p className="text-lg text-slate-600 max-w-md mx-auto mb-8">
            {isCalculating
              ? "Sistem sedang melakukan perhitungan TOPSIS untuk menentukan prioritas perbaikan jalan"
              : "Hasil analisis prioritas siap ditampilkan"}
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-3 mb-3" />
            <p className="text-sm font-semibold text-indigo-600">
              {progress}% selesai
            </p>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-left">
            <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">
              Proses Perhitungan TOPSIS
            </h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    index < currentStep
                      ? "bg-green-50 border-2 border-green-200"
                      : index === currentStep
                      ? "bg-indigo-50 border-2 border-indigo-300 shadow-md scale-105"
                      : "bg-slate-50 border-2 border-slate-200 opacity-60"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      index < currentStep
                        ? "bg-green-500"
                        : index === currentStep
                        ? "bg-indigo-600"
                        : "bg-slate-300"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : index === currentStep ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        index <= currentStep
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>

                  {/* Status */}
                  {index < currentStep && (
                    <div className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      Selesai
                    </div>
                  )}
                  {index === currentStep && (
                    <div className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full animate-pulse">
                      Proses...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Calculator className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-indigo-900 mb-1">
                  Tentang Metode TOPSIS
                </p>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  TOPSIS (Technique for Order of Preference by Similarity to
                  Ideal Solution) adalah metode pengambilan keputusan
                  multi-kriteria yang menentukan alternatif terbaik berdasarkan
                  jarak terdekat dari solusi ideal positif dan terjauh dari
                  solusi ideal negatif.
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
