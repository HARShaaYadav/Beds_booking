import { test, expect } from '@playwright/test';

test.describe('Bed Booking', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'receptionist@hospital.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');
  });

  test('should display available beds', async ({ page }) => {
    await page.goto('/beds');

    // Wait for beds to load
    await page.waitForSelector('[data-testid="bed-card"]');

    // Check that beds are displayed
    const bedCards = page.locator('[data-testid="bed-card"]');
    const count = await bedCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter beds by type', async ({ page }) => {
    await page.goto('/beds');

    // Select ICU filter
    await page.selectOption('select[data-testid="bed-type-filter"]', 'ICU');

    // Wait for filtered results
    await page.waitForSelector('[data-testid="bed-card"]');

    // Check that only ICU beds are shown
    const bedCards = page.locator('[data-testid="bed-card"]');
    const firstCard = bedCards.first();
    await expect(firstCard).toContainText('ICU');
  });

  test('should lock bed successfully', async ({ page }) => {
    await page.goto('/beds');

    // Click lock button on first available bed
    await page.click('[data-testid="lock-button"]');

    // Confirm lock dialog
    await page.click('button:has-text("Confirm")');

    // Check for success message
    const successMessage = page.locator('text=Bed locked successfully');
    await expect(successMessage).toBeVisible();
  });

  test('should show lock timer', async ({ page }) => {
    await page.goto('/beds');

    // Lock a bed
    await page.click('[data-testid="lock-button"]');
    await page.click('button:has-text("Confirm")');

    // Check for timer display
    const timer = page.locator('[data-testid="lock-timer"]');
    await expect(timer).toBeVisible();
  });

  test('should release lock after timeout', async ({ page }) => {
    await page.goto('/beds');

    // Lock a bed
    await page.click('[data-testid="lock-button"]');
    await page.click('button:has-text("Confirm")');

    // Wait for lock to expire (test with shorter timeout)
    await page.waitForTimeout(65000); // 65 seconds for 1-minute lock

    // Check that bed is available again
    const bedStatus = page.locator('[data-testid="bed-status"]');
    await expect(bedStatus).toContainText('AVAILABLE');
  });

  test('should confirm booking', async ({ page }) => {
    await page.goto('/beds');

    // Lock a bed
    await page.click('[data-testid="lock-button"]');
    await page.click('button:has-text("Confirm")');

    // Fill booking form
    await page.fill('input[name="patientName"]', 'John Doe');
    await page.fill('input[name="patientPhone"]', '1234567890');

    // Submit booking
    await page.click('button:has-text("Confirm Booking")');

    // Check for success
    await page.waitForURL(/\/booking\/\w+/);
    expect(page.url()).toMatch(/\/booking\/\w+/);
  });

  test('should cancel locked booking', async ({ page }) => {
    await page.goto('/beds');

    // Lock a bed
    await page.click('[data-testid="lock-button"]');
    await page.click('button:has-text("Confirm")');

    // Cancel booking
    await page.click('[data-testid="cancel-button"]');
    await page.click('button:has-text("Yes, Cancel")');

    // Check for success message
    const successMessage = page.locator('text=Booking cancelled');
    await expect(successMessage).toBeVisible();
  });
});
