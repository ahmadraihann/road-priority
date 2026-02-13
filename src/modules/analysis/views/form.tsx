// src/modules/analysis/views/form.tsx
import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Plus, Info, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useRoadStorage } from "@/hooks/use-road-storage";
import { JalanSelect } from "@/components/select-road";

import { RoadFormSchema } from "../schema";
import type { RoadFormValues } from "../types";
import { getJalanById } from "../data/jalan-publik";

const InputFormPage: React.FC = () => {
  const [selectedJalanId, setSelectedJalanId] = useState<string>("");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
    mode: "onTouched", // Changed from "onChange" to "onTouched" to avoid premature validation
  });

  // Auto-fill polyline dan nama jalan ketika jalan dipilih dari select
  useEffect(() => {
    if (selectedJalanId && !isEditMode) {
      const jalanData = getJalanById(selectedJalanId);

      if (jalanData) {
        // Set nama jalan
        setValue("namaJalan", jalanData.namaJalan);

        // Set polyline (convert array to JSON string untuk storage)
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

      // Set selected jalan ID using a separate useEffect or after reset completes
      // This avoids synchronous setState in effect
    }
  }, [isEditMode, existingRoad, reset]);

  // Separate effect to set selectedJalanId after data is loaded
  useEffect(() => {
    if (isEditMode && existingRoad && existingRoad.id) {
      // Use setTimeout to defer the setState to next tick
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
        // Update existing road
        updateRoad(id, values);
        toast({
          title: "Data berhasil diperbarui!",
          description: `Data jalan "${values.namaJalan}" telah diperbarui.`,
        });
      } else {
        // Add new road
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {isEditMode ? "Edit Data Jalan" : "Input Data Jalan"}
          </h1>
          <p className="text-slate-600">
            {isEditMode
              ? "Perbarui informasi jalan dan nilai kriteria"
              : "Masukkan informasi jalan dan nilai kriteria untuk analisis TOPSIS"}
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 animate-fade-in delay-200 border-indigo-200 bg-indigo-50">
          <Info className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-sm text-slate-700">
            {isEditMode
              ? 'Anda sedang mengedit data jalan. Perubahan akan tersimpan setelah klik "Simpan Perubahan".'
              : "Pilih jalan dari dropdown (dengan search dan infinite scroll). Koordinat GIS akan terisi otomatis. Semua field bertanda (*) wajib diisi."}
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Informasi Jalan */}
            <Card className="animate-fade-in delay-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Informasi Jalan
                </CardTitle>
                <CardDescription>
                  Data identitas dan lokasi jalan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <FieldSet>
                    {/* Pilih Jalan - INFINITE SCROLL SELECT */}
                    <Field className="flex flex-col gap-1.5">
                      <FieldLabel htmlFor="selectJalan">
                        Pilih Jalan *
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
                        <FieldDescription className="text-destructive text-xs">
                          Silakan pilih jalan terlebih dahulu
                        </FieldDescription>
                      )}
                    </Field>

                    {/* Preview Jalan yang dipilih */}
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

                    {/* Nama Jalan - HIDDEN (auto-filled) */}
                    <input type="hidden" {...register("namaJalan")} />

                    {/* Polyline - READ ONLY (auto-filled) with max-height */}
                    <Field className="flex flex-col gap-1.5">
                      <FieldLabel htmlFor="polyline">
                        Polyline (GIS Coordinates)
                      </FieldLabel>
                      <Textarea
                        id="polyline"
                        placeholder="Akan terisi otomatis saat memilih jalan"
                        className="max-h-37.5 overflow-y-auto font-mono text-sm bg-slate-50"
                        {...register("polyline")}
                        readOnly
                        aria-invalid={!!errors.polyline}
                      />
                      <FieldDescription className="text-xs">
                        Koordinat GIS akan terisi otomatis dari database jalan
                      </FieldDescription>
                      {errors.polyline && isSubmitted && (
                        <FieldDescription className="text-destructive">
                          {errors.polyline.message}
                        </FieldDescription>
                      )}
                    </Field>

                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Info className="w-4 h-4 text-green-600 shrink-0" />
                      <p className="text-xs text-green-700">
                        Koordinat jalan tersimpan dalam format GeoJSON. Data ini
                        akan digunakan untuk visualisasi di peta GIS.
                      </p>
                    </div>
                  </FieldSet>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Right Column - Kriteria C1-C3 */}
            <Card className="animate-fade-in delay-400">
              <CardHeader>
                <CardTitle>Kriteria Penilaian</CardTitle>
                <CardDescription>C1, C2, dan C3</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <FieldSet>
                    {/* C1: PCI */}
                    <Field className="flex flex-col gap-1.5">
                      <FieldLabel
                        htmlFor="pci"
                        className="flex items-center justify-between"
                      >
                        <span>C1: Kondisi Fisik Jalan (PCI) *</span>
                        <span className="text-xs text-indigo-600 font-semibold">
                          30%
                        </span>
                      </FieldLabel>
                      <Controller
                        name="pci"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="pci"
                            type="text"
                            placeholder="0-100"
                            inputMode="decimal"
                            value={field.value}
                            onChange={(e) =>
                              handleDecimalInput(e, field.onChange)
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            aria-invalid={!!errors.pci}
                          />
                        )}
                      />
                      <FieldDescription className="flex items-center gap-1 text-xs">
                        <span className="text-red-600 font-medium">
                          📉 Cost
                        </span>
                        <span className="text-slate-500">
                          | Bobot: 30% | Semakin rendah = prioritas
                        </span>
                      </FieldDescription>
                      {errors.pci && isSubmitted && (
                        <FieldDescription className="text-destructive">
                          {errors.pci.message}
                        </FieldDescription>
                      )}
                    </Field>

                    {/* C2: Volume Lalu Lintas */}
                    <Field className="flex flex-col gap-1.5">
                      <FieldLabel
                        htmlFor="volumeLaluLintas"
                        className="flex items-center justify-between"
                      >
                        <span>C2: Volume Lalu Lintas *</span>
                        <span className="text-xs text-indigo-600 font-semibold">
                          25%
                        </span>
                      </FieldLabel>
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
                            name={field.name}
                            ref={field.ref}
                            aria-invalid={!!errors.volumeLaluLintas}
                          />
                        )}
                      />
                      <FieldDescription className="flex items-center gap-1 text-xs">
                        <span className="text-green-600 font-medium">
                          📈 Benefit
                        </span>
                        <span className="text-slate-500">
                          | Bobot: 25% | Semakin tinggi = prioritas
                        </span>
                      </FieldDescription>
                      {errors.volumeLaluLintas && isSubmitted && (
                        <FieldDescription className="text-destructive">
                          {errors.volumeLaluLintas.message}
                        </FieldDescription>
                      )}
                    </Field>

                    {/* C3: Tingkat Keselamatan */}
                    <Field className="flex flex-col gap-1.5">
                      <FieldLabel
                        htmlFor="tingkatKeselamatan"
                        className="flex items-center justify-between"
                      >
                        <span>C3: Tingkat Keselamatan *</span>
                        <span className="text-xs text-indigo-600 font-semibold">
                          15%
                        </span>
                      </FieldLabel>
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
                            name={field.name}
                            ref={field.ref}
                            aria-invalid={!!errors.tingkatKeselamatan}
                          />
                        )}
                      />
                      <FieldDescription className="flex items-center gap-1 text-xs">
                        <span className="text-red-600 font-medium">
                          📉 Cost
                        </span>
                        <span className="text-slate-500">
                          | Bobot: 15% | Semakin rendah = baik
                        </span>
                      </FieldDescription>
                      {errors.tingkatKeselamatan && isSubmitted && (
                        <FieldDescription className="text-destructive">
                          {errors.tingkatKeselamatan.message}
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldSet>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - C4, C5, C6 */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* C4: Estimasi Biaya */}
            <Card className="animate-fade-in delay-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">C4: Estimasi Biaya</CardTitle>
                <CardDescription className="text-xs">
                  Biaya perbaikan (Rupiah)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <FieldSet>
                    <Field className="flex flex-col gap-1.5">
                      <FieldLabel
                        htmlFor="estimasiBiaya"
                        className="flex items-center justify-between"
                      >
                        <span>Estimasi Biaya Perbaikan *</span>
                        <span className="text-xs text-indigo-600 font-semibold">
                          12%
                        </span>
                      </FieldLabel>
                      <Controller
                        name="estimasiBiaya"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="estimasiBiaya"
                            type="text"
                            placeholder="Rupiah"
                            inputMode="decimal"
                            value={field.value}
                            onChange={(e) =>
                              handleDecimalInput(e, field.onChange)
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            aria-invalid={!!errors.estimasiBiaya}
                          />
                        )}
                      />
                      <FieldDescription className="flex items-center gap-1 text-xs">
                        <span className="text-red-600 font-medium">
                          📉 Cost
                        </span>
                        <span className="text-slate-500">| Bobot: 12%</span>
                      </FieldDescription>
                      {errors.estimasiBiaya && isSubmitted && (
                        <FieldDescription className="text-destructive">
                          {errors.estimasiBiaya.message}
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldSet>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* C5: Fungsi Jaringan Jalan */}
            <Card className="animate-fade-in delay-600">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">C5: Fungsi Jaringan</CardTitle>
                <CardDescription className="text-xs">
                  Klasifikasi jalan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <FieldSet>
                    <Field className="flex flex-col gap-1.5">
                      <FieldLabel
                        htmlFor="fungsiJaringan"
                        className="flex items-center justify-between"
                      >
                        <span>Fungsi Jaringan Jalan *</span>
                        <span className="text-xs text-indigo-600 font-semibold">
                          10%
                        </span>
                      </FieldLabel>
                      <Controller
                        name="fungsiJaringan"
                        control={control}
                        render={({ field }) => (
                          <Select
                            key={field.value}
                            value={field.value}
                            onValueChange={(e) => {
                              field.onChange(e);
                            }}
                          >
                            <SelectTrigger
                              id="fungsiJaringan"
                              className="w-full"
                              aria-invalid={!!errors.fungsiJaringan}
                            >
                              <SelectValue placeholder="Pilih fungsi jalan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">
                                1 - Arteri Primer
                              </SelectItem>
                              <SelectItem value="2">
                                2 - Arteri Sekunder
                              </SelectItem>
                              <SelectItem value="3">3 - Kolektor</SelectItem>
                              <SelectItem value="4">4 - Lokal</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldDescription className="flex items-center gap-1 text-xs">
                        <span className="text-red-600 font-medium">
                          📉 Cost
                        </span>
                        <span className="text-slate-500">| Bobot: 10%</span>
                      </FieldDescription>
                      {errors.fungsiJaringan && isSubmitted && (
                        <FieldDescription className="text-destructive">
                          {errors.fungsiJaringan.message}
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldSet>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* C6: Dampak Penduduk */}
            <Card className="animate-fade-in delay-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">C6: Dampak Penduduk</CardTitle>
                <CardDescription className="text-xs">
                  Penduduk terlayani
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <FieldSet>
                    <Field className="flex flex-col gap-1.5">
                      <FieldLabel
                        htmlFor="dampakPenduduk"
                        className="flex items-center justify-between"
                      >
                        <span>Dampak Penduduk Terlayani *</span>
                        <span className="text-xs text-indigo-600 font-semibold">
                          8%
                        </span>
                      </FieldLabel>
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
                            name={field.name}
                            ref={field.ref}
                            aria-invalid={!!errors.dampakPenduduk}
                          />
                        )}
                      />
                      <FieldDescription className="flex items-center gap-1 text-xs">
                        <span className="text-green-600 font-medium">
                          📈 Benefit
                        </span>
                        <span className="text-slate-500">| Bobot: 8%</span>
                      </FieldDescription>
                      {errors.dampakPenduduk && isSubmitted && (
                        <FieldDescription className="text-destructive">
                          {errors.dampakPenduduk.message}
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldSet>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-4 animate-fade-in delay-900 sm:mt-10">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Batal
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
                  Tambah Data Jalan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputFormPage;
