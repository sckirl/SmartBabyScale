import { test, expect } from '@playwright/test';

// ponytail: One file, one test for the whole navigation flow. Avoids boilerplate.
test('full application navigation and component rendering UAT', async ({ page }) => {
  await page.goto('/');
  
  // 1. Dashboard
  await expect(page.locator('text=Mode Demonstrasi (Raspberry Pi Tidak Terhubung)')).toBeVisible();

  // 2. Patient History
  await page.getByRole('navigation').getByRole('button', { name: 'Riwayat Pasien' }).click();
  await expect(page.locator('text=Catatan lengkap pengukuran dan pemantauan bayi')).toBeVisible();
  
  // Verify History Data renders
  await expect(page.locator('text=Catatan Pengukuran')).toBeVisible();
  await expect(page.locator('text=Skor Risiko Rata-rata')).toBeVisible();

  // 3. Growth Chart
  await page.getByRole('navigation').getByRole('button', { name: 'Grafik Pertumbuhan' }).click();
  await expect(page.locator('text=Analisis tren antropometri dan tanda vital selama 2 minggu terakhir')).toBeVisible();
  
  // Verify charts mount
  await expect(page.locator('text=Persentil Pertumbuhan WHO')).toBeVisible();

  // 4. Settings
  await page.getByRole('navigation').getByRole('button', { name: 'Pengaturan' }).click();
  await expect(page.locator('text=Konfigurasi perangkat, notifikasi, dan preferensi sistem')).toBeVisible();
  
  // Verify specific settings fields
  await expect(page.locator('text=Konfigurasi Perangkat IoT')).toBeVisible();
  await expect(page.locator('text=ID Perangkat')).toBeVisible();
});
