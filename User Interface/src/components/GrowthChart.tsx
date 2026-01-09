import { TrendingUp, Weight, Ruler, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function GrowthChart() {
  // Mock data untuk grafik pertumbuhan - 2 minggu terakhir
  const weightData = [
    { date: "25 Des", weight: 1.98, ideal: 2.0 },
    { date: "27 Des", weight: 2.01, ideal: 2.02 },
    { date: "29 Des", weight: 2.04, ideal: 2.04 },
    { date: "31 Des", weight: 2.06, ideal: 2.06 },
    { date: "02 Jan", weight: 2.08, ideal: 2.08 },
    { date: "04 Jan", weight: 2.10, ideal: 2.10 },
    { date: "06 Jan", weight: 2.12, ideal: 2.12 },
    { date: "08 Jan", weight: 2.14, ideal: 2.14 },
    { date: "09 Jan", weight: 2.15, ideal: 2.15 },
  ];

  const lengthData = [
    { date: "25 Des", length: 47.2, ideal: 47.5 },
    { date: "27 Des", length: 47.4, ideal: 47.6 },
    { date: "29 Des", length: 47.5, ideal: 47.7 },
    { date: "31 Des", length: 47.7, ideal: 47.8 },
    { date: "02 Jan", length: 47.8, ideal: 47.9 },
    { date: "04 Jan", length: 47.9, ideal: 48.0 },
    { date: "06 Jan", length: 48.0, ideal: 48.1 },
    { date: "08 Jan", length: 48.1, ideal: 48.2 },
    { date: "09 Jan", length: 48.2, ideal: 48.2 },
  ];

  const vitalTrendsData = [
    { date: "25 Des", hr: 138, spo2: 95, temp: 36.5 },
    { date: "27 Des", hr: 140, spo2: 96, temp: 36.6 },
    { date: "29 Des", hr: 142, spo2: 96, temp: 36.7 },
    { date: "31 Des", hr: 139, spo2: 97, temp: 36.6 },
    { date: "02 Jan", hr: 141, spo2: 96, temp: 36.7 },
    { date: "04 Jan", hr: 143, spo2: 95, temp: 36.8 },
    { date: "06 Jan", hr: 140, spo2: 96, temp: 36.7 },
    { date: "08 Jan", hr: 142, spo2: 97, temp: 36.8 },
    { date: "09 Jan", hr: 142, spo2: 96, temp: 36.8 },
  ];

  const riskTrendData = [
    { date: "25 Des", score: 18 },
    { date: "27 Des", score: 17 },
    { date: "29 Des", score: 16 },
    { date: "31 Des", score: 16 },
    { date: "02 Jan", score: 15 },
    { date: "04 Jan", score: 15 },
    { date: "06 Jan", score: 14 },
    { date: "08 Jan", score: 14 },
    { date: "09 Jan", score: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl mb-2">Grafik Pertumbuhan & Tren</h1>
        <p className="text-gray-600">
          Analisis tren antropometri dan tanda vital selama 2 minggu terakhir
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pertambahan Berat
            </CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+170g</div>
            <p className="text-xs text-muted-foreground">
              2 minggu terakhir
            </p>
            <Badge variant="default" className="mt-2 bg-green-500">
              Sesuai Target
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pertambahan Panjang
            </CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">+1.0cm</div>
            <p className="text-xs text-muted-foreground">
              2 minggu terakhir
            </p>
            <Badge variant="default" className="mt-2 bg-green-500">
              Normal
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata HR
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">141 BPM</div>
            <p className="text-xs text-muted-foreground">
              Range: 138-143
            </p>
            <Badge variant="default" className="mt-2 bg-green-500">
              Stabil
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tren Risiko
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">↓ 3 poin</div>
            <p className="text-xs text-muted-foreground">
              Dari 18 ke 15
            </p>
            <Badge variant="default" className="mt-2 bg-green-500">
              Membaik
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5 text-blue-600" />
            Grafik Berat Badan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[1.9, 2.2]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWeight)"
                name="Berat Aktual (kg)"
              />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="Target Ideal (kg)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Analisis:</strong> Pertumbuhan berat badan menunjukkan tren positif yang konsisten. 
              Peningkatan rata-rata 12g/hari sesuai dengan target untuk bayi dengan usia gestasi 38 minggu. 
              Lanjutkan pemantauan dan nutrisi saat ini.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Length Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-purple-600" />
            Grafik Panjang Badan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={lengthData}>
              <defs>
                <linearGradient id="colorLength" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[47, 49]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="length"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLength)"
                name="Panjang Aktual (cm)"
              />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="Target Ideal (cm)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Analisis:</strong> Pertambahan panjang badan dalam rentang normal untuk periode neonatal. 
              Pertumbuhan linier menunjukkan perkembangan skeletal yang sehat. 
              Tidak ada indikasi stunting atau kelainan pertumbuhan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            Tren Tanda Vital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vitalTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" domain={[130, 150]} />
              <YAxis yAxisId="right" orientation="right" domain={[90, 100]} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="hr"
                stroke="#ef4444"
                strokeWidth={2}
                name="HR (BPM)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="spo2"
                stroke="#3b82f6"
                strokeWidth={2}
                name="SpO2 (%)"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Detak Jantung</p>
              <p className="text-sm font-medium">Stabil pada 138-143 BPM</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Saturasi Oksigen</p>
              <p className="text-sm font-medium">Konsisten di atas 95%</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Suhu Tubuh</p>
              <p className="text-sm font-medium">Normal 36.5-36.8°C</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
            Tren Skor Risiko SNAPPE-II
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={riskTrendData}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 30]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#eab308"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRisk)"
                name="Skor Risiko"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-white transform rotate-180" />
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">Perbaikan Signifikan</h4>
                <p className="text-sm text-gray-700">
                  Skor risiko SNAPPE-II menurun dari 18 menjadi 15 dalam 2 minggu, menunjukkan respons 
                  positif terhadap intervensi medis. Tren penurunan menandakan stabilisasi kondisi neonatal. 
                  Model SVM memprediksi probabilitas komplikasi menurun sebesar 10.5%.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Percentiles */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>Persentil Pertumbuhan WHO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Berat Badan</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Persentil P50 (Median):</span>
                  <span className="font-medium">2.10 kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Berat Saat Ini:</span>
                  <span className="font-medium text-blue-600">2.15 kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Kategori:</span>
                  <Badge variant="default" className="bg-green-500">
                    P50-P75 (Normal)
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Panjang Badan</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Persentil P50 (Median):</span>
                  <span className="font-medium">48.0 cm</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Panjang Saat Ini:</span>
                  <span className="font-medium text-purple-600">48.2 cm</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Kategori:</span>
                  <Badge variant="default" className="bg-green-500">
                    P50-P75 (Normal)
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Interpretasi:</strong> Kedua parameter antropometri berada dalam persentil normal 
              menurut standar WHO untuk bayi dengan usia gestasi 38 minggu. Rasio berat/panjang optimal, 
              tidak ada indikasi malnutrisi atau pertumbuhan tidak proporsional.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}