import { Bell, Database, Shield, Sliders, User, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl mb-2">Pengaturan Sistem</h1>
        <p className="text-gray-600">
          Konfigurasi perangkat, notifikasi, dan preferensi sistem
        </p>
      </div>

      {/* Device Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Konfigurasi Perangkat IoT
          </CardTitle>
          <CardDescription>
            Pengaturan koneksi dan kalibrasi sensor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="device-id">ID Perangkat</Label>
              <Input
                id="device-id"
                value="EPOSREM-IOT-001"
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connection-status">Status Koneksi</Label>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  Terhubung
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Uptime: 48h 23m
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Status Sensor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">HX711 Load Cell</span>
                <Badge variant="default" className="bg-green-500">Aktif</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">HC-SR04 Ultrasonik</span>
                <Badge variant="default" className="bg-green-500">Aktif</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">GY-MAX30102 (HR/SpO2)</span>
                <Badge variant="default" className="bg-green-500">Aktif</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">MLX90614 Infrared</span>
                <Badge variant="default" className="bg-green-500">Aktif</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Raspi Camera Module</span>
                <Badge variant="default" className="bg-green-500">Aktif</Badge>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Kalibrasi Sensor</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full md:w-auto">
                Kalibrasi Timbangan (HX711)
              </Button>
              <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-2">
                Kalibrasi Panjang (HC-SR04)
              </Button>
              <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-2">
                Reset Semua Sensor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Pengaturan Notifikasi & Alert
          </CardTitle>
          <CardDescription>
            Konfigurasi ambang batas dan notifikasi peringatan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alert Detak Jantung Tinggi</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi jika HR {">"} 160 BPM
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alert Detak Jantung Rendah</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi jika HR {"<"} 100 BPM
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alert SpO2 Rendah</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi jika SpO2 {"<"} 90%
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alert Suhu Abnormal</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi jika suhu {"<"} 36°C atau {">"} 37.5°C
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alert Risiko SNAPPE-II Tinggi</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi jika skor risiko {">"} 20
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifikasi Email</Label>
                <p className="text-sm text-muted-foreground">
                  Kirim alert ke email yang terdaftar
                </p>
              </div>
              <Switch />
            </div>
          </div>

          <div className="border-t pt-6">
            <Label htmlFor="email-recipients">Penerima Email Alert</Label>
            <Input
              id="email-recipients"
              type="email"
              placeholder="dokter@hospital.com"
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Model Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Pengaturan Model AI
          </CardTitle>
          <CardDescription>
            Konfigurasi model SVM dan LLM/RAG engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-version">Versi Model SVM</Label>
              <Select defaultValue="v2.1">
                <SelectTrigger id="model-version">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v2.1">v2.1 (Terbaru - 94.2% akurasi)</SelectItem>
                  <SelectItem value="v2.0">v2.0 (92.8% akurasi)</SelectItem>
                  <SelectItem value="v1.9">v1.9 (90.5% akurasi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inference-freq">Frekuensi Inferensi</Label>
              <Select defaultValue="10s">
                <SelectTrigger id="inference-freq">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5s">Setiap 5 detik</SelectItem>
                  <SelectItem value="10s">Setiap 10 detik</SelectItem>
                  <SelectItem value="30s">Setiap 30 detik</SelectItem>
                  <SelectItem value="60s">Setiap 1 menit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Wawasan AI Real-time</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan analisis LLM/RAG kontinyu
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode Verbose</Label>
                <p className="text-sm text-muted-foreground">
                  Tampilkan detail teknis prediksi model
                </p>
              </div>
              <Switch />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Informasi Model
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model Training Date:</span>
                  <span className="font-medium">15 Des 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training Dataset:</span>
                  <span className="font-medium">12,453 samples</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validation Accuracy:</span>
                  <span className="font-medium">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">F1 Score:</span>
                  <span className="font-medium">0.932</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Manajemen Data
          </CardTitle>
          <CardDescription>
            Pengaturan penyimpanan dan cadangan data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cadangan Otomatis</Label>
                <p className="text-sm text-muted-foreground">
                  Backup data setiap 24 jam
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention">Periode Retensi Data</Label>
              <Select defaultValue="90">
                <SelectTrigger id="retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 hari</SelectItem>
                  <SelectItem value="90">90 hari</SelectItem>
                  <SelectItem value="180">180 hari</SelectItem>
                  <SelectItem value="365">1 tahun</SelectItem>
                  <SelectItem value="unlimited">Tidak terbatas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <h4 className="font-medium">Aksi Data</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Ekspor Semua Data</Button>
              <Button variant="outline">Download Laporan</Button>
              <Button variant="destructive">Hapus Data Lama</Button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Data Points:</span>
                <span className="font-medium">1,247,562</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Size:</span>
                <span className="font-medium">142.3 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Backup:</span>
                <span className="font-medium">09 Jan 2026, 03:00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil Pengguna
          </CardTitle>
          <CardDescription>
            Informasi akun dan preferensi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" defaultValue="Dr. Sarah Wijaya" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
              <Input id="role" defaultValue="Dokter Neonatal" readOnly className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="sarah.wijaya@hospital.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" defaultValue="+62 812-3456-7890" />
            </div>
          </div>

          <div className="border-t pt-6">
            <Button>Simpan Perubahan</Button>
            <Button variant="outline" className="ml-2">Batal</Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Informasi Sistem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Versi EPOSREM</p>
              <p className="font-medium">v3.2.1</p>
            </div>
            <div>
              <p className="text-muted-foreground">Build</p>
              <p className="font-medium">2026.01.05</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lisensi</p>
              <p className="font-medium">Enterprise</p>
            </div>
            <div>
              <p className="text-muted-foreground">Support</p>
              <p className="font-medium">24/7 Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
