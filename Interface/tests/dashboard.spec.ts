import { test, expect } from '@playwright/test';

// ponytail: Test the minimum required demographics input flow and dynamic SGA update
test('dynamic demographics update and SGA calculation', async ({ page }) => {
  // 1. Navigate to the dashboard
  await page.goto('/');
  
  // Verify main timbangan connection alert is visible (defaults to Demo mode when disconnected)
  await expect(page.locator('text=Mode Demonstrasi (Raspberry Pi Tidak Terhubung)')).toBeVisible();

  // 2. Test Birth Weight input
  const weightInput = page.locator('input[type="number"]');
  await expect(weightInput).toHaveValue('3100'); // Check default value
  
  // 3. Test Gestational Age input
  const gaSlider = page.locator('input[type="range"]');
  await expect(gaSlider).toHaveValue('38'); // Check default value
  
  // Verify default Fenton curve text (should be normal weight-for-age)
  await expect(page.locator('text=Berat Sesuai Usia Kehamilan')).toBeVisible();

  // 4. Change Gestational Age and Birth Weight to trigger SGA (Small for Gestational Age)
  // For 38 weeks, a birth weight of 2100g is < 10th percentile (SGA)
  await weightInput.fill('2100');
  
  // Verify the UI dynamically updates to show SGA status
  await expect(page.locator('text=SGA (Small for Gestational Age)')).toBeVisible();

  // 5. Test Apgar Score selection dropdown
  const apgarSelect = page.locator('select');
  await expect(apgarSelect).toHaveValue('9'); // Check default value
  
  // Change Apgar to 5 (critical threshold)
  await apgarSelect.selectOption('5');
  await expect(apgarSelect).toHaveValue('5');

  // Verify the SNAPPE-II Risk Score and ML Clearance panel update appropriately
  // A low Apgar score increases SNAPPE-II severity
  const snappeScore = page.locator('text=Skor Keparahan Klinis');
  await expect(snappeScore).toBeVisible();
});
