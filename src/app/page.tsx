'use client'

import { useState, useEffect } from "react";
import { useTenant } from "@/lib/contexts/tenant-context";
import { createClient } from "@/lib/supabase/client";
import { redirectToUserTenantAdmin } from "@/lib/utils/tenant-redirects";
import StoreHomepage from "@/components/store/store-homepage";
import {
  PlatformNavigation,
  HeroSection,
  FeaturesSection,
  IntegrationsSection,
  PricingSection,
  CtaSection,
  PlatformFooter
} from "@/components/platform";

export default function HomePage() {
  const { tenant, isLoading } = useTenant();

  // Show loading state while determining context
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If we have a tenant, show the store homepage
  if (tenant) {
    return <StoreHomepage tenant={tenant} />;
  }

  // Otherwise, show the platform homepage
  return <PlatformHomepage />;
}

function PlatformHomepage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  // Function to redirect to user's tenant admin
  const handleGoToAdmin = async () => {
    if (!user) return;
    
    await redirectToUserTenantAdmin(user, {
      fallbackPath: '/signup',
      onError: (error) => {
        // Fallback to signup if user has no tenants
        window.location.href = '/signup'
      }
    })
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <PlatformNavigation user={user} onGoToAdmin={handleGoToAdmin} />
      <HeroSection />
      <FeaturesSection />
      <IntegrationsSection />
      <PricingSection />
      <CtaSection />
      <PlatformFooter />
    </div>
  );
}
