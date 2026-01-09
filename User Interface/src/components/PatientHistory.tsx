import { Calendar, Download, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function PatientHistory() {
  const historicalRecords = [
    {
      id: 1,
      date: "2026-01-09",
      time: "14:30",
      weight: 2.15,
      length: 48.2,
      hr: 142,
      spo2: 96,
      temp: 36.8,
      risk: "Sedang",
      riskLevel: 15,
    },
    {
      id: 2,
      date: "2026-01-09",
      time: "12:00",
      weight: 2.14,
      length: 48.2,
      hr: 138,
      spo2: 97,
      temp: 36.6,
      risk: "Sedang",
      riskLevel: 14,
    },
    {
      id: 3,
      date: "2026-01-09",
      time: "09:30",
      weight: 2.13,
      length: 48.1,
      hr: 145,
      spo2: 95,
      temp: 36.9,
      risk: "Sedang",
      riskLevel: 16,
    },
    {
      id: 4,
      date: "2026-01-08",
      time: "18:00",
      weight: 2.12,
      length: 48.1,
      hr: 140,
      spo2: 96,
      temp: 36.7,
      risk: "Sedang",
      riskLevel: 14,
    },
    {
      id: 5,
      date: "2026-01-08",
      time: "14:30",
      weight: 2.10,
      length: 48.0,
      hr: 143,
      spo2: 97,
      temp: 36.8,
      risk: "Sedang",
      riskLevel: 15,
    },
  ];

  const getRiskBadgeVariant = (risk: string) => {
    if (risk === "Rendah") return "default";
    if (risk === "Sedang") return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Riwayat Pasien</h1>
          <p className="text-gray-600">
            Catatan lengkap pengukuran dan pemantauan bayi
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Ekspor Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">+12 minggu ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Berat
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.13 kg</div>
            <p className="text-xs text-muted-foreground">
              ↑ 0.15kg dari awal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alert Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 terselesaikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Skor Risiko Rata-rata
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.8</div>
            <p className="text-xs text-muted-foreground">Level sedang</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan Pengukuran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal & Waktu</TableHead>
                  <TableHead>Berat (kg)</TableHead>
                  <TableHead>Panjang (cm)</TableHead>
                  <TableHead>HR (BPM)</TableHead>
                  <TableHead>SpO2 (%)</TableHead>
                  <TableHead>Suhu (°C)</TableHead>
                  <TableHead>Skor Risiko</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">{record.date}</div>
                      <div className="text-xs text-muted-foreground">
                        {record.time}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.weight.toFixed(2)}
                    </TableCell>
                    <TableCell>{record.length.toFixed(1)}</TableCell>
                    <TableCell>{record.hr}</TableCell>
                    <TableCell>{record.spo2}</TableCell>
                    <TableCell>{record.temp.toFixed(1)}</TableCell>
                    <TableCell className="font-medium">
                      {record.riskLevel}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(record.risk)}>
                        {record.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Menampilkan 5 dari 248 catatan</span>
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm">
                Berikutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan Klinis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-l-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">09 Jan 2026, 14:30</span>
                <Badge variant="secondary">Dr. Sarah</Badge>
              </div>
              <p className="text-sm text-gray-700">
                Pemantauan rutin menunjukkan peningkatan berat badan yang
                konsisten. Tanda vital stabil. Lanjutkan protokol standar.
              </p>
            </div>

            <div className="border-l-4 border-l-yellow-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">08 Jan 2026, 18:00</span>
                <Badge variant="secondary">Dr. Ahmad</Badge>
              </div>
              <p className="text-sm text-gray-700">
                Suhu tubuh sedikit meningkat pada sore hari. Telah dilakukan
                penyesuaian lingkungan termal. Monitor berkelanjutan diperlukan.
              </p>
            </div>

            <div className="border-l-4 border-l-green-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">07 Jan 2026, 10:00</span>
                <Badge variant="secondary">Dr. Sarah</Badge>
              </div>
              <p className="text-sm text-gray-700">
                Respons positif terhadap intervensi nutrisi. SpO2 dan HR dalam
                rentang normal sepanjang sesi pemantauan 24 jam.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
