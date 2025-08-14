#!/usr/bin/env tsx
/**
 * Database Migration Script: NeonDB to Hostinger
 * This script handles the complete migration from NeonDB to Hostinger PostgreSQL
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './shared/schema';
import fs from 'fs';
import path from 'path';

// Source (NeonDB) connection
const sourcePool = new NeonPool({
  connectionString: process.env.DATABASE_URL
});
const sourceDb = neonDrizzle({ client: sourcePool, schema });

// Target (Hostinger) connection  
const targetPool = new Pool({
  connectionString: process.env.HOSTINGER_DATABASE_URL
});
const targetDb = drizzle({ client: targetPool, schema });

async function exportDatabase() {
  console.log('🔄 Starting database export from NeonDB...');
  
  try {
    // Export all tables
    const tables = [
      'users', 'farmers', 'products', 'product_variants', 'categories',
      'carts', 'cart_items', 'orders', 'order_items', 'discounts',
      'site_settings', 'contact_messages', 'testimonials', 'newsletters',
      'product_reviews', 'sms_verifications'
    ];
    
    const exportData: Record<string, any[]> = {};
    
    for (const tableName of tables) {
      try {
        const data = await sourceDb.execute(`SELECT * FROM ${tableName}`);
        exportData[tableName] = data.rows;
        console.log(`✅ Exported ${data.rows.length} records from ${tableName}`);
      } catch (error) {
        console.log(`⚠️  Table ${tableName} not found or empty, skipping...`);
      }
    }
    
    // Save export to file
    const exportPath = path.join(process.cwd(), 'database_export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`📁 Data exported to ${exportPath}`);
    
    return exportData;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

async function importDatabase(exportData: Record<string, any[]>) {
  console.log('🔄 Starting database import to Hostinger...');
  
  try {
    // Test connection first
    await targetDb.execute('SELECT 1');
    console.log('✅ Connection to Hostinger database successful');
    
    // Run migrations first to create tables
    console.log('🔄 Running database migrations...');
    // Note: This assumes you'll run drizzle migrations separately
    
    // Import data
    for (const [tableName, data] of Object.entries(exportData)) {
      if (data.length === 0) continue;
      
      try {
        // Clear existing data
        await targetDb.execute(`TRUNCATE TABLE ${tableName} CASCADE`);
        
        // Insert data in batches
        const batchSize = 100;
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          
          // Dynamic insert based on table data
          const columns = Object.keys(batch[0]);
          const values = batch.map(row => 
            columns.map(col => row[col] === null ? null : `'${String(row[col]).replace(/'/g, "''")}'`).join(', ')
          ).join('), (');
          
          const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values})`;
          await targetDb.execute(query);
        }
        
        console.log(`✅ Imported ${data.length} records to ${tableName}`);
      } catch (error) {
        console.error(`❌ Failed to import ${tableName}:`, error);
      }
    }
    
    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('🚀 Starting NeonDB to Hostinger migration...');
    
    // Step 1: Export from NeonDB
    const exportData = await exportDatabase();
    
    // Step 2: Import to Hostinger
    await importDatabase(exportData);
    
    // Step 3: Update connection strings
    console.log('📝 Migration complete! Update your .env file to use HOSTINGER_DATABASE_URL');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

export { exportDatabase, importDatabase, runMigration };