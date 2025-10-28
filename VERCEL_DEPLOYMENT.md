# Vercel Wildcard Subdomain Deployment Guide

## 📋 Prerequisites
- Domain `aluro.shop` purchased and accessible
- Vercel account with deployment access
- Project deployed to Vercel

## 🚀 Step-by-Step Deployment

### 1. **Domain Configuration in Vercel**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Add these domains:
   - `aluro.shop` (primary domain)
   - `*.aluro.shop` (wildcard subdomain)

### 2. **DNS Configuration**

Configure your DNS provider (where you bought `aluro.shop`) with these records:

```dns
# A Records (IPv4)
A     aluro.shop           76.76.19.61
A     *.aluro.shop         76.76.19.61

# AAAA Records (IPv6) - Optional but recommended
AAAA  aluro.shop           2600:1f16:d83:1202::61
AAAA  *.aluro.shop         2600:1f16:d83:1202::61

# Alternative: CNAME (if your provider supports wildcard CNAME)
CNAME *.aluro.shop         cname.vercel-dns.com
```

**Note**: Use the IP addresses provided by Vercel in your project settings, as they may differ.

### 3. **Environment Variables in Vercel**

Set these environment variables in your Vercel project:

```env
NEXT_PUBLIC_PLATFORM_NAME=Aluro
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_PRODUCTION_DOMAIN=aluro.shop
NEXT_PUBLIC_DEBUG_MIDDLEWARE=false

# Your Supabase credentials (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. **Deploy and Test**

1. **Deploy to Vercel**: `vercel --prod`
2. **Test main domain**: https://aluro.shop
3. **Test wildcard**: https://tenant1.aluro.shop

### 5. **Testing Checklist**

- [ ] Main domain loads platform homepage
- [ ] Subdomain redirects work (tenant.aluro.shop)
- [ ] Admin authentication works on subdomains
- [ ] Store pages load correctly on subdomains
- [ ] SSL certificates are active for wildcard

### 6. **Common Issues & Solutions**

#### **Issue**: Wildcard not working
**Solution**: Ensure DNS propagation is complete (can take 24-48 hours)

#### **Issue**: SSL certificate errors
**Solution**: Vercel automatically generates Let's Encrypt certificates, wait for provisioning

#### **Issue**: Subdomain not found
**Solution**: Check middleware logic and ensure tenant exists in database

#### **Issue**: Redirect loops
**Solution**: Verify middleware extractSubdomain logic matches your domain structure

### 7. **Verification Commands**

```bash
# Check DNS propagation
dig aluro.shop
dig tenant1.aluro.shop

# Test HTTP responses
curl -I https://aluro.shop
curl -I https://tenant1.aluro.shop
```

### 8. **Domain Verification**

After DNS configuration, domains should show:
- ✅ `aluro.shop` - Valid
- ✅ `*.aluro.shop` - Valid

## 🔧 Troubleshooting

If you encounter issues:

1. **Check Vercel Logs**: Go to Functions tab in your project dashboard
2. **Verify DNS**: Use DNS checker tools online
3. **Test Locally**: Ensure local development works with tenant.localhost:3000
4. **Check Middleware**: Add console.logs to debug subdomain extraction

## 📞 Support Resources

- [Vercel Wildcard Domains](https://vercel.com/docs/concepts/projects/domains#wildcard-domains)
- [Vercel DNS Configuration](https://vercel.com/docs/concepts/projects/domains/adding-a-domain)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)