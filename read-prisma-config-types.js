// read-prisma-config-types.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', 'prisma', 'config', 'index.d.ts');
if (!fs.existsSync(filePath)) {
  console.log('File not found in node_modules/prisma/config. Checking other locations...');
  // Check typical generated location
  const altPath = path.join(__dirname, 'node_modules', 'prisma', 'build', 'public.d.ts');
  if (fs.existsSync(altPath)) {
    printTypes(altPath);
  } else {
    console.error('Prisma config types not found.');
  }
} else {
  printTypes(filePath);
}

function printTypes(p) {
  const content = fs.readFileSync(p, 'utf8');
  const lines = content.split('\n');
  console.log('Printing first 100 lines of:', p);
  for (let i = 0; i < 100 && i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
