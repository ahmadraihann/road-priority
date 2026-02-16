// src/modules/analysis/views/list.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Info,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoadStorage } from "@/hooks/use-road-storage";

import { FungsiJaringanLabels } from "../types";

const ITEMS_PER_PAGE = 10;

const ReviewDataPage: React.FC = () => {
  const navigate = useNavigate();
  const { roads, deleteRoad, clearAllRoads, isLoading } = useRoadStorage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleAddNew = () => {
    navigate("/form");
  };

  const handleEdit = (id: string) => {
    navigate(`/form?id=${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedRoadId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedRoadId) {
      deleteRoad(selectedRoadId);
      setDeleteDialogOpen(false);
      setSelectedRoadId(null);
    }
  };

  const handleClearAllConfirm = () => {
    clearAllRoads();
    setClearAllDialogOpen(false);
  };

  const handleCalculate = () => {
    navigate("/calculate");
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toLocaleString("id-ID");
  };

  // Filter data berdasarkan search query
  const filteredRoads = useMemo(() => {
    if (!searchQuery.trim()) {
      return roads;
    }

    const query = searchQuery.toLowerCase().trim();
    return roads.filter((road) => {
      return (
        road.namaJalan.toLowerCase().includes(query) ||
        road.id.toLowerCase().includes(query) ||
        road.pci.toLowerCase().includes(query) ||
        road.volumeLaluLintas.toLowerCase().includes(query) ||
        road.fungsiJaringan.toLowerCase().includes(query)
      );
    });
  }, [roads, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRoads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRoads = filteredRoads.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Daftar Data Jalan
              </h1>
              <p className="text-slate-600">
                Kelola dan analisis prioritas perbaikan jalan
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg">
                <span className="text-sm text-slate-600">Total:</span>
                <span className="text-lg font-bold text-indigo-600 ml-2">
                  {roads.length}
                </span>
                <span className="text-sm text-slate-500 ml-1">ruas</span>
              </div>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari nama jalan, ID, PCI, volume, atau fungsi..."
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-all"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Tambah Data
            </button>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-3 text-sm text-slate-600">
              Menampilkan {filteredRoads.length} hasil dari {roads.length} total
              data
              {filteredRoads.length === 0 && (
                <span className="text-red-600 ml-1">
                  - Tidak ada hasil yang cocok
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info Alert when no data */}
        {roads.length === 0 && (
          <Alert className="mb-6 animate-fade-in delay-200 border-indigo-200 bg-indigo-50">
            <Info className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-sm text-slate-700">
              Belum ada data jalan yang diinput. Klik tombol "Tambah Data" untuk
              memulai input data.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Bar */}
        {roads.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 animate-fade-in delay-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Siap untuk Analisis TOPSIS
                </p>
                <p className="text-xs text-slate-600">
                  Hitung prioritas untuk semua data jalan
                </p>
              </div>
            </div>
            <Button
              onClick={handleCalculate}
              className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Hitung TOPSIS
            </Button>
          </div>
        )}

        {/* Desktop Table View */}
        {filteredRoads.length > 0 && (
          <Card className="hidden lg:block animate-fade-in delay-300 mb-6">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-bold text-slate-900 text-center">
                        No
                      </TableHead>
                      <TableHead className="font-bold text-slate-900 min-w-45">
                        Nama Jalan
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
                        C3
                        <br />
                        Keselamatan
                      </TableHead>
                      <TableHead className="font-bold text-slate-900 text-center">
                        C4
                        <br />
                        Biaya
                      </TableHead>
                      <TableHead className="font-bold text-slate-900 text-center">
                        C5
                        <br />
                        Fungsi
                      </TableHead>
                      <TableHead className="font-bold text-slate-900 text-center">
                        C6
                        <br />
                        Penduduk
                      </TableHead>
                      <TableHead className="font-bold text-slate-900 text-center">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRoads.map((road, index) => (
                      <TableRow key={road.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-center">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {road.namaJalan}
                        </TableCell>
                        <TableCell className="text-center">
                          {road.pci}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatNumber(road.volumeLaluLintas)}
                        </TableCell>
                        <TableCell className="text-center">
                          {road.tingkatKeselamatan}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {formatNumber(road.estimasiBiaya)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {road.fungsiJaringan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {formatNumber(road.dampakPenduduk)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(road.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4 text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(road.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Card View */}
        {filteredRoads.length > 0 && (
          <div className="lg:hidden space-y-3 animate-fade-in delay-200 mb-6">
            {paginatedRoads.map((road, index) => (
              <div
                key={road.id}
                className="card-hover block bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:border-indigo-300 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">
                          {road.namaJalan}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600">
                        Ruas #{startIndex + index + 1}
                      </p>
                    </div>
                  </div>

                  {/* Criteria Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">PCI</div>
                      <div className="font-bold text-slate-900">{road.pci}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Volume</div>
                      <div className="font-bold text-slate-900 text-sm">
                        {formatNumber(road.volumeLaluLintas)}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">
                        Kecelakaan
                      </div>
                      <div className="font-bold text-slate-900">
                        {road.tingkatKeselamatan}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Biaya</div>
                      <div className="font-bold text-slate-900 text-xs">
                        {formatNumber(road.estimasiBiaya)}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Fungsi</div>
                      <div className="font-bold text-slate-900 text-xs">
                        {FungsiJaringanLabels[road.fungsiJaringan]}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">
                        Penduduk
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        {formatNumber(road.dampakPenduduk)}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span>Lokasi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(road.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-5 h-5 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(road.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-5 h-5 text-slate-600 group-hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredRoads.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 animate-fade-in delay-400">
            <div className="text-sm text-slate-600">
              Menampilkan {startIndex + 1} -{" "}
              {Math.min(endIndex, filteredRoads.length)} dari{" "}
              {filteredRoads.length} data
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
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    // Show ellipsis
                    const showEllipsisBefore =
                      page === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter =
                      page === currentPage + 2 && currentPage < totalPages - 2;

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
                        variant={currentPage === page ? "default" : "outline"}
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

        {/* Empty State - No Search Results */}
        {filteredRoads.length === 0 && roads.length > 0 && (
          <div className="text-center py-16 animate-fade-in delay-300">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Tidak Ada Hasil
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Tidak ditemukan data yang cocok dengan pencarian "{searchQuery}"
            </p>
          </div>
        )}

        {/* Empty State - No Data */}
        {roads.length === 0 && (
          <div className="text-center py-16 animate-fade-in delay-300">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Belum Ada Data Jalan
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Mulai dengan menambahkan data jalan dan kriteria untuk analisis
              TOPSIS
            </p>
            <Button
              onClick={handleAddNew}
              className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Data Jalan Pertama
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile) */}
      {roads.length > 0 && (
        <button
          onClick={handleAddNew}
          className="fixed bottom-6 right-6 lg:hidden w-16 h-16 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all z-40"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Jalan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data jalan akan dihapus
              secara permanen dari penyimpanan lokal.
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

      {/* Clear All Confirmation Dialog */}
      <AlertDialog
        open={clearAllDialogOpen}
        onOpenChange={setClearAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus semua {roads.length} data jalan secara
              permanen. Anda tidak dapat membatalkan tindakan ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewDataPage;
