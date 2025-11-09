import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()
  const locale = headersList.get('x-locale')
  const tenantId = headersList.get('x-tenant-id')
  const tenantName = headersList.get('x-tenant-name')
  
  return Response.json({
    locale,
    tenantId,
    tenantName,
    userAgent: headersList.get('user-agent')?.slice(0, 100)
  })
}