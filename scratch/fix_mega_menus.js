const fs = require('fs');
const filePath = 'd:/Connect App/frontend/src/pages/customer/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// List of exact garbled title lines and their clean English counterparts:
const replacements = {
  // Products
  "title: 'ðŸ›‹ Furniture'": "title: 'Furniture'",
  "title: 'ðŸ‘” Fashion & Lifestyle'": "title: 'Fashion & Lifestyle'",
  "title: 'ðŸ’„ Beauty & Personal Care'": "title: 'Beauty & Personal Care'",
  "title: 'ðŸ ¼ Baby Products'": "title: 'Baby Products'",
  "title: 'ðŸ ‹ Sports & Fitness'": "title: 'Sports & Fitness'",
  "title: 'ðŸ“š Books & Stationery'": "title: 'Books & Stationery'",
  "title: 'ðŸŽ® Gaming & Entertainment'": "title: 'Gaming & Entertainment'",
  "title: 'ðŸš— Automobile Products'": "title: 'Automobile Products'",
  "title: 'ðŸ ¡ Home & Kitchen'": "title: 'Home & Kitchen'",
  "title: 'ðŸ ¶ Pet Products'": "title: 'Pet Products'",
  "title: 'ðŸŒ± Gardening & Outdoor'": "title: 'Gardening & Outdoor'",
  "title: 'ðŸ ¥ Healthcare Products'": "title: 'Healthcare Products'",
  "title: 'ðŸ›  Industrial & Business Products'": "title: 'Industrial & Business Products'",

  // Daily Needs
  "title: 'ðŸ¥¬ Grocery & Essentials'": "title: 'Grocery & Essentials'",
  "title: 'ðŸ Ž Fruits & Vegetables'": "title: 'Fruits & Vegetables'",
  "title: 'ðŸ¥› Dairy Products'": "title: 'Dairy Products'",
  "title: 'ðŸ’§ Water & Beverages'": "title: 'Water & Beverages'",
  "title: 'ðŸ   Household Essentials'": "title: 'Household Essentials'",
  "title: 'ðŸ§¼ Personal Care'": "title: 'Personal Care'",
  "title: 'ðŸ‘¶ Baby Care'": "title: 'Baby Care'",
  "title: 'ðŸ©º Pharmacy & Healthcare'": "title: 'Pharmacy & Healthcare'",
  "title: 'ðŸ ¶ Pet Care'": "title: 'Pet Care'",
  "title: 'ðŸ ž Bakery & Fresh Foods'": "title: 'Bakery & Fresh Foods'",
  "title: 'ðŸŒ¿ Organic Products'": "title: 'Organic Products'",
  "title: 'ðŸ”‹ Daily Utility Products'": "title: 'Daily Utility Products'",

  // Food
  "title: 'ðŸ ½ Restaurants'": "title: 'Restaurants'",
  "title: 'ðŸ • Fast Food'": "title: 'Fast Food'",
  "title: '☕ Cafes & Coffee Shops'": "title: 'Cafes & Coffee Shops'",
  "title: 'ðŸ œ South Indian'": "title: 'South Indian'",
  "title: 'ðŸ › North Indian'": "title: 'North Indian'",
  "title: 'ðŸ š Biryani & Rice'": "title: 'Biryani & Rice'",
  "title: 'ðŸ¥— Healthy Food'": "title: 'Healthy Food'",
  "title: 'ðŸ ° Bakery & Desserts'": "title: 'Bakery & Desserts'",
  "title: 'ðŸ ¹ Beverages'": "title: 'Beverages'",
  "title: 'ðŸŒ  International Cuisine'": "title: 'International Cuisine'",
  "title: 'ðŸ — Non-Veg Specials'": "title: 'Non-Veg Specials'",
  "title: 'ðŸ¥¦ Vegetarian Specials'": "title: 'Vegetarian Specials'",
  "title: 'ðŸ   Home Food'": "title: 'Home Food'",
  "title: 'ðŸŽ‰ Catering Services'": "title: 'Catering Services'",
  "title: 'ðŸ ± Food Subscription'": "title: 'Food Subscription'",
  "title: 'ðŸ ¨ Premium Dining'": "title: 'Premium Dining'",

  // Stay
  "title: 'ðŸ ¨ Hotels'": "title: 'Hotels'",
  "title: 'ðŸŒ´ Resorts'": "title: 'Resorts'",
  "title: 'ðŸ ¡ Homestays'": "title: 'Homestays'",
  "title: 'ðŸ ¢ Service Apartments'": "title: 'Service Apartments'",
  "title: 'ðŸ   Vacation Rentals'": "title: 'Vacation Rentals'",
  "title: 'ðŸ « Student Accommodation'": "title: 'Student Accommodation'",
  "title: 'ðŸ‘¨â€ ðŸ’¼ Corporate Stay'": "title: 'Corporate Stay'",
  "title: 'ðŸ • Camping & Adventure Stay'": "title: 'Camping & Adventure Stay'",
  "title: 'ðŸ ° Heritage Stay'": "title: 'Heritage Stay'",
  "title: 'â ¤ï¸  Couple & Honeymoon Stay'": "title: 'Couple & Honeymoon Stay'",
  "title: 'ðŸ‘¨â€ ðŸ’©â€ ðŸ’§â€ ðŸ’¦ Family Stay'": "title: 'Family Stay'",
  "title: 'ðŸ§˜ Wellness & Retreat Stay'": "title: 'Wellness & Retreat Stay'",

  // Travel
  "title: 'ðŸ   Bike Rental'": "title: 'Bike Rental'",
  "title: 'ðŸŒ  Tour Packages'": "title: 'Tour Packages'",
  "title: 'â ¤ï¸  Honeymoon Packages'": "title: 'Honeymoon Packages'",
  "title: 'ðŸ‘¨â€ ðŸ’©â€ ðŸ’§ Family Travel'": "title: 'Family Travel'",
  "title: 'ðŸ ¢ Corporate Travel'": "title: 'Corporate Travel'",
  "title: 'ðŸŽ’ Adventure Travel'": "title: 'Adventure Travel'",
  "title: 'ðŸ•Œ Religious & Pilgrimage Travel'": "title: 'Religious & Pilgrimage Travel'",
  "title: 'ðŸŒ´ Holiday Packages'": "title: 'Holiday Packages'",
  "title: 'ðŸš¢ Cruise Travel'": "title: 'Cruise Travel'",
  "title: 'ðŸ›‚ Visa Services'": "title: 'Visa Services'",
  "title: 'ðŸ›ƒ Passport Services'": "title: 'Passport Services'",
  "title: 'ðŸŒŽ International Travel'": "title: 'International Travel'",
  "title: 'ðŸ. Travel Essentials'": "title: 'Travel Essentials'",
  "title: 'ðŸ§³ Travel Essentials'": "title: 'Travel Essentials'",
  "title: 'ðŸš‘ Emergency Travel Assistance'": "title: 'Emergency Travel Assistance'",

  // Services
  "title: 'ðŸŽ“ Education Services'": "title: 'Education Services'",
  "title: 'ðŸ ¦ Financial Services'": "title: 'Financial Services'",
  "title: 'ðŸ›¡ Insurance Services'": "title: 'Insurance Services'",
  "title: 'ðŸ   Home Services'": "title: 'Home Services'",
  "title: 'ðŸ’» Digital Services'": "title: 'Digital Services'",
  "title: 'ðŸ ¢ Business Services'": "title: 'Business Services'",
  "title: 'ðŸš— Automobile Services'": "title: 'Automobile Services'",
  "title: 'ðŸ“± Bill & Recharge'": "title: 'Bill & Recharge'",
  "title: 'ðŸ‘¨â€ ðŸ’©â€ ðŸ’§ Family Services'": "title: 'Family Services'",
  "title: 'ðŸ ‹ Fitness & Wellness'": "title: 'Fitness & Wellness'",
};

let replacedCount = 0;
for (const [target, replacement] of Object.entries(replacements)) {
  if (content.includes(target)) {
    content = content.split(target).join(replacement);
    replacedCount++;
  }
}

// Write the file back as UTF-8
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully replaced ${replacedCount} mega menu title lines with clean English text.`);
