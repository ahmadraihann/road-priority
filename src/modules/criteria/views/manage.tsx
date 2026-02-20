// src/modules/criteria/views/manage.tsx
import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FieldLabel } from "@/components/ui/field";
import { useToast } from "@/hooks/use-toast";
import {
  useCriteria,
  useAddCriterion,
  useUpdateCriterion,
  useDeleteCriterion,
} from "@/hooks/use-criteria";
import type { DbCriteria } from "@/lib/supabase";

interface CriterionFormData {
  code: string;
  name: string;
  key: string;
  type: "cost" | "benefit";
  weight: string;
  unit: string;
  description: string;
  sort_order: number;
}

const defaultFormData: CriterionFormData = {
  code: "",
  name: "",
  key: "",
  type: "benefit",
  weight: "",
  unit: "",
  description: "",
  sort_order: 0,
};

const CriteriaManagePage: React.FC = () => {
  const { toast } = useToast();
  const { data: criteria = [], isLoading } = useCriteria();
  const addMutation = useAddCriterion();
  const updateMutation = useUpdateCriterion();
  const deleteMutation = useDeleteCriterion();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CriterionFormData>(defaultFormData);

  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight), 0);
  const isWeightValid = Math.abs(totalWeight - 1) < 0.001;

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      ...defaultFormData,
      code: `C${criteria.length + 1}`,
      sort_order: criteria.length + 1,
    });
    setDialogOpen(true);
  };

  const handleEdit = (criterion: DbCriteria) => {
    setEditingId(criterion.id);
    setFormData({
      code: criterion.code,
      name: criterion.name,
      key: criterion.key,
      type: criterion.type,
      weight: String(Number(criterion.weight) * 100),
      unit: criterion.unit || "",
      description: criterion.description || "",
      sort_order: criterion.sort_order,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast({
        title: "Kriteria berhasil dihapus",
        description: "Kriteria telah dihapus dari database.",
      });
    } catch {
      toast({
        title: "Gagal menghapus kriteria",
        description: "Terjadi kesalahan saat menghapus kriteria.",
      });
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.key || !formData.weight) {
      toast({
        title: "Form tidak lengkap",
        description: "Semua field wajib harus diisi.",
      });
      return;
    }

    const weightDecimal = parseFloat(formData.weight) / 100;

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          code: formData.code,
          name: formData.name,
          key: formData.key,
          type: formData.type,
          weight: weightDecimal,
          unit: formData.unit || null,
          description: formData.description || null,
          sort_order: formData.sort_order,
        });
        toast({
          title: "Kriteria berhasil diperbarui",
          description: `Kriteria "${formData.name}" telah diperbarui.`,
        });
      } else {
        await addMutation.mutateAsync({
          code: formData.code,
          name: formData.name,
          key: formData.key,
          type: formData.type,
          weight: weightDecimal,
          unit: formData.unit || null,
          description: formData.description || null,
          sort_order: formData.sort_order,
        });
        toast({
          title: "Kriteria berhasil ditambahkan",
          description: `Kriteria "${formData.name}" telah disimpan.`,
        });
      }
      setDialogOpen(false);
    } catch {
      toast({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan kriteria.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat kriteria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Kelola Kriteria
              </h1>
              <p className="text-slate-600">
                Atur kriteria dan bobot untuk analisis TOPSIS
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Kriteria
            </Button>
          </div>

          {/* Weight Summary */}
          <div
            className={`p-4 rounded-xl border-2 mb-6 ${
              isWeightValid
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {!isWeightValid && (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <Settings2
                className={`w-5 h-5 shrink-0 ${
                  isWeightValid ? "text-green-600" : "text-amber-600"
                }`}
              />
              <div>
                <p
                  className={`font-semibold ${
                    isWeightValid ? "text-green-900" : "text-amber-900"
                  }`}
                >
                  Total Bobot: {(totalWeight * 100).toFixed(1)}%
                  {isWeightValid ? " ✓" : ""}
                </p>
                {!isWeightValid && (
                  <p className="text-sm text-amber-700">
                    Total bobot harus = 100%. Saat ini{" "}
                    {totalWeight < 1 ? "kurang" : "lebih"}{" "}
                    {Math.abs((totalWeight - 1) * 100).toFixed(1)}%.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Criteria Table */}
        <Card className="animate-fade-in delay-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold text-slate-900 text-center w-16">
                      Kode
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 min-w-40">
                      Nama Kriteria
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-20">
                      Key
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-24">
                      Tipe
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-24">
                      Bobot
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-24">
                      Satuan
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 text-center w-20">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-center text-indigo-600">
                        {c.code}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900">
                          {c.name}
                        </div>
                        {c.description && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {c.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm text-slate-600">
                        {c.key}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            c.type === "cost"
                              ? "border-red-300 text-red-700 bg-red-50"
                              : "border-green-300 text-green-700 bg-green-50"
                          }
                        >
                          {c.type === "cost" ? "Cost" : "Benefit"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {(Number(c.weight) * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-600">
                        {c.unit || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(c)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(c.id)}
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

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3 mt-6 animate-fade-in delay-200">
          {criteria.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border-2 border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-indigo-600">{c.code}</span>
                    <Badge
                      variant="outline"
                      className={
                        c.type === "cost"
                          ? "border-red-300 text-red-700 bg-red-50"
                          : "border-green-300 text-green-700 bg-green-50"
                      }
                    >
                      {c.type === "cost" ? "Cost" : "Benefit"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                </div>
                <div className="text-xl font-bold text-indigo-600">
                  {(Number(c.weight) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Key: <span className="font-mono">{c.key}</span> •{" "}
                  {c.unit || "—"}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(c)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(c.id)}
                    className="h-8 w-8 p-0 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {criteria.length === 0 && (
          <div className="text-center py-16">
            <Settings2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Belum Ada Kriteria
            </h3>
            <p className="text-slate-600 mb-6">
              Tambahkan kriteria untuk memulai analisis TOPSIS
            </p>
            <Button
              onClick={handleAdd}
              className="bg-linear-to-r from-indigo-600 to-purple-600 gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Kriteria Pertama
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Kriteria" : "Tambah Kriteria Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Perbarui informasi kriteria di bawah ini."
                : "Isi informasi kriteria baru untuk analisis TOPSIS."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Kode *</FieldLabel>
                <Input
                  placeholder="C7"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
              <div>
                <FieldLabel>Urutan</FieldLabel>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <FieldLabel>Nama Kriteria *</FieldLabel>
              <Input
                placeholder="Nama kriteria"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <FieldLabel>Key (identifier unik) *</FieldLabel>
              <Input
                placeholder="namaKey (camelCase)"
                value={formData.key}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    key: e.target.value.replace(/\s/g, ""),
                  })
                }
              />
              <p className="text-xs text-slate-500 mt-1">
                Digunakan sebagai identifier di database. Gunakan camelCase.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Tipe *</FieldLabel>
                <Select
                  value={formData.type}
                  onValueChange={(val: "cost" | "benefit") =>
                    setFormData({ ...formData, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost">Cost (↓ = prioritas)</SelectItem>
                    <SelectItem value="benefit">
                      Benefit (↑ = prioritas)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Bobot (%) *</FieldLabel>
                <Input
                  type="number"
                  placeholder="0 - 100"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <FieldLabel>Satuan</FieldLabel>
              <Input
                placeholder="misal: kend/hari, Rupiah, PCI"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </div>

            <div>
              <FieldLabel>Deskripsi</FieldLabel>
              <Input
                placeholder="Deskripsi singkat kriteria"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4 mr-1" />
              Batal
            </Button>
            <Button
              onClick={handleSave}
              className="bg-linear-to-r from-indigo-600 to-purple-600"
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-1" />
              {editingId ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kriteria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kriteria akan dihapus
              permanen dari database.
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

export default CriteriaManagePage;
