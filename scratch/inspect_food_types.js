const fs = require('fs');
const products = JSON.parse(fs.readFileSync('d:/vendor/backend/data/products.json', 'utf8'));

const subCats = new Set();
const cats = new Set();

products.forEach(p => {
  if (p.subNavbarCategory) subCats.add(p.subNavbarCategory);
  if (p.category) cats.add(p.category);
});

console.log('SubNavbarCategories:', Array.from(subCats));
console.log('Categories:', Array.from(cats));
