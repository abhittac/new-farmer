import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directories exist
const uploadsDir = path.join(process.cwd(), 'public/uploads/products');
const thumbnailsDir = path.join(process.cwd(), 'public/uploads/thumbnails');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only specific image formats
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Image processing function
export const processImage = async (
  buffer: Buffer,
  filename: string,
  sizes: { width: number; height: number; suffix: string }[] = []
): Promise<{ originalPath: string; thumbnailPath: string; additionalSizes: string[] }> => {
  const fileId = uuidv4();
  const ext = '.webp'; // Convert all images to WebP for optimization
  
  const originalFilename = `${fileId}_${filename}${ext}`;
  const thumbnailFilename = `${fileId}_${filename}_thumb${ext}`;
  
  const originalPath = path.join(uploadsDir, originalFilename);
  const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
  
  // Process original image (optimize but maintain quality)
  await sharp(buffer)
    .webp({ quality: 90 })
    .resize(1200, 1200, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .toFile(originalPath);
  
  // Create thumbnail
  await sharp(buffer)
    .webp({ quality: 80 })
    .resize(300, 300, { 
      fit: 'cover',
      position: 'center' 
    })
    .toFile(thumbnailPath);
  
  // Create additional sizes if specified
  const additionalSizes: string[] = [];
  for (const size of sizes) {
    const sizedFilename = `${fileId}_${filename}_${size.suffix}${ext}`;
    const sizedPath = path.join(uploadsDir, sizedFilename);
    
    await sharp(buffer)
      .webp({ quality: 85 })
      .resize(size.width, size.height, { 
        fit: 'cover',
        position: 'center' 
      })
      .toFile(sizedPath);
    
    additionalSizes.push(`/uploads/products/${sizedFilename}`);
  }
  
  return {
    originalPath: `/uploads/products/${originalFilename}`,
    thumbnailPath: `/uploads/thumbnails/${thumbnailFilename}`,
    additionalSizes
  };
};

// Delete image files
export const deleteImageFiles = (imagePaths: string[]): void => {
  imagePaths.forEach(imagePath => {
    if (imagePath && imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), 'public', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  });
};

// Generate fallback image path
export const getFallbackImagePath = (): string => {
  return '/uploads/products/placeholder.webp';
};

// Create placeholder image if it doesn't exist
export const createPlaceholderImage = async (): Promise<void> => {
  const placeholderPath = path.join(uploadsDir, 'placeholder.webp');
  
  if (!fs.existsSync(placeholderPath)) {
    // Create a simple placeholder image
    await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 240, g: 240, b: 240, alpha: 1 }
      }
    })
    .webp({ quality: 80 })
    .composite([{
      input: Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#f0f0f0"/>
          <text x="200" y="200" text-anchor="middle" dominant-baseline="middle" 
                font-family="Arial, sans-serif" font-size="24" fill="#999">
            No Image
          </text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .toFile(placeholderPath);
  }
};

// Initialize placeholder on startup
createPlaceholderImage().catch(console.error);