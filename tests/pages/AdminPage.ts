import { Page, Locator, expect } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly userMenuButton: Locator;
  readonly logoutButton: Locator;
  readonly productsLink: Locator;
  readonly dashboardLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Common selectors for user menu/profile dropdown
    this.userMenuButton = page.locator('[aria-label*="user menu"], [aria-label*="profile"], button:has-text("Profile"), button:has-text("Account")').first();
    this.logoutButton = page.getByRole('button', { name: /log out|sign out/i });
    this.productsLink = page.getByRole('link', { name: /products/i }).first();
    this.dashboardLink = page.getByRole('link', { name: /dashboard/i }).first();
  }

  async goto() {
    await this.page.goto('/admin');
  }

  async logout() {
    // Try to find and click user menu/dropdown first
    const userMenuVisible = await this.userMenuButton.isVisible().catch(() => false);
    
    if (userMenuVisible) {
      await this.userMenuButton.click();
      await this.page.waitForTimeout(300); // Wait for dropdown animation
    }
    
    // Click logout button
    await this.logoutButton.click();
  }

  async expectLoggedOut() {
    // Should redirect to login page
    await this.page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(this.page).toHaveURL(/\/login/);
  }

  async expectLoggedIn() {
    // Should be on admin page
    await expect(this.page).toHaveURL(/\/admin/);
  }

  async isLoggedIn(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/admin') || url.includes('/dashboard');
  }
}
