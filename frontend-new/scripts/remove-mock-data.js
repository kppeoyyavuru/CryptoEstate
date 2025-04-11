const fs = require('fs');
const path = require('path');

// List of mock data files to remove
const filesToRemove = [
  '../app/api/properties/mockdata.ts',
  '../app/api/investments/mockdata.ts',
  '../app/api/user/mockdata.ts'
];

async function main() {
  console.log('Removing mock data files...');

  for (const file of filesToRemove) {
    const filePath = path.join(__dirname, file);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Removed: ${file}`);
      } else {
        console.log(`File not found: ${file}`);
      }
    } catch (error) {
      console.error(`Error removing ${file}:`, error);
    }
  }

  console.log('Mock data removal completed');
}

main(); 