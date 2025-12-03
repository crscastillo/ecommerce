import { redirect } from 'next/navigation'
import { FeatureFlagsService } from '@/lib/services/feature-flags'
import { createClient } from '@/lib/supabase/server'

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Get current tenant to check feature flags
    const supabase = await createClient()
    
    // Get the current user and their tenant
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      redirect('/auth/signin')
    }

    // Get user's tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, subscription_tier')
      .eq('owner_id', user.id)
      .single()

    if (tenantError || !tenant) {
      redirect('/admin')
    }

    // Check if pages feature is enabled for this tenant
    const featureFlags = await FeatureFlagsService.getFeatureFlags(tenant.id)
    
    if (!featureFlags.pages) {
      // Redirect to admin dashboard if pages feature is disabled
      redirect('/admin')
    }

    return <>{children}</>
  } catch (error) {
    redirect('/admin')
  }
}