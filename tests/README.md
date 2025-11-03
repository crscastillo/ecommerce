# Playwright E2E Tests

This directory contains end-to-end tests for the e-commerce platform using Playwright.

## Test Structure

```
tests/
├── auth/                    # Authentication tests
│   ├── signup.spec.ts      # User signup tests
│   ├── login.spec.ts       # User login tests
│   └── logout.spec.ts      # User logout tests
├── pages/                   # Page Object Models
│   ├── SignupPage.ts       # Signup page actions
│   ├── LoginPage.ts        # Login page actions
│   └── AdminPage.ts        # Admin page actions
├── helpers/                 # Test utilities
│   └── testData.ts         # Test data generators
└── fixtures/                # Test fixtures (future)
```

## Running Tests

### All Tests
```bash
npm test                    # Run all tests headless
npm run test:ui            # Run with Playwright UI mode
npm run test:headed        # Run with browser visible
npm run test:debug         # Run in debug mode
```

### Specific Browser
```bash
npm run test:chromium      # Run in Chromium only
npm run test:firefox       # Run in Firefox only
npm run test:webkit        # Run in WebKit (Safari) only
```

### Specific Test Suite
```bash
npm run test:auth          # Run only authentication tests
npx playwright test tests/auth/signup.spec.ts  # Run specific file
```

### View Test Report
```bash
npm run test:report        # Open HTML test report
```

## Test Configuration

Configuration is in `playwright.config.ts`:
- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

## Writing Tests

### Page Object Pattern

We use the Page Object Model for maintainability:

```typescript
import { LoginPage } from '../pages/LoginPage';

test('example', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password');
});
```

### Test Data Generation

Use helpers for generating test data:

```typescript
import { generateTestUser } from '../helpers/testData';

const user = generateTestUser();
// { email: 'test.1234567890.1@playwright.test', password: 'randomPassword' }
```

## Authentication Tests

### Signup Tests (`signup.spec.ts`)
- ✅ Display signup form
- ✅ Successful signup with valid credentials
- ✅ Error handling for invalid email
- ✅ Error handling for weak/short passwords
- ✅ Prevent duplicate email registration
- ✅ Navigation to login page
- ✅ Form validation on empty submission

### Login Tests (`login.spec.ts`)
- ✅ Display login form
- ✅ Successful login with valid credentials
- ✅ Error with invalid email
- ✅ Error with wrong password
- ✅ Form validation on empty submission
- ✅ Navigation to signup/forgot password
- ✅ Session persistence after reload
- ✅ Session across multiple tabs
- ✅ Special characters in password

### Logout Tests (`logout.spec.ts`)
- ✅ Successful logout
- ✅ Session cleared after logout
- ✅ Prevent access to protected pages
- ✅ Remove authentication cookies
- ✅ Logout from all tabs
- ✅ Allow re-login after logout
- ✅ Handle multiple logout clicks

## Best Practices

1. **Use Page Objects**: Keep selectors and actions in page classes
2. **Auto-waiting**: Rely on Playwright's auto-waiting, avoid `waitForTimeout`
3. **Unique Data**: Generate unique test data for each test
4. **Isolated Tests**: Each test should be independent
5. **Clean Up**: Tests clean up their own data when possible
6. **Assertions**: Use Playwright's `expect` for better error messages
7. **Parallelization**: Tests run in parallel by default

## Debugging

### Debug a specific test:
```bash
npx playwright test tests/auth/login.spec.ts --debug
```

### View trace after test:
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Generate codegen:
```bash
npx playwright codegen http://localhost:3000
```

## CI/CD Integration

Tests automatically run on CI with:
- 2 retries for flaky tests
- Screenshot and video on failure
- HTML report generation
- Parallel execution disabled for stability

## Environment Variables

Create `.env.test` for test-specific configuration:

```env
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=Test123456!
TEST_USER_EMAIL=user@test.com
TEST_USER_PASSWORD=Test123456!
```

## Troubleshooting

### Tests failing with "Target closed"
- Ensure dev server is running: `npm run dev`
- Check `webServer` config in `playwright.config.ts`

### Flaky tests
- Use Playwright's auto-waiting instead of timeouts
- Check for race conditions
- Enable retries for CI environments

### Slow tests
- Run specific browser: `npm run test:chromium`
- Run specific suite: `npm run test:auth`
- Disable video recording for faster execution
