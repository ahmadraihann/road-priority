// src/modules/analysis/views/detail.tsx
import React, { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, MapPin } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import { formatScore } from "../helpers";
import { calculateTopsisWithDetails } from "../helpers";
import { useRoads } from "@/hooks/use-roads";
import { useCriteria } from "@/hooks/use-criteria";
import { useAnalysisResultByRoadId } from "@/hooks/use-analysis";
import { Button } from "@/components/ui/button";

function MapBounds({ bounds }: { bounds: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds as any, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

const DetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roadId = searchParams.get("id");
  const { data: roads = [] } = useRoads();
  const { data: criteria = [] } = useCriteria();
  const { data: analysisResult, isLoading } = useAnalysisResultByRoadId(roadId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const calculationDetails = useMemo(() => {
    if (roads.length > 0 && criteria.length > 0) {
      const { details } = calculateTopsisWithDetails(roads, criteria);
      return details;
    }
    return null;
  }, [roads, criteria]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat detail...</p>
        </div>
      </div>
    );
  }

  if (!analysisResult || !analysisResult.roads) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Data Tidak Ditemukan
          </h2>
          <p className="text-slate-600 mb-6">
            Silakan lakukan perhitungan TOPSIS terlebih dahulu.
          </p>
          <Button
            onClick={() => navigate("/results")}
            className="bg-linear-to-r from-indigo-600 to-purple-600"
          >
            Kembali ke Hasil
          </Button>
        </div>
      </div>
    );
  }

  const road = analysisResult.roads;
  const score = Number(analysisResult.score);
  const category = analysisResult.category;
  const criteriaSnapshot = analysisResult.criteria_snapshot || {};
  const weightsSnapshot = analysisResult.weights_snapshot || {};

  // Parse polyline
  let polylineCoords: LatLngExpression[] = [];
  try {
    polylineCoords = JSON.parse(road.polyline || "[]");
  } catch {
    // ignore
  }

  const getColorByCategory = (cat: string): string => {
    if (cat === "Prioritas Tinggi") return "#ef4444";
    if (cat === "Prioritas Sedang") return "#f59e0b";
    return "#22c55e";
  };

  const getCategoryBgClass = (cat: string) => {
    if (cat === "Prioritas Tinggi") return "bg-red-500 animate-pulse shadow-lg";
    if (cat === "Prioritas Sedang")
      return "bg-yellow-500 animate-pulse shadow-lg";
    return "bg-green-500 animate-pulse shadow-lg";
  };

  // Get normalized weighted values
  const roadIndex = roads.findIndex((r) => r.id === roadId);
  const normalizedWeightedValues =
    calculationDetails && roadIndex !== -1
      ? calculationDetails.weightedMatrix[roadIndex]
      : null;

  const colorBorders = [
    "border-red-500",
    "border-orange-500",
    "border-yellow-500",
    "border-lime-500",
    "border-green-500",
    "border-emerald-500",
    "border-teal-500",
    "border-cyan-500",
  ];
  const colorBgs = [
    "bg-red-50",
    "bg-orange-50",
    "bg-yellow-50",
    "bg-lime-50",
    "bg-green-50",
    "bg-emerald-50",
    "bg-teal-50",
    "bg-cyan-50",
  ];
  const colorTexts = [
    "text-red-600",
    "text-orange-600",
    "text-yellow-600",
    "text-lime-600",
    "text-green-600",
    "text-emerald-600",
    "text-teal-600",
    "text-cyan-600",
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        <Button
          variant="outline"
          onClick={() => navigate("/results")}
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-indigo-600"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </Button>

        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 mx-auto sm:mx-0">
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {road.nama_jalan}
                </h1>
                <span
                  className={`px-3 py-1.5 text-white text-sm font-bold rounded-full ${getCategoryBgClass(
                    category
                  )}`}
                >
                  {category}
                </span>
              </div>
              {polylineCoords.length > 0 && (
                <div className="flex items-center gap-2 text-white/80 justify-center sm:justify-start">
                  <MapPin className="w-5 h-5" />
                  <span>Koordinat: {polylineCoords.length} titik</span>
                </div>
              )}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center mx-auto sm:mx-0">
              <div className="text-sm text-white/90 mb-1">Skor TOPSIS</div>
              <div className="text-5xl font-bold text-white">
                {(score * 100).toFixed(0)}
                <span className="text-2xl">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        {polylineCoords.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6 animate-fade-in delay-100">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">
                📍 Visualisasi Maps GIS
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="h-96 sm:h-125 rounded-xl overflow-hidden shadow-inner">
                <MapContainer
                  center={polylineCoords[0]}
                  zoom={13}
                  attributionControl={false}
                  className="z-0"
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap & CartoDB"
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                  />
                  <MapBounds bounds={polylineCoords} />
                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{
                      color: getColorByCategory(category),
                      weight: 6,
                      opacity: 0.8,
                    }}
                  >
                    <Popup>
                      <div className="p-3">
                        <div className="font-bold text-slate-900 mb-1">
                          {road.nama_jalan}
                        </div>
                        <div className="text-xs text-slate-500">
                          Skor:{" "}
                          <span className="font-bold">
                            {formatScore(score)}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Polyline>
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* Criteria Details */}
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in delay-200">
          {/* Left: Criteria Data */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-linear-to-r from-indigo-50 to-purple-50">
              <h2 className="text-xl font-bold text-slate-900">
                📋 Data Kriteria
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {criteria.map((c, idx) => (
                <div
                  key={c.id}
                  className={`border-l-4 ${
                    colorBorders[idx % colorBorders.length]
                  } pl-4 py-3 ${colorBgs[idx % colorBgs.length]} rounded-r-lg`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div>
                      <div className="font-bold text-slate-900">
                        {c.code} {c.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {c.type === "cost" ? "Cost" : "Benefit"} • Bobot{" "}
                        {(
                          (weightsSnapshot[c.key] || Number(c.weight)) * 100
                        ).toFixed(0)}
                        %
                      </div>
                    </div>
                    <div className="text-right pr-4">
                      <div
                        className={`text-2xl sm:text-3xl font-bold ${
                          colorTexts[idx % colorTexts.length]
                        }`}
                      >
                        {criteriaSnapshot[c.key] || "—"}
                      </div>
                      {c.unit && (
                        <div className="text-xs text-slate-500">{c.unit}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: TOPSIS Result */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-linear-to-r from-purple-50 to-pink-50">
              <h2 className="text-xl font-bold text-slate-900">
                🧮 Hasil TOPSIS
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-5">
              {/* Score */}
              <div
                className={`border-2 rounded-xl p-5 ${
                  category === "Prioritas Tinggi"
                    ? "bg-linear-to-r from-red-50 to-orange-50 border-red-200"
                    : category === "Prioritas Sedang"
                    ? "bg-linear-to-r from-yellow-50 to-amber-50 border-yellow-200"
                    : "bg-linear-to-r from-green-50 to-emerald-50 border-green-200"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      category === "Prioritas Tinggi"
                        ? "text-red-700"
                        : category === "Prioritas Sedang"
                        ? "text-yellow-700"
                        : "text-green-700"
                    }`}
                  >
                    Nilai Preferensi (V)
                  </div>
                  <div
                    className={`text-6xl font-bold mb-2 ${
                      category === "Prioritas Tinggi"
                        ? "text-red-600"
                        : category === "Prioritas Sedang"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {score.toFixed(2)}
                  </div>
                  <div
                    className={`inline-block px-4 py-2 text-white text-sm font-bold rounded-full ${
                      category === "Prioritas Tinggi"
                        ? "bg-red-500"
                        : category === "Prioritas Sedang"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  >
                    Ranking: #{analysisResult.rank} dari {roads.length} ruas
                  </div>
                </div>
              </div>

              {/* Normalized Weighted Values */}
              {normalizedWeightedValues && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">
                    Nilai Ternormalisasi Terbobot
                  </h3>
                  <div className="space-y-2">
                    {criteria.map((c, idx) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <span className="text-sm text-slate-600">
                          {c.code} (
                          {c.name.length > 15
                            ? c.name.substring(0, 15) + "..."
                            : c.name}
                          )
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {normalizedWeightedValues[idx]?.toFixed(3) || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Distances */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  Jarak ke Solusi Ideal
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="text-xs text-green-700 mb-1">
                      D+ (Positif)
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {Number(analysisResult.distance_positive).toFixed(3)}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <div className="text-xs text-red-700 mb-1">
                      D- (Negatif)
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {Number(analysisResult.distance_negative).toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-xs text-blue-800">
                  Semakin tinggi nilai V (mendekati 1), semakin tinggi prioritas
                  perbaikan jalan tersebut.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailPage;
