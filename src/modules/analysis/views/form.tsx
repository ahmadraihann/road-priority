// src/modules/analysis/views/form.tsx
import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Info, Save, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRoadStorage } from "@/hooks/use-road-storage";
import { JalanSelect } from "@/components/select-road";

import { RoadFormSchema } from "../schema";
import type { RoadFormValues } from "../types";
import { getJalanById } from "../data/jalan-publik";

const InputFormPage: React.FC = () => {
  const [selectedJalanId, setSelectedJalanId] = useState<string>("");
  const navigate = useNavigate();
  // const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { toast } = useToast();
  const { addRoad, updateRoad, getRoad } = useRoadStorage();

  const isEditMode = !!id;
  const existingRoad = isEditMode ? getRoad(id) : null;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<RoadFormValues>({
    resolver: zodResolver(RoadFormSchema),
    defaultValues: {
      namaJalan: "",
      polyline: "",
      pci: "",
      volumeLaluLintas: "",
      tingkatKeselamatan: "",
      estimasiBiaya: "",
      fungsiJaringan: "",
      dampakPenduduk: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Auto-fill polyline dan nama jalan ketika jalan dipilih dari select
  useEffect(() => {
    if (selectedJalanId && !isEditMode) {
      const jalanData = getJalanById(selectedJalanId);

      if (jalanData) {
        setValue("namaJalan", jalanData.namaJalan);
        setValue("polyline", JSON.stringify(jalanData.polyline));
      }
    }
  }, [selectedJalanId, isEditMode, setValue]);

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && existingRoad) {
      reset({
        namaJalan: existingRoad.namaJalan,
        polyline: existingRoad.polyline || "",
        pci: existingRoad.pci,
        volumeLaluLintas: existingRoad.volumeLaluLintas,
        tingkatKeselamatan: existingRoad.tingkatKeselamatan,
        estimasiBiaya: existingRoad.estimasiBiaya,
        fungsiJaringan: existingRoad.fungsiJaringan,
        dampakPenduduk: existingRoad.dampakPenduduk,
      });
    }
  }, [isEditMode, existingRoad, reset]);

  // Separate effect to set selectedJalanId after data is loaded
  useEffect(() => {
    if (isEditMode && existingRoad && existingRoad.id) {
      const timer = setTimeout(() => {
        setSelectedJalanId(existingRoad.id || "");
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isEditMode, existingRoad]);

  // Helper function untuk filter input angka bulat (integer only)
  const handleIntegerInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const value = e.target.value;
    const filtered = value.replace(/[^\d]/g, "");
    onChange(filtered);
  };

  // Helper function untuk filter input angka desimal
  const handleDecimalInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const value = e.target.value;
    const filtered = value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    onChange(filtered);
  };

  const onSubmit = (values: RoadFormValues) => {
    try {
      if (isEditMode && id) {
        updateRoad(id, values);
        toast({
          title: "Data berhasil diperbarui!",
          description: `Data jalan "${values.namaJalan}" telah diperbarui.`,
        });
      } else {
        addRoad(values);
        toast({
          title: "Data berhasil ditambahkan!",
          description: `Data jalan "${values.namaJalan}" telah disimpan.`,
        });
      }
      navigate("/review");
    } catch {
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal menyimpan data. Silakan coba lagi.",
      });
    }
  };

  const onBack = () => {
    navigate(-1);
  };

  // Get preview info
  const selectedJalan = selectedJalanId ? getJalanById(selectedJalanId) : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in delay-100">
            {/* Card Header */}
            <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-8 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {isEditMode ? "Edit Data Jalan" : "Tambah Data Jalan Baru"}
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base">
                    Isi informasi lengkap ruas jalan untuk analisis TOPSIS
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Informasi Dasar Section */}
              <div className="animate-fade-in delay-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Informasi Dasar
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Pilih Jalan */}
                  <Field className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="selectJalan">
                      Pilih Jalan <span className="text-red-500">*</span>
                    </FieldLabel>
                    <JalanSelect
                      value={selectedJalanId}
                      onValueChange={setSelectedJalanId}
                      placeholder="Ketik untuk mencari jalan..."
                      disabled={isEditMode}
                    />
                    <FieldDescription className="text-xs">
                      Gunakan search untuk mencari jalan. Data dimuat otomatis
                      saat scroll.
                    </FieldDescription>
                    {!selectedJalanId && !isEditMode && isSubmitted && (
                      <FieldDescription className="text-red-600 text-xs">
                        Silakan pilih jalan terlebih dahulu
                      </FieldDescription>
                    )}
                  </Field>

                  {/* Preview Jalan */}
                  {selectedJalan && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="text-xs font-semibold text-indigo-900 mb-1">
                        Jalan Terpilih:
                      </div>
                      <div className="text-sm font-medium text-indigo-700">
                        {selectedJalan.namaJalan}
                      </div>
                      <div className="text-xs text-indigo-600 mt-1">
                        ID: {selectedJalan.id}
                      </div>
                      {selectedJalan.panjang_meter && (
                        <div className="text-xs text-indigo-600">
                          Panjang:{" "}
                          {(selectedJalan.panjang_meter * 1000).toFixed(2)}{" "}
                          meter
                        </div>
                      )}
                      <div className="text-xs text-indigo-600">
                        Koordinat: {selectedJalan.polyline.length} titik
                      </div>
                    </div>
                  )}

                  {/* Hidden nama jalan */}
                  <input type="hidden" {...register("namaJalan")} />

                  {/* Polyline */}
                  <Field className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="polyline">
                      Polyline (GIS Coordinates)
                    </FieldLabel>
                    <div className="relative">
                      <Textarea
                        id="polyline"
                        placeholder="Akan terisi otomatis saat memilih jalan"
                        className="h-32 overflow-y-auto font-mono text-sm bg-slate-50"
                        {...register("polyline")}
                        readOnly
                      />
                    </div>
                    <FieldDescription className="text-xs">
                      Format: Array koordinat [latitude, longitude]
                    </FieldDescription>
                    {errors.polyline && isSubmitted && (
                      <FieldDescription className="text-red-600">
                        {errors.polyline.message}
                      </FieldDescription>
                    )}
                  </Field>
                </div>
              </div>

              <div className="border-t border-slate-200"></div>

              {/* Kriteria TOPSIS Section */}
              <div className="animate-fade-in delay-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Kriteria Penilaian
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* C1: PCI */}
                  <div className="relative group">
                    <FieldLabel htmlFor="pci">
                      C1: Kondisi Fisik (PCI){" "}
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div className="relative mt-2">
                      <Controller
                        name="pci"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="pci"
                            type="text"
                            placeholder="0 - 100"
                            inputMode="decimal"
                            value={field.value}
                            onChange={(e) =>
                              handleDecimalInput(e, field.onChange)
                            }
                            onBlur={field.onBlur}
                            className="pl-4 pr-12"
                          />
                        )}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                        PCI
                      </div>
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <div className="w-1 h-4 bg-linear-to-b from-red-500 to-orange-500 rounded-full shrink-0 mt-0.5"></div>
                      <p className="text-xs text-slate-500">
                        Cost • Bobot 30% • Semakin rendah semakin prioritas
                      </p>
                    </div>
                    {errors.pci && isSubmitted && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.pci.message}
                      </p>
                    )}
                  </div>

                  {/* C2: Volume Lalu Lintas */}
                  <div className="relative group">
                    <FieldLabel htmlFor="volumeLaluLintas">
                      C2: Volume Lalu Lintas{" "}
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div className="relative mt-2">
                      <Controller
                        name="volumeLaluLintas"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="volumeLaluLintas"
                            type="text"
                            placeholder="Kendaraan/hari"
                            inputMode="numeric"
                            value={field.value}
                            onChange={(e) =>
                              handleIntegerInput(e, field.onChange)
                            }
                            onBlur={field.onBlur}
                            className="pl-4 pr-24"
                          />
                        )}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                        kend/hari
                      </div>
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <div className="w-1 h-4 bg-linear-to-b from-orange-500 to-amber-500 rounded-full shrink-0 mt-0.5"></div>
                      <p className="text-xs text-slate-500">
                        Benefit • Bobot 25% • Semakin tinggi semakin prioritas
                      </p>
                    </div>
                    {errors.volumeLaluLintas && isSubmitted && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.volumeLaluLintas.message}
                      </p>
                    )}
                  </div>

                  {/* C3: Keselamatan */}
                  <div className="relative group">
                    <FieldLabel htmlFor="tingkatKeselamatan">
                      C3: Tingkat Keselamatan{" "}
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div className="relative mt-2">
                      <Controller
                        name="tingkatKeselamatan"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="tingkatKeselamatan"
                            type="text"
                            placeholder="Jumlah kecelakaan/tahun"
                            inputMode="numeric"
                            value={field.value}
                            onChange={(e) =>
                              handleIntegerInput(e, field.onChange)
                            }
                            onBlur={field.onBlur}
                            className="pl-4 pr-20"
                          />
                        )}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                        kejadian
                      </div>
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <div className="w-1 h-4 bg-linear-to-b from-amber-500 to-yellow-500 rounded-full shrink-0 mt-0.5"></div>
                      <p className="text-xs text-slate-500">
                        Benefit • Bobot 15% • Semakin tinggi semakin prioritas
                      </p>
                    </div>
                    {errors.tingkatKeselamatan && isSubmitted && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.tingkatKeselamatan.message}
                      </p>
                    )}
                  </div>

                  {/* C4: Biaya */}
                  <div className="relative group">
                    <FieldLabel htmlFor="estimasiBiaya">
                      C4: Estimasi Biaya <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div className="relative mt-2">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                        Rp
                      </div>
                      <Controller
                        name="estimasiBiaya"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="estimasiBiaya"
                            type="text"
                            placeholder="5000000"
                            inputMode="decimal"
                            value={field.value}
                            onChange={(e) =>
                              handleDecimalInput(e, field.onChange)
                            }
                            onBlur={field.onBlur}
                            className="pl-12 pr-4"
                          />
                        )}
                      />
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <div className="w-1 h-4 bg-linear-to-b from-yellow-500 to-lime-500 rounded-full shrink-0 mt-0.5"></div>
                      <p className="text-xs text-slate-500">
                        Cost • Bobot 12% • Semakin rendah semakin prioritas
                      </p>
                    </div>
                    {errors.estimasiBiaya && isSubmitted && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.estimasiBiaya.message}
                      </p>
                    )}
                  </div>

                  {/* C5: Fungsi Jaringan */}
                  <div className="relative group">
                    <FieldLabel htmlFor="fungsiJaringan">
                      C5: Fungsi Jaringan Jalan{" "}
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div className="mt-2">
                      <Controller
                        name="fungsiJaringan"
                        control={control}
                        render={({ field }) => (
                          <Select
                            key={field.value}
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih fungsi jaringan..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">
                                Jalan Arteri (1)
                              </SelectItem>
                              <SelectItem value="2">
                                Jalan Kolektor (2)
                              </SelectItem>
                              <SelectItem value="3">Jalan Lokal (3)</SelectItem>
                              <SelectItem value="4">
                                Jalan Lingkungan (4)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <div className="w-1 h-4 bg-linear-to-b from-lime-500 to-green-500 rounded-full shrink-0 mt-0.5"></div>
                      <p className="text-xs text-slate-500">
                        Cost • Bobot 10% • Skala 1-4
                      </p>
                    </div>
                    {errors.fungsiJaringan && isSubmitted && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.fungsiJaringan.message}
                      </p>
                    )}
                  </div>

                  {/* C6: Dampak Penduduk */}
                  <div className="relative group">
                    <FieldLabel htmlFor="dampakPenduduk">
                      C6: Dampak Penduduk{" "}
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div className="relative mt-2">
                      <Controller
                        name="dampakPenduduk"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="dampakPenduduk"
                            type="text"
                            placeholder="Jumlah jiwa"
                            inputMode="numeric"
                            value={field.value}
                            onChange={(e) =>
                              handleIntegerInput(e, field.onChange)
                            }
                            onBlur={field.onBlur}
                            className="pl-4 pr-16"
                          />
                        )}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                        jiwa
                      </div>
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <div className="w-1 h-4 bg-linear-to-b from-green-500 to-emerald-500 rounded-full shrink-0 mt-0.5"></div>
                      <p className="text-xs text-slate-500">
                        Benefit • Bobot 8% • Semakin tinggi semakin prioritas
                      </p>
                    </div>
                    {errors.dampakPenduduk && isSubmitted && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.dampakPenduduk.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl animate-fade-in delay-400">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Informasi Kriteria
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Cost</strong>: Semakin rendah nilai, semakin
                      tinggi prioritas (PCI, biaya, dll)
                      <br />
                      <strong>Benefit</strong>: Semakin tinggi nilai, semakin
                      tinggi prioritas (volume, dampak)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 sm:px-8">
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Batalkan
                </Button>
                <Button
                  type="submit"
                  className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                  disabled={!selectedJalanId && !isEditMode}
                >
                  {isEditMode ? (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Simpan Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-6 text-center text-sm text-slate-500 animate-fade-in delay-400">
            Semua field dengan tanda <span className="text-red-500">*</span>{" "}
            wajib diisi
          </div>
        </form>
      </main>

      {/* Mobile Helper */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <button className="w-14 h-14 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl hover:scale-110 transition-all">
          <Info className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default InputFormPage;
