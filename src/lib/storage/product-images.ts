import { createClient } from '@/lib/supabase/client'

export interface UploadImageOptions {
  tenantId: string
  file: File
  productId?: string
  folder?: string
}

export interface ImageUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export class ProductImageStorage {
  private supabase = createClient()
  private bucketName = 'product-images'

  /**
   * Upload a product image to Supabase Storage
   */
  async uploadImage({ tenantId, file, productId, folder = 'products' }: UploadImageOptions): Promise<ImageUploadResult> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
        }
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File too large. Maximum size is 50MB.'
        }
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const fileName = `${productId || 'product'}_${timestamp}_${randomSuffix}.${extension}`

      // Construct storage path: tenantId/folder/filename
      const filePath = `${tenantId}/${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      }
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during upload.'
      }
    }
  }

  /**
   * Upload multiple images at once
   */
  async uploadMultipleImages(
    options: Omit<UploadImageOptions, 'file'> & { files: File[] }
  ): Promise<ImageUploadResult[]> {
    const { files, ...uploadOptions } = options
    const uploadPromises = files.map(file => 
      this.uploadImage({ ...uploadOptions, file })
    )
    
    return Promise.all(uploadPromises)
  }

  /**
   * Delete an image from storage
   */
  async deleteImage(imagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([imagePath])

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during deletion.'
      }
    }
  }

  /**
   * Delete multiple images
   */
  async deleteMultipleImages(imagePaths: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove(imagePaths)

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during deletion.'
      }
    }
  }

  /**
   * Get public URL for an image
   */
  getImageUrl(imagePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(imagePath)
    
    return data.publicUrl
  }

  /**
   * Download an image from an external URL and upload to storage
   * Useful for CSV imports with image URLs
   */
  async downloadAndUploadFromUrl(
    imageUrl: string, 
    uploadOptions: Omit<UploadImageOptions, 'file'>
  ): Promise<ImageUploadResult> {
    try {
      // Fetch the image
      const response = await fetch(imageUrl)
      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch image from URL: ${response.statusText}`
        }
      }

      // Get the blob
      const blob = await response.blob()
      
      // Convert to File object
      const fileName = imageUrl.split('/').pop() || 'downloaded_image'
      const file = new File([blob], fileName, { type: blob.type })

      // Upload the file
      return this.uploadImage({ ...uploadOptions, file })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to download and upload image from URL.'
      }
    }
  }

  /**
   * Extract storage path from a Supabase Storage URL
   */
  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.indexOf(this.bucketName)
      
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/')
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Check if a URL is a Supabase Storage URL for this bucket
   */
  isStorageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname.includes(`/${this.bucketName}/`)
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const productImageStorage = new ProductImageStorage()