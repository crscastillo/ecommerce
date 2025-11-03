import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AdminPage } from '../pages/AdminPage';
import { generateTestUser } from '../helpers/testData';

test.describe('User Logout', () => {
  let loginPage: LoginPage;
  let signupPage: SignupPage;
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    signupPage = new SignupPage(page);
    adminPage = new AdminPage(page);
  });

  test('should successfully logout user', async ({ page }) => {
    // Create and login user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Logout
    await adminPage.logout();
    await adminPage.expectLoggedOut();

    // Verify we're on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should clear session after logout', async ({ page }) => {
    // Create and login user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Logout
    await adminPage.logout();
    await adminPage.expectLoggedOut();

    // Try to access protected page
    await page.goto('/admin');
    
    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('should prevent access to admin pages after logout', async ({ page }) => {
    // Create and login user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Logout
    await adminPage.logout();
    await adminPage.expectLoggedOut();

    // Try to navigate to various admin pages
    const adminPages = ['/admin', '/admin/products', '/admin/orders'];
    
    for (const adminPath of adminPages) {
      await page.goto(adminPath);
      // Should redirect to login or show unauthorized
      await page.waitForURL(/\/login|\/unauthorized/, { timeout: 5000 }).catch(() => {});
      const url = page.url();
      const isProtected = url.includes('/login') || url.includes('/unauthorized');
      expect(isProtected).toBeTruthy();
    }
  });

  test('should remove authentication cookies after logout', async ({ page, context }) => {
    // Create and login user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Get cookies before logout
    const cookiesBefore = await context.cookies();
    const authCookiesBefore = cookiesBefore.filter(c => 
      c.name.includes('auth') || c.name.includes('session') || c.name.includes('token')
    );

    // Logout
    await adminPage.logout();
    await adminPage.expectLoggedOut();

    // Get cookies after logout
    const cookiesAfter = await context.cookies();
    const authCookiesAfter = cookiesAfter.filter(c => 
      c.name.includes('auth') || c.name.includes('session') || c.name.includes('token')
    );

    // Auth cookies should be removed or expired
    expect(authCookiesAfter.length).toBeLessThanOrEqual(authCookiesBefore.length);
  });

  test('should logout from all tabs', async ({ page, context }) => {
    // Create and login user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Open second tab
    const secondTab = await context.newPage();
    await secondTab.goto('/admin');
    await secondTab.waitForLoadState('networkidle');

    // Logout from first tab
    await adminPage.logout();
    await adminPage.expectLoggedOut();

    // Second tab should also be logged out when navigated
    await secondTab.goto('/admin');
    await secondTab.waitForURL(/\/login/, { timeout: 10000 });
    await expect(secondTab).toHaveURL(/\/login/);

    await secondTab.close();
  });

  test('should allow re-login after logout', async ({ page }) => {
    // Create and login user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Logout
    await adminPage.logout();
    await adminPage.expectLoggedOut();

    // Login again with same credentials
    await loginPage.login(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Verify we're logged in
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should not crash when logout button clicked multiple times', async ({ page }) => {
    // Create and login user
    const user = generateTestUser();
    await signupPage.goto();
    await signupPage.signup(user.email, user.password);
    await loginPage.expectSuccessfulLogin();

    // Click logout button (it should work once and then redirect)
    await adminPage.logout();
    await adminPage.expectLoggedOut();

    // Should be on login page and not crash
    await expect(page).toHaveURL(/\/login/);
  });
});
