# Platform Admin Setup Guide

## Overview
The platform now supports platform administrator accounts with dedicated access to the `/platform` dashboard for managing all tenants, features, billing, and system settings.

## Platform Admin Email
The platform admin email is configured in the environment variables:
- **Environment Variable**: `NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL=crscastillo@gmail.com`
- **Current Admin Email**: `crscastillo@gmail.com`

## How to Sign Up as Platform Admin

### Step 1: Go to Signup Page
Navigate to `{app-domain}/signup` (e.g., `http://localhost:3000/signup`)

### Step 2: Enter Platform Admin Email
When you enter the platform admin email (`crscastillo@gmail.com`) during signup:
- The system will automatically detect this is a platform admin account
- **No tenant creation step** - you'll skip the store setup entirely
- You'll get a different success message indicating platform admin account creation
- The email confirmation will redirect you to `/platform` instead of tenant dashboard

### Step 3: Email Confirmation
After entering your credentials:
1. Check your email for the confirmation link
2. Click the confirmation link
3. You'll be automatically redirected to `/platform` (the admin dashboard)

## Platform Admin Features

Once logged in, you'll have access to:

### 📊 Dashboard (`/platform`)
- Overview of all tenants
- System-wide metrics and statistics
- Recent activity across the platform

### 🏢 Tenant Management (`/platform/tenants`)
- View all tenant accounts
- Activate/deactivate tenants
- Access individual tenant details and metrics
- Monitor tenant performance and usage

### ⚡ Feature Flags (`/platform/features`)
- Manage platform-wide feature rollouts
- Create feature flags with rollout percentages
- Target specific tenant tiers
- Enable/disable features across the platform

### ⚙️ Platform Settings (`/platform/settings`)
- Configure platform-wide settings
- Manage security policies
- Set system limits and constraints
- Configure integrations

### 💳 Billing Management (`/platform/billing`)
- Manage subscription plans
- Configure Stripe integration
- Monitor revenue and billing metrics
- Set up pricing tiers

## Authentication Flow

### For Platform Admin:
1. **Signup**: Email detection → Skip tenant creation → Email confirmation → Redirect to `/platform`
2. **Login**: Standard login → Middleware detects admin email → Access to `/platform`
3. **Protection**: Middleware automatically protects `/platform` routes - only admin email can access

### For Regular Users:
1. **Signup**: Email entry → Tenant creation → Email confirmation → Redirect to tenant dashboard
2. **Login**: Standard login → Redirect to tenant-specific dashboard
3. **Protection**: Cannot access `/platform` routes - will get "Unauthorized Access" page

## Security Notes

- Platform admin access is controlled by the `PLATFORM_ADMIN_EMAIL` environment variable
- Middleware automatically protects all `/platform` routes
- Non-admin users attempting to access `/platform` are redirected to `/unauthorized`
- The admin email check is case-insensitive for better UX

## Development vs Production

- **Development**: Use `http://localhost:3000/signup` and `http://localhost:3000/platform`
- **Production**: Use your production domain (e.g., `https://aluro.shop/signup` and `https://aluro.shop/platform`)

The environment variables ensure the same admin email works across all environments.