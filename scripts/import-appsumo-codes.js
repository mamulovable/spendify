/**
 * Script to import AppSumo codes into the database
 * This script reads codes from the data/appsumo-codes.txt file and imports them into the Supabase database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key must be provided in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to read codes from file
async function readCodesFromFile() {
  const filePath = path.join(__dirname, '..', 'data', 'appsumo-codes.txt');
  
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data.split('\n').filter(code => code.trim().length > 0);
  } catch (error) {
    console.error('Error reading codes file:', error);
    return [];
  }
}

// Function to import codes in batches
async function importCodes(codes) {
  console.log(`Importing ${codes.length} AppSumo codes...`);
  
  // Process in batches of 100 to avoid overwhelming the database
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = codes.slice(i, i + batchSize);
    
    try {
      // Use the database function to import codes
      const { data, error } = await supabase.rpc('import_appsumo_codes', {
        codes: batch
      });
      
      if (error) {
        console.error('Error importing batch:', error);
        errorCount += batch.length;
      } else {
        console.log(`Successfully imported batch ${i / batchSize + 1}/${Math.ceil(codes.length / batchSize)}`);
        successCount += data;
      }
    } catch (error) {
      console.error('Error importing batch:', error);
      errorCount += batch.length;
    }
    
    // Add a small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return { successCount, errorCount };
}

// Main function
async function main() {
  try {
    // Read codes from file
    const codes = await readCodesFromFile();
    
    if (codes.length === 0) {
      console.error('No codes found in the file');
      process.exit(1);
    }
    
    console.log(`Found ${codes.length} AppSumo codes to import`);
    
    // Import codes into the database
    const { successCount, errorCount } = await importCodes(codes);
    
    console.log(`Import completed: ${successCount} codes imported successfully, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

main();