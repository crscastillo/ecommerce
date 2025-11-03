import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { AdminPage } from '../pages/AdminPage';
import { generateTestUser } from '../helpers/testData';

test.describe('User Signup', () => {
  let signupPage: SignupPage;
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    adminPage = new AdminPage(page);
    await signupPage.goto();
  });

  test('should display signup form', async ({ page }) => {
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.passwordInput).toBeVisible();
    await expect(signupPage.signupButton).toBeVisible();
  });

  test('should successfully sign up with valid credentials', async ({ page }) => {
    const user = generateTestUser();

    await signupPage.signup(user.email, user.password);
    await signupPage.expectSuccessfulSignup();

    // Verify we're logged in
    const isLoggedIn = await adminPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });

  test('should show error with invalid email format', async ({ page }) => {
    await signupPage.signup('invalid-email', 'Password123!');
    
    // Check for validation error (either inline or after submission)
    const emailField = signupPage.emailInput;
    const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
    
    if (!isInvalid) {
      // If no client-side validation, expect server error
      await signupPage.expectError();
    }
  });

  test('should show error with weak password', async ({ page }) => {
    const user = generateTestUser();
    
    await signupPage.signup(user.email, '123'); // Weak password
    
    // Either client-side validation or server error
    await expect(async () => {
      await signupPage.expectError();
    }).toPass({ timeout: 5000 });
  });

  test('should show error when password is too short', async ({ page }) => {
    const user = generateTestUser();
    
    await signupPage.signup(user.email, '12345'); // Too short
    await signupPage.expectError();
  });

  test('should not allow signup with existing email', async ({ page }) => {
    const user = generateTestUser();

    // First signup
    await signupPage.signup(user.email, user.password);
    await signupPage.expectSuccessfulSignup();

    // Logout if we're logged in
    if (await adminPage.isLoggedIn()) {
      await adminPage.logout();
    }

    // Try to signup again with same email
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    
    // Should show error about existing account
    await signupPage.expectError();
  });

  test('should navigate to login page from signup', async ({ page }) => {
    await signupPage.goToLogin();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle empty form submission', async ({ page }) => {
    await signupPage.signupButton.click();
    
    // Should have validation errors
    const emailValid = await signupPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    const passwordValid = await signupPage.passwordInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    
    expect(emailValid || passwordValid).toBeFalsy();
  });
});
