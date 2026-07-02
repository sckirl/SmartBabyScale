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

interface DashboardProps {
  activePatientId: number | null;
  setActivePatientId: (id: number | null) => void;
}

export default function Dashboard({ activePatientId, setActivePatientId }: DashboardProps) {
  // Scale raw sensor data states (represented in kg/cm/BPM/percent/C)
  const [currentWeight, setCurrentWeight] = useState(2.15); // in kg
  const [currentLength, setCurrentLength] = useState(48.2); // in cm
  const [heartRate, setHeartRate] = useState(142);
  const [spO2, setSpO2] = useState(96);
  const [temperature, setTemperature] = useState(36.8);
  const [riskScore, setRiskScore] = useState(15);

  // SNAPPE-II Clinical Variables
  const [apgar, setApgar] = useState(9); // 5-minute Apgar score
  const [meanBloodPressure, setMeanBloodPressure] = useState(35.0);
  const [lowestSerumPh, setLowestSerumPh] = useState(7.35);
  const [po2Fio2Ratio, setPo2Fio2Ratio] = useState(3.20);
  const [seizures, setSeizures] = useState(0);
  const [urineOutput, setUrineOutput] = useState(2.0);
  const [sga, setSga] = useState(false);

  // Mode Popok (Diaper Weighing) states
  const [diaperMode, setDiaperMode] = useState(false);
  const [diaperDryG, setDiaperDryG] = useState<number | "">("");
  const [diaperWetG, setDiaperWetG] = useState<number | "">("");
  const [diaperHours, setDiaperHours] = useState<number | "">(3);

  // Demographic / Intake inputs (defaults)
  const [birthWeight, setBirthWeight] = useState(3100); // grams
  const [gestationalAge, setGestationalAge] = useState(38); // weeks
  
  // Patient Intake States
  const [patientName, setPatientName] = useState("");
  const [intakeForm, setIntakeForm] = useState({
    fullName: "", mrn: "", dob: "", gender: "L", parentName: "", contactNumber: ""
  });

  // Edge AI Machine Learning Output states
  const [riskLevelLabel, setRiskLevelLabel] = useState("Sedang");
  const [mlProbability, setMlProbability] = useState(0.385); // 38.5%
  const [isUnstablePrediction, setIsUnstablePrediction] = useState(false);
  const [mlAccuracyWarning, setMlAccuracyWarning] = useState(true);
  const [packetCount, setPacketCount] = useState(0);

  // Compute urine output from diaper weights whenever diaper inputs change
  useEffect(() => {
    if (!diaperMode) return;
    const dry  = Number(diaperDryG);
    const wet  = Number(diaperWetG);
    const hrs  = Number(diaperHours);
    const babyKg = currentWeight; // currentWeight is already in kg
    if (!dry || !wet || wet < dry || !hrs || hrs <= 0 || babyKg <= 0) return;
    const computedMlKgHr = (wet - dry) / babyKg / hrs;
    setUrineOutput(computedMlKgHr);
    handleDemographicChange('urine_output_ml_kg_hr', computedMlKgHr);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaperMode, diaperDryG, diaperWetG, diaperHours, currentWeight]);

  const [isDemoMode, setIsDemoMode] = useState(true);
  const lastUpdateRef = useRef<number>(0);

  const socketRef = useRef<any>(null);

  // Socket.io Connection & Bi-directional Event Handling
  useEffect(() => {
    // =========================================================================
    // 🌐 CONNECTION POINT: FRONTEND DASHBOARD TO NODE.JS SERVER
    // =========================================================================
    // The Dashboard connects to the local Next.js server (which hosts the Socket.io hub).
    // The Raspberry Pi ALSO connects to that same Node.js hub. The hub relays data between them.
    // If NEXT_PUBLIC_SOCKET_URL is empty (""), it defaults to the current domain (e.g., localhost:3777).
    // Fix for Vercel: Restrict to 'websocket' to prevent infinite XHR polling of 404 HTML pages on serverless
    // =========================================================================
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
      lastUpdateRef.current = Date.now();
      setIsDemoMode(false);
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
          setMlProbability(data.prediction.xgboost.instability_probability);
          setIsUnstablePrediction(data.prediction.xgboost.outcome_prediction === 1);
          setMlAccuracyWarning(data.prediction.accuracy_warning);
          setPacketCount(data.prediction.packet_count);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update demographic values and emit demographics_update event to trigger re-prediction
  const handleDemographicChange = (field: string, value: any) => {
    let payload: any = {
      patient_id: activePatientId,
      birth_weight_g: birthWeight,
      gestational_age_weeks: gestationalAge,
      apgar_score_5min: apgar,
      mean_blood_pressure: meanBloodPressure,
      lowest_serum_ph: lowestSerumPh,
      po2_fio2_ratio: po2Fio2Ratio,
      seizures: seizures,
      urine_output_ml_kg_hr: urineOutput
    };

    if (field === 'birth_weight_g') {
      payload.birth_weight_g = value;
      setBirthWeight(value);
    } else if (field === 'gestational_age_weeks') {
      payload.gestational_age_weeks = value;
      setGestationalAge(value);
    } else if (field === 'apgar_score_5min') {
      payload.apgar_score_5min = value;
      setApgar(value);
    } else if (field === 'mean_blood_pressure') {
      payload.mean_blood_pressure = value;
      setMeanBloodPressure(value);
    } else if (field === 'lowest_serum_ph') {
      payload.lowest_serum_ph = value;
      setLowestSerumPh(value);
    } else if (field === 'po2_fio2_ratio') {
      payload.po2_fio2_ratio = value;
      setPo2Fio2Ratio(value);
    } else if (field === 'seizures') {
      payload.seizures = value;
      setSeizures(value);
    } else if (field === 'urine_output_ml_kg_hr') {
      payload.urine_output_ml_kg_hr = value;
      setUrineOutput(value);
    }

    const nextSGA = calculateSGA(payload.birth_weight_g, payload.gestational_age_weeks);
    setSga(nextSGA);

    // ponytail: One-liner debounce to prevent WebSocket flooding when dragging sliders
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('demographics_update', payload);
      }
    }, 300);
  };

  const registerPatient = async () => {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: intakeForm.fullName,
          mrn: intakeForm.mrn,
          dob: intakeForm.dob,
          gender: intakeForm.gender,
          birth_weight_g: birthWeight,
          gestational_age_weeks: gestationalAge,
          parent_name: intakeForm.parentName,
          contact_number: intakeForm.contactNumber
        })
      });
      const data = await res.json();
      if (data.success) {
        setActivePatientId(data.id);
        setPatientName(intakeForm.fullName);
        // Sync immediate ID to hardware
        if (socketRef.current) {
          socketRef.current.emit('demographics_update', {
            patient_id: data.id,
            birth_weight_g: birthWeight,
            gestational_age_weeks: gestationalAge,
            apgar_score_5min: apgar
          });
        }
      }
    } catch (e) {
      console.error("Failed to register patient", e);
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

  // Simulate real-time data updates and check demo mode
  useEffect(() => {
    const demoCheckInterval = setInterval(() => {
      if (Date.now() - lastUpdateRef.current > 5000) {
        setIsDemoMode(true);
      }
    }, 2000);

    const interval = setInterval(() => {
      if (!isDemoMode) return; // ponytail: simple guard avoids duplicating logic

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

    return () => {
      clearInterval(interval);
      clearInterval(demoCheckInterval);
    };
  }, [heartRate, spO2, temperature, isDemoMode]);

  // Fallback SNAPPE-II calculation for Demonstration Mode
  useEffect(() => {
    if (!isDemoMode) return;

    let score = 0;
    
    // 1. Birth Weight (g)
    if (birthWeight < 750) score += 17;
    else if (birthWeight >= 750 && birthWeight < 1000) score += 10;
        
    // 2. Small for Gestational Age (SGA)
    if (sga) score += 5;
        
    // 3. Apgar Score at 5 minutes
    if (apgar < 7) score += 18;
        
    // 4. Mean Blood Pressure (mmHg)
    if (meanBloodPressure < 20) score += 19;
    else if (meanBloodPressure >= 20 && meanBloodPressure < 30) score += 9;
        
    // 5. Lowest Temperature (Celsius)
    if (temperature < 35.0) score += 15;
    else if (temperature >= 35.0 && temperature <= 35.6) score += 8;
        
    // 6. PO2 / FiO2 Ratio
    if (po2Fio2Ratio < 0.3) score += 28;
    else if (po2Fio2Ratio >= 0.3 && po2Fio2Ratio < 1.0) score += 16;
    else if (po2Fio2Ratio >= 1.0 && po2Fio2Ratio < 2.5) score += 5;
        
    // 7. Lowest Serum pH
    if (lowestSerumPh < 7.10) score += 16;
    else if (lowestSerumPh >= 7.10 && lowestSerumPh < 7.20) score += 7;
        
    // 8. Multiple Seizures
    if (seizures === 1) score += 19;
        
    // 9. Urine Output (mL/kg/hour)
    if (urineOutput < 0.1) score += 18;
    else if (urineOutput >= 0.1 && urineOutput < 1.0) score += 5;

    setRiskScore(score);
    
    // Determine risk level based on score
    if (score < 15) setRiskLevelLabel('Low');
    else if (score >= 15 && score < 30) setRiskLevelLabel('Moderate');
    else setRiskLevelLabel('High');

    // Approximate XGBoost probability for Demo Mode
    const baseProb = score / 100.0;
    const approxProb = Math.min(Math.max(baseProb + (apgar < 7 ? 0.2 : 0) + (temperature < 36 ? 0.15 : 0), 0.05), 0.98);
    setMlProbability(approxProb);
    setIsUnstablePrediction(approxProb > 0.5);

  }, [isDemoMode, birthWeight, sga, apgar, meanBloodPressure, temperature, po2Fio2Ratio, lowestSerumPh, seizures, urineOutput]);

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
      {isDemoMode ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Mode Demonstrasi (Raspberry Pi Tidak Terhubung)</h3>
            <p className="text-sm text-yellow-700">
              Sensor fisik tidak terdeteksi (data tidak mengalir). Dasbor menggunakan data simulasi dinamis.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Timbangan Pintar Terhubung</h3>
            <p className="text-sm text-blue-700">
              Letakkan bayi pada timbangan. Masukkan riwayat lahir di panel kanan untuk clearance vaksinasi instan.
            </p>
          </div>
        </div>
      )}

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
              {!activePatientId ? (
                <div className="space-y-3 bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm font-medium mb-2 text-blue-800">Pendaftaran Pasien Baru</div>
                  <input type="text" placeholder="Nama Lengkap Bayi" value={intakeForm.fullName} onChange={e => setIntakeForm({...intakeForm, fullName: e.target.value})} className="w-full text-xs p-2 border rounded" />
                  <input type="text" placeholder="Nomor Rekam Medis (MRN)" value={intakeForm.mrn} onChange={e => setIntakeForm({...intakeForm, mrn: e.target.value})} className="w-full text-xs p-2 border rounded" />
                  <div className="flex gap-2">
                    <input type="date" value={intakeForm.dob} onChange={e => setIntakeForm({...intakeForm, dob: e.target.value})} className="w-1/2 text-xs p-2 border rounded" />
                    <select value={intakeForm.gender} onChange={e => setIntakeForm({...intakeForm, gender: e.target.value})} className="w-1/2 text-xs p-2 border rounded">
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                  <input type="text" placeholder="Nama Orang Tua" value={intakeForm.parentName} onChange={e => setIntakeForm({...intakeForm, parentName: e.target.value})} className="w-full text-xs p-2 border rounded" />
                  <button onClick={registerPatient} className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded mt-2 hover:bg-blue-700">Daftarkan & Mulai Monitoring</button>
                </div>
              ) : (
                <div className="bg-blue-100 text-blue-800 p-2 rounded text-sm font-medium flex justify-between items-center mb-4">
                  <span>Pasien Aktif: {patientName} (ID: {activePatientId})</span>
                  <button onClick={() => setActivePatientId(null)} className="text-xs underline text-blue-600">Ganti Pasien</button>
                </div>
              )}

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

              {/* SNAPPE-II Clinical Variables */}
              <div className="space-y-2 border-t pt-3 mt-3">
                <div className="text-sm font-bold text-gray-800">Klinis Lanjutan (SNAPPE-II)</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-gray-700 font-medium">Mean Blood Pressure (mmHg)</label>
                    <input type="number" value={meanBloodPressure} onChange={(e) => handleDemographicChange('mean_blood_pressure', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-700 font-medium">Lowest Serum pH</label>
                    <input type="number" step="0.01" value={lowestSerumPh} onChange={(e) => handleDemographicChange('lowest_serum_ph', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-700 font-medium">PO2/FiO2 Ratio</label>
                    <input type="number" step="0.1" value={po2Fio2Ratio} onChange={(e) => handleDemographicChange('po2_fio2_ratio', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    {/* ── Keluaran Urine / Mode Popok ── */}
                    <div className="flex items-center justify-between">
                      <label className="text-gray-700 font-medium">Keluaran Urine (mL/kg/jam)</label>
                      <button
                        onClick={() => {
                          setDiaperMode(m => !m);
                          setDiaperDryG("");
                          setDiaperWetG("");
                          setDiaperHours(3);
                        }}
                        className={`text-2xs font-bold px-2 py-0.5 rounded-full border transition-colors ${
                          diaperMode
                            ? "bg-cyan-600 text-white border-cyan-600"
                            : "bg-white text-cyan-700 border-cyan-400 hover:bg-cyan-50"
                        }`}
                      >
                        {diaperMode ? "🧷 Mode Popok Aktif" : "🧷 Mode Popok"}
                      </button>
                    </div>

                    {diaperMode ? (
                      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 space-y-3 text-xs">
                        <p className="text-cyan-800 font-medium text-2xs leading-snug">
                          Timbang popok di atas timbangan (tanpa bayi). 1&nbsp;g&nbsp;=&nbsp;1&nbsp;mL urin.
                        </p>

                        {/* Step 1 – dry diaper */}
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-700">① Popok Kering (sebelum dipakai)</label>
                          <div className="flex gap-2">
                            <input
                              type="number" step="1" min="0" placeholder="gram"
                              value={diaperDryG}
                              onChange={e => setDiaperDryG(e.target.value === "" ? "" : parseFloat(e.target.value))}
                              className="w-full bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <button
                              onClick={() => setDiaperDryG(Math.round(currentWeight * 1000))}
                              title="Ambil berat dari timbangan sekarang"
                              className="shrink-0 text-2xs bg-cyan-600 text-white rounded px-2 hover:bg-cyan-700 whitespace-nowrap"
                            >Ambil ⚖️</button>
                          </div>
                        </div>

                        {/* Step 2 – wet diaper */}
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-700">② Popok Basah (setelah dipakai)</label>
                          <div className="flex gap-2">
                            <input
                              type="number" step="1" min="0" placeholder="gram"
                              value={diaperWetG}
                              onChange={e => setDiaperWetG(e.target.value === "" ? "" : parseFloat(e.target.value))}
                              className="w-full bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <button
                              onClick={() => setDiaperWetG(Math.round(currentWeight * 1000))}
                              title="Ambil berat dari timbangan sekarang"
                              className="shrink-0 text-2xs bg-cyan-600 text-white rounded px-2 hover:bg-cyan-700 whitespace-nowrap"
                            >Ambil ⚖️</button>
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-700">③ Durasi Pemakaian (jam)</label>
                          <input
                            type="number" step="0.5" min="0.5" placeholder="jam"
                            value={diaperHours}
                            onChange={e => setDiaperHours(e.target.value === "" ? "" : parseFloat(e.target.value))}
                            className="w-full bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>

                        {/* Live result */}
                        {Number(diaperWetG) >= Number(diaperDryG) && Number(diaperDryG) > 0 && Number(diaperHours) > 0 && (
                          <div className="bg-white rounded p-2 border border-cyan-300 text-center space-y-0.5">
                            <div className="text-xs font-bold text-cyan-700">
                              {(Number(diaperWetG) - Number(diaperDryG)).toFixed(0)} mL urin
                            </div>
                            <div className="text-2xs text-gray-600">
                              → <span className="font-bold text-cyan-800">{urineOutput.toFixed(2)} mL/kg/jam</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="number" step="0.1"
                        value={urineOutput}
                        onChange={e => handleDemographicChange('urine_output_ml_kg_hr', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-gray-700 font-medium">Multiple Seizures</label>
                    <select value={seizures} onChange={(e) => handleDemographicChange('seizures', parseInt(e.target.value))} className="w-full bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value={0}>Tidak Ada (0)</option>
                      <option value={1}>Ada (1)</option>
                    </select>
                  </div>
                </div>
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
                      <span>Probabilitas Ketidakstabilan (XGBoost):</span>
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