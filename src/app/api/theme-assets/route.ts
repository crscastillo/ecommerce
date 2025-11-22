import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const tenantId = formData.get('tenantId') as string
    const assetType = formData.get('assetType') as string // 'logo', 'favicon', 'hero'
    
    if (!file || !tenantId || !assetType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, tenantId, assetType' }, 
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, WebP, GIF, or SVG image.' },
        { status: 400 }
      )
    }

    // Validate file size based on asset type
    const maxSize = assetType === 'hero' ? 10 * 1024 * 1024 : 5 * 1024 * 1024 // 10MB for hero, 5MB for logo/favicon
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` },
        { status: 400 }
      )
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Generate unique filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const fileName = `${assetType}_${timestamp}_${randomSuffix}.${extension}`
    
    // Create appropriate folder structure
    const folderMap = {
      'logo': 'logo_url',
      'favicon': 'favicon_url', 
      'hero': 'hero-background'
    }
    const folder = folderMap[assetType as keyof typeof folderMap]
    const filePath = `${tenantId}/${folder}/${fileName}`

    console.log('API: Uploading theme asset:', { tenantId, assetType, filePath, fileSize: file.size })

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('public-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('public-assets')
      .getPublicUrl(filePath)

    console.log('API: Theme asset uploaded successfully:', urlData.publicUrl)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath
    })

  } catch (error) {
    console.error('Theme asset upload error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during upload.' },
      { status: 500 }
    )
  }
}