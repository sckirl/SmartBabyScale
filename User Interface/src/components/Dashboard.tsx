"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Activity, Heart, Thermometer, Droplet, Video, AlertTriangle, TrendingUp, Weight, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Tipe data untuk grafik
type VitalDataPoint = {
  time: string;
  value: number;
};

export default function Dashboard() {
  // Mock real-time data - in production, this would come from sensors
  const [currentWeight, setCurrentWeight] = useState(2.15);
  const [currentLength, setCurrentLength] = useState(48.2);
  const [heartRate, setHeartRate] = useState(142);
  const [spO2, setSpO2] = useState(96);
  const [temperature, setTemperature] = useState(36.8);
  const [riskScore, setRiskScore] = useState(15);

  // Socket.io Connection for Real-time Python Data
  useEffect(() => {
    const socket = io();

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('sensor_update', (data: any) => {
      console.log('Received sensor update:', data);
      if (data.type === 'length') {
        setCurrentLength(data.value);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Data historis untuk grafik - tetap stabil, hanya update saat ada data baru
  const [heartRateData, setHeartRateData] = useState<VitalDataPoint[]>(() => {
    // Inisialisasi data awal dengan baseline yang konsisten
    const now = Date.now();
    return Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now - (19 - i) * 2000).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      value: 142 + Math.sin(i * 0.3) * 3
    }));
  });

  const [spO2Data, setSpO2Data] = useState<VitalDataPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now - (19 - i) * 2000).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      value: 96 + Math.sin(i * 0.4) * 1.5
    }));
  });

  const [tempData, setTempData] = useState<VitalDataPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now - (19 - i) * 2000).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      value: 36.8 + Math.sin(i * 0.2) * 0.15
    }));
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      // Update nilai real-time saat ini
      const newHR = Math.max(120, Math.min(160, heartRate + (Math.random() - 0.5) * 4));
      const newSpO2 = Math.max(92, Math.min(100, spO2 + (Math.random() - 0.5) * 2));
      const newTemp = Math.max(36.0, Math.min(38.0, temperature + (Math.random() - 0.5) * 0.2));

      setHeartRate(newHR);
      setSpO2(newSpO2);
      setTemperature(newTemp);

      // Update data grafik - tambahkan point baru dan hapus yang paling lama
      setHeartRateData(prev => [...prev.slice(1), { time: timeLabel, value: newHR }]);
      setSpO2Data(prev => [...prev.slice(1), { time: timeLabel, value: newSpO2 }]);
      setTempData(prev => [...prev.slice(1), { time: timeLabel, value: newTemp }]);
    }, 2000); // Update setiap 2 detik

    return () => clearInterval(interval);
  }, [heartRate, spO2, temperature]);

  // Risk level determination
  const getRiskLevel = (score: number) => {
    if (score < 10) return { level: "Rendah", color: "bg-green-500", variant: "default" as const };
    if (score < 20) return { level: "Sedang", color: "bg-yellow-500", variant: "secondary" as const };
    return { level: "Tinggi", color: "bg-red-500", variant: "destructive" as const };
  };

  const risk = getRiskLevel(riskScore);

  return (
    <div className="space-y-6">
      {/* Top Alert Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-900">Sistem Pemantauan Aktif</h3>
          <p className="text-sm text-blue-700">
            Timbangan pintar IoT terhubung. Data antropometri dan tanda vital diperbarui secara real-time.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Video Feed & Anthropometry */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Video Feed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Umpan Video Langsung (Raspi Cam)
                </CardTitle>
                <Badge variant="destructive" className="animate-pulse">
                  <span className="flex h-2 w-2 rounded-full bg-white mr-1.5"></span>
                  LIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                {/* Simulated camera feed */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Video className="h-16 w-16 text-gray-600 mx-auto" />
                      <p className="text-gray-400 text-sm">Pemantauan Postur & Pergerakan Bayi</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Rekaman Aktif</span>
                      </div>
                    </div>
                  </div>
                  {/* Simulated scan lines */}
                  <div className="absolute inset-0 opacity-20" 
                       style={{
                         backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                       }}>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anthropometry Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Weight className="h-5 w-5 text-blue-600" />
                  Berat Badan Real-time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-blue-600">
                    {currentWeight.toFixed(2)} <span className="text-2xl">kg</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Sensor: HX711 Load Cell</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600">Presisi: ±1 gram</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-purple-600" />
                  Panjang Badan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-purple-600">
                    {currentLength.toFixed(1)} <span className="text-2xl">cm</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Sensor: HC-SR04 Ultrasonik</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600">Akurasi: ±0.3 cm</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vital Signs Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Tanda Vital Real-time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Heart Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Detak Jantung (HR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">{Math.round(heartRate)}</span>
                    <span className="text-sm text-muted-foreground">BPM</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={heartRateData}>
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <YAxis domain={[120, 160]} hide />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-1">Sensor: GY-MAX30102</p>
              </div>

              {/* SpO2 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Saturasi Oksigen (SpO2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{Math.round(spO2)}</span>
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={spO2Data}>
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <YAxis domain={[90, 100]} hide />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-1">Sensor: GY-MAX30102</p>
              </div>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Suhu Tubuh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-600">{temperature.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">°C</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={tempData}>
                    <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={false} />
                    <YAxis domain={[36, 38]} hide />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-1">Sensor: MLX90614 Infrared</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Risk Analysis & AI Insights */}
        <div className="space-y-6">
          {/* SNAPPE-II Risk Assessment */}
          <Card className="border-t-4 border-t-yellow-500">
            <CardHeader>
              <CardTitle className="text-base">Analisis Risiko SNAPPE-II</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <div>
                  <div className="text-5xl font-bold mb-1" style={{ color: risk.color.replace('bg-', '') }}>
                    {riskScore}
                  </div>
                  <p className="text-sm text-muted-foreground">Skor Risiko</p>
                </div>
                
                <Badge variant={risk.variant} className="text-sm px-4 py-1">
                  Risiko {risk.level}
                </Badge>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Probabilitas</span>
                    <span className="font-medium">{(riskScore * 3.5).toFixed(1)}%</span>
                  </div>
                  <Progress value={riskScore * 3.5} className="h-2" />
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <h4 className="font-medium text-sm">Klasifikasi Model SVM</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Akurasi Model:</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Confidence Score:</span>
                    <span className="font-medium">87.3%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Waktu Prediksi:</span>
                    <span className="font-medium">2.3s</span>
                  </div>
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-3">Indikator Kritis</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Berat Badan</span>
                    <Badge variant="secondary" className="text-xs">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>SpO2</span>
                    <Badge variant="default" className="text-xs bg-green-500">Stabil</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Suhu</span>
                    <Badge variant="secondary" className="text-xs">Monitor</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Detak Jantung</span>
                    <Badge variant="default" className="text-xs bg-green-500">Normal</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights from LLM/RAG */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-indigo-600" />
                Wawasan Klinis EPOSREM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm mb-1">Analisis Saat Ini</h5>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Berdasarkan berat {currentWeight.toFixed(2)}kg dan suhu {temperature.toFixed(1)}°C, 
                        skor risiko SNAPPE-II berada pada level {risk.level.toLowerCase()}. 
                        SpO2 stabil pada {Math.round(spO2)}%, namun tren suhu memerlukan perhatian 
                        termal segera jika meningkat di atas 37.5°C.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm mb-1">Rekomendasi</h5>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Detak jantung dalam rentang normal (120-160 BPM). 
                        Lanjutkan pemantauan kontinyu. Pertimbangkan penyesuaian 
                        lingkungan termal jika suhu tubuh terus meningkat.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm mb-1">Tindakan Preventif</h5>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Model AI mendeteksi pola vital yang stabil. Rekomendasikan 
                        evaluasi rutin setiap 2 jam untuk memastikan kondisi tetap optimal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-indigo-200">
                  <div className="flex items-center justify-between text-xs text-indigo-700">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Ditenagai oleh LLM/RAG Engine
                    </span>
                    <span>Diperbarui: 2s lalu</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ringkasan Sesi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Durasi Pemantauan</span>
                <span className="font-medium">2j 34m</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Data Tercatat</span>
                <span className="font-medium">4,682 titik</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Alert Terkirim</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Koneksi Sensor</span>
                <span className="font-medium text-green-600">5/5 Aktif</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}