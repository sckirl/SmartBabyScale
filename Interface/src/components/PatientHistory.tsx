import { useState, useEffect } from "react";
import { Calendar, Download, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export default function PatientHistory({ activePatientId }: { activePatientId: number | null }) {
  const [history, setHistory] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activePatientId) return;
    
    setLoading(true);
    fetch(`/api/history?patientId=${activePatientId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistory(data.vitals);
          setPredictions(data.predictions);
        }
      })
      .finally(() => setLoading(false));
  }, [activePatientId]);

  if (!activePatientId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <FileText className="h-16 w-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-medium">Belum ada data pasien</h2>
        <p>Silakan daftar atau pilih pasien aktif di Dasbor Utama terlebih dahulu.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat data histori...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <FileText className="h-16 w-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-medium">Belum ada data vital</h2>
        <p>Pasien ini belum memiliki catatan pengukuran. Pastikan sensor terhubung.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Riwayat Pasien</h1>
          <p className="text-gray-600">Catatan pengukuran aktual dari database MySQL</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Catatan Pengukuran (60-detik interval)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu Rekam</TableHead>
                <TableHead>Berat (kg)</TableHead>
                <TableHead>Panjang (cm)</TableHead>
                <TableHead>HR (BPM)</TableHead>
                <TableHead>SpO2 (%)</TableHead>
                <TableHead>Suhu (°C)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.recorded_at).toLocaleString('id-ID')}</TableCell>
                  <TableCell>{(record.weight_grams / 1000).toFixed(2)}</TableCell>
                  <TableCell>{record.length_cm.toFixed(1)}</TableCell>
                  <TableCell>{Math.round(record.heart_rate_bpm)}</TableCell>
                  <TableCell>{Math.round(record.spo2_percent)}</TableCell>
                  <TableCell>{record.temperature_celsius.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
