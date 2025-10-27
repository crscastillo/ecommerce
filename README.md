# Multi-Tenant Ecommerce Platform

A powerful, scalable multi-tenant ecommerce platform built with Next.js, Supabase, and shadcn/ui. Create and manage multiple online stores with custom subdomains, all from a single codebase.

> **Status**: ✅ **Production Ready** - Core platform functionality complete with comprehensive admin panels (products, orders & settings), tenant management, theme customization, team management, demo mode for development, and robust database migrations.

## 🚀 Features

### Platform Features
- **Multi-Tenancy**: Each tenant gets their own subdomain (e.g., `store.yourdomain.com`)
- **Platform Landing Page**: Marketing site for tenant acquisition
- **Tenant Management**: Complete tenant onboarding and management system
- **Subdomain Routing**: Automatic subdomain detection and routing

### Store Features  
- **Complete Ecommerce**: Products, categories, cart, orders, customers
- **Product Management**: Full CRUD operations with bulk CSV import ([Import Guide](docs/admin-products-import.md))
- **Public Store**: Product catalog with search, filtering, and category browsing
- **Admin Dashboard**: Full-featured admin panel for store management
- **User Authentication**: Secure login/signup with Supabase Auth
- **Row Level Security**: Data isolation between tenants
- **Team Management**: Invite team members with role-based permissions
- **Responsive Design**: Mobile-first, beautiful UI with shadcn/ui

### Technical Features
- **Next.js 16**: Latest App Router with Server Components
- **TypeScript**: Full type safety throughout the application  
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Database Migrations**: Proper schema versioning with Supabase CLI
- **Middleware**: Smart routing between platform and tenant contexts
- **Edge Runtime**: Optimized for performance and scalability

## 🛠 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Deployment**: Vercel (recommended)

## � Documentation

- **[CSV Import Guide](docs/admin-products-import.md)** - Complete guide for bulk product imports with validation
- **Admin Panel** - Store management features and workflows (sections below)
- **API Reference** - Database operations and type definitions (generated from schema)
- **Deployment** - Production setup instructions (see Deployment section)

## �📋 Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- Domain for custom subdomains (optional for development)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ecommerce
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.local.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Setup

#### Option A: Using Supabase CLI (Recommended)

```bash
# Link to your Supabase project
npm run db:link

# Deploy migrations
npm run db:deploy

# Generate TypeScript types
npm run db:types
```

#### Option B: Manual Setup

1. Go to your Supabase Dashboard
2. Open SQL Editor
3. Copy and paste the contents of `supabase/migrations/20251022193455_initial_schema.sql`
4. Run the migration

### 4. Local Development

```bash
# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

**🧪 Testing Admin Features:**
```bash
# Demo mode (no database required)
http://localhost:3000/admin          # Demo dashboard
http://localhost:3000/admin/orders   # Demo orders interface

# With tenant setup (full functionality)
http://yourstore.localhost:3000/admin  # Real tenant admin
```

### 5. Test Multi-Tenancy (Optional)

Add to your `/etc/hosts` file:
```
127.0.0.1 teststore.localhost
```

Then access:
- `http://localhost:3000` - Platform homepage
- `http://teststore.localhost:3000` - Tenant store (after creating "teststore")

## 🏗 Architecture Overview

### Multi-Tenant Routing

The application uses Next.js middleware to handle intelligent routing:

```
yourdomain.com           → Platform landing page
store1.yourdomain.com    → Store 1's homepage  
store2.yourdomain.com    → Store 2's homepage
admin.yourdomain.com     → Platform admin (future)
```

### Database Schema

The database is designed with proper multi-tenancy and includes these core tables:

**Multi-Tenant Tables:**
- `tenants` - Store configurations and settings
- `products` & `product_variants` - Product catalog with variants
- `categories` - Hierarchical product organization
- `customers` - Customer management per tenant
- `orders` & `order_line_items` - Order processing and fulfillment
- `cart_items` - Shopping cart functionality
- `discounts` - Promotional discount system
- `tenant_users` - Team member access and permissions

**Security & Isolation:**
- All tenant data includes a `tenant_id` foreign key
- Row Level Security (RLS) policies ensure complete data isolation
- Proper foreign key relationships maintain data integrity
- Auto-generated TypeScript types from live database schema

### Key Components

- **Middleware** (`middleware.ts`): Subdomain detection and routing
- **Tenant Provider** (`src/lib/contexts/tenant-provider.tsx`): Tenant context management  
- **Conditional Layout** (`src/components/conditional-layout.tsx`): Platform vs Store layouts
- **Tenant Database** (`src/lib/supabase/tenant-database.ts`): Scoped database operations

## 📝 Database Migrations

This project uses Supabase CLI for proper database schema management.

### Available Commands

```bash
# Database Management
npm run db:start         # Start local Supabase (requires Docker)
npm run db:stop          # Stop local Supabase
npm run db:status        # Check database status
npm run db:reset         # Reset local database (⚠️ destructive)

# Migrations  
npm run db:migrate       # Apply migrations locally
npm run db:pull          # Pull schema from remote
npm run db:new-migration # Create new migration
npm run db:deploy        # Deploy migrations to remote

# Development
npm run db:seed          # Run seed data
npm run db:types         # Generate TypeScript types
npm run db:link          # Link to remote project
```

### Migration Workflow

1. **Create migration**: `npm run db:new-migration add_feature_name`
2. **Edit** the generated SQL file in `supabase/migrations/`
3. **Test locally**: `npm run db:reset` (applies all migrations)
4. **Deploy**: `npm run db:deploy`
5. **Update types**: `npm run db:types`

## 🏪 Creating Your First Store

### Signup Process (Updated Flow)

1. **Start the application**: `npm run dev`
2. **Visit**: `http://localhost:3000`
3. **Click "Get Started"** on the platform homepage
4. **Fill out the signup form**:
   - Email & password for your account
   - Store name and subdomain
   - Contact information
5. **Verify your email**: Check your inbox and click the verification link
6. **Complete tenant setup**: After verification, you'll be redirected to complete store setup
7. **Access your admin panel**: `http://your-subdomain.localhost:3000/admin`
8. **Access your store**: `http://your-subdomain.localhost:3000`

### Important Notes

- **Two-Phase Signup**: Account creation and tenant setup are now separate steps
- **Email Verification Required**: Users must verify email before creating their store
- **Admin Access**: Admin panel is only accessible via tenant subdomains
- **Authentication**: All admin routes require proper authentication and tenant access

## 🏢 Admin Panel Features

### Current Admin Functionality

**📊 Dashboard**
- Store overview and metrics
- Quick setup guide for new stores
- Recent activity and performance indicators

**🛍️ Product Management**
- **Products List**: View all products with search and filtering
- **Add Products**: Comprehensive product creation form
- **Product Actions**: Edit, delete, activate/deactivate products
- **Inventory Tracking**: Manage stock levels and SKUs
- **SEO Settings**: Meta titles and descriptions
- **Category Assignment**: Link products to categories

**📦 Order Management**
- **Orders Dashboard**: View all orders with comprehensive statistics
- **Order Filtering**: Filter by payment status, fulfillment status
- **Search Orders**: Search by order number, customer email, or name
- **Status Updates**: Update payment and fulfillment status inline
- **Order Details**: View complete order information including:
  - Customer details and contact information
  - Billing and shipping addresses
  - Order line items and pricing breakdown
  - Order notes and tags
- **Order Statistics**: Track total orders, pending payments, fulfilled orders, and total revenue

**⚙️ Settings Management**
- **Store Settings**: Configure store information, contact details, and business address
- **Store Configuration**: Set currency, timezone, tax rates, and operational preferences
- **Theme Customization**: Customize colors, fonts, logo, and branding elements
- **Team Management**: Invite users, manage roles (owner, admin, staff, viewer), and permissions
- **Security Settings**: View account information, manage subscription, and store deletion
- **Feature Toggles**: Enable/disable inventory tracking, backorders, auto-fulfillment, and notifications

**🔐 Access Control**
- Owner and admin role management
- Tenant-based access restrictions
- Secure authentication with Supabase Auth

### Admin Panel Access

**🏪 Proper Tenant Access (Recommended):**
```bash
# Access admin panel via tenant subdomain
http://yourstore.localhost:3000/admin        # Development  
https://yourstore.yourdomain.com/admin       # Production
```

**🧪 Demo Mode Access (Development Only):**
```bash  
# Direct access shows demo mode with sample interface
http://localhost:3000/admin                  # Demo mode - no real data
http://localhost:3000/admin/orders           # Demo orders interface
```

**📋 Available Admin Routes:**
```bash
/admin                    # Dashboard (protected - redirects to /login if not authenticated)
/admin/products          # Products listing  
/admin/products/new      # Add new product
/admin/orders            # Orders management
/admin/settings          # Store and system settings
```

**ℹ️ Access Notes:**
- **Production**: Always use tenant subdomains for real store data
- **Development**: Demo mode available for UI testing without database setup
- **Authentication**: Admin access requires owner or admin role permissions

### Coming Soon
- **Customer Management**: Customer profiles and history  
- **Categories Management**: Organize product categories
- **Analytics & Reports**: Sales and performance analytics
- **Payment Integration**: Stripe, PayPal, and other payment processors
- **Shipping Management**: Shipping zones, rates, and carrier integration

## 🔧 Configuration

### Domain Setup (Production)

Update the domains in `middleware.ts`:
```typescript
const mainDomains = ['localhost', 'yourdomain.com', 'yourdomain.vercel.app']
```

### Supabase Configuration

Key settings in your Supabase project:
- **Authentication**: Enable email signup, configure redirects
- **Database**: Ensure RLS is enabled
- **API**: Set up CORS for your domains

## 📁 Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Platform landing page
│   ├── signup/                    # Tenant signup flow
│   ├── login/                     # Platform login
│   ├── admin/                     # Admin panel routes
│   │   ├── layout.tsx             # Admin layout wrapper
│   │   ├── page.tsx               # Admin dashboard
│   │   ├── login/                 # Admin authentication
│   │   └── products/              # Product management
│   │       ├── page.tsx           # Products listing
│   │       └── new/               # Add new product
│   ├── auth/                      # Authentication routes
│   │   ├── callback/              # OAuth callback
│   │   └── signup/                # User registration
│   ├── setup/                     # Tenant setup completion
│   └── api/                       # API routes
│       └── tenants/               # Tenant management API
├── components/
│   ├── ui/                        # shadcn/ui components (Table, Select, etc.)
│   ├── admin/                     # Admin-specific components
│   └── conditional-layout.tsx     # Smart layout switcher
├── lib/
│   ├── supabase/                  # Supabase clients and utilities
│   ├── contexts/                  # React contexts (Tenant, Auth)
│   └── types/                     # TypeScript definitions
├── middleware.ts                  # Multi-tenant routing
supabase/
├── migrations/                    # Database migrations with RLS
├── seed.sql                       # Development seed data
└── config.toml                    # Supabase configuration
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Optional: Domain configuration
   NEXT_PUBLIC_APP_DOMAIN=yourdomain.com
   NEXT_PUBLIC_DEBUG_MIDDLEWARE=false
   ```
3. **Deploy** - Your platform will be available at `your-project.vercel.app`

### Important: Vercel Subdomain Setup

For multi-tenancy on Vercel, you have two options:

#### Option 1: Use Vercel Subdomains (Development/Testing)
- Your platform: `your-project.vercel.app` 
- Tenant stores: `tenant-name.your-project.vercel.app`
- No additional setup required

#### Option 2: Custom Domain (Production)
1. **Add your domain** in Vercel dashboard
2. **Configure DNS**: Set up wildcard DNS (`*.yourdomain.com → your-project.vercel.app`)
3. **Update environment**: Set `NEXT_PUBLIC_APP_DOMAIN=yourdomain.com`
4. **SSL**: Vercel automatically handles wildcard SSL certificates

### Custom Domain Setup

For production with custom subdomains:
1. **Configure DNS**: Set up wildcard DNS (`*.yourdomain.com`) 
2. **SSL Certificates**: Ensure wildcard SSL coverage
3. **Update middleware**: Configure your domain in `middleware.ts`

## 🔐 Security

- **Row Level Security**: All tenant data is isolated at the database level
- **Authentication**: Secure JWT-based auth with Supabase
- **Environment Variables**: Sensitive data stored in environment variables
- **CORS**: Properly configured for your domains
- **Input Validation**: Form validation and sanitization

## 🧪 Testing

### Manual Testing Checklist

- [ ] Platform homepage loads
- [ ] Tenant signup flow works
- [ ] Subdomain routing works  
- [ ] Store admin authentication
- [ ] Product/category CRUD operations
- [ ] Data isolation between tenants

### Automated Testing (Future)

```bash
# When tests are added
npm run test        # Run tests
npm run test:e2e    # End-to-end tests
npm run test:db     # Database tests
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Test multi-tenant scenarios
- Update migrations for schema changes
- Document new features

## 🐛 Troubleshooting

### Common Issues

**Subdomain routing not working locally**:
- Add entries to `/etc/hosts`: `127.0.0.1 teststore.localhost`
- Ensure middleware domains are configured correctly
- Check that `NEXT_PUBLIC_APP_DOMAIN` is set correctly

**Database connection errors**:
- Check environment variables are set
- Verify Supabase project is active
- Check API keys haven't expired
- Ensure database is linked: `npm run db:link`

**Migration failures**:
- Ensure you're linked to the correct project: `npm run db:link`
- Check for syntax errors in migration files
- Verify database permissions
- For UUID function errors, ensure PostgreSQL version supports `gen_random_uuid()`

**Build failures**:
- Run `npm run db:types` to update TypeScript definitions
- Check for missing environment variables
- Verify all imports are correct
- Ensure generated types in `database-generated.ts` are being used

**Type errors after database changes**:
- Regenerate types: `npm run db:types`
- Restart TypeScript server in VS Code
- Check that client files import from `database-generated.ts`

**Admin panel layout issues**:
- Admin panel requires valid tenant subdomain to function properly
- Access via: `http://yourstore.localhost:3000/admin` (development)
- If admin layout appears broken, check browser console for tenant context errors
- Ensure you're authenticated and have access to the specific tenant

**Product management errors**:
- **404 errors on /admin/products**: Ensure you're accessing via tenant subdomain
- **Form validation errors**: Check all required fields (name, slug, price)
- **Category loading issues**: Verify categories exist in database for your tenant
- **Database connection errors**: Check Supabase connection and RLS policies

**Orders page issues**:
- **Orders page not displaying**: Admin orders require tenant context - access via `yourstore.localhost:3000/admin/orders`
- **"No tenant found" error**: Use proper subdomain access or check demo mode in development
- **Orders not loading**: Verify orders table exists with proper RLS policies for your tenant
- **Status update failures**: Ensure user has admin permissions for the specific tenant
- **Demo mode displaying**: Normal for direct localhost access - use tenant subdomain for real data
- **Statistics not updating**: Check that order status updates are being saved to database

**Settings page issues**:
- **Settings not saving**: Verify user has owner/admin permissions for the tenant
- **Theme changes not applying**: Check that theme_config is being properly saved to database
- **User invitation failures**: Ensure proper SMTP configuration for email invitations
- **Color picker not working**: Verify browser supports HTML5 color input type
- **Settings page not loading**: Same tenant access requirements as other admin pages

**Tenant signup RLS policy errors**:
- **Error**: "infinite recursion detected in policy for relation 'tenants'"
- **Solution**: Fixed with simplified RLS policies that avoid circular dependencies
- **Migration Applied**: `20251026000002_fix_tenants_rls_simple.sql`

**Signup flow creating users without tenants**:
- **Issue**: Users created in auth.users but no tenant records
- **Root Cause**: Multiple signup routes causing confusion (/signup vs /auth/signup)
- **Solution**: Consolidated all signup flows to use proper tenant creation process
- **Fix Applied**: Login page now correctly links to /signup, /auth/signup redirects to /signup

**Infinite redirect loops in admin**:
- Check that TenantProvider is properly configured
- Verify authentication state is not causing layout re-renders
- Ensure useTenant hook returns default values instead of throwing errors

## 🔄 Recent Updates

### v1.6.0 - Products CSV Import & Public Store (October 2024)

**📦 CSV Import System:**
- **Bulk Product Import**: Professional CSV import with column mapping and validation
- **4-Step Import Wizard**: Upload → Map Columns → Validate Data → Import with progress tracking
- **Smart Column Detection**: Automatic CSV header recognition with example data preview
- **Comprehensive Validation**: Type checking, required field validation, and category verification
- **Template Download**: One-click CSV template generation with proper format
- **Error Reporting**: Detailed validation errors with row and column specificity
- **Progress Tracking**: Real-time import progress with success/failure reporting

**🛍️ Public Store Pages:**
- **Products Catalog**: Complete public product browsing with search and filtering
- **Category Pages**: Dedicated category-specific product listings (`/products/category/[slug]`)
- **Product Details**: Individual product pages with image gallery and cart functionality
- **Product Grid/List Views**: Toggle between grid and list display modes
- **Advanced Filtering**: Search, category filtering, and sorting options
- **SEO-Friendly URLs**: Clean URL structure for better search engine optimization

**🎨 Enhanced UI Components:**
- **ProductCard Component**: Reusable product display with hover effects and status badges
- **CSV Import Modal**: Multi-step wizard with drag-and-drop file upload
- **Progress Indicators**: Visual feedback for import operations and loading states
- **Responsive Design**: Mobile-optimized product browsing and admin interfaces

**📊 Technical Improvements:**
- **CSV Processing**: Robust CSV parsing with error handling and data validation
- **Batch Operations**: Efficient bulk product creation with progress tracking
- **Route Organization**: Proper Next.js routing structure avoiding conflicts
- **Type Safety**: Full TypeScript support for all new components and operations

> **Documentation**: See [docs/admin-products-import.md](docs/admin-products-import.md) for detailed CSV import guide.

### v1.5.0 - Signup Flow & RLS Policy Fixes (October 2024)

**🔧 Critical Bug Fixes:**
- **Fixed Infinite Recursion**: Resolved "infinite recursion detected in policy for relation 'tenants'" error
- **Consolidated Signup Flow**: Fixed users being created without tenants by unifying signup routes
- **RLS Policy Optimization**: Simplified tenant table policies to prevent circular dependencies
- **Authentication Flow**: Improved login-to-signup routing to ensure proper tenant creation

**🛠️ Technical Improvements:**
- **Simplified RLS Policies**: Migration `20251026000002_fix_tenants_rls_simple.sql` eliminates circular policy references
- **Unified Signup Routes**: All signup flows now properly go through `/signup` with tenant creation
- **Enhanced Error Handling**: Better user experience for authentication and tenant access issues
- **Production-Ready Tenant Management**: Automatic redirection to signup for users without tenants

**📋 Authentication Flow Updates:**
- Login page correctly links to main signup flow (`/signup`)
- Legacy signup route (`/auth/signup`) now redirects to proper flow
- Two-phase signup maintained: account creation → email verification → tenant setup
- Admin access properly validates tenant ownership and redirects when needed

### v1.4.0 - Admin Settings Management (October 2024)

**⚙️ Comprehensive Settings System:**
- **Store Configuration**: Complete store information management with business details and contact info
- **Theme Customization**: Full branding control with color schemes, typography, and custom CSS
- **Team Management**: User invitation system with role-based access control (owner, admin, staff, viewer)
- **Feature Toggles**: Configurable store features including inventory tracking, backorders, and notifications
- **Security Dashboard**: Account overview, subscription management, and store deletion controls

**🎨 New UI Components:**
- **Tabbed Interface**: Organized settings categories with responsive navigation
- **Color Pickers**: Visual color selection for theme customization
- **Alert Dialogs**: Confirmation dialogs for destructive actions
- **Advanced Forms**: Complex form handling with real-time validation
- **Role Management**: Dropdown selectors for user permissions and role assignment

**🔧 Technical Improvements:**
- **Settings Persistence**: Automatic saving of configuration changes to database
- **Real-time Updates**: Immediate reflection of settings changes across the interface
- **Validation & Error Handling**: Comprehensive input validation with user-friendly error messages
- **Demo Mode Support**: Settings interface works seamlessly in development demo mode

### v1.3.0 - Admin Orders Management (October 2024)

**📦 New Order Management Features:**
- **Orders Dashboard**: Complete order management interface with statistics dashboard
- **Order Filtering & Search**: Filter by payment/fulfillment status, search by order number, email, or customer name
- **Status Management**: Inline update of payment status (pending, paid, refunded, cancelled) and fulfillment status (unfulfilled, fulfilled, partial)
- **Order Details Modal**: Comprehensive order view with customer info, addresses, pricing breakdown, and notes
- **Order Statistics**: Real-time tracking of total orders, pending payments, fulfilled orders, and total revenue
- **Customer Integration**: Display customer names and contact information linked to orders

**🎯 Enhanced Admin Experience:**
- **Status Badges**: Visual indicators for payment and fulfillment status with color coding
- **Currency Formatting**: Proper display of monetary values with localization
- **Responsive Design**: Mobile-friendly order management interface
- **Date Formatting**: User-friendly display of order dates and timestamps

**🛠️ Developer Experience Improvements:**
- **Demo Mode**: Automatic demo tenant creation for development testing without database setup
- **Enhanced Error Handling**: Clear tenant access error messages with helpful instructions
- **Loading States**: Proper loading indicators for tenant resolution and data fetching
- **Multi-tenant Guidance**: Informative messages about proper subdomain access patterns

### v1.2.0 - Admin Products Management (October 2024)

**🛍️ New Admin Features:**
- **Products Listing Page**: Complete product management interface with search & filtering
- **Add Product Page**: Comprehensive product creation form with validation
- **Product Actions**: View, edit, delete, and toggle product status
- **Inventory Management**: Track quantity, SKU, and backorder settings
- **SEO Optimization**: Meta title and description fields for search engines
- **Category Integration**: Product categorization with database relationships

**🎨 UI Components Added:**
- **Data Tables**: Responsive table component for product listings
- **Form Components**: Textarea, Switch, and Select components with Radix UI
- **Status Badges**: Visual indicators for product status and features
- **Action Menus**: Dropdown menus for product management actions

**📊 Database Integration:**
- **Product CRUD Operations**: Full create, read, update, delete functionality
- **Real-time Updates**: Immediate UI updates after database operations
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: Comprehensive error messages and user feedback

### v1.1.0 - Admin Panel & RLS Fixes (October 2024)

**✅ Fixed Issues:**
- **Admin Layout**: Resolved infinite redirect loops and layout crashes
- **RLS Policies**: Fixed tenant creation permissions during signup
- **Two-Phase Signup**: Improved signup flow with proper email verification
- **Tenant Context**: Made useTenant hook more defensive to prevent crashes
- **Database Types**: Auto-generation from remote database schema working

**🚀 New Features:**
- **API Routes**: Server-side tenant creation with proper validation
- **Setup Completion**: Guided post-verification tenant setup process
- **Enhanced Error Handling**: Better error messages and user guidance
- **Simplified Admin Layout**: Stable admin panel with responsive design

**🔧 Technical Improvements:**
- Updated RLS policies for better security and usability
- Improved middleware for Vercel deployment compatibility
- Enhanced tenant provider with better error handling
- Fixed UUID function compatibility for PostgreSQL

## �📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)  
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multitenancy)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js, Supabase, and shadcn/ui**