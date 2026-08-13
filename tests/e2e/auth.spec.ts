import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[type="email"]', 'doctor@hospital.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button:has-text("Sign In")');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@hospital.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit form
    await page.click('button:has-text("Sign In")');

    // Expect error message
    const errorMessage = page.locator('text=Invalid credentials');
    await expect(errorMessage).toBeVisible();
  });

  test('should require email field', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without email
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Expect validation error
    const emailError = page.locator('text=Email is required');
    await expect(emailError).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'doctor@hospital.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');

    // Click logout
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });
});
