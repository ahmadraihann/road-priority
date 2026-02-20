// src/modules/analysis/views/results.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronRight as DetailIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { formatScore } from "../helpers";
import { useAnalysisResults } from "@/hooks/use-analysis";
import { useCriteria } from "@/hooks/use-criteria";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 10;

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: analysisResults = [], isLoading } = useAnalysisResults();
  const { data: criteria = [] } = useCriteria();
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString("id-ID");

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN HASIL ANALISIS TOPSIS", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Prioritas Perbaikan Jalan", 105, 28, { align: "center" });
      doc.text(`Tanggal: ${currentDate}`, 105, 35, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Ringkasan:", 14, 45);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const prioritasTinggi = analysisResults.filter((r) => r.category === "Prioritas Tinggi").length;
      const prioritasSedang = analysisResults.filter((r) => r.category === "Prioritas Sedang").length;
      const prioritasRendah = analysisResults.filter((r) => r.category === "Prioritas Rendah").length;

      doc.text(`Total Ruas Jalan: ${analysisResults.length}`, 14, 52);
      doc.text(`Prioritas Tinggi: ${prioritasTinggi}`, 14, 58);
      doc.text(`Prioritas Sedang: ${prioritasSedang}`, 14, 64);
      doc.text(`Prioritas Rendah: ${prioritasRendah}`, 14, 70);

      const tableHead = ["No", "Nama Jalan", "Skor", "Kategori"];
      const tableData = analysisResults.map((r, i) => [
        i + 1,
        (r.roads?.nama_jalan || "").substring(0, 35),
        formatScore(Number(r.score)),
        r.category,
      ]);

      autoTable(doc, {
        startY: 78,
        head: [tableHead],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 2 },
      });

      doc.save(`Laporan-TOPSIS-${currentDate}.pdf`);
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  const handleViewDetail = (roadId: string) => {
    navigate(`/detail?id=${roadId}`);
  };

  const getBarColor = (score: number) => {
    if (score >= 0.7) return "rgba(239, 68, 68, 0.8)";
    if (score >= 0.5) return "rgba(234, 179, 8, 0.8)";
    return "rgba(34, 197, 94, 0.8)";
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

  if (analysisResults.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Belum Ada Hasil</h2>
          <p className="text-slate-600 mb-6">Lakukan perhitungan TOPSIS terlebih dahulu.</p>
          <Button onClick={() => navigate("/review")} className="bg-linear-to-r from-indigo-600 to-purple-600">
            Kembali ke Data Jalan
          </Button>
        </div>
      </div>
    );
  }

  const top3 = analysisResults.slice(0, 3);
  const restResults = analysisResults.slice(3);

  const prioritasTinggi = analysisResults.filter((r) => r.category === "Prioritas Tinggi").length;
  const prioritasSedang = analysisResults.filter((r) => r.category === "Prioritas Sedang").length;
  const prioritasRendah = analysisResults.filter((r) => r.category === "Prioritas Rendah").length;

  const chartData = analysisResults.map((r) => ({
    name: (r.roads?.nama_jalan || "").length > 15
      ? (r.roads?.nama_jalan || "").substring(0, 15) + "..."
      : r.roads?.nama_jalan || "",
    score: Number(r.score),
  }));

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "bg-linear-to-r from-yellow-400 to-yellow-600 shadow-lg";
    if (rank === 2) return "bg-linear-to-r from-slate-300 to-slate-500 shadow-lg";
    if (rank === 3) return "bg-linear-to-r from-orange-400 to-orange-600 shadow-lg";
    return "bg-slate-200";
  };

  const totalPages = Math.ceil(restResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = restResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <Button variant="outline" onClick={() => navigate("/review")} className="mb-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600">
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </Button>
          <div className="flex items-start gap-3 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                Hasil Analisis TOPSIS
              </h1>
              <p className="text-slate-600">
                Ranking prioritas berdasarkan {criteria.length} kriteria
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
            <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-slate-200">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">Total Ruas</div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{analysisResults.length}</div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-red-200">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">Prioritas Tinggi</div>
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{prioritasTinggi}</div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-yellow-200">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">Prioritas Sedang</div>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{prioritasSedang}</div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-green-200">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">Prioritas Rendah</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{prioritasRendah}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 mb-6 animate-fade-in delay-100">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">📊 Grafik Skor TOPSIS</h2>
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} tickFormatter={(v) => v.toFixed(1)} width={40} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "white", fontSize: "12px" }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 3 */}
        <div className="space-y-3 sm:space-y-4 animate-fade-in delay-200 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">🏆 Top 3 Prioritas Tertinggi</h2>
          {top3.map((result) => {
            const road = result.roads;
            const score = Number(result.score);
            return (
              <div key={result.id} className={`bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer ${
                result.rank === 1 ? "border-2 border-yellow-300" : result.rank === 2 ? "border-2 border-slate-300" : "border-2 border-orange-300"
              }`} onClick={() => handleViewDetail(result.road_id)}>
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 ${getRankBadgeClass(result.rank)}`}>
                      <span className="text-xl sm:text-2xl font-bold text-white">{result.rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{road?.nama_jalan || "—"}</h3>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">Skor</div>
                            <div className={`text-2xl font-bold ${
                              result.category === "Prioritas Tinggi" ? "text-red-600" : result.category === "Prioritas Sedang" ? "text-yellow-600" : "text-green-600"
                            }`}>{formatScore(score)}</div>
                          </div>
                          <span className={`px-3 py-1.5 text-white text-xs font-bold rounded-full ${
                            result.category === "Prioritas Tinggi" ? "bg-red-500" : result.category === "Prioritas Sedang" ? "bg-yellow-500" : "bg-green-500"
                          }`}>{result.category.replace("Prioritas ", "").toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 sm:h-3 mb-4">
                        <div className={`h-2 sm:h-3 rounded-full transition-all duration-1000 ${
                          result.category === "Prioritas Tinggi" ? "bg-linear-to-r from-red-500 to-orange-500" : result.category === "Prioritas Sedang" ? "bg-linear-to-r from-yellow-500 to-amber-500" : "bg-linear-to-r from-green-500 to-emerald-500"
                        }`} style={{ width: `${score * 100}%` }}></div>
                      </div>
                      {/* Dynamic criteria values */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                        {criteria.slice(0, 6).map((c) => (
                          <div key={c.id} className="text-center bg-slate-50 rounded-lg p-2">
                            <div className="text-xs text-slate-500 mb-1">{c.name.length > 10 ? c.name.substring(0, 10) + "..." : c.name}</div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {result.criteria_snapshot?.[c.key] || "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest Table */}
        {restResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6 animate-fade-in delay-300">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Daftar Lengkap Prioritas</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold text-slate-900 text-center w-16">Rank</TableHead>
                    <TableHead className="font-bold text-slate-900 min-w-50">Nama Jalan</TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-24">Skor</TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-32">Kategori</TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResults.map((result) => (
                    <TableRow key={result.id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-center">#{result.rank}</TableCell>
                      <TableCell className="font-medium">
                        <div className="font-semibold text-slate-900 truncate">{result.roads?.nama_jalan || "—"}</div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-indigo-600">{formatScore(Number(result.score))}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                          result.category === "Prioritas Tinggi" ? "bg-red-100 text-red-700" : result.category === "Prioritas Sedang" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                        }`}>{result.category.replace("Prioritas ", "").toUpperCase()}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(result.road_id)} className="h-8 w-8 p-0">
                          <DetailIcon className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 p-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in delay-400">
          <button onClick={() => navigate("/map")} className="w-full px-6 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
            🗺️ Lihat Maps
          </button>
          <button onClick={handleExport} className="w-full px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
