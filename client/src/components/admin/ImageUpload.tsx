import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUpload: (imagePath: string, thumbnailPath: string) => void;
  onImageRemove?: (imagePath: string) => void;
  existingImages?: string[];
  maxImages?: number;
  multiple?: boolean;
}

export default function ImageUpload({
  onImageUpload,
  onImageRemove,
  existingImages = [],
  maxImages = 5,
  multiple = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check file count limit
    if (existingImages.length + fileArray.length > maxImages) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive"
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, and WebP files are allowed",
        variant: "destructive"
      });
      return;
    }

    // Check file sizes (5MB limit)
    const oversizedFiles = fileArray.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (multiple && fileArray.length > 1) {
        // Upload multiple images
        const formData = new FormData();
        fileArray.forEach(file => {
          formData.append('images', file);
        });

        const response = await fetch('/api/images/upload/product-images', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          result.images.forEach((img: any) => {
            onImageUpload(img.imagePath, img.thumbnailPath);
          });
          toast({
            title: "Success",
            description: result.message
          });
        } else {
          throw new Error(result.message);
        }
      } else {
        // Upload single image
        const formData = new FormData();
        formData.append('image', fileArray[0]);

        const response = await fetch('/api/images/upload/product-image', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          onImageUpload(result.imagePath, result.thumbnailPath);
          toast({
            title: "Success",
            description: result.message
          });
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = async (imagePath: string) => {
    try {
      const response = await fetch('/api/images/delete/product-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imagePath })
      });

      const result = await response.json();

      if (result.success) {
        onImageRemove?.(imagePath);
        toast({
          title: "Success",
          description: "Image deleted successfully"
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium">Drop images here or click to upload</p>
            <p className="text-sm text-gray-500">
              {multiple ? `Upload up to ${maxImages} images` : 'Upload a single image'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supported formats: JPEG, PNG, WebP (max 5MB each)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Choose Images
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Current Images:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((imagePath, index) => (
              <div key={index} className="relative group">
                <img
                  src={imagePath}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/uploads/products/placeholder.webp';
                  }}
                />
                {onImageRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(imagePath)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}