const fs = require('fs');
const products = JSON.parse(fs.readFileSync('d:/vendor/backend/data/products.json', 'utf8'));

const foodItems = products.filter(p => p.subNavbarCategory === 'Food');
console.log(`Found ${foodItems.length} food items:`);
foodItems.forEach(p => {
  console.log(`- Name: "${p.name}", Category: "${p.category}", foodType: "${p.foodType}", description: "${p.description}"`);
});
