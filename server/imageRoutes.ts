import { Router } from 'express';
import { upload, processImage, deleteImageFiles } from './imageUpload';
import { storage } from './storage';
import path from 'path';
import fs from 'fs';

const router = Router();

// Upload single product image
router.post('/upload/product-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { originalPath, thumbnailPath } = await processImage(
      req.file.buffer,
      req.file.originalname.split('.')[0]
    );

    res.json({
      success: true,
      imagePath: originalPath,
      thumbnailPath: thumbnailPath,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload multiple product images
router.post('/upload/product-images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const { originalPath, thumbnailPath } = await processImage(
        file.buffer,
        file.originalname.split('.')[0]
      );

      uploadedImages.push({
        imagePath: originalPath,
        thumbnailPath: thumbnailPath,
        originalName: file.originalname
      });
    }

    res.json({
      success: true,
      images: uploadedImages,
      message: `${uploadedImages.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload images',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete product image
router.delete('/delete/product-image', async (req, res) => {
  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ message: 'Image path is required' });
    }

    // Extract thumbnail path from image path
    const thumbnailPath = imagePath.replace('/uploads/products/', '/uploads/thumbnails/').replace('.webp', '_thumb.webp');
    
    deleteImageFiles([imagePath, thumbnailPath]);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve uploaded images
router.get('/serve/:imagePath(*)', async (req, res) => {
  try {
    const imagePath = req.params.imagePath;
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      // Return placeholder image if original doesn't exist
      const placeholderPath = path.join(process.cwd(), 'public/uploads/products/placeholder.webp');
      return res.sendFile(placeholderPath);
    }
    
    res.sendFile(fullPath);
  } catch (error) {
    console.error('Image serving error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to serve image'
    });
  }
});

// Get image info
router.get('/info/:imagePath(*)', async (req, res) => {
  try {
    const imagePath = `/${req.params.imagePath}`;
    
    // Return image metadata
    res.json({
      path: imagePath,
      thumbnailPath: imagePath.replace('/uploads/products/', '/uploads/thumbnails/').replace('.webp', '_thumb.webp'),
      exists: true
    });
  } catch (error) {
    console.error('Image info error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get image info'
    });
  }
});

export default router;