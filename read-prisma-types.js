// read-prisma-types.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', '.prisma', 'client', 'index.d.ts');
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Printing lines 850 to 900:');
for (let i = 849; i < 900 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
