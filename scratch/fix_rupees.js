const fs = require('fs');
const filePath = 'd:/Connect App/frontend/src/pages/customer/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// The garbled character sequence for ₹ when double-decoded:
// \u00e2\u201a\u00b9 represents â‚¹
const targetSequence = '\u00e2\u201a\u00b9'; 

// Count occurrences
const countBefore = content.split(targetSequence).length - 1;
console.log(`Found ${countBefore} occurrences of the garbled sequence.`);

// Replace all with ₹
content = content.split(targetSequence).join('₹');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced garbled symbols with ₹.');
