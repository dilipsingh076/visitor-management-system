import { test, expect, Page } from '@playwright/test';

async function loginAsResident(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'resident@example.com');
  await page.fill('input[name="password"]', 'demo123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
}

test.describe('Visitor Flow', () => {
  test('resident can navigate to invite page', async ({ page }) => {
    await loginAsResident(page);
    
    await page.getByRole('link', { name: /invite|new visitor/i }).click();
    await expect(page).toHaveURL(/invite/);
  });

  test('resident can fill invitation form', async ({ page }) => {
    await loginAsResident(page);
    await page.goto('/invite');

    await page.fill('input[name="visitorName"]', 'John Doe');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="purpose"]', 'Meeting');

    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/success|created|otp/i)).toBeVisible();
  });

  test('dashboard shows visitor stats', async ({ page }) => {
    await loginAsResident(page);
    
    await expect(page.getByText(/today|visitors|pending/i)).toBeVisible();
  });
});
