#!/usr/bin/env node

/**
 * Script to check for missing auth().protect() calls in API routes
 * This helps identify routes that need explicit authentication protection
 */

const fs = require('fs');
const path = require('path');

// API directories to check
const apiDirectories = [
  'src/app/api',
];

// Files that should be excluded from checks
const excludedFiles = [
  'middleware.ts',
  'route.ts' // We'll check this one specifically
];

// Auth protection patterns to look for
const authProtectionPatterns = [
  /auth\(\)\.protect\(\)/,
  /auth\(\)\.requireAuth\(\)/,
  /auth\(\)\.mustBeAuthenticated\(\)/,
];

console.log('🔍 Checking for missing auth().protect() calls...\n');

// Track missing protection
const missingProtection = [];

// Function to check a file for auth protection
function checkFileForAuthProtection(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasAuthProtection = authProtectionPatterns.some(pattern => pattern.test(content));
    
    if (!hasAuthProtection && !isExcludedFile(relativePath)) {
      missingProtection.push(relativePath);
    }
  } catch (error) {
    console.error(`❌ Error reading file ${relativePath}:`, error.message);
  }
}

// Function to check if a file should be excluded
function isExcludedFile(filePath) {
  return excludedFiles.some(excluded => 
    filePath.endsWith(excluded) || filePath.includes(`${path.sep}${excluded}`)
  );
}

// Function to recursively check directories
function checkDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Skip node_modules and other directories we don't care about
      if (item.name !== 'node_modules' && !item.name.startsWith('.')) {
        checkDirectory(fullPath);
      }
    } else if (item.isFile() && item.name.endsWith('.ts')) {
      checkFileForAuthProtection(fullPath);
    }
  }
}

// Check all API directories
apiDirectories.forEach(dir => {
  checkDirectory(dir);
});

// Report results
console.log('\n📊 Results:');
console.log('====================');

if (missingProtection.length === 0) {
  console.log('✅ All API routes have proper authentication protection!');
} else {
  console.log(`❌ Found ${missingProtection.length} API route(s) missing auth().protect():`);
  console.log('');
  
  missingProtection.forEach((file, index) => {
    console.log(`${index + 1}. 📁 ${file}`);
  });
  
  console.log('');
  console.log('💡 Recommendation:');
  console.log('Add auth().protect() to these route files to ensure they are properly protected.');
  console.log('Example:');
  console.log('```typescript');
  console.log('import { auth } from "@clerk/nextjs/server";');
  console.log('');
  console.log('export async function GET() {');
  console.log('  auth().protect(); // Add this line');
  console.log('  // Your route logic here');
  console.log('}');
  console.log('```');
}

console.log('\n====================');
console.log('✨ Check completed!');