'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react'
import Image from 'next/image'
import { productImageStorage, ImageUploadResult } from '@/lib/storage/product-images'

export interface ImageUploadProps {
  tenantId: string
  productId?: string
  initialImages?: string[]
  maxImages?: number
  onImagesChange: (images: string[]) => void
  disabled?: boolean
}

interface UploadingImage {
  id: string
  file: File
  preview: string
  status: 'uploading' | 'success' | 'error'
  result?: ImageUploadResult
}

export function ImageUpload({
  tenantId,
  productId,
  initialImages = [],
  maxImages = 10,
  onImagesChange,
  disabled = false
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateImages = useCallback((newImages: string[]) => {
    setImages(newImages)
    onImagesChange(newImages)
  }, [onImagesChange])

  const processFiles = useCallback(async (files: FileList) => {
    if (disabled) return

    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length - uploadingImages.length
    const filesToProcess = fileArray.slice(0, remainingSlots)

    if (filesToProcess.length === 0) return

    // Create uploading state for each file
    const newUploadingImages: UploadingImage[] = filesToProcess.map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading'
    }))

    setUploadingImages(prev => [...prev, ...newUploadingImages])

    // Upload files
    for (const uploadingImage of newUploadingImages) {
      try {
        const result = await productImageStorage.uploadImage({
          tenantId,
          file: uploadingImage.file,
          productId
        })

        setUploadingImages(prev =>
          prev.map(img =>
            img.id === uploadingImage.id
              ? { ...img, status: result.success ? 'success' : 'error', result }
              : img
          )
        )

        // If successful, add to images array
        if (result.success && result.url) {
          updateImages([...images, result.url])
        }
      } catch (error) {
        console.error('Upload error:', error)
        setUploadingImages(prev =>
          prev.map(img =>
            img.id === uploadingImage.id
              ? { ...img, status: 'error', result: { success: false, error: 'Upload failed' } }
              : img
          )
        )
      }
    }

    // Clean up completed uploads after a delay
    setTimeout(() => {
      setUploadingImages(prev => prev.filter(img => img.status === 'uploading'))
    }, 3000)
  }, [tenantId, productId, maxImages, images.length, uploadingImages.length, disabled, updateImages])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (disabled) return
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setDragActive(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }, [processFiles])

  const removeImage = useCallback(async (imageUrl: string) => {
    if (disabled) return

    // Extract path and delete from storage if it's a storage URL
    if (productImageStorage.isStorageUrl(imageUrl)) {
      const path = productImageStorage.extractPathFromUrl(imageUrl)
      if (path) {
        await productImageStorage.deleteImage(path)
      }
    }

    // Remove from local state
    updateImages(images.filter(img => img !== imageUrl))
  }, [images, disabled, updateImages])

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    if (disabled) return

    const newImages = [...images]
    const [moved] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, moved)
    updateImages(newImages)
  }, [images, disabled, updateImages])

  const canAddMore = images.length + uploadingImages.length < maxImages

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : disabled 
                ? 'border-gray-200 bg-gray-50' 
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center">
              <Upload className={`h-12 w-12 mb-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium mb-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                {dragActive ? 'Drop images here' : 'Upload product images'}
              </p>
              <p className={`text-xs mb-4 ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
                Drag and drop or click to select • JPEG, PNG, WebP, GIF • Max 50MB each
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={disabled}
            />
          </CardContent>
        </Card>
      )}

      {/* Uploading Images */}
      {uploadingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadingImages.map((uploadingImage) => (
            <Card key={uploadingImage.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={uploadingImage.preview}
                  alt="Uploading"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  {uploadingImage.status === 'uploading' && (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  )}
                  {uploadingImage.status === 'success' && (
                    <Check className="h-6 w-6 text-green-400" />
                  )}
                  {uploadingImage.status === 'error' && (
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  )}
                </div>
              </div>
              <div className="p-2">
                <Badge 
                  variant={
                    uploadingImage.status === 'success' ? 'default' :
                    uploadingImage.status === 'error' ? 'destructive' : 'secondary'
                  }
                  className="text-xs"
                >
                  {uploadingImage.status === 'uploading' && 'Uploading...'}
                  {uploadingImage.status === 'success' && 'Uploaded'}
                  {uploadingImage.status === 'error' && (uploadingImage.result?.error || 'Error')}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Product Images ({images.length})</h4>
            {images.length > 0 && (
              <p className="text-xs text-gray-500">
                Drag to reorder • First image will be the main image
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <Card key={imageUrl} className="group overflow-hidden relative">
                <div className="aspect-square relative">
                  <Image
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 text-xs">
                      Main
                    </Badge>
                  )}
                  {!disabled && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => removeImage(imageUrl)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-500 truncate">
                    Image {index + 1}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{images.length} of {maxImages} images</span>
        {uploadingImages.length > 0 && (
          <span>{uploadingImages.length} uploading...</span>
        )}
      </div>
    </div>
  )
}