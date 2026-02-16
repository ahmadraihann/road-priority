// src/modules/analysis/views/detail.tsx
import React, { useEffect, useState } from "react";
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

import { formatScore, WEIGHTS } from "../helpers";
import type { TopsisResult, CalculationDetails } from "../helpers";
import { calculateTopsisWithDetails } from "../helpers";
import { useRoadStorage } from "@/hooks/use-road-storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Component untuk auto-fit bounds
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
  const id = searchParams.get("id");
  const { roads, deleteRoad } = useRoadStorage();
  const { toast } = useToast();
  const [roadDetail, setRoadDetail] = useState<TopsisResult | null>(null);
  const [calculationDetails, setCalculationDetails] =
    useState<CalculationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("topsis_results");
      if (!stored) {
        navigate("/results");
        return;
      }

      const results: TopsisResult[] = JSON.parse(stored);
      const found = results.find((r) => r.id === id);

      if (!found) {
        // navigate("/results");
        return;
      }

      setRoadDetail(found);

      // Get calculation details
      if (roads.length > 0) {
        const { details } = calculateTopsisWithDetails(roads);
        setCalculationDetails(details);

        // Find index for normalized values
        const roadIndex = results.findIndex((r) => r.id === id);
        if (roadIndex !== -1 && details) {
          // Store index for later use
          (found as any).matrixIndex = roadIndex;
        }
      }
    } catch (error) {
      console.error("Error loading detail:", error);
      navigate("/results");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, roads]);

  const handleDeleteConfirm = () => {
    if (id) {
      deleteRoad(id);
      toast({
        title: "Data berhasil dihapus!",
        description: `Data jalan "${roadDetail?.namaJalan}" telah dihapus.`,
      });
      navigate("/results");
    }
  };

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

  if (!roadDetail) {
    return null;
  }

  // Parse polyline for map
  let polylineCoords: LatLngExpression[] = [];
  try {
    polylineCoords = JSON.parse(roadDetail.criteria.polyline || "[]");
  } catch (e) {
    console.error("Error parsing polyline:", e);
  }

  const getColorByCategory = (category: string): string => {
    if (category === "Prioritas Tinggi") return "#ef4444";
    if (category === "Prioritas Sedang") return "#f59e0b";
    return "#22c55e";
  };

  const getCategoryBgClass = (category: string) => {
    if (category === "Prioritas Tinggi")
      return "bg-red-500 animate-pulse shadow-lg";
    if (category === "Prioritas Sedang")
      return "bg-yellow-500 animate-pulse shadow-lg";
    return "bg-green-500 animate-pulse shadow-lg";
  };

  // Get normalized weighted values if available
  const matrixIndex = (roadDetail as any).matrixIndex;
  const normalizedWeightedValues =
    calculationDetails && matrixIndex !== undefined
      ? calculationDetails.weightedMatrix[matrixIndex]
      : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        <Button
          variant="outline"
          onClick={() => navigate("/results")}
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-indigo-600"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </Button>
        {/* Road Header Card */}
        <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 mx-auto sm:mx-0">
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {roadDetail.namaJalan}
                </h1>
                <span
                  className={`px-3 py-1.5 text-white text-sm font-bold rounded-full ${getCategoryBgClass(
                    roadDetail.category
                  )}`}
                >
                  {roadDetail.category}
                </span>
              </div>
              <p className="text-white/90 text-base sm:text-lg mb-2 text-center sm:text-left">
                ID: {roadDetail.id.substring(0, 50)}
                {roadDetail.id.length > 50 ? "..." : ""}
              </p>
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
                {(roadDetail.score * 100).toFixed(0)}
                <span className="text-2xl">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        {polylineCoords.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6 animate-fade-in delay-100">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-indigo-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Visualisasi Maps GIS
                </h2>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getColorByCategory(roadDetail.category),
                    }}
                  ></div>
                  <span className="text-sm text-slate-600">
                    {roadDetail.category}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="h-96 sm:h-125 rounded-xl overflow-hidden shadow-inner">
                <MapContainer
                  center={polylineCoords[0] as LatLngExpression}
                  zoom={13}
                  attributionControl={false}
                  className="z-0"
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapBounds bounds={polylineCoords} />

                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{
                      color: getColorByCategory(roadDetail.category),
                      weight: 6,
                      opacity: 0.8,
                    }}
                  >
                    <Popup>
                      <div className="p-3">
                        <div className="font-bold text-slate-900 mb-1">
                          {roadDetail.namaJalan}
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          Prioritas:{" "}
                          <span
                            className={`font-bold ${
                              roadDetail.category === "Prioritas Tinggi"
                                ? "text-red-600"
                                : roadDetail.category === "Prioritas Sedang"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {roadDetail.category.replace("Prioritas ", "")}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Skor TOPSIS:{" "}
                          <span className="font-bold">
                            {formatScore(roadDetail.score)}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Polyline>
                </MapContainer>
              </div>

              {/* Map Legend */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-sm font-semibold text-slate-700 mb-3">
                  Legenda Prioritas:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">
                      Tinggi (≥0.70)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">
                      Sedang (0.50-0.69)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">
                      Rendah (&lt;0.50)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Criteria Details - Two Columns */}
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in delay-200">
          {/* Left Column: Raw Criteria */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-linear-to-r from-indigo-50 to-purple-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Data Kriteria
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {/* C1: PCI */}
              <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div>
                    <div className="font-bold text-slate-900">
                      C1 Kondisi Fisik (PCI)
                    </div>
                    <div className="text-xs text-slate-500">
                      Cost • Bobot {WEIGHTS.pci * 100}%
                    </div>
                  </div>
                  <div className="text-right pr-4">
                    <div className="text-3xl font-bold text-red-600">
                      {roadDetail.criteria.pci}
                    </div>
                  </div>
                </div>
              </div>

              {/* C2: Volume */}
              <div className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div>
                    <div className="font-bold text-slate-900">
                      C2 Volume Lalu Lintas
                    </div>
                    <div className="text-xs text-slate-500">
                      Benefit • Bobot {WEIGHTS.volumeLaluLintas * 100}%
                    </div>
                  </div>
                  <div className="text-right pr-4">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                      {parseInt(
                        roadDetail.criteria.volumeLaluLintas
                      ).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">kendaraan/hari</div>
                  </div>
                </div>
              </div>

              {/* C3: Keselamatan */}
              <div className="border-l-4 border-yellow-500 pl-4 py-3 bg-yellow-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div>
                    <div className="font-bold text-slate-900">
                      C3 Tingkat Keselamatan
                    </div>
                    <div className="text-xs text-slate-500">
                      Cost • Bobot {WEIGHTS.tingkatKeselamatan * 100}%
                    </div>
                  </div>
                  <div className="text-right pr-4">
                    <div className="text-3xl font-bold text-yellow-600">
                      {roadDetail.criteria.tingkatKeselamatan}
                    </div>
                    <div className="text-xs text-slate-500">
                      kecelakaan/tahun
                    </div>
                  </div>
                </div>
              </div>

              {/* C4: Biaya */}
              <div className="border-l-4 border-lime-500 pl-4 py-3 bg-lime-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div>
                    <div className="font-bold text-slate-900">
                      C4 Estimasi Biaya
                    </div>
                    <div className="text-xs text-slate-500">
                      Cost • Bobot {WEIGHTS.estimasiBiaya * 100}%
                    </div>
                  </div>
                  <div className="text-right pr-4">
                    <div className="text-xl sm:text-2xl font-bold text-lime-600">
                      {(
                        parseFloat(roadDetail.criteria.estimasiBiaya) / 1000000
                      ).toFixed(1)}
                      M
                    </div>
                    <div className="text-xs text-slate-500">Rupiah</div>
                  </div>
                </div>
              </div>

              {/* C5: Fungsi */}
              <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div>
                    <div className="font-bold text-slate-900">
                      C5 Fungsi Jaringan
                    </div>
                    <div className="text-xs text-slate-500">
                      Cost • Bobot {WEIGHTS.fungsiJaringan * 100}%
                    </div>
                  </div>
                  <div className="text-right pr-4">
                    <div className="text-2xl font-bold text-green-600">
                      {["Arteri", "Kolektor", "Lokal", "Lingkungan"][
                        parseInt(roadDetail.criteria.fungsiJaringan) - 1
                      ] || roadDetail.criteria.fungsiJaringan}
                    </div>
                    <div className="text-xs text-slate-500">Skala 4</div>
                  </div>
                </div>
              </div>

              {/* C6: Penduduk */}
              <div className="border-l-4 border-emerald-500 pl-4 py-3 bg-emerald-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div>
                    <div className="font-bold text-slate-900">
                      C6 Dampak Penduduk
                    </div>
                    <div className="text-xs text-slate-500">
                      Benefit • Bobot {WEIGHTS.dampakPenduduk * 100}%
                    </div>
                  </div>
                  <div className="text-right pr-4">
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                      {parseInt(
                        roadDetail.criteria.dampakPenduduk
                      ).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">jiwa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: TOPSIS Calculation */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-linear-to-r from-purple-50 to-pink-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-purple-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Hasil TOPSIS
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-5">
              {/* Final Score */}
              <div
                className={`border-2 rounded-xl p-5 ${
                  roadDetail.category === "Prioritas Tinggi"
                    ? "bg-linear-to-r from-red-50 to-orange-50 border-red-200"
                    : roadDetail.category === "Prioritas Sedang"
                    ? "bg-linear-to-r from-yellow-50 to-amber-50 border-yellow-200"
                    : "bg-linear-to-r from-green-50 to-emerald-50 border-green-200"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      roadDetail.category === "Prioritas Tinggi"
                        ? "text-red-700"
                        : roadDetail.category === "Prioritas Sedang"
                        ? "text-yellow-700"
                        : "text-green-700"
                    }`}
                  >
                    Nilai Preferensi (V)
                  </div>
                  <div
                    className={`text-6xl font-bold mb-2 ${
                      roadDetail.category === "Prioritas Tinggi"
                        ? "text-red-600"
                        : roadDetail.category === "Prioritas Sedang"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {roadDetail.score.toFixed(2)}
                  </div>
                  <div
                    className={`inline-block whitespace-nowrap px-4 py-2 text-white text-sm font-bold rounded-full ${
                      roadDetail.category === "Prioritas Tinggi"
                        ? "bg-red-500"
                        : roadDetail.category === "Prioritas Sedang"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  >
                    Ranking: #{roadDetail.rank} dari {roads.length} ruas
                  </div>
                </div>
              </div>

              {/* Normalized Weighted Values */}
              {normalizedWeightedValues && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    Nilai Ternormalisasi Terbobot
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">C1 (PCI)</span>
                      <span className="font-mono font-bold text-slate-900">
                        {normalizedWeightedValues[0].toFixed(3)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">
                        C2 (Volume)
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {normalizedWeightedValues[1].toFixed(3)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">
                        C3 (Keselamatan)
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {normalizedWeightedValues[2].toFixed(3)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">C4 (Biaya)</span>
                      <span className="font-mono font-bold text-slate-900">
                        {normalizedWeightedValues[3].toFixed(3)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">
                        C5 (Fungsi)
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {normalizedWeightedValues[4].toFixed(3)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">
                        C6 (Penduduk)
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {normalizedWeightedValues[5].toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Distance */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Jarak ke Solusi Ideal
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="text-xs text-green-700 mb-1">
                      D+ (Positif)
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {roadDetail.distanceToIdealPositive.toFixed(3)}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <div className="text-xs text-red-700 mb-1">
                      D- (Negatif)
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {roadDetail.distanceToIdealNegative.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs text-blue-800">
                    Semakin tinggi nilai V (mendekati 1), semakin tinggi
                    prioritas perbaikan jalan tersebut.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Jalan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data jalan "
              {roadDetail?.namaJalan}" akan dihapus secara permanen dari
              penyimpanan lokal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DetailPage;
