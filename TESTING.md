# Quick Start - Playwright Tests

## First Time Setup

1. **Install dependencies** (already done):
```bash
npm install
```

2. **Start your dev server**:
```bash
npm run dev
```

## Run Tests

### Option 1: Run all tests (recommended for first run)
```bash
npm test
```

### Option 2: Run with UI Mode (interactive)
```bash
npm run test:ui
```
This opens an interactive interface where you can:
- See all tests
- Run tests one by one
- Watch tests in real-time
- Debug failures

### Option 3: Run with visible browser (debugging)
```bash
npm run test:headed
```

### Option 4: Run only authentication tests
```bash
npm run test:auth
```

## What Gets Tested

### ✅ Signup (`tests/auth/signup.spec.ts`)
- Form display
- Successful signup with valid credentials
- Email validation
- Password strength validation
- Duplicate email prevention
- Navigation to login

### ✅ Login (`tests/auth/login.spec.ts`)
- Form display
- Successful login
- Invalid credentials handling
- Session persistence
- Multi-tab session
- Special characters support

### ✅ Logout (`tests/auth/logout.spec.ts`)
- Successful logout
- Session clearing
- Protected route access prevention
- Cookie removal
- Multi-tab logout
- Re-login capability

## View Results

After tests run, view the HTML report:
```bash
npm run test:report
```

## Example Output

```
Running 27 tests using 5 workers

✓ [chromium] › auth/signup.spec.ts:8:3 › should display signup form (543ms)
✓ [chromium] › auth/signup.spec.ts:13:3 › should successfully sign up (1.2s)
✓ [chromium] › auth/login.spec.ts:8:3 › should display login form (432ms)
...

27 passed (2.5m)
```

## Troubleshooting

**Dev server not running?**
```bash
npm run dev
```

**Port 3000 already in use?**
Update `playwright.config.ts` with a different port.

**Tests timing out?**
The first run might be slower as Playwright sets up. Subsequent runs are faster.

## Next Steps

Check `tests/README.md` for:
- Detailed test documentation
- Writing new tests
- Best practices
- CI/CD integration
