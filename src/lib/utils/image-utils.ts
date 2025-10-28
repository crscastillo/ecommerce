/**
 * Utility functions for handling product images in the admin interface
 */

export interface ParsedImages {
  images: string[]
  errors: string[]
}

/**
 * Safely parse product images from various formats
 * Handles: arrays, JSON strings, null/undefined, malformed data
 */
export function parseProductImages(rawImages: any): ParsedImages {
  const result: ParsedImages = {
    images: [],
    errors: []
  }

  // Handle null or undefined
  if (!rawImages) {
    return result
  }

  // Already an array
  if (Array.isArray(rawImages)) {
    result.images = rawImages.filter(img => 
      typeof img === 'string' && img.trim().length > 0
    )
    return result
  }

  // Handle string (JSON or single URL)
  if (typeof rawImages === 'string') {
    const trimmed = rawImages.trim()
    
    // Empty string
    if (trimmed.length === 0) {
      return result
    }

    // Try to parse as JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          result.images = parsed.filter(img => 
            typeof img === 'string' && img.trim().length > 0
          )
          return result
        }
      } catch (error) {
        result.errors.push(`Failed to parse JSON: ${error}`)
      }
    }

    // Treat as single URL
    if (isValidImageUrl(trimmed)) {
      result.images = [trimmed]
      return result
    }

    result.errors.push(`Invalid image format: ${trimmed}`)
    return result
  }

  // Handle object (in case of unexpected format)
  if (typeof rawImages === 'object') {
    result.errors.push(`Unexpected object format for images: ${JSON.stringify(rawImages)}`)
    return result
  }

  result.errors.push(`Unknown image format: ${typeof rawImages}`)
  return result
}

/**
 * Basic URL validation for images
 */
function isValidImageUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Prepare images for database storage
 * Ensures they're in the correct JSON format
 */
export function prepareImagesForStorage(images: string[]): string[] {
  return images.filter(img => 
    typeof img === 'string' && 
    img.trim().length > 0 && 
    isValidImageUrl(img.trim())
  ).map(img => img.trim())
}

/**
 * Create a placeholder image data URL
 */
export function createImagePlaceholder(text: string = 'Image Not Found'): string {
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle" dy="0.3em">${text}</text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Validate if an image URL is from Supabase storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes('supabase') && urlObj.pathname.includes('storage')
  } catch {
    return false
  }
}