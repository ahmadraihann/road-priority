// src/modules/dahsboard/views/index.tsx
import { ArrowRight, BarChart3, Map, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router";

export default function DashboardPage() {
  return (
    <div className="bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-32 md:pb-40">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight animate-slide-up">
              Sistem Pendukung Keputusan
              <br />
              <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Prioritas Perbaikan Jalan
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200">
              Tentukan prioritas perbaikan jalan dengan metode TOPSIS
              berdasarkan 6 kriteria utama untuk keputusan yang lebih objektif
              dan terukur
            </p>

            {/* CTA Button */}
            <Link to="/form">
              <Button
                size="lg"
                className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in delay-300"
              >
                Mulai Analisis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            {/* Stats */}
            <div className="mt-10 md:mt-16 grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-8 max-w-2xl mx-auto animate-fade-in delay-400">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">
                  6
                </div>
                <div className="text-sm text-slate-600">Kriteria Analisis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-1">
                  100%
                </div>
                <div className="text-sm text-slate-600">Objektif</div>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <div className="text-3xl md:text-4xl font-bold text-pink-600 mb-1">
                  Real-time
                </div>
                <div className="text-sm text-slate-600">Visualisasi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className=" md:p-8">
              <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Metode TOPSIS
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Analisis multi-kriteria yang terukur dan objektif untuk
                menentukan prioritas perbaikan jalan
              </p>
              <div className="mt-6 w-full h-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className=" md:p-8">
              <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Map className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Visualisasi GIS
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Lihat hasil prioritas langsung di peta dengan color coding yang
                jelas dan intuitif
              </p>
              <div className="mt-6 w-full h-1 bg-linear-to-r from-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className=" md:p-8">
              <div className="w-14 h-14 bg-linear-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Cepat & Mudah
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Interface yang intuitif dan user-friendly untuk analisis yang
                efisien dan cepat
              </p>
              <div className="mt-6 w-full h-1 bg-linear-to-r from-pink-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Criteria Overview Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="text-center pb-6 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            6 Kriteria Penilaian
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Sistem menganalisis berdasarkan kriteria yang komprehensif dan
            terbobot
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Kondisi Fisik (PCI)",
              weight: "30%",
              type: "Cost",
              color: "from-red-500 to-orange-500",
            },
            {
              name: "Volume Lalu Lintas",
              weight: "25%",
              type: "Benefit",
              color: "from-orange-500 to-amber-500",
            },
            {
              name: "Tingkat Keselamatan",
              weight: "15%",
              type: "Cost",
              color: "from-amber-500 to-yellow-500",
            },
            {
              name: "Estimasi Biaya",
              weight: "12%",
              type: "Cost",
              color: "from-yellow-500 to-lime-500",
            },
            {
              name: "Fungsi Jaringan",
              weight: "10%",
              type: "Cost",
              color: "from-lime-500 to-green-500",
            },
            {
              name: "Dampak Penduduk",
              weight: "8%",
              type: "Benefit",
              color: "from-green-500 to-emerald-500",
            },
          ].map((criteria, index) => (
            <div
              key={index}
              className="relative bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 group border border-slate-200"
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full bg-linear-to-b ${criteria.color} rounded-l-xl`}
              ></div>
              <div className="pl-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {criteria.type}
                  </span>
                  <span
                    className={`text-sm font-bold bg-linear-to-r ${criteria.color} bg-clip-text text-transparent`}
                  >
                    {criteria.weight}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900">
                  {criteria.name}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <Card className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 overflow-hidden">
            <CardContent className="p-6 md:p-12 text-center relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                ></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Siap untuk menganalisis prioritas perbaikan jalan?
                </h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Mulai sekarang dan dapatkan hasil analisis yang objektif dan
                  terukur
                </p>
                <Link to="/form">
                  <Button
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-slate-50 px-8 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Mulai Analisis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
