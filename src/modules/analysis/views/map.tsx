// src/modules/analysis/views/map.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import { ArrowLeft, Download, Eye, Info, Map as MapIcon } from "lucide-react";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TopsisResult } from "../helpers";
import { formatScore, getCategoryColor } from "../helpers";

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

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<TopsisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoad, setSelectedRoad] = useState<TopsisResult | null>(null);

  useEffect(() => {
    // Load results from localStorage
    try {
      const stored = localStorage.getItem("topsis_results");
      if (stored) {
        const parsed = JSON.parse(stored);
        setResults(parsed);
      } else {
        // No results found, redirect to review
        navigate("/results");
      }
    } catch (error) {
      console.error("Error loading results:", error);
      navigate("/results");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const getColorByScore = (score: number): string => {
    if (score >= 0.7) return "#ef4444"; // red - Prioritas Tinggi
    if (score >= 0.5) return "#f59e0b"; // amber - Prioritas Sedang
    return "#22c55e"; // green - Prioritas Rendah
  };

  // Get all bounds for fitting map
  const getAllBounds = (): LatLngExpression[] => {
    const bounds: LatLngExpression[] = [];
    results.forEach((road) => {
      try {
        const polyline = JSON.parse(road.criteria.polyline || "[]");
        polyline.forEach((coord: [number, number]) => {
          bounds.push(coord as LatLngExpression);
        });
      } catch (e) {
        console.error("Error parsing polyline:", e);
      }
    });
    return bounds;
  };

  const handleBackToResults = () => {
    navigate("/results");
  };

  const handleExport = () => {
    alert("Fitur export peta akan segera tersedia!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat peta...</p>
        </div>
      </div>
    );
  }

  const allBounds = getAllBounds();
  const mapCenter: LatLngExpression = [-6.2088, 106.8456];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Visualisasi Peta GIS
              </h1>
              <p className="text-slate-600">
                Prioritas perbaikan jalan berdasarkan hasil analisis TOPSIS
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleBackToResults}
                className="gap-2"
              >
                <ArrowLeft />
                Kembali ke Hasil
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2"
              >
                <Download />
                Export Peta
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <Alert className="mb-6 animate-fade-in delay-200 border-indigo-200 bg-indigo-50">
          <MapIcon className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-sm text-slate-700">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold">Legenda:</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-red-500 rounded"></div>
                <span className="text-xs">Prioritas Tinggi (&ge; 70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-amber-500 rounded"></div>
                <span className="text-xs">Prioritas Sedang (50-69%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-green-500 rounded"></div>
                <span className="text-xs">Prioritas Rendah (&lt; 50%)</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <Card className="lg:col-span-2 animate-fade-in delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-indigo-600" />
                Peta Prioritas Perbaikan Jalan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-150 w-full rounded-b-xl overflow-hidden">
                <MapContainer
                  center={mapCenter}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {allBounds.length > 0 && <MapBounds bounds={allBounds} />}

                  {results.map((road) => {
                    try {
                      const polylineCoords = JSON.parse(
                        road.criteria.polyline || "[]"
                      );
                      if (polylineCoords.length === 0) return null;

                      return (
                        <Polyline
                          key={road.id}
                          positions={polylineCoords as LatLngExpression[]}
                          pathOptions={{
                            color: getColorByScore(road.score),
                            weight: 6,
                            opacity: 0.8,
                          }}
                          eventHandlers={{
                            click: () => setSelectedRoad(road),
                          }}
                        >
                          <Popup>
                            <div className="p-2 min-w-50">
                              <h3 className="font-bold text-lg mb-2">
                                {road.namaJalan}
                              </h3>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-600">
                                    Ranking:
                                  </span>
                                  <span className="font-semibold">
                                    #{road.rank}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">
                                    Nilai V:
                                  </span>
                                  <span className="font-bold text-indigo-600">
                                    {formatScore(road.score)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">
                                    Kategori:
                                  </span>
                                  <Badge
                                    className={`${getCategoryColor(
                                      road.category
                                    )} border text-xs`}
                                  >
                                    {road.category}
                                  </Badge>
                                </div>
                                <div className="pt-2 border-t mt-2">
                                  <div className="text-xs text-slate-500">
                                    PCI: {road.criteria.pci}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Volume:{" "}
                                    {parseInt(
                                      road.criteria.volumeLaluLintas
                                    ).toLocaleString()}{" "}
                                    kend/hari
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Polyline>
                      );
                    } catch (e) {
                      console.error("Error rendering polyline:", e);
                      return null;
                    }
                  })}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          {/* Side Panel - Road Details */}
          <Card className="animate-fade-in delay-400 max-h-165 overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="w-5 h-5 text-indigo-600" />
                {selectedRoad ? "Detail Jalan" : "Daftar Jalan"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRoad ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-xl mb-1">
                      {selectedRoad.namaJalan}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-2xl px-3 py-1">
                        #{selectedRoad.rank}
                      </Badge>
                      <Badge
                        className={`${getCategoryColor(
                          selectedRoad.category
                        )} border`}
                      >
                        {selectedRoad.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <div className="text-sm text-slate-600 mb-1">
                      Nilai Preferensi (V)
                    </div>
                    <div className="text-3xl font-bold text-indigo-600">
                      {formatScore(selectedRoad.score)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">
                        D+ (Ideal+)
                      </div>
                      <div className="font-semibold text-sm">
                        {selectedRoad.distanceToIdealPositive.toFixed(4)}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">
                        D- (Ideal-)
                      </div>
                      <div className="font-semibold text-sm">
                        {selectedRoad.distanceToIdealNegative.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Nilai Kriteria</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-600">C1: PCI</span>
                        <span className="font-semibold">
                          {selectedRoad.criteria.pci}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-600">
                          C2: Volume
                        </span>
                        <span className="font-semibold text-sm">
                          {parseInt(
                            selectedRoad.criteria.volumeLaluLintas
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-600">
                          C3: Keselamatan
                        </span>
                        <span className="font-semibold">
                          {selectedRoad.criteria.tingkatKeselamatan}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-600">
                          C4: Biaya
                        </span>
                        <span className="font-semibold text-xs">
                          {parseInt(
                            selectedRoad.criteria.estimasiBiaya
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-600">
                          C5: Fungsi
                        </span>
                        <span className="font-semibold">
                          {selectedRoad.criteria.fungsiJaringan}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-600">
                          C6: Penduduk
                        </span>
                        <span className="font-semibold text-sm">
                          {parseInt(
                            selectedRoad.criteria.dampakPenduduk
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedRoad(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Daftar
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 mb-4">
                    Klik pada jalan di peta atau pilih dari daftar
                  </p>
                  {results.map((road) => (
                    <button
                      key={road.id}
                      onClick={() => setSelectedRoad(road)}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold">
                              #{road.rank}
                            </span>
                            <Badge
                              className={`${getCategoryColor(
                                road.category
                              )} border text-xs`}
                            >
                              {road.category}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm mb-1">
                            {road.namaJalan}
                          </h4>
                          <div className="text-xs text-slate-600">
                            Nilai V: {formatScore(road.score)}
                          </div>
                        </div>
                        <div
                          className="w-3 h-3 rounded-full mt-1"
                          style={{
                            backgroundColor: getColorByScore(road.score),
                          }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6 animate-fade-in delay-500 bg-indigo-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold mb-1">Cara Membaca Peta:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    Warna{" "}
                    <span className="font-semibold text-red-600">merah</span>{" "}
                    menunjukkan prioritas tinggi (perlu perbaikan segera)
                  </li>
                  <li>
                    Warna{" "}
                    <span className="font-semibold text-amber-600">kuning</span>{" "}
                    menunjukkan prioritas sedang
                  </li>
                  <li>
                    Warna{" "}
                    <span className="font-semibold text-green-600">hijau</span>{" "}
                    menunjukkan prioritas rendah
                  </li>
                  <li>Klik pada jalan untuk melihat detail lengkap</li>
                  <li>
                    Gunakan scroll mouse untuk zoom in/out, drag untuk menggeser
                    peta
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapPage;
