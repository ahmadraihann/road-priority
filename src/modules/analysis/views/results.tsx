// src/modules/analysis/views/results.tsx
import React, { useEffect, useState } from "react";
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
import type { TopsisResult } from "../helpers";
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
  const [results, setResults] = useState<TopsisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("topsis_results");
      if (stored) {
        const parsed = JSON.parse(stored);
        setResults(parsed);
      } else {
        navigate("/review");
      }
    } catch (error) {
      console.error("Error loading results:", error);
      navigate("/review");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString("id-ID");

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN HASIL ANALISIS TOPSIS", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Prioritas Perbaikan Jalan", 105, 28, { align: "center" });
      doc.text(`Tanggal: ${currentDate}`, 105, 35, { align: "center" });

      // Summary Statistics
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Ringkasan:", 14, 45);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const prioritasTinggi = results.filter(
        (r) => r.category === "Prioritas Tinggi"
      ).length;
      const prioritasSedang = results.filter(
        (r) => r.category === "Prioritas Sedang"
      ).length;
      const prioritasRendah = results.filter(
        (r) => r.category === "Prioritas Rendah"
      ).length;

      doc.text(`Total Ruas Jalan: ${results.length}`, 14, 52);
      doc.text(`Prioritas Tinggi: ${prioritasTinggi}`, 14, 58);
      doc.text(`Prioritas Sedang: ${prioritasSedang}`, 14, 64);
      doc.text(`Prioritas Rendah: ${prioritasRendah}`, 14, 70);

      // Table data
      const tableData = results.map((road, index) => [
        index + 1,
        road.namaJalan.length > 35
          ? road.namaJalan.substring(0, 35) + "..."
          : road.namaJalan,
        formatScore(road.score),
        road.category,
        road.criteria.pci,
        parseInt(road.criteria.volumeLaluLintas).toLocaleString("id-ID"),
        road.criteria.tingkatKeselamatan,
      ]);

      autoTable(doc, {
        startY: 78,
        head: [
          [
            "No",
            "Nama Jalan",
            "Skor",
            "Kategori",
            "PCI",
            "Volume",
            "Kecelakaan",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [79, 70, 229],
          fontSize: 9,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 60 },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 30, halign: "center" },
          4: { cellWidth: 15, halign: "center" },
          5: { cellWidth: 25, halign: "right" },
          6: { cellWidth: 20, halign: "center" },
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 3) {
            const category = data.cell.raw as string;
            if (category === "Prioritas Tinggi") {
              doc.setFillColor(254, 226, 226);
            } else if (category === "Prioritas Sedang") {
              doc.setFillColor(254, 243, 199);
            } else {
              doc.setFillColor(220, 252, 231);
            }
          }
        },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save
      doc.save(`Laporan-TOPSIS-${currentDate}.pdf`);
    } catch (error) {
      console.error("Error exporting report:", error);
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

  const top3 = results.slice(0, 3);
  const restResults = results.slice(3);

  const prioritasTinggi = results.filter(
    (r) => r.category === "Prioritas Tinggi"
  ).length;
  const prioritasSedang = results.filter(
    (r) => r.category === "Prioritas Sedang"
  ).length;
  const prioritasRendah = results.filter(
    (r) => r.category === "Prioritas Rendah"
  ).length;

  const chartData = results.map((road) => ({
    name:
      road.namaJalan.length > 15
        ? road.namaJalan.substring(0, 15) + "..."
        : road.namaJalan,
    score: road.score,
  }));

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1)
      return "bg-linear-to-r from-yellow-400 to-yellow-600 shadow-lg";
    if (rank === 2)
      return "bg-linear-to-r from-slate-300 to-slate-500 shadow-lg";
    if (rank === 3)
      return "bg-linear-to-r from-orange-400 to-orange-600 shadow-lg";
    return "bg-slate-200";
  };

  // Pagination
  const totalPages = Math.ceil(restResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResults = restResults.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <Button
            variant="outline"
            onClick={() => navigate("/review")}
            className="mb-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </Button>
          <div className="flex items-start gap-3 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 leading-tight">
                Hasil Analisis TOPSIS
              </h1>
              <p className="text-slate-600">
                Ranking prioritas perbaikan jalan berdasarkan 6 kriteria
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
            <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-slate-200">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">
                Total Ruas
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {results.length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-red-200">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">
                Prioritas Tinggi
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-red-600">
                {prioritasTinggi}
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-yellow-200">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">
                Prioritas Sedang
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
                {prioritasSedang}
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 border-2 border-green-200">
              <div className="text-xs sm:text-sm text-slate-600 mb-1">
                Prioritas Rendah
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {prioritasRendah}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 mb-6 animate-fade-in delay-100">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            Grafik Skor TOPSIS
          </h2>
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => value.toFixed(1)}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.score)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 3 Rankings */}
        <div className="space-y-3 sm:space-y-4 animate-fade-in delay-200 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            🏆 Top 3 Prioritas Tertinggi
          </h2>
          {top3.map((road) => (
            <div
              key={road.id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer ${
                road.rank === 1
                  ? "border-2 border-yellow-300"
                  : road.rank === 2
                  ? "border-2 border-slate-300"
                  : "border-2 border-orange-300"
              }`}
              onClick={() => handleViewDetail(road.id)}
            >
              <div className="p-4 sm:p-6">
                {/* Mobile: Grid Layout, Desktop: Flex with Score on Right */}
                <div
                  className="grid sm:flex sm:items-start gap-y-6 gap-x-4 sm:gap-4"
                  style={{
                    gridTemplateColumns: "auto 1fr",
                    gridTemplateAreas: `
                      "rank header"
                      "content content"
                    `,
                  }}
                >
                  {/* Rank Badge */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 ${getRankBadgeClass(
                      road.rank
                    )}`}
                    style={{ gridArea: "rank" }}
                  >
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {road.rank}
                    </span>
                  </div>

                  {/* Header: Nama + ID (always beside rank on mobile) */}
                  <div
                    className="flex-1 min-w-0 sm:hidden"
                    style={{ gridArea: "header" }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
                      {road.namaJalan}
                    </h3>
                    <p className="text-xs text-slate-600 break-all line-clamp-1">
                      ID: {road.id}
                    </p>
                  </div>

                  {/* Content Area (below rank on mobile, beside rank on desktop) */}
                  <div
                    className="flex-1 min-w-0"
                    style={{ gridArea: "content" }}
                  >
                    {/* Desktop: Header with Score on Right */}
                    <div className="hidden sm:flex sm:items-start sm:justify-between sm:gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">
                          {road.namaJalan}
                        </h3>
                        <p className="text-sm text-slate-600 break-all line-clamp-1">
                          ID: {road.id}
                        </p>
                      </div>

                      {/* Desktop: Score + Badge on Right */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-500 mb-1">
                            Skor TOPSIS
                          </div>
                          <div
                            className={`text-2xl lg:text-3xl font-bold ${
                              road.category === "Prioritas Tinggi"
                                ? "text-red-600"
                                : road.category === "Prioritas Sedang"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {formatScore(road.score)}
                          </div>
                        </div>
                        <span
                          className={`px-4 py-2 text-white text-sm font-bold rounded-full whitespace-nowrap ${
                            road.category === "Prioritas Tinggi"
                              ? "bg-red-500"
                              : road.category === "Prioritas Sedang"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        >
                          {road.category === "Prioritas Tinggi"
                            ? "TINGGI"
                            : road.category === "Prioritas Sedang"
                            ? "SEDANG"
                            : "RENDAH"}
                        </span>
                      </div>
                    </div>

                    {/* Mobile: Score + Badge */}
                    <div className="flex items-center gap-2 sm:hidden flex-wrap mb-3">
                      <div className="flex-1 min-w-fit">
                        <div className="text-xs text-slate-500">
                          Skor TOPSIS
                        </div>
                        <div
                          className={`text-xl font-bold ${
                            road.category === "Prioritas Tinggi"
                              ? "text-red-600"
                              : road.category === "Prioritas Sedang"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatScore(road.score)}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1.5 text-white text-xs font-bold rounded-full whitespace-nowrap ${
                          road.category === "Prioritas Tinggi"
                            ? "bg-red-500"
                            : road.category === "Prioritas Sedang"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      >
                        {road.category === "Prioritas Tinggi"
                          ? "TINGGI"
                          : road.category === "Prioritas Sedang"
                          ? "SEDANG"
                          : "RENDAH"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 sm:h-3 mb-4">
                      <div
                        className={`h-2 sm:h-3 rounded-full transition-all duration-1000 ${
                          road.category === "Prioritas Tinggi"
                            ? "bg-linear-to-r from-red-500 to-orange-500"
                            : road.category === "Prioritas Sedang"
                            ? "bg-linear-to-r from-yellow-500 to-amber-500"
                            : "bg-linear-to-r from-green-500 to-emerald-500"
                        }`}
                        style={{ width: `${road.score * 100}%` }}
                      ></div>
                    </div>

                    {/* Criteria Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-4">
                      <div className="text-center bg-slate-50 rounded-lg p-2">
                        <div className="text-xs text-slate-500 mb-1">PCI</div>
                        <div className="font-bold text-slate-900 text-sm sm:text-base">
                          {road.criteria.pci}
                        </div>
                      </div>
                      <div className="text-center bg-slate-50 rounded-lg p-2">
                        <div className="text-xs text-slate-500 mb-1">
                          Volume
                        </div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {(
                            parseFloat(road.criteria.volumeLaluLintas) / 1000
                          ).toFixed(1)}
                          K
                        </div>
                      </div>
                      <div className="text-center bg-slate-50 rounded-lg p-2">
                        <div className="text-xs text-slate-500 mb-1">
                          Kecelakaan
                        </div>
                        <div className="font-bold text-slate-900 text-sm sm:text-base">
                          {road.criteria.tingkatKeselamatan}
                        </div>
                      </div>
                      <div className="text-center bg-slate-50 rounded-lg p-2">
                        <div className="text-xs text-slate-500 mb-1">Biaya</div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {(
                            parseFloat(road.criteria.estimasiBiaya) / 1000000
                          ).toFixed(1)}
                          M
                        </div>
                      </div>
                      <div className="text-center bg-slate-50 rounded-lg p-2">
                        <div className="text-xs text-slate-500 mb-1">
                          Fungsi
                        </div>
                        <div className="font-bold text-slate-900 text-xs leading-tight">
                          {["Arteri", "Kolektor", "Lokal", "Lingkungan"][
                            parseInt(road.criteria.fungsiJaringan) - 1
                          ] || road.criteria.fungsiJaringan}
                        </div>
                      </div>
                      <div className="text-center bg-slate-50 rounded-lg p-2">
                        <div className="text-xs text-slate-500 mb-1">
                          Penduduk
                        </div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {(
                            parseFloat(road.criteria.dampakPenduduk) / 1000
                          ).toFixed(0)}
                          K
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rest of Results Table */}
        {restResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6 animate-fade-in delay-300">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Daftar Lengkap Prioritas
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Ranking #4 hingga #{results.length}
              </p>
            </div>

            {/* Table - Desktop and Mobile with overflow */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold text-slate-900 text-center w-16">
                      Rank
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 min-w-50">
                      Nama Jalan
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-24">
                      Skor
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-32">
                      Kategori
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-20">
                      PCI
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-24">
                      Volume
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-20">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResults.map((road) => (
                    <TableRow key={road.id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-center">
                        #{road.rank}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-xs">
                          <div className="font-semibold text-slate-900 truncate">
                            {road.namaJalan}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {road.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-indigo-600">
                        {formatScore(road.score)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                            road.category === "Prioritas Tinggi"
                              ? "bg-red-100 text-red-700"
                              : road.category === "Prioritas Sedang"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {road.category === "Prioritas Tinggi"
                            ? "TINGGI"
                            : road.category === "Prioritas Sedang"
                            ? "SEDANG"
                            : "RENDAH"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {road.criteria.pci}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {(
                          parseFloat(road.criteria.volumeLaluLintas) / 1000
                        ).toFixed(1)}
                        K
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(road.id)}
                          className="h-8 w-8 p-0"
                        >
                          <DetailIcon className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Menampilkan {startIndex + 4} -{" "}
                  {Math.min(endIndex + 3, results.length)} dari {results.length}{" "}
                  data
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="gap-1 w-10 h-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        const showEllipsisBefore =
                          page === currentPage - 2 && currentPage > 3;
                        const showEllipsisAfter =
                          page === currentPage + 2 &&
                          currentPage < totalPages - 2;

                        if (showEllipsisBefore || showEllipsisAfter) {
                          return (
                            <span key={page} className="px-2 text-slate-400">
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`${
                              currentPage === page
                                ? "bg-linear-to-r from-indigo-600 to-purple-600"
                                : ""
                            } w-10 h-10`}
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="gap-1 w-10 h-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in delay-400">
          <button
            onClick={() => navigate("/map")}
            className="w-full px-6 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-101 transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
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
            Lihat Maps
          </button>
          <button
            onClick={handleExport}
            className="w-full px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
