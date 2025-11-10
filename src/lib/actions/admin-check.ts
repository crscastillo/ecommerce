'use server'

export async function isPlatformAdmin(email: string): Promise<boolean> {
  const platformAdminEmail = process.env.PLATFORM_ADMIN_EMAIL
  if (!platformAdminEmail) return false
  
  return email.toLowerCase() === platformAdminEmail.toLowerCase()
}

export async function getPlatformAdminEmail(): Promise<string> {
  return process.env.PLATFORM_ADMIN_EMAIL || 'not-configured'
}