"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Activity, Heart, Thermometer, Droplet, Video, AlertTriangle, TrendingUp, Weight, Ruler, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Tipe data untuk grafik
type VitalDataPoint = {
  time: string;
  value: number;
};

const calculateSGA = (bw: number, ga: number): boolean => {
  const limits: Record<number, number> = {
    24: 550, 25: 650, 26: 750, 27: 850, 28: 950, 29: 1050, 30: 1200, 31: 1350,
    32: 1500, 33: 1700, 34: 1900, 35: 2100, 36: 2300, 37: 2500, 38: 2700, 39: 2850, 40: 3000, 41: 3100
  };
  const week = Math.max(24, Math.min(41, ga));
  return bw < limits[week];
};

export default function Dashboard() {
  // Scale raw sensor data states (represented in kg/cm/BPM/percent/C)
  const [currentWeight, setCurrentWeight] = useState(2.15); // in kg
  const [currentLength, setCurrentLength] = useState(48.2); // in cm
  const [heartRate, setHeartRate] = useState(142);
  const [spO2, setSpO2] = useState(96);
  const [temperature, setTemperature] = useState(36.8);
  const [riskScore, setRiskScore] = useState(15);

  // Demographic / Intake inputs (defaults)
  const [birthWeight, setBirthWeight] = useState(3100); // grams
  const [gestationalAge, setGestationalAge] = useState(38); // weeks
  const [apgar, setApgar] = useState(9); // 5-minute Apgar score
  const [sga, setSga] = useState(false);

  // Edge AI Machine Learning Output states
  const [riskLevelLabel, setRiskLevelLabel] = useState("Sedang");
  const [mlProbability, setMlProbability] = useState(0.385); // 38.5%
  const [isUnstablePrediction, setIsUnstablePrediction] = useState(false);
  const [mlAccuracyWarning, setMlAccuracyWarning] = useState(true);
  const [packetCount, setPacketCount] = useState(0);

  const socketRef = useRef<any>(null);

  // Socket.io Connection & Bi-directional Event Handling
  useEffect(() => {
    // Fix for Vercel: Restrict to 'websocket' to prevent infinite XHR polling of 404 HTML pages on serverless
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      transports: ['websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 3000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      // Push initial demographics upon connection
      socket.emit('demographics_update', {
        birth_weight_g: birthWeight,
        gestational_age_weeks: gestationalAge,
        apgar_score_5min: apgar
      });
    });

    socket.on('sensor_update', (data: any) => {
      console.log('Received sensor update:', data);
      if (data.type === 'length') {
        setCurrentLength(data.value);
      } else if (data.type === 'prediction_update') {
        // Update live vitals sent from the python scale simulator
        if (data.vitals) {
          setCurrentWeight(data.vitals.weight_g / 1000.0); // convert grams to kg
          setCurrentLength(data.vitals.length_cm);
          setHeartRate(data.vitals.heart_rate_bpm);
          setSpO2(data.vitals.spo2_percent);
          setTemperature(data.vitals.temperature_celsius);
        }
        // Sync demographic variables from python edge state
        if (data.demographics) {
          setBirthWeight(data.demographics.birth_weight_g);
          setGestationalAge(data.demographics.gestational_age_weeks);
          setApgar(data.demographics.apgar_score_5min);
          setSga(data.demographics.sga === 1);
        }
        // Update predictions from models
        if (data.prediction) {
          setRiskScore(data.prediction.snappe_score);
          setRiskLevelLabel(data.prediction.risk_level);
          setMlProbability(data.prediction.svm.instability_probability);
          setIsUnstablePrediction(data.prediction.svm.outcome_prediction === 1);
          setMlAccuracyWarning(data.prediction.accuracy_warning);
          setPacketCount(data.prediction.packet_count);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update demographic values and emit demographics_update event to trigger re-prediction
  const handleDemographicChange = (field: string, value: number) => {
    let nextBW = birthWeight;
    let nextGA = gestationalAge;
    let nextApg = apgar;

    if (field === 'birth_weight_g') {
      nextBW = value;
      setBirthWeight(value);
    } else if (field === 'gestational_age_weeks') {
      nextGA = value;
      setGestationalAge(value);
    } else if (field === 'apgar_score_5min') {
      nextApg = value;
      setApgar(value);
    }

    const nextSGA = calculateSGA(nextBW, nextGA);
    setSga(nextSGA);

    // Emit to custom Node custom server, which relays to python edge tracker
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('demographics_update', {
        birth_weight_g: nextBW,
        gestational_age_weeks: nextGA,
        apgar_score_5min: nextApg
      });
    }
  };

  // Data historis untuk grafik - tetap stabil, hanya update saat ada data baru
  const [heartRateData, setHeartRateData] = useState<VitalDataPoint[]>(() => {
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

  // Risk level styling helpers
  const getRiskLevelStyles = (level: string) => {
    const norm = level.toLowerCase();
    if (norm === "rendah" || norm === "low") {
      return { color: "text-green-600", badge: "bg-green-500", variant: "default" as const };
    }
    if (norm === "sedang" || norm === "moderate") {
      return { color: "text-yellow-600", badge: "bg-yellow-500", variant: "secondary" as const };
    }
    return { color: "text-red-600", badge: "bg-red-500", variant: "destructive" as const };
  };

  const riskStyles = getRiskLevelStyles(riskLevelLabel);

  return (
    <div className="space-y-6">
      {/* Top Alert Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-900">Timbangan Pintar Terhubung</h3>
          <p className="text-sm text-blue-700">
            Letakkan bayi pada timbangan. Masukkan riwayat lahir di panel kanan untuk clearance vaksinasi instan.
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
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Visualisasi Postur Bayi (Kamera Timbangan)
                </CardTitle>
                <Badge variant="destructive" className="animate-pulse">
                  <span className="flex h-2 w-2 rounded-full bg-white mr-1.5"></span>
                  LIVE FEED
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Video className="h-12 w-12 text-gray-600 mx-auto" />
                      <p className="text-gray-400 text-xs">Umpan Kamera Raspberry Pi Aktif</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Menganalisis Gerakan Bayi</span>
                      </div>
                    </div>
                  </div>
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
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Weight className="h-4 w-4 text-blue-600" />
                  Berat Badan Saat Ini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-blue-600">
                    {currentWeight.toFixed(2)} <span className="text-xl">kg</span>
                  </div>
                  <p className="text-xs text-muted-foreground">HX711 Load Cell (Sensor Timbangan)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-purple-600" />
                  Panjang Badan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-purple-600">
                    {currentLength.toFixed(1)} <span className="text-xl">cm</span>
                  </div>
                  <p className="text-xs text-muted-foreground">HC-SR04 Ultrasonik (Tinggi Otomatis)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vital Signs Charts */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Grafik Tanda Vital (Sesi Aktif)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Heart Rate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium">Detak Jantung (HR)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-red-600">{Math.round(heartRate)}</span>
                    <span className="text-xs text-muted-foreground">BPM</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={50}>
                  <LineChart data={heartRateData}>
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                    <YAxis domain={[100, 200]} hide />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* SpO2 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium">Saturasi Oksigen (SpO2)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-blue-600">{Math.round(spO2)}</span>
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={50}>
                  <LineChart data={spO2Data}>
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                    <YAxis domain={[80, 100]} hide />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium">Suhu Tubuh Kontak</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-orange-600">{temperature.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">°C</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={50}>
                  <LineChart data={tempData}>
                    <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={1.5} dot={false} />
                    <YAxis domain={[34, 39]} hide />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Risk Analysis & Demographic Panel */}
        <div className="space-y-6">
          {/* Demographic Intake Panel */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Demografis & Riwayat Lahir</CardTitle>
              <p className="text-xs text-muted-foreground">Isi data di bawah ini untuk memperbarui prediksi stabilitas ML secara dinamis.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Birth Weight Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 flex justify-between">
                  <span>Berat Lahir (grams)</span>
                  <span className="text-blue-600 font-bold">{birthWeight} g</span>
                </label>
                <input 
                  type="number" 
                  min="400"
                  max="6000"
                  value={birthWeight}
                  onChange={(e) => handleDemographicChange('birth_weight_g', parseInt(e.target.value) || 3100)}
                  className="w-full bg-white border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              {/* Gestational Age Slider */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 flex justify-between">
                  <span>Usia Gestasi (Minggu)</span>
                  <span className="text-blue-600 font-bold">{gestationalAge} Minggu</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="range" 
                    min="22" 
                    max="42" 
                    value={gestationalAge} 
                    onChange={(e) => handleDemographicChange('gestational_age_weeks', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              {/* Apgar Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Apgar Score (Menit ke-5)</label>
                <select 
                  value={apgar} 
                  onChange={(e) => handleDemographicChange('apgar_score_5min', parseInt(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i} value={i}>{i} (Nilai Apgar)</option>
                  ))}
                </select>
              </div>

              {/* SGA Badge */}
              <div className="pt-2 flex items-center justify-between border-t text-xs">
                <span className="text-muted-foreground font-medium">Klasifikasi Kurva Fenton:</span>
                {sga ? (
                  <Badge variant="destructive" className="px-2 py-0.5">
                    SGA (Small for Gestational Age)
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500 px-2 py-0.5">
                    Berat Sesuai Usia Kehamilan
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SNAPPE-II Risk Assessment */}
          <Card className="border-t-4 border-t-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Analisis Risiko SNAPPE-II</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div>
                  <div className="text-4xl font-bold mb-0.5" style={{ color: riskStyles.color.replace('text-', '') }}>
                    {riskScore}
                  </div>
                  <p className="text-xs text-muted-foreground">Skor Keparahan Klinis</p>
                </div>
                
                <Badge variant={riskStyles.variant} className="text-xs px-3 py-0.5">
                  Risiko {riskLevelLabel}
                </Badge>

                {/* Machine Learning Output Status */}
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-700">Rekomendasi Imunisasi:</span>
                    {isUnstablePrediction ? (
                      <span className="flex items-center gap-1 font-bold text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        TUNDA (Instabilitas Vitals)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        LAYAK IMUNISASI (Stabil)
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-2xs text-muted-foreground">
                      <span>Probabilitas Ketidakstabilan (SVM):</span>
                      <span className="font-bold">{(mlProbability * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={mlProbability * 100} className="h-1.5" />
                  </div>
                </div>
              </div>

              {/* Accuracy Warning alert if packet count is low */}
              {mlAccuracyWarning && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-2xs text-yellow-800 leading-tight">
                    <strong>Peringatan Akurasi Model ({packetCount}/20):</strong> Butuh monitoring lebih lama (minimal 20 detik) untuk mencapai akurasi prediksi ML 95%.
                  </div>
                </div>
              )}

              {/* Risk Indicators */}
              <div className="pt-3 border-t">
                <h4 className="font-medium text-xs mb-2">Indikator Kritis Bedside</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-2xs">
                    <span>Suhu Tubuh ({temperature.toFixed(1)}°C)</span>
                    {temperature < 35.5 ? (
                      <Badge variant="destructive" className="py-0 px-1 text-3xs">Hipotermia</Badge>
                    ) : (
                      <Badge variant="secondary" className="py-0 px-1 text-3xs">Normal</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-2xs">
                    <span>SpO2 ({Math.round(spO2)}%)</span>
                    {spO2 < 90 ? (
                      <Badge variant="destructive" className="py-0 px-1 text-3xs">Hipoksia</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-500 py-0 px-1 text-3xs">Stabil</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-2xs">
                    <span>Detak Jantung ({Math.round(heartRate)} BPM)</span>
                    {(heartRate < 100 || heartRate > 180) ? (
                      <Badge variant="destructive" className="py-0 px-1 text-3xs">Abnormal</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-500 py-0 px-1 text-3xs">Normal</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights from LLM/RAG */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-indigo-600" />
                Wawasan Klinis SmartBabyScale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-2xs text-gray-700 leading-relaxed">
                <div className="bg-white rounded p-2 shadow-2xs">
                  <strong>Analisis Sesi:</strong> Usia gestasi {gestationalAge} minggu dengan berat lahir {birthWeight}g ({sga ? "SGA" : "Normal"}). Detak jantung {Math.round(heartRate)} BPM dan saturasi SpO2 {Math.round(spO2)}% menunjukkan kondisi yang {isUnstablePrediction ? "labil dan berisiko mengalami komplikasi." : "relatif stabil dan tenang."}
                </div>
                <div className="bg-white rounded p-2 shadow-2xs">
                  <strong>Rekomendasi Imunisasi:</strong> {isUnstablePrediction ? "Tunda pemberian imunisasi rutin saat ini. Observasi detak jantung dan berikan dukungan termal/oksigen tambahan. Laporkan ke dokter anak jika suhu terus di bawah 36°C." : "Bayi stabil. Clearance imunisasi dapat disetujui untuk vaksin hepatitis B lahir atau polio sesuai jadwal."}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}