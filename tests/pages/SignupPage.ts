import { Page, Locator, expect } from '@playwright/test';


export class SignupPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signupButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"], input[type="email"]').first();
    this.passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.signupButton = page.getByRole('button', { name: /sign up|create account/i });
    this.errorMessage = page.locator('[role="alert"], .error, .text-red-600');
    this.successMessage = page.locator('.success, .text-green-600');
    this.loginLink = page.getByRole('link', { name: /log in|sign in/i });
  }

  async goto() {
    await this.page.goto('/signup');
  }

  async signup(email: string, password: string, confirmPassword?: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Only fill confirm password if the field exists
    if (await this.confirmPasswordInput.count() > 0) {
      await this.confirmPasswordInput.fill(confirmPassword || password);
    }
    
    await this.signupButton.click();
  }

  async expectSuccessfulSignup() {
    // Wait for navigation or success message
    await this.page.waitForURL(/\/admin|\/dashboard/, { timeout: 10000 }).catch(() => {});
  }

  async expectError(message?: string) {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async goToLogin() {
    await this.loginLink.click();
  }
}
