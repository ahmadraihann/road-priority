// src/modules/analysis/views/list.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowRight, Info, FileText } from "lucide-react";

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

const ReviewDataPage: React.FC = () => {
  const navigate = useNavigate();
  const { roads, deleteRoad, clearAllRoads, isLoading } = useRoadStorage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);

  const handleAddNew = () => {
    navigate("/form");
  };

  const handleEdit = (id: string) => {
    navigate(`/form/${id}`);
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

  const handleClearAllClick = () => {
    setClearAllDialogOpen(true);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Data Jalan yang Diinput
              </h1>
              <p className="text-slate-600">
                {roads.length} jalan siap untuk dianalisis
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleAddNew}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Data Baru
              </Button>
              {roads.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleClearAllClick}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Semua
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Info Alert when no data */}
        {roads.length === 0 && (
          <Alert className="mb-6 animate-fade-in delay-200 border-indigo-200 bg-indigo-50">
            <Info className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-sm text-slate-700">
              Belum ada data jalan yang diinput. Klik tombol "Tambah Data Baru"
              untuk memulai input data.
            </AlertDescription>
          </Alert>
        )}

        {/* Desktop Table View */}
        {roads.length > 0 && (
          <>
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
                      {roads.map((road, index) => (
                        <TableRow key={road.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-center">
                            {index + 1}
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

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 animate-fade-in delay-300 mb-6">
              {roads.map((road, index) => (
                <Card key={road.id} className="overflow-hidden gap-2">
                  <CardHeader className="pt-3 bg-linear-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {FungsiJaringanLabels[road.fungsiJaringan]}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">
                          {road.namaJalan}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(road.id)}
                          className="h-9 w-9 p-0"
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(road.id)}
                          className="h-9 w-9 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">
                          C1: PCI
                        </div>
                        <div className="font-bold text-slate-900">
                          {road.pci}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">
                          C2: Volume
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {formatNumber(road.volumeLaluLintas)}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">
                          C3: Keselamatan
                        </div>
                        <div className="font-bold text-slate-900">
                          {road.tingkatKeselamatan}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">
                          C4: Biaya
                        </div>
                        <div className="font-bold text-slate-900 text-xs">
                          {formatNumber(road.estimasiBiaya)}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">
                          C5: Fungsi
                        </div>
                        <div className="font-bold text-slate-900">
                          {road.fungsiJaringan}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">
                          C6: Penduduk
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {formatNumber(road.dampakPenduduk)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Card */}
            <Card className="animate-fade-in delay-400 bg-linear-to-br from-indigo-50 to-purple-50 border-indigo-200 mb-6 gap-2 md:gap-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Ringkasan Data
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {roads.length}
                    </div>
                    <div className="text-sm text-slate-600">Total Jalan</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">6</div>
                    <div className="text-sm text-slate-600">Kriteria</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-pink-600">100%</div>
                    <div className="text-sm text-slate-600">Data Lengkap</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm text-slate-600">Siap Analisis</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:justify-end gap-4 animate-fade-in delay-500">
              <Button
                className="flex-1 md:flex-none bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                onClick={handleCalculate}
              >
                Hitung Prioritas dengan TOPSIS
                <ArrowRight />
              </Button>
            </div>
          </>
        )}

        {/* Empty State */}
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
