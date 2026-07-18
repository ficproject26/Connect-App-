const fs = require('fs');
const content = fs.readFileSync('d:/Connect App/frontend/src/pages/customer/Dashboard.jsx', 'utf8');

const matches = [];
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('â') || line.includes('\u20b9') || line.includes('\u00e2')) {
    matches.push({ lineNum: idx + 1, content: line.trim() });
  }
});

console.log(`Found ${matches.length} matching lines.`);
console.log(JSON.stringify(matches.slice(0, 40), null, 2));
