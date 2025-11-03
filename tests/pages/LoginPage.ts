import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly signupLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"], input[type="email"]').first();
    this.passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    this.loginButton = page.getByRole('button', { name: /log in|sign in/i });
    this.errorMessage = page.locator('[role="alert"], .error, .text-red-600');
    this.signupLink = page.getByRole('link', { name: /sign up|create account/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password|reset password/i });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectSuccessfulLogin() {
    // Wait for navigation to admin/dashboard
    await this.page.waitForURL(/\/admin|\/dashboard/, { timeout: 10000 });
    
    // Verify we're on an authenticated page
    await expect(this.page).toHaveURL(/\/admin|\/dashboard/);
  }

  async expectError(message?: string) {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.errorMessage).toContainText(message, { ignoreCase: true });
    }
  }

  async goToSignup() {
    await this.signupLink.click();
  }

  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}
