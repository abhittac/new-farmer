#!/usr/bin/env tsx

/**
 * Complete Database Export Script
 * 
 * This script exports the entire PostgreSQL database to a .sql file
 * with CREATE TABLE statements and INSERT statements for all data.
 * 
 * Usage:
 *   tsx exportDatabaseScript.ts
 */

import { exportDatabase } from './server/databaseExport';
import path from 'path';
import fs from 'fs';

async function main() {
  console.log('HarvestDirect Database Export Tool');
  console.log('===================================');
  console.log('');
  
  try {
    console.log('Starting database export...');
    
    const exportPath = await exportDatabase();
    
    console.log('');
    console.log('Database export completed successfully!');
    console.log('');
    console.log(`Export file: ${exportPath}`);
    console.log(`File size: ${(fs.statSync(exportPath).size / 1024).toFixed(2)} KB`);
    console.log('');
    console.log('The SQL file contains:');
    console.log('  • CREATE TABLE statements for all tables');
    console.log('  • INSERT statements for all data');
    console.log('  • Foreign key constraints');
    console.log('  • Sequence resets');
    console.log('  • PostgreSQL ENUMs');
    console.log('');
    console.log('You can use this file to recreate the database:');
    console.log(`  psql -d your_database < ${path.basename(exportPath)}`);
    
  } catch (error) {
    console.error('');
    console.error('Database export failed:');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

// Run the export
main();