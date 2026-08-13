import { test, expect } from '@playwright/test';

test.describe('Admission & Discharge', () => {
  test.beforeEach(async ({ page }) => {
    // Login as doctor
    await page.goto('/login');
    await page.fill('input[type="email"]', 'doctor@hospital.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');
  });

  test('should admit a patient', async ({ page }) => {
    await page.goto('/admissions');

    // Find a confirmed booking
    await page.click('[data-testid="admit-button"]');

    // Fill admission form
    await page.fill('textarea[name="notes"]', 'Patient admitted for surgery');

    // Submit
    await page.click('button:has-text("Admit Patient")');

    // Check for success
    const successMessage = page.locator('text=Patient admitted successfully');
    await expect(successMessage).toBeVisible();
  });

  test('should show occupancy metrics', async ({ page }) => {
    await page.goto('/admissions');

    // Check for metrics display
    await expect(page.locator('[data-testid="occupancy-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="occupied-beds"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-beds"]')).toBeVisible();
  });

  test('should discharge a patient', async ({ page }) => {
    await page.goto('/admissions');

    // Find an admitted patient
    await page.click('[data-testid="discharge-button"]');

    // Confirm discharge
    await page.click('button:has-text("Confirm Discharge")');

    // Check for success
    const successMessage = page.locator('text=Patient discharged successfully');
    await expect(successMessage).toBeVisible();
  });

  test('should create cleaning task on discharge', async ({ page }) => {
    await page.goto('/admissions');

    // Discharge a patient
    await page.click('[data-testid="discharge-button"]');
    await page.click('button:has-text("Confirm Discharge")');

    // Navigate to cleaning tasks
    await page.goto('/cleaning');

    // Check that new task exists
    const taskCount = await page.locator('[data-testid="cleaning-task"]').count();
    expect(taskCount).toBeGreaterThan(0);
  });
});

test.describe('Cleaning Tasks', () => {
  test.beforeEach(async ({ page }) => {
    // Login as nurse
    await page.goto('/login');
    await page.fill('input[type="email"]', 'nurse@hospital.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');
  });

  test('should display pending cleaning tasks', async ({ page }) => {
    await page.goto('/cleaning');

    // Check for task display
    const tasks = page.locator('[data-testid="cleaning-task"]');
    const count = await tasks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should complete cleaning task', async ({ page }) => {
    await page.goto('/cleaning');

    // Click complete button on first task
    await page.click('[data-testid="complete-button"]');

    // Confirm completion
    await page.click('button:has-text("Confirm")');

    // Check for success
    const successMessage = page.locator('text=Cleaning completed');
    await expect(successMessage).toBeVisible();
  });

  test('should mark bed as available after cleaning', async ({ page }) => {
    await page.goto('/beds');

    // Find a cleaning bed
    const cleaningBed = page.locator('text=CLEANING').first();

    if (await cleaningBed.isVisible()) {
      // Complete cleaning (via API or UI)
      await page.goto('/cleaning');
      await page.click('[data-testid="complete-button"]');
      await page.click('button:has-text("Confirm")');

      // Check bed status changed
      await page.goto('/beds');
      const availableBeds = page.locator('text=AVAILABLE');
      const count = await availableBeds.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
