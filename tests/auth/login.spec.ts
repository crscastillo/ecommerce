import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AdminPage } from '../pages/AdminPage';
import { generateTestUser } from '../helpers/testData';

test.describe('User Login', () => {
  let loginPage: LoginPage;
  let signupPage: SignupPage;
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    signupPage = new SignupPage(page);
    adminPage = new AdminPage(page);
    await loginPage.goto();
  });

  test('should display login form', async ({ page }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // First create a user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await signupPage.expectSuccessfulSignup();

    // Logout
    await adminPage.logout();
    await adminPage.expectLoggedOut();

    // Now login with the created user
    await loginPage.login(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Verify we're on admin page
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should show error with invalid email', async ({ page }) => {
    await loginPage.login('nonexistent@test.com', 'wrongpassword');
    await loginPage.expectError();
  });

  test('should show error with wrong password', async ({ page }) => {
    // First create a user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await signupPage.expectSuccessfulSignup();
    await adminPage.logout();

    // Try to login with wrong password
    await loginPage.goto();
    await loginPage.login(user.email, 'WrongPassword123!');
    await loginPage.expectError();
  });

  test('should show error with empty credentials', async ({ page }) => {
    await loginPage.loginButton.click();
    
    // Should have validation errors
    const emailValid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    const passwordValid = await loginPage.passwordInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    
    expect(emailValid || passwordValid).toBeFalsy();
  });

  test('should navigate to signup page from login', async ({ page }) => {
    await loginPage.goToSignup();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Check if forgot password link exists
    const forgotPasswordVisible = await loginPage.forgotPasswordLink.isVisible().catch(() => false);
    
    if (forgotPasswordVisible) {
      await loginPage.goToForgotPassword();
      await expect(page).toHaveURL(/\/reset-password|\/forgot-password/);
    } else {
      test.skip();
    }
  });

  test('should persist login session after page reload', async ({ page, context }) => {
    // Create and login user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be logged in
    const isLoggedIn = await adminPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });

  test('should maintain session across new tabs', async ({ page, context }) => {
    // Create and login user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Open new tab
    const newPage = await context.newPage();
    await newPage.goto('/admin');
    await newPage.waitForLoadState('networkidle');

    // Should be logged in on new tab
    await expect(newPage).toHaveURL(/\/admin/);
    
    await newPage.close();
  });

  test('should handle special characters in password', async ({ page }) => {
    const user = {
      email: generateTestUser().email,
      password: 'P@ssw0rd!#$%^&*()',
    };

    // Signup with special characters password
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await signupPage.expectSuccessfulSignup();
    await adminPage.logout();

    // Login with same password
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await loginPage.expectSuccessfulLogin();
  });
});
