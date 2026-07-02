import { test, expect } from '@playwright/test';

test.describe('SmartBabyScale End-to-End Tests', () => {
  test('should load the dashboard and verify initial state', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main title exists (no spaces, matching Header)
    await expect(page.locator('text=SmartBabyScale').first()).toBeVisible();
    
    // Check if SNAPPE-II panel is there
    await expect(page.locator('text=Klinis Lanjutan (SNAPPE-II)')).toBeVisible();
  });

  test('should toggle Diaper Mode and calculate urine output correctly', async ({ page }) => {
    await page.goto('/');

    // Ensure the button exists and click it to toggle Diaper Mode
    const diaperModeToggle = page.locator('button', { hasText: '🧷 Mode Popok' });
    await diaperModeToggle.click();

    // The Diaper Mode panel should now be visible
    await expect(page.locator('text=🧷 Mode Popok Aktif')).toBeVisible();

    // 1. Input dry weight (first gram input)
    const dryWeightInput = page.locator('input[placeholder="gram"]').nth(0);
    await dryWeightInput.fill('20');

    // 2. Input wet weight (second gram input)
    const wetWeightInput = page.locator('input[placeholder="gram"]').nth(1);
    await wetWeightInput.fill('100');

    // 3. Input duration
    const durationInput = page.locator('input[placeholder="jam"]');
    await durationInput.fill('2');

    // Wait briefly for calculation effect
    await page.waitForTimeout(500);

    // 4. Verify calculation UI
    // Formula: (100 - 20) = 80mL. 
    await expect(page.locator('text=80 mL urin')).toBeVisible();
    
    // Check the mL/kg/jam text output, taking the first one to avoid strict mode violations
    await expect(page.locator('text=mL/kg/jam').first()).toBeVisible();
  });

  test('should update XGBoost probability when clinical factors change', async ({ page }) => {
    await page.goto('/');

    // Let the initial demo state settle
    await page.waitForTimeout(3000);

    // Record initial probability
    const probLocator = page.locator('text=Probabilitas Ketidakstabilan (XGBoost):').locator('..').locator('span.font-bold');
    const initialProbText = await probLocator.innerText();
    
    // Change a clinical factor: Apgar score -> < 7
    const apgarSelect = page.locator('label', { hasText: 'Apgar' }).locator('..').locator('select');
    await apgarSelect.selectOption('5');

    await page.waitForTimeout(3000);

    // Verify probability changed
    const newProbText = await probLocator.innerText();
    expect(newProbText).not.toBe(initialProbText);
  });
});
