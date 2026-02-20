// src/modules/analysis/views/form.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Info, Save, Plus } from "lucide-react";
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
import { useRoads, useAddRoad, useUpdateRoad } from "@/hooks/use-roads";
import { useCriteria } from "@/hooks/use-criteria";
import { JalanSelect } from "@/components/select-road";
import { getJalanById } from "../data/jalan-publik";

const InputFormPage: React.FC = () => {
  const [selectedJalanId, setSelectedJalanId] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { toast } = useToast();
  const { data: roads = [] } = useRoads();
  const { data: criteria = [], isLoading: criteriaLoading } = useCriteria();
  const addRoadMutation = useAddRoad();
  const updateRoadMutation = useUpdateRoad();

  const isEditMode = !!id;
  const existingRoad = isEditMode
    ? roads.find((r) => r.id === id)
    : null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<Record<string, string>>({
    defaultValues: {
      namaJalan: "",
      polyline: "",
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
      const defaults: Record<string, string> = {
        namaJalan: existingRoad.nama_jalan,
        polyline: existingRoad.polyline || "",
      };
      // Fill criteria values
      for (const [key, value] of Object.entries(
        existingRoad.criteria_values
      )) {
        defaults[key] = value;
      }
      reset(defaults);
    }
  }, [isEditMode, existingRoad, reset]);

  useEffect(() => {
    if (isEditMode && existingRoad && existingRoad.road_id) {
      const timer = setTimeout(() => {
        setSelectedJalanId(existingRoad.road_id || "");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditMode, existingRoad]);

  const handleIntegerInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setValue(fieldName, value);
  };

  const handleDecimalInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const value = e.target.value
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./, "$1");
    setValue(fieldName, value);
  };

  const onSubmit = async (values: Record<string, string>) => {
    // Build criteria_values from dynamic criteria
    const criteriaValues: Record<string, string> = {};
    for (const c of criteria) {
      criteriaValues[c.key] = values[c.key] || "0";
    }

    try {
      if (isEditMode && id) {
        await updateRoadMutation.mutateAsync({
          id,
          nama_jalan: values.namaJalan,
          polyline: values.polyline || null,
          criteria_values: criteriaValues,
        });
        toast({
          title: "Data berhasil diperbarui!",
          description: `Data jalan "${values.namaJalan}" telah diperbarui.`,
        });
      } else {
        await addRoadMutation.mutateAsync({
          road_id: selectedJalanId || `road_${Date.now()}`,
          nama_jalan: values.namaJalan,
          polyline: values.polyline || null,
          criteria_values: criteriaValues,
        });
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

  const selectedJalan = selectedJalanId ? getJalanById(selectedJalanId) : null;

  if (criteriaLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat kriteria...</p>
        </div>
      </div>
    );
  }

  const colorGradients = [
    "from-red-500 to-orange-500",
    "from-orange-500 to-amber-500",
    "from-amber-500 to-yellow-500",
    "from-yellow-500 to-lime-500",
    "from-lime-500 to-green-500",
    "from-green-500 to-emerald-500",
    "from-emerald-500 to-teal-500",
    "from-teal-500 to-cyan-500",
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
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
                      Gunakan search untuk mencari jalan.
                    </FieldDescription>
                    {!selectedJalanId && !isEditMode && isSubmitted && (
                      <FieldDescription className="text-red-600 text-xs">
                        Silakan pilih jalan terlebih dahulu
                      </FieldDescription>
                    )}
                  </Field>

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
                          {(selectedJalan.panjang_meter * 1000).toFixed(2)} meter
                        </div>
                      )}
                      <div className="text-xs text-indigo-600">
                        Koordinat: {selectedJalan.polyline.length} titik
                      </div>
                    </div>
                  )}

                  <input type="hidden" {...register("namaJalan")} />

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
                  </Field>
                </div>
              </div>

              <div className="border-t border-slate-200"></div>

              {/* Dynamic Criteria Section */}
              <div className="animate-fade-in delay-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Kriteria Penilaian ({criteria.length} kriteria)
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {criteria.map((c, idx) => {
                    const colorGrad =
                      colorGradients[idx % colorGradients.length];
                    const isSelectField = c.key === "fungsiJaringan";
                    const watchedValue = watch(c.key);

                    return (
                      <div key={c.id} className="relative group">
                        <FieldLabel htmlFor={c.key}>
                          {c.code}: {c.name}{" "}
                          <span className="text-red-500">*</span>
                        </FieldLabel>

                        {isSelectField ? (
                          <div className="mt-2">
                            <Select
                              value={watchedValue || ""}
                              onValueChange={(val) => setValue(c.key, val)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih fungsi jaringan..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Jalan Arteri (1)</SelectItem>
                                <SelectItem value="2">Jalan Kolektor (2)</SelectItem>
                                <SelectItem value="3">Jalan Lokal (3)</SelectItem>
                                <SelectItem value="4">Jalan Lingkungan (4)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="relative mt-2">
                            <Input
                              id={c.key}
                              type="text"
                              placeholder={`Masukkan nilai ${c.name}`}
                              inputMode="decimal"
                              value={watchedValue || ""}
                              onChange={(e) => {
                                if (
                                  c.key === "pci" ||
                                  c.key === "estimasiBiaya"
                                ) {
                                  handleDecimalInput(e, c.key);
                                } else {
                                  handleIntegerInput(e, c.key);
                                }
                              }}
                              className="pl-4 pr-16"
                            />
                            {c.unit && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                {c.unit}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex items-start gap-2">
                          <div
                            className={`w-1 h-4 bg-linear-to-b ${colorGrad} rounded-full shrink-0 mt-0.5`}
                          ></div>
                          <p className="text-xs text-slate-500">
                            {c.type === "cost" ? "Cost" : "Benefit"} • Bobot{" "}
                            {(Number(c.weight) * 100).toFixed(0)}% •{" "}
                            {c.type === "cost"
                              ? "Semakin rendah semakin prioritas"
                              : "Semakin tinggi semakin prioritas"}
                          </p>
                        </div>

                        {errors[c.key] && isSubmitted && (
                          <p className="text-red-600 text-xs mt-1">
                            {c.name} wajib diisi
                          </p>
                        )}
                      </div>
                    );
                  })}
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
                      <strong>Cost</strong>: Semakin rendah nilai, semakin tinggi
                      prioritas
                      <br />
                      <strong>Benefit</strong>: Semakin tinggi nilai, semakin
                      tinggi prioritas
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
                  disabled={
                    (!selectedJalanId && !isEditMode) ||
                    addRoadMutation.isPending ||
                    updateRoadMutation.isPending
                  }
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

          <div className="mt-6 text-center text-sm text-slate-500 animate-fade-in delay-400">
            Semua field dengan tanda <span className="text-red-500">*</span>{" "}
            wajib diisi
          </div>
        </form>
      </main>

      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <button className="w-14 h-14 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl hover:scale-110 transition-all">
          <Info className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default InputFormPage;
