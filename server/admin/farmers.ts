import { Request, Response } from 'express';
import { db } from '../db';
import { farmers, insertFarmerSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Get all farmers
export const getAllFarmers = async (req: Request, res: Response) => {
  try {
    const farmerList = await db.select().from(farmers);
    
    res.json(farmerList);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ message: 'Failed to fetch farmers', error: String(error) });
  }
};

// Get farmer by ID
export const getFarmerById = async (req: Request, res: Response) => {
  try {
    const farmerId = parseInt(req.params.id);
    
    const [farmer] = await db
      .select()
      .from(farmers)
      .where(eq(farmers.id, farmerId));
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    res.json(farmer);
  } catch (error) {
    console.error('Error fetching farmer:', error);
    res.status(500).json({ message: 'Failed to fetch farmer', error: String(error) });
  }
};

// Create new farmer
export const createFarmer = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const farmerData = insertFarmerSchema.parse(req.body);
    
    // Insert new farmer
    const [newFarmer] = await db
      .insert(farmers)
      .values(farmerData)
      .returning();
    
    res.status(201).json(newFarmer);
  } catch (error) {
    console.error('Error creating farmer:', error);
    
    // Check if it's a validation error
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Failed to create farmer', error: String(error) });
  }
};

// Update farmer
export const updateFarmer = async (req: Request, res: Response) => {
  try {
    const farmerId = parseInt(req.params.id);
    
    // Check if farmer exists
    const [existingFarmer] = await db
      .select()
      .from(farmers)
      .where(eq(farmers.id, farmerId));
    
    if (!existingFarmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    // Validate request body - handle missing imageUrl field for updates
    const farmerData = insertFarmerSchema.extend({
      imageUrl: z.string().optional().default("")
    }).parse(req.body);
    
    // Update farmer
    const [updatedFarmer] = await db
      .update(farmers)
      .set(farmerData)
      .where(eq(farmers.id, farmerId))
      .returning();
    
    res.json(updatedFarmer);
  } catch (error) {
    console.error('Error updating farmer:', error);
    
    // Check if it's a validation error
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Failed to update farmer', error: String(error) });
  }
};

// Toggle farmer featured status
export const toggleFarmerFeatured = async (req: Request, res: Response) => {
  try {
    const farmerId = parseInt(req.params.id);
    const { featured } = req.body;
    
    if (typeof featured !== 'boolean') {
      return res.status(400).json({ message: 'Featured status must be a boolean' });
    }
    
    // Check if farmer exists
    const [existingFarmer] = await db
      .select()
      .from(farmers)
      .where(eq(farmers.id, farmerId));
    
    if (!existingFarmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    // Update featured status
    const [updatedFarmer] = await db
      .update(farmers)
      .set({ featured })
      .where(eq(farmers.id, farmerId))
      .returning();
    
    res.json(updatedFarmer);
  } catch (error) {
    console.error('Error updating farmer featured status:', error);
    res.status(500).json({ message: 'Failed to update farmer featured status', error: String(error) });
  }
};

// Delete farmer
export const deleteFarmer = async (req: Request, res: Response) => {
  try {
    const farmerId = parseInt(req.params.id);
    
    // Check if farmer exists
    const [existingFarmer] = await db
      .select()
      .from(farmers)
      .where(eq(farmers.id, farmerId));
    
    if (!existingFarmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    // Delete farmer
    await db
      .delete(farmers)
      .where(eq(farmers.id, farmerId));
    
    res.json({ message: 'Farmer deleted successfully' });
  } catch (error) {
    console.error('Error deleting farmer:', error);
    res.status(500).json({ message: 'Failed to delete farmer', error: String(error) });
  }
};

// Get featured farmers
export const getFeaturedFarmers = async (req: Request, res: Response) => {
  try {
    const featuredFarmersList = await db
      .select()
      .from(farmers)
      .where(eq(farmers.featured, true));
    
    res.json(featuredFarmersList);
  } catch (error) {
    console.error('Error fetching featured farmers:', error);
    res.status(500).json({ message: 'Failed to fetch featured farmers', error: String(error) });
  }
};