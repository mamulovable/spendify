/**
 * Script to generate 3000 unique AppSumo redemption codes
 * Each code follows the format AS-XXXXXXXXXXXXX where X is alphanumeric
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate a random alphanumeric string of specified length
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Generate 3000 unique AppSumo codes
function generateAppSumoCodes(count) {
  const codes = new Set();
  
  while (codes.size < count) {
    const code = `AS-${generateRandomString(15)}`;
    codes.add(code);
  }
  
  return Array.from(codes);
}

// Main function
function main() {
  console.log('Generating 3000 AppSumo codes...');
  const codes = generateAppSumoCodes(3000);
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write codes to file
  const outputPath = path.join(outputDir, 'appsumo-codes.txt');
  fs.writeFileSync(outputPath, codes.join('\n'));
  
  console.log(`Successfully generated 3000 AppSumo codes and saved to ${outputPath}`);
}

main();