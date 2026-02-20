// src/modules/analysis/views/map.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import {
  ArrowLeft,
  // Download,
  MapIcon,
} from "lucide-react";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";

import { formatScore } from "../helpers";
import type { TopsisResult } from "../helpers";

// Component untuk zoom ke road tertentu
function MapController({
  targetRoad,
  onZoomComplete,
}: {
  targetRoad: TopsisResult | null;
  onZoomComplete: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (targetRoad) {
      try {
        const polyline = JSON.parse(targetRoad.criteria.polyline || "[]");
        if (polyline.length > 0) {
          const bounds = L.latLngBounds(polyline as LatLngExpression[]);
          const center = bounds.getCenter();

          map.flyToBounds(bounds, {
            padding: [100, 100],
            duration: 0.5,
          });

          setTimeout(() => {
            map.setView(center, map.getZoom(), { animate: false });
          }, 600);

          setTimeout(() => {
            onZoomComplete();
          }, 500);
        }
      } catch (e) {
        console.error("Error zooming to road:", e);
      }
    }
  }, [targetRoad, map, onZoomComplete]);

  return null;
}

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
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [targetRoad, setTargetRoad] = useState<TopsisResult | null>(null);
  const [popupRoadId, setPopupRoadId] = useState<string | null>(null);
  // const [isExporting, setIsExporting] = useState(false);

  const polylineRefs = useRef<Map<string, L.Polyline>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("topsis_results");
      if (stored) {
        const parsed = JSON.parse(stored);
        setResults(parsed);
      } else {
        navigate("/results");
      }
    } catch (error) {
      console.error("Error loading results:", error);
      navigate("/results");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const getColorByCategory = (category: string): string => {
    if (category === "Prioritas Tinggi") return "#ef4444";
    if (category === "Prioritas Sedang") return "#f59e0b";
    return "#22c55e";
  };

  const getBgColorByCategory = (category: string): string => {
    if (category === "Prioritas Tinggi")
      return "bg-red-50 border-red-500 hover:bg-red-100";
    if (category === "Prioritas Sedang")
      return "bg-yellow-50 border-yellow-500 hover:bg-yellow-100";
    return "bg-green-50 border-green-500 hover:bg-green-100";
  };

  const getTextColorByCategory = (category: string): string => {
    if (category === "Prioritas Tinggi") return "text-red-600";
    if (category === "Prioritas Sedang") return "text-yellow-600";
    return "text-green-600";
  };

  const getAllBounds = (): LatLngExpression[] => {
    const bounds: LatLngExpression[] = [];
    const filtered = getFilteredResults();

    filtered.forEach((road) => {
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

  const getFilteredResults = () => {
    if (selectedPriority === "all") return results;
    if (selectedPriority === "high")
      return results.filter((r) => r.category === "Prioritas Tinggi");
    if (selectedPriority === "medium")
      return results.filter((r) => r.category === "Prioritas Sedang");
    if (selectedPriority === "low")
      return results.filter((r) => r.category === "Prioritas Rendah");
    return results;
  };

  // const handleExport = async () => {
  //   if (!mapContainerRef.current) {
  //     alert("Map container not found!");
  //     return;
  //   }

  //   try {
  //     setIsExporting(true);

  //     // Close sidebar on mobile for better screenshot
  //     setSidebarOpen(false);

  //     // Wait for sidebar to close
  //     await new Promise((resolve) => setTimeout(resolve, 300));

  //     // Create canvas from map container
  //     const canvas = await html2canvas(mapContainerRef.current, {
  //       useCORS: true,
  //       allowTaint: true,
  //       backgroundColor: "#f8fafc",
  //       scale: 2, // Higher quality
  //       logging: false,
  //     });

  //     // Create PDF
  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF({
  //       orientation: "landscape",
  //       unit: "mm",
  //       format: "a4",
  //     });

  //     const imgWidth = 297; // A4 landscape width in mm
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //     // Add title
  //     pdf.setFontSize(16);
  //     pdf.setFont("helvetica", "bold");
  //     pdf.text("Maps Prioritas Perbaikan Jalan", 148.5, 15, {
  //       align: "center",
  //     });

  //     // Add date
  //     pdf.setFontSize(10);
  //     pdf.setFont("helvetica", "normal");
  //     const currentDate = new Date().toLocaleDateString("id-ID");
  //     pdf.text(`Tanggal Export: ${currentDate}`, 148.5, 22, {
  //       align: "center",
  //     });

  //     // Add map image
  //     pdf.addImage(imgData, "PNG", 0, 30, imgWidth, Math.min(imgHeight, 180));

  //     // Add legend info
  //     const startY = 30 + Math.min(imgHeight, 180) + 10;
  //     pdf.setFontSize(11);
  //     pdf.setFont("helvetica", "bold");
  //     pdf.text("Keterangan:", 10, startY);

  //     pdf.setFont("helvetica", "normal");
  //     pdf.setFontSize(9);

  //     const prioritasTinggi = results.filter(
  //       (r) => r.category === "Prioritas Tinggi"
  //     ).length;
  //     const prioritasSedang = results.filter(
  //       (r) => r.category === "Prioritas Sedang"
  //     ).length;
  //     const prioritasRendah = results.filter(
  //       (r) => r.category === "Prioritas Rendah"
  //     ).length;

  //     pdf.setTextColor(239, 68, 68); // Red
  //     pdf.text(
  //       `● Prioritas Tinggi (≥0.70): ${prioritasTinggi} ruas`,
  //       10,
  //       startY + 7
  //     );

  //     pdf.setTextColor(245, 158, 11); // Yellow
  //     pdf.text(
  //       `● Prioritas Sedang (0.50-0.69): ${prioritasSedang} ruas`,
  //       10,
  //       startY + 14
  //     );

  //     pdf.setTextColor(34, 197, 94); // Green
  //     pdf.text(
  //       `● Prioritas Rendah (<0.50): ${prioritasRendah} ruas`,
  //       10,
  //       startY + 21
  //     );

  //     pdf.setTextColor(0, 0, 0); // Reset to black
  //     pdf.text(`Total Ruas: ${results.length}`, 10, startY + 28);

  //     // Save
  //     pdf.save(`Maps-Prioritas-Jalan-${currentDate}.pdf`);

  //     alert("Maps berhasil diexport!");
  //   } catch (error) {
  //     console.error("Error exporting map:", error);
  //     alert("Gagal mengexport maps. Silakan coba lagi.");
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  const handleRoadClick = (road: TopsisResult) => {
    setTargetRoad(road);
    setPopupRoadId(road.id);
    setSidebarOpen(false);
  };

  const handleZoomComplete = () => {
    // Popup akan terbuka otomatis oleh Leaflet
  };

  const handleFilterClick = (priority: string) => {
    setSelectedPriority(priority);
    setTargetRoad(null);
    setPopupRoadId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat Maps...</p>
        </div>
      </div>
    );
  }

  const allBounds = getAllBounds();
  const mapCenter: LatLngExpression = [-7.797068, 110.370529];
  const filteredResults = getFilteredResults();

  const prioritasTinggi = results.filter(
    (r) => r.category === "Prioritas Tinggi"
  ).length;
  const prioritasSedang = results.filter(
    (r) => r.category === "Prioritas Sedang"
  ).length;
  const prioritasRendah = results.filter(
    (r) => r.category === "Prioritas Rendah"
  ).length;

  const closeAllPopups = () => {
    polylineRefs.current.forEach((polyline) => {
      try {
        polyline.closePopup();
      } catch (e) {
        console.error("Error closing popup:", e);
      }
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto py-4 pr-4 pl-2 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate("/results")}
              >
                <ArrowLeft />
              </Button>
              <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MapIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900 text-lg">Maps</h1>
                  <p className="text-xs text-slate-600 hidden sm:block">
                    Visualisasi GIS semua ruas jalan
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sm:hidden p-2 bg-white border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
              >
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
                className="hidden sm:flex gap-2 text-sm"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Maps
                  </>
                )}
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Sidebar */}
        <aside
          className={`w-full sm:w-80 bg-white border-r border-slate-200 overflow-y-auto transition-all transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0 fixed sm:relative z-40 h-full`}
        >
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              Filter Prioritas
            </h2>

            {/* Priority Filter Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setPopupRoadId(null);
                  handleFilterClick("high");
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  selectedPriority === "high"
                    ? "bg-red-100 border-2 border-red-500"
                    : "bg-white border-2 border-red-200 hover:bg-red-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-slate-900">
                    Prioritas Tinggi
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  {prioritasTinggi}
                </span>
              </button>

              <button
                onClick={() => {
                  setPopupRoadId(null);
                  handleFilterClick("medium");
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  selectedPriority === "medium"
                    ? "bg-yellow-100 border-2 border-yellow-500"
                    : "bg-white border-2 border-yellow-200 hover:bg-yellow-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold text-slate-900">
                    Prioritas Sedang
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                  {prioritasSedang}
                </span>
              </button>

              <button
                onClick={() => {
                  setPopupRoadId(null);
                  handleFilterClick("low");
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  selectedPriority === "low"
                    ? "bg-green-100 border-2 border-green-500"
                    : "bg-white border-2 border-green-200 hover:bg-green-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-slate-900">
                    Prioritas Rendah
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  {prioritasRendah}
                </span>
              </button>

              <button
                onClick={() => {
                  closeAllPopups();
                  setPopupRoadId(null);
                  handleFilterClick("all");
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  selectedPriority === "all"
                    ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-white border-2 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4"
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
                  <span className="font-semibold">Tampilkan Semua</span>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    selectedPriority === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {results.length}
                </span>
              </button>
            </div>

            {/* Mobile Export Button */}
            {/* <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full mt-3 sm:hidden gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Maps
                </>
              )}
            </Button> */}
          </div>

          {/* Road List */}
          <div className="p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              Daftar Ruas Jalan
            </h3>
            <div className="space-y-2">
              {filteredResults.map((road) => (
                <button
                  key={road.id}
                  onClick={() => handleRoadClick(road)}
                  className={`w-full cursor-pointer p-3 border-l-4 rounded-r-lg transition-all text-left ${getBgColorByCategory(
                    road.category
                  )}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm truncate">
                        {road.namaJalan}
                      </div>
                      <div className="text-xs text-slate-600">
                        {road.id.substring(0, 30)}...
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`text-xs font-bold ${getTextColorByCategory(
                          road.category
                        )}`}
                      >
                        #{road.rank}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatScore(road.score)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Map Container */}
        <div className="flex-1 relative" ref={mapContainerRef}>
          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 z-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-red-500 rounded"></div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">Tinggi</div>
                  <div className="text-slate-500">≥ 0.70</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-yellow-500 rounded"></div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">Sedang</div>
                  <div className="text-slate-500">0.50 - 0.69</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-green-500 rounded"></div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">Rendah</div>
                  <div className="text-slate-500">&lt; 0.50</div>
                </div>
              </div>
            </div>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={13}
            attributionControl={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap & CartoDB'
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            />

            {!targetRoad && allBounds.length > 0 && (
              <MapBounds bounds={allBounds} />
            )}

            {targetRoad && (
              <MapController
                targetRoad={targetRoad}
                onZoomComplete={handleZoomComplete}
              />
            )}

            {filteredResults.map((road) => {
              try {
                const polylineCoords = JSON.parse(
                  road.criteria.polyline || "[]"
                );
                if (polylineCoords.length === 0) return null;

                const shouldOpenPopup = popupRoadId === road.id;

                return (
                  <Polyline
                    key={road.id}
                    ref={(ref) => {
                      if (ref) {
                        polylineRefs.current.set(road.id, ref as any);

                        if (shouldOpenPopup) {
                          setTimeout(() => {
                            (ref as any).openPopup();
                          }, 100);
                        }
                      }
                    }}
                    positions={polylineCoords as LatLngExpression[]}
                    pathOptions={{
                      color: getColorByCategory(road.category),
                      weight: 6,
                      opacity: 0.8,
                    }}
                    eventHandlers={{
                      click: () => {
                        setPopupRoadId(road.id);
                      },
                    }}
                  >
                    <Popup
                      closeButton={true}
                      autoClose={true}
                      closeOnClick={true}
                    >
                      <div className="p-3 min-w-62.5">
                        <h3 className="font-bold text-base mb-2 text-slate-900">
                          {road.namaJalan}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Ranking:</span>
                            <span className="font-bold text-indigo-600">
                              #{road.rank}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Skor TOPSIS:</span>
                            <span className="font-bold text-indigo-600">
                              {formatScore(road.score)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Kategori:</span>
                            <span
                              className={`font-bold text-xs px-2 py-1 rounded ${
                                road.category === "Prioritas Tinggi"
                                  ? "bg-red-100 text-red-700"
                                  : road.category === "Prioritas Sedang"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {road.category}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-slate-200 mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">PCI:</span>
                              <span className="font-medium">
                                {road.criteria.pci}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Volume:</span>
                              <span className="font-medium">
                                {parseInt(
                                  road.criteria.volumeLaluLintas
                                ).toLocaleString()}{" "}
                                kend/hari
                              </span>
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
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MapPage;
