const fs = require('fs');
const filePath = 'd:/Connect App/frontend/src/pages/customer/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace custom non-standard blue classes with standard Tailwind classes
content = content.replace(/bg-blue-650/g, 'bg-blue-600');
content = content.replace(/hover:bg-blue-750/g, 'hover:bg-blue-700');
content = content.replace(/text-blue-650/g, 'text-blue-600');
content = content.replace(/text-blue-605/g, 'text-blue-600');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated blue classes in Dashboard.jsx.');
