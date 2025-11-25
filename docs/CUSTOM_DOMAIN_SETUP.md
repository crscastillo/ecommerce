# Custom Domain Setup Guide

## Overview

Your multi-tenant e-commerce platform supports both subdomain routing and custom domain routing for tenants. This allows your customers to access their stores via:

- **Subdomain**: `mystore.yourdomain.com` 
- **Custom Domain**: `www.mystore.com`

## How It Works

### 1. Tenant Resolution Process

The middleware checks incoming requests in this order:

1. **Custom Domain Lookup**: If the hostname doesn't match known platform domains, it queries the `tenants.domain` column
2. **Subdomain Extraction**: If custom domain lookup fails, it extracts the subdomain and queries `tenants.subdomain` column
3. **Tenant Loading**: Once found, tenant data is loaded and made available to the application

### 2. Database Schema

The `tenants` table includes:
- `subdomain`: Always present (e.g., "mystore")
- `domain`: Optional custom domain (e.g., "www.mystore.com")

## DNS Configuration

### For Subdomain Access (Automatic)
- No DNS configuration needed
- Works immediately: `mystore.yourdomain.com`

### For Custom Domain Access

#### CNAME Record Setup
```
Type: CNAME
Name: www (or @ for root domain)
Value: mystore.yourdomain.com
TTL: 300 (or default)
```

#### Alternative: A Record Setup
```
Type: A
Name: www (or @ for root domain)  
Value: [Your server's IP address]
TTL: 300 (or default)
```

## Implementation Details

### Middleware Changes
- Modified `extractSubdomain()` to handle custom domains
- Added dual lookup: domain first, then subdomain
- Enhanced tenant resolution with fallback logic
- Added headers: `x-tenant-domain` and `x-access-method`

### New Services
- `TenantDomainService`: Manages domain operations
- Domain validation and availability checking
- Canonical URL generation

### Admin Interface
- Domain settings in `/admin/settings` (Store tab)
- DNS configuration instructions
- Domain validation and status checking

## Security Considerations

1. **Domain Validation**: Only valid domain formats are accepted
2. **Uniqueness**: Each domain can only be assigned to one tenant
3. **Permission Checks**: Only tenant owners/admins can modify domains
4. **SSL/TLS**: Ensure proper certificate coverage for custom domains

## Testing

### Local Development
```bash
# Add to /etc/hosts for testing
127.0.0.1 teststore.localhost
127.0.0.1 customdomain.test
```

### Vercel Preview Deployments
```bash
# Your preview URLs will be:
https://your-app-git-main-username.vercel.app  # Main domain
https://teststore.your-app-git-main-username.vercel.app  # Tenant subdomain
```

### Production Testing on Vercel
1. **Verify Vercel domain setup**: Check Vercel dashboard domains section
2. **Test subdomain routing**: `https://teststore.yourdomain.com`
3. **Set up tenant custom domains**: Add to Vercel domains manually or via API
4. **Test custom domain routing**: `https://www.tenantdomain.com`
5. **Verify SSL certificates**: Vercel handles this automatically
6. **Check DNS propagation**: Use Vercel's domain verification tools

## Common Issues

### Domain Not Resolving
- Check DNS propagation: `dig customdomain.com`
- Verify CNAME/A record configuration
- Ensure TTL isn't too high

### SSL Certificate Errors on Vercel
- Vercel automatically provisions SSL certificates
- For custom domains: Ensure domain is added to Vercel project
- Check Vercel domain status in dashboard
- Renewal is automatic, no manual intervention needed

### Redirect Loops
- Ensure proper middleware configuration
- Check for conflicting redirect rules
- Verify platform domain detection logic

## API Endpoints

### Update Domain
```javascript
POST /api/tenant/domain
{
  "domain": "www.mystore.com" // or null to remove
}
```

### Get Domain Info
```javascript
GET /api/tenant/domain
```

## Vercel Deployment Setup

### 1. Environment Variables

Add these to your Vercel project environment:

```env
NEXT_PUBLIC_PRODUCTION_DOMAIN=yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PLATFORM_ADMIN_EMAIL=your_admin_email
```

### 2. Vercel Domain Configuration

#### Step 1: Add Your Main Domain
1. Go to your Vercel project settings
2. Navigate to **Domains** tab
3. Add your main domain: `yourdomain.com`
4. Add www variant: `www.yourdomain.com`
5. Set up proper redirects (non-www → www or vice versa)

#### Step 2: Enable Wildcard Subdomains
1. In Vercel Domains, add: `*.yourdomain.com`
2. This enables automatic subdomain routing for tenants
3. Vercel will automatically provision SSL certificates

#### Step 3: Custom Domain Support
For tenant custom domains, you have two options:

**Option A: Manual Domain Addition (Simpler)**
- Each tenant custom domain must be manually added to Vercel
- Go to Vercel Domains → Add each customer domain
- Vercel handles SSL automatically

**Option B: Programmatic Domain Management (Advanced)**
- Use Vercel API to automatically add domains
- Requires Vercel Team/Pro plan
- Set up webhook to add domains when tenants configure them

### 3. Vercel Configuration Files

#### `vercel.json`
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/middleware"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

#### `next.config.ts`
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    middleware: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## Vercel Deployment Workflow

### Initial Setup
1. **Deploy to Vercel**: Connect your GitHub repository
2. **Configure Environment Variables**: Add all required env vars
3. **Set up Main Domain**: Add `yourdomain.com` in Vercel domains
4. **Enable Wildcard**: Add `*.yourdomain.com` for subdomains
5. **Test Subdomain Routing**: Verify tenant subdomains work

### Adding Custom Domains (Manual Process)
```bash
# For each tenant that configures a custom domain:
1. Tenant configures domain in admin panel
2. Webhook/notification sent to platform admin
3. Manually add domain to Vercel project
4. Vercel provisions SSL certificate
5. Notify tenant when ready (24-48 hours)
```

### Adding Custom Domains (Automated - Pro Plan)
```typescript
// Example Vercel API integration
import { vercelDomains } from '@/lib/vercel-api'

async function addTenantDomain(tenantId: string, domain: string) {
  // Add domain to Vercel project
  const result = await vercelDomains.add(domain)
  
  // Update tenant record
  await supabase
    .from('tenants')
    .update({ 
      domain,
      domain_status: 'pending_verification'
    })
    .eq('id', tenantId)
}
```

### DNS Instructions for Customers
When tenant adds custom domain, provide these instructions:

**For Vercel Hosting:**
```
Type: CNAME
Name: www (or @ for root domain)
Value: cname.vercel-dns.com
TTL: 300
```

**Alternative (if CNAME not supported for root):**
```
Type: A
Name: @ 
Value: 76.76.19.61
TTL: 300

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

## Migration

If adding custom domain support to existing tenants:

1. The `domain` column should already exist in your schema
2. Existing tenants will continue working with subdomain access
3. Custom domains can be added through the admin interface
4. No data migration required
5. **Vercel domains must be added manually** for each custom domain

## Best Practices

### General
1. **Always use HTTPS** - Vercel provides this automatically
2. **Set up proper redirects** from non-www to www (or vice versa)
3. **Monitor DNS propagation** after changes
4. **Provide clear DNS instructions** to customers
5. **Validate domains** before allowing configuration
6. **Test thoroughly** across different DNS providers

### Vercel-Specific
1. **Use Vercel's domain management** for automatic SSL
2. **Set up monitoring** for domain verification status
3. **Consider Vercel Pro** for advanced domain features
4. **Use Vercel Analytics** to monitor custom domain traffic
5. **Implement domain verification** before allowing tenant setup
6. **Set up proper caching** for multi-tenant content

## Support Resources

### DNS Propagation Checkers
- [whatsmydns.net](https://whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)

### Common DNS Providers
- Cloudflare: Easy CNAME setup with proxy support
- Google Domains: Simple interface, good documentation
- GoDaddy: Popular but interface can be complex
- Namecheap: Developer-friendly options

## Troubleshooting

### Vercel-Specific Issues

**Domain Not Working After Adding to Vercel:**
1. Check Vercel domain status in dashboard
2. Verify DNS records point to `cname.vercel-dns.com`
3. Wait up to 48 hours for DNS propagation
4. Check Vercel deployment logs for errors

**SSL Certificate Issues:**
- Vercel handles SSL automatically
- If issues persist, remove and re-add domain in Vercel
- Check domain verification status

**Subdomain Not Routing:**
- Verify `*.yourdomain.com` is added to Vercel domains
- Check middleware logs in Vercel function logs
- Ensure `NEXT_PUBLIC_PRODUCTION_DOMAIN` is set correctly

### Troubleshooting Commands

```bash
# Check DNS resolution
dig www.customdomain.com
nslookup www.customdomain.com

# Test HTTP response
curl -I https://www.customdomain.com

# Check SSL certificate
openssl s_client -connect www.customdomain.com:443 -servername www.customdomain.com

# Vercel CLI commands
vercel domains ls                    # List all domains
vercel domains add customdomain.com  # Add domain via CLI
vercel domains rm customdomain.com   # Remove domain via CLI
```

### Vercel Domain Management API

```typescript
// Add domain programmatically (Vercel Pro required)
const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${vercelToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'customdomain.com'
  }),
});
```