/**
 * Test data generators and utilities
 */

let emailCounter = 0;

/**
 * Generate a unique test email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  emailCounter++;
  return `${prefix}.${timestamp}.${emailCounter}@playwright.test`;
}

/**
 * Generate a random password
 */
export function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Generate test user data
 */
export function generateTestUser() {
  return {
    email: generateTestEmail(),
    password: generatePassword(),
  };
}

/**
 * Wait for a specific time (use sparingly, prefer Playwright's auto-waiting)
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test user credentials for pre-seeded users
 */
export const TEST_USERS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Test123456!',
  },
  regular: {
    email: process.env.TEST_USER_EMAIL || 'user@test.com',
    password: process.env.TEST_USER_PASSWORD || 'Test123456!',
  },
};
