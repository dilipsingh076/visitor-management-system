import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VMS|Visitor/i);
  });

  test('can navigate to login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/login/);
  });

  test('demo login works', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'demo@example.com');
    await page.fill('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);
  });

  test('shows error for empty email', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/email|required/i)).toBeVisible();
  });
});
