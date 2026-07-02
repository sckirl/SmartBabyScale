import { test, expect } from '@playwright/test';

test('Full Patient Flow UAT', async ({ page }) => {
  await page.goto('http://localhost:3777');
  
  // 1. Dashboard checks
  await expect(page.locator('.block >> text=Mode Demonstrasi')).toBeVisible();
  
  // Empty State checks in History and Growth Chart BEFORE patient is active
  await page.getByRole('navigation').getByRole('button', { name: 'Riwayat Pasien' }).click();
  await expect(page.locator('.block >> text=Belum ada data pasien')).toBeVisible();
  
  await page.getByRole('navigation').getByRole('button', { name: 'Grafik Pertumbuhan' }).click();
  await expect(page.locator('.block >> text=Belum ada data pasien')).toBeVisible();

  // 2. Register Patient Flow
  await page.getByRole('navigation').getByRole('button', { name: 'Dasbor Utama' }).click();
  
  await page.fill('input[placeholder="Nama Lengkap Bayi"]', 'Bayi Tes UAT');
  await page.fill('input[placeholder="Nomor Rekam Medis (MRN)"]', `UAT-${Date.now().toString().slice(-10)}`);
  
  await page.getByRole('button', { name: 'Daftarkan & Mulai Monitoring' }).click();

  // Verify successful registration by checking the Active Patient header
  await expect(page.locator('.block >> text=Pasien Aktif: Bayi Tes UAT')).toBeVisible();

  // 3. Verify Empty States Changed (Now they should complain about missing vital data, not missing patient)
  await page.getByRole('navigation').getByRole('button', { name: 'Riwayat Pasien' }).click();
  await expect(page.locator('.block >> text=Belum ada data vital')).toBeVisible();

  await page.getByRole('navigation').getByRole('button', { name: 'Grafik Pertumbuhan' }).click();
  await expect(page.locator('.block >> text=Persentil Pertumbuhan WHO')).toBeVisible();

  // 4. Change Patient back to null
  await page.getByRole('navigation').getByRole('button', { name: 'Dasbor Utama' }).click();
  await page.getByRole('button', { name: 'Ganti Pasien' }).click();
  await expect(page.locator('.block >> text=Pendaftaran Pasien Baru')).toBeVisible();
});
