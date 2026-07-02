# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> dynamic demographics update and SGA calculation
- Location: tests/dashboard.spec.ts:4:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Risiko Moderate')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Risiko Moderate')

```

```yaml
- banner:
  - img
  - text: SmartBabyScale
  - navigation:
    - button "Dasbor Utama"
    - button "Riwayat Pasien"
    - button "Grafik Pertumbuhan"
    - button "Pengaturan"
  - text: "ID: NBY-2024-001 Usia Gestasi: 38 Minggu"
  - img
  - text: Aktif
  - button:
    - img
- main:
  - img
  - heading "Mode Demonstrasi (Raspberry Pi Tidak Terhubung)" [level=3]
  - paragraph: Sensor fisik tidak terdeteksi (data tidak mengalir). Dasbor menggunakan data simulasi dinamis.
  - heading "Visualisasi Postur Bayi (Kamera Timbangan)" [level=4]:
    - img
    - text: Visualisasi Postur Bayi (Kamera Timbangan)
  - text: LIVE FEED
  - img
  - paragraph: Umpan Kamera Raspberry Pi Aktif
  - text: Menganalisis Gerakan Bayi
  - heading "Berat Badan Saat Ini" [level=4]:
    - img
    - text: Berat Badan Saat Ini
  - text: 2.15 kg
  - paragraph: HX711 Load Cell (Sensor Timbangan)
  - heading "Panjang Badan" [level=4]:
    - img
    - text: Panjang Badan
  - text: 48.2 cm
  - paragraph: HC-SR04 Ultrasonik (Tinggi Otomatis)
  - heading "Grafik Tanda Vital (Sesi Aktif)" [level=4]
  - img
  - text: Detak Jantung (HR) 141 BPM
  - img
  - img
  - text: Saturasi Oksigen (SpO2) 96 %
  - img
  - img
  - text: Suhu Tubuh Kontak 36.9 °C
  - img
  - heading "Informasi Demografis & Riwayat Lahir" [level=4]
  - paragraph: Isi data di bawah ini untuk memperbarui prediksi stabilitas ML secara dinamis.
  - text: Pendaftaran Pasien Baru
  - textbox "Nama Lengkap Bayi"
  - textbox "Nomor Rekam Medis (MRN)"
  - textbox
  - combobox:
    - option "Laki-laki (L)" [selected]
    - option "Perempuan (P)"
  - textbox "Nama Orang Tua"
  - button "Daftarkan & Mulai Monitoring"
  - text: Berat Lahir (grams) 2100 g
  - spinbutton: "2100"
  - text: Usia Gestasi (Minggu) 38 Minggu
  - slider: "38"
  - text: Apgar Score (Menit ke-5)
  - combobox:
    - option "0 (Nilai Apgar)"
    - option "1 (Nilai Apgar)"
    - option "2 (Nilai Apgar)"
    - option "3 (Nilai Apgar)"
    - option "4 (Nilai Apgar)"
    - option "5 (Nilai Apgar)" [selected]
    - option "6 (Nilai Apgar)"
    - option "7 (Nilai Apgar)"
    - option "8 (Nilai Apgar)"
    - option "9 (Nilai Apgar)"
    - option "10 (Nilai Apgar)"
  - text: "Klasifikasi Kurva Fenton: SGA (Small for Gestational Age)"
  - heading "Analisis Risiko SNAPPE-II" [level=4]
  - text: "15"
  - paragraph: Skor Keparahan Klinis
  - text: "Risiko Sedang Rekomendasi Imunisasi:"
  - img
  - text: "LAYAK IMUNISASI (Stabil) Probabilitas Ketidakstabilan (SVM): 38.5%"
  - progressbar
  - img
  - strong: "Peringatan Akurasi Model (0/20):"
  - text: Butuh monitoring lebih lama (minimal 20 detik) untuk mencapai akurasi prediksi ML 95%.
  - heading "Indikator Kritis Bedside" [level=4]
  - text: Suhu Tubuh (36.9°C) Normal SpO2 (96%) Stabil Detak Jantung (141 BPM) Normal
  - heading "Wawasan Klinis SmartBabyScale" [level=4]:
    - img
    - text: Wawasan Klinis SmartBabyScale
  - strong: "Analisis Sesi:"
  - text: Usia gestasi 38 minggu dengan berat lahir 2100g (SGA). Detak jantung 141 BPM dan saturasi SpO2 96% menunjukkan kondisi yang relatif stabil dan tenang.
  - strong: "Rekomendasi Imunisasi:"
  - text: Bayi stabil. Clearance imunisasi dapat disetujui untuk vaksin hepatitis B lahir atau polio sesuai jadwal.
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // ponytail: Test the minimum required demographics input flow and dynamic SGA update
  4  | test('dynamic demographics update and SGA calculation', async ({ page }) => {
  5  |   // 1. Navigate to the dashboard
  6  |   await page.goto('/');
  7  |   
  8  |   // Verify main timbangan connection alert is visible (defaults to Demo mode when disconnected)
  9  |   await expect(page.locator('text=Mode Demonstrasi (Raspberry Pi Tidak Terhubung)')).toBeVisible();
  10 | 
  11 |   // 2. Test Birth Weight input
  12 |   const weightInput = page.locator('input[type="number"]');
  13 |   await expect(weightInput).toHaveValue('3100'); // Check default value
  14 |   
  15 |   // 3. Test Gestational Age input
  16 |   const gaSlider = page.locator('input[type="range"]');
  17 |   await expect(gaSlider).toHaveValue('38'); // Check default value
  18 |   
  19 |   // Verify default Fenton curve text (should be normal weight-for-age)
  20 |   await expect(page.locator('text=Berat Sesuai Usia Kehamilan')).toBeVisible();
  21 | 
  22 |   // 4. Change Gestational Age and Birth Weight to trigger SGA (Small for Gestational Age)
  23 |   // For 38 weeks, a birth weight of 2100g is < 10th percentile (SGA)
  24 |   await weightInput.fill('2100');
  25 |   
  26 |   // Verify the UI dynamically updates to show SGA status
  27 |   await expect(page.locator('text=SGA (Small for Gestational Age)')).toBeVisible();
  28 | 
  29 |   // 5. Test Apgar Score selection dropdown
  30 |   const apgarSelect = page.locator('select').nth(1);
  31 |   await expect(apgarSelect).toHaveValue('9'); // Check default value
  32 |   
  33 |   // Change Apgar to 5 (critical threshold)
  34 |   await apgarSelect.selectOption('5');
  35 |   await expect(apgarSelect).toHaveValue('5');
  36 | 
  37 |   // Verify the SNAPPE-II Risk Score and ML Clearance panel update appropriately
  38 |   // A low Apgar score increases SNAPPE-II severity
  39 |   const snappeScore = page.locator('text=Skor Keparahan Klinis');
  40 |   await expect(snappeScore).toBeVisible();
  41 |   
  42 |   // Verify that Demo mode calculations actually run
  43 |   // The risk score should update to be > 15
> 44 |   await expect(page.locator('text=Risiko Moderate')).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  45 | });
  46 | 
```