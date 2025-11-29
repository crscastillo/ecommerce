#!/usr/bin/env node

// Test script to verify email redirect URL construction
const { getBaseUrl, getBaseDomain } = require('./src/lib/utils');

console.log('🧪 Testing Email Redirect URL Configuration\n');

// Simulate different environments
const environments = [
  {
    name: 'Development (localhost)',
    env: {
      NODE_ENV: 'development',
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: undefined
    }
  },
  {
    name: 'Production with NEXT_PUBLIC_SITE_URL',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: 'https://aluro.shop',
      VERCEL_URL: undefined
    }
  },
  {
    name: 'Vercel deployment',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: 'aluro.shop'
    }
  }
];

environments.forEach(({ name, env }) => {
  console.log(`📍 ${name}:`);
  
  // Temporarily set environment variables
  const originalEnv = { ...process.env };
  Object.assign(process.env, env);
  
  try {
    // Test our utility functions
    console.log(`   Base URL: ${getBaseUrl()}`);
    console.log(`   Base Domain: ${getBaseDomain()}`);
    console.log(`   Email Redirect: ${getBaseUrl()}/auth/callback?setup=tenant`);
    console.log(`   Platform Admin Redirect: ${getBaseUrl()}/platform`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Restore environment
  process.env = originalEnv;
  console.log('');
});

console.log('✅ Configuration Test Complete');
console.log('\n📝 Notes:');
console.log('- In production, ensure NEXT_PUBLIC_SITE_URL is set to https://aluro.shop');
console.log('- Localhost will fallback to http://localhost:3000 for development');
console.log('- Vercel deployments will automatically use VERCEL_URL if available');