const fs = require('fs');
const filePath = 'd:/Connect App/frontend/src/pages/customer/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/title:\s*['"]([^'"]+)['"]/g, (match, p1) => {
  // Strip non-alphanumeric characters, emojis, and garbled symbols from the beginning of the string
  const cleaned = p1.replace(/^[^a-zA-Z0-9&]+/, '').trim();
  return `title: '${cleaned}'`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully cleaned all mega menu title strings in Dashboard.jsx.');
