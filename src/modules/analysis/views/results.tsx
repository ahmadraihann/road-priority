// src/modules/analysis/views/results.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Eye,
  Trophy,
  BarChart3,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatScore, getRankMedal, getCategoryColor } from "../helpers";
import type { TopsisResult } from "../helpers";

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<TopsisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load results from localStorage
    try {
      const stored = localStorage.getItem("topsis_results");
      if (stored) {
        const parsed = JSON.parse(stored);
        setResults(parsed);
      } else {
        // No results found, redirect to review
        navigate("/review");
      }
    } catch (error) {
      console.error("Error loading results:", error);
      navigate("/review");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleBackToReview = () => {
    navigate("/review");
  };

  const handleRecalculate = () => {
    navigate("/calculate");
  };

  const handleExport = () => {
    // TODO: Implement export functionality (PDF/Excel)
    alert("Fitur export akan segera tersedia!");
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toLocaleString("id-ID");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat hasil...</p>
        </div>
      </div>
    );
  }

  // Get top 3 for highlight
  const top3 = results.slice(0, 3);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Hasil Analisis TOPSIS
              </h1>
              <p className="text-slate-600">
                Ranking prioritas perbaikan untuk {results.length} jalan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleBackToReview}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 animate-fade-in delay-200 border-indigo-200 bg-indigo-50">
          <Info className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-sm text-slate-700">
            Jalan dengan nilai preferensi (V) tertinggi memiliki prioritas
            perbaikan yang lebih tinggi. Skor mendekati 100% menunjukkan kondisi
            jalan memerlukan perbaikan segera.
          </AlertDescription>
        </Alert>

        {/* Top 3 Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fade-in delay-300">
          {top3.map((road, index) => (
            <Card
              key={road.id}
              className={`overflow-hidden border-2 ${
                index === 0
                  ? "border-amber-300 bg-linear-to-br from-amber-50 to-yellow-50"
                  : index === 1
                  ? "border-slate-300 bg-linear-to-br from-slate-50 to-gray-50"
                  : "border-orange-300 bg-linear-to-br from-orange-50 to-amber-50"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl">{getRankMedal(road.rank)}</span>
                  <Badge
                    className={`${getCategoryColor(road.category)} border`}
                  >
                    {road.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{road.namaJalan}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">
                      Nilai Preferensi (V)
                    </div>
                    <div className="text-3xl font-bold text-indigo-600">
                      {formatScore(road.score)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded p-2">
                      <div className="text-slate-500">D+ (Ideal+)</div>
                      <div className="font-semibold">
                        {road.distanceToIdealPositive.toFixed(4)}
                      </div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-slate-500">D- (Ideal-)</div>
                      <div className="font-semibold">
                        {road.distanceToIdealNegative.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Results Table - Desktop */}
        <Card className="hidden lg:block animate-fade-in delay-400 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Daftar Lengkap Ranking Prioritas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold text-slate-900 text-center w-20">
                      Rank
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 min-w-45">
                      Nama Jalan
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center">
                      Nilai V
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center">
                      D+
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center">
                      D-
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center">
                      Kategori
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center">
                      C1
                      <br />
                      PCI
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center">
                      C2
                      <br />
                      Volume
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center">
                      C6
                      <br />
                      Penduduk
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((road) => (
                    <TableRow
                      key={road.id}
                      className={`hover:bg-slate-50 ${
                        road.rank <= 3 ? "bg-indigo-50/50" : ""
                      }`}
                    >
                      <TableCell className="font-bold text-center text-lg">
                        {getRankMedal(road.rank)}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        {road.namaJalan}
                      </TableCell>
                      <TableCell className="text-center font-bold text-indigo-600">
                        {formatScore(road.score)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {road.distanceToIdealPositive.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {road.distanceToIdealNegative.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${getCategoryColor(
                            road.category
                          )} border text-xs`}
                        >
                          {road.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {road.criteria.pci}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatNumber(road.criteria.volumeLaluLintas)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatNumber(road.criteria.dampakPenduduk)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards View */}
        <div className="lg:hidden space-y-4 animate-fade-in delay-400 mb-6">
          {results.map((road) => (
            <Card
              key={road.id}
              className={`overflow-hidden ${
                road.rank <= 3 ? "border-2 border-indigo-300" : ""
              }`}
            >
              <CardHeader className="pb-3 bg-linear-to-r from-indigo-50 to-purple-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {getRankMedal(road.rank)}
                      </span>
                      <Badge
                        className={`${getCategoryColor(
                          road.category
                        )} border text-xs`}
                      >
                        {road.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{road.namaJalan}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 pt-4">
                <div className="space-y-3">
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                    <div className="text-xs text-slate-600 mb-1">
                      Nilai Preferensi (V)
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {formatScore(road.score)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">
                        D+ (Ideal+)
                      </div>
                      <div className="font-semibold text-sm">
                        {road.distanceToIdealPositive.toFixed(4)}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">
                        D- (Ideal-)
                      </div>
                      <div className="font-semibold text-sm">
                        {road.distanceToIdealNegative.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Statistics */}
        <Card className="animate-fade-in delay-500 bg-linear-to-br from-indigo-50 to-purple-50 border-indigo-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Ringkasan Hasil Analisis
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    results.filter((r) => r.category === "Prioritas Tinggi")
                      .length
                  }
                </div>
                <div className="text-sm text-slate-600">Prioritas Tinggi</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {
                    results.filter((r) => r.category === "Prioritas Sedang")
                      .length
                  }
                </div>
                <div className="text-sm text-slate-600">Prioritas Sedang</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    results.filter((r) => r.category === "Prioritas Rendah")
                      .length
                  }
                </div>
                <div className="text-sm text-slate-600">Prioritas Rendah</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {results.length}
                </div>
                <div className="text-sm text-slate-600">Total Jalan</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:justify-end gap-4 animate-fade-in delay-600">
          <Button
            variant="outline"
            onClick={handleRecalculate}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Hitung Ulang
          </Button>
          <Button
            className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
            onClick={() => navigate("/map")}
          >
            <Eye className="w-4 h-4" />
            Lihat di Peta GIS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
