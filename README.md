# Multi-Tenant Ecommerce Platform

A powerful, scalable multi-tenant ecommerce platform built with Next.js, Supabase, and shadcn/ui. Create and manage multiple online stores with custom subdomains, all from a single codebase.

## 🚀 Features

### Platform Features
- **Multi-Tenancy**: Each tenant gets their own subdomain (e.g., `store.yourdomain.com`)
- **Platform Landing Page**: Marketing site for tenant acquisition
- **Tenant Management**: Complete tenant onboarding and management system
- **Subdomain Routing**: Automatic subdomain detection and routing

### Store Features  
- **Complete Ecommerce**: Products, categories, cart, orders, customers
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

## 📋 Prerequisites

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

The database is designed with proper multi-tenancy:
- All tenant data includes a `tenant_id` foreign key
- Row Level Security (RLS) policies ensure data isolation
- Shared tables for platform-level data (billing, analytics, etc.)

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

1. **Start the application**: `npm run dev`
2. **Visit**: `http://localhost:3000`
3. **Click "Get Started"** on the platform homepage
4. **Fill out the signup form**:
   - Email & password for your account
   - Store name and subdomain
   - Contact information
5. **Complete signup** - you'll be redirected to your store's admin panel
6. **Access your store**: `http://your-subdomain.localhost:3000`

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
│   ├── (platform)/                # Platform routes (main domain)
│   │   ├── page.tsx               # Platform landing page
│   │   └── signup/                # Tenant signup
│   ├── (store)/                   # Store routes (subdomains)
│   │   ├── page.tsx               # Store homepage  
│   │   ├── products/              # Product pages
│   │   └── admin/                 # Store admin
│   └── api/                       # API routes
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── store/                     # Store-specific components
│   ├── admin/                     # Admin components
│   └── conditional-layout.tsx     # Smart layout switcher
├── lib/
│   ├── supabase/                  # Supabase clients and utilities
│   ├── contexts/                  # React contexts
│   └── types/                     # TypeScript definitions
├── middleware.ts                  # Multi-tenant routing
supabase/
├── migrations/                    # Database migrations
├── seed.sql                       # Development seed data
└── config.toml                    # Supabase configuration
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. **Deploy** - Vercel will automatically handle subdomain routing

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

**Database connection errors**:
- Check environment variables are set
- Verify Supabase project is active
- Check API keys haven't expired

**Migration failures**:
- Ensure you're linked to the correct project: `npm run db:link`
- Check for syntax errors in migration files
- Verify database permissions

**Build failures**:
- Run `npm run db:types` to update TypeScript definitions
- Check for missing environment variables
- Verify all imports are correct

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)  
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multitenancy)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js, Supabase, and shadcn/ui**