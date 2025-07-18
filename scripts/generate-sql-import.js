/**
 * Script to generate SQL INSERT statements for AppSumo codes
 * This script reads codes from the data/appsumo-codes.txt file and generates SQL to import them
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Function to generate SQL INSERT statements
function generateSqlInserts(codes) {
  let sql = `-- SQL script to import ${codes.length} AppSumo codes\n\n`;
  
  // Create the table if it doesn't exist
  sql += `-- Create the appsumo_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.appsumo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'lifetime',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_appsumo_codes_code ON public.appsumo_codes(code);

`;

  // Generate INSERT statements in batches of 100
  sql += `-- Insert all ${codes.length} codes into the appsumo_codes table\n`;
  
  const batchSize = 100;
  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = codes.slice(i, i + batchSize);
    
    sql += `INSERT INTO public.appsumo_codes (code, plan_type, is_active) VALUES\n`;
    
    const values = batch.map((code, index) => {
      const isLast = index === batch.length - 1;
      return `('${code}', 'lifetime', true)${isLast ? '' : ','}`;
    }).join('\n');
    
    sql += values + '\nON CONFLICT (code) DO NOTHING;\n\n';
  }
  
  // Add verification query
  sql += `-- Verify the import
SELECT COUNT(*) FROM public.appsumo_codes;`;
  
  return sql;
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
    
    // Generate SQL INSERT statements
    const sql = generateSqlInserts(codes);
    
    // Write SQL to file
    const outputPath = path.join(__dirname, 'import-all-appsumo-codes.sql');
    await fs.promises.writeFile(outputPath, sql);
    
    console.log(`SQL script generated at ${outputPath}`);
  } catch (error) {
    console.error('Error generating SQL script:', error);
    process.exit(1);
  }
}

main();